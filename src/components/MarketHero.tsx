import React, { useState } from 'react';
import { ChevronDown, Globe2, TrendingUp, DollarSign, Activity, Compass } from 'lucide-react';
import { MarketRegion } from '../types';

interface MarketHeroProps {
  selectedRegion: MarketRegion | 'All';
  onSelectRegion: (region: MarketRegion | 'All') => void;
  totalCap: string;
  volume24h: string;
  fearGreedIndex: number;
}

export const MarketHero: React.FC<MarketHeroProps> = ({
  selectedRegion,
  onSelectRegion,
  totalCap,
  volume24h,
  fearGreedIndex,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const regionOptions: { label: string; value: MarketRegion | 'All' }[] = [
    { label: 'everywhere', value: 'All' },
    { label: 'in Americas', value: 'Americas' },
    { label: 'in Europe', value: 'Europe' },
    { label: 'in Asia-Pacific', value: 'Asia-Pacific' },
    { label: 'Global Crypto', value: 'Global' },
  ];

  const activeLabel = regionOptions.find(r => r.value === selectedRegion)?.label || 'everywhere';

  const getFearGreedText = (val: number) => {
    if (val >= 75) return { text: 'Extreme Greed', color: 'text-[#089981]' };
    if (val >= 55) return { text: 'Greed', color: 'text-emerald-600' };
    if (val >= 45) return { text: 'Neutral', color: 'text-amber-600' };
    if (val >= 25) return { text: 'Fear', color: 'text-orange-600' };
    return { text: 'Extreme Fear', color: 'text-[#F23645]' };
  };

  const sentimentInfo = getFearGreedText(fearGreedIndex);

  return (
    <section className="text-center pt-10 pb-6 relative max-w-[1280px] mx-auto px-6 md:px-12 border-b border-[#1A1A1A]">
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#1A1A1A] mb-4">
        Global Financial Overview
      </p>

      {/* Title with dropdown */}
      <div className="relative inline-block mb-4">
        <h1
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="font-serif italic text-4xl sm:text-6xl md:text-7xl leading-tight text-[#1A1A1A] flex items-center justify-center gap-3 cursor-pointer hover:opacity-80 transition-opacity select-none"
        >
          <span>Markets, {activeLabel}</span>
          <ChevronDown className={`w-8 h-8 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </h1>

        {dropdownOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#FDFCFB] border border-[#1A1A1A] shadow-2xl py-2 z-30 text-left">
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A] border-b border-[#1A1A1A]">
              Scope Region
            </div>
            {regionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSelectRegion(opt.value);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs tracking-wider uppercase flex items-center justify-between hover:bg-[#E5E2DD] transition-colors ${
                  selectedRegion === opt.value ? 'font-bold bg-[#1A1A1A] text-[#FDFCFB]' : 'text-[#1A1A1A]'
                }`}
              >
                <span>Markets, {opt.label}</span>
                {selectedRegion === opt.value && <div className="w-1.5 h-1.5 bg-[#FDFCFB]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto mb-8 text-[#1A1A1A]">
        Real-time equities, global benchmark indices, commodities, currencies, and technical momentum indicators.
      </p>

      {/* Global Market Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-[#1A1A1A] divide-x divide-y md:divide-y-0 divide-[#1A1A1A] bg-[#FDFCFB] max-w-4xl mx-auto text-left">
        <div className="p-4 bg-[#FDFCFB]">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A] mb-1">Total Cap</div>
          <div className="text-base font-bold font-tabular text-[#1A1A1A]">{totalCap}</div>
        </div>

        <div className="p-4 bg-[#FDFCFB]">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A] mb-1">24h Volume</div>
          <div className="text-base font-bold font-tabular text-[#1A1A1A]">{volume24h}</div>
        </div>

        <div className="p-4 bg-[#FDFCFB]">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A] mb-1">Sentiment</div>
          <div className={`text-base font-bold font-tabular ${sentimentInfo.color}`}>
            {fearGreedIndex} ({sentimentInfo.text})
          </div>
        </div>

        <div className="p-4 bg-[#FDFCFB]">
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A] mb-1">Market Status</div>
          <div className="text-sm font-bold text-[#089981] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <span className="w-2 h-2 bg-[#089981] inline-block animate-ping" />
            Active Session
          </div>
        </div>
      </div>
    </section>
  );
};
