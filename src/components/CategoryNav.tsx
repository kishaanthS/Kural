import React from 'react';
import { Category } from '../types';
import { motion } from 'motion/react';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: Category;
  onSelect: (category: Category) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-bg/90 backdrop-blur-md border-b border-dim overflow-x-auto no-scrollbar">
      <div className="flex px-4 py-2 space-x-1 min-w-max">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-3 text-[10px] uppercase tracking-[2px] font-bold transition-all duration-300 relative ${
              activeCategory === cat 
                ? 'text-accent' 
                : 'text-dim hover:text-gray-900 dark:hover:text-white'
            }`}
            id={`cat-nav-${cat.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {cat}
            {activeCategory === cat && (
              <motion.div
                layoutId="active-underline"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent z-10"
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
