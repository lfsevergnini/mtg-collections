export interface Card {
  name: string;
  language: 'en' | 'pt';
}

export interface CardCollection {
  cards: Card[];
} 
