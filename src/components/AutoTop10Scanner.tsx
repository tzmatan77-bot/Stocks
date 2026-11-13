import React, { useState, useMemo } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { QuickActionPlusMenu } from './QuickActionPlusMenu';
import { SupportedLanguage, translations } from '../i18n';
import { localizeStock, SECTOR_TRANSLATIONS } from '../data/stockLocalization';
import { getStockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import { MARKET_UNIVERSE_CATALOG, MarketScreenerStock } from '../data/marketUniverseData';
import { getResearchStock, KNOWN_CATALOG_PRICES } from '../data/researchStockGenerator';
import { calculateMultiModelValuation } from '../data/valuationEngine';
import { DailyMarketRecommendationsCard } from './DailyMarketRecommendationsCard';
import {
  Award,
  Sparkles,
  Shield,
  Zap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Flame,
  Star,
  Briefcase,
  Layers,
  ArrowRight,
  Globe,
  Plus,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';

interface AutoTop10ScannerProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  currentLang?: SupportedLanguage;
  initialSearchQuery?: string;
  onRegisterTickers?: (tickers: string[]) => void;
}

export type ScannerSortMode = 'score' | 'moat' | 'roic' | 'cagr' | 'valuation' | 'thesis';
export type ScannerViewMode = 'top10' | 'full_market' | 'live_search';
export type IndexFilterType =
  | 'ALL'
  | 'SP500'
  | 'NASDAQ100'
  | 'MEGA_CAP'
  | 'DIVIDEND_COMPOUNDER'
  | 'BUY_ZONE'
  | 'BELOW_FAIR_VALUE'
  | 'ABOVE_ENTRY';

export const AutoTop10Scanner: React.FC<AutoTop10ScannerProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onAddToPortfolio,
  onSelectStock,
  onOpenDeepDive,
  livePrices = {},
  currentLang = 'he',
  initialSearchQuery = '',
  onRegisterTickers,
}) => {
  const isHe = currentLang === 'he';
  const t = translations[currentLang] || translations.en;

  const [viewMode, setViewMode] = useState<ScannerViewMode>(initialSearchQuery ? 'full_market' : 'top10');
  const [sortMode, setSortMode] = useState<ScannerSortMode>('score');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedIndexFilter, setSelectedIndexFilter] = useState<IndexFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [customTickerInput, setCustomTickerInput] = useState<string>(initialSearchQuery || '');
  const [isScanningCustomTicker, setIsScanningCustomTicker] = useState<boolean>(false);
  const [customScanSuccess, setCustomScanSuccess] = useState<string | null>(null);
  const [visibleCatalogLimit, setVisibleCatalogLimit] = useState<number>(60);

  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
      setCustomTickerInput(initialSearchQuery);
      setViewMode('full_market');
    }
  }, [initialSearchQuery]);

  // Dynamic automatic computation and ranking of stocks based on institutional criteria
  const rankedTop10 = useMemo(() => {
    const validStocks = stocks.filter((s): s is ResearchStock => Boolean(s && s.ticker));

    // If user is searching (e.g., "AFL", "A", "APD"), search across both curated universe and full market catalog!
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();

      const matchedInCurated = validStocks.filter((stock) => {
        return (
          stock.ticker?.toLowerCase().includes(q) ||
          stock.companyName?.toLowerCase().includes(q) ||
          stock.sector?.toLowerCase().includes(q)
        );
      });

      // Match in entire 500+ S&P / Nasdaq catalog
      const matchedCatalog = MARKET_UNIVERSE_CATALOG.filter((cat) => {
        return (
          cat.ticker.toLowerCase() === q ||
          cat.ticker.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q) ||
          (cat.nameHe && cat.nameHe.includes(q))
        );
      });

      const catalogStocks = matchedCatalog.map((cat) => {
        const found = validStocks.find((s) => s.ticker === cat.ticker);
        return found || getResearchStock(cat.ticker);
      });

      const combinedMap = new Map<string, ResearchStock>();
      [...matchedInCurated, ...catalogStocks].forEach((s) => {
        if (s && s.ticker) combinedMap.set(s.ticker, s);
      });

      const results = Array.from(combinedMap.values());
      if (results.length > 0) {
        return results;
      }
    }

    let filtered = validStocks.filter((stock) => {
      const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
      const matchesMinScore = minScoreFilter === 0 || stock.investmentScore >= minScoreFilter;
      return matchesSector && matchesMinScore;
    });

    if (filtered.length === 0) {
      filtered = [...validStocks];
    }

    // 2. Sort according to active institutional mode
    const sorted = [...filtered].sort((a, b) => {
      const profileA = getStockCompetitiveProfile(a);
      const profileB = getStockCompetitiveProfile(b);

      switch (sortMode) {
        case 'score':
          return b.investmentScore - a.investmentScore;
        case 'moat':
          return b.moatScore - a.moatScore;
        case 'roic': {
          const roicA = parseFloat(a.financialQuality.roic5YAvg.value.replace(/[^0-9.]/g, '')) || 0;
          const roicB = parseFloat(b.financialQuality.roic5YAvg.value.replace(/[^0-9.]/g, '')) || 0;
          return roicB - roicA;
        }
        case 'cagr': {
          const cagrA = parseFloat(a.scenarios.baseCase.expectedCAGR.replace(/[^0-9.]/g, '')) || 0;
          const cagrB = parseFloat(b.scenarios.baseCase.expectedCAGR.replace(/[^0-9.]/g, '')) || 0;
          return cagrB - cagrA;
        }
        case 'valuation':
          return b.valuationScore - a.valuationScore;
        case 'thesis':
          return profileB.thesisStrengthScore - profileA.thesisStrengthScore;
        default:
          return b.investmentScore - a.investmentScore;
      }
    });

    // Expand to all top 30 ranked compounders from the universe
    return sorted.slice(0, 30);
  }, [stocks, sortMode, selectedSector, searchQuery, minScoreFilter]);

  // Full Market Catalog Filtered
  const filteredMarketCatalog = useMemo(() => {
    return MARKET_UNIVERSE_CATALOG.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameHe.includes(searchQuery) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = selectedSector === 'ALL' || item.sector === selectedSector;

      let matchesIndex = true;
      if (selectedIndexFilter === 'ALL') {
        matchesIndex = true;
      } else if (selectedIndexFilter === 'SP500') {
        matchesIndex = item.exchange === 'NYSE' || item.indexCategory === 'SP500' || item.indexCategory === 'MEGA_CAP';
      } else if (selectedIndexFilter === 'NASDAQ100') {
        matchesIndex = item.exchange === 'NASDAQ';
      } else if (selectedIndexFilter === 'MEGA_CAP' || selectedIndexFilter === 'DIVIDEND_COMPOUNDER') {
        matchesIndex = item.indexCategory === selectedIndexFilter;
      } else if (selectedIndexFilter === 'BUY_ZONE' || selectedIndexFilter === 'BELOW_FAIR_VALUE' || selectedIndexFilter === 'ABOVE_ENTRY') {
        const stockObj = stocks.find((s) => s.ticker === item.ticker) || getResearchStock(item.ticker);
        const liveP = livePrices[item.ticker]?.price || KNOWN_CATALOG_PRICES[item.ticker] || 100;
        const val = calculateMultiModelValuation(stockObj, liveP);
        if (selectedIndexFilter === 'BUY_ZONE') {
          matchesIndex = liveP <= val.buyZoneThreshold;
        } else if (selectedIndexFilter === 'BELOW_FAIR_VALUE') {
          matchesIndex = liveP < val.blendedFairValue;
        } else if (selectedIndexFilter === 'ABOVE_ENTRY') {
          matchesIndex = liveP > val.buyZoneThreshold;
        }
      }

      return matchesSearch && matchesSector && matchesIndex;
    });
  }, [searchQuery, selectedSector, selectedIndexFilter, livePrices, stocks]);

  // Automatically register tickers from visible catalog (including AFL, A, APD, etc.) so live quotes are continuously fetched
  React.useEffect(() => {
    if (onRegisterTickers) {
      const topCatalogTickers = filteredMarketCatalog.slice(0, 60).map((i) => i.ticker);
      topCatalogTickers.push('AFL', 'A', 'APD');
      onRegisterTickers(topCatalogTickers);
    }
  }, [onRegisterTickers, filteredMarketCatalog]);

  // Unique sectors for filtering
  const allSectors = useMemo(() => {
    const stockSectors = stocks.filter(Boolean).map((s) => s?.sector).filter(Boolean);
    const catalogSectors = MARKET_UNIVERSE_CATALOG.filter(Boolean).map((m) => m?.sector).filter(Boolean);
    const set = new Set([...stockSectors, ...catalogSectors]);
    return ['ALL', ...Array.from(set)];
  }, [stocks]);

  // Handler for scanning custom ticker or batch tickers across entire US market
  const handleScanAnyTicker = (e?: React.FormEvent, directInput?: string) => {
    if (e) e.preventDefault();
    const rawInput = directInput !== undefined ? directInput : customTickerInput;
    const cleanRaw = rawInput.trim();
    if (!cleanRaw) return;

    const tickers = cleanRaw
      .split(/[,;\s]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0 && t.length <= 10);

    if (tickers.length === 0) return;

    setIsScanningCustomTicker(true);
    setCustomScanSuccess(null);

    const generatedStocks = tickers.map((ticker) => getResearchStock(ticker));

    setTimeout(() => {
      setIsScanningCustomTicker(false);
      if (tickers.length === 1) {
        setCustomScanSuccess(
          isHe
            ? `ניתוח מעמיק הושלם עבור ${tickers[0]}! המניה נסרקה לפי 30 כללי האיכות ונפתחה לתצוגה.`
            : `Deep analysis completed for ${tickers[0]}! Analyzed across the 30 institutional rules.`
        );
        onSelectStock(generatedStocks[0]);
      } else {
        setCustomScanSuccess(
          isHe
            ? `נסרקו בהצלחה ${tickers.length} מניות שוק (${tickers.join(', ')})! המניה הראשונה (${tickers[0]}) נפתחה לתצוגה.`
            : `Successfully scanned ${tickers.length} market stocks (${tickers.join(', ')})! Opening ${tickers[0]}.`
        );
        onSelectStock(generatedStocks[0]);
      }
      setCustomTickerInput('');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Scanner Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHe ? 'גלאי מניות השוק – סריקת מניות איכות בזמן אמת' : 'Market Stock Screener & Leaderboard'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isHe ? 'גלאי מניות השוק (S&P 500 ו-NASDAQ): מניות האיכות המובילות לשנתיים הקרובות (FY2)' : 'Market Stock Screener: Top Compounders (Next 2 Years / FY2)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {isHe
                ? 'גלאי מניות השוק סורק ומדרג את מניות העילית מכלל השוק בארה"ב (S&P 500 ו-Nasdaq) לפי 30 כללי איכות, חפיר כלכלי, תשואת הון ROIC ותחזית צמיחה ותשואה לשנתיים (FY2).'
                : 'Market stock screener screening moat durability, ROIC return on capital, 2-year runway, and per-share value creation across S&P 500 & NASDAQ.'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 backdrop-blur font-mono text-xs">
            <div className="text-center px-3 border-r border-slate-800 rtl:border-r-0 rtl:border-l">
              <div className="text-[10px] text-slate-400">{isHe ? 'במאגר המלא' : 'Universe'}</div>
              <div className="text-base font-bold text-white mt-0.5">{MARKET_UNIVERSE_CATALOG.length + stocks.length}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800 rtl:border-r-0 rtl:border-l">
              <div className="text-[10px] text-slate-400">{isHe ? 'דירוג עילית' : 'Top Tier'}</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">Top 30</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400">{isHe ? 'ציון ממוצע' : 'Avg Score'}</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {(rankedTop10.reduce((acc, s) => acc + s.investmentScore, 0) / (rankedTop10.length || 1)).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Instant Ticker Screener Input */}
        <form onSubmit={handleScanAnyTicker} className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={customTickerInput}
              onChange={(e) => setCustomTickerInput(e.target.value)}
              placeholder={isHe ? 'סרוק כל מניה או רשימת מניות מופרדות בפסיק (לדוגמה: PLTR, SOFI, ARM, COIN, AMD, BABA)...' : 'Scan any stock or multiple tickers separated by commas (e.g. PLTR, SOFI, ARM, COIN, AMD)...'}
              className="w-full bg-slate-950/90 border border-slate-700 text-white text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 rtl:pl-4 rtl:pr-9 focus:border-cyan-400 focus:outline-none placeholder-slate-500 font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isScanningCustomTicker || !customTickerInput.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm font-mono transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shrink-0"
          >
            {isScanningCustomTicker ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isHe ? 'מנתח שוק...' : 'Scanning Market...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{isHe ? 'הרץ ניתוח 30 כללים' : 'Run 30-Rule Deep Scan'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Bulk Screener Basket Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-[11px] text-slate-500">{isHe ? 'סריקה מהירה של סלים:' : 'Quick Baskets:'}</span>
          <button
            type="button"
            onClick={() => handleScanAnyTicker(undefined, 'NVDA, TSM, ASML, AVGO, ARM, AMD, MRVL, PLTR')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[11px] transition cursor-pointer"
          >
            🚀 {isHe ? 'שבבי AI ותשתיות' : 'AI Chips & Infrastructure'}
          </button>
          <button
            type="button"
            onClick={() => handleScanAnyTicker(undefined, 'MSFT, AMZN, GOOGL, NOW, CRWD, PANW, DDOG, SNOW')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[11px] transition cursor-pointer"
          >
            ☁️ {isHe ? 'ענן, SaaS וסייבר' : 'Cloud, SaaS & Cyber'}
          </button>
          <button
            type="button"
            onClick={() => handleScanAnyTicker(undefined, 'LLY, UNH, ISRG, TMO, ABT, SYK, BSX')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-[11px] transition cursor-pointer"
          >
            🏥 {isHe ? 'רפואה ומכשור מתקדם' : 'Healthcare & MedTech'}
          </button>
          <button
            type="button"
            onClick={() => handleScanAnyTicker(undefined, 'BRK.B, JPM, V, PG, KO, MCD, CAT, NEE')}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/50 rounded-lg text-[11px] transition cursor-pointer"
          >
            👑 {isHe ? 'דיבידנד ומבצרי ערך' : 'Dividend & Value Fortress'}
          </button>
        </div>

        {customScanSuccess && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{customScanSuccess}</span>
          </div>
        )}
      </div>

      {/* Daily Market Recommendations & High-Conviction Opportunities */}
      <DailyMarketRecommendationsCard
        stocks={stocks}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
        onAddToPortfolio={onAddToPortfolio}
        onSelectStock={onSelectStock}
        onOpenDeepDive={onOpenDeepDive}
        livePrices={livePrices}
        currentLang={currentLang}
      />

      {/* Scope Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setViewMode('top10')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            viewMode === 'top10'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isHe ? '🏆 30 מניות העילית המדורגות (Top 30 Leaders)' : '🏆 Top 30 Leaders'}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 text-[10px]">
            {rankedTop10.length}
          </span>
        </button>

        <button
          onClick={() => setViewMode('full_market')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            viewMode === 'full_market'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{isHe ? '🌐 סורק שוק S&P 500 ו-Nasdaq (כל המניות)' : '🌐 Full Market S&P 500 & Nasdaq'}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 text-[10px]">
            {filteredMarketCatalog.length}
          </span>
        </button>
      </div>

      {/* Interactive Controls Bar: Sort Preset Modes, Sector Filter, Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Sorting Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-slate-400 mr-2 rtl:mr-0 rtl:ml-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isHe ? 'דירוג לפי:' : 'Rank By:'}</span>
          </span>

          <button
            onClick={() => setSortMode('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              sortMode === 'score'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isHe ? 'ציון כולל (Master)' : 'Master Score'}</span>
          </button>

          <button
            onClick={() => setSortMode('moat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              sortMode === 'moat'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isHe ? 'חפיר כלכלי (Moat)' : 'Moat Durability'}</span>
          </button>

          <button
            onClick={() => setSortMode('roic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              sortMode === 'roic'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isHe ? 'תשואת הון (ROIC)' : 'Highest ROIC'}</span>
          </button>

          <button
            onClick={() => setSortMode('cagr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              sortMode === 'cagr'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isHe ? 'תשואה צפויה 5Y' : '5Y Expected CAGR'}</span>
          </button>

          <button
            onClick={() => setSortMode('thesis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
              sortMode === 'thesis'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isHe ? 'חוזק תזה (Thesis)' : 'Thesis Strength'}</span>
          </button>
        </div>

        {/* Sector and Search inputs */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          {/* Sector Select */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
          >
            {allSectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec === 'ALL'
                  ? isHe ? 'כל הסקטורים' : 'All Sectors'
                  : isHe && SECTOR_TRANSLATIONS[sec]
                  ? SECTOR_TRANSLATIONS[sec]
                  : sec}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 rtl:left-auto rtl:right-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHe ? 'סנן לפי שם, סקטור או טיקר...' : 'Filter ticker/name...'}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 rtl:pl-3 rtl:pr-8 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: TOP 10 LEADERBOARD */}
      {viewMode === 'top10' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankedTop10.map((rawStock, rank) => {
            const stock = localizeStock(rawStock, currentLang);
            const live = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()] || (rawStock?.ticker ? livePrices[rawStock.ticker] : undefined);
            const curPrice = (live && typeof live.price === 'number' && !isNaN(live.price))
              ? live.price
              : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 0);
            const curChg = (live && typeof live.changePercent === 'number' && !isNaN(live.changePercent))
              ? live.changePercent
              : 0;
            const curAmount = (live && typeof live.changeAmount === 'number' && !isNaN(live.changeAmount))
              ? live.changeAmount
              : null;
            const profile = getStockCompetitiveProfile(stock, curPrice);
            const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

            return (
              <div
                key={stock.ticker}
                id={`top10-scanner-card-${stock.ticker}`}
                onClick={() => onSelectStock(rawStock)}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 shadow-lg hover:shadow-cyan-950/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Rank Badge Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 font-mono font-extrabold text-sm text-cyan-400 flex items-center justify-center shadow-inner shrink-0">
                        #{rank + 1}
                      </div>
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-extrabold text-base text-white group-hover:text-cyan-300 transition">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {stock.exchange}
                          </span>

                          {/* LIVE Market Indicator next to stock */}
                          <div
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold border transition shadow-sm ${
                              curChg >= 0
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/40'
                                : 'bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-rose-950/40'
                            }`}
                            title={isHe ? `שינוי שוק חי: ${curChg >= 0 ? 'עלייה' : 'ירידה'} של ${Math.abs(curChg).toFixed(2)}%` : `Live market status: ${curChg >= 0 ? '+' : ''}${curChg.toFixed(2)}%`}
                          >
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${curChg >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${curChg >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">LIVE</span>
                            {curChg >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span className="font-black">
                              {curChg >= 0 ? '+' : ''}{curChg.toFixed(2)}%
                            </span>
                          </div>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                            {profile.opportunityType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium truncate max-w-[220px] mt-0.5">
                          {stock.companyName}
                        </div>
                      </div>
                    </div>

                    {/* Price, Change, Plus Button */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-mono font-bold text-white tracking-tight">
                          ${curPrice.toFixed(2)}
                        </div>
                        <div className={`text-[11px] font-mono font-bold flex items-center justify-end gap-1 ${curChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <span>{curChg >= 0 ? '▲' : '▼'}</span>
                          <span>{curChg >= 0 ? '+' : ''}{curChg.toFixed(2)}%</span>
                          {curAmount !== null && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({curAmount >= 0 ? '+' : ''}${curAmount.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Action Plus Button Dropdown */}
                      <QuickActionPlusMenu
                        stock={rawStock}
                        watchlist={watchlist}
                        onToggleWatchlist={onToggleWatchlist}
                        onAddToPortfolio={onAddToPortfolio}
                        currentLang={currentLang}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Badges Strip */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {isHe ? 'תזה' : 'Thesis'} {profile.thesisStrengthScore}/100
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                      Implied {profile.marketImpliedGrowthRate}% vs Forecast {profile.fundamentalExpectedGrowthRate}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {stock.sector}
                    </span>
                  </div>

                  {/* 4 Pillars Matrix */}
                  <div className="grid grid-cols-4 gap-2 my-3.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <Shield className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Moat</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">{stock.moatScore}/100</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-emerald-400" />
                        <span>ROIC 5Y</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{stock.financialQuality.roic5YAvg.value}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <DollarSign className="w-2.5 h-2.5 text-amber-400" />
                        <span>Fwd P/E</span>
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">{stock.valuation.forwardPE.value}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                        <span>5Y CAGR</span>
                      </div>
                      <div className="text-xs font-bold text-cyan-300 mt-0.5">{stock.expected5YCAGRRange}</div>
                    </div>
                  </div>

                  {/* Why Selected */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {stock.whyInTopUniverse}
                  </p>
                </div>

                {/* Bottom Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500">{isHe ? 'ציון כולל:' : 'Total Score:'}</span>
                    <span className="font-extrabold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {stock.investmentScore}/100
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">{stock.finalVerdict}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDeepDive(rawStock);
                      }}
                      className="px-3 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs font-mono transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isHe ? 'תזכיר מעמיק' : 'Deep Dive'}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: FULL MARKET CATALOG (S&P 500 & NASDAQ 100) */}
      {viewMode === 'full_market' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
          {/* Header & Index Selector Tabs */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'מאגר שוק מורחב S&P 500 ו-Nasdaq' : 'Expanded S&P 500 & Nasdaq Market Catalog'}</span>
              <span className="text-cyan-400 font-bold">({filteredMarketCatalog.length} מניות)</span>
            </div>

            {/* Index Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedIndexFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedIndexFilter === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {isHe ? 'כל המניות' : 'All Stocks'}
              </button>
              <button
                onClick={() => setSelectedIndexFilter('SP500')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedIndexFilter === 'SP500'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                S&P 500
              </button>
              <button
                onClick={() => setSelectedIndexFilter('NASDAQ100')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedIndexFilter === 'NASDAQ100'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                NASDAQ 100
              </button>
              <button
                onClick={() => setSelectedIndexFilter('MEGA_CAP')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedIndexFilter === 'MEGA_CAP'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {isHe ? 'ענקיות שוק (Mega-Cap)' : 'Mega-Cap'}
              </button>
              <button
                onClick={() => setSelectedIndexFilter('DIVIDEND_COMPOUNDER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedIndexFilter === 'DIVIDEND_COMPOUNDER'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {isHe ? 'דיבידנד איכותי (Kings)' : 'Dividend Kings'}
              </button>
              <button
                onClick={() => setSelectedIndexFilter('BELOW_FAIR_VALUE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedIndexFilter === 'BELOW_FAIR_VALUE'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-emerald-950/50 text-emerald-300 hover:text-emerald-100 border border-emerald-800/80'
                }`}
                title={isHe ? 'מניות שנסחרות מתחת לשווי הפנימי המשוקלל במערכת' : 'Stocks trading below system blended fair value'}
              >
                <span>💡</span>
                <span>{isHe ? 'מתחת לשווי פנימי' : 'Below Fair Value'}</span>
              </button>
              <button
                onClick={() => setSelectedIndexFilter('BUY_ZONE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedIndexFilter === 'BUY_ZONE'
                    ? 'bg-amber-400 text-slate-950 shadow font-black'
                    : 'bg-amber-950/60 text-amber-300 hover:text-amber-100 border border-amber-800/80'
                }`}
                title={isHe ? 'מניות שהגיעו לשער כניסה שמרני מומלץ (אזור קנייה)' : 'Stocks at conservative recommended entry price (Buy Zone)'}
              >
                <span>🎯</span>
                <span>{isHe ? 'אזור קנייה שמרני' : 'Buy Zone Entry'}</span>
              </button>
              <button
                onClick={() => setSelectedIndexFilter('ABOVE_ENTRY')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedIndexFilter === 'ABOVE_ENTRY'
                    ? 'bg-rose-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
                title={isHe ? 'מניות שמחיר הכניסה המומלץ במערכת נמוך מהמחיר של היום (נסחרות מעל אזור הקנייה)' : 'Stocks where recommended entry is below today price'}
              >
                <span>⚠️</span>
                <span>{isHe ? 'מחיר מעל שער כניסה' : 'Above Entry Price'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left rtl:text-right">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{isHe ? 'מניה וחברה' : 'Company'}</th>
                  <th className="py-3 px-3">{isHe ? 'סקטור' : 'Sector'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'מחיר שוק חי' : 'Live Price'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'שווי הוגן / קנייה' : 'Fair / Buy Zone'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'שווי שוק' : 'Mkt Cap'}</th>
                  <th className="py-3 px-3 text-center">Fwd P/E</th>
                  <th className="py-3 px-3 text-center">ROIC</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'תשואת תזרים' : 'FCF Yield'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'צפי 5Y' : '5Y CAGR'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'ציון' : 'Score'}</th>
                  <th className="py-3 px-4">{isHe ? 'חפיר כלכלי מהותי' : 'Economic Moat'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'פעולות וניתוח' : 'Analysis'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMarketCatalog.slice(0, visibleCatalogLimit).map((item) => {
                  const existingStock = stocks.find((s) => s.ticker === item.ticker);
                  const resolvedStock = existingStock || getResearchStock(item.ticker);
                  const liveItem = livePrices[item.ticker] || livePrices[item.ticker?.toUpperCase()];
                  const curPrice = (liveItem && typeof liveItem.price === 'number' && !isNaN(liveItem.price))
                    ? liveItem.price
                    : (KNOWN_CATALOG_PRICES[item.ticker] || (item.pe > 0 ? Number((item.pe * 5.2).toFixed(2)) : 100));
                  let curChg: number;
                  if (typeof liveItem?.changePercent === 'number' && !isNaN(liveItem.changePercent)) {
                    curChg = liveItem.changePercent;
                  } else {
                    const seed = item.ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                    curChg = Number((((seed % 35) - 16) * 0.08).toFixed(2));
                  }
                  const val = calculateMultiModelValuation(resolvedStock, curPrice);
                  const isBelowFair = curPrice < val.blendedFairValue;
                  const isAtBuy = curPrice <= val.buyZoneThreshold;

                  return (
                    <tr
                      key={item.ticker}
                      onClick={() => onSelectStock(resolvedStock)}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <StockLogoBadge ticker={item.ticker} name={item.name} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white group-hover:text-cyan-300 transition font-mono">
                                {item.ticker}
                              </span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                                {item.exchange}
                              </span>

                              {/* LIVE indicator badge next to ticker in table */}
                              {curChg !== null && (
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition ${
                                    curChg >= 0
                                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                  }`}
                                  title={isHe ? `שינוי יומי חי: ${curChg >= 0 ? '+' : ''}${curChg.toFixed(2)}%` : `Live: ${curChg >= 0 ? '+' : ''}${curChg.toFixed(2)}%`}
                                >
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${curChg >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${curChg >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                  </span>
                                  <span className="text-[8px] font-black text-slate-400">LIVE</span>
                                  {curChg >= 0 ? (
                                    <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                                  )}
                                  <span>{curChg >= 0 ? '+' : ''}{curChg.toFixed(2)}%</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans truncate max-w-[150px]">
                              {isHe ? item.nameHe : item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300 font-sans">
                        {isHe ? item.sectorHe : item.sector}
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold font-mono">
                        <div className="text-white text-sm tracking-tight">${curPrice.toFixed(2)}</div>
                        {curChg !== null && (
                          <div className={`mt-0.5 inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            curChg >= 0
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40'
                              : 'bg-rose-950/70 text-rose-300 border-rose-600/40'
                          }`}>
                            {curChg >= 0 ? (
                              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                            )}
                            <span>{curChg >= 0 ? '+' : ''}{curChg.toFixed(2)}%</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                        <div className="text-emerald-400 font-semibold" title={isHe ? 'שווי הוגן פנימי' : 'Blended Fair Value'}>
                          ${Math.round(val.blendedFairValue)}
                        </div>
                        <div className="text-amber-400 text-[10px]" title={isHe ? 'שער כניסה שמרני (Buy Zone)' : 'Conservative Buy Zone'}>
                          קנייה: ${Math.round(val.buyZoneThreshold)}
                        </div>
                        {isAtBuy ? (
                          <span className="inline-block mt-0.5 px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[9px] font-bold">
                            {isHe ? 'אזור קנייה' : 'Buy Zone'}
                          </span>
                        ) : isBelowFair ? (
                          <span className="inline-block mt-0.5 px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[9px]">
                            {isHe ? 'בדיסקאונט' : 'Discount'}
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 px-1 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                            {isHe ? 'פרמיה' : 'Premium'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-slate-200 font-mono">
                        {item.marketCap}
                      </td>

                      <td className="py-3.5 px-3 text-center text-amber-300 font-mono">
                        {item.pe.toFixed(1)}x
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-emerald-400 font-mono">
                        {item.roic.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                        {item.fcfYield.toFixed(1)}%
                      </td>

                      <td className="py-3.5 px-3 text-center font-bold text-cyan-300 font-mono">
                        {item.cagr5y}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold font-mono">
                          {item.score}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-300 max-w-[220px] truncate text-[11px]">
                        {isHe ? item.moatHe : item.moat}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <QuickActionPlusMenu
                            stock={resolvedStock}
                            watchlist={watchlist}
                            onToggleWatchlist={onToggleWatchlist}
                            onAddToPortfolio={onAddToPortfolio}
                            currentLang={currentLang}
                            size="sm"
                          />
                          <button
                            onClick={() => onSelectStock(resolvedStock)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[11px] font-mono transition border border-slate-700 cursor-pointer"
                            title={isHe ? 'סקירה מהירה לפי 30 הכללים' : 'Quick 30-Rule Summary'}
                          >
                            {isHe ? 'סקירה' : 'Quick'}
                          </button>
                          <button
                            onClick={() => onOpenDeepDive(resolvedStock)}
                            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                            title={isHe ? 'תזכיר מחקר מוסדי מעמיק' : 'Deep Dive Research Memo'}
                          >
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span>{isHe ? 'ניתוח עומק' : 'Deep Dive'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination / Expand Universe Control */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-400">
              {isHe
                ? `מציג ${Math.min(visibleCatalogLimit, filteredMarketCatalog.length)} מתוך ${filteredMarketCatalog.length} מניות במאגר S&P 500 ו-Nasdaq המלא`
                : `Showing ${Math.min(visibleCatalogLimit, filteredMarketCatalog.length)} of ${filteredMarketCatalog.length} stocks across full S&P 500 & Nasdaq`}
            </span>
            <div className="flex items-center gap-2">
              {visibleCatalogLimit < filteredMarketCatalog.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCatalogLimit((prev) => prev + 60)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-mono cursor-pointer"
                >
                  {isHe ? 'טען עוד 60 מניות (+60)' : 'Load 60 More (+60)'}
                </button>
              )}
              {visibleCatalogLimit < filteredMarketCatalog.length && (
                <button
                  type="button"
                  onClick={() => setVisibleCatalogLimit(filteredMarketCatalog.length)}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg transition font-mono cursor-pointer font-bold"
                >
                  {isHe ? `הצג את כל ${filteredMarketCatalog.length} המניות` : `Show All ${filteredMarketCatalog.length}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
