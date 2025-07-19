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
              text: `Given is a clothing item.
Please analyze it carefully and describe it in a concise, precise way.
Focus on:
- Type of clothing (e.g., shirt, pants, dress, etc.)
- Color of the clothing
- Any unique features or details
- Fabric type

Please also provide a short section on
- occassions where it can be worn
- what it can be paired with

Include any other relevant information.
But keep it short and concise. We dont wat user to read too much
high signal to noise ratio.
no need to be too verbose or too long or too much formatting.
`,
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
