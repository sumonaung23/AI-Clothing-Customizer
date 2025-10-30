
import { GoogleGenAI, Modality } from "@google/genai";

// Ensure API_KEY is available in the environment
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Removes the background from a given image using the Gemini API.
 * @param base64Image The base64 encoded image string (without the data URL prefix).
 * @returns A promise that resolves to the base64 encoded string of the new image with a transparent background.
 */
export const removeBackground = async (base64Image: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  // Extract mimeType and data from the full data URL string
  const match = base64Image.match(/^data:(image\/(?:jpeg|png));base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 image format");
  }
  const mimeType = match[1];
  const imageData = match[2];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: "Remove the background from this image, leaving only the main subject. The background should be transparent.",
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageData,
            },
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const newMimeType = part.inlineData.mimeType;
        const newImageData = part.inlineData.data;
        return `data:${newMimeType};base64,${newImageData}`;
      }
    }
    
    throw new Error("No image data returned from API");

  } catch (error) {
    console.error("Error calling Gemini API for background removal:", error);
    throw new Error("Failed to process image with AI service.");
  }
};
