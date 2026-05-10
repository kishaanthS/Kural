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

const sanitizeUrl = (url: any): string => {
  if (!url || typeof url !== 'string') return '';
  let s = url.trim();
  // Remove trailing punctuation often added by LLMs in a JSON context
  s = s.replace(/[.,;!"\s]+$/, '');
  if (!s.startsWith('http')) s = `https://${s}`;
  
  try {
    const parsed = new URL(s);
    // Basic check for realistic hostname (at least one dot and enough chars)
    if (!parsed.hostname.includes('.') || parsed.hostname.length < 4) return '';
    return s;
  } catch {
    return '';
  }
};

export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  const prompt = `Act as a master news editor for 'KURAL'. 
  Use Google Search to find current news articles published TODAY for the category: ${category}. 
  
  CRITICAL SOURCE PREFERENCE: Prioritize HIGH-REPUTE sources. Specifically, if news is available from 'The Hindu', you MUST include it and prefer it. 
  
  CRITICAL URL INTEGRITY:
  - ONLY include articles where you are 100% CERTAIN of the ABSOLUTE URL.
  - DO NOT construct, guess, or hallucinate URLs.
  - Use exact canonical links from the search tool results.
  
  Provide a list of 15-20 news articles with:
  1. Title: Factual headline.
  2. Summary: 4-sentence summary providing deep context.
  3. Source: Verified publisher (Prefer 'The Hindu').
  4. PublishedAt: Human-readable relative time.
  5. ImageUrl: A valid, working image URL from the article.
  6. Url: THE REAL ABSOLUTE LINK.
  
  Format as JSON.
  Current Date: ${new Date().toLocaleDateString()}
  Category: ${category}`;

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
    
    return articles
      .map((a: any, index: number) => ({
        ...a,
        url: sanitizeUrl(a.url),
        id: `${category}-${index}-${Date.now()}`,
        category
      }))
      .filter((a: any) => a.url !== '');
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function searchNews(query: string): Promise<NewsArticle[]> {
  const prompt = `Act as an investigative journalist for 'KURAL'. 
  Use Google Search to find news for the query: '${query}'.
  
  CRITICAL URL REQUIREMENT:
  - PROVIDE ONLY REAL, VERIFIED, WORKING LINKS FROM SEARCH SNIPPETS.
  - DO NOT HALLUCINATE OR GUESS SLUGS. 
  
  Provide a list of up to 20 news articles with:
  1. Title: Factual headline.
  2. Summary: 4-sentence summary.
  3. Source: Verified agency.
  4. PublishedAt: Human-readable time.
  5. ImageUrl: High-quality image URL.
  6. Url: REAL direct link from the search results.
  
  Format as JSON.
  Current Date: ${new Date().toLocaleDateString()}
  Query: ${query}`;

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
    
    return articles
      .map((a: any, index: number) => ({
        ...a,
        url: sanitizeUrl(a.url),
        id: `search-${index}-${Date.now()}`,
        category: 'Search Result'
      }))
      .filter((a: any) => a.url !== '');
  } catch (error) {
    console.error("Error searching news:", error);
    return [];
  }
}
