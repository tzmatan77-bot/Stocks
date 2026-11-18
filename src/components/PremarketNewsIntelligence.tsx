import React, { useState, useEffect, useMemo } from 'react';
import { ResearchStock, WatchlistItem, PremarketNewsItem, NamedWatchlist } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import {
  BellRing,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Search,
  Zap,
  FileText,
  Star,
  CheckCircle2,
  Share2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Play,
  Pause,
  Send,
  Globe,
  MessageSquareText,
} from 'lucide-react';

interface PremarketNewsIntelligenceProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onSelectStock: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

type ReactionFilter = 'ALL' | 'MY_STOCKS' | 'POSITIVE' | 'NEGATIVE' | 'MIXED';

export const PremarketNewsIntelligence: React.FC<PremarketNewsIntelligenceProps> = ({
  stocks,
  watchlist,
  livePrices = {},
  onToggleWatchlist,
  onOpenDeepDive,
  onSelectStock,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';

  const [newsList, setNewsList] = useState<PremarketNewsItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);
  const [reactionFilter, setReactionFilter] = useState<ReactionFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto daily/live refresh states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(60);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [feedNotification, setFeedNotification] = useState<string | null>(null);
  const [liveNewsQuotes, setLiveNewsQuotes] = useState<Record<string, { price: number; changePercent: number }>>({});

  // Single-stock or portfolio scan states
  const [isScanningTicker, setIsScanningTicker] = useState<boolean>(false);
  const [isScanningAllPortfolio, setIsScanningAllPortfolio] = useState<boolean>(false);

  // Custom headline AI reaction analyzer
  const [showCustomAnalyzer, setShowCustomAnalyzer] = useState<boolean>(false);
  const [customNewsInput, setCustomNewsInput] = useState<string>('');
  const [customTickerInput, setCustomTickerInput] = useState<string>('');
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);

  // Portfolio tickers synced from localStorage
  const [portfolioPositions, setPortfolioPositions] = useState<{ ticker: string }[]>(() => {
    try {
      const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setPortfolioPositions(parsed);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('portfolio-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('portfolio-updated', handleStorageUpdate);
    };
  }, []);

  const portfolioTickersSet = useMemo(
    () => new Set(portfolioPositions.map((p) => (p.ticker || '').toUpperCase().trim()).filter(Boolean)),
    [portfolioPositions]
  );

  // Aggregate tickers across ALL unlimited watchlists + active watchlist prop
  const watchlistTickersSet = useMemo(() => {
    const set = new Set(watchlist.map((w) => w.ticker.toUpperCase().trim()));
    try {
      const rawLists = localStorage.getItem('MOATGUARD_WATCHLISTS_V2');
      if (rawLists) {
        const parsed: NamedWatchlist[] = JSON.parse(rawLists);
        if (Array.isArray(parsed)) {
          parsed.forEach((list) => {
            list.items?.forEach((it) => {
              if (it.ticker) set.add(it.ticker.toUpperCase().trim());
            });
          });
        }
      }
    } catch {
      // ignore
    }
    return set;
  }, [watchlist]);

  // Fetch daily news + reaction analysis
  const fetchDailyNews = async (isBackground = false) => {
    try {
      const res = await fetch('/api/daily-news', { headers: { Accept: 'application/json' } });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.news)) {
          setNewsList(data.news);
          setLastRefreshedAt(new Date());
          if (!isBackground) {
            setFeedNotification(isHe ? 'חדשות היום וניתוח התגובה עודכנו בהצלחה.' : 'Daily news & reaction analysis updated.');
            setTimeout(() => setFeedNotification(null), 4000);
          }
        }
      }
    } catch {
      // keep existing items smoothly
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyNews(true);
  }, []);

  // Auto-refresh timer every 60 seconds (also automatically pulls fresh day's news after midnight)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchDailyNews(true);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  // Live quotes for tickers appearing in the news feed
  useEffect(() => {
    let isMounted = true;
    const fetchQuotesForFeed = async () => {
      try {
        const uniqueTickers = Array.from(new Set(newsList.map((n) => n.ticker.toUpperCase().trim()).filter(Boolean)));
        if (uniqueTickers.length === 0) return;
        const res = await fetch(`/api/quotes?tickers=${encodeURIComponent(uniqueTickers.join(','))}`, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
          const data = await res.json();
          if (isMounted && data?.quotes) {
            setLiveNewsQuotes((prev) => ({ ...prev, ...data.quotes }));
          }
        }
      } catch {
        // quiet fallback
      }
    };
    fetchQuotesForFeed();
    const interval = setInterval(fetchQuotesForFeed, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [newsList]);

  // Manual force refresh of today's breaking news
  const handleManualRefreshNews = async () => {
    setIsRefreshingFeed(true);
    setFeedNotification(null);
    try {
      const res = await fetch('/api/premarket-news/regenerate', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.news)) {
          setNewsList(data.news);
          setLastRefreshedAt(new Date());
          setCountdown(60);
          setFeedNotification(
            isHe
              ? `החדשות להיום רועננו בהצלחה (${data.news.length} כתבות עם ניתוח תגובה עדכני).`
              : `Today's news refreshed (${data.news.length} stories with reaction analysis).`
          );
          setTimeout(() => setFeedNotification(null), 5000);
        }
      }
    } catch {
      setFeedNotification(isHe ? 'שגיאה זמנית ברענון החדשות, נסה שנית בעוד רגע.' : 'Temporary refresh error.');
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  // Scan breaking news + reaction analysis for any typed ticker
  const handleScanTickerNews = async (tickerOverride?: string, forceRefresh = false) => {
    const raw = (tickerOverride || searchQuery).trim().toUpperCase();
    if (!raw || raw.includes(' ')) return;
    setIsScanningTicker(true);
    setFeedNotification(null);
    try {
      const url = `/api/ticker-news-alert/${encodeURIComponent(raw)}${forceRefresh ? '?forceRefresh=true' : ''}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const item: PremarketNewsItem = await res.json();
        setNewsList((prev) => [item, ...prev.filter((n) => n.ticker.toUpperCase() !== item.ticker.toUpperCase())]);
        setReactionFilter('ALL');
        setFeedNotification(
          isHe
            ? `נטענו חדשות וניתוח תגובה מעודכן עבור ${item.ticker}.`
            : `Loaded latest news & reaction analysis for ${item.ticker}.`
        );
        setTimeout(() => setFeedNotification(null), 5000);
      }
    } catch {
      setFeedNotification(isHe ? `לא הצלחנו למשוך חדשות עבור ${raw}` : `Failed to scan ${raw}`);
    } finally {
      setIsScanningTicker(false);
    }
  };

  // Scan news for all user portfolio & watchlist holdings
  const handleScanMyStocks = async () => {
    const combined = Array.from(new Set([...Array.from(portfolioTickersSet), ...Array.from(watchlistTickersSet)])).slice(0, 15);
    if (combined.length === 0) {
      setFeedNotification(isHe ? 'אין כרגע מניות בתיק או ברשימת המעקב לסריקה.' : 'No portfolio or watchlist stocks to scan.');
      return;
    }
    setIsScanningAllPortfolio(true);
    setFeedNotification(null);
    try {
      const res = await fetch('/api/portfolio-news-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ tickers: combined }),
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const newItems: PremarketNewsItem[] = data.results;
          setNewsList((prev) => {
            const existing = new Set(newItems.map((n) => n.ticker.toUpperCase()));
            return [...newItems, ...prev.filter((n) => !existing.has(n.ticker.toUpperCase()))];
          });
          setReactionFilter('MY_STOCKS');
          setFeedNotification(
            isHe
              ? `נסרקו חדשות וניתוח תגובה עבור ${newItems.length} המניות שלך.`
              : `Scanned news & reaction analysis for ${newItems.length} of your stocks.`
          );
          setTimeout(() => setFeedNotification(null), 5000);
        }
      }
    } catch {
      setFeedNotification(isHe ? 'שגיאה בסריקת מניות התיק והמעקב.' : 'Failed to scan your stocks.');
    } finally {
      setIsScanningAllPortfolio(false);
    }
  };

  // Custom headline AI reaction analysis
  const handleAnalyzeCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNewsInput.trim()) return;
    setIsAnalyzingCustom(true);
    try {
      const res = await fetch('/api/premarket-analyze', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: customNewsInput.trim(),
          ticker: customTickerInput.trim().toUpperCase(),
        }),
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        const ticker = (data.ticker || customTickerInput.trim().toUpperCase() || 'MKT').toUpperCase();
        const fullItem: PremarketNewsItem = {
          id: `custom-${Date.now()}`,
          ticker,
          companyName: data.companyName || `${ticker} Equities`,
          headline: data.headline || customNewsInput.slice(0, 110),
          summary: data.summary || customNewsInput,
          source: data.source || (isHe ? 'ניתוח כותרת אישי' : 'Custom Headline'),
          publishedTime: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          date: isHe ? 'היום • ניתוח AI חי' : 'Today • Live AI Analysis',
          category: data.category || 'EARNINGS_CATALYST',
          sentiment: data.sentiment || 'NEUTRAL',
          preMarketPrice: livePrices[ticker]?.price,
          preMarketChangePercent: livePrices[ticker]?.changePercent,
          reactionAnalysis: data.reactionAnalysis,
          recommendation: data.recommendation,
        };
        setNewsList((prev) => [fullItem, ...prev]);
        setCustomNewsInput('');
        setCustomTickerInput('');
        setShowCustomAnalyzer(false);
        setReactionFilter('ALL');
        setFeedNotification(isHe ? 'ניתוח התגובה לכותרת שהזנת נוסף לראש החדשות.' : 'Custom headline reaction analysis added.');
        setTimeout(() => setFeedNotification(null), 4000);
      }
    } catch {
      setFeedNotification(isHe ? 'שגיאה בניתוח הכותרת.' : 'Error analyzing headline.');
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const getReactionDirection = (item: PremarketNewsItem): 'POSITIVE' | 'NEGATIVE' | 'MIXED' => {
    const rx = item.reactionAnalysis?.expectedReaction;
    if (rx === 'POSITIVE_UP') return 'POSITIVE';
    if (rx === 'NEGATIVE_DOWN') return 'NEGATIVE';
    if (rx === 'MIXED_VOLATILE') return 'MIXED';
    if (item.sentiment === 'BEARISH' || item.movementType === 'SHARP_DROP_WARNING' || (item.preMarketChangePercent || 0) < -1.2) {
      return 'NEGATIVE';
    }
    if (item.sentiment === 'BULLISH' || item.movementType === 'IMPENDING_JUMP' || (item.preMarketChangePercent || 0) > 1.2) {
      return 'POSITIVE';
    }
    return 'MIXED';
  };

  // Counts for simple filter chips
  const counts = useMemo(() => {
    let myStocks = 0;
    let positive = 0;
    let negative = 0;
    let mixed = 0;
    newsList.forEach((item) => {
      const t = item.ticker.toUpperCase();
      if (portfolioTickersSet.has(t) || watchlistTickersSet.has(t)) myStocks++;
      const dir = getReactionDirection(item);
      if (dir === 'POSITIVE') positive++;
      else if (dir === 'NEGATIVE') negative++;
      else mixed++;
    });
    return {
      all: newsList.length,
      myStocks,
      positive,
      negative,
      mixed,
    };
  }, [newsList, portfolioTickersSet, watchlistTickersSet]);

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const t = item.ticker.toUpperCase();
      if (reactionFilter === 'MY_STOCKS') {
        if (!portfolioTickersSet.has(t) && !watchlistTickersSet.has(t)) return false;
      } else if (reactionFilter === 'POSITIVE') {
        if (getReactionDirection(item) !== 'POSITIVE') return false;
      } else if (reactionFilter === 'NEGATIVE') {
        if (getReactionDirection(item) !== 'NEGATIVE') return false;
      } else if (reactionFilter === 'MIXED') {
        if (getReactionDirection(item) !== 'MIXED') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          item.ticker.toLowerCase().includes(q) ||
          item.companyName.toLowerCase().includes(q) ||
          item.headline.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [newsList, reactionFilter, searchQuery, portfolioTickersSet, watchlistTickersSet]);

  const handleCopyShare = (item: PremarketNewsItem) => {
    const rx = item.reactionAnalysis;
    const textToCopy = `${item.headline} (${item.ticker})
מקור: ${item.source}
צפי תגובה: ${rx?.expectedReactionLabelHe || item.recommendation?.actionLabelHe || ''}
למה המניה מגיבה כך: ${rx?.whyReactingHe || item.recommendation?.impactAnalysisHe || ''}
האם זו הגזמה או שינוי אמיתי: ${rx?.isOverreactionOrRealHe || item.recommendation?.riskFactorHe || ''}
איך מומלץ לפעול: ${rx?.howToRespondHe || item.recommendation?.openingBellGamePlanHe || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const todayFormattedHe = new Intl.DateTimeFormat(isHe ? 'he-IL' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const isExactTickerQuery = /^[A-Za-z.]{1,6}$/.test(searchQuery.trim());

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. CLEAN DAILY NEWS HEADER (News & Reaction Analysis ONLY) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-cyan-400">{isHe ? 'מתעדכן מדי יום' : 'Updated Daily'}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{todayFormattedHe}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">
                {isHe
                  ? `עודכן ${lastRefreshedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                  : `Synced ${lastRefreshedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-balance">
              {isHe ? 'חדשות יומיות וניתוח תגובה' : 'Daily News & Reaction Analysis'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {isHe
                ? 'רק חדשות חברות וכלכלה עדכניות להיום — עם הסבר פשוט למה המניה מגיבה ככה, האם זו הגזמה זמנית ומה מומלץ לעשות בתגובה.'
                : 'Daily company & financial news with clear explanations of why stocks react and how to respond.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono tabular-nums flex items-center gap-1.5 transition cursor-pointer"
            >
              {autoRefreshEnabled ? (
                <Pause className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {autoRefreshEnabled
                  ? isHe
                    ? `עדכון אוטומטי (${countdown}ש')`
                    : `Auto (${countdown}s)`
                  : isHe
                  ? 'עדכון אוטומטי מושהה'
                  : 'Paused'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleManualRefreshNews}
              disabled={isRefreshingFeed}
              className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingFeed ? 'animate-spin' : ''}`} />
              <span>{isRefreshingFeed ? (isHe ? 'מעדכן חדשות...' : 'Updating...') : isHe ? 'רענן חדשות להיום' : "Refresh Today's News"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomAnalyzer(!showCustomAnalyzer)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? 'נתח כותרת משלך' : 'Analyze Headline'}</span>
              {showCustomAnalyzer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Feedback notification */}
        {feedNotification && (
          <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/40 text-cyan-200 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedNotification(null)}
              className="text-slate-400 hover:text-white text-xs px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Collapsible Custom Headline Reaction Analyzer */}
        {showCustomAnalyzer && (
          <form onSubmit={handleAnalyzeCustomNews} className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isHe ? 'הדבק כותרת או ידיעה חדשותית כדי לקבל ניתוח תגובה מיידי:' : 'Paste any headline or news snippet for instant reaction analysis:'}
                </label>
                <input
                  type="text"
                  value={customNewsInput}
                  onChange={(e) => setCustomNewsInput(e.target.value)}
                  placeholder={isHe ? 'לדוגמה: "אפל הכריזה על עיכוב בהשקת מוצר חדש"' : 'e.g. "Apple announces product launch delay"'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  disabled={isAnalyzingCustom}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isHe ? 'סימול מניה (אופציונלי):' : 'Ticker (optional):'}
                </label>
                <input
                  type="text"
                  value={customTickerInput}
                  onChange={(e) => setCustomTickerInput(e.target.value.toUpperCase())}
                  placeholder="NVDA, AAPL..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase"
                  disabled={isAnalyzingCustom}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAnalyzingCustom || !customNewsInput.trim()}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
              >
                {isAnalyzingCustom ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isHe ? 'מנתח תגובה...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isHe ? 'הפק ניתוח תגובה' : 'Generate Reaction Analysis'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. SEARCH BAR & REACTION FILTERS */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3.5 ltr:left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isExactTickerQuery) {
                  e.preventDefault();
                  handleScanTickerNews(searchQuery.trim(), true);
                }
              }}
              placeholder={
                isHe
                  ? 'חפש מניה או נושא בחדשות (לדוגמה: NVDA, AAPL, בינה מלאכותית, דוחות)...'
                  : 'Filter news by ticker or keyword (e.g. NVDA, AAPL, earnings)...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isExactTickerQuery && (
              <button
                type="button"
                onClick={() => handleScanTickerNews(searchQuery.trim(), true)}
                disabled={isScanningTicker}
                className="px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isScanningTicker
                    ? isHe
                      ? 'מושך חדשות...'
                      : 'Fetching...'
                    : isHe
                    ? `משוך חדשות ל-${searchQuery.trim().toUpperCase()}`
                    : `Fetch News for ${searchQuery.trim().toUpperCase()}`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleScanMyStocks}
              disabled={isScanningAllPortfolio}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isScanningAllPortfolio
                  ? isHe
                    ? 'סורק מניות שלך...'
                    : 'Scanning your stocks...'
                  : isHe
                  ? 'עדכן חדשות למניות שלי'
                  : 'Scan My Portfolio & Watchlist'}
              </span>
            </button>
          </div>
        </div>

        {/* Clean Segmented Reaction Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-xs">
          {[
            { id: 'ALL', label: isHe ? 'כל החדשות להיום' : "Today's News", count: counts.all },
            { id: 'MY_STOCKS', label: isHe ? 'התיק והמעקב שלי' : 'My Stocks', count: counts.myStocks },
            { id: 'POSITIVE', label: isHe ? 'תגובה חיובית (עליות)' : 'Positive Reaction', count: counts.positive },
            { id: 'NEGATIVE', label: isHe ? 'תגובת לחץ (ירידות)' : 'Negative Pressure', count: counts.negative },
            { id: 'MIXED', label: isHe ? 'תגובה מעורבת / עדכונים' : 'Mixed / Updates', count: counts.mixed },
          ].map((tab) => {
            const active = reactionFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReactionFilter(tab.id as ReactionFilter)}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] font-mono tabular-nums ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DAILY NEWS & REACTION ANALYSIS FEED */}
      <div className="space-y-4">
        {isInitialLoading ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
            <h3 className="text-base font-bold text-slate-200">
              {isHe ? 'טוען חדשות שוק עדכניות להיום...' : "Loading today's verified market news..."}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isHe
                ? 'מסנן כותרות לא רלוונטיות ומביא עדכונים חיים מ-CNBC, Wall Street Journal ו-Yahoo Finance.'
                : 'Filtering out noise and pulling live verified updates.'}
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <BellRing className="w-9 h-9 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">
              {isHe ? 'לא נמצאו חדשות מתאימות לסינון שנבחר' : 'No news matching the selected filter'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isHe
                ? 'אפשר לאפס את החיפוש או ללחוץ על "משוך חדשות" אם הקלדת סימול מניה ספציפית.'
                : 'Reset filters or fetch breaking news for a specific ticker.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {isExactTickerQuery && (
                <button
                  type="button"
                  onClick={() => handleScanTickerNews(searchQuery.trim(), true)}
                  disabled={isScanningTicker}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  {isHe ? `משוך חדשות ל-${searchQuery.trim().toUpperCase()}` : `Scan ${searchQuery.trim().toUpperCase()}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setReactionFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                {isHe ? 'הצג את כל החדשות' : 'Show All News'}
              </button>
            </div>
          </div>
        ) : (
          filteredNews.map((item) => {
            const stockMatch = stocks.find((s) => s.ticker === item.ticker);
            const liveQuote = livePrices[item.ticker] || liveNewsQuotes[item.ticker];
            const displayPrice =
              liveQuote?.price ??
              item.preMarketPrice ??
              (stockMatch ? parseFloat(stockMatch.currentPrice.replace(/[^0-9.]/g, '')) : undefined);
            const displayChange = liveQuote?.changePercent ?? item.preMarketChangePercent;
            const inPortfolio = portfolioTickersSet.has(item.ticker.toUpperCase());
            const inWatchlist = watchlistTickersSet.has(item.ticker.toUpperCase());
            const dir = getReactionDirection(item);

            const reactionColor =
              dir === 'POSITIVE'
                ? 'text-emerald-400'
                : dir === 'NEGATIVE'
                ? 'text-rose-400'
                : 'text-sky-400';

            const reactionBorder =
              dir === 'NEGATIVE'
                ? 'border-rose-500/30 hover:border-rose-500/50'
                : dir === 'POSITIVE'
                ? 'border-emerald-500/30 hover:border-emerald-500/50'
                : 'border-slate-800 hover:border-slate-700';

            const rx = item.reactionAnalysis;
            const reactionLabel = isHe
              ? rx?.expectedReactionLabelHe ||
                (dir === 'POSITIVE'
                  ? 'צפי לתגובה חיובית (עליות)'
                  : dir === 'NEGATIVE'
                  ? 'צפי לתגובת לחץ (ירידות)'
                  : 'תגובה מעורבת / תנודתיות')
              : rx?.expectedReactionLabelEn || 'Reaction Analysis';

            const whyText = isHe
              ? rx?.whyReactingHe || item.recommendation?.impactAnalysisHe
              : rx?.whyReactingEn || item.recommendation?.impactAnalysisEn;

            const overreactionText = isHe
              ? rx?.isOverreactionOrRealHe || item.recommendation?.riskFactorHe
              : rx?.isOverreactionOrRealEn || item.recommendation?.riskFactorEn;

            const respondText = isHe
              ? rx?.howToRespondHe || item.recommendation?.openingBellGamePlanHe
              : rx?.howToRespondEn || item.recommendation?.openingBellGamePlanEn;

            return (
              <article
                key={item.id}
                className={`bg-slate-900/75 border ${reactionBorder} rounded-2xl p-4 sm:p-5 space-y-4 transition`}
              >
                {/* Top Row: Stock Identity + Live Price Reaction + Source & Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <StockLogoBadge ticker={item.ticker} name={item.companyName} size="md" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => stockMatch && onSelectStock(stockMatch)}
                          className={`font-mono font-bold text-base text-white ${stockMatch ? 'hover:text-cyan-300 cursor-pointer' : ''}`}
                        >
                          {item.ticker}
                        </button>
                        <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                          {item.companyName}
                        </span>
                        {inPortfolio && (
                          <span className="text-[11px] font-medium text-cyan-300 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{isHe ? 'בתיק שלי' : 'In Portfolio'}</span>
                          </span>
                        )}
                        {inWatchlist && (
                          <span className="text-[11px] font-medium text-amber-300 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{isHe ? 'במעקב' : 'Watching'}</span>
                          </span>
                        )}
                      </div>

                      {/* Real-time Price & Reaction */}
                      {typeof displayPrice === 'number' && !isNaN(displayPrice) && (
                        <div className="flex items-center gap-2 text-xs font-mono tabular-nums pt-0.5">
                          <span className="text-slate-300 font-semibold">${displayPrice.toFixed(2)}</span>
                          {typeof displayChange === 'number' && !isNaN(displayChange) && (
                            <span className={`font-semibold flex items-center gap-0.5 ${displayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {displayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              <span>
                                {displayChange >= 0 ? '+' : ''}
                                {displayChange.toFixed(2)}%
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Source & Time Today */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition font-medium"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.source}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ) : (
                      <span className="font-medium text-slate-300">{item.source}</span>
                    )}
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.publishedTime}</span>
                    </span>
                  </div>
                </div>

                {/* News Content: What Happened Today */}
                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug text-balance">
                    {item.headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Core Reaction Analysis Block ("ניתוח תגובה") */}
                <div className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <MessageSquareText className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">{isHe ? 'ניתוח תגובה:' : 'Reaction Analysis:'}</span>
                      <span className={reactionColor}>{reactionLabel}</span>
                    </div>
                    {(rx?.expectedMoveRange || item.estimatedImpactPct) && (
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {isHe ? 'טווח תגובה משוער:' : 'Expected Move:'}{' '}
                        <strong className={reactionColor}>{rx?.expectedMoveRange || item.estimatedImpactPct}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-400">
                        {isHe ? 'למה המניה מגיבה ככה?' : 'Why is the stock reacting?'}
                      </div>
                      <p className="text-slate-200 leading-relaxed">{whyText}</p>
                    </div>

                    <div className="space-y-1 md:border-s md:border-slate-800/80 md:ps-4">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHe ? 'האם זו הגזמה או שינוי אמיתי?' : 'Overreaction or Fundamental Shift?'}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{overreactionText}</p>
                    </div>

                    <div className="space-y-1 md:border-s md:border-slate-800/80 md:ps-4">
                      <div className="text-xs font-semibold text-cyan-400">
                        {isHe ? 'איך מומלץ לפעול בתגובה?' : 'How to Respond'}
                      </div>
                      <p className="text-slate-100 leading-relaxed font-medium">{respondText}</p>
                    </div>
                  </div>
                </div>

                {/* Clean Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {stockMatch && (
                      <button
                        type="button"
                        onClick={() => onOpenDeepDive(stockMatch)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isHe ? 'מחקר מלא למניה' : 'Full Deep Dive'}</span>
                      </button>
                    )}

                    {stockMatch && (
                      <button
                        type="button"
                        onClick={() => onToggleWatchlist(stockMatch)}
                        className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          inWatchlist
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                        <span>{inWatchlist ? (isHe ? 'במעקב' : 'Watching') : isHe ? 'הוסף למעקב' : 'Watch'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScanTickerNews(item.ticker, true)}
                      disabled={isScanningTicker}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanningTicker ? 'animate-spin' : ''}`} />
                      <span>{isHe ? 'רענן ניתוח למניה' : 'Refresh Analysis'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyShare(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{isHe ? 'הועתק' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isHe ? 'העתק ניתוח' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
