#!/usr/bin/env node

import dotenv from 'dotenv';
import { CollectionProcessor } from '../services/collectionProcessor';
import path from 'path';

// Load environment variables
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY!;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

async function main() {
  const inputDir = process.argv[2];

  if (!inputDir) {
    console.error('Error: Please provide an input directory');
    console.log('Usage: parse-collection <input-directory>');
    process.exit(1);
  }

  const absoluteInputDir = path.resolve(inputDir);
  const processor = new CollectionProcessor(apiKey);

  try {
    const cards = await processor.processDirectory(absoluteInputDir);
    processor.saveResults(cards, process.cwd());
  } catch (error) {
    console.error('Error processing collection:', error);
    process.exit(1);
  }
}

main();
