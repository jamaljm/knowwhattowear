"use client";

import { useState } from "react";
import { processImage } from "./action";

export default function Test({}: {}) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant: string;
  } | null>(null);

  const showNotification = (
    title: string,
    description: string,
    variant: string = "default"
  ) => {
    setNotification({ title, description, variant });
    setTimeout(() => setNotification(null), 5000);
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

  const handleSubmit = async () => {
    if (!selectedImage) {
      showNotification(
        "No image selected",
        "Please select an image to analyze",
        "destructive"
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log(
        "Client: About to call processImage with file:",
        selectedImage.name
      );

      const formData = new FormData();
      formData.append("image", selectedImage);

      console.log("Client: FormData created, calling processImage...");
      const response = await processImage(formData);

      console.log("Client: Response received:", response);
      console.log("Client: Response type:", typeof response);
      console.log("Client: Response length:", response?.length);

      if (response === undefined || response === null) {
        console.error("Client: Response is undefined or null");
        showNotification(
          "Error",
          "No response received from server",
          "destructive"
        );
        return;
      }

      setAiResponse(response);
      console.log("Client: AI response set successfully");
    } catch (error) {
      console.error("Client: Error in handleSubmit:", error);
      showNotification(
        "Error",
        "Failed to analyze image. Please try again.",
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        AI Clothing Analyzer
      </h1>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 ${
            notification.variant === "destructive"
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
        >
          <h3 className="font-semibold">{notification.title}</h3>
          <p className="text-sm">{notification.description}</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              {imagePreview ? (
                <div className="relative w-full aspect-video">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">
                    Upload an image of clothing to analyze
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
              <label htmlFor="imageInput">
                <span className="inline-flex items-center px-4 py-2 mt-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                  Select Image
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedImage || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                "Analyze Clothing"
              )}
            </button>
          </div>
        </div>

        {aiResponse && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </main>
  );
}
