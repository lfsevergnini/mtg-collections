#!/usr/bin/env node

import axios from 'axios';

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

async function main() {
  const cardNames = process.argv.slice(2);

  if (cardNames.length === 0) {
    console.error('Error: Please provide at least one card name');
    console.log('Usage: translate-cards <card-name-1> [card-name-2] ...');
    process.exit(1);
  }

  try {
    for (const cardName of cardNames) {
      const englishName = await translateCard(cardName);
      console.log(`${cardName} -> ${englishName}`);
      // Add a small delay to respect Scryfall's rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Error translating cards:', error);
    process.exit(1);
  }
}

main();
