/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketHero } from './components/MarketHero';
import { IndicesCards } from './components/IndicesCards';
import { MarketTable } from './components/MarketTable';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SearchModal } from './components/SearchModal';
import { AiMarketAssistantModal } from './components/AiMarketAssistantModal';
import { PaperPortfolioDrawer } from './components/PaperPortfolioDrawer';
import { INITIAL_MARKET_ASSETS } from './data/marketData';
import { MarketAsset, MarketCategory, MarketRegion, PaperTradePosition } from './types';

export default function App() {
  // State
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKET_ASSETS);
  const [selectedRegion, setSelectedRegion] = useState<MarketRegion | 'All'>('All');
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('Indices');
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pml_watchlist');
      return saved ? JSON.parse(saved) : ['sp500', 'nasdaq100', 'btc', 'aapl'];
    } catch {
      return ['sp500', 'nasdaq100', 'btc', 'aapl'];
    }
  });

  const [paperPositions, setPaperPositions] = useState<PaperTradePosition[]>(() => {
    try {
      const saved = localStorage.getItem('pml_paper_positions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pml_cash_balance');
      return saved ? parseFloat(saved) : 100000;
    } catch {
      return 100000;
    }
  });

  const [liveFeedActive, setLiveFeedActive] = useState<boolean>(true);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<MarketAsset | null>(null);
  const [selectedAssetForAi, setSelectedAssetForAi] = useState<MarketAsset | null>(null);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState<boolean>(false);
  const [fearGreedIndex, setFearGreedIndex] = useState<number>(68);

  // Save watchlist & positions to localStorage
  useEffect(() => {
    localStorage.setItem('pml_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('pml_paper_positions', JSON.stringify(paperPositions));
    localStorage.setItem('pml_cash_balance', cashBalance.toString());
  }, [paperPositions, cashBalance]);

  // Simulated live ticker price stream
  useEffect(() => {
    if (!liveFeedActive) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          // 40% chance of price tick per interval
          if (Math.random() > 0.4) return asset;

          const deltaPercent = (Math.random() - 0.49) * 0.003; // max +- 0.3%
          const priceChange = asset.lastPrice * deltaPercent;
          const newPrice = Math.max(0.01, asset.lastPrice + priceChange);
          const newChange = asset.change + priceChange;
          const newChangePercent = ((newPrice - (asset.lastPrice - asset.change)) / (asset.lastPrice - asset.change)) * 100;

          const newHigh = Math.max(asset.high24h, newPrice);
          const newLow = Math.min(asset.low24h, newPrice);

          // Append to 1D history
          const updated1D = [...asset.history1D];
          if (updated1D.length > 0) {
            const lastPoint = updated1D[updated1D.length - 1];
            updated1D[updated1D.length - 1] = {
              ...lastPoint,
              price: Number(newPrice.toFixed(2)),
              high: Math.max(lastPoint.high || newPrice, newPrice),
              low: Math.min(lastPoint.low || newPrice, newPrice),
            };
          }

          // Update sparkline
          const newSparkline = [...asset.sparkline.slice(1), Number(newPrice.toFixed(2))];

          return {
            ...asset,
            lastPrice: Number(newPrice.toFixed(2)),
            change: Number(newChange.toFixed(2)),
            changePercent: Number(newChangePercent.toFixed(2)),
            high24h: Number(newHigh.toFixed(2)),
            low24h: Number(newLow.toFixed(2)),
            sparkline: newSparkline,
            history1D: updated1D,
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [liveFeedActive]);

  // Keep detail asset synced if live feed is updating
  useEffect(() => {
    if (selectedAssetForDetail) {
      const updated = assets.find((a) => a.id === selectedAssetForDetail.id);
      if (updated) setSelectedAssetForDetail(updated);
    }
  }, [assets]);

  // Toggle star watchlist
  const handleToggleWatchlist = (assetId: string) => {
    setWatchlist((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  // Execute paper trade
  const handleExecuteTrade = (assetId: string, type: 'BUY' | 'SELL', shares: number) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const totalCost = shares * asset.lastPrice;

    if (type === 'BUY') {
      if (cashBalance < totalCost) {
        alert(`Insufficient cash balance! Required: $${totalCost.toFixed(2)}, Available: $${cashBalance.toFixed(2)}`);
        return;
      }
      setCashBalance((prev) => prev - totalCost);
    } else {
      setCashBalance((prev) => prev + totalCost);
    }

    const newPosition: PaperTradePosition = {
      id: Date.now().toString(),
      assetId,
      ticker: asset.ticker,
      name: asset.name,
      type,
      shares,
      buyPrice: asset.lastPrice,
      currentPrice: asset.lastPrice,
      totalCost,
      timestamp: new Date().toLocaleTimeString(),
    };

    setPaperPositions((prev) => [newPosition, ...prev]);
  };

  // Close paper trade position
  const handleClosePosition = (positionId: string) => {
    const pos = paperPositions.find((p) => p.id === positionId);
    if (!pos) return;

    const asset = assets.find((a) => a.id === pos.assetId);
    const currentPrice = asset ? asset.lastPrice : pos.buyPrice;
    const currentVal = pos.shares * currentPrice;

    if (pos.type === 'BUY') {
      setCashBalance((prev) => prev + currentVal);
    } else {
      const initialCost = pos.shares * pos.buyPrice;
      const profitLoss = initialCost - currentVal;
      setCashBalance((prev) => prev + initialCost + profitLoss);
    }

    setPaperPositions((prev) => prev.filter((p) => p.id !== positionId));
  };

  // Reset portfolio
  const handleResetPortfolio = () => {
    if (window.confirm('Reset virtual trading account to $100,000 cash balance and clear all positions?')) {
      setPaperPositions([]);
      setCashBalance(100000);
    }
  };

  const handleOpenAiForAsset = (asset: MarketAsset) => {
    setSelectedAssetForAi(asset);
    setShowAiModal(true);
  };

  // Filter indices for top cards
  const indicesList = assets.filter((a) => a.category === 'Indices');

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-body selection:bg-blue-100 selection:text-[#0049db]">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setShowSearchModal(true)}
        watchlistCount={watchlist.length}
        onOpenAiAssistant={() => {
          setSelectedAssetForAi(null);
          setShowAiModal(true);
        }}
        onOpenPortfolio={() => setShowPortfolioDrawer(true)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        liveFeedActive={liveFeedActive}
        setLiveFeedActive={setLiveFeedActive}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto py-6 flex flex-col gap-8 pb-16">
        {/* Hero Section */}
        <MarketHero
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          totalCap="$108.4T"
          volume24h="$482B"
          fearGreedIndex={fearGreedIndex}
        />

        {/* Indices Section Cards */}
        <IndicesCards
          indices={indicesList}
          onSelectAsset={setSelectedAssetForDetail}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onNavigateCategory={setActiveCategory}
        />

        {/* World Indices & Market Assets Table */}
        <MarketTable
          assets={assets}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onSelectAsset={setSelectedAssetForDetail}
          onAnalyzeAsset={handleOpenAiForAsset}
        />
      </main>

      {/* Modals & Drawers */}
      {selectedAssetForDetail && (
        <AssetDetailModal
          asset={selectedAssetForDetail}
          onClose={() => setSelectedAssetForDetail(null)}
          isWatchlisted={watchlist.includes(selectedAssetForDetail.id)}
          onToggleWatchlist={handleToggleWatchlist}
          onExecuteTrade={handleExecuteTrade}
          onRequestAiSummary={handleOpenAiForAsset}
        />
      )}

      {showSearchModal && (
        <SearchModal
          assets={assets}
          onClose={() => setShowSearchModal(false)}
          onSelectAsset={setSelectedAssetForDetail}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {showAiModal && (
        <AiMarketAssistantModal
          assets={assets}
          onClose={() => setShowAiModal(false)}
          selectedAssetForAi={selectedAssetForAi}
        />
      )}

      {showPortfolioDrawer && (
        <PaperPortfolioDrawer
          positions={paperPositions}
          assets={assets}
          onClose={() => setShowPortfolioDrawer(false)}
          onClosePosition={handleClosePosition}
          onResetPortfolio={handleResetPortfolio}
          cashBalance={cashBalance}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#E0E3EB] bg-white py-8 px-6 text-center text-xs text-[#6A6D78]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-headline font-bold text-sm text-[#1a1c1c]">
            <svg className="w-5 h-5 text-[#0049db] fill-current" viewBox="0 0 28 28">
              <path clipRule="evenodd" d="M11 6L9 22H5L7 6H11ZM18.5 6H23L16 22H11.5L18.5 6Z" fillRule="evenodd" />
            </svg>
            <span>TradingView • Pro-Market Ledger</span>
          </div>
          <p>© {new Date().getFullYear()} TradingView Inc. All market data provided for analytical & simulation purposes.</p>
          <div className="flex items-center gap-4 text-[#434656] font-medium">
            <a href="#" className="hover:text-[#0049db]">Terms</a>
            <a href="#" className="hover:text-[#0049db]">Privacy</a>
            <a href="#" className="hover:text-[#0049db]">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
