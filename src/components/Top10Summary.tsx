import React from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { Award, Shield, Zap, DollarSign, AlertCircle, ChevronRight, CheckCircle2, Star, Briefcase } from 'lucide-react';

interface Top10SummaryProps {
  stocks: ResearchStock[];
  watchlist?: WatchlistItem[];
  onToggleWatchlist?: (stock: ResearchStock) => void;
  onAddToPortfolio?: (stock: ResearchStock) => void;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
}

export const Top10Summary: React.FC<Top10SummaryProps> = ({
  stocks,
  watchlist = [],
  onToggleWatchlist,
  onAddToPortfolio,
  livePrices = {},
  onSelectStock,
  onOpenDeepDive,
}) => {
  const top10 = stocks.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">
            #20 TOP 10 — High-Conviction Compounders
          </h2>
          <span className="px-2 py-0.5 text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono">
            Optimized Quality + Growth + Valuation + Risk Matrix
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Strict filtration selecting only businesses where moat durability, high ROIC, and secular organic runway are accompanied by reasonable valuation and low balance sheet risk.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {top10.map((stock, rank) => {
          const isTopCandidate = stock.ticker === 'UNH' || stock.ticker === 'MSFT' || stock.ticker === 'GOOGL';
          const live = livePrices ? (livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()]) : undefined;
          const curPrice = (live && typeof live.price === 'number' && !isNaN(live.price))
            ? live.price
            : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 0);
          const curChg = (live && typeof live.changePercent === 'number' && !isNaN(live.changePercent))
            ? live.changePercent
            : 0;
          const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

          return (
            <div
              key={stock.ticker}
              id={`top10-card-${stock.ticker}`}
              onClick={() => onSelectStock(stock)}
              className={`border rounded-xl p-4 transition cursor-pointer relative overflow-hidden group ${
                isTopCandidate
                  ? 'bg-slate-900/90 border-cyan-800/80 hover:border-cyan-500 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Rank, Ticker, Name, Verdict */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-sm text-cyan-300 flex items-center justify-center">
                    #{rank + 1}
                  </div>
                  <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white group-hover:text-cyan-300 transition">
                        {stock.ticker}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {stock.exchange}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                        {stock.finalVerdict}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate max-w-[160px]">{stock.companyName}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-white">
                    ${curPrice.toFixed(2)}
                  </div>
                  <div className={`text-[10px] font-mono font-semibold ${curChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {curChg >= 0 ? '+' : ''}{curChg.toFixed(2)}%
                  </div>
                  <div className="text-xs font-mono font-extrabold text-cyan-400 mt-0.5">
                    Score: {stock.investmentScore}/100
                  </div>
                </div>
              </div>

              {/* Core 4 Pillars Matrix */}
              <div className="grid grid-cols-4 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-cyan-400" />
                    Moat (30%)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{stock.moatScore}/100</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-emerald-400" />
                    ROIC Quality
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{stock.financialQuality.roicCurrent.value}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <DollarSign className="w-2.5 h-2.5 text-amber-400" />
                    Fwd P/E
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{stock.valuation.forwardPE.value}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                    5Y CAGR
                  </div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{stock.expected5YCAGRRange}</div>
                </div>
              </div>

              {/* Brief Core Thesis Bullet */}
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {stock.whyInTopUniverse}
              </p>

              {/* Card Footer: Risk & Quick Actions */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">Risk:</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                      stock.thesisRisk === 'Low'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-900'
                    }`}
                  >
                    {stock.thesisRisk}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    Moat: <strong className="text-slate-300">{stock.moatTrend}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onToggleWatchlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock);
                      }}
                      className={`p-1 rounded transition ${
                        isWatched
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-slate-800 text-slate-400 hover:text-amber-300'
                      }`}
                      title={isWatched ? 'In Watchlist' : 'Add to Watchlist'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-300' : ''}`} />
                    </button>
                  )}

                  {onAddToPortfolio && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPortfolio(stock);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-cyan-900 text-slate-400 hover:text-cyan-300 transition"
                      title="Add to Portfolio"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDeepDive(stock);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Deep Dive</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

