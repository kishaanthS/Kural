import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { NewsCard } from './components/NewsCard';
import { ArticleImage } from './components/ArticleImage';
import { fetchNewsByCategory, searchNews, expandArticleContent } from './services/geminiService';
import { Category, NewsArticle } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, RefreshCw, Newspaper, Search, X, ArrowLeft, BrainCircuit } from 'lucide-react';

const CATEGORIES: Category[] = [
  'Tamil Nadu',
  'India',
  'World'
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const loadNews = async (category: Category) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setIsSearchOpen(false);
    try {
      const data = await fetchNewsByCategory(category);
      if (data.length === 0) {
        setError("Our news room is currently occupied. Please reconnect in a moment.");
      } else {
        setNews(data);
      }
    } catch (err) {
      setError("Communication failure with the news dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setLoading(true);
    setError(null);
    try {
      const data = await searchNews(searchQuery);
      if (data.length === 0) {
        setError(`No dispatches found for "${searchQuery}". Try a different keyword.`);
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      setError("Search investigation failed. Please try again.");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleExpandArticle = async () => {
    if (!selectedArticle || selectedArticle.fullContent) return;
    
    setIsExpanding(true);
    try {
      const fullContent = await expandArticleContent(selectedArticle);
      setSelectedArticle(prev => prev ? { ...prev, fullContent } : null);
      
      // Update the article in the list too so it's cached
      setNews(prev => prev.map(a => a.id === selectedArticle.id ? { ...a, fullContent } : a));
      if (searchResults.length > 0) {
        setSearchResults(prev => prev.map(a => a.id === selectedArticle.id ? { ...a, fullContent } : a));
      }
    } catch (err) {
      console.error("Scale-up failed", err);
    } finally {
      setIsExpanding(false);
    }
  };

  useEffect(() => {
    if (!isSearchOpen) {
      loadNews(activeCategory);
    }
  }, [activeCategory, isSearchOpen]);

  // Auto-expand when article is selected if not already expanded
  useEffect(() => {
    if (selectedArticle && !selectedArticle.fullContent && !isExpanding) {
      handleExpandArticle();
    }
  }, [selectedArticle?.id]);

  return (
    <div className="min-h-screen transition-colors duration-300 pb-24">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      {!selectedArticle && !isSearchOpen && (
        <CategoryNav 
          categories={CATEGORIES} 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
      )}

      {isSearchOpen && !selectedArticle && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white/95 dark:bg-bg/95 backdrop-blur-md border-b border-dim p-4"
        >
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center space-x-3">
             <button 
               type="button"
               onClick={() => {
                 setIsSearchOpen(false);
                 setSearchResults([]);
                 setSearchQuery('');
               }}
               className="p-2 text-dim hover:text-accent"
             >
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="relative flex-1">
               <input 
                 autoFocus
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search keywords..."
                 className="w-full bg-gray-100 dark:bg-white/5 border border-dim rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
               />
               {searchQuery && (
                 <button 
                   type="button"
                   onClick={() => setSearchQuery('')}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-dim p-1"
                 >
                   <X className="w-3 h-3" />
                 </button>
               )}
             </div>
             <button 
               type="submit"
               className="bg-accent text-white px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
             >
               Search
             </button>
          </form>
        </motion.div>
      )}

      <main className="max-w-3xl mx-auto p-4 md:p-12">
        <AnimatePresence mode="wait">
          {selectedArticle ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="py-6"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="mb-8 flex items-center text-accent font-black uppercase tracking-[4px] text-[10px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dispatch
              </button>

              <div className="card-surface p-6 md:p-12 rounded-sm">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[3px] mb-6 border border-accent/20">
                  {selectedArticle.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter mb-8 italic uppercase text-balance">
                  {selectedArticle.title}
                </h1>
                
                <ArticleImage 
                  src={selectedArticle.imageUrl || ''} 
                  alt={selectedArticle.title}
                  containerClassName="mb-10 rounded-sm overflow-hidden border border-dim"
                  className="w-full h-auto object-cover max-h-[500px]"
                />

                <div className="flex items-center space-x-6 mb-10 pb-10 border-b border-dim text-balance">
                  <div className="w-12 h-12 bg-accent flex items-center justify-center text-sm font-black text-white shrink-0">
                    {selectedArticle.source.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-[2px]">{selectedArticle.source}</p>
                    <p className="text-dim text-[10px] uppercase tracking-[4px] mt-1">{selectedArticle.publishedAt}</p>
                  </div>
                </div>

                <div className="font-serif text-xl md:text-2xl leading-relaxed text-dim space-y-6">
                  {selectedArticle.fullContent ? (
                    selectedArticle.fullContent.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                      <p key={i}>{paragraph.trim()}</p>
                    ))
                  ) : (
                    <>
                      {selectedArticle.summary.split('. ').map((sentence, i) => (
                        <p key={i}>{sentence.trim()}{sentence.endsWith('.') ? '' : '.'}</p>
                      ))}
                      {isExpanding && (
                        <div className="mt-12 space-y-4 animate-pulse">
                          <div className="h-4 bg-dim/20 w-full rounded"></div>
                          <div className="h-4 bg-dim/20 w-[95%] rounded"></div>
                          <div className="h-4 bg-dim/20 w-[90%] rounded"></div>
                          <div className="flex items-center space-x-2 text-accent text-sm font-black uppercase tracking-[3px] mt-8">
                            <BrainCircuit className="w-4 h-4 animate-spin-slow" />
                            <span>Synthesizing Full Intelligence Report...</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40"
            >
              <div className="w-20 h-20 bg-[#080808] border border-white/5 rounded-3xl flex items-center justify-center shadow-2xl mb-8 animate-pulse ring-1 ring-white/5">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20V18H4V6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 10H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 14H12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="15" y="13" width="2" height="2" fill="white"/>
                </svg>
              </div>
              <p className="text-dim text-[10px] uppercase tracking-[8px] font-black animate-pulse text-center">
                {isSearching ? `Investigating "${searchQuery}"...` : 'Synchronizing Dispatch'}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 px-6 border border-dim bg-white dark:bg-white/5"
            >
              <div className="w-16 h-16 bg-accent/10 flex items-center justify-center mx-auto mb-8 border border-accent/20">
                <RefreshCw className="w-8 h-8 text-accent" />
              </div>
              <p className="text-xl font-serif mb-8">{error}</p>
              <button 
                onClick={() => isSearchOpen ? handleSearch() : loadNews(activeCategory)}
                className="px-10 py-4 bg-accent text-white text-[10px] uppercase tracking-[3px] font-black hover:scale-105 transition-all active:scale-95"
              >
                {isSearchOpen ? 'Search Again' : 'Reconnect'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <div className="mb-12 flex items-baseline justify-between border-b border-dim pb-6">
                 <div>
                   <h2 className="text-[10px] font-black text-accent uppercase tracking-[6px] mb-2">
                     Editorial / {isSearchOpen ? 'Investigation' : activeCategory}
                   </h2>
                   <p className="text-5xl font-black leading-none tracking-tighter uppercase italic">
                      {isSearchOpen ? `"${searchQuery}"` : "Today's Dispatch"}
                   </p>
                 </div>
                 {!isSearchOpen && (
                   <div className="hidden sm:block text-[10px] text-dim font-bold uppercase tracking-[4px]">
                     {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                   </div>
                 )}
              </div>

              <div className="space-y-12">
                {(isSearchOpen ? searchResults : news).map((item) => (
                  <NewsCard key={item.id} article={item} onExpand={setSelectedArticle} />
                ))}
              </div>
              
              <div className="text-center py-20 border-t border-dim mt-20">
                <p className="text-[9px] text-dim uppercase tracking-[6px] font-bold">Dispatch Archive • Intelligence by Gemini AI</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#080808]/95 backdrop-blur-2xl border-t border-dim px-4 py-5 flex justify-center items-center gap-12 sm:gap-20 z-50 safe-bottom">
        <button 
          onClick={() => {
            setIsSearchOpen(false);
            setSearchResults([]);
            setSelectedArticle(null);
            document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center transition-all active:scale-90 ${!selectedArticle && !isSearchOpen ? 'text-accent' : 'text-dim hover:text-accent'}`}
        >
          <div className={`p-2 rounded-lg transition-all ${!selectedArticle && !isSearchOpen ? 'bg-accent/10 border border-accent/20' : ''}`}>
            <Newspaper className="w-6 h-6" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[3px] mt-1.5">Feed</span>
        </button>
        
        <button 
          onClick={() => {
            setIsSearchOpen(true);
            setSearchResults([]);
            setSelectedArticle(null);
          }}
          className={`flex flex-col items-center transition-all active:scale-90 ${isSearchOpen ? 'text-accent' : 'text-dim hover:text-accent'}`}
        >
          <div className={`p-2 rounded-lg transition-all ${isSearchOpen ? 'bg-accent/10 border border-accent/20' : ''}`}>
            <Search className="w-6 h-6" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[3px] mt-1.5">Search</span>
        </button>

        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            if (isSearchOpen) {
              handleSearch();
            } else {
              loadNews(activeCategory);
            }
          }}
          className="flex flex-col items-center text-dim hover:text-accent transition-all active:scale-90"
        >
          <div className="p-2">
            <RefreshCw className="w-6 h-6" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[3px] mt-1.5">Refresh</span>
        </button>
      </nav>
    </div>
  );
}
