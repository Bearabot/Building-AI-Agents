import React, { useState, useMemo } from 'react';
import { Star, ArrowUpDown, ArrowUp, ArrowDown, Search, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import { MarketAsset, MarketCategory } from '../types';

interface MarketTableProps {
  assets: MarketAsset[];
  activeCategory: MarketCategory;
  setActiveCategory: (cat: MarketCategory) => void;
  watchlist: string[];
  onToggleWatchlist: (assetId: string) => void;
  onSelectAsset: (asset: MarketAsset) => void;
  onAnalyzeAsset: (asset: MarketAsset) => void;
}

type SortField = 'ticker' | 'name' | 'lastPrice' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';

export const MarketTable: React.FC<MarketTableProps> = ({
  assets,
  activeCategory,
  setActiveCategory,
  watchlist,
  onToggleWatchlist,
  onSelectAsset,
  onAnalyzeAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [regionFilter, setRegionFilter] = useState<string>('All');

  const categories: { label: string; value: MarketCategory }[] = [
    { label: 'World indices', value: 'Indices' },
    { label: 'US Stocks', value: 'Stocks' },
    { label: 'Crypto', value: 'Crypto' },
    { label: 'Commodities', value: 'Commodities' },
    { label: 'Forex', value: 'Forex' },
    { label: `Watchlist (${watchlist.length})`, value: 'Watchlist' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Category filter
      if (activeCategory === 'Watchlist') {
        if (!watchlist.includes(asset.id)) return false;
      } else if (asset.category !== activeCategory) {
        return false;
      }

      // Region filter
      if (regionFilter !== 'All' && asset.region !== regionFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTicker = asset.ticker.toLowerCase().includes(q);
        const matchName = asset.name.toLowerCase().includes(q);
        const matchSector = asset.sector?.toLowerCase().includes(q) || false;
        if (!matchTicker && !matchName && !matchSector) return false;
      }

      return true;
    });
  }, [assets, activeCategory, watchlist, regionFilter, searchQuery]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortField, sortDir]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-[#6A6D78] opacity-50 inline ml-1" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0049db] inline ml-1 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0049db] inline ml-1 font-bold" />
    );
  };

  return (
    <section className="mt-8 max-w-[1280px] mx-auto px-6 md:px-12 w-full">
      {/* Category Tabs & Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1A1A1A] gap-4 pb-4 mb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap py-2 px-3.5 border border-[#1A1A1A] transition-all ${
                  isActive
                    ? 'bg-[#1A1A1A] text-[#FDFCFB]'
                    : 'bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#E5E2DD]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Filter Input */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ticker..."
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] py-1.5 pl-8 pr-3 text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:bg-[#E5E2DD]"
            />
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1.5 bg-[#FDFCFB] border border-[#1A1A1A] px-2.5 py-1.5 text-xs text-[#1A1A1A]">
            <Filter className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A]"
            >
              <option value="All">All Regions</option>
              <option value="Americas">Americas</option>
              <option value="Europe">Europe</option>
              <option value="Asia-Pacific">Asia-Pacific</option>
              <option value="Global">Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif italic font-bold text-2xl md:text-3xl text-[#1A1A1A]">
          {categories.find((c) => c.value === activeCategory)?.label || 'Market Quotes'}
        </h3>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
          Showing {sortedAssets.length} of {assets.length} assets
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tabular text-sm">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#1A1A1A] text-[#FDFCFB] text-[10px] font-bold uppercase tracking-[0.2em] select-none">
                <th className="py-3.5 px-3 w-10 text-center">★</th>
                <th
                  onClick={() => handleSort('ticker')}
                  className="py-3.5 px-4 cursor-pointer hover:underline"
                >
                  TICKER {getSortIcon('ticker')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:underline"
                >
                  NAME {getSortIcon('name')}
                </th>
                <th
                  onClick={() => handleSort('lastPrice')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:underline"
                >
                  LAST {getSortIcon('lastPrice')}
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:underline"
                >
                  CHG % {getSortIcon('changePercent')}
                </th>
                <th className="py-3.5 px-4 text-right hidden lg:table-cell">24H RANGE</th>
                <th className="py-3.5 px-4 text-right hidden sm:table-cell">VOLUME</th>
                <th className="py-3.5 px-4 text-center hidden md:table-cell">SPARKLINE</th>
                <th className="py-3.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#1A1A1A] font-serif italic text-base">
                    {activeCategory === 'Watchlist'
                      ? 'No assets in your watchlist. Click the star icon next to any market to add it.'
                      : 'No market symbols matched your search or region filter.'}
                  </td>
                </tr>
              ) : (
                sortedAssets.map((item) => {
                  const isUp = item.change >= 0;
                  const isStarred = watchlist.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectAsset(item)}
                      className="border-b border-[#1A1A1A] hover:bg-[#E5E2DD] transition-colors group cursor-pointer"
                    >
                      {/* Star Watchlist Toggle */}
                      <td
                        className="py-3.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(item.id);
                        }}
                      >
                        <button
                          className="p-1 text-[#1A1A1A] hover:scale-110 transition-transform"
                          title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <Star className={`w-4 h-4 ${isStarred ? 'fill-[#1A1A1A]' : 'opacity-30'}`} />
                        </button>
                      </td>

                      {/* Ticker Symbol */}
                      <td className="py-3.5 px-4 font-bold text-[#1A1A1A] group-hover:underline">
                        {item.ticker}
                      </td>

                      {/* Name & Region Badge */}
                      <td className="py-3.5 px-4 text-[#1A1A1A]">
                        <div className="font-serif italic font-bold text-base">{item.name}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A] opacity-60 flex items-center gap-2">
                          <span>{item.region}</span>
                          {item.sector && <span className="border border-[#1A1A1A] px-1 py-0.2 text-[9px]">{item.sector}</span>}
                        </div>
                      </td>

                      {/* Last Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#1A1A1A]">
                        {item.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Change % */}
                      <td className={`py-3.5 px-4 text-right font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </td>

                      {/* High / Low 24h */}
                      <td className="py-3.5 px-4 text-right text-xs text-[#1A1A1A] opacity-80 hidden lg:table-cell font-mono">
                        <div>H: {item.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <div>L: {item.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 text-right text-xs text-[#1A1A1A] font-mono hidden sm:table-cell">
                        {item.volume}
                      </td>

                      {/* Mini Sparkline Chart */}
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        <div className="w-20 h-6 mx-auto">
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
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnalyzeAsset(item);
                          }}
                          className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 bg-[#1A1A1A] text-[#FDFCFB] hover:bg-[#E5E2DD] hover:text-[#1A1A1A] border border-[#1A1A1A] transition-all inline-flex items-center gap-1"
                          title="Generate AI Analysis"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span className="hidden sm:inline">Analyze</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
