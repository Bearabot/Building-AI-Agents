import React, { useState, useEffect } from 'react';
import { Search, Globe, User, TrendingUp, Bell, Wallet, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  watchlistCount: number;
  onOpenAiAssistant: () => void;
  onOpenPortfolio: () => void;
  activeCategory: string;
  setActiveCategory: (cat: any) => void;
  liveFeedActive: boolean;
  setLiveFeedActive: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  watchlistCount,
  onOpenAiAssistant,
  onOpenPortfolio,
  activeCategory,
  setActiveCategory,
  liveFeedActive,
  setLiveFeedActive,
}) => {
  const [lang, setLang] = useState('EN');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header className="bg-[#FDFCFB] sticky top-0 z-40 border-b border-[#1A1A1A]">
      <div className="flex justify-between items-center h-20 w-full px-6 md:px-12 max-w-[1280px] mx-auto">
        {/* Left: Editorial Issue Label & Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-10">
          <a href="#" className="flex flex-col group">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#1A1A1A]">
              Ledger / Vol. 2026
            </span>
            <span className="font-serif italic text-2xl font-bold text-[#1A1A1A] tracking-tight group-hover:opacity-75 transition-opacity">
              Pro-Market<span className="font-sans not-italic text-xs font-bold uppercase tracking-widest text-[#1A1A1A] ml-1.5">Index</span>
            </span>
          </a>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-3 bg-[#FDFCFB] hover:bg-[#E5E2DD] border border-[#1A1A1A] py-2 px-4 text-xs tracking-wider uppercase text-[#1A1A1A] w-56 lg:w-64 transition-colors text-left"
          >
            <Search className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <span className="flex-1 truncate text-[11px] font-medium">Search Market (Ctrl+K)</span>
          </button>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">
          <a
            href="#markets"
            onClick={(e) => { e.preventDefault(); setActiveCategory('Indices'); }}
            className={`pb-1 border-b transition-colors ${
              activeCategory !== 'Watchlist'
                ? 'border-[#1A1A1A]'
                : 'border-transparent opacity-50 hover:opacity-100'
            }`}
          >
            Markets
          </a>
          <a href="#analysis" onClick={(e) => { e.preventDefault(); onOpenAiAssistant(); }} className="opacity-50 hover:opacity-100 transition-opacity">
            Analysis
          </a>
          <a href="#portfolio" onClick={(e) => { e.preventDefault(); onOpenPortfolio(); }} className="opacity-50 hover:opacity-100 transition-opacity">
            Portfolio
          </a>
          <a href="#watchlist" onClick={(e) => { e.preventDefault(); setActiveCategory('Watchlist'); }} className="opacity-50 hover:opacity-100 transition-opacity">
            Watchlist ({watchlistCount})
          </a>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-[#1A1A1A] hover:bg-[#E5E2DD] border border-[#1A1A1A] transition-colors"
            title="Search Markets"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* AI Insights Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase px-3 py-2 bg-[#E5E2DD] hover:bg-[#1A1A1A] hover:text-[#FDFCFB] text-[#1A1A1A] border border-[#1A1A1A] transition-all"
            title="Open Gemini AI Market Analyst"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Insights</span>
          </button>

          {/* Virtual Portfolio Button */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase px-3 py-2 bg-[#1A1A1A] text-[#FDFCFB] hover:bg-[#E5E2DD] hover:text-[#1A1A1A] border border-[#1A1A1A] transition-all"
            title="Open Virtual Portfolio"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portfolio</span>
          </button>

          {/* Live Feed Toggle */}
          <button
            onClick={() => setLiveFeedActive(!liveFeedActive)}
            className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-2 border border-[#1A1A1A] transition-all ${
              liveFeedActive
                ? 'bg-[#1A1A1A] text-[#FDFCFB]'
                : 'bg-[#FDFCFB] text-[#1A1A1A] opacity-60'
            }`}
            title="Toggle Live Ticker Feed"
          >
            <span className={`w-2 h-2 rounded-full ${liveFeedActive ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'}`} />
            <span className="hidden xl:inline">{liveFeedActive ? 'LIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
