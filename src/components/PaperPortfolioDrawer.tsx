import React from 'react';
import { X, Wallet, TrendingUp, TrendingDown, Trash2, RotateCcw, DollarSign } from 'lucide-react';
import { PaperTradePosition, MarketAsset } from '../types';

interface PaperPortfolioDrawerProps {
  positions: PaperTradePosition[];
  assets: MarketAsset[];
  onClose: () => void;
  onClosePosition: (id: string) => void;
  onResetPortfolio: () => void;
  cashBalance: number;
}

export const PaperPortfolioDrawer: React.FC<PaperPortfolioDrawerProps> = ({
  positions,
  assets,
  onClose,
  onClosePosition,
  onResetPortfolio,
  cashBalance,
}) => {
  // Calculate total portfolio value and P&L
  let totalInvested = 0;
  let currentPositionsValue = 0;

  const positionsWithLiveData = positions.map((pos) => {
    const liveAsset = assets.find((a) => a.id === pos.assetId);
    const currentPrice = liveAsset ? liveAsset.lastPrice : pos.buyPrice;
    const currentTotalVal = pos.shares * currentPrice;
    const initialTotalVal = pos.shares * pos.buyPrice;
    const pnl = pos.type === 'BUY' ? currentTotalVal - initialTotalVal : initialTotalVal - currentTotalVal;
    const pnlPercent = initialTotalVal > 0 ? (pnl / initialTotalVal) * 100 : 0;

    totalInvested += initialTotalVal;
    currentPositionsValue += currentTotalVal;

    return {
      ...pos,
      currentPrice,
      currentTotalVal,
      pnl,
      pnlPercent,
    };
  });

  const totalPortfolioValue = cashBalance + currentPositionsValue;
  const totalPnl = currentPositionsValue - totalInvested;
  const isOverallUp = totalPnl >= 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCFB] border-l border-[#1A1A1A] w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden text-[#1A1A1A]">
        {/* Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between bg-[#1A1A1A] text-[#FDFCFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#FDFCFB] bg-[#1A1A1A]">
              <Wallet className="w-4 h-4 text-[#FDFCFB]" />
            </div>
            <div>
              <h2 className="font-serif italic font-bold text-xl">Virtual Paper Portfolio</h2>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">Simulated trading account & ledger positions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPortfolio}
              className="p-1.5 text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A] bg-[#FDFCFB] border border-[#1A1A1A] hover:bg-[#E5E2DD] flex items-center gap-1"
              title="Reset Portfolio to $100,000"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button onClick={onClose} className="p-1.5 text-[#FDFCFB] border border-[#FDFCFB] hover:bg-[#FDFCFB] hover:text-[#1A1A1A] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total Value & Balance Banner */}
        <div className="p-4 border-b border-[#1A1A1A] bg-[#FDFCFB] grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#FDFCFB] border border-[#1A1A1A]">
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A] mb-1">Total Portfolio Value</div>
            <div className="font-mono font-bold text-xl text-[#1A1A1A]">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-bold font-mono flex items-center gap-1 mt-1 ${isOverallUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
              {isOverallUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isOverallUp ? '+' : ''}${totalPnl.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 bg-[#E5E2DD] border border-[#1A1A1A]">
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#1A1A1A] mb-1">Cash Balance</div>
            <div className="font-mono font-bold text-xl text-[#1A1A1A]">
              ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] opacity-60 mt-1">Available Purchasing Power</div>
          </div>
        </div>

        {/* Positions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
            Open Positions ({positions.length})
          </h3>

          {positionsWithLiveData.length === 0 ? (
            <div className="p-10 text-center font-serif italic text-base text-[#1A1A1A] bg-[#E5E2DD] border border-[#1A1A1A]">
              You have no open paper trade positions. Click "Paper Trade" on any stock or index to simulate an order.
            </div>
          ) : (
            positionsWithLiveData.map((pos) => {
              const isPosUp = pos.pnl >= 0;

              return (
                <div
                  key={pos.id}
                  className="p-4 bg-[#FDFCFB] border border-[#1A1A1A] hover:bg-[#E5E2DD] flex items-center justify-between transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1A1A1A] text-base">{pos.ticker}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[#1A1A1A] ${
                          pos.type === 'BUY' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'bg-[#E5E2DD] text-[#1A1A1A]'
                        }`}
                      >
                        {pos.type}
                      </span>
                      <span className="text-xs text-[#1A1A1A] opacity-75 font-mono">{pos.shares} units</span>
                    </div>

                    <div className="text-xs text-[#1A1A1A] opacity-60 font-mono">
                      Entry: ${pos.buyPrice.toFixed(2)} &bull; Current: ${pos.currentPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#1A1A1A]">
                        ${pos.currentTotalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`font-mono text-xs font-bold ${isPosUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPosUp ? '+' : ''}${pos.pnl.toFixed(2)} ({isPosUp ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>

                    <button
                      onClick={() => onClosePosition(pos.id)}
                      className="p-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FDFCFB] border border-[#1A1A1A] transition-colors"
                      title="Close position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
