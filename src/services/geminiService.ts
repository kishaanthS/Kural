import { GoogleGenAI } from "@google/genai";

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

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  allowInsecureBrowserUsage: true
});

// Simple in-memory cache to store results for 5 minutes
const cache = new Map<string, { data: NewsArticle[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: NewsArticle[]) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const sanitizeUrl = (url: any): string => {
  if (!url || typeof url !== 'string') return '';
  let s = url.trim();
  
  // Remove common LLM artifacts
  s = s.replace(/[.,;!"\s]+$/, '');
  
  // If the LLM included ellipses, the URL is likely broken/truncated
  if (s.includes('...') || s.includes('…')) return '';

  if (!s.startsWith('http')) s = `https://${s}`;
  
  try {
    const parsed = new URL(s);
    if (!parsed.hostname.includes('.') || parsed.hostname.length < 4) return '';
    // Filter out obvious placeholders
    if (parsed.hostname === 'example.com' || parsed.hostname.includes('link-to')) return '';
    return s;
  } catch {
    return '';
  }
};

export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  const cached = getCachedData(category);
  if (cached) return cached;

  const categoriesMap: Record<string, string> = {
    'Tamil Nadu': 'top news Tamil Nadu Chennai breaking TODAY',
    'India': 'India national breaking news headlines TODAY',
    'World': 'top international world news breaking TODAY'
  };

  const searchQuery = categoriesMap[category] || category;
  
  const prompt = `Find 12-15 REAL news articles published in the last 24h for: ${searchQuery}.
  Return ONLY a JSON array: [{"title":string, "summary":string, "source":string, "publishedAt":string, "url":string, "imageUrl":string}]
  
  RULES:
  - COMPLETE canoncial URLs only.
  - NO ellipses in URLs.
  - Trusted sources only (The Hindu, NDTV, Reuters).
  
  Query: ${searchQuery}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      tools: [{ googleSearch: {} }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    let articles = JSON.parse(text);
    
    if (!Array.isArray(articles)) return [];

    const results = articles.map((a: any, index: number) => ({
      ...a,
      url: sanitizeUrl(a.url),
      id: `${category.replace(/\s+/g, '')}-${index}-${Date.now()}`,
      category
    })).filter((a: any) => a.url !== '' && a.title && a.title.length > 10);

    if (results.length > 0) setCachedData(category, results);
    return results;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  const cached = getCachedData(`search-${query}`);
  if (cached) return cached;

  const prompt = `Search for: '${query}'. 12-15 recent news stories. 
  JSON array: [{"title":string, "summary":string, "source":string, "publishedAt":string, "url":string, "imageUrl":string}]
  URLs must be FULL and REAL.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      tools: [{ googleSearch: {} }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    const articles = JSON.parse(text);
    
    if (!Array.isArray(articles)) return [];

    const results = articles.map((a: any, index: number) => ({
      ...a,
      url: sanitizeUrl(a.url),
      id: `search-${index}-${Date.now()}`,
      category: 'Search Result'
    })).filter((a: any) => a.url !== '' && a.title);

    if (results.length > 0) setCachedData(`search-${query}`, results);
    return results;
  } catch (error) {
    console.error("Error searching news:", error);
    return [];
  }
}
