import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sunrise,
  Sunset,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Star,
  Pin,
  PinOff,
  Clock,
  Plus,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { ResearchStock, WatchlistItem, NamedWatchlist } from '../types';
import { SupportedLanguage } from '../i18n';
import { StockLogoBadge } from './StockLogoBadge';
import { getResearchStock } from '../data/researchStockGenerator';

export interface ExtendedSessionSnapshot {
  price: number;
  referenceClose: number;
  changeAmount: number;
  changePercent: number;
  lastTradeTime: number;
  isCurrentToday: boolean;
  volume: number;
}

export interface ExtendedHoursQuote {
  ticker: string;
  companyName: string;
  currency: string;
  regularPrice: number;
  previousClose: number;
  regularChangePercent: number;
  currentSessionState: 'PRE_MARKET' | 'REGULAR_MARKET' | 'AFTER_HOURS' | 'CLOSED';
  preMarket: ExtendedSessionSnapshot | null;
  afterHours: ExtendedSessionSnapshot | null;
  activeSession?: ExtendedSessionSnapshot | null;
  source: string;
  fetchedAt: number;
}

interface MoversPayload {
  session: 'PRE' | 'POST';
  currentMarketState: 'PRE_MARKET' | 'REGULAR_MARKET' | 'AFTER_HOURS' | 'CLOSED';
  isLiveSessionNow: boolean;
  nyTimeStr: string;
  israelTimeStr: string;
  totalScanned: number;
  gainers: ExtendedHoursQuote[];
  losers: ExtendedHoursQuote[];
  timestamp: number;
}

interface ExtendedHoursTrackerProps {
  session: 'PRE' | 'POST';
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  watchlists?: NamedWatchlist[];
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onSwitchSessionTab?: (tabId: 'premarket_session' | 'afterhours_session') => void;
  currentLang: SupportedLanguage;
}

const PINNED_STORAGE_KEY = 'MOATGUARD_EXTENDED_PINNED_V1';

function formatVolume(vol?: number): string {
  if (!vol || vol <= 0) return '—';
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return String(vol);
}

function formatTradeTime(ts?: number, isHe = true): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleTimeString(isHe ? 'he-IL' : 'en-US', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
}

export const ExtendedHoursTracker: React.FC<ExtendedHoursTrackerProps> = ({
  session,
  stocks,
  watchlist,
  watchlists,
  onToggleWatchlist,
  onAddToPortfolio,
  onSelectStock,
  onOpenDeepDive,
  onSwitchSessionTab,
  currentLang,
}) => {
  const isHe = currentLang === 'he';
  const isPre = session === 'PRE';

  // Movers state
  const [moversData, setMoversData] = useState<MoversPayload | null>(null);
  const [isLoadingMovers, setIsLoadingMovers] = useState<boolean>(true);
  const [moversError, setMoversError] = useState<string | null>(null);

  // Portfolio & Watchlist live extended quotes
  const [myQuotesMap, setMyQuotesMap] = useState<Record<string, ExtendedHoursQuote>>({});
  const [isLoadingMyQuotes, setIsLoadingMyQuotes] = useState<boolean>(true);
  const [myFilter, setMyFilter] = useState<'all' | 'portfolio' | 'watchlist'>('all');
  const [portfolioTickers, setPortfolioTickers] = useState<string[]>([]);

  // Search ANY ticker state
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchingTicker, setIsSearchingTicker] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedQuote, setSearchedQuote] = useState<ExtendedHoursQuote | null>(null);

  // User-pinned tickers for live tracking across sessions
  const [pinnedTickers, setPinnedTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PINNED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map((t) => String(t).toUpperCase().trim()).filter(Boolean);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Live auto-refresh controls
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(20);

  // Persist pinned tickers
  useEffect(() => {
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedTickers));
    } catch {
      // ignore
    }
  }, [pinnedTickers]);

  // Read portfolio holdings from localStorage & stay synced on portfolio updates
  const loadPortfolioTickers = useCallback(() => {
    try {
      const raw =
        localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') ||
        localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const list = Array.from(
            new Set(
              parsed
                .map((p: any) => String(p?.ticker || '').toUpperCase().trim())
                .filter(Boolean)
            )
          );
          setPortfolioTickers(list);
          return;
        }
      }
    } catch {
      // ignore
    }
    setPortfolioTickers([]);
  }, []);

  useEffect(() => {
    loadPortfolioTickers();
    window.addEventListener('portfolio-updated', loadPortfolioTickers);
    window.addEventListener('storage', loadPortfolioTickers);
    return () => {
      window.removeEventListener('portfolio-updated', loadPortfolioTickers);
      window.removeEventListener('storage', loadPortfolioTickers);
    };
  }, [loadPortfolioTickers]);

  // Combine all watchlist tickers (unlimited lists)
  const watchlistTickerMeta = useMemo(() => {
    const map = new Map<string, string[]>();
    if (watchlists && watchlists.length > 0) {
      watchlists.forEach((wl) => {
        wl.items.forEach((item) => {
          const t = item.ticker.toUpperCase().trim();
          if (!t) return;
          const prev = map.get(t) || [];
          if (!prev.includes(wl.name)) prev.push(wl.name);
          map.set(t, prev);
        });
      });
    } else {
      watchlist.forEach((item) => {
        const t = item.ticker.toUpperCase().trim();
        if (t) map.set(t, [isHe ? 'רשימת מעקב' : 'Watchlist']);
      });
    }
    return map;
  }, [watchlists, watchlist, isHe]);

  const combinedMyTickers = useMemo(() => {
    const set = new Set<string>();
    portfolioTickers.forEach((t) => set.add(t));
    watchlistTickerMeta.forEach((_, t) => set.add(t));
    pinnedTickers.forEach((t) => set.add(t));
    return Array.from(set);
  }, [portfolioTickers, watchlistTickerMeta, pinnedTickers]);

  // Fetch Movers (Gainers & Losers)
  const fetchMovers = useCallback(
    async (forceRefresh = false) => {
      setIsLoadingMovers(true);
      setMoversError(null);
      try {
        const url = `/api/extended-hours/movers?session=${session}${forceRefresh ? '&refresh=true' : ''}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MoversPayload = await res.json();
        setMoversData(data);
      } catch (err: any) {
        setMoversError(
          isHe
            ? 'שגיאה בטעינת נתוני מסחר מורחב. נסה לרענן שוב.'
            : err?.message || 'Failed to load extended hours movers'
        );
      } finally {
        setIsLoadingMovers(false);
      }
    },
    [session, isHe]
  );

  // Fetch Batch Quotes for Portfolio + Watchlist + Pinned stocks
  const fetchMyBatchQuotes = useCallback(async () => {
    if (combinedMyTickers.length === 0) {
      setIsLoadingMyQuotes(false);
      return;
    }
    setIsLoadingMyQuotes(true);
    try {
      const res = await fetch('/api/extended-hours/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ tickers: combinedMyTickers }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.quotes)) {
          const nextMap: Record<string, ExtendedHoursQuote> = {};
          data.quotes.forEach((q: ExtendedHoursQuote) => {
            if (q?.ticker) nextMap[q.ticker.toUpperCase()] = q;
          });
          setMyQuotesMap(nextMap);
        }
      }
    } catch {
      // keep previous quotes on transient network error
    } finally {
      setIsLoadingMyQuotes(false);
    }
  }, [combinedMyTickers]);

  // Initial & session-switch fetch
  useEffect(() => {
    fetchMovers(false);
    setCountdown(20);
  }, [fetchMovers]);

  useEffect(() => {
    fetchMyBatchQuotes();
  }, [fetchMyBatchQuotes]);

  // Live 20s polling timer
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMovers(false);
          fetchMyBatchQuotes();
          if (searchedQuote?.ticker) {
            fetch(`/api/extended-hours/quote/${encodeURIComponent(searchedQuote.ticker)}?refresh=true`)
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (d?.quote) setSearchedQuote(d.quote);
              })
              .catch(() => {});
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchMovers, fetchMyBatchQuotes, searchedQuote?.ticker]);

  const handleManualRefreshAll = () => {
    setCountdown(20);
    fetchMovers(true);
    fetchMyBatchQuotes();
    if (searchedQuote?.ticker) {
      handleSearchTickerSubmit(undefined, searchedQuote.ticker);
    }
  };

  // Search ANY ticker live
  const handleSearchTickerSubmit = async (e?: React.FormEvent, explicitTicker?: string) => {
    if (e) e.preventDefault();
    const clean = (explicitTicker ?? searchInput).toUpperCase().trim();
    if (!clean) return;

    setIsSearchingTicker(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/extended-hours/quote/${encodeURIComponent(clean)}?refresh=true`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData?.error ||
            (isHe ? `לא נמצאו נתונים לייב עבור הסימול ${clean}` : `No live data found for ${clean}`)
        );
      }
      const data = await res.json();
      if (data?.quote) {
        setSearchedQuote(data.quote);
      }
    } catch (err: any) {
      setSearchError(err?.message || (isHe ? 'שגיאה בחיפוש המניה' : 'Search failed'));
    } finally {
      setIsSearchingTicker(false);
    }
  };

  const togglePinTicker = (ticker: string) => {
    const clean = ticker.toUpperCase().trim();
    setPinnedTickers((prev) =>
      prev.includes(clean) ? prev.filter((t) => t !== clean) : [clean, ...prev]
    );
  };

  const resolveResearchStock = (ticker: string, fallbackName?: string, fallbackPrice?: number): ResearchStock => {
    const clean = ticker.toUpperCase().trim();
    const existing = stocks.find((s) => s.ticker.toUpperCase() === clean);
    if (existing) return existing;
    const generated = getResearchStock(clean);
    return {
      ...generated,
      companyName: fallbackName || generated.companyName,
      currentPrice: fallbackPrice ? `$${fallbackPrice.toFixed(2)}` : generated.currentPrice,
    };
  };

  const isInActiveWatchlist = (ticker: string) =>
    watchlist.some((w) => w.ticker.toUpperCase() === ticker.toUpperCase());

  // Build rows for "המניות בתיק שלי ובמעקב"
  const myRows = useMemo(() => {
    const portSet = new Set(portfolioTickers);
    return combinedMyTickers
      .filter((ticker) => {
        if (myFilter === 'portfolio') return portSet.has(ticker);
        if (myFilter === 'watchlist') return watchlistTickerMeta.has(ticker);
        return true;
      })
      .map((ticker) => {
        const quote = myQuotesMap[ticker];
        const snap = quote ? (isPre ? quote.preMarket : quote.afterHours) : null;
        return {
          ticker,
          inPortfolio: portSet.has(ticker),
          watchlistNames: watchlistTickerMeta.get(ticker) || [],
          isPinned: pinnedTickers.includes(ticker),
          quote,
          snap,
        };
      })
      .sort((a, b) => {
        // Portfolio first, then biggest absolute extended move
        if (a.inPortfolio !== b.inPortfolio) return a.inPortfolio ? -1 : 1;
        const absA = Math.abs(a.snap?.changePercent ?? 0);
        const absB = Math.abs(b.snap?.changePercent ?? 0);
        return absB - absA;
      });
  }, [combinedMyTickers, myFilter, portfolioTickers, watchlistTickerMeta, pinnedTickers, myQuotesMap, isPre]);

  const myStats = useMemo(() => {
    let up = 0;
    let down = 0;
    let sumPct = 0;
    let countWithData = 0;
    myRows.forEach((row) => {
      if (row.snap) {
        countWithData++;
        sumPct += row.snap.changePercent;
        if (row.snap.changePercent > 0) up++;
        else if (row.snap.changePercent < 0) down++;
      }
    });
    return {
      total: myRows.length,
      up,
      down,
      avgPct: countWithData > 0 ? sumPct / countWithData : 0,
    };
  }, [myRows]);

  const getSessionSnapshot = (q: ExtendedHoursQuote): ExtendedSessionSnapshot | null => {
    return isPre ? q.preMarket : q.afterHours;
  };

  const renderMoversColumn = (
    title: string,
    items: ExtendedHoursQuote[],
    variant: 'gainers' | 'losers'
  ) => {
    const isGain = variant === 'gainers';
    const Icon = isGain ? TrendingUp : TrendingDown;

    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isGain
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                {isGain
                  ? isHe
                    ? 'העליות החדות ביותר בסשן המורחב'
                    : 'Top percentage gainers in session'
                  : isHe
                  ? 'הירידות החדות ביותר בסשן המורחב'
                  : 'Deepest percentage drops in session'}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {items.length} {isHe ? 'מניות' : 'stocks'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {isLoadingMovers && items.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {isHe ? 'סורק מחירי מסחר מורחב בלייב...' : 'Scanning live extended-hours prices...'}
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {isHe
                ? 'אין כרגע תנועות משמעותיות בסשן זה.'
                : 'No significant movers detected for this session right now.'}
            </div>
          ) : (
            items.map((item, idx) => {
              const snap = getSessionSnapshot(item) || item.activeSession;
              if (!snap) return null;
              const pct = snap.changePercent;
              const amt = snap.changeAmount;
              const showRegularNow = item.currentSessionState === 'REGULAR_MARKET' && typeof item.regularPrice === 'number';
              const inWatch = isInActiveWatchlist(item.ticker);
              const inPort = portfolioTickers.includes(item.ticker.toUpperCase());
              const isPinned = pinnedTickers.includes(item.ticker.toUpperCase());

              return (
                <div
                  key={item.ticker}
                  onClick={() =>
                    onSelectStock(resolveResearchStock(item.ticker, item.companyName, snap.price))
                  }
                  className="px-4 py-3 hover:bg-slate-800/40 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono tabular-nums text-slate-500 font-semibold shrink-0">
                      {idx + 1}
                    </span>
                    <StockLogoBadge ticker={item.ticker} name={item.companyName} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-white">{item.ticker}</span>
                        {inPort && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                            {isHe ? 'בתיק' : 'Portfolio'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-[200px]">
                        {item.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-end font-mono tabular-nums">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[11px] text-slate-500 line-through-none">
                          ${snap.referenceClose.toFixed(2)}
                        </span>
                        <span className="text-slate-600 text-[10px]">→</span>
                        <span className="text-sm font-bold text-white">${snap.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[11px]">
                        <span
                          className={`font-bold flex items-center gap-0.5 ${
                            pct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {pct >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {pct >= 0 ? '+' : ''}
                          {pct.toFixed(2)}% ({amt >= 0 ? '+' : ''}${amt.toFixed(2)})
                        </span>
                        <span className="text-slate-500 hidden sm:inline">
                          {formatTradeTime(snap.lastTradeTime, isHe)}
                        </span>
                      </div>
                      {showRegularNow && (
                        <div className="text-[10px] mt-0.5 text-slate-400 flex items-center justify-end gap-1">
                          <span>{isHe ? 'מסחר רציף כעת:' : 'Regular Now:'}</span>
                          <span className="text-slate-200 font-semibold">${item.regularPrice.toFixed(2)}</span>
                          <span className={item.regularChangePercent >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            ({item.regularChangePercent >= 0 ? '+' : ''}{item.regularChangePercent.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => togglePinTicker(item.ticker)}
                        className={`p-1.5 rounded-md transition cursor-pointer ${
                          isPinned
                            ? 'text-cyan-400 bg-cyan-500/10'
                            : 'text-slate-500 hover:text-cyan-300 hover:bg-slate-800'
                        }`}
                        title={isPinned ? (isHe ? 'בטל הצמדה' : 'Unpin') : (isHe ? 'הצמד למעקב לייב' : 'Pin to My Live')}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onToggleWatchlist(
                            resolveResearchStock(item.ticker, item.companyName, snap.price)
                          )
                        }
                        className={`p-1.5 rounded-md transition cursor-pointer ${
                          inWatch ? 'text-amber-400' : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800'
                        }`}
                        title={inWatch ? (isHe ? 'הסר ממעקב' : 'Remove from Watchlist') : (isHe ? 'הוסף למעקב' : 'Add to Watchlist')}
                      >
                        <Star className={`w-3.5 h-3.5 ${inWatch ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. CLEAN SESSION HEADER */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
              isPre
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}
          >
            {isPre ? <Sunrise className="w-5 h-5" /> : <Sunset className="w-5 h-5" />}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isPre
                  ? isHe
                    ? 'טרום-מסחר לייב (Pre-Market)'
                    : 'Live Pre-Market Trading'
                  : isHe
                  ? 'מסחר לאחר סגירה לייב (After-Hours)'
                  : 'Live After-Hours Trading'}
              </h1>
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${
                  moversData?.isLiveSessionNow
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {moversData?.isLiveSessionNow
                  ? isHe
                    ? 'סשן פעיל עכשיו · לייב'
                    : 'Session Active · Live'
                  : isHe
                  ? 'מציג נתוני סשן אחרון'
                  : 'Showing Latest Session'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isPre
                ? isHe
                  ? 'שעות טרום-מסחר: 11:00–16:30 שעון ישראל (04:00–09:30 ניו יורק). נתוני זמן אמת ישירות ממסחר ה-Pre-Market.'
                  : 'Pre-Market hours: 04:00–09:30 NY (11:00–16:30 Israel). Real-time quotes & biggest movers.'
                : isHe
                ? 'שעות מסחר לאחר סגירה: 23:00–03:00 שעון ישראל (16:00–20:00 ניו יורק). מעקב דוחות ותנועות סוף יום בלייב.'
                : 'After-Hours: 16:00–20:00 NY (23:00–03:00 Israel). Real-time earnings reactions & late moves.'}
            </p>
            {moversData && (
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono tabular-nums pt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {isHe ? 'ישראל:' : 'IL:'} <strong className="text-slate-200">{moversData.israelTimeStr}</strong>
                </span>
                <span>·</span>
                <span>
                  {isHe ? 'ניו יורק:' : 'NY:'} <strong className="text-slate-200">{moversData.nyTimeStr}</strong>
                </span>
                <span>·</span>
                <span>
                  {isHe
                    ? `נסרקו ${moversData.totalScanned} מניות מובילות`
                    : `Scanned ${moversData.totalScanned} active stocks`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onSwitchSessionTab && (
            <button
              type="button"
              onClick={() =>
                onSwitchSessionTab(isPre ? 'afterhours_session' : 'premarket_session')
              }
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              {isPre ? <Sunset className="w-3.5 h-3.5 text-indigo-400" /> : <Sunrise className="w-3.5 h-3.5 text-amber-400" />}
              <span>
                {isPre
                  ? isHe
                    ? 'עבור ללאחר סגירה'
                    : 'Switch to After-Hours'
                  : isHe
                  ? 'עבור לטרום-מסחר'
                  : 'Switch to Pre-Market'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setAutoRefresh((prev) => !prev)}
            className="px-3 py-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            {autoRefresh ? (
              <Pause className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="tabular-nums">
              {autoRefresh
                ? isHe
                  ? `לייב · ${countdown}ש'`
                  : `Live · ${countdown}s`
                : isHe
                ? 'מושהה'
                : 'Paused'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleManualRefreshAll}
            disabled={isLoadingMovers}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMovers ? 'animate-spin' : ''}`} />
            <span>{isHe ? 'רענן לייב' : 'Refresh Live'}</span>
          </button>
        </div>
      </section>

      {moversData?.currentMarketState === 'REGULAR_MARKET' && (
        <div className="p-3.5 rounded-xl bg-amber-950/35 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            {isHe
              ? `המסחר הרציף בוול סטריט פתוח כרגע (${moversData.nyTimeStr} NY) — רשימת ${isPre ? 'הטרום-מסחר' : 'לאחר הסגירה'} מציגה את תנועות הסשן המורחב (04:00–09:30 NY), ולצד כל מניה מופיע גם מחיר המסחר הרגיל החי ברגע זה למניעת בלבול בין עלייה בבוקר לירידה במהלך היום.`
              : `US Regular Market is currently open (${moversData.nyTimeStr} NY) — lists show the extended session snapshot alongside the live regular-session price so intraday reversals are clearly visible.`}
          </span>
        </div>
      )}

      {/* 2. SEARCH ANY STOCK LIVE IN EXTENDED HOURS */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">
              {isPre
                ? isHe
                  ? 'בדיקת כל מניה בטרום-מסחר בלייב'
                  : 'Check Any Stock in Live Pre-Market'
                : isHe
                ? 'בדיקת כל מניה במסחר לאחר סגירה בלייב'
                : 'Check Any Stock in Live After-Hours'}
            </h2>
            <p className="text-xs text-slate-400">
              {isHe
                ? 'הקלד כל סימול אמריקאי (NVDA, TSLA, AAPL, SMCI, PLTR...) לקבלת מחיר לייב מדויק או להצמדה ללוח שלך.'
                : 'Enter any US ticker for instant extended-hours price, % change, and volume.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {['NVDA', 'TSLA', 'AAPL', 'MSFT', 'PLTR', 'AMD'].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => {
                  setSearchInput(quick);
                  handleSearchTickerSubmit(undefined, quick);
                }}
                className="px-2 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono font-semibold text-slate-300 hover:text-cyan-300 transition cursor-pointer"
              >
                {quick}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => handleSearchTickerSubmit(e)} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3.5 ltr:left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                isHe
                  ? 'הקלד סימול מניה לבדיקה מיידית (לדוגמה: NVDA, META, COIN)...'
                  : 'Search any ticker symbol (e.g. NVDA, META, COIN)...'
              }
              className="w-full rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingTicker || !searchInput.trim()}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 whitespace-nowrap"
          >
            {isSearchingTicker
              ? isHe
                ? 'בודק...'
                : 'Checking...'
              : isHe
              ? 'בדוק לייב'
              : 'Check Live'}
          </button>
        </form>

        {searchError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Instant Search Result Card */}
        {searchedQuote && (
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <StockLogoBadge ticker={searchedQuote.ticker} name={searchedQuote.companyName} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-white">{searchedQuote.ticker}</span>
                  <span className="text-xs text-slate-400">{searchedQuote.companyName}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                  {isHe ? 'סגירה רגילה:' : 'Regular Close:'}{' '}
                  <strong className="text-slate-200">${searchedQuote.regularPrice.toFixed(2)}</strong>
                  <span className="mx-2 text-slate-600">|</span>
                  <span className={searchedQuote.regularChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {searchedQuote.regularChangePercent >= 0 ? '+' : ''}
                    {searchedQuote.regularChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Session Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono tabular-nums">
              <div>
                <div className="text-[11px] text-slate-500">
                  {isPre
                    ? isHe
                      ? 'מחיר טרום-מסחר'
                      : 'Pre-Market Price'
                    : isHe
                    ? 'מחיר לאחר סגירה'
                    : 'After-Hours Price'}
                </div>
                <div className="text-base font-bold text-white">
                  {getSessionSnapshot(searchedQuote)
                    ? `$${getSessionSnapshot(searchedQuote)!.price.toFixed(2)}`
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">{isHe ? 'שינוי בסשן' : 'Session Change'}</div>
                {getSessionSnapshot(searchedQuote) ? (
                  <div
                    className={`text-sm font-bold ${
                      getSessionSnapshot(searchedQuote)!.changePercent >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {getSessionSnapshot(searchedQuote)!.changePercent >= 0 ? '+' : ''}
                    {getSessionSnapshot(searchedQuote)!.changePercent.toFixed(2)}% (
                    {getSessionSnapshot(searchedQuote)!.changeAmount >= 0 ? '+' : ''}$
                    {getSessionSnapshot(searchedQuote)!.changeAmount.toFixed(2)})
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">{isHe ? 'אין עסקאות' : 'No trades'}</div>
                )}
              </div>
              <div>
                <div className="text-[11px] text-slate-500">{isHe ? 'נפח ושעה' : 'Vol / Time'}</div>
                <div className="text-xs text-slate-200">
                  {getSessionSnapshot(searchedQuote)
                    ? `${formatVolume(getSessionSnapshot(searchedQuote)!.volume)} · ${formatTradeTime(
                        getSessionSnapshot(searchedQuote)!.lastTradeTime,
                        isHe
                      )}`
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  {isPre
                    ? isHe
                      ? 'סשן לאחר סגירה'
                      : 'After-Hours'
                    : isHe
                    ? 'סשן טרום-מסחר'
                    : 'Pre-Market'}
                </div>
                {(isPre ? searchedQuote.afterHours : searchedQuote.preMarket) ? (
                  <div className="text-xs text-slate-300">
                    ${(isPre ? searchedQuote.afterHours : searchedQuote.preMarket)!.price.toFixed(2)} (
                    {(isPre ? searchedQuote.afterHours : searchedQuote.preMarket)!.changePercent >= 0
                      ? '+'
                      : ''}
                    {(isPre ? searchedQuote.afterHours : searchedQuote.preMarket)!.changePercent.toFixed(2)}%)
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">—</div>
                )}
              </div>
            </div>

            {/* Result Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => togglePinTicker(searchedQuote.ticker)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  pinnedTickers.includes(searchedQuote.ticker)
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>
                  {pinnedTickers.includes(searchedQuote.ticker)
                    ? isHe
                      ? 'מוצמד ללוח'
                      : 'Pinned'
                    : isHe
                    ? 'הצמד למעקב לייב'
                    : 'Pin Live'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onToggleWatchlist(
                    resolveResearchStock(
                      searchedQuote.ticker,
                      searchedQuote.companyName,
                      getSessionSnapshot(searchedQuote)?.price || searchedQuote.regularPrice
                    )
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                  isInActiveWatchlist(searchedQuote.ticker)
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isInActiveWatchlist(searchedQuote.ticker) ? 'fill-amber-400' : ''
                  }`}
                />
                <span>{isInActiveWatchlist(searchedQuote.ticker) ? (isHe ? 'במעקב' : 'Watching') : (isHe ? 'למעקב' : 'Watch')}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onAddToPortfolio(
                    resolveResearchStock(
                      searchedQuote.ticker,
                      searchedQuote.companyName,
                      getSessionSnapshot(searchedQuote)?.price || searchedQuote.regularPrice
                    )
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHe ? 'לתיק' : 'Add to Portfolio'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onSelectStock(
                    resolveResearchStock(
                      searchedQuote.ticker,
                      searchedQuote.companyName,
                      getSessionSnapshot(searchedQuote)?.price || searchedQuote.regularPrice
                    )
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{isHe ? 'פרטי מניה' : 'Details'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. MY PORTFOLIO & WATCHLISTS LIVE TRACKER */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {isPre
                  ? isHe
                    ? 'המניות בתיק שלי ובמעקב — לייב בטרום-מסחר'
                    : 'My Portfolio & Watchlists — Live Pre-Market'
                  : isHe
                  ? 'המניות בתיק שלי ובמעקב — לייב לאחר סגירה'
                  : 'My Portfolio & Watchlists — Live After-Hours'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                <span>
                  {isHe ? 'סה"כ:' : 'Total:'} <strong className="text-white">{myStats.total}</strong>
                </span>
                <span className="text-emerald-400">
                  {isHe ? 'עולות:' : 'Up:'} <strong>{myStats.up}</strong>
                </span>
                <span className="text-rose-400">
                  {isHe ? 'יורדות:' : 'Down:'} <strong>{myStats.down}</strong>
                </span>
                <span className={myStats.avgPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {isHe ? 'ממוצע שינוי:' : 'Avg Move:'} {myStats.avgPct >= 0 ? '+' : ''}
                  {myStats.avgPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start md:self-auto">
            {[
              { id: 'all', label: isHe ? 'הכל (תיק + מעקב)' : 'All My Stocks' },
              { id: 'portfolio', label: isHe ? `בתיק שלי (${portfolioTickers.length})` : `Portfolio (${portfolioTickers.length})` },
              { id: 'watchlist', label: isHe ? `במעקב (${watchlistTickerMeta.size})` : `Watchlists (${watchlistTickerMeta.size})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMyFilter(tab.id as any)}
                className={`px-3 py-1 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                  myFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {myRows.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {isHe
              ? 'אין כרגע מניות בקטגוריה זו. הוסף מניות לתיק האישי או הצמד מניה משורת החיפוש למעלה.'
              : 'No tickers in this filter yet. Add holdings to your portfolio or pin a ticker above.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-medium">
                  <th className="py-3 px-4 text-start">{isHe ? 'מניה' : 'Stock'}</th>
                  <th className="py-3 px-4 text-start hidden sm:table-cell">{isHe ? 'שיוך' : 'Source'}</th>
                  <th className="py-3 px-4 text-end">{isHe ? 'סגירה רגילה' : 'Reg. Close'}</th>
                  <th className="py-3 px-4 text-end">
                    {isPre ? (isHe ? 'מחיר טרום-מסחר' : 'Pre-Market') : (isHe ? 'מחיר לאחר סגירה' : 'After-Hours')}
                  </th>
                  <th className="py-3 px-4 text-end">{isHe ? 'שינוי % / $' : 'Change % / $'}</th>
                  <th className="py-3 px-4 text-end hidden md:table-cell">{isHe ? 'נפח · שעה' : 'Vol · Time'}</th>
                  <th className="py-3 px-4 text-center">{isHe ? 'פעולות' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {myRows.map(({ ticker, inPortfolio, watchlistNames, isPinned, quote, snap }) => {
                  const pct = snap?.changePercent ?? 0;
                  const amt = snap?.changeAmount ?? 0;
                  const isPos = pct >= 0;

                  return (
                    <tr
                      key={ticker}
                      onClick={() =>
                        onSelectStock(
                          resolveResearchStock(ticker, quote?.companyName, snap?.price || quote?.regularPrice)
                        )
                      }
                      className="hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <StockLogoBadge ticker={ticker} name={quote?.companyName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-sm text-white">{ticker}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {quote?.companyName || (isLoadingMyQuotes ? (isHe ? 'טוען...' : 'Loading...') : ticker)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {inPortfolio && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                              {isHe ? 'תיק אישי' : 'Portfolio'}
                            </span>
                          )}
                          {watchlistNames.slice(0, 1).map((wlName) => (
                            <span
                              key={wlName}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 truncate max-w-[110px]"
                            >
                              {wlName}
                            </span>
                          ))}
                          {isPinned && !inPortfolio && watchlistNames.length === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              {isHe ? 'מוצמד' : 'Pinned'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-end font-mono tabular-nums text-slate-300">
                        {quote ? `$${quote.regularPrice.toFixed(2)}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-end font-mono tabular-nums">
                        {snap ? (
                          <span className="font-bold text-white text-sm">${snap.price.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            {isLoadingMyQuotes ? '...' : isHe ? 'אין עסקאות' : 'No trades'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-end font-mono tabular-nums">
                        {snap ? (
                          <div>
                            <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPos ? '+' : ''}
                              {pct.toFixed(2)}%
                            </span>
                            <div className={`text-[11px] ${isPos ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                              {amt >= 0 ? '+' : ''}${amt.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-end font-mono tabular-nums text-slate-400 hidden md:table-cell">
                        {snap ? (
                          <div>
                            <div className="text-slate-200">{formatTradeTime(snap.lastTradeTime, isHe)}</div>
                            <div className="text-[10px] text-slate-500">Vol {formatVolume(snap.volume)}</div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenDeepDive(
                                resolveResearchStock(ticker, quote?.companyName, snap?.price || quote?.regularPrice)
                              )
                            }
                            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition cursor-pointer whitespace-nowrap"
                          >
                            {isHe ? 'מחקר' : 'Research'}
                          </button>
                          {isPinned && (
                            <button
                              type="button"
                              onClick={() => togglePinTicker(ticker)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                              title={isHe ? 'הסר הצמדה' : 'Unpin'}
                            >
                              <PinOff className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* 4. ERROR BANNER IF MOVERS FAILED */}
      {moversError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{moversError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchMovers(true)}
            className="px-3 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium cursor-pointer"
          >
            {isHe ? 'נסה שוב' : 'Retry'}
          </button>
        </div>
      )}

      {/* 5. TOP GAINERS & TOP LOSERS BOARD */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderMoversColumn(
          isPre
            ? isHe
              ? 'העולות הגדולות בטרום-מסחר'
              : 'Top Pre-Market Gainers'
            : isHe
            ? 'העולות הגדולות לאחר סגירה'
            : 'Top After-Hours Gainers',
          moversData?.gainers || [],
          'gainers'
        )}

        {renderMoversColumn(
          isPre
            ? isHe
              ? 'היורדות הגדולות בטרום-מסחר'
              : 'Top Pre-Market Losers'
            : isHe
            ? 'היורדות הגדולות לאחר סגירה'
            : 'Top After-Hours Losers',
          moversData?.losers || [],
          'losers'
        )}
      </section>
    </div>
  );
};
