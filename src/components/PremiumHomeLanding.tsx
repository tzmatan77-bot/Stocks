import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Shield,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Database,
  Eye,
  FileCheck,
  Zap,
  Layers,
  BarChart3,
  Sliders,
  DollarSign,
  Briefcase,
  ExternalLink,
  ChevronDown,
  Info,
  HelpCircle,
  TrendingDown,
  Compass,
  Star,
  Activity,
  Check,
  ArrowUpRight,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  BellRing
} from 'lucide-react';
import { ResearchStock, WatchlistItem } from '../types';
import { SupportedLanguage, translations } from '../i18n';
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
  livePrices
}) => {
  const isHe = currentLang === 'he';
  const t = translations[currentLang] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nasdaq' | 'sp500' | 'tech' | 'non-tech'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Use the official Top 30 Compounders from the research generator
  const top30List = useMemo(() => {
    const list = getOfficialTop30Stocks();
    if (list && list.length >= 20) return list;
    return stocks.slice(0, 30);
  }, [stocks]);

  // Filtered Top 30 based on user's selection
  const filteredStocks = useMemo(() => {
    return top30List.filter((stock) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          stock.ticker.toLowerCase().includes(q) ||
          stock.companyName.toLowerCase().includes(q) ||
          stock.sector.toLowerCase().includes(q) ||
          (stock.hebrewSummary && stock.hebrewSummary.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Category filter
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchPrompt(searchQuery.trim());
      onNavigateTab('top10');
    }
  };

  const isStockInWatchlist = (ticker: string) => {
    return watchlist.some((w) => w.ticker === ticker);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER: Friendly, Clear, Unified Screener
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-12 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center sm:text-start">
          
          {/* Top announcement badge */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHe ? 'סורק שוק משולב • S&P 500 ו-NASDAQ' : 'Unified Screener • S&P 500 & NASDAQ'}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isHe ? 'דירוג 30 המניות המובילות בלייב' : 'Live Top 30 Stock Ranking'}</span>
            </div>
            <button
              onClick={() => onNavigateTab('premarket')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? 'קדם-מסחר יומי & חדשות עולמיות' : 'Pre-Market & Global News'}</span>
            </button>
          </div>

          {/* Main Title & Clear Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {isHe ? (
                <>
                  סורק שוק S&P 500 ו-NASDAQ: <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                    30 המניות הטובות ביותר לשנתיים הקרובות (FY2)
                  </span>
                </>
              ) : (
                <>
                  S&P 500 & NASDAQ Market Screener: <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
                    Top 30 Compounders for the Next 2 Years
                  </span>
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              {isHe
                ? 'סריקה ודירוג אוטומטי של 30 המניות הטובות ביותר בוול סטריט על פי 30 כללי איכות מוסדיים, חפיר כלכלי, תשואת הון (ROIC) ויעדי תשואה ריאליים לשנתיים קדימה (FY2). כל מניות העילית מדורגות ישירות בסריקה ללא צורך בכפתורים מבלבלים.'
                : 'Automated ranking and screening of the 30 best compounders across S&P 500 and NASDAQ based on our 30 institutional quality rules, durable moats, high ROIC, and 2-year CAGR.'}
            </p>
          </div>

          {/* Fast Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl">
            <div className="relative flex items-center bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-2xl p-1.5 shadow-xl transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 mr-1 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isHe
                    ? 'חפש מניה, סימול (כמו NVDA, MSFT, AAPL, V) או תחום...'
                    : 'Search ticker (NVDA, MSFT, AAPL, V), company or sector...'
                }
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 px-2 py-2 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{isHe ? 'חפש' : 'Search'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          1.5. DAILY MARKET RECOMMENDATIONS & HIGH-CONVICTION PICKS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-6 border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. THE 4 CORE TOOLS: Clear, Visual & Explain What Each Does
      ───────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>{isHe ? '4 הכלים המרכזיים של המערכת' : 'The 4 Core Platform Tools'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHe
                  ? 'לחץ על כל כלי כדי להיכנס אליו ישירות ולקבל את הניתוח המלא:'
                  : 'Click on any tool to navigate directly and explore detailed insights:'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Tool 1: Top 30 Screener */}
            <div
              onClick={() => onNavigateTab('top10')}
              className="bg-slate-900/90 border border-cyan-800/50 hover:border-cyan-400 p-5 rounded-2xl cursor-pointer transition shadow-lg hover:shadow-cyan-500/10 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                    <Award className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    {isHe ? '30 מניות' : 'Top 30'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                  {isHe ? '1. גלאי מניות השוק (Market Screener)' : '1. Market Stock Screener'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHe
                    ? 'הדירוג הרשמי וסריקת מניות העילית האיכותיות ביותר (משילוב נאסד"ק ו-S&P 500) לפי ציון איכות משוקלל.'
                    : 'The official ranking of the 30 highest-quality compounders across S&P 500 and Nasdaq.'}
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>{isHe ? 'פתח גלאי מניות השוק' : 'Open Market Screener'}</span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition ${isHe ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </div>
            </div>

            {/* Tool 2: Pre-Market & News */}
            <div
              onClick={() => onNavigateTab('premarket')}
              className="bg-slate-900/90 border border-amber-800/50 hover:border-amber-400 p-5 rounded-2xl cursor-pointer transition shadow-lg hover:shadow-amber-500/10 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                    <BellRing className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    LIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                  {isHe ? '2. קדם-מסחר & חדשות' : '2. Pre-Market & News'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHe
                    ? 'סריקת מניות לפני פתיחת המסחר, התראות קפיצה וצניחה, המלצות פעולה ומבזקי וול סטריט בזמן אמת.'
                    : 'Pre-market movers, earnings catalysts, sharp drop warnings, and opening bell action plans.'}
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>{isHe ? 'פתח קדם-מסחר' : 'Open Pre-Market'}</span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition ${isHe ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </div>
            </div>

            {/* Tool 3: Deep Dive */}
            <div
              onClick={() => onNavigateTab('top5')}
              className="bg-slate-900/90 border border-emerald-800/50 hover:border-emerald-400 p-5 rounded-2xl cursor-pointer transition shadow-lg hover:shadow-emerald-500/10 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {isHe ? '30 כללים' : 'Deep Dive'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                  {isHe ? '3. תזכיר מחקר מעמיק (Deep Dive)' : '3. Deep Dive Memos'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHe
                    ? 'תזכיר השקעה מפורט לכל חברה: ניתוח חפיר כלכלי, מחירי יעד ותרחישי שווי הוגן.'
                    : 'Institutional research memos: 30 quality rules, moat breakdown, and target valuation scenarios.'}
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>{isHe ? 'קרא תזכירי עומק' : 'Read Memos'}</span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition ${isHe ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </div>
            </div>

            {/* Tool 4: Live AI Analyst & Fall Explainer */}
            <div
              onClick={() => onNavigateTab('analyzer')}
              className="bg-slate-900/90 border border-amber-800/50 hover:border-amber-400 p-5 rounded-2xl cursor-pointer transition shadow-lg hover:shadow-amber-500/10 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {isHe ? 'אנליסט AI' : 'Live AI'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                  {isHe ? '4. אנליסט AI והסבר ירידות' : '4. AI Analyst & Drops'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isHe
                    ? 'שאל כל שאלה – האנליסט יסביר למה מניה ירדה, האם התזה נפגעה ומה דוחות הרווח מראים.'
                    : 'Ask anything – the AI explains price drops, thesis integrity, and quarterly financial reports.'}
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>{isHe ? 'שאל את האנליסט' : 'Ask AI Analyst'}</span>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition ${isHe ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. LIVE TOP 30 RANKED TABLE / CARDS (Main Showcase)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-extrabold text-white">
                {isHe ? 'סריקת שוק: 30 המניות המובילות (S&P 500 ו-NASDAQ)' : 'Market Screener: Top 30 Ranked Compounders'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'המניות האיכותיות ביותר בוול סטריט מדורגות לפי ציון אפיון משוקלל, חפיר כלכלי, תשואת הון ROIC וצפי 2Y CAGR:'
                : 'The highest quality compounders across S&P 500 and NASDAQ ranked by composite quality score, moat durability and 2-year CAGR:'}
            </p>
          </div>

          {/* Controls: Category Filter + View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sector/Index Filter Buttons */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'all' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHe ? 'הכל (30)' : 'All (30)'}
              </button>
              <button
                onClick={() => setSelectedFilter('nasdaq')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'nasdaq' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                NASDAQ
              </button>
              <button
                onClick={() => setSelectedFilter('sp500')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'sp500' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                S&P 500
              </button>
              <button
                onClick={() => setSelectedFilter('tech')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'tech' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHe ? 'טכנולוגיה' : 'Tech'}
              </button>
              <button
                onClick={() => setSelectedFilter('non-tech')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'non-tech' ? 'bg-cyan-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHe ? 'בריאות/פיננסים' : 'Non-Tech'}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'תצוגת כרטיסיות' : 'Grid View'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'תצוגת טבלה' : 'Table View'}
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ─── A. GRID VIEW MODE ─── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStocks.map((stock) => {
              const liveData = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
              const currentP = (liveData && typeof liveData.price === 'number' && !isNaN(liveData.price))
                ? liveData.price
                : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 100);
              const changePct = (liveData && typeof liveData.changePercent === 'number' && !isNaN(liveData.changePercent))
                ? liveData.changePercent
                : 0.45;
              const isPositive = changePct >= 0;
              const inWatch = isStockInWatchlist(stock.ticker);
              const rank = top30List.findIndex((s) => s.ticker === stock.ticker) + 1;

              return (
                <div
                  key={stock.ticker}
                  className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/30 group relative"
                >
                  {/* Top Bar: Rank Number, Exchange Badge, Watchlist toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {/* Rank Number Badge */}
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-950 shadow-md'
                            : rank === 3
                            ? 'bg-amber-700 text-white shadow-md'
                            : 'bg-slate-800 text-cyan-300'
                        }`}
                      >
                        #{rank}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {stock.exchange}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                        {stock.sector}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock);
                      }}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        inWatch
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-amber-300'
                      }`}
                      title={inWatch ? 'הסר ממעקב' : 'הוסף למעקב'}
                    >
                      <Star className={`w-3.5 h-3.5 ${inWatch ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Stock Header: Logo, Name, Ticker, Live Price */}
                  <div className="py-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-lg font-mono">{stock.ticker}</span>
                          <span className="text-xs text-slate-400 truncate max-w-[130px]">
                            {stock.companyName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {isHe ? 'שווי שוק:' : 'Cap:'} {stock.marketCap}
                        </div>
                      </div>
                    </div>

                    {/* Live Price & Day Change */}
                    <div className="text-end font-mono">
                      <div className="text-base font-extrabold text-white flex items-center justify-end gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>${currentP.toFixed(2)}</span>
                      </div>
                      <div
                        className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {changePct.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Compound Quality Score & Key Moat */}
                  <div className="space-y-3 py-3 border-t border-slate-800/80">
                    
                    {/* Quality Score Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono pb-1">
                        <span className="text-slate-400 font-semibold">{isHe ? 'ציון איכות משוקלל:' : 'Quality Score:'}</span>
                        <span className="text-cyan-300 font-black">{stock.investmentScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${stock.investmentScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Metrics: ROIC + 2Y CAGR */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">{isHe ? 'תשואת הון ROIC' : 'ROIC'}</div>
                        <div className="text-emerald-400 font-bold mt-0.5">
                          {stock.financialQuality?.roicCurrent?.value || '28.5%'}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400">{isHe ? 'צפי שנתי 2Y' : '2Y CAGR'}</div>
                        <div className="text-cyan-300 font-bold mt-0.5">
                          {stock.expected5YCAGRRange || '14%–18%'}
                        </div>
                      </div>
                    </div>

                    {/* Why Picked / Core Moat */}
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs">
                      <span className="text-cyan-400 font-bold block mb-0.5">
                        {isHe ? '🛡️ למה המניה נבחרה בסריקה?' : '🛡️ Why Selected in Screener:'}
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                        {stock.whyInTopUniverse || stock.investmentThesisSummary || stock.moat?.whyExists}
                      </p>
                    </div>

                  </div>

                  {/* Actions: "למה נבחרה? (הסבר מלא)" + Deep Dive */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => onSelectStock(stock)}
                      className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{isHe ? 'למה נבחרה? (הסבר מלא)' : 'Why Picked? (Details)'}</span>
                    </button>

                    <button
                      onClick={() => onOpenDeepDive(stock)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                      title={isHe ? 'קרא תזכיר מחקר מעמיק (30 כללים)' : 'Open Deep Dive'}
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

        {/* ─── B. TABLE VIEW MODE ─── */}
        {viewMode === 'table' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px]">
                  <th className="py-3.5 px-4 text-center w-12">{isHe ? 'דירוג' : 'Rank'}</th>
                  <th className="py-3.5 px-4 text-start">{isHe ? 'חברה וסימול' : 'Company'}</th>
                  <th className="py-3.5 px-4 text-start">{isHe ? 'בורסה / מדד' : 'Index'}</th>
                  <th className="py-3.5 px-4 text-end">{isHe ? 'מחיר לייב' : 'Live Price'}</th>
                  <th className="py-3.5 px-4 text-center">{isHe ? 'ציון איכות' : 'Quality Score'}</th>
                  <th className="py-3.5 px-4 text-center">{isHe ? 'תשואת הון ROIC' : 'ROIC'}</th>
                  <th className="py-3.5 px-4 text-center">{isHe ? 'צפי 2Y CAGR' : '2Y CAGR'}</th>
                  <th className="py-3.5 px-4 text-start">{isHe ? 'חפיר כלכלי מרכזי' : 'Core Moat'}</th>
                  <th className="py-3.5 px-4 text-center">{isHe ? 'פעולות' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredStocks.map((stock) => {
                  const liveData = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
                  const currentP = (liveData && typeof liveData.price === 'number' && !isNaN(liveData.price))
                    ? liveData.price
                    : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 100);
                  const changePct = (liveData && typeof liveData.changePercent === 'number' && !isNaN(liveData.changePercent))
                    ? liveData.changePercent
                    : 0.45;
                  const isPositive = changePct >= 0;
                  const rank = top30List.findIndex((s) => s.ticker === stock.ticker) + 1;

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 text-center font-bold text-cyan-400">
                        #{rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="sm" />
                          <div>
                            <div className="font-bold text-white text-sm">{stock.ticker}</div>
                            <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                              {stock.companyName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {stock.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="font-bold text-white">${currentP.toFixed(2)}</div>
                        <div className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}{changePct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          {stock.investmentScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-bold">
                        {stock.financialQuality?.roicCurrent?.value || '28.5%'}
                      </td>
                      <td className="py-3 px-4 text-center text-cyan-300 font-bold">
                        {stock.expected5YCAGRRange || '15%–18%'}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300 text-[11px] max-w-xs truncate">
                        {stock.whyInTopUniverse || stock.moat?.whyExists}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] transition cursor-pointer"
                          >
                            {isHe ? 'למה נבחרה?' : 'Details'}
                          </button>
                          <button
                            onClick={() => onOpenDeepDive(stock)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700 transition cursor-pointer"
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

      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW TO USE & PLAIN-LANGUAGE GLOSSARY (Friendly Explanations)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-900/50 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-white">
              {isHe ? 'מדריך ידידותי: איך המערכת עובדת?' : 'Investor Guide: How It Works'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isHe
                ? 'בלי ז׳רגון מורכב – הנה ההסבר הפשוט לכל המונחים המרכזיים שיעזרו לך להשקיע בביטחון:'
                : 'No complex jargon – plain explanations of core metrics to help you invest with confidence:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Moat */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="text-2xl">🏰</div>
              <h3 className="text-sm font-bold text-white">
                {isHe ? 'מה זה "חפיר כלכלי" (Moat)?' : 'What is an Economic Moat?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHe
                  ? 'יתרון תחרותי חזק שמגן על החברה מתחרים (כמו אפקט רשת, נאמנות מותג, פטנטים או עלויות מעבר גבוהות). חפיר שומר על הרווחים לשנים רבות.'
                  : 'A durable structural advantage (brand, network effects, patents, switching costs) that protects profits from competitors.'}
              </p>
            </div>

            {/* Card 2: ROIC */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="text-2xl">💵</div>
              <h3 className="text-sm font-bold text-white">
                {isHe ? 'מה זה תשואת הון (ROIC)?' : 'What is ROIC?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHe
                  ? 'מדד המודד כמה אגורות של רווח החברה מייצרת על כל שקל שהיא משקיעה בעסק שלה. חברות עם ROIC מעל 15%–20% הן מכונות לייצור עושר.'
                  : 'Return on Invested Capital measures how efficiently a company generates profits from its invested capital (above 15% is elite).'}
              </p>
            </div>

            {/* Card 3: Price Drops */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="text-2xl">📉</div>
              <h3 className="text-sm font-bold text-white">
                {isHe ? 'איך המערכת מסבירה ירידות?' : 'How We Explain Drops?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHe
                  ? 'המערכת בודקת האם הירידה היא רעש זמני בשוק (הזדמנות קנייה) או פגיעה אמיתית בעסקי החברה (שבירת תזה שדורשת זהירות).'
                  : 'We differentiate between temporary market noise (buying opportunities) and structural thesis breaks (time to cut losses).'}
              </p>
            </div>

            {/* Card 4: Score */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2.5">
              <div className="text-2xl">🎯</div>
              <h3 className="text-sm font-bold text-white">
                {isHe ? 'איך נקבע הציון (Score / 100)?' : 'How is Quality Score Calculated?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isHe
                  ? 'שקלול של 30 כללי איכות מוסדיים: חפיר (30%), איכות פיננסית (20%), צמיחה (20%), תמחור (15%), רווח למניה (10%) והעלאות תחזית (5%).'
                  : 'Weighted synthesis of 30 rules: Moat (30%), Financial Quality (20%), Growth (20%), Valuation (15%), Per-Share (10%), Analysts (5%).'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. QUICK AI ANALYST QUESTIONS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI ANALYST READY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isHe ? 'יש לך שאלה ספציפית על מניה או ירידות בשוק?' : 'Have a question about a stock or recent drop?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {isHe
                ? 'שאל את אנליסט ה-AI החי שלנו וקבל תשובה מנומקת מבוססת דוחות SEC, מכפילי שווי וחפיר כלכלי.'
                : 'Ask our live AI Analyst and get an instant, audited response based on SEC filings, valuations and moats.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <button
              onClick={() => {
                onSearchPrompt('למה מניות יורדות והאם זו הזדמנות קנייה?');
                onNavigateTab('analyzer');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              {isHe ? '📉 למה מניות יורדות והאם לקנות?' : '📉 Why do stocks drop?'}
            </button>
            <button
              onClick={() => {
                onSearchPrompt('איזו מניה הכי זולה מבין 30 המובילות בסריקה?');
                onNavigateTab('analyzer');
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition shadow-lg cursor-pointer"
            >
              {isHe ? '🤖 פתח אנליסט AI' : '🤖 Open AI Analyst'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
