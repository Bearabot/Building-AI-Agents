import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Sparkles,
  BarChart2,
  DollarSign,
  Activity,
  Layers,
  ShoppingBag,
  CheckCircle2,
  Newspaper,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { MarketAsset, PricePoint } from '../types';

interface AssetDetailModalProps {
  asset: MarketAsset;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string) => void;
  onExecuteTrade: (assetId: string, type: 'BUY' | 'SELL', shares: number) => void;
  onRequestAiSummary: (asset: MarketAsset) => void;
}

type Timeframe = '1D' | '1W' | '1M' | '1Y';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onExecuteTrade,
  onRequestAiSummary,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showVolume, setShowVolume] = useState(true);
  const [showSma, setShowSma] = useState(true);
  const [activeTab, setActiveTab] = useState<'chart' | 'ai' | 'trade' | 'news'>('chart');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [sharesInput, setSharesInput] = useState('10');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  // Pick history based on timeframe
  const rawData: PricePoint[] =
    timeframe === '1D'
      ? asset.history1D
      : timeframe === '1W'
      ? asset.history1W
      : timeframe === '1M'
      ? asset.history1M
      : asset.history1Y;

  // Add calculated 5-period SMA for overlay
  const chartData = rawData.map((pt, idx, arr) => {
    let sma = pt.price;
    if (idx >= 4) {
      const sum = arr.slice(idx - 4, idx + 1).reduce((acc, curr) => acc + curr.price, 0);
      sma = Number((sum / 5).toFixed(2));
    }
    return {
      ...pt,
      sma,
    };
  });

  const isUp = asset.change >= 0;
  const strokeColor = isUp ? '#089981' : '#F23645';
  const fillColor = isUp ? '#089981' : '#F23645';

  const sharesNum = Math.max(1, parseFloat(sharesInput) || 1);
  const totalTradeCost = sharesNum * asset.lastPrice;

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteTrade(asset.id, tradeType, sharesNum);
    setTradeSuccess(true);
    setTimeout(() => setTradeSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#1A1A1A]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1A1A1A] flex items-center justify-between bg-[#1A1A1A] text-[#FDFCFB]">
          <div className="flex items-center gap-4">
            {/* Badge */}
            <div className="w-10 h-10 bg-[#FDFCFB] text-[#1A1A1A] border border-[#1A1A1A] flex items-center justify-center font-bold text-xs uppercase tracking-widest">
              {asset.badgeNumber || asset.ticker.slice(0, 3)}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif italic text-2xl md:text-3xl font-bold">{asset.name}</h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 border border-[#FDFCFB] bg-transparent">
                  {asset.ticker}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-75">
                {asset.category} &bull; {asset.region} {asset.sector ? `&bull; ${asset.sector}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(asset.id)}
              className="p-2 border border-[#FDFCFB] text-[#FDFCFB] hover:bg-[#FDFCFB] hover:text-[#1A1A1A] transition-colors"
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-[#FDFCFB]' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 border border-[#FDFCFB] text-[#FDFCFB] hover:bg-[#FDFCFB] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Price Bar & Tabs */}
        <div className="px-6 py-3 border-b border-[#1A1A1A] flex flex-wrap items-center justify-between gap-4 bg-[#FDFCFB]">
          <div className="flex items-baseline gap-3">
            <span className="font-mono font-bold text-2xl sm:text-3xl text-[#1A1A1A]">
              ${asset.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`font-mono font-bold text-sm flex items-center gap-1 ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{asset.change.toFixed(2)} ({isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%)
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border border-[#1A1A1A] p-1 bg-[#FDFCFB]">
            <button
              onClick={() => setActiveTab('chart')}
              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'chart' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'text-[#1A1A1A] hover:bg-[#E5E2DD]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Chart
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'text-[#1A1A1A] hover:bg-[#E5E2DD]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Analysis
            </button>

            <button
              onClick={() => setActiveTab('trade')}
              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'trade' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'text-[#1A1A1A] hover:bg-[#E5E2DD]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Paper Trade
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                activeTab === 'news' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'text-[#1A1A1A] hover:bg-[#E5E2DD]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              News
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'chart' && (
            <div className="flex flex-col gap-4">
              {/* Chart Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F0F3FA]/60 p-2.5 rounded-xl border border-[#E0E3EB]">
                {/* Timeframe selector */}
                <div className="flex items-center gap-1">
                  {(['1D', '1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                        timeframe === tf
                          ? 'bg-[#0049db] text-white shadow-2xs'
                          : 'text-[#434656] hover:bg-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Technical Indicator Toggles */}
                <div className="flex items-center gap-3 text-xs text-[#434656]">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={showSma}
                      onChange={(e) => setShowSma(e.target.checked)}
                      className="rounded text-[#0049db] focus:ring-0"
                    />
                    <span>5-SMA Overlay</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={showVolume}
                      onChange={(e) => setShowVolume(e.target.checked)}
                      className="rounded text-[#0049db] focus:ring-0"
                    />
                    <span>Volume Sub-chart</span>
                  </label>
                </div>
              </div>

              {/* Main Technical Price Chart */}
              <div className="h-72 w-full bg-white rounded-xl border border-[#E0E3EB] p-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#6A6D78" fontSize={11} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#6A6D78" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as PricePoint & { sma?: number };
                          return (
                            <div className="bg-[#1a1c1c] text-white text-xs p-2.5 rounded shadow-lg border border-slate-700 font-mono">
                              <div className="text-slate-400 font-semibold mb-1">{data.time}</div>
                              <div className="text-emerald-400">Price: ${data.price.toFixed(2)}</div>
                              {data.sma && <div className="text-amber-400">SMA: ${data.sma.toFixed(2)}</div>}
                              {data.volume && <div className="text-slate-300">Vol: {data.volume.toLocaleString()}</div>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
                    {showSma && <Area type="monotone" dataKey="sma" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Bar Chart Sub-panel */}
              {showVolume && (
                <div className="h-24 w-full bg-white rounded-xl border border-[#E0E3EB] p-2">
                  <div className="text-[10px] font-bold text-[#6A6D78] uppercase px-2 mb-1">Volume History</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[0, 'auto']} />
                      <Bar dataKey="volume" fill="#2962ff" opacity={0.6} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Key Financial Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F0F3FA]/40 p-4 rounded-xl border border-[#E0E3EB]">
                <div>
                  <div className="text-xs text-[#6A6D78]">24h High</div>
                  <div className="font-mono font-bold text-sm text-[#1a1c1c]">${asset.high24h.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs text-[#6A6D78]">24h Low</div>
                  <div className="font-mono font-bold text-sm text-[#1a1c1c]">${asset.low24h.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs text-[#6A6D78]">Market Cap</div>
                  <div className="font-mono font-bold text-sm text-[#1a1c1c]">{asset.marketCap || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs text-[#6A6D78]">24h Volume</div>
                  <div className="font-mono font-bold text-sm text-[#1a1c1c]">{asset.volume}</div>
                </div>
              </div>

              {/* Asset Description */}
              <div className="text-xs text-[#6A6D78] bg-white p-3 rounded-lg border border-[#E0E3EB]">
                <div className="font-semibold text-[#1a1c1c] mb-1">About {asset.name}</div>
                <p>{asset.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="font-headline font-bold text-lg text-[#0049db]">Gemini Market Intelligence Summary</h3>
                </div>

                <div className="space-y-3 text-sm text-[#1a1c1c]">
                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs">
                    <span className="font-bold text-[#0049db]">Technical Trend Signal: </span>
                    <span className={isUp ? 'text-[#089981] font-bold' : 'text-[#F23645] font-bold'}>
                      {isUp ? 'BULLISH MOMENTUM' : 'BEARISH CORRECTION'}
                    </span>
                    <p className="mt-1 text-xs text-[#434656]">
                      {asset.ticker} is trading with {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}% net variance over the last session. Price action is staying {isUp ? 'above' : 'below'} key short-term moving average zones.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-[#1a1c1c] mb-1">Key Support Zone</div>
                      <div className="font-mono text-sm text-[#0049db] font-bold">${(asset.lastPrice * 0.975).toFixed(2)}</div>
                      <div className="text-[#6A6D78] mt-1">Calculated 2.5% downside cushion based on recent volatility.</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-[#1a1c1c] mb-1">Key Resistance Zone</div>
                      <div className="font-mono text-sm text-purple-600 font-bold">${(asset.lastPrice * 1.025).toFixed(2)}</div>
                      <div className="text-[#6A6D78] mt-1">Target upside breakout hurdle for bullish extension.</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestAiSummary(asset)}
                    className="w-full bg-[#0049db] hover:bg-[#003ab3] text-white font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Run Deep AI Sentiment & Valuation Prompt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div className="max-w-md mx-auto bg-white border border-[#E0E3EB] rounded-xl p-5">
              <h3 className="font-headline font-bold text-lg text-[#1a1c1c] mb-1">Virtual Paper Trading</h3>
              <p className="text-xs text-[#6A6D78] mb-4">Simulate buying or selling {asset.ticker} without real risk.</p>

              {tradeSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-[#089981] text-xs font-bold rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Order Executed! Added {sharesNum} shares of {asset.ticker} to portfolio.
                </div>
              )}

              <form onSubmit={handleTradeSubmit} className="space-y-4">
                {/* Buy / Sell Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F3FA] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTradeType('BUY')}
                    className={`py-2 text-xs font-bold rounded-md transition-all ${
                      tradeType === 'BUY' ? 'bg-[#089981] text-white shadow-2xs' : 'text-[#6A6D78]'
                    }`}
                  >
                    BUY {asset.ticker}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeType('SELL')}
                    className={`py-2 text-xs font-bold rounded-md transition-all ${
                      tradeType === 'SELL' ? 'bg-[#F23645] text-white shadow-2xs' : 'text-[#6A6D78]'
                    }`}
                  >
                    SELL {asset.ticker}
                  </button>
                </div>

                {/* Shares Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#434656] mb-1">Number of Shares / Units</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    className="w-full border border-[#E0E3EB] rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-[#0049db]"
                  />
                </div>

                {/* Execution Calculation Summary */}
                <div className="bg-[#F0F3FA] p-3 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#6A6D78]">
                    <span>Market Price per Share</span>
                    <span className="font-mono text-[#1a1c1c]">${asset.lastPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1a1c1c] pt-1 border-t border-[#E0E3EB]">
                    <span>Estimated Total Cost</span>
                    <span className="font-mono text-[#0049db]">${totalTradeCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg text-white font-bold text-sm shadow-2xs transition-opacity ${
                    tradeType === 'BUY' ? 'bg-[#089981] hover:opacity-90' : 'bg-[#F23645] hover:opacity-90'
                  }`}
                >
                  Execute {tradeType} Order
                </button>
              </form>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-3">
              <h3 className="font-headline font-bold text-lg text-[#1a1c1c]">Latest Headlines for {asset.name}</h3>
              {asset.news.map((item) => (
                <div key={item.id} className="p-3.5 bg-white border border-[#E0E3EB] rounded-xl hover:border-[#0049db] transition-colors">
                  <div className="flex items-center justify-between text-xs text-[#6A6D78] mb-1">
                    <span className="font-bold text-[#0049db]">{item.source}</span>
                    <span>{item.timeAgo}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1a1c1c]">{item.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
