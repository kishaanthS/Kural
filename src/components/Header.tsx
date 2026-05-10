import React from 'react';
import { Newspaper, Bell, Search, User, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="px-4 py-6 flex items-center justify-between border-b border-dim" id="app-header">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center transform rotate-45 shadow-lg shadow-accent/20">
          <Newspaper className="text-white w-4 h-4 -rotate-45" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">
          KURAL
        </h1>
      </div>
      
      <div className="flex items-center space-x-4 text-dim">
        <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
