export type MarketCategory = 'Indices' | 'Stocks' | 'Crypto' | 'Commodities' | 'Forex' | 'Watchlist';

export type MarketRegion = 'Global' | 'Americas' | 'Europe' | 'Asia-Pacific';

export interface PricePoint {
  time: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface MarketAsset {
  id: string;
  ticker: string;
  name: string;
  category: MarketCategory;
  region: MarketRegion;
  badgeNumber?: string;
  badgeBgColor?: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  marketCap?: string;
  peRatio?: number;
  sector?: string;
  description: string;
  sparkline: number[];
  history1D: PricePoint[];
  history1W: PricePoint[];
  history1M: PricePoint[];
  history1Y: PricePoint[];
  news: NewsArticle[];
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url?: string;
}

export interface PaperTradePosition {
  id: string;
  assetId: string;
  ticker: string;
  name: string;
  type: 'BUY' | 'SELL';
  shares: number;
  buyPrice: number;
  currentPrice: number;
  totalCost: number;
  timestamp: string;
}

export interface MarketAlert {
  id: string;
  assetId: string;
  ticker: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  triggered: boolean;
  createdAt: string;
}
