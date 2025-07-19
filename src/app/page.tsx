"use client"
import { processImage } from "@/components/process_image/action";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/magicui/blur-fade";
import { Upload, Camera, Sparkles, RefreshCw } from "lucide-react";

const Home = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setFileName(file.name);

    setLoading(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const analysis = await processImage(formData);
      setResult(analysis);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setResult(null);
    setImagePreview(null);
    setFileName("");
  };

  const renderAnalysisContent = () => {
    if (!result) return null;

    // Handle different possible response formats
    if (typeof result === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">{result}</p>
        </div>
      );
    }

    if (typeof result === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(result).map(([key, value], index) => (
            <BlurFade key={key} delay={index * 0.1}>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-gray-800 capitalize mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-2">
                    {value.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-white/70 text-gray-700 border border-gray-200">
                        {item}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{String(value)}</p>
                )}
              </div>
            </BlurFade>
          ))}
        </div>
      );
    }

    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <p className="text-gray-700 whitespace-pre-wrap">{String(result)}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BlurFade delay={0}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Know What To Wear
            </h1>
            <p className="text-gray-600 text-lg">
              Upload an image and let AI analyze the clothing items for you
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <BlurFade delay={0.2}>
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Choose an image to analyze clothing items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                      loading 
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={`w-8 h-8 mb-2 ${loading ? 'text-gray-400' : 'text-blue-500'}`} />
                      <p className={`text-sm ${loading ? 'text-gray-400' : 'text-blue-600'}`}>
                        {loading ? 'Processing...' : 'Click to upload or drag and drop'}
                      </p>
                    </div>
                  </label>
                </div>

                {imagePreview && (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600 truncate">{fileName}</p>
                    {!loading && result && (
                      <Button 
                        onClick={clearAnalysis} 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Analyze New Image
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </BlurFade>

          {/* Results Section */}
          <BlurFade delay={0.4}>
            <Card className="shadow-lg border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered clothing analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-600 font-medium">Analyzing your image...</p>
                      <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
                    </div>
                  </div>
                )}

                {!loading && !result && !imagePreview && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Camera className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-center">Upload an image to see the analysis results</p>
                  </div>
                )}

                {!loading && result && (
                  <BlurFade delay={0.6}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium text-sm">Analysis Complete</span>
                      </div>
                      {renderAnalysisContent()}
                    </div>
                  </BlurFade>
                )}
              </CardContent>
            </Card>
          </BlurFade>
        </div>

        {/* Additional Info */}
        {!loading && !result && !imagePreview && (
          <BlurFade delay={0.6}>
            <div className="mt-12 text-center">
              <Card className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Powered by AI Vision Technology</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </BlurFade>
        )}
      </div>
    </div>
  );
};

export default Home;