export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
  url: string;
}

export type Category = 'Tamil Nadu' | 'India' | 'World';
