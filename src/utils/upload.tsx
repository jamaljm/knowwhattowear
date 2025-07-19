import { supabase } from "./supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file to Supabase storage and returns the public URL
 * @param file - The file to upload
 * @param bucketName - The name of the storage bucket (default: "wardrobe-images")
 * @param folderPath - Optional folder path within the bucket
 * @returns The public URL of the uploaded file
 */
export async function uploadToSupabase(
  file: File,
  bucketName: string = "wardrobe-images",
  folderPath?: string
): Promise<string> {
  try {
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split(".").pop();
    const fileName = `${
      folderPath ? `${folderPath}/` : ""
    }${uuidv4()}.${fileExt}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    throw error;
  }
}
