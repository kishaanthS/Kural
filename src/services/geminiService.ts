import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  const prompt = `Act as a senior news curator for 'KURAL'. 
  Use Google Search to find ACTUAL news articles published in the last 24 hours for the category: ${category}. 
  
  CRITICAL URL INTEGRITY:
  - ONLY include articles where you are 100% CERTAIN of the ABSOLUTE URL.
  - DO NOT construct, guess, or hallucinate URLs.
  - Use the exact canonical links from the search results (e.g., starting with https://www.thehindu.com/...).
  
  Provide a comprehensive list of 15-20 high-quality news articles with:
  1. Title: Factual headline from the source.
  2. Summary: A deep 4-sentence objective summary.
  3. Source: The actual publisher (e.g., 'The Hindu', 'NDTV').
  4. PublishedAt: Relative time (e.g., '3 hours ago').
  5. ImageUrl: A valid, working image URL from the article or a high-quality relevant placeholder if unavailable.
  6. Url: THE REAL ABSOLUTE PERMANENT LINK.
  
  Format as a strict JSON array of objects with keys: title, summary, source, publishedAt, imageUrl, url.
  
  Current Date: ${new Date().toLocaleDateString()}
  Category: ${category}
  Focus: RECENT, VERIFIED, AND FUNCTIONAL LINKS.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });

    const text = response.text || "[]";
    const articles = JSON.parse(text);
    
    return articles.map((a: any, index: number) => ({
      ...a,
      id: `${category}-${index}-${Date.now()}`,
      category
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  const prompt = `Act as an investigative journalist for 'KURAL'. 
  Use Google Search to find current news for the query: '${query}'.
  
  CRITICAL URL REQUIREMENT:
  - PROVIDE ONLY REAL, VERIFIED, WORKING LINKS.
  - DO NOT HALLUCINATE SLUGS. 
  
  Provide a list of up to 15 news articles with:
  1. Title: Factual headline.
  2. Summary: 4-sentence summary.
  3. Source: Verified agency.
  4. PublishedAt: Human-readable time.
  5. ImageUrl: High-quality image URL.
  6. Url: REAL direct link.
  
  Format as a strict JSON array of objects with keys: title, summary, source, publishedAt, imageUrl, url.
  
  Current Date: ${new Date().toLocaleDateString()}
  Query: ${query}
  Focus: URL ACCURACY.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    });

    const text = response.text || "[]";
    const articles = JSON.parse(text);
    
    return articles.map((a: any, index: number) => ({
      ...a,
      id: `search-${index}-${Date.now()}`,
      category: 'Search Result'
    }));
  } catch (error) {
    console.error("Error searching news:", error);
    return [];
  }
}
