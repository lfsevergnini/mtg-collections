import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

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

  const prompt = `Given this photo of MTG cards, return a JSON object containing an array of cards with their names and languages (en for English, pt for Portuguese).
    Include all occurrences of duplicate cards.
    Make sure the response is valid JSON that can be parsed.`;

  // Read the image file
  // const imagePath = path.join(__dirname, 'path/to/your/image.jpg'); // Update this path
  const imagePath = '/Users/lfsevergnini/mtg-collection-images/photos/IMG_3616.jpg';
  const imageData = fs.readFileSync(imagePath);
  
  // Convert the image to base64
  const imageBase64 = imageData.toString('base64');

  // Create the image part for the model
  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: 'image/jpeg', // Update this based on your image type
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    // Parse and validate the JSON response
    try {
      let rawResponse = response.text();

      // Remove markdown code blocks if present
      if (rawResponse.startsWith('```json')) {
        rawResponse = rawResponse.replace(/```json\n/, '').replace(/\n```$/, '');
      }

      const jsonResponse = JSON.parse(rawResponse);
      console.log('Parsed cards:', JSON.stringify(jsonResponse, null, 2));
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response:', response.text());
    }
  } catch (error) {
    console.error('Error generating content:', error);
  }
}

main();
