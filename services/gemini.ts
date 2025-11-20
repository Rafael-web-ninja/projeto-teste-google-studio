import { GoogleGenAI, Type } from "@google/genai";
import { CampaignData } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'imagen-4.0-generate-001';

export const generateCampaignContent = async (topic: string, audience: string, tone: string): Promise<CampaignData> => {
  const prompt = `
    Atue como um especialista em marketing digital. Crie uma campanha de email marketing completa para: ${topic}.
    Público Alvo: ${audience}.
    Tom de voz: ${tone}.
    
    Retorne um objeto JSON contendo:
    1. Uma linha de assunto cativante (em Português do Brasil).
    2. O texto completo do corpo do email (em Português do Brasil, texto simples com quebras de linha).
    3. Um prompt de geração de imagem altamente detalhado que descreva um visual para acompanhar este email (IMPORTANTE: O PROMPT DA IMAGEM DEVE SER EM INGLÊS para melhor qualidade).
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
            subject: { type: Type.STRING, description: "A linha de assunto do email em Português" },
            body: { type: Type.STRING, description: "O conteúdo do corpo do email em Português" },
            imagePrompt: { type: Type.STRING, description: "Um prompt detalhado para gerador de imagem em INGLÊS" }
          },
          required: ["subject", "body", "imagePrompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CampaignData;
    }
    throw new Error("Nenhum conteúdo gerado");
  } catch (error) {
    console.error("Erro ao gerar texto da campanha:", error);
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
    throw new Error("Nenhuma imagem gerada");
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    throw error;
  }
};

export const chatWithBot = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    try {
        const chat = ai.chats.create({
            model: TEXT_MODEL,
            history: history,
            config: {
                systemInstruction: "Você é um assistente de marketing útil e especialista. Você ajuda os usuários a refinar suas campanhas de e-mail, sugere melhorias para o texto e faz brainstorming de ideias. Mantenha as respostas concisas, profissionais e sempre responda em Português do Brasil."
            }
        });
        
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Erro no chat:", error);
        throw error;
    }
}