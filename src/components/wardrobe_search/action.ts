"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

interface WardrobeItem {
  id: string;
  description: string;
  image_url: string;
}

export async function searchWardrobe(userQuery: string, wardrobeItems: WardrobeItem[]) {
  try {
    console.log("searchWardrobe called with query:", userQuery);
    console.log("Number of wardrobe items:", wardrobeItems.length);

    if (!userQuery.trim()) {
      throw new Error("No search query provided");
    }

    if (wardrobeItems.length === 0) {
      throw new Error("No wardrobe items to search");
    }

    // Format wardrobe items for AI
    const wardrobeContext = wardrobeItems.map((item, index) => 
      `Item ${index + 1}: ${item.description}`
    ).join('\n\n');

    console.log("About to call generateText for wardrobe search...");

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: `You are a personal stylist AI assistant. Here is the user's wardrobe:

${wardrobeContext}

User's request: "${userQuery}"

Based on the user's wardrobe items above, provide helpful suggestions. You can:
1. Recommend specific items from their wardrobe that match their request
2. Suggest outfit combinations using their existing items
3. Point out what they might be missing for their desired look
4. Give styling tips for their existing pieces

Please reference items by their numbers (e.g., "Item 1", "Item 2") and be specific about how to use them. Keep your response concise but helpful.

If no items match their request well, suggest alternatives from what they have or mention what type of item they might want to add to their wardrobe.`
        }
      ]
    });

    const textResult = String(result.text);
    console.log("Search result:", textResult);
    return textResult;
  } catch (error) {
    console.error("Error in searchWardrobe:", error);
    throw error;
  }
}