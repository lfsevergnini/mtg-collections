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
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = 'Write a haiku about Magic: The Gathering.';

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
