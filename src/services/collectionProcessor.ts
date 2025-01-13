import fs from 'fs';
import path from 'path';
import { GeminiService } from './gemini';
import { CardCollection, Card } from '../types/card';

export class CollectionProcessor {
  private geminiService: GeminiService;

  constructor(apiKey: string) {
    this.geminiService = new GeminiService(apiKey);
  }

  private async processFile(filePath: string): Promise<CardCollection> {
    const imageData = fs.readFileSync(filePath);
    const imageBase64 = imageData.toString('base64');
    return await this.geminiService.processImage(imageBase64);
  }

  async processDirectory(directoryPath: string): Promise<CardCollection> {
    const files = fs.readdirSync(directoryPath)
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      .map(file => path.join(directoryPath, file));

    const totalFiles = files.length;
    console.log(`Found ${totalFiles} image files to process`);

    const allCards: CardCollection = { cards: [] };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i + 1}/${totalFiles}: ${path.basename(file)}`);

      try {
        const result = await this.processFile(file);
        allCards.cards.push(...result.cards);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    return allCards;
  }

  private generateLanguageFiles(cards: Card[], outputPath: string, timestamp: string): void {
    // Group cards by language and count occurrences
    const cardsByLanguage: Record<string, Map<string, number>> = {
      en: new Map<string, number>(),
      pt: new Map<string, number>()
    };

    // Count occurrences of each card
    cards.forEach(card => {
      const currentCount = cardsByLanguage[card.language].get(card.name) || 0;
      cardsByLanguage[card.language].set(card.name, currentCount + 1);
    });

    // Generate files for each language
    Object.entries(cardsByLanguage).forEach(([language, cardCounts]) => {
      const fileName = `cards_${language}_${timestamp}.txt`;
      const fullPath = path.join(outputPath, fileName);

      // Convert to array, sort by name, and format with quantities
      const content = Array.from(cardCounts.entries())
        .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
        .map(([name, count]) => `${count}x ${name}`)
        .join('\n');

      fs.writeFileSync(fullPath, content);
      console.log(`${language.toUpperCase()} cards list saved to ${fullPath}`);
    });
  }

  saveResults(cards: CardCollection, outputPath: string): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save JSON file
    const jsonFileName = `cards_${timestamp}.json`;
    const jsonFullPath = path.join(outputPath, jsonFileName);
    fs.writeFileSync(jsonFullPath, JSON.stringify(cards, null, 2));
    console.log(`Full results saved to ${jsonFullPath}`);

    // Generate language-specific text files
    this.generateLanguageFiles(cards.cards, outputPath, timestamp);
  }
} 
