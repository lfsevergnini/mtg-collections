#!/usr/bin/env node

import axios from 'axios';
import * as fs from 'fs';
import * as readline from 'readline';

interface ScryfallCard {
  name: string;
  lang: string;
}

interface ScryfallError {
  status: number;
  details: string;
}

async function translateCard(cardName: string): Promise<string> {
  try {
    const response = await axios.get('https://api.scryfall.com/cards/named', {
      params: {
        fuzzy: cardName
      },
      headers: {
        'User-Agent': 'MTGCollections/1.0',
        'Accept': 'application/json'
      }
    });

    const card: ScryfallCard = response.data;
    return card.name;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return `Card not found: ${cardName}`;
    }
    throw error;
  }
}

async function processFile(filePath: string) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    
    // Extract quantity and card name
    const match = line.match(/^(\d+x\s*)?(.+)$/);
    if (!match) continue;

    const [, quantity = '', cardName] = match;
    const englishName = await translateCard(cardName.trim());
    console.log(`${quantity}${cardName} -> ${quantity}${englishName}`);

    // Add a small delay to respect Scryfall's rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Please provide either a file path or card names');
    console.log('Usage:');
    console.log('  translate-cards <file-path>');
    console.log('  translate-cards <card-name-1> [card-name-2] ...');
    process.exit(1);
  }

  try {
    // Check if the first argument is a file
    if (fs.existsSync(args[0])) {
      await processFile(args[0]);
    } else {
      // Process individual card names
      for (const cardName of args) {
        const englishName = await translateCard(cardName);
        console.log(`${cardName} -> ${englishName}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
