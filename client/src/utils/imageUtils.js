import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import { toast } from "react-toastify";

/**
 * Compresses and converts images (HEIC to JPG)
 * @param {Array<File>} files - Array of File objects
 * @returns {Promise<Array<File>>} - Array of processed File objects
 */
export const processImages = async (files) => {
  const processed = [];

  for (const file of files) {
    try {
      let imageFile = file;

      console.log(
        `Original: ${imageFile.size / 1024 / 1024} MB - ${imageFile.type}`
      );

      // Convert HEIC to JPEG
      if (
        imageFile.type === "image/heic" ||
        imageFile.name.toLowerCase().endsWith(".heic")
      ) {
        const convertedBlob = await heic2any({
          blob: imageFile,
          toType: "image/jpeg",
          quality: 0.8,
        });
        imageFile = new File(
          [convertedBlob],
          imageFile.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      }

      // Compress image
      const options = {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg",
      };

      const compressedFile = await imageCompression(imageFile, options);
      processed.push(compressedFile);

      console.log(
        `Compressed: ${compressedFile.size / 1024 / 1024} MB - ${
          compressedFile.type
        }`
      );
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error(`Failed to process: ${file.name}`);
    }
  }

  return processed;
};
