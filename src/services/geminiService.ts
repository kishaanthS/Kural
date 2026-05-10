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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
  const categoriesMap: Record<string, string> = {
    'Tamil Nadu': 'Tamil Nadu breaking news Chennai Coimbatore Madurai',
    'India': 'India national news breaking today New Delhi',
    'World': 'International world news breaking current events'
  };

  const searchQuery = categoriesMap[category] || category;
  
  const prompt = `Act as a senior investigative news curator for 'KURAL'. 
  Use the Google Search tool to find 15-20 CURRENT news articles published in the last 24-48 hours for: ${searchQuery}.
  
  Return ONLY a JSON array of objects with: title, summary, source, publishedAt, url, imageUrl.
  
  CRITICAL URL INTEGRITY RULE:
  - YOU MUST provide the EXACT and COMPLETE canonical URL found in search results.
  - NEVER truncate a URL with ellipses (...).
  - NEVER hallucinate a URL based on the headline.
  - If you cannot find a direct link to the full article, skip that article.
  
  Preferred Sources: The Hindu, NDTV, Reuters, BBC, The Indian Express.
  
  Query: ${searchQuery}
  Current Date: ${new Date().toLocaleDateString()}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "[]";
    let articles = JSON.parse(text);
    
    if (!Array.isArray(articles)) return [];

    return articles.map((a: any, index: number) => ({
      ...a,
      url: sanitizeUrl(a.url),
      id: `${category.replace(/\s+/g, '')}-${index}-${Date.now()}`,
      category
    })).filter((a: any) => a.url !== '' && a.title && a.title.length > 10);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  const prompt = `Act as an investigative journalist for 'KURAL'. 
  Perform a deep Google Search to find current news for: '${query}'.
  
  Return a JSON array of 15-20 news stories.
  Format: [{"title": "...", "summary": "...", "source": "...", "publishedAt": "...", "url": "...", "imageUrl": "..."}]
  
  URGENT: Ensure every URL is the REAL CANONICAL LINK. No truncated links.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "[]";
    const articles = JSON.parse(text);
    
    return articles.map((a: any, index: number) => ({
      ...a,
      url: sanitizeUrl(a.url),
      id: `search-${index}-${Date.now()}`,
      category: 'Search Result'
    })).filter((a: any) => a.url !== '' && a.title);
  } catch (error) {
    console.error("Error searching news:", error);
    return [];
  }
}
