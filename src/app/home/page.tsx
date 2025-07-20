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
import { parseSearchResponse, type ParsedSearchResponse } from "@/utils/parseSearchResponse";
import { extractItemSummary } from "@/utils/formatItemDescription";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

interface WardrobeItem {
  id: string;
  user_id: string;
  description: string;
  image_url: string;
  created_at: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "wardrobe" | "profile"
  >("wardrobe");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<ParsedSearchResponse | null>(null);
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
      const rawResult = await searchWardrobe(searchQuery, wardrobeItems);
      const parsedResult = parseSearchResponse(rawResult, wardrobeItems);
      setSearchResult(parsedResult);
      console.log("Search completed:", parsedResult);
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-semibold text-gray-900">KnowWhatToWear</span>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userData?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gray-700 text-white text-sm">
                  {userData?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="bg-gray-900 text-white border-gray-900 hover:bg-gray-800 rounded-full px-6"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-6">
            {/* Logo */}
            <div className="mb-8 text-center">
              <Image 
                src="/logo.png" 
                alt="KnowWhatToWear" 
                width={120} 
                height={120}
                className="mx-auto mb-4"
              />
            </div>
            
            <nav className="space-y-2">
              {[
                { id: "wardrobe", label: "My Closet" },
                { id: "profile", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50">
          <div className="p-8">

              {/* Wardrobe Tab */}
              {activeTab === "wardrobe" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center bg-white rounded-xl p-8 shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                      Search Your Closet
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">
                      {wardrobeItems.length} items in your collection
                    </p>
                    
                    {/* Search Bar */}
                    {wardrobeItems.length > 0 && (
                      <div className="max-w-lg mx-auto">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ask about your wardrobe..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleWardrobeSearch();
                              }
                            }}
                          />
                          <Button
                            onClick={handleWardrobeSearch}
                            disabled={!searchQuery.trim() || isLoading}
                            className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 rounded-lg px-6 py-3 h-12"
                          >
                            {isLoading ? "Searching..." : "Search"}
                          </Button>
                        </div>
                        
                        {searchResult && (
                          <div className="mt-4 space-y-4">
                            {/* Suggestions */}
                            {searchResult.suggestions && (
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Styling Suggestions</h4>
                                <div className="text-gray-800 prose prose-sm max-w-none">
                                  <ReactMarkdown>{searchResult.suggestions}</ReactMarkdown>
                                </div>
                              </div>
                            )}

                            {/* Recommended Items */}
                            {searchResult.recommendedItems.length > 0 && (
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">Recommended Items from Your Closet</h4>
                                <div className="grid gap-3">
                                  {searchResult.recommendedItems.map((rec, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                      {rec.item ? (
                                        <>
                                          <Image
                                            src={rec.item.image_url}
                                            alt={rec.item.description}
                                            width={80}
                                            height={80}
                                            className="rounded-lg object-cover flex-shrink-0"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-semibold text-gray-900 text-base mb-2">
                                              {extractItemSummary(rec.item.description)}
                                            </h5>
                                            <p className="text-gray-600 text-sm leading-relaxed">{rec.usage}</p>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex-1">
                                          <p className="text-gray-600 text-sm">Item not found (ID: {rec.id})</p>
                                          <p className="text-gray-600 text-sm mt-1">{rec.usage}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Items */}
                            {searchResult.missingItems && (
                              <div className="p-4 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">Items to Consider Adding</h4>
                                <div className="text-left text-gray-700 leading-relaxed prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:pl-4 [&>li]:mb-1">
                                  <ReactMarkdown 
                                    components={{
                                      p: ({ children }) => <p className="mb-2 text-sm">{children}</p>,
                                      ul: ({ children }) => <ul className="mb-2 pl-4 space-y-1">{children}</ul>,
                                      li: ({ children }) => <li className="text-sm list-disc">{children}</li>
                                    }}
                                  >
                                    {searchResult.missingItems}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Closet Grid */}
                  {wardrobeItems.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 shadow-sm text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        Your closet is empty
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Start building your digital wardrobe by adding some clothes
                      </p>
                      <Button
                        onClick={() => document.getElementById('imageInput')?.click()}
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-8 py-3"
                      >
                        Add Your First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-gray-900">Closet</h2>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-500">{wardrobeItems.length} items</div>
                          <Button
                            onClick={() => document.getElementById('imageInput')?.click()}
                            className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 text-sm"
                          >
                            Add Item
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {wardrobeItems.map((item) => (
                          <div
                            key={item.id}
                            className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                          >
                            <div className="relative aspect-square">
                              <img
                                src={item.image_url}
                                alt="Wardrobe item"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
                                >
                                  <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
                                >
                                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <div className="p-2">
                              <div className="text-xs text-gray-600 line-clamp-2">
                                <ReactMarkdown>{item.description}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageInput"
                  />

                  {/* Upload Modal */}
                  {(selectedImage || imagePreview) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
                        <div className="space-y-4">
                          {imagePreview && (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  setSelectedImage(null);
                                  setImagePreview(null);
                                }}
                                className="absolute top-2 right-2 p-1 bg-black text-white rounded-full hover:bg-gray-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}

                          {isLoading && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Processing...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <Progress value={uploadProgress} className="w-full" />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpload}
                              disabled={!selectedImage || isLoading}
                              className="flex-1 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isLoading ? "Processing..." : "Add to Closet"}
                            </Button>
                          </div>
                        </div>
                      </div>
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


        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-500">
                Manage your account and preferences
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={userData?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gray-700 text-white text-lg">
                      {userData?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{userData?.email}</h3>
                    <p className="text-sm text-gray-500">
                      Member since{" "}
                      {new Date(
                        userData?.created_at || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Wardrobe Stats</h2>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-semibold text-gray-900">
                    {wardrobeItems.length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Total Items</div>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
