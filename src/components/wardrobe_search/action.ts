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
    const wardrobeContext = wardrobeItems.map((item) => 
      `<item id="${item.id}">${item.description}</item>`
    ).join('\n');

    console.log("About to call generateText for wardrobe search...");

    const result = await generateText({
      model: openai("gpt-4.1"),
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

IMPORTANT: When referencing specific items, use XML tags with the item ID like this: <recommended-item id="item-id-here">description of how to use it</recommended-item>

Format your response like this:
<response>
<suggestions>
Your styling suggestions here...
</suggestions>

<recommended-items>
<recommended-item id="item-id-1">How to use this item...</recommended-item>
<recommended-item id="item-id-2">How to use this item...</recommended-item>
</recommended-items>

<missing-items>
Items they might want to add to complete the look...
</missing-items>
</response>

Keep your response concise but helpful.`
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