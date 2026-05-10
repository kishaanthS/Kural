import React from 'react';
import { Newspaper, Bell, Search, User, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="px-4 py-6 flex items-center justify-between border-b border-dim" id="app-header">
      <div className="flex items-center space-x-3 group cursor-pointer">
        <div className="w-10 h-10 bg-[#080808] border border-white/5 rounded-xl flex items-center justify-center shadow-2xl transition-all group-hover:scale-105 active:scale-95 group-hover:border-white/10 ring-1 ring-white/5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20V18H4V6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10H16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 14H12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="15" y="13" width="2" height="2" fill="white"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-tr from-white to-white/60 bg-clip-text text-transparent">
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
