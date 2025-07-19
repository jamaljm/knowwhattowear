"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function processImage(formData: FormData) {
  try {
    console.log("processImage");
    const image = formData.get("image") as File;

    if (!image) {
      throw new Error("No image provided");
    }

    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    console.log("About to call generateText...");

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and describe what clothing items you see in a natural, conversational way. Focus on the main clothing pieces, their colors, and any notable style details. Keep it concise and readable.",
            },
            {
              type: "image",
              image: `data:${image.type};base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    // Ensure we return only a plain string (not the complex result object)
    const textResult = String(result.text);
    console.log("textResult", textResult);
    return "textResult";
  } catch (error) {
    console.error("Error in processImage:", error);
    throw error;
  }
}
