import { GoogleGenAI, Type } from "@google/genai";
import { CampaignData } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'imagen-4.0-generate-001';

export const generateCampaignContent = async (topic: string, audience: string, tone: string): Promise<CampaignData> => {
  const prompt = `
    Create a complete email marketing campaign for: ${topic}.
    Target Audience: ${audience}.
    Tone: ${tone}.
    
    Return a JSON object containing:
    1. A catchy email subject line.
    2. The full email body text (plain text with line breaks).
    3. A highly detailed image generation prompt that describes a visual to accompany this email.
  `;

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "The email subject line" },
            body: { type: Type.STRING, description: "The email body content" },
            imagePrompt: { type: Type.STRING, description: "A detailed prompt for an image generator" }
          },
          required: ["subject", "body", "imagePrompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CampaignData;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Error generating campaign text:", error);
    throw error;
  }
};

export const generateCampaignImage = async (imagePrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const chatWithBot = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    try {
        const chat = ai.chats.create({
            model: TEXT_MODEL,
            history: history,
            config: {
                systemInstruction: "You are a helpful, expert marketing assistant. You help users refine their email campaigns, suggest improvements for copy, and brainstorm ideas. Keep answers concise and professional."
            }
        });
        
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chat error:", error);
        throw error;
    }
}
