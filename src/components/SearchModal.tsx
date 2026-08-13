import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown, ChevronRight, Star } from 'lucide-react';
import { MarketAsset } from '../types';

interface SearchModalProps {
  assets: MarketAsset[];
  onClose: () => void;
  onSelectAsset: (asset: MarketAsset) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  assets,
  onClose,
  onSelectAsset,
  watchlist,
  onToggleWatchlist,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = assets.filter((asset) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      asset.ticker.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q) ||
      (asset.sector && asset.sector.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-[#1A1A1A]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center gap-3 bg-[#1A1A1A] text-[#FDFCFB]">
          <Search className="w-5 h-5 text-[#FDFCFB]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH TICKER, SYMBOL, INDEX (E.G. AAPL, BTC, S&P 500)..."
            className="w-full bg-transparent text-xs tracking-wider uppercase text-[#FDFCFB] placeholder-[#E5E2DD]/60 focus:outline-none font-bold"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#FDFCFB] hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 px-2 text-[10px] font-bold tracking-widest text-[#1A1A1A] bg-[#FDFCFB] border border-[#1A1A1A]">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-[#1A1A1A]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm font-serif italic text-[#1A1A1A]">
              No markets found matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const isUp = item.change >= 0;
              const isStarred = watchlist.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectAsset(item);
                    onClose();
                  }}
                  className="p-4 hover:bg-[#E5E2DD] flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {/* Star toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(item.id);
                      }}
                      className="p-1 text-[#1A1A1A] hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-[#1A1A1A]' : 'opacity-30'}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A1A1A] font-mono group-hover:underline">{item.ticker}</span>
                        <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-[#1A1A1A] text-[#1A1A1A] font-bold">{item.category}</span>
                      </div>
                      <div className="font-serif italic font-bold text-base text-[#1A1A1A]">{item.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-[#1A1A1A]">
                      ${item.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`font-mono text-xs font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
