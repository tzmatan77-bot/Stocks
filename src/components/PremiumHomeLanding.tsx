import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Star,
  LayoutGrid,
  Table as TableIcon,
  BellRing,
  FileText,
  Sliders,
  Info,
  HelpCircle,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { ResearchStock, WatchlistItem } from '../types';
import { SupportedLanguage } from '../i18n';
import { StockLogoBadge } from './StockLogoBadge';
import { DailyMarketRecommendationsCard } from './DailyMarketRecommendationsCard';
import { getOfficialTop30Stocks } from '../data/researchStockGenerator';

interface PremiumHomeLandingProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onNavigateTab: (tabId: string) => void;
  onSearchPrompt: (query: string) => void;
  currentLang: SupportedLanguage;
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number }>;
}

export const PremiumHomeLanding: React.FC<PremiumHomeLandingProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onAddToPortfolio,
  onSelectStock,
  onOpenDeepDive,
  onNavigateTab,
  onSearchPrompt,
  currentLang,
  livePrices,
}) => {
  const isHe = currentLang === 'he';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nasdaq' | 'sp500' | 'tech' | 'non-tech'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAll30, setShowAll30] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const top30List = useMemo(() => {
    const list = getOfficialTop30Stocks();
    if (list && list.length >= 20) return list;
    return stocks.slice(0, 30);
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return top30List.filter((stock) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          stock.ticker.toLowerCase().includes(q) ||
          stock.companyName.toLowerCase().includes(q) ||
          stock.sector.toLowerCase().includes(q) ||
          (stock.hebrewSummary && stock.hebrewSummary.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      if (selectedFilter === 'nasdaq') {
        return stock.exchange.toUpperCase().includes('NASDAQ');
      }
      if (selectedFilter === 'sp500') {
        return stock.exchange.toUpperCase().includes('NYSE') || stock.sector !== 'Semiconductors';
      }
      if (selectedFilter === 'tech') {
        return (
          stock.sector.toLowerCase().includes('tech') ||
          stock.sector.toLowerCase().includes('software') ||
          stock.sector.toLowerCase().includes('semiconductor') ||
          stock.sector.toLowerCase().includes('internet')
        );
      }
      if (selectedFilter === 'non-tech') {
        return !(
          stock.sector.toLowerCase().includes('tech') ||
          stock.sector.toLowerCase().includes('software') ||
          stock.sector.toLowerCase().includes('semiconductor') ||
          stock.sector.toLowerCase().includes('internet')
        );
      }
      return true;
    });
  }, [top30List, searchQuery, selectedFilter]);

  const visibleStocks = useMemo(() => {
    if (searchQuery.trim() || showAll30) return filteredStocks;
    return filteredStocks.slice(0, 10);
  }, [filteredStocks, searchQuery, showAll30]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchPrompt(searchQuery.trim());
      onNavigateTab('top10');
    }
  };

  const isStockInWatchlist = (ticker: string) => watchlist.some((w) => w.ticker === ticker);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 text-slate-100">
      {/* 1. FOCUSED HERO & INSTANT SEARCH */}
      <section className="space-y-5">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
            {isHe
              ? 'סורק S&P 500 ו-NASDAQ — 30 המניות האיכותיות לשנתיים הקרובות'
              : 'S&P 500 & NASDAQ Screener — Top 30 Quality Compounders'}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {isHe
              ? 'דירוג מבוסס חפיר כלכלי, תשואת הון (ROIC) ומחיר לייב. חפש סימול מניה או עבור ישירות לאחד הכלים.'
              : 'Ranked by economic moat, ROIC, and live market pricing. Search any ticker or jump straight to a workspace.'}
          </p>
        </div>

        {/* Search + Quick Workspace Shortcuts */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
            <div className="relative flex items-center bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-cyan-500 rounded-xl p-1 transition">
              <Search className="w-4 h-4 text-slate-400 mx-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isHe
                    ? 'חפש סימול או חברה (לדוגמה: NVDA, MSFT, AAPL, V)...'
                    : 'Search ticker or company (NVDA, MSFT, AAPL, V)...'
                }
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 px-1 py-2 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isHe ? 'חפש' : 'Search'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>

          {/* Compact Quick-Action Links */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('premarket_session')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Sunrise className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? 'טרום-מסחר לייב' : 'Pre-Market'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('afterhours_session')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Sunset className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isHe ? 'לאחר סגירה לייב' : 'After-Hours'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('quarterly')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHe ? 'דוחות רבעוניים (SEC)' : 'Quarterly Reports'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('premarket')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? 'חדשות וניתוח תגובה' : 'Daily News'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHe ? 'התיק שלי' : 'Portfolio'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('top10')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHe ? 'סורק שוק מלא' : 'Screener'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('analyzer')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isHe ? 'אנליסט AI' : 'AI Analyst'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. DAILY NEWS & RECOMMENDATIONS */}
      <section>
        <DailyMarketRecommendationsCard
          stocks={top30List}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
          onAddToPortfolio={onAddToPortfolio}
          onSelectStock={onSelectStock}
          onOpenDeepDive={onOpenDeepDive}
          onNavigatePreMarket={() => onNavigateTab('premarket')}
          livePrices={livePrices}
          currentLang={currentLang}
        />
      </section>

      {/* 3. TOP STOCKS SCREENER (Clean Table Default + Optional Grid) */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isHe ? 'דירוג המניות המובילות' : 'Top Ranked Compounders'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHe
                ? `מציג ${visibleStocks.length} מתוך ${filteredStocks.length} מניות מובילות ב-S&P 500 ו-NASDAQ`
                : `Showing ${visibleStocks.length} of ${filteredStocks.length} top S&P 500 & NASDAQ compounders`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sector/Index Filter */}
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'all', labelHe: 'הכל', labelEn: 'All' },
                { id: 'nasdaq', labelHe: 'NASDAQ', labelEn: 'NASDAQ' },
                { id: 'sp500', labelHe: 'S&P 500', labelEn: 'S&P 500' },
                { id: 'tech', labelHe: 'טכנולוגיה', labelEn: 'Tech' },
                { id: 'non-tech', labelHe: 'בריאות ופיננסים', labelEn: 'Non-Tech' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedFilter === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isHe ? tab.labelHe : tab.labelEn}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'תצוגת טבלה' : 'Table View'}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'תצוגת כרטיסים' : 'Card View'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* A. CLEAN TABLE VIEW (Default) */}
        {viewMode === 'table' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4 text-start">{isHe ? 'מניה' : 'Company'}</th>
                  <th className="py-3 px-4 text-start hidden sm:table-cell">{isHe ? 'מדד' : 'Index'}</th>
                  <th className="py-3 px-4 text-end">{isHe ? 'מחיר לייב' : 'Live Price'}</th>
                  <th className="py-3 px-4 text-center">{isHe ? 'ציון' : 'Score'}</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">ROIC</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">{isHe ? 'צפי 2Y' : '2Y CAGR'}</th>
                  <th className="py-3 px-4 text-start hidden lg:table-cell">{isHe ? 'חפיר כלכלי' : 'Core Moat'}</th>
                  <th className="py-3 px-4 text-center">{isHe ? 'פעולות' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {visibleStocks.map((stock) => {
                  const liveData = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
                  const currentP =
                    liveData && typeof liveData.price === 'number' && !isNaN(liveData.price)
                      ? liveData.price
                      : parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 100;
                  const changePct =
                    liveData && typeof liveData.changePercent === 'number' && !isNaN(liveData.changePercent)
                      ? liveData.changePercent
                      : 0;
                  const isPositive = changePct >= 0;
                  const rank = top30List.findIndex((s) => s.ticker === stock.ticker) + 1;
                  const inWatch = isStockInWatchlist(stock.ticker);

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-400">
                        {rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-white font-mono text-sm">{stock.ticker}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {stock.companyName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell font-mono text-[11px] text-slate-400">
                        {stock.exchange}
                      </td>
                      <td className="py-3 px-4 text-end font-mono tabular-nums">
                        <div className="font-semibold text-white">${currentP.toFixed(2)}</div>
                        <div className={`text-[11px] font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}
                          {changePct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        <span className="font-bold text-cyan-300">{stock.investmentScore}</span>
                        <span className="text-slate-500">/100</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-emerald-400 font-semibold hidden md:table-cell">
                        {stock.financialQuality?.roicCurrent?.value || '28.5%'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-200 font-medium hidden md:table-cell">
                        {stock.expected5YCAGRRange || '15%–18%'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs max-w-xs truncate hidden lg:table-cell">
                        {stock.whyInTopUniverse || stock.moat?.whyExists}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist(stock);
                            }}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              inWatch ? 'text-amber-400' : 'text-slate-500 hover:text-amber-300'
                            }`}
                            title={inWatch ? 'הסר ממעקב' : 'הוסף למעקב'}
                          >
                            <Star className={`w-3.5 h-3.5 ${inWatch ? 'fill-amber-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="px-2.5 py-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-[11px] transition cursor-pointer whitespace-nowrap"
                          >
                            {isHe ? 'פרטים' : 'Details'}
                          </button>
                          <button
                            onClick={() => onOpenDeepDive(stock)}
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition cursor-pointer whitespace-nowrap"
                          >
                            {isHe ? 'תזכיר' : 'Memo'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* B. GRID CARD VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleStocks.map((stock) => {
              const liveData = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
              const currentP =
                liveData && typeof liveData.price === 'number' && !isNaN(liveData.price)
                  ? liveData.price
                  : parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 100;
              const changePct =
                liveData && typeof liveData.changePercent === 'number' && !isNaN(liveData.changePercent)
                  ? liveData.changePercent
                  : 0;
              const isPositive = changePct >= 0;
              const inWatch = isStockInWatchlist(stock.ticker);
              const rank = top30List.findIndex((s) => s.ticker === stock.ticker) + 1;

              return (
                <div
                  key={stock.ticker}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition gap-3"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">
                      #{rank} · {stock.exchange} · {stock.sector}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock);
                      }}
                      className={`p-1 rounded-md transition cursor-pointer ${
                        inWatch ? 'text-amber-400' : 'text-slate-500 hover:text-amber-300'
                      }`}
                      title={inWatch ? 'הסר ממעקב' : 'הוסף למעקב'}
                    >
                      <Star className={`w-4 h-4 ${inWatch ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-base font-mono">{stock.ticker}</div>
                        <div className="text-xs text-slate-400 truncate">{stock.companyName}</div>
                      </div>
                    </div>

                    <div className="text-end font-mono tabular-nums shrink-0">
                      <div className="text-base font-bold text-white">${currentP.toFixed(2)}</div>
                      <div className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}
                        {changePct.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/70 text-xs font-mono tabular-nums">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{isHe ? 'ציון איכות' : 'Score'}</span>
                      <span className="text-cyan-300 font-bold">{stock.investmentScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ROIC</span>
                      <span className="text-emerald-400 font-semibold">
                        {stock.financialQuality?.roicCurrent?.value || '28.5%'}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="text-slate-500 block text-[10px]">{isHe ? 'צפי 2Y' : '2Y CAGR'}</span>
                      <span className="text-white font-semibold">{stock.expected5YCAGRRange || '14%–18%'}</span>
                    </div>
                  </div>

                  {/* Thesis */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {stock.whyInTopUniverse || stock.investmentThesisSummary || stock.moat?.whyExists}
                  </p>

                  {/* Actions */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onSelectStock(stock)}
                      className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{isHe ? 'למה נבחרה?' : 'Details'}</span>
                    </button>
                    <button
                      onClick={() => onOpenDeepDive(stock)}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{isHe ? 'תזכיר מלא' : 'Memo'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show Top 10 vs Show All 30 Toggle */}
        {!searchQuery.trim() && filteredStocks.length > 10 && (
          <div className="flex justify-center pt-1">
            <button
              onClick={() => setShowAll30(!showAll30)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-cyan-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {showAll30
                  ? isHe
                    ? 'הצג 10 מובילות בלבד'
                    : 'Show Top 10 Only'
                  : isHe
                  ? `הצג את כל ${filteredStocks.length} המניות`
                  : `Show All ${filteredStocks.length} Stocks`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAll30 ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </section>

      {/* 4. COLLAPSIBLE INVESTOR GUIDE (Clean & Uncluttered by Default) */}
      <section className="border-t border-slate-800/80 pt-5">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between text-start py-2 text-sm font-medium text-slate-300 hover:text-white transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>{isHe ? 'איך נקבע הדירוג ומהם המדדים במערכת?' : 'How the scoring and core metrics work'}</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
        </button>

        {showGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-white">{isHe ? 'חפיר כלכלי (Moat)' : 'Economic Moat'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHe
                  ? 'יתרון תחרותי שמגן על רווחי החברה לאורך זמן — כמו מותג חזק, פטנטים או עלויות מעבר.'
                  : 'Structural competitive advantage protecting long-term profits.'}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-white">{isHe ? 'תשואת הון (ROIC)' : 'Return on Capital (ROIC)'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHe
                  ? 'כמה רווח החברה מייצרת על כל דולר מושקע בעסק. מעל 15%–20% מעיד על יעילות עילאית.'
                  : 'Profit generated per dollar invested in the business (15%+ indicates elite efficiency).'}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-white">{isHe ? 'הסבר ירידות' : 'Drop Analysis'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHe
                  ? 'בדיקה האם ירידה במחיר היא תנודתיות זמנית או פגיעה ממשית בתזת ההשקעה של החברה.'
                  : 'Distinguishes temporary market noise from fundamental thesis breaks.'}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-bold text-white">{isHe ? 'ציון משוקלל (100)' : 'Composite Score'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHe
                  ? 'שקלול חפיר (30%), איכות פיננסית (20%), צמיחה (20%), תמחור (15%), רווח למניה (10%) והעלאות תחזית (5%).'
                  : 'Weighted across Moat (30%), Financial Quality (20%), Growth (20%), Valuation (15%), EPS (10%), and Revisions (5%).'}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
