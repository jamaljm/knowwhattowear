"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { CommonContext } from "@/Common_context";
import { useContext } from "react";
import { uploadToSupabase } from "@/utils/upload";

interface WardrobeItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  clothing_type: string;
  primary_color: string;
  secondary_colors: string[];
  fabric_type: string;
  brand: string;
  size: string;
  occasions: string[];
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

interface OutfitRecommendation {
  id: string;
  outfit_name: string;
  description: string;
  weather_condition: string;
  temperature_range: string;
  items: WardrobeItem[];
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "wardrobe" | "upload" | "recommendations" | "profile"
  >("wardrobe");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recommendations, setRecommendations] = useState<
    OutfitRecommendation[]
  >([]);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [selectedWeather, setSelectedWeather] = useState("");

  const { userData, logout } = useContext(CommonContext);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Load wardrobe items
  useEffect(() => {
    if (userData?.id) {
      loadWardrobeItems();
    }
  }, [userData]);

  const loadWardrobeItems = async () => {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWardrobeItems(data || []);
    } catch (error) {
      console.error("Error loading wardrobe items:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeClothing = async (imageUrl: string) => {
    // This would typically call your AI service
    // For now, return mock analysis
    return {
      name: "Clothing Item",
      description: "AI-analyzed clothing item",
      clothing_type: "top",
      primary_color: "black",
      secondary_colors: [],
      fabric_type: "cotton",
      occasions: ["casual"],
      tags: ["comfortable", "everyday"],
    };
  };

  const handleUpload = async () => {
    if (!selectedImage || !userData?.id) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload image to Supabase storage
      setUploadProgress(25);
      const imageUrl = await uploadToSupabase(
        selectedImage,
        "wardrobe-images",
        userData.id
      );

      // Analyze with AI
      setUploadProgress(50);
      const analysis = await analyzeClothing(imageUrl);

      // Save to database
      setUploadProgress(75);
      const { data, error } = await supabase
        .from("wardrobe_items")
        .insert([
          {
            user_id: userData.id,
            image_url: imageUrl,
            ...analysis,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      setWardrobeItems((prev) => [data, ...prev]);
      setSelectedImage(null);
      setImagePreview(null);
      setActiveTab("wardrobe");
    } catch (error) {
      console.error("Error uploading item:", error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const generateRecommendations = async () => {
    if (!userData?.id || !selectedOccasion || !selectedWeather) return;

    setIsLoading(true);
    try {
      // This would typically call your AI recommendation service
      // For now, return mock recommendations
      const mockRecommendations = [
        {
          id: "1",
          outfit_name: "Smart Casual Look",
          description: "Perfect for the office or casual meeting",
          weather_condition: selectedWeather,
          temperature_range: "mild",
          items: wardrobeItems.slice(0, 3),
        },
        {
          id: "2",
          outfit_name: "Weekend Comfort",
          description: "Relaxed and comfortable for weekend activities",
          weather_condition: selectedWeather,
          temperature_range: "mild",
          items: wardrobeItems.slice(1, 4),
        },
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (itemId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("wardrobe_items")
        .update({ is_favorite: !currentFavorite })
        .eq("id", itemId);

      if (error) throw error;

      setWardrobeItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_favorite: !currentFavorite } : item
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full"></div>
              <span className="text-xl font-bold">KnowWhatToWear</span>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={userData?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-black text-white">
                  {userData?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button onClick={logout}>Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {[
            { id: "wardrobe", label: "My Wardrobe" },
            { id: "upload", label: "Add Items" },
            { id: "recommendations", label: "Get Outfits" },
            { id: "profile", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wardrobe Tab */}
        {activeTab === "wardrobe" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">
                My Wardrobe
              </h1>
              <p className="text-gray-600">
                {wardrobeItems.length} items in your collection
              </p>
            </div>

            {wardrobeItems.length === 0 ? (
              <Card className="border border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    No items yet
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Start building your digital wardrobe by adding your first
                    clothing item.
                  </p>
                  <Button
                    onClick={() => setActiveTab("upload")}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    Add Your First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wardrobeItems.map((item) => (
                  <Card
                    key={item.id}
                    className="border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <button
                        onClick={() =>
                          toggleFavorite(item.id, item.is_favorite)
                        }
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md"
                      >
                        <svg
                          className={`w-5 h-5 ${
                            item.is_favorite
                              ? "text-red-500 fill-current"
                              : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-black mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge className="text-xs">{item.clothing_type}</Badge>
                        <Badge className="text-xs">{item.primary_color}</Badge>
                        {item.brand && (
                          <Badge className="text-xs">{item.brand}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">
                Add New Item
              </h1>
              <p className="text-gray-600">
                Upload photos of your clothes for AI-powered tagging
              </p>
            </div>

            <Card className="border border-gray-200 max-w-2xl">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative w-full max-w-sm">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="rounded-lg object-contain w-full h-64"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-black text-white rounded-full hover:bg-gray-800"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16"
                          />
                        </svg>
                        <p className="text-gray-500 mb-2">
                          Drag and drop or click to upload
                        </p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="imageInput"
                    />
                    {!imagePreview && (
                      <label htmlFor="imageInput">
                        <Button className="mt-4 bg-black text-white hover:bg-gray-800">
                          Choose File
                        </Button>
                      </label>
                    )}
                  </div>

                  {isLoading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={!selectedImage || isLoading}
                    className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Add to Wardrobe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">
                Outfit Recommendations
              </h1>
              <p className="text-gray-600">
                Get AI-powered outfit suggestions for any occasion
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Filters */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Tell us about your day</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occasion
                      </label>
                      <select
                        value={selectedOccasion}
                        onChange={(e) => setSelectedOccasion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select occasion</option>
                        <option value="work">Work</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                        <option value="party">Party</option>
                        <option value="sports">Sports</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weather
                      </label>
                      <select
                        value={selectedWeather}
                        onChange={(e) => setSelectedWeather(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select weather</option>
                        <option value="sunny">Sunny</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="rainy">Rainy</option>
                        <option value="snowy">Snowy</option>
                        <option value="windy">Windy</option>
                      </select>
                    </div>

                    <Button
                      onClick={generateRecommendations}
                      disabled={
                        !selectedOccasion || !selectedWeather || isLoading
                      }
                      className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isLoading ? "Generating..." : "Get Recommendations"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <div className="lg:col-span-2">
                {recommendations.length === 0 ? (
                  <Card className="border border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        No recommendations yet
                      </h3>
                      <p className="text-gray-600 text-center">
                        Select an occasion and weather to get personalized
                        outfit recommendations.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {recommendations.map((outfit) => (
                      <Card key={outfit.id} className="border border-gray-200">
                        <CardHeader>
                          <CardTitle>{outfit.outfit_name}</CardTitle>
                          <CardDescription>
                            {outfit.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            {outfit.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="text-center">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-24 object-cover rounded-lg mb-2"
                                />
                                <p className="text-xs text-gray-600">
                                  {item.name}
                                </p>
                              </div>
                            ))}
                          </div>
                          <Button
                            className="w-full mt-4 bg-black text-white hover:bg-gray-800"
                            onClick={() => {
                              // Save outfit logic would go here
                              console.log("Save outfit:", outfit.id);
                            }}
                          >
                            Save This Outfit
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your account and preferences
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={userData?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-black text-white text-lg">
                        {userData?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{userData?.email}</h3>
                      <p className="text-sm text-gray-600">
                        Member since{" "}
                        {new Date(
                          userData?.created_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Wardrobe Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black">
                        {wardrobeItems.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Items</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black">
                        {
                          wardrobeItems.filter((item) => item.is_favorite)
                            .length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Favorites</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
