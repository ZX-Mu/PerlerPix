import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a base image for pixel art conversion using Gemini.
 * We ask for a flat, high-contrast image that is easy to pixelate.
 */
export const generatePatternImage = async (prompt: string): Promise<string> => {
  const client = getClient();
  
  // We use the image generation model
  const modelId = 'gemini-2.5-flash-image';

  const enhancedPrompt = `
    Create a simple, flat, 2D vector-style illustration of ${prompt}. 
    It should be suitable for converting into pixel art or perler bead patterns.
    Solid colors, high contrast, white background. 
    No shading, no gradients, no complex details. 
    Centered composition.
  `;

  try {
    const response = await client.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
    });

    // Extract image from response
    // Gemini 2.5 Flash Image returns candidates with inlineData
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    
    if (part && part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
    
    throw new Error("No image data generated.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};