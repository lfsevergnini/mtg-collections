import { GoogleGenerativeAI } from '@google/generative-ai';
import { CardCollection } from '../types/card';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: `You're a MTG specialist that can detect card names and their language from photos. 
        Always respond with valid JSON following this schema:
        {
          "cards": [
            {
              "name": "card name",
              "language": "en" or "pt"
            }
          ]
        }`,
    });
  }

  async processImage(imageBase64: string): Promise<CardCollection> {
    const prompt = `Given this photo of MTG cards, return a JSON object containing an array of cards with their names and languages (en for English, pt for Portuguese).
      Include all occurrences of duplicate cards.
      Make sure the response is valid JSON that can be parsed.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let rawResponse = response.text();

    // Remove markdown code blocks if present
    if (rawResponse.startsWith('```json')) {
      rawResponse = rawResponse.replace(/```json\n/, '').replace(/\n```$/, '');
    }

    return JSON.parse(rawResponse);
  }
} 
