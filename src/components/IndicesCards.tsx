import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { MarketAsset } from '../types';

interface IndicesCardsProps {
  indices: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlist: string[];
  onToggleWatchlist: (assetId: string) => void;
  onNavigateCategory: (cat: string) => void;
}

export const IndicesCards: React.FC<IndicesCardsProps> = ({
  indices,
  onSelectAsset,
  watchlist,
  onToggleWatchlist,
  onNavigateCategory,
}) => {
  return (
    <section className="flex flex-col gap-6 max-w-[1280px] mx-auto px-6 md:px-12 w-full pt-6">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
        <h2
          onClick={() => onNavigateCategory('Indices')}
          className="font-serif italic text-3xl md:text-4xl text-[#1A1A1A] flex items-center gap-2 hover:opacity-75 cursor-pointer group transition-opacity"
        >
          <span>Benchmark Indices</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#1A1A1A]" />
        </h2>
        <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.3em] hidden sm:inline-block">
          Volume 01 / Market Benchmark
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {indices.slice(0, 3).map((item) => {
          const isUp = item.change >= 0;
          const isWatchlisted = watchlist.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onSelectAsset(item)}
              className="bg-[#FDFCFB] border border-[#1A1A1A] hover:bg-[#E5E2DD] p-5 flex flex-col justify-between cursor-pointer transition-colors group relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <div className="w-10 h-10 bg-[#1A1A1A] text-[#FDFCFB] flex items-center justify-center font-bold text-xs uppercase tracking-widest border border-[#1A1A1A]">
                    {item.badgeNumber || item.ticker.slice(0, 3)}
                  </div>

                  <div>
                    <div className="font-serif italic text-xl font-bold text-[#1A1A1A] group-hover:underline flex items-center gap-2">
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] opacity-60">{item.ticker} &bull; {item.region}</div>
                  </div>
                </div>

                {/* Star Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(item.id);
                  }}
                  className="p-1 text-[#1A1A1A] hover:scale-110 transition-transform"
                  title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-[#1A1A1A]' : 'opacity-40'}`} />
                </button>
              </div>

              {/* Price & Sparkline Row */}
              <div className="flex items-end justify-between mt-3 pt-3 border-t border-[#1A1A1A]">
                <div>
                  <div className="font-tabular font-bold text-xl text-[#1A1A1A]">
                    {item.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`font-tabular text-xs font-bold flex items-center gap-1 ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? '+' : ''}{item.change.toFixed(2)} ({isUp ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>

                {/* Mini Sparkline SVG */}
                <div className="w-24 h-9">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    {(() => {
                      const min = Math.min(...item.sparkline);
                      const max = Math.max(...item.sparkline);
                      const range = max - min || 1;
                      const points = item.sparkline
                        .map((val, i) => {
                          const x = (i / (item.sparkline.length - 1)) * 100;
                          const y = 28 - ((val - min) / range) * 24;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return (
                        <polyline
                          fill="none"
                          stroke={isUp ? '#089981' : '#F23645'}
                          strokeWidth="2"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          points={points}
                        />
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
