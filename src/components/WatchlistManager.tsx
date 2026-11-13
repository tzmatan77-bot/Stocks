import React, { useState, useEffect, useMemo } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { MARKET_UNIVERSE_CATALOG } from '../data/marketUniverseData';
import { getResearchStock, resolveTickerSymbol } from '../data/researchStockGenerator';
import { SupportedLanguage } from '../i18n';
import {
  Bookmark,
  Star,
  PlusCircle,
  Trash2,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Edit2,
  Check,
  Search,
  BarChart2,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal
} from 'lucide-react';

interface WatchlistManagerProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  onToggleWatchlist: (stock: ResearchStock) => void;
  onUpdateWatchlistItem: (item: WatchlistItem) => void;
  onRemoveFromWatchlist: (ticker: string) => void;
  onAddFromWatchlistToPortfolio: (stock: ResearchStock, buyPrice: number, shares: number) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onSelectStock?: (stock: ResearchStock) => void;
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number; timestamp?: number }>;
  currentLang?: SupportedLanguage;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onUpdateWatchlistItem,
  onRemoveFromWatchlist,
  onAddFromWatchlistToPortfolio,
  onOpenDeepDive,
  onSelectStock,
  livePrices,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTrigger, setFilterTrigger] = useState<'ALL' | 'TRIGGER_HIT' | 'STRONG_MOAT'>('ALL');
  const [sortOption, setSortOption] = useState<
    'CHANGE_DESC' | 'CHANGE_ASC' | 'PRICE_DESC' | 'PRICE_ASC' | 'SCORE_DESC' | 'TARGET_GAP_ASC' | 'TICKER_ASC' | 'DEFAULT'
  >('CHANGE_DESC');

  // Combined stock lookup universe for watchlist selection
  const allAvailableStocks = useMemo(() => {
    const list: Array<{ ticker: string; name: string; score?: number }> = [];
    const seen = new Set<string>();

    // 1. Top research stocks
    stocks.forEach((s) => {
      if (s?.ticker && !seen.has(s.ticker.toUpperCase())) {
        seen.add(s.ticker.toUpperCase());
        list.push({
          ticker: s.ticker.toUpperCase(),
          name: s.companyName,
          score: s.investmentScore,
        });
      }
    });

    // 2. Full market catalog stocks
    MARKET_UNIVERSE_CATALOG.forEach((m) => {
      if (m?.ticker && !seen.has(m.ticker.toUpperCase())) {
        seen.add(m.ticker.toUpperCase());
        list.push({
          ticker: m.ticker.toUpperCase(),
          name: m.nameHe ? `${m.name} (${m.nameHe})` : m.name,
          score: m.score,
        });
      }
    });

    return list;
  }, [stocks]);

  const [selectedTickerToAdd, setSelectedTickerToAdd] = useState<string>(() => {
    const candidate = stocks.find(
      (s) => !watchlist.some((w) => w.ticker.toUpperCase() === s.ticker.toUpperCase())
    )?.ticker;
    return candidate || 'MNST';
  });
  const [customTickerInput, setCustomTickerInput] = useState<string>('');
  const [targetBuyPriceInput, setTargetBuyPriceInput] = useState<string>('');
  const [targetPEInput, setTargetPEInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  // Quick Portfolio Buy Modal
  const [portfolioModalStock, setPortfolioModalStock] = useState<ResearchStock | null>(null);
  const [buyShares, setBuyShares] = useState<number>(20);
  const [buyPrice, setBuyPrice] = useState<number>(100);

  // Edit Watchlist Item state
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState<number>(0);
  const [editTargetPE, setEditTargetPE] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Resolve research stock object
  const resolveStock = (ticker: string): ResearchStock => {
    const found = stocks.find((s) => s.ticker.toUpperCase() === ticker.toUpperCase());
    if (found) return found;
    return getResearchStock(ticker);
  };

  const getCurrentPrice = (ticker: string, fallbackStr?: string): number => {
    const cleanT = (ticker || '').toUpperCase();
    const live = livePrices[cleanT] || livePrices[ticker];
    if (live && typeof live.price === 'number' && !isNaN(live.price)) {
      return live.price;
    }
    const clean = parseFloat(String(fallbackStr || '').replace(/[^0-9.]/g, ''));
    return isNaN(clean) ? 100 : clean;
  };

  const getLiveChange = (ticker: string) => {
    const cleanT = (ticker || '').toUpperCase();
    const live = livePrices[cleanT] || livePrices[ticker];
    return {
      price: typeof live?.price === 'number' && !isNaN(live.price) ? live.price : 0,
      changePercent: typeof live?.changePercent === 'number' && !isNaN(live.changePercent) ? live.changePercent : 0,
      changeAmount: typeof live?.changeAmount === 'number' && !isNaN(live.changeAmount) ? live.changeAmount : 0,
    };
  };

  const handleOpenStockDetail = (ticker: string) => {
    const resolved = resolveStock(ticker);
    if (onSelectStock) {
      onSelectStock(resolved);
    } else {
      onOpenDeepDive(resolved);
    }
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = (customTickerInput.trim() || selectedTickerToAdd).trim();
    const cleanTicker = resolveTickerSymbol(rawInput);
    if (!cleanTicker) return;

    const matchedResearch = resolveStock(cleanTicker);
    const companyName = matchedResearch.companyName || `${cleanTicker} Corporation`;

    const newItem: WatchlistItem = {
      ticker: cleanTicker,
      companyName: companyName,
      addedAt: new Date().toISOString().slice(0, 10),
      targetBuyPrice: targetBuyPriceInput ? parseFloat(targetBuyPriceInput) : undefined,
      targetPE: targetPEInput ? parseFloat(targetPEInput) : undefined,
      alertOnThesisBreak: true,
      notes: notesInput.trim() || matchedResearch.whyInTopUniverse || 'Target compounder candidate',
    };

    onUpdateWatchlistItem(newItem);
    setCustomTickerInput('');
    setTargetBuyPriceInput('');
    setTargetPEInput('');
    setNotesInput('');
  };

  const handleStartEdit = (item: WatchlistItem) => {
    setEditingTicker(item.ticker);
    setEditTargetPrice(item.targetBuyPrice || 0);
    setEditTargetPE(item.targetPE || 0);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = (ticker: string) => {
    const existing = watchlist.find((w) => w.ticker === ticker);
    if (!existing) return;

    onUpdateWatchlistItem({
      ...existing,
      targetBuyPrice: editTargetPrice > 0 ? editTargetPrice : undefined,
      targetPE: editTargetPE > 0 ? editTargetPE : undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditingTicker(null);
  };

  const handleOpenPortfolioModal = (stock: ResearchStock) => {
    const cp = getCurrentPrice(stock.ticker, stock.currentPrice);
    setPortfolioModalStock(stock);
    setBuyPrice(cp);
    setBuyShares(20);
  };

  const handleConfirmPortfolioBuy = () => {
    if (!portfolioModalStock || buyShares <= 0 || buyPrice <= 0) return;
    onAddFromWatchlistToPortfolio(portfolioModalStock, buyPrice, buyShares);
    setPortfolioModalStock(null);
  };

  // Count alerts triggered
  let targetTriggeredCount = 0;
  watchlist.forEach((w) => {
    const st = resolveStock(w.ticker);
    const cp = getCurrentPrice(w.ticker, st?.currentPrice || '$0');
    if (w.targetBuyPrice && cp <= w.targetBuyPrice) {
      targetTriggeredCount++;
    }
  });

  // Filter, Search & Sort Watchlist items
  const filteredWatchlist = useMemo(() => {
    const filtered = watchlist.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.ticker.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (filterTrigger === 'TRIGGER_HIT') {
        const st = resolveStock(item.ticker);
        const cp = getCurrentPrice(item.ticker, st.currentPrice);
        return item.targetBuyPrice && cp <= item.targetBuyPrice;
      }

      if (filterTrigger === 'STRONG_MOAT') {
        const st = resolveStock(item.ticker);
        return (st.investmentScore || 0) >= 90;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const stockA = resolveStock(a.ticker);
      const stockB = resolveStock(b.ticker);
      const priceA = getCurrentPrice(a.ticker, stockA?.currentPrice || '$0');
      const priceB = getCurrentPrice(b.ticker, stockB?.currentPrice || '$0');
      const chgA = livePrices[a.ticker]?.changePercent ?? 0;
      const chgB = livePrices[b.ticker]?.changePercent ?? 0;

      switch (sortOption) {
        case 'CHANGE_DESC':
          return chgB - chgA; // שינוי יומי מהגבוה לנמוך (עליות בראש)
        case 'CHANGE_ASC':
          return chgA - chgB; // שינוי יומי מהנמוך לגבוה (ירידות בראש)
        case 'PRICE_DESC':
          return priceB - priceA;
        case 'PRICE_ASC':
          return priceA - priceB;
        case 'SCORE_DESC':
          return (stockB?.investmentScore || 90) - (stockA?.investmentScore || 90);
        case 'TARGET_GAP_ASC': {
          const diffA = a.targetBuyPrice ? (priceA - a.targetBuyPrice) / a.targetBuyPrice : 999;
          const diffB = b.targetBuyPrice ? (priceB - b.targetBuyPrice) / b.targetBuyPrice : 999;
          return diffA - diffB;
        }
        case 'TICKER_ASC':
          return a.ticker.localeCompare(b.ticker);
        case 'DEFAULT':
        default:
          return 0;
      }
    });
  }, [watchlist, searchQuery, filterTrigger, livePrices, sortOption]);

  const handleScrollToStock = (ticker: string) => {
    const el = document.getElementById(`watchlist-card-${ticker}`) || document.getElementById(`watchlist-row-${ticker}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-cyan-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-cyan-400');
      }, 2000);
    } else {
      handleOpenStockDetail(ticker);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{isHe ? 'רשימת מעקב חיה • ציטוטים וגרפים בזמן אמת' : 'LIVE WATCHLIST & REAL-TIME STREAMING'}</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHe ? `נשמר אוטומטית בדפדפן (${watchlist.length} מניות במעקב)` : `Auto-saved in browser (${watchlist.length} stocks)`}</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-cyan-400" />
              <span>{isHe ? 'מעקב מניות, שינוי יומי בלייב וגרפים אינטראקטיביים' : 'Monitored Compounders, Live Daily Change & Interactive Charts'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {isHe
                ? 'לחץ על כל מניה לפתיחת הגרף החי (Google Finance), הערכת השווי הפנימי (DCF), מרווח הביטחון ותקציר התזה המלא. מחירי המניות והשינוי היומי מתעדכנים בלייב.'
                : 'Click on any stock to open its live interactive chart, intrinsic DCF valuation, margin of safety and full investment thesis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Target Trigger Counter (Clickable Toggle Filter) */}
            <button
              onClick={() => setFilterTrigger(filterTrigger === 'TRIGGER_HIT' ? 'ALL' : 'TRIGGER_HIT')}
              className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 font-mono text-xs shadow-inner transition cursor-pointer select-none ${
                filterTrigger === 'TRIGGER_HIT'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/40'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/60 hover:bg-slate-900 hover:text-white'
              }`}
              title={
                isHe
                  ? filterTrigger === 'TRIGGER_HIT'
                    ? 'לחץ כדי להציג את כל המניות'
                    : 'לחץ כדי לסנן ולהציג רק מניות שהופעלה בהן התראת יעד'
                  : 'Click to filter and view only stocks where target alert was triggered'
              }
            >
              <Bell className={`w-4 h-4 ${filterTrigger === 'TRIGGER_HIT' ? 'text-amber-300 animate-pulse' : 'text-amber-400'}`} />
              <span className="font-semibold">{isHe ? 'התראות יעד שהופעלו:' : 'Target Triggers Met:'}</span>
              <strong className="text-emerald-400 text-sm font-black px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {targetTriggeredCount}
              </strong>
              {filterTrigger === 'TRIGGER_HIT' ? (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded ml-1 rtl:ml-0 rtl:mr-1">
                  {isHe ? 'מסנן פעיל ✓' : 'FILTER ACTIVE'}
                </span>
              ) : (
                <span className="text-[10px] text-amber-400/80 bg-amber-950/40 px-1 py-0.5 rounded ml-1 rtl:ml-0 rtl:mr-1">
                  {isHe ? 'סנן' : 'Filter'}
                </span>
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'תצוגת כרטיסים אינטראקטיביים' : 'Interactive Cards View'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isHe ? 'כרטיסים' : 'Cards'}</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'תצוגת טבלה מוסדית' : 'Institutional Table View'}
              >
                <List className="w-3.5 h-3.5" />
                <span>{isHe ? 'טבלה' : 'Table'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Stock to Watchlist Bar */}
      <form
        onSubmit={handleAddStock}
        className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-end gap-3 text-xs font-mono shadow-sm"
      >
        <div className="flex-1 w-full md:w-auto">
          <label className="text-slate-400 block mb-1 font-semibold">{isHe ? 'בחר מניה מהקטלוג:' : 'Select Ticker to Watch:'}</label>
          <select
            value={selectedTickerToAdd}
            onChange={(e) => {
              setSelectedTickerToAdd(e.target.value);
              setCustomTickerInput('');
              const st = stocks.find((s) => s.ticker === e.target.value);
              if (st) {
                const cp = getCurrentPrice(st.ticker, st.currentPrice);
                setTargetBuyPriceInput((cp * 0.9).toFixed(2));
              } else {
                const live = livePrices[e.target.value]?.price;
                if (live) setTargetBuyPriceInput((live * 0.9).toFixed(2));
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {allAvailableStocks.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} — {s.name} {s.score ? `(${s.score}/100)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-44">
          <label className="text-slate-400 block mb-1 font-semibold">{isHe ? 'או הקלד טיקר חופשי:' : 'Or Custom Ticker:'}</label>
          <input
            type="text"
            placeholder="למשל MNST, AAPL"
            value={customTickerInput}
            onChange={(e) => setCustomTickerInput(e.target.value.toUpperCase())}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 uppercase"
          />
        </div>

        <div className="w-full md:w-32">
          <label className="text-slate-400 block mb-1 font-semibold">{isHe ? 'מחיר יעד קנייה ($):' : 'Target Buy ($):'}</label>
          <input
            type="number"
            step="any"
            placeholder="למשל 450.00"
            value={targetBuyPriceInput}
            onChange={(e) => setTargetBuyPriceInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="w-full md:w-28">
          <label className="text-slate-400 block mb-1 font-semibold">{isHe ? 'מכפיל יעד P/E:' : 'Target P/E:'}</label>
          <input
            type="number"
            step="any"
            placeholder="למשל 25.0"
            value={targetPEInput}
            onChange={(e) => setTargetPEInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex-1 w-full md:w-auto">
          <label className="text-slate-400 block mb-1 font-semibold">{isHe ? 'הערת תזה אישית:' : 'Thesis Note:'}</label>
          <input
            type="text"
            placeholder={isHe ? 'למשל: רכישה בירידות תחת מכפיל 25' : 'e.g. Accumulate on pullbacks'}
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 shadow-md"
        >
          <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
          <span>{isHe ? 'הוסף למעקב' : 'Add to Watchlist'}</span>
        </button>
      </form>

      {/* ─────────────────────────────────────────────────────────────
          LIVE WATCHLIST TICKER BAR & SORTING CONTROLS (סרגל מניות במעקב ומיון)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-mono font-extrabold text-white flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'סרגל מניות במעקב בלייב' : 'Live Watchlist Ticker Bar'}</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 text-cyan-300 border border-slate-800 font-semibold flex items-center gap-1">
              <span>{isHe ? 'סדר נוכחי:' : 'Order:'}</span>
              <strong className={sortOption === 'CHANGE_DESC' ? 'text-emerald-400' : sortOption === 'CHANGE_ASC' ? 'text-rose-400' : 'text-cyan-400'}>
                {sortOption === 'CHANGE_DESC'
                  ? (isHe ? 'שינוי יומי (גבוה ← נמוך 🟢)' : 'Day Gainers First 🟢')
                  : sortOption === 'CHANGE_ASC'
                  ? (isHe ? 'שינוי יומי (נמוך ← גבוה 🔴)' : 'Day Dips First 🔴')
                  : sortOption === 'PRICE_DESC'
                  ? (isHe ? 'מחיר (גבוה ← נמוך)' : 'Price High to Low')
                  : sortOption === 'PRICE_ASC'
                  ? (isHe ? 'מחיר (נמוך ← גבוה)' : 'Price Low to High')
                  : sortOption === 'TARGET_GAP_ASC'
                  ? (isHe ? 'קרובות למחיר יעד 🎯' : 'Closest to Target 🎯')
                  : sortOption === 'SCORE_DESC'
                  ? (isHe ? 'ציון איכות 🏆' : 'Quality Score 🏆')
                  : (isHe ? 'סדר ברירת מחדל ⏱️' : 'Default ⏱️')}
              </strong>
            </span>
          </div>

          {/* Quick Sort Action Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 text-[11px] font-semibold hidden md:inline">
              {isHe ? 'שנה סרגל לפי:' : 'Sort Bar By:'}
            </span>
            <button
              type="button"
              onClick={() => setSortOption('CHANGE_DESC')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                sortOption === 'CHANGE_DESC'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/50'
              }`}
              title={isHe ? 'מיין את הסרגל מהשינוי היומי הגבוה ביותר לנמוך (+% יורד)' : 'Sort highest daily gainers to lowest'}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHe ? 'שינוי יומי: גבוה ← נמוך' : 'Day: High → Low'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSortOption('CHANGE_ASC')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                sortOption === 'CHANGE_ASC'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-rose-500/50'
              }`}
              title={isHe ? 'מיין את הסרגל מהשינוי היומי הנמוך לגבוה (ירידות בראש)' : 'Sort lowest daily change / dips first'}
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>{isHe ? 'שינוי יומי: נמוך ← גבוה' : 'Day: Low → High'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSortOption('TARGET_GAP_ASC')}
              className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                sortOption === 'TARGET_GAP_ASC'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
              title={isHe ? 'מיין לפי מניות הקרובות ביותר למחיר היעד שהגדרת' : 'Sort by closest to target price'}
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? 'קרובות ליעד' : 'Target'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSortOption(sortOption === 'PRICE_DESC' ? 'PRICE_ASC' : 'PRICE_DESC')}
              className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                sortOption === 'PRICE_DESC' || sortOption === 'PRICE_ASC'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
              title={isHe ? 'מיין לפי מחיר מניה' : 'Sort by stock price'}
            >
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>{sortOption === 'PRICE_ASC' ? (isHe ? 'מחיר: עולה' : 'Price: Asc') : (isHe ? 'מחיר: יורד' : 'Price: Desc')}</span>
            </button>

            {sortOption !== 'DEFAULT' && (
              <button
                type="button"
                onClick={() => setSortOption('DEFAULT')}
                className="px-2 py-1.5 rounded-xl text-[10px] text-slate-500 hover:text-slate-300 bg-slate-950 border border-slate-800 transition cursor-pointer"
                title={isHe ? 'אפס לסדר הוספה מקורי' : 'Reset to default addition order'}
              >
                {isHe ? 'איפוס' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Horizontal Ticker Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto py-1.5 no-scrollbar scroll-smooth">
          {filteredWatchlist.length === 0 ? (
            <div className="text-xs text-slate-500 py-2 font-mono">
              {isHe ? 'אין מניות ברשימת המעקב התואמות את הסינון' : 'No matching stocks in watchlist'}
            </div>
          ) : (
            filteredWatchlist.map((item, idx) => {
              const stock = resolveStock(item.ticker);
              const curPrice = getCurrentPrice(item.ticker, stock?.currentPrice);
              const liveChange = getLiveChange(item.ticker);
              const isPos = liveChange.changePercent >= 0;

              return (
                <button
                  key={item.ticker}
                  type="button"
                  onClick={() => handleScrollToStock(item.ticker)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer shrink-0 font-mono text-xs select-none ${
                    isPos
                      ? 'bg-slate-950/90 hover:bg-emerald-950/40 border-slate-800 hover:border-emerald-500/60 shadow-sm'
                      : 'bg-slate-950/90 hover:bg-rose-950/40 border-slate-800 hover:border-rose-500/60 shadow-sm'
                  }`}
                  title={isHe ? `לחץ לאיתור כרטיס ${item.ticker} ופתיחת גרף חי` : `Click to locate ${item.ticker}`}
                >
                  <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                  <StockLogoBadge ticker={item.ticker} name={item.companyName} size="xs" />
                  <span className="font-bold text-white text-sm">{item.ticker}</span>
                  <span className="text-slate-300 font-semibold">${curPrice.toFixed(1)}</span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isPos
                        ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-800/50'
                        : 'text-rose-400 bg-rose-950/70 border border-rose-800/50'
                    }`}
                  >
                    {isPos ? '+' : ''}{liveChange.changePercent.toFixed(2)}%
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isHe ? 'חפש מניה במעקב לפי טיקר, שם או הערה...' : 'Search watchlist by ticker, company name, note...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">{isHe ? 'מיון:' : 'Sort:'}</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="CHANGE_DESC" className="bg-slate-900 text-emerald-400">
                {isHe ? 'שינוי יומי: מהגבוה לנמוך (עליות בראש 🟢)' : 'Day Change: High to Low (Gainers)'}
              </option>
              <option value="CHANGE_ASC" className="bg-slate-900 text-rose-400">
                {isHe ? 'שינוי יומי: מהנמוך לגבוה (ירידות בראש 🔴)' : 'Day Change: Low to High (Dips)'}
              </option>
              <option value="PRICE_DESC" className="bg-slate-900 text-slate-200">
                {isHe ? 'מחיר שוק: מהגבוה לנמוך' : 'Stock Price: High to Low'}
              </option>
              <option value="PRICE_ASC" className="bg-slate-900 text-slate-200">
                {isHe ? 'מחיר שוק: מהנמוך לגבוה' : 'Stock Price: Low to High'}
              </option>
              <option value="TARGET_GAP_ASC" className="bg-slate-900 text-amber-300">
                {isHe ? 'קרובות למחיר יעד קנייה 🎯' : 'Closest to Target Buy Price'}
              </option>
              <option value="SCORE_DESC" className="bg-slate-900 text-slate-200">
                {isHe ? 'ציון איכות (Score 90+)' : 'Quality Score (High to Low)'}
              </option>
              <option value="TICKER_ASC" className="bg-slate-900 text-slate-200">
                {isHe ? 'לפי טיקר (A-Z)' : 'Ticker (A-Z)'}
              </option>
              <option value="DEFAULT" className="bg-slate-900 text-slate-200">
                {isHe ? 'סדר הוספה מקורי ⏱️' : 'Original Addition Order'}
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFilterTrigger('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTrigger === 'ALL' ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHe ? `הכל (${watchlist.length})` : `All (${watchlist.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterTrigger('TRIGGER_HIT')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTrigger === 'TRIGGER_HIT' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHe ? `טריגר קנייה שהופעל (${targetTriggeredCount})` : `Target Hit (${targetTriggeredCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterTrigger('STRONG_MOAT')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTrigger === 'STRONG_MOAT' ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHe ? 'ציון 90+' : 'Score 90+'}
          </button>
        </div>
      </div>

      {/* Active Trigger Filter Notice Banner */}
      {filterTrigger === 'TRIGGER_HIT' && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2 text-amber-300">
            <Bell className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>
              {isHe
                ? `מסנן פעיל: מציג ${filteredWatchlist.length} מניות שהגיעו למחיר היעד שהגדרת (מחיר שוק נוכחי נמוך או שווה למחיר היעד).`
                : `Filter Active: Showing ${filteredWatchlist.length} stocks that hit their target buy price.`}
            </span>
          </div>
          <button
            onClick={() => setFilterTrigger('ALL')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer whitespace-nowrap"
          >
            {isHe ? 'נקה סינון (הצג הכל)' : 'Clear Filter (Show All)'}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: INTERACTIVE CARDS VIEW (RICH CARDS WITH GRAPH & SUMMARY)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWatchlist.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <Star className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
              <h4 className="text-base font-bold text-slate-300">
                {isHe ? 'אין מניות תואמות ברשימת המעקב' : 'No matching stocks in watchlist'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {isHe
                  ? 'הוסף מניה חדשה בטופס שלמעלה או לחץ על סמל הכוכב/סימניה בכל כרטיס מניה במערכת כדי להתחיל מעקב.'
                  : 'Add a stock above or click the star icon on any stock card to start watching.'}
              </p>
            </div>
          ) : (
            filteredWatchlist.map((item) => {
              const stock = resolveStock(item.ticker);
              const curPrice = getCurrentPrice(item.ticker, stock.currentPrice);
              const liveChange = getLiveChange(item.ticker);
              const isPositive = liveChange.changePercent >= 0;
              const isEditing = editingTicker === item.ticker;

              const targetPrice = item.targetBuyPrice;
              const isTargetHit = targetPrice && curPrice <= targetPrice;
              const discountToTarget = targetPrice ? ((curPrice - targetPrice) / curPrice) * 100 : null;

              return (
                <div
                  key={item.ticker}
                  id={`watchlist-card-${item.ticker}`}
                  className={`bg-slate-900/90 hover:bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group ${
                    isTargetHit
                      ? 'border-emerald-500/80 shadow-emerald-950/20'
                      : 'border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Card Top: Logo, Ticker, Live Price & Live Daily Change */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => handleOpenStockDetail(item.ticker)}
                        className="flex items-center gap-3 cursor-pointer group/title"
                      >
                        <StockLogoBadge ticker={item.ticker} name={item.companyName} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold font-mono text-white group-hover/title:text-cyan-300 transition">
                              {item.ticker}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {stock.sector || 'US Equity'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-medium line-clamp-1 max-w-[150px]">
                            {item.companyName}
                          </div>
                        </div>
                      </div>

                      {/* Live Price & Day Change */}
                      <div className="text-right font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live quote active" />
                          <span className="text-base font-extrabold text-white">
                            ${curPrice.toFixed(2)}
                          </span>
                        </div>
                        <div
                          className={`text-xs font-bold flex items-center justify-end gap-0.5 mt-0.5 ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>
                            {isPositive ? '+' : ''}
                            {liveChange.changePercent.toFixed(2)}%
                          </span>
                          {typeof liveChange.changeAmount === 'number' && liveChange.changeAmount !== 0 && (
                            <span className="text-[10px] opacity-75">
                              ({isPositive ? '+' : ''}${liveChange.changeAmount.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Target Buy Alert Badge */}
                    {isTargetHit ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 flex items-center justify-between text-xs font-mono font-bold animate-pulse">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{isHe ? 'מחיר יעד קנייה הושג!' : 'BUY TARGET HIT!'}</span>
                        </div>
                        <span>${curPrice.toFixed(2)} ≤ ${typeof targetPrice === 'number' ? targetPrice.toFixed(2) : targetPrice}</span>
                      </div>
                    ) : discountToTarget !== null ? (
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between text-slate-400">
                        <span>{isHe ? 'יעד קנייה:' : 'Target Buy:'} <strong className="text-slate-200">${typeof targetPrice === 'number' ? targetPrice.toFixed(2) : targetPrice}</strong></span>
                        <span className={discountToTarget > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                          {discountToTarget > 0 ? `+${discountToTarget.toFixed(1)}% ${isHe ? 'מעל היעד' : 'above'}` : `${discountToTarget.toFixed(1)}% ${isHe ? 'תחת היעד' : 'below'}`}
                        </span>
                      </div>
                    ) : null}

                    {/* Key Metric Badges Strip */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-center">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">{isHe ? 'ציון איכות' : 'Score'}</span>
                        <span className="font-bold text-amber-300">{stock.investmentScore || 90}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">{isHe ? 'תשואת הון' : 'ROIC'}</span>
                        <span className="font-bold text-emerald-400">{stock.financialQuality?.roic5YAvg?.value || '22%'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">{isHe ? 'צפי 5Y' : '5Y CAGR'}</span>
                        <span className="font-bold text-cyan-300">{stock.scenarios?.baseCase?.expectedCAGR || '13.5%'}</span>
                      </div>
                    </div>

                    {/* Thesis & Custom Notes */}
                    <div className="space-y-1 text-xs">
                      {isEditing ? (
                        <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-amber-500/80">
                          <div>
                            <label className="text-[10px] text-slate-400 block font-mono">ערוך מחיר יעד ($):</label>
                            <input
                              type="number"
                              step="any"
                              value={editTargetPrice}
                              onChange={(e) => setEditTargetPrice(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block font-mono">הערת תזה:</label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingTicker(null)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs cursor-pointer"
                            >
                              ביטול
                            </button>
                            <button
                              onClick={() => handleSaveEdit(item.ticker)}
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                            >
                              שמור שינוי
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-slate-300 leading-relaxed">
                          <span className="text-[10px] font-mono text-cyan-400 block font-semibold mb-0.5">
                            {isHe ? 'תמצית תזת השקעה:' : 'Investment Thesis Summary:'}
                          </span>
                          <p className="line-clamp-2 text-xs">
                            {item.notes || stock.whyInTopUniverse || 'High-quality compounding franchise with durable competitive advantage.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    {/* PRIMARY ACTION: OPEN LIVE CHART & SUMMARY */}
                    <button
                      onClick={() => handleOpenStockDetail(item.ticker)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-700/80 text-cyan-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group-hover:border-cyan-400"
                      title={isHe ? 'פתח גרף חי מפורט, הערכת DCF וסיכום מלא' : 'Open Live Chart & Full Summary'}
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isHe ? 'פתח גרף וסיכום' : 'Live Chart & Summary'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenPortfolioModal(stock)}
                        className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950 hover:border-emerald-700 hover:text-emerald-300 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title={isHe ? 'קנה מניה לתיק ההשקעות' : 'Buy for Portfolio'}
                      >
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isHe ? 'קנה לתיק' : 'Buy'}</span>
                      </button>

                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                          title={isHe ? 'ערוך מחיר יעד והערות' : 'Edit Target Price'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onRemoveFromWatchlist(item.ticker)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 hover:border-rose-800 text-slate-400 border border-slate-700 transition cursor-pointer"
                        title={isHe ? 'הסר מרשימת המעקב' : 'Remove from Watchlist'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: INSTITUTIONAL TABLE VIEW
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900 shadow">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                {isHe ? `מניות במעקב פעיל (${filteredWatchlist.length})` : `Monitored Universe (${filteredWatchlist.length})`}
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isHe ? 'ציטוטי מחיר חיים מוזנים בזמן אמת' : 'Real-time Streaming Quotes'}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                  <th
                    onClick={() => setSortOption(sortOption === 'TICKER_ASC' ? 'DEFAULT' : 'TICKER_ASC')}
                    className="py-3 px-3 text-left rtl:text-right cursor-pointer hover:text-white transition select-none"
                    title={isHe ? 'לחץ למיון לפי טיקר/שם' : 'Click to sort by ticker/name'}
                  >
                    <div className="flex items-center gap-1">
                      <span>{isHe ? 'חברה / טיקר' : 'Company / Ticker'}</span>
                      {sortOption === 'TICKER_ASC' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />}
                    </div>
                  </th>
                  <th
                    onClick={() => setSortOption(sortOption === 'SCORE_DESC' ? 'DEFAULT' : 'SCORE_DESC')}
                    className="py-3 px-3 text-center cursor-pointer hover:text-white transition select-none"
                    title={isHe ? 'לחץ למיון לפי ציון איכות' : 'Click to sort by score'}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{isHe ? 'ציון איכות' : 'Score'}</span>
                      {sortOption === 'SCORE_DESC' ? <ArrowDown className="w-3 h-3 text-amber-400" /> : <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />}
                    </div>
                  </th>
                  <th
                    onClick={() => setSortOption(sortOption === 'PRICE_DESC' ? 'PRICE_ASC' : 'PRICE_DESC')}
                    className="py-3 px-3 text-right rtl:text-left cursor-pointer hover:text-white transition select-none"
                    title={isHe ? 'לחץ למיון לפי מחיר' : 'Click to sort by price'}
                  >
                    <div className="flex items-center justify-end rtl:justify-start gap-1">
                      <span>{isHe ? 'מחיר לייב' : 'Live Price'}</span>
                      {sortOption === 'PRICE_DESC' ? (
                        <ArrowDown className="w-3 h-3 text-cyan-400" />
                      ) : sortOption === 'PRICE_ASC' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => setSortOption(sortOption === 'CHANGE_DESC' ? 'CHANGE_ASC' : 'CHANGE_DESC')}
                    className="py-3 px-3 text-right rtl:text-left cursor-pointer hover:text-white transition select-none bg-slate-900/60"
                    title={isHe ? 'לחץ לשינוי סדר: שינוי יומי מהגבוה לנמוך או מהנמוך לגבוה' : 'Click to toggle daily change sort'}
                  >
                    <div className="flex items-center justify-end rtl:justify-start gap-1 font-bold">
                      <span className={sortOption === 'CHANGE_DESC' || sortOption === 'CHANGE_ASC' ? 'text-cyan-300 underline' : ''}>
                        {isHe ? 'שינוי יומי' : 'Day Chg'}
                      </span>
                      {sortOption === 'CHANGE_DESC' ? (
                        <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                      ) : sortOption === 'CHANGE_ASC' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => setSortOption(sortOption === 'TARGET_GAP_ASC' ? 'DEFAULT' : 'TARGET_GAP_ASC')}
                    className="py-3 px-3 text-right rtl:text-left cursor-pointer hover:text-white transition select-none"
                    title={isHe ? 'לחץ למיון לפי מרחק מיעד קנייה' : 'Click to sort by target buy gap'}
                  >
                    <div className="flex items-center justify-end rtl:justify-start gap-1">
                      <span>{isHe ? 'יעד קנייה ($)' : 'Target Buy ($)'}</span>
                      {sortOption === 'TARGET_GAP_ASC' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">{isHe ? 'סטטוס טריגר' : 'Trigger Status'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'צפי 5Y' : '5Y CAGR'}</th>
                  <th className="py-3 px-3 text-left rtl:text-right">{isHe ? 'תקציר תזה' : 'Thesis Notes'}</th>
                  <th className="py-3 px-3 text-center">{isHe ? 'פעולות וגרף' : 'Actions & Chart'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWatchlist.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                      {isHe ? 'אין מניות להצגה ברשימת המעקב.' : 'No stocks in watchlist.'}
                    </td>
                  </tr>
                ) : (
                  filteredWatchlist.map((item) => {
                    const stock = resolveStock(item.ticker);
                    const curPrice = getCurrentPrice(item.ticker, stock?.currentPrice);
                    const liveChange = getLiveChange(item.ticker);
                    const isPositive = liveChange.changePercent >= 0;
                    const isEditing = editingTicker === item.ticker;

                    const targetPrice = item.targetBuyPrice;
                    const isTargetHit = targetPrice && curPrice <= targetPrice;
                    const discountToTarget = targetPrice ? ((curPrice - targetPrice) / curPrice) * 100 : null;

                    return (
                      <tr
                        key={item.ticker}
                        id={`watchlist-row-${item.ticker}`}
                        className="hover:bg-slate-800/40 transition"
                      >
                        {/* Ticker & Name - CLICKABLE TO OPEN CHART & SUMMARY */}
                        <td className="py-3 px-3">
                          <div
                            onClick={() => handleOpenStockDetail(item.ticker)}
                            className="flex items-center gap-2.5 cursor-pointer group/row"
                          >
                            <StockLogoBadge ticker={item.ticker} name={item.companyName} size="sm" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-cyan-300 group-hover/row:text-cyan-100 text-sm flex items-center gap-1 transition">
                                  {item.ticker}
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  {stock?.sector || 'US Equity'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {item.companyName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quality Score */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                            {stock?.investmentScore || 90}
                          </span>
                        </td>

                        {/* Live Price */}
                        <td className="py-3 px-3 text-right rtl:text-left font-bold text-white">
                          ${curPrice.toFixed(2)}
                        </td>

                        {/* Live Daily Change */}
                        <td className="py-3 px-3 text-right rtl:text-left">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center justify-end rtl:justify-start gap-1 ${
                              isPositive
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            }`}
                          >
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>
                              {isPositive ? '+' : ''}
                              {liveChange.changePercent.toFixed(2)}%
                            </span>
                          </span>
                        </td>

                        {/* Target Buy Price */}
                        <td className="py-3 px-3 text-right rtl:text-left">
                          {isEditing ? (
                            <input
                              type="number"
                              step="any"
                              value={editTargetPrice}
                              onChange={(e) => setEditTargetPrice(parseFloat(e.target.value) || 0)}
                              className="w-20 bg-slate-950 border border-amber-500 rounded px-1.5 py-0.5 text-right text-white"
                            />
                          ) : targetPrice ? (
                            <span className="font-bold text-slate-200">${targetPrice.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-500 italic">לא הוגדר</span>
                          )}
                        </td>

                        {/* Trigger Status */}
                        <td className="py-3 px-3 text-center">
                          {isTargetHit ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold animate-pulse flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isHe ? 'טריגר קנייה הושג' : 'BUY TRIGGER HIT'}</span>
                            </span>
                          ) : discountToTarget !== null ? (
                            <span className="text-slate-400 text-[11px]">
                              {discountToTarget > 0 ? `+${discountToTarget.toFixed(1)}% מעל` : `${discountToTarget.toFixed(1)}% תחת`}
                            </span>
                          ) : (
                            <span className="text-slate-500">{isHe ? 'מעקב שוטף' : 'Tracking'}</span>
                          )}
                        </td>

                        {/* 5Y CAGR */}
                        <td className="py-3 px-3 text-center font-bold text-emerald-400">
                          {stock?.scenarios?.baseCase?.expectedCAGR || '13.5%'}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3 text-left rtl:text-right">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-slate-950 border border-amber-500 rounded px-1.5 py-0.5 text-white text-xs"
                            />
                          ) : (
                            <span className="text-slate-400 text-[11px] truncate max-w-[160px] block" title={item.notes}>
                              {item.notes || '—'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Open live chart and summary button */}
                            <button
                              onClick={() => handleOpenStockDetail(item.ticker)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title={isHe ? 'פתח גרף חי וסיכום מקיף' : 'Open Live Chart & Summary'}
                            >
                              <BarChart2 className="w-3 h-3" />
                              <span>{isHe ? 'גרף וסיכום' : 'Chart & Summary'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenPortfolioModal(stock)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-emerald-900 text-emerald-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              title={isHe ? 'קנה לתיק ההשקעות' : 'Add to Active Portfolio'}
                            >
                              <Briefcase className="w-3 h-3" />
                              <span>{isHe ? 'קנה' : 'Buy'}</span>
                            </button>

                            {isEditing ? (
                              <button
                                onClick={() => handleSaveEdit(item.ticker)}
                                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => onRemoveFromWatchlist(item.ticker)}
                              className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Add to Portfolio Modal */}
      {portfolioModalStock && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>{isHe ? `רכישת ${portfolioModalStock.ticker} לתיק ההשקעות` : `Buy ${portfolioModalStock.ticker} for Portfolio`}</span>
              </h3>
              <button
                onClick={() => setPortfolioModalStock(null)}
                className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">{isHe ? 'שם החברה:' : 'Company:'}</label>
                <div className="text-sm font-bold text-white">
                  {portfolioModalStock.companyName} ({portfolioModalStock.ticker})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">{isHe ? 'כמות מניות:' : 'Shares to Buy:'}</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={buyShares}
                    onChange={(e) => setBuyShares(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">{isHe ? 'מחיר ביצוע ($):' : 'Execution Price ($):'}</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>{isHe ? 'סך השקעה משוערת:' : 'Estimated Total Capital:'}</span>
                  <span className="font-bold text-emerald-400">
                    ${(buyShares * buyPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{isHe ? 'צפי תשואה 5Y (בסיס):' : 'Expected 5Y CAGR:'}</span>
                  <span className="font-bold text-cyan-300">
                    {portfolioModalStock.scenarios?.baseCase?.expectedCAGR || '13.5%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPortfolioModalStock(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                {isHe ? 'ביטול' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmPortfolioBuy}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow cursor-pointer"
              >
                {isHe ? 'אשר והוסף לתיק' : 'Confirm & Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
