"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            <span className="text-xl font-bold">KnowWhatToWear</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button className="text-black hover:bg-gray-100">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-black text-white hover:bg-gray-800">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Digital
            <br />
            <span className="bg-black text-white px-4 py-2 inline-block transform -rotate-1">
              Wardrobe
            </span>
            <br />
            Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your clothes, get AI-powered outfit recommendations, and
            never wonder what to wear again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3">
                Start Your Wardrobe
              </Button>
            </Link>
            <Button className="border-black text-black hover:bg-gray-100 px-8 py-3">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to master your style
            </h2>
            <p className="text-gray-600 text-lg">
              Powered by AI, designed for your lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                <CardTitle>Smart Wardrobe</CardTitle>
                <CardDescription>
                  Upload photos of your clothes and accessories. Our AI
                  automatically tags them by color, type, and fabric.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Get personalized outfit suggestions based on weather,
                  occasion, and your personal style preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg mb-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <CardTitle>Style Insights</CardTitle>
                <CardDescription>
                  Track what you wear, discover your style patterns, and get
                  insights to make better fashion choices.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-gray-600 text-lg">
              Three simple steps to transform your wardrobe
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-black text-white mb-4">Step 1</Badge>
                <h3 className="text-2xl font-bold mb-4">Upload Your Clothes</h3>
                <p className="text-gray-600 text-lg">
                  Take photos of your clothes and accessories. Our AI will
                  automatically identify colors, types, and fabrics to organize
                  your digital wardrobe.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-black text-white mb-4">Step 2</Badge>
                <h3 className="text-2xl font-bold mb-4">Get Recommendations</h3>
                <p className="text-gray-600 text-lg">
                  Tell us about your day - the weather, occasion, or mood. Our
                  AI will suggest the perfect outfit combinations from your
                  wardrobe.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-black text-white mb-4">Step 3</Badge>
                <h3 className="text-2xl font-bold mb-4">Look Amazing</h3>
                <p className="text-gray-600 text-lg">
                  Save your favorite outfits, track what you wear, and discover
                  new style combinations you never thought of before.
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to revolutionize your wardrobe?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of users who never have to wonder what to wear again.
          </p>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded-full"></div>
            <span className="font-bold">KnowWhatToWear</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-black">
              Privacy
            </a>
            <a href="#" className="hover:text-black">
              Terms
            </a>
            <a href="#" className="hover:text-black">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
