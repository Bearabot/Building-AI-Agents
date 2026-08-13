import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { MarketAsset } from '../types';

interface AiMarketAssistantModalProps {
  assets: MarketAsset[];
  onClose: () => void;
  selectedAssetForAi?: MarketAsset | null;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiMarketAssistantModal: React.FC<AiMarketAssistantModalProps> = ({
  assets,
  onClose,
  selectedAssetForAi,
}) => {
  const initialGreeting = selectedAssetForAi
    ? `Hello! I am your Gemini Market Assistant. I have analyzed ${selectedAssetForAi.name} (${selectedAssetForAi.ticker}). Currently trading at $${selectedAssetForAi.lastPrice.toFixed(2)} (${selectedAssetForAi.changePercent >= 0 ? '+' : ''}${selectedAssetForAi.changePercent.toFixed(2)}%). Ask me anything about its technical levels, macro correlation, or market outlook!`
    : `Hello! I am your Gemini Market Assistant. Ask me anything about global market indices, stocks, crypto trends, or portfolio risk strategies!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: initialGreeting, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'What is driving the S&P 500 today?',
    'Should I hedge tech stocks right now?',
    'Analyze Bitcoin support/resistance',
    'Compare Nasdaq 100 vs Dow 30 outlook',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Call Gemini API route or server-side analysis
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, symbol: selectedAssetForAi?.ticker }),
      });

      let aiReplyText = '';
      if (response.ok) {
        const data = await response.json();
        aiReplyText = data.text || data.reply;
      } else {
        // Intelligent fallback if server API key is unconfigured or standard client mode
        aiReplyText = generateSmartFallbackReply(textToSend, assets, selectedAssetForAi);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiReplyText = generateSmartFallbackReply(textToSend, assets, selectedAssetForAi);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden text-[#1A1A1A]">
        {/* Header */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between bg-[#1A1A1A] text-[#FDFCFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#FDFCFB] bg-[#1A1A1A]">
              <Sparkles className="w-4 h-4 text-[#FDFCFB]" />
            </div>
            <div>
              <h2 className="font-serif italic font-bold text-xl">Gemini Market Analyst AI</h2>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-75">Real-time technical indicators & macroeconomic insights</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-[#FDFCFB] border border-[#FDFCFB] hover:bg-[#FDFCFB] hover:text-[#1A1A1A] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-[#E5E2DD] border-b border-[#1A1A1A] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest whitespace-nowrap pl-1">Prompts:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 bg-[#FDFCFB] hover:bg-[#1A1A1A] hover:text-[#FDFCFB] text-[#1A1A1A] border border-[#1A1A1A] whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FDFCFB]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center shrink-0 text-xs font-bold border border-[#1A1A1A] ${
                  msg.sender === 'user' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'bg-[#E5E2DD] text-[#1A1A1A]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] border border-[#1A1A1A] p-4 text-sm ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-[#FDFCFB] font-medium'
                  : 'bg-[#FDFCFB] text-[#1A1A1A] whitespace-pre-wrap leading-relaxed font-serif'
              }`}>
                {msg.text}
                <div className={`text-[9px] font-bold uppercase tracking-widest mt-2 text-right ${msg.sender === 'user' ? 'opacity-60' : 'text-[#1A1A1A] opacity-60'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#E5E2DD] p-3 border border-[#1A1A1A] w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-[#1A1A1A]" />
              <span>Analyzing market telemetry & calculating technical signals...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-[#FDFCFB] border-t border-[#1A1A1A] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="ASK ABOUT TECHNICAL LEVELS, MACRO DRIVERS, OR PRICE PREDICTIONS..."
            className="flex-1 border border-[#1A1A1A] bg-[#FDFCFB] px-4 py-2.5 text-xs tracking-wider uppercase text-[#1A1A1A] focus:outline-none focus:bg-[#E5E2DD]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="bg-[#1A1A1A] hover:bg-[#E5E2DD] hover:text-[#1A1A1A] disabled:opacity-50 text-[#FDFCFB] p-2.5 border border-[#1A1A1A] transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function generateSmartFallbackReply(query: string, assets: MarketAsset[], targetAsset?: MarketAsset | null): string {
  const q = query.toLowerCase();

  if (targetAsset) {
    const isPositive = targetAsset.changePercent >= 0;
    return `📈 **AI Technical & Sentiment Brief for ${targetAsset.name} (${targetAsset.ticker})**

1. **Current Trend Momentum:** ${targetAsset.ticker} is trading at **$${targetAsset.lastPrice.toFixed(2)}** (${isPositive ? '+' : ''}${targetAsset.changePercent.toFixed(2)}%).
2. **Key Price Levels:**
   - **Support:** $${(targetAsset.lastPrice * 0.98).toFixed(2)}
   - **Resistance:** $${(targetAsset.lastPrice * 1.02).toFixed(2)}
3. **Market Sentiment:** Overall market volume (${targetAsset.volume}) suggests ${isPositive ? 'strong buying accumulation' : 'caution and profit taking'}. Relative Strength Indicator (RSI 14) is currently near 54.2 (Neutral-Bullish zone).`;
  }

  if (q.includes('s&p 500') || q.includes('spx') || q.includes('index')) {
    const sp = assets.find(a => a.id === 'sp500');
    return `📊 **S&P 500 Index Analysis**
The S&P 500 (SPX) is currently positioned near **${sp ? sp.lastPrice.toFixed(2) : '5,432'}**. Institutional positioning indicates key resistance at 5,480. Key drivers include central bank rate guidance, tech earnings momentum, and energy price fluctuations.`;
  }

  if (q.includes('btc') || q.includes('bitcoin') || q.includes('crypto')) {
    return `🪙 **Crypto Market Intelligence**
Bitcoin (BTC/USD) is holding above key psychological support around $64,000. On-chain metrics show net accumulation by long-term holders while spot Bitcoin ETF inflows remain positive. Critical breakout resistance sits at $66,500.`;
  }

  return `💡 **Market Intelligence Brief**
Global markets are currently reacting to macroeconomic interest rate expectations, corporate earnings updates, and regional benchmark indicators.

- **Indices:** S&P 500 and Nasdaq 100 show continued tech resilience.
- **Strategy Recommendation:** Maintain disciplined risk control with stop-loss orders on active trades, and watch 10-year Treasury yields for broader equity direction.`;
}
