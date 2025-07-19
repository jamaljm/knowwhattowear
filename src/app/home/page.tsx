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
import { processImage } from "@/components/process_image/action";
import { searchWardrobe } from "@/components/wardrobe_search/action";
import ReactMarkdown from "react-markdown";

interface WardrobeItem {
  id: string;
  user_id: string;
  description: string;
  image_url: string;
  created_at: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "wardrobe" | "upload" | "profile"
  >("wardrobe");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [editDescription, setEditDescription] = useState("");

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


  const handleUpload = async () => {
    console.log("Upload started, selectedImage:", selectedImage);
    console.log("userData:", userData);
    
    if (!selectedImage || !userData?.id) {
      console.log("Missing selectedImage or userData.id");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload image to Supabase storage
      console.log("Starting image upload to Supabase...");
      setUploadProgress(25);
      const imageUrl = await uploadToSupabase(
        selectedImage,
        "wardrobe-images",
        userData.id
      );
      console.log("Image uploaded successfully:", imageUrl);

      // Analyze with AI
      console.log("Starting AI analysis...");
      setUploadProgress(50);
      
      // Create FormData with the selected image file
      const formData = new FormData();
      formData.append("image", selectedImage);
      
      // Process image with AI
      const aiDescription = await processImage(formData);
      console.log("AI analysis completed:", aiDescription);
      
      const analysis = {
        description: aiDescription,
      };

      // Save to database
      console.log("Saving to database...");
      setUploadProgress(75);
      const { data, error } = await supabase
        .from("wardrobe_items")
        .insert([
          {
            user_id: userData.id,
            image_url: imageUrl,
            description: analysis.description,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Database insert successful:", data);
      setUploadProgress(100);
      setWardrobeItems((prev) => [data, ...prev]);
      setSelectedImage(null);
      setImagePreview(null);
      setActiveTab("wardrobe");
      console.log("Upload process completed successfully");
    } catch (error) {
      console.error("Error uploading item:", error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleWardrobeSearch = async () => {
    if (!searchQuery.trim() || !userData?.id) return;

    setIsLoading(true);
    try {
      console.log("Starting wardrobe search...");
      const result = await searchWardrobe(searchQuery, wardrobeItems);
      setSearchResult(result);
      console.log("Search completed:", result);
    } catch (error) {
      console.error("Error searching wardrobe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = (item: WardrobeItem) => {
    setEditingItem(item);
    setEditDescription(item.description);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !userData?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .update({
          description: editDescription,
        })
        .eq("id", editingItem.id)
        .select()
        .single();

      if (error) throw error;

      setWardrobeItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? data : item))
      );
      setEditingItem(null);
      setEditDescription("");
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (item: WardrobeItem) => {
    if (!userData?.id) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete this item?`);
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setWardrobeItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
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

            {/* AI Search */}
            {wardrobeItems.length > 0 && (
              <div className="mb-6">
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-black mb-3">
                      Ask AI about your wardrobe
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., 'What should I wear for a date?', 'Show me casual outfits', 'What goes with my blue shirt?'"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleWardrobeSearch();
                          }
                        }}
                      />
                      <Button
                        onClick={handleWardrobeSearch}
                        disabled={!searchQuery.trim() || isLoading}
                        className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {isLoading ? "Searching..." : "Search"}
                      </Button>
                    </div>
                    
                    {searchResult && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-black mb-2">AI Suggestions:</h4>
                        <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>{searchResult}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

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
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-700 mb-2 prose prose-sm max-w-none">
                        <ReactMarkdown>{item.description}</ReactMarkdown>
                      </div>
                      <p className="text-xs text-gray-500">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                  <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="Describe the item, colors, style, occasions, etc."
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => setEditingItem(null)}
                        className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateItem}
                        disabled={isLoading}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
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
                      <Button 
                        className="mt-4 bg-black text-white hover:bg-gray-800"
                        onClick={() => document.getElementById('imageInput')?.click()}
                        type="button"
                      >
                        Choose File
                      </Button>
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
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black">
                        {wardrobeItems.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Items</div>
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
