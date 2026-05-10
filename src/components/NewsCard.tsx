import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Clock, Share2 } from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onExpand: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onExpand }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface rounded-sm overflow-hidden mb-8 group cursor-pointer"
      id={`news-card-${article.id}`}
      onClick={() => onExpand(article)}
    >
      {article.imageUrl && (
        <div className="relative h-64 overflow-hidden border-b border-dim">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-4 left-4">
             <span className="px-2 py-1 bg-accent text-white text-[9px] font-black uppercase tracking-[2px]">
                {article.category}
             </span>
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        {!article.imageUrl && (
           <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-[2px] mb-4 border border-accent/20">
              {article.category}
           </span>
        )}
        <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-4 tracking-tight group-hover:text-accent transition-colors duration-300">
          {article.title}
        </h3>
        <p className="text-dim font-serif text-lg leading-relaxed mb-6 line-clamp-4">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-dim/50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black border border-dim uppercase">
               {article.source.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">{article.source}</p>
              <div className="flex items-center text-[10px] text-dim mt-1 uppercase tracking-widest">
                <Clock className="w-3 h-3 mr-1.5 text-accent" />
                {article.publishedAt}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              className="p-3 bg-gray-50 dark:bg-white/5 border border-dim hover:bg-white dark:hover:bg-white/10 rounded-sm transition-all text-dim hover:text-accent"
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    url: article.url
                  });
                }
              }}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a 
              href={article.url} 
              onClick={(e) => e.stopPropagation()}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 bg-accent text-white rounded-sm hover:scale-105 transition-all shadow-lg shadow-accent/20 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
