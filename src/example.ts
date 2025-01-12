import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

// Access your API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `You're a MTG specialist and can detect the name of cards and its collection set from a photo.`,
  });

  const prompt = 'Given this photo of a list of cards, return the names of the cards only.';

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Gemini AI Response:');
    console.log(response.text());
  } catch (error) {
    console.error('Error generating content:', error);
  }
}

main();
