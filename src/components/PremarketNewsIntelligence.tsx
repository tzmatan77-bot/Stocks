import React, { useState, useEffect, useMemo } from 'react';
import { ResearchStock, WatchlistItem, PremarketNewsItem, PremarketMarketPulse, PremarketRecommendationAction, PremarketCategory } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { Top10PremarketGainers } from './Top10PremarketGainers';
import { EarlyAnalystRadar } from './EarlyAnalystRadar';
import { SupportedLanguage } from '../i18n';
import { INITIAL_PREMARKET_NEWS_FEED, getCalculatedMarketPulse } from '../data/premarketNewsData';
import {
  Bell,
  BellRing,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Zap,
  Target,
  FileText,
  Plus,
  Star,
  CheckCircle2,
  DollarSign,
  Activity,
  Send,
  Globe,
  Share2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Flame,
  Play,
  Pause,
  Calendar,
} from 'lucide-react';
import { EarningsCalendarViewer } from './EarningsCalendarViewer';

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

export const PremarketNewsIntelligence: React.FC<PremarketNewsIntelligenceProps> = ({
  stocks,
  watchlist,
  livePrices = {},
  onToggleWatchlist,
  onAddToPortfolio,
  onOpenDeepDive,
  onSelectStock,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';

  const [premarketViewTab, setPremarketViewTab] = useState<'topGainers' | 'analystsRadar' | 'feed' | 'earnings'>('feed');
  const [newsList, setNewsList] = useState<PremarketNewsItem[]>(INITIAL_PREMARKET_NEWS_FEED);
  const [pulse, setPulse] = useState<PremarketMarketPulse>(getCalculatedMarketPulse());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('ALL');
  const [selectedMovementFilter, setSelectedMovementFilter] = useState<'ALL' | 'JUMPS' | 'DROPS' | 'REVISIONS' | 'NASDAQ' | 'SP500' | 'MY_PORTFOLIO' | 'WATCHLIST'>('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<'ALL' | 'ZACKS' | 'MORGAN' | 'WSJ' | 'BLOOMBERG' | 'YAHOO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // User's personal portfolio holdings (synchronized with user's 9 real holdings)
  const [portfolioPositions, setPortfolioPositions] = useState<{ ticker: string; companyName?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { ticker: 'GOOGL' },
      { ticker: 'AMZN' },
      { ticker: 'NVDA' },
      { ticker: 'ABBV' },
      { ticker: 'UBER' },
      { ticker: 'BKNG' },
      { ticker: 'SOFI' },
      { ticker: 'NOW' },
      { ticker: 'KO' },
    ];
  });

  // Auto-refresh & live streaming states
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [feedNotification, setFeedNotification] = useState<string | null>(null);
  const [liveNewsQuotes, setLiveNewsQuotes] = useState<Record<string, { price: number; changePercent: number }>>({});
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Keep portfolio positions synced with localStorage
  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setPortfolioPositions(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('portfolio-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('portfolio-updated', handleStorageUpdate);
    };
  }, []);

  const portfolioTickersSet = useMemo(() => {
    return new Set(portfolioPositions.map((p) => p.ticker.toUpperCase().trim()));
  }, [portfolioPositions]);

  const watchlistTickersSet = useMemo(() => {
    return new Set(watchlist.map((w) => w.ticker.toUpperCase().trim()));
  }, [watchlist]);

  // Universal Quick Stock Scanner State
  const [quickScanInput, setQuickScanInput] = useState<string>('');
  const [isScanningTicker, setIsScanningTicker] = useState<boolean>(false);
  const [isScanningAllPortfolio, setIsScanningAllPortfolio] = useState<boolean>(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Daily Pre-Market Notification & Alerts State
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('premarket_alerts_active') === 'true';
    } catch {
      return false;
    }
  });
  const [showNotificationToast, setShowNotificationToast] = useState<{
    title: string;
    ticker: string;
    message: string;
    type: 'JUMP' | 'DROP';
    impact: string;
  } | null>(null);
  const [showMorningDigestModal, setShowMorningDigestModal] = useState<boolean>(false);

  // Custom AI news analyzer state
  const [customNewsInput, setCustomNewsInput] = useState<string>('');
  const [customTickerInput, setCustomTickerInput] = useState<string>('');
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);
  const [customAnalysisResult, setCustomAnalysisResult] = useState<PremarketNewsItem | null>(null);
  const [showCustomAnalyzer, setShowCustomAnalyzer] = useState<boolean>(false);

  // Multi-Source Live Web News Engine State
  const [webSearchQuery, setWebSearchQuery] = useState<string>('Wall Street stock market breaking news today');
  const [webArticles, setWebArticles] = useState<any[]>([]);
  const [isSearchingWebNews, setIsSearchingWebNews] = useState<boolean>(false);
  const [hasSearchedWebNews, setHasSearchedWebNews] = useState<boolean>(false);
  const [webNewsFeedback, setWebNewsFeedback] = useState<string | null>(null);

  const handleSearchWebNews = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : webSearchQuery).trim();
    if (!q) return;
    setIsSearchingWebNews(true);
    setWebNewsFeedback(null);
    try {
      const res = await fetch(`/api/web-news-search?q=${encodeURIComponent(q)}`, {
        headers: { 'Accept': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && Array.isArray(data.articles)) {
          setWebArticles(data.articles);
          setHasSearchedWebNews(true);
          setWebNewsFeedback(
            isHe
              ? `נמצאו ${data.articles.length} דיווחים עדכניים מרחבי הרשת (WSJ, Bloomberg, CNBC, Yahoo Finance)`
              : `Found ${data.articles.length} live reports from WSJ, Bloomberg, CNBC, Yahoo Finance.`
          );
        }
      }
    } catch (err) {
      console.error('Web news search error:', err);
      setWebNewsFeedback(isHe ? 'שגיאה במשיכת דיווחים מהרשת' : 'Failed to fetch live web news');
    } finally {
      setIsSearchingWebNews(false);
    }
  };

  // Auto-search on mount once for live external breaking intelligence
  useEffect(() => {
    handleSearchWebNews('Wall Street stock market breaking news today');
  }, []);

  // Universal Ticker News & Risk Scanner
  const handleQuickScanStock = async (tickerOverride?: string, forceRefresh: boolean = false) => {
    const raw = (tickerOverride || quickScanInput).trim().toUpperCase();
    if (!raw) return;
    setIsScanningTicker(true);
    setScanFeedback(null);
    try {
      const url = `/api/ticker-news-alert/${raw}${forceRefresh ? '?forceRefresh=true' : ''}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const item: PremarketNewsItem = await res.json();
        setNewsList((prev) => [item, ...prev.filter((n) => n.ticker.toUpperCase() !== item.ticker.toUpperCase())]);
        setScanFeedback(
          isHe
            ? `✅ נסרקה בהצלחה: התראות וניתוח מעודכן בזמן אמת עבור ${item.ticker} (${item.companyName}) עודכנו בראש הפיד!`
            : `✅ Successfully refreshed live news & alerts for ${item.ticker}!`
        );
        setSelectedMovementFilter('ALL');
        setQuickScanInput('');
        setTimeout(() => setScanFeedback(null), 7000);
      } else {
        setScanFeedback(isHe ? `לא הצלחנו להפיק התראה עבור ${raw}` : `Could not generate alert for ${raw}`);
      }
    } catch (err) {
      console.error('Scan stock error:', err);
      setScanFeedback(isHe ? `שגיאה בסריקת ${raw}` : `Error scanning ${raw}`);
    } finally {
      setIsScanningTicker(false);
    }
  };

  // Full Portfolio Immediate News & Risk Scan
  const handleScanAllPortfolio = async () => {
    const tickers = Array.from(portfolioTickersSet);
    if (tickers.length === 0) return;
    setIsScanningAllPortfolio(true);
    setScanFeedback(null);
    try {
      const res = await fetch('/api/portfolio-news-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ tickers }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const newItems: PremarketNewsItem[] = data.results;
          setNewsList((prev) => {
            const existingIds = new Set(newItems.map((n) => n.ticker.toUpperCase()));
            return [...newItems, ...prev.filter((n) => !existingIds.has(n.ticker.toUpperCase()))];
          });
          setScanFeedback(
            isHe
              ? `✅ סריקת תיק הושלמה: נסרקו ${data.totalScanned} מניות בתיק האישי שלך! נמצאו ${data.criticalWarningsCount} אזהרות חריגות.`
              : `✅ Portfolio scan complete: Scanned ${data.totalScanned} holdings with ${data.criticalWarningsCount} critical alerts.`
          );
          setSelectedMovementFilter('MY_PORTFOLIO');
        }
      }
    } catch (e) {
      console.error('Failed to scan portfolio news', e);
    } finally {
      setIsScanningAllPortfolio(false);
    }
  };

  // Identify any critical downside warnings in user's portfolio
  const portfolioCriticalAlerts = useMemo(() => {
    return newsList.filter(
      (n) =>
        portfolioTickersSet.has(n.ticker.toUpperCase()) &&
        (n.movementType === 'SHARP_DROP_WARNING' ||
          n.catalystSeverity === 'CRITICAL' ||
          (n.preMarketChangePercent || 0) <= -2.0)
    );
  }, [newsList, portfolioTickersSet]);

  // Handle Toggle Browser/In-App Pre-Market Alerts
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('🔔 מערכת התראות טרום-מסחר הופעלה בהצלחה!', {
              body: 'תקבל התראה אוטומטית בכל בוקר לקראת הפתיחה על מניות S&P 500 ו-נאסד"ק לפני קפיצה או אזהרת ירידה חדה.',
              icon: '/favicon.ico',
            });
          }
        } catch (e) {
          console.log('Notification API error:', e);
        }
      }
      localStorage.setItem('premarket_alerts_active', 'true');
      setNotificationsEnabled(true);
      setShowNotificationToast({
        title: isHe ? 'התראות טרום-מסחר פעילות!' : 'Pre-Market Alerts Active!',
        ticker: 'S&P/NASDAQ',
        message: isHe
          ? 'המערכת תשלח התראה בכל בוקר על תנועות חריגות וקטליזטורים מהותיים.'
          : 'System will alert every morning on significant pre-market movers.',
        type: 'JUMP',
        impact: 'S&P 500 & NASDAQ 100',
      });
      setTimeout(() => setShowNotificationToast(null), 5000);
    } else {
      localStorage.setItem('premarket_alerts_active', 'false');
      setNotificationsEnabled(false);
    }
  };

  // Simulate morning alert trigger
  const handleSimulateAlert = () => {
    const jumps = newsList.filter((n) => n.movementType === 'IMPENDING_JUMP');
    const drops = newsList.filter((n) => n.movementType === 'SHARP_DROP_WARNING');
    const firstJump = jumps[0];
    const firstDrop = drops[0];

    setShowNotificationToast({
      title: isHe ? 'מבזק טרום-מסחר דחוף: זוהו קטליזטורים חריגים!' : 'Urgent Pre-Market Movers Detected!',
      ticker: `${firstJump?.ticker || 'NVDA'} / ${firstDrop?.ticker || 'INTC'}`,
      message: isHe
        ? `🚀 קפיצה צפויה ב-${firstJump?.ticker} (${firstJump?.preMarketChangePercent > 0 ? '+' : ''}${firstJump?.preMarketChangePercent}%) מול ⚠️ אזהרת צניחה ב-${firstDrop?.ticker} (${firstDrop?.preMarketChangePercent}%).`
        : `🚀 Breakout in ${firstJump?.ticker} vs ⚠️ Downside alert in ${firstDrop?.ticker}.`,
      type: 'JUMP',
      impact: `${jumps.length} מועמדות לזינוק • ${drops.length} אזהרות ירידה`,
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`מבזק פתיחה: ${firstJump?.ticker} מזנקת מול אזהרה ב-${firstDrop?.ticker}`, {
          body: `זוהו ${jumps.length} מניות לפני קפיצה ו-${drops.length} אזהרות ירידה בנאסד"ק וב-S&P 500!`,
        });
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => setShowNotificationToast(null), 6500);
  };

  // Track elapsed seconds since last refreshed
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefreshedAt]);

  // Keep NY & Israel clocks synced every 30s without overwriting live server market pulse metrics
  useEffect(() => {
    const updateClock = () => {
      const freshClocks = getCalculatedMarketPulse();
      setPulse((prev) => ({
        ...prev,
        sessionStatus: freshClocks.sessionStatus,
        nyTimeStr: freshClocks.nyTimeStr,
        israelTimeStr: freshClocks.israelTimeStr,
        minutesToOpen: freshClocks.minutesToOpen,
      }));
    };
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch premarket news on mount and periodically
  const fetchNews = async (isBackground = false) => {
    try {
      const res = await fetch('/api/premarket-news', {
        headers: { Accept: 'application/json' },
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setNewsList(data.news);
          if (data.pulse) setPulse(data.pulse);
          setLastRefreshedAt(new Date());
          if (!isBackground) {
            setFeedNotification(isHe ? 'פיד קדם-מסחר סונכרן בהצלחה!' : 'Pre-market feed synced successfully!');
            setTimeout(() => setFeedNotification(null), 4000);
          }
        }
      }
    } catch (e) {
      // Fallback to initial data quietly
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  // Auto-refresh countdown timer (every 30 seconds)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchNews(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  // Periodic live quotes fetching for all tickers appearing in the news list
  useEffect(() => {
    let isMounted = true;
    const fetchQuotesForFeed = async () => {
      try {
        const uniqueTickers = Array.from(new Set(newsList.map((n) => n.ticker.toUpperCase().trim()).filter(Boolean)));
        if (uniqueTickers.length === 0) return;
        const res = await fetch(`/api/quotes?tickers=${encodeURIComponent(uniqueTickers.join(','))}`, {
          headers: { Accept: 'application/json' },
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (isMounted && data && data.quotes) {
            setLiveNewsQuotes((prev) => ({ ...prev, ...data.quotes }));
          }
        }
      } catch (e) {
        // quiet fallback
      }
    };

    fetchQuotesForFeed();
    const interval = setInterval(fetchQuotesForFeed, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [newsList]);

  // Manual regenerate news with live breaking RSS & live quotes
  const handleRegenerateFeed = async () => {
    setIsRefreshingFeed(true);
    setFeedNotification(null);
    try {
      const [regenRes] = await Promise.all([
        fetch('/api/premarket-news/regenerate', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }),
        handleSearchWebNews(webSearchQuery),
      ]);
      const contentType = regenRes.headers.get('content-type');
      if (regenRes.ok && contentType && contentType.includes('application/json')) {
        const data = await regenRes.json();
        if (data.news && Array.isArray(data.news)) {
          setNewsList(data.news);
          if (data.pulse) setPulse(data.pulse);
          setLastRefreshedAt(new Date());
          setCountdown(30);
          const rssCount = typeof data.liveRssCount === 'number' ? data.liveRssCount : data.news.filter((n: any) => n.isLiveRss).length;
          setFeedNotification(
            isHe
              ? `✅ פיד החדשות סונכרן בזמן אמת (${rssCount} מבזקים חיים מ-Yahoo/Google RSS + מחירי שוק מעודכנים)!`
              : `✅ News feed synced live (${rssCount} breaking RSS wires + live market quotes)!`
          );
          setTimeout(() => setFeedNotification(null), 6000);
        }
      } else {
        console.warn('Premarket regenerate feed did not return JSON', regenRes.status);
      }
    } catch (e) {
      console.error('Failed to regenerate premarket news', e);
      setFeedNotification(isHe ? 'שגיאה זמנית ברענון, נסה שנית בעוד מספר רגעים' : 'Temporary refresh error, please retry');
      setTimeout(() => setFeedNotification(null), 5000);
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  // Custom AI news analysis
  const handleAnalyzeCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNewsInput.trim()) return;

    setIsAnalyzingCustom(true);
    try {
      const res = await fetch('/api/premarket-analyze', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: customNewsInput.trim(),
          ticker: customTickerInput.trim().toUpperCase(),
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        const fullItem: PremarketNewsItem = {
          id: `custom-${Date.now()}`,
          ticker: data.ticker || customTickerInput.trim().toUpperCase() || 'MKT',
          companyName: data.companyName || `${customTickerInput.trim().toUpperCase()} Market Asset`,
          headline: data.headline || customNewsInput.slice(0, 100),
          summary: data.summary || customNewsInput,
          source: data.source || 'דיווח מותאם אישית (Custom Source)',
          publishedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: isHe ? 'היום • ניתוח חי' : 'Today • Live AI Analysis',
          category: data.category || 'EARNINGS_CATALYST',
          sentiment: data.sentiment || 'NEUTRAL',
          preMarketPrice: livePrices[data.ticker]?.price || 150.0,
          preMarketChangePercent: livePrices[data.ticker]?.changePercent || 0,
          recommendation: data.recommendation,
        };

        setCustomAnalysisResult(fullItem);
        // Also add to top of feed
        setNewsList((prev) => [fullItem, ...prev]);
        setCustomNewsInput('');
        setCustomTickerInput('');
      } else {
        console.warn('Premarket analyze did not return JSON', res.status);
      }
    } catch (err) {
      console.error('Failed to analyze custom news', err);
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const handleCopyShare = (item: PremarketNewsItem) => {
    const textToCopy = `📢 ${item.headline} (${item.ticker})
מקור: ${item.source}
המלצת פעולה לפתיחה: ${item.recommendation.actionLabelHe} (ציון ביטחון ${item.recommendation.confidenceScore}%)
השפעה על החפיר: ${item.recommendation.impactAnalysisHe}
תוכנית פעולה לפתיחת המסחר: ${item.recommendation.openingBellGamePlanHe}
מחיר יעד: $${item.recommendation.targetPrice} | טווח קנייה עד: $${item.recommendation.buyZoneMax}
מתוך: מחקר מניות איכות ואופק שנתיים (2Y)`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pre-market statistics
  const stats = useMemo(() => {
    const jumpsCount = newsList.filter(
      (n) => n.movementType === 'IMPENDING_JUMP' || n.messageCategory === 'SHARP_RISE' || (n.preMarketChangePercent || 0) > 1.5
    ).length;
    const dropsCount = newsList.filter(
      (n) => n.movementType === 'SHARP_DROP_WARNING' || n.messageCategory === 'DROP_WARNING' || (n.preMarketChangePercent || 0) < -1.0
    ).length;
    const revisionsCount = newsList.filter(
      (n) => n.movementType === 'FORECAST_REVISION' || n.messageCategory === 'FORECAST_REVISION'
    ).length;
    const nasdaqCount = newsList.filter(
      (n) => n.indexOrigin === 'NASDAQ_100' || n.indexOrigin === 'BOTH'
    ).length;
    const spCount = newsList.filter(
      (n) => n.indexOrigin === 'SP_500' || n.indexOrigin === 'BOTH'
    ).length;
    const portfolioCount = newsList.filter((n) =>
      portfolioTickersSet.has(n.ticker.toUpperCase())
    ).length;
    const watchlistCount = newsList.filter((n) =>
      watchlistTickersSet.has(n.ticker.toUpperCase())
    ).length;
    return {
      jumpsCount,
      dropsCount,
      revisionsCount,
      nasdaqCount,
      spCount,
      portfolioCount,
      watchlistCount,
      totalCount: newsList.length,
    };
  }, [newsList, portfolioTickersSet, watchlistTickersSet]);

  // Filtered news items
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      // Movement / Index Radar Filter
      if (selectedMovementFilter === 'JUMPS') {
        if (item.movementType !== 'IMPENDING_JUMP' && item.messageCategory !== 'SHARP_RISE' && (item.preMarketChangePercent || 0) <= 1.5) {
          return false;
        }
      } else if (selectedMovementFilter === 'DROPS') {
        if (item.movementType !== 'SHARP_DROP_WARNING' && item.messageCategory !== 'DROP_WARNING' && (item.preMarketChangePercent || 0) >= -1.0) {
          return false;
        }
      } else if (selectedMovementFilter === 'REVISIONS') {
        if (item.movementType !== 'FORECAST_REVISION' && item.messageCategory !== 'FORECAST_REVISION') {
          return false;
        }
      } else if (selectedMovementFilter === 'NASDAQ') {
        if (item.indexOrigin !== 'NASDAQ_100' && item.indexOrigin !== 'BOTH') {
          return false;
        }
      } else if (selectedMovementFilter === 'SP500') {
        if (item.indexOrigin !== 'SP_500' && item.indexOrigin !== 'BOTH') {
          return false;
        }
      } else if (selectedMovementFilter === 'MY_PORTFOLIO') {
        if (!portfolioTickersSet.has(item.ticker.toUpperCase())) {
          return false;
        }
      } else if (selectedMovementFilter === 'WATCHLIST') {
        if (!watchlistTickersSet.has(item.ticker.toUpperCase())) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Action filter
      if (selectedActionFilter !== 'ALL') {
        if (selectedActionFilter === 'BUY' && item.recommendation.action !== 'STRONG_BUY') return false;
        if (selectedActionFilter === 'ACCUMULATE' && item.recommendation.action !== 'ACCUMULATE_ON_DIP') return false;
        if (selectedActionFilter === 'HOLD' && item.recommendation.action !== 'HOLD_MONITOR') return false;
        if (selectedActionFilter === 'CAUTION' && item.recommendation.action !== 'CAUTION_ALERT') return false;
      }
      // Source filter (Zacks, Morgan Stanley/JPMorgan, WSJ, Bloomberg)
      if (selectedSourceFilter !== 'ALL') {
        const s = (item.source || '').toLowerCase();
        const h = (item.headline || '').toLowerCase();
        if (selectedSourceFilter === 'ZACKS') {
          if (!s.includes('zacks') && !s.includes('זקס') && !h.includes('zacks') && !h.includes('זקס')) return false;
        } else if (selectedSourceFilter === 'MORGAN') {
          if (!s.includes('morgan') && !s.includes('מורגן') && !h.includes('morgan') && !h.includes('מורגן')) return false;
        } else if (selectedSourceFilter === 'WSJ') {
          if (!s.includes('wsj') && !s.includes('wall street journal') && !h.includes('wsj')) return false;
        } else if (selectedSourceFilter === 'BLOOMBERG') {
          if (!s.includes('bloomberg') && !h.includes('bloomberg') && !h.includes('בלומברג')) return false;
        } else if (selectedSourceFilter === 'YAHOO') {
          if (!s.includes('yahoo') && !h.includes('yahoo') && !s.includes('יאהו')) return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTicker = item.ticker.toLowerCase().includes(q);
        const matchesHeadline = item.headline.toLowerCase().includes(q);
        const matchesCompany = item.companyName.toLowerCase().includes(q);
        const matchesSource = item.source.toLowerCase().includes(q);
        if (!matchesTicker && !matchesHeadline && !matchesCompany && !matchesSource) {
          return false;
        }
      }
      return true;
    });
  }, [newsList, selectedMovementFilter, selectedCategory, selectedActionFilter, selectedSourceFilter, searchQuery]);

  const getMovementBadge = (item: PremarketNewsItem) => {
    // 🔴 אדום: אזהרת ירידה
    if (
      item.movementType === 'SHARP_DROP_WARNING' ||
      item.messageCategory === 'DROP_WARNING' ||
      (item.preMarketChangePercent || 0) < -1.5
    ) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/60 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm shadow-rose-950/60 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>{isHe ? '🔴 אזהרת ירידה' : '🔴 Sharp Drop Alert'}</span>
          {item.estimatedImpactPct && (
            <span className="font-mono bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-700/50 text-rose-200 text-[10px]">
              {item.estimatedImpactPct}
            </span>
          )}
        </span>
      );
    }

    // 🟢 ירוק: אפשרות לעלייה חדה
    if (
      item.movementType === 'IMPENDING_JUMP' ||
      item.messageCategory === 'SHARP_RISE' ||
      (item.preMarketChangePercent || 0) > 1.8
    ) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm shadow-emerald-950/60">
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>{isHe ? '🟢 אפשרות לעלייה חדה' : '🟢 Potential Sharp Rise'}</span>
          {item.estimatedImpactPct && (
            <span className="font-mono bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-700/50 text-emerald-200 text-[10px]">
              {item.estimatedImpactPct}
            </span>
          )}
        </span>
      );
    }

    // 🔵 כחול: שינוי תחזיות
    if (
      item.movementType === 'FORECAST_REVISION' ||
      item.messageCategory === 'FORECAST_REVISION'
    ) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm shadow-blue-950/60">
          <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          <span>{isHe ? '🔵 שינוי תחזיות' : '🔵 Forecast Revision'}</span>
          {item.estimatedImpactPct && (
            <span className="font-mono bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-700/50 text-blue-200 text-[10px]">
              {item.estimatedImpactPct}
            </span>
          )}
        </span>
      );
    }

    return null;
  };

  const getIndexBadge = (origin?: string) => {
    if (origin === 'NASDAQ_100') {
      return (
        <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 text-[10px] font-mono font-bold">
          NASDAQ 100
        </span>
      );
    }
    if (origin === 'SP_500') {
      return (
        <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 text-[10px] font-mono font-bold">
          S&P 500
        </span>
      );
    }
    if (origin === 'BOTH') {
      return (
        <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/50 text-[10px] font-mono font-bold">
          S&P 500 & NASDAQ
        </span>
      );
    }
    return null;
  };

  const getCatalystLabel = (item: PremarketNewsItem) => {
    if (!item.catalystType) return null;
    switch (item.catalystType) {
      case 'EARNINGS_BEAT':
        return isHe ? '⚡ עקיפת תחזיות רבעונית' : 'Earnings Beat';
      case 'GUIDANCE_CUT':
        return isHe ? '📉 אזהרת רווח והנמכת הנחיות' : 'Guidance Cut';
      case 'ANALYST_UPGRADE':
        return isHe ? '⭐ שדרוג המלצה מוסדית' : 'Analyst Upgrade';
      case 'ANALYST_DOWNGRADE':
        return isHe ? '🔻 הורדת דירוג אנליסטים' : 'Analyst Downgrade';
      case 'REGULATORY_FDA':
        return isHe ? '🔬 אישור רגולטורי / FDA' : 'FDA / Regulatory Approval';
      case 'PARTNERSHIP_CONTRACT':
        return isHe ? '🤝 חוזה עתק / שותפות אסטרטגית' : 'Major Contract / Partnership';
      case 'MACRO_HEADWIND':
        return isHe ? '🌐 השפעת מאקרו וריבית' : 'Macro Headwind';
      default:
        return null;
    }
  };

  const getActionBadge = (action: PremarketRecommendationAction, label: string) => {
    switch (action) {
      case 'STRONG_BUY':
        return (
          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-950/40">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{label}</span>
          </span>
        );
      case 'ACCUMULATE_ON_DIP':
        return (
          <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-cyan-950/40">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>{label}</span>
          </span>
        );
      case 'HOLD_MONITOR':
        return (
          <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{label}</span>
          </span>
        );
      case 'CAUTION_ALERT':
      case 'TAKE_PROFIT':
        return (
          <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{label}</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: PremarketCategory) => {
    switch (cat) {
      case 'TECH_AI_CHIPS':
        return isHe ? '💻 טכנולוגיה & שבבים' : 'Tech & AI Chips';
      case 'HEALTHCARE_BIO':
        return isHe ? '🏥 בריאות & פארמה' : 'Healthcare & Bio';
      case 'CONSUMER_RETAIL':
        return isHe ? '🛒 צריכה & קמעונאות' : 'Consumer & Retail';
      case 'ANALYST_RATINGS':
        return isHe ? '📊 דירוגי אנליסטים' : 'Analyst Ratings';
      case 'MACRO_RATES':
        return isHe ? '🌐 מאקרו & ריבית' : 'Macro & Rates';
      case 'EARNINGS_CATALYST':
        return isHe ? '⚡ דוחות & קטליזטורים' : 'Earnings & Catalysts';
    }
  };

  const renderSourceBadge = (source: string, sourceUrl?: string) => {
    const sLower = (source || '').toLowerCase();
    const isZacks = sLower.includes('zacks') || sLower.includes('זקס');
    const isMorgan = sLower.includes('morgan') || sLower.includes('מורגן');
    const isWsj = sLower.includes('wsj') || sLower.includes('wall street journal');
    const isBloomberg = sLower.includes('bloomberg') || sLower.includes('בלומברג');
    const isReuters = sLower.includes('reuters') || sLower.includes('רויטרס');
    const isCnbc = sLower.includes('cnbc');
    const isYahoo = sLower.includes('yahoo') || sLower.includes('יאהו');

    let badgeClasses = 'bg-slate-800/80 text-cyan-300 border-slate-700/60';
    let icon = <Globe className="w-3 h-3 text-cyan-400" />;

    if (isZacks) {
      badgeClasses = 'bg-emerald-950 text-emerald-200 border-emerald-500/80 shadow-sm shadow-emerald-950/60 font-bold';
      icon = <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />;
    } else if (isMorgan) {
      badgeClasses = 'bg-blue-950 text-blue-200 border-blue-500/80 shadow-sm shadow-blue-950/60 font-bold';
      icon = <Briefcase className="w-3 h-3 text-blue-400" />;
    } else if (isWsj) {
      badgeClasses = 'bg-amber-950 text-amber-200 border-amber-600/70 font-serif font-bold';
      icon = <Globe className="w-3 h-3 text-amber-400" />;
    } else if (isBloomberg) {
      badgeClasses = 'bg-orange-950 text-orange-200 border-orange-600/70 font-mono font-bold';
      icon = <TrendingUp className="w-3 h-3 text-orange-400" />;
    } else if (isYahoo) {
      badgeClasses = 'bg-purple-950 text-purple-200 border-purple-500/80 shadow-sm shadow-purple-950/60 font-bold';
      icon = <TrendingUp className="w-3 h-3 text-purple-400" />;
    } else if (isReuters) {
      badgeClasses = 'bg-red-950 text-red-200 border-red-600/70 font-mono font-bold';
      icon = <Globe className="w-3 h-3 text-red-400" />;
    } else if (isCnbc) {
      badgeClasses = 'bg-cyan-950 text-cyan-200 border-cyan-600/70 font-mono font-bold';
      icon = <Globe className="w-3 h-3 text-cyan-400" />;
    }

    if (sourceUrl) {
      return (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border hover:opacity-90 transition cursor-pointer ${badgeClasses}`}
          title={source}
        >
          {icon}
          <span>{source}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
        </a>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeClasses}`}>
        {icon}
        <span>{source}</span>
      </span>
    );
  };

  const getSessionStatusBadge = () => {
    switch (pulse.sessionStatus) {
      case 'PRE_MARKET':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{isHe ? 'קדם-מסחר פעיל (Pre-Market)' : 'Pre-Market Session Active'}</span>
          </div>
        );
      case 'REGULAR_MARKET':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{isHe ? 'המסחר בוול-סטריט פתוח כעת' : 'US Market Open'}</span>
          </div>
        );
      case 'AFTER_HOURS':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{isHe ? 'מסחר מאוחר (After-Hours)' : 'After-Hours Session'}</span>
          </div>
        );
      case 'WEEKEND_CLOSED':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isHe ? 'השוק סגור • מתכוננים לפתיחה הבאה' : 'Market Closed • Preparing Pre-Market'}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BANNER: Wall Street Pre-Market Status & Countdown
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-4">
          {/* Top Status Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {getSessionStatusBadge()}
                
                {/* Live Streaming Pulse Indicator */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isHe ? 'שידור חי בזמן אמת' : 'Live Real-Time Feed'}</span>
                </span>

                <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>שעון ניו יורק (Wall St): <strong className="text-slate-200">{pulse.nyTimeStr}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>שעון ישראל: <strong className="text-slate-200">{pulse.israelTimeStr}</strong></span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <BellRing className="w-7 h-7 text-amber-400" />
                <span>{isHe ? 'מבזק קדם-מסחר יומי & המלצות לפתיחת השוק' : 'Daily Pre-Market Intelligence & Opening Bell Analysis'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                {isHe
                  ? 'ריכוז חדשות בזמן אמת ומאגרי מחקר מוסדיים מובילים (זקס - Zacks Rank #1, מורגן סטנלי, ג\'יי פי מורגן, WSJ, בלומברג, רויטרס ו-CNBC) עם ניתוח השפעה על החפיר הכלכלי, תוכנית פעולה מעשית לפתיחת המסחר והמלצות השקעה מוסדיות.'
                  : 'Real-time pre-market briefings synthesized from top institutional research (Zacks, Morgan Stanley, J.P. Morgan) and financial wire services, delivering actionable opening-bell game plans and institutional moat analysis.'}
              </p>
            </div>

            {/* Refresh Feed Controls & Auto-Refresh Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              
              {/* Auto-Refresh Toggle & Countdown */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono">
                <button
                  type="button"
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  title={autoRefreshEnabled ? 'השהה רענון אוטומטי' : 'הפעל רענון אוטומטי'}
                  className="p-1 rounded-lg hover:bg-slate-800 text-cyan-400 transition cursor-pointer"
                >
                  {autoRefreshEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="flex flex-col text-[11px] leading-tight">
                  <span className="text-slate-400">
                    {autoRefreshEnabled
                      ? (isHe ? `רענון אוטומטי: בעוד ${countdown} שנ'` : `Auto-Refresh in ${countdown}s`)
                      : (isHe ? 'רענון אוטומטי מושהה' : 'Auto-refresh paused')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {secondsAgo < 5
                      ? (isHe ? 'עודכן עכשיו' : 'Updated just now')
                      : (isHe ? `עודכן לפני ${secondsAgo} שניות` : `Updated ${secondsAgo}s ago`)}
                  </span>
                </div>
              </div>

              {/* Manual Refresh Feed Button */}
              <button
                onClick={handleRegenerateFeed}
                disabled={isRefreshingFeed}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingFeed ? 'animate-spin' : ''}`} />
                <span>{isRefreshingFeed ? (isHe ? 'מסנכרן חדשות עולמיות...' : 'Fetching Live Briefs...') : (isHe ? 'סנכרן חדשות שוק עולמיות' : 'Refresh Pre-Market Briefs')}</span>
              </button>

              <button
                onClick={() => setShowCustomAnalyzer(!showCustomAnalyzer)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHe ? 'נתח כותרת אישית ב-AI' : 'Analyze Custom News'}</span>
                {showCustomAnalyzer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Feedback notification toast banner */}
          {feedNotification && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/60 text-cyan-200 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl shadow-cyan-950/50 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feedNotification}</span>
              </div>
              <button
                onClick={() => setFeedNotification(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Market Pulse Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {(() => {
              const isSpNeg = String(pulse.sp500FuturesChange || '').trim().startsWith('-');
              const isNasNeg = String(pulse.nasdaqFuturesChange || '').trim().startsWith('-');
              return (
                <>
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-slate-400">{isHe ? 'מדד S&P 500 (SPY)' : 'S&P 500 (SPY)'}</span>
                    <span className={`text-sm sm:text-base font-extrabold font-mono flex items-center gap-1 ${isSpNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isSpNeg ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                      {pulse.sp500FuturesChange}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-slate-400">{isHe ? 'נאסד"ק 100 (QQQ)' : 'Nasdaq 100 (QQQ)'}</span>
                    <span className={`text-sm sm:text-base font-extrabold font-mono flex items-center gap-1 ${isNasNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isNasNeg ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                      {pulse.nasdaqFuturesChange}
                    </span>
                  </div>
                </>
              );
            })()}

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">{isHe ? 'תשואת אג"ח 10Y ארה"ב' : '10Y US Treasury'}</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-sky-400">
                {pulse.tenYearTreasuryYield}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-medium text-slate-400">{isHe ? 'מדד הפחד VIX' : 'VIX Volatility'}</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-indigo-300">
                {pulse.vixLevel}
              </span>
            </div>
          </div>

          {/* Daily Macro Brief Box */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 sm:p-3.5 flex items-start gap-3">
            <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </span>
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="font-bold text-white">{isHe ? 'תמונת המאקרו והשוק כרגע:' : 'Live Market Setup:'}</span>{' '}
              <span className="text-slate-300 leading-relaxed">
                {isHe ? pulse.dailyMacroBriefHe : pulse.dailyMacroBriefEn}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Live Breaking Market Alert Banner (sourced directly from top live RSS breaking wire) */}
      {(() => {
        const topBreakingAlert =
          newsList.find((n: any) => n.isLiveRss && n.catalystSeverity === 'CRITICAL') ||
          newsList.find((n: any) => n.isLiveRss) ||
          newsList[0];
        if (!topBreakingAlert) return null;

        const isAlertBearish = topBreakingAlert.sentiment === 'BEARISH' || topBreakingAlert.movementType === 'SHARP_DROP_WARNING';
        const liveQ = liveNewsQuotes[topBreakingAlert.ticker];
        const alertPrice = liveQ?.price ?? topBreakingAlert.preMarketPrice;
        const alertChg = liveQ?.changePercent ?? topBreakingAlert.preMarketChangePercent;

        return (
          <div className={`p-3.5 sm:p-4 rounded-xl bg-gradient-to-r ${
            isAlertBearish
              ? 'from-rose-950/80 via-slate-900 to-amber-950/60 border-rose-500/60'
              : 'from-cyan-950/80 via-slate-900 to-emerald-950/60 border-cyan-500/60'
          } border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg`}>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 animate-pulse ${isAlertBearish ? 'text-rose-400' : 'text-cyan-400'}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white">
                    {topBreakingAlert.headline}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-200 border border-slate-700 font-bold">
                    {topBreakingAlert.ticker} • ${typeof alertPrice === 'number' ? alertPrice.toFixed(2) : '—'} ({typeof alertChg === 'number' ? `${alertChg >= 0 ? '+' : ''}${alertChg.toFixed(2)}%` : ''})
                  </span>
                  <span className="text-[10px] font-mono text-amber-300">
                    {topBreakingAlert.publishedTime}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {topBreakingAlert.summary}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setPremarketViewTab('feed');
                  setSearchQuery(topBreakingAlert.ticker);
                  setSelectedMovementFilter('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-bold font-mono transition shrink-0 cursor-pointer flex items-center gap-1.5 shadow ${
                  isAlertBearish ? 'bg-rose-600 hover:bg-rose-500' : 'bg-cyan-600 hover:bg-cyan-500'
                }`}
              >
                <span>{isHe ? `התמקד במבזק ${topBreakingAlert.ticker}` : `Focus ${topBreakingAlert.ticker}`}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          PRIMARY PRE-MARKET TABS: TOP 10 GAINERS VS ANALYSTS RADAR VS NEWS FEED
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto font-sans text-xs">
        <button
          onClick={() => setPremarketViewTab('topGainers')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm ${
            premarketViewTab === 'topGainers'
              ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Flame className={`w-4 h-4 ${premarketViewTab === 'topGainers' ? 'text-slate-950 fill-slate-950' : 'text-amber-400'}`} />
          <span>{isHe ? '🚀 10 העולות הגדולות בטרום-מסחר (חדשות מול "סתם עולה")' : '🚀 Top 10 Gainers (News vs Fake Pump)'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black ${
            premarketViewTab === 'topGainers' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}>
            TOP 10
          </span>
        </button>

        <button
          onClick={() => setPremarketViewTab('analystsRadar')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm ${
            premarketViewTab === 'analystsRadar'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black shadow-lg shadow-indigo-950/40'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${premarketViewTab === 'analystsRadar' ? 'text-white' : 'text-indigo-400'}`} />
          <span>{isHe ? '🏛️ רדאר אנליסטים בכירים: התרעות מוקדמות (JPMorgan, Zacks, Citi)' : '🏛️ Senior Analysts Early Radar (JPMorgan, Zacks, Citi)'}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
            premarketViewTab === 'analystsRadar' ? 'bg-white text-indigo-950 font-black' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
          }`}>
            {isHe ? 'איתותים מוקדמים' : 'EARLY RADAR'}
          </span>
        </button>

        <button
          onClick={() => setPremarketViewTab('feed')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm ${
            premarketViewTab === 'feed'
              ? 'bg-indigo-600 text-white font-black shadow-lg shadow-indigo-950/40'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>{isHe ? '📰 פיד קטליזטורים, דוחות & אזהרות ירידה' : '📰 Full Catalyst Radar & News Feed'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 font-mono font-bold">
            {isHe ? '⚠️ אזהרות ירידה' : '⚠️ Alerts'}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {newsList.length}
          </span>
        </button>

        <button
          onClick={() => setPremarketViewTab('earnings')}
          className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm ${
            premarketViewTab === 'earnings'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-lg shadow-indigo-950/40'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Calendar className={`w-4 h-4 ${premarketViewTab === 'earnings' ? 'text-white' : 'text-indigo-400'}`} />
          <span>{isHe ? '📊 יומן דוחות כספיים של היום וניתוח AI' : "📊 Today's Earnings & AI Reports"}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 font-mono font-bold">
            {isHe ? 'היום' : 'TODAY'}
          </span>
        </button>
      </div>

      {premarketViewTab === 'topGainers' ? (
        <Top10PremarketGainers
          onSelectStock={onSelectStock}
          onOpenDeepDive={onOpenDeepDive}
          currentLang={currentLang}
          livePrices={{ ...livePrices, ...liveNewsQuotes }}
        />
      ) : premarketViewTab === 'analystsRadar' ? (
        <EarlyAnalystRadar
          onSelectStock={onSelectStock}
          onOpenDeepDive={onOpenDeepDive}
          currentLang={currentLang}
          livePrices={{ ...livePrices, ...liveNewsQuotes }}
        />
      ) : premarketViewTab === 'earnings' ? (
        <EarningsCalendarViewer
          stocks={stocks}
          onOpenDeepDive={onOpenDeepDive}
          currentLang={currentLang}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick banner to jump to Top 10 Gainers */}
          <div
            onClick={() => setPremarketViewTab('topGainers')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-600/50 hover:border-amber-400 flex items-center justify-between gap-3 cursor-pointer transition shadow-md group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:text-amber-200 border border-amber-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 block">
                  {isHe ? '🚀 מעבר לרדאר 10 העולות הגדולות בטרום-מסחר' : 'Top 10 Pre-Market Gainers Radar'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {isHe ? 'כולל בדיקת אמינות קריטית: מי עולה בגלל חדשה מאומתת ומי "סתם עולה" ללא חדשות!' : 'Includes news verification vs fake pump check!'}
                </span>
              </div>
            </div>
            <div className="text-amber-400 group-hover:text-amber-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0">
              <span>{isHe ? 'לדירוג 10 העולות' : 'View Top 10'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              1.4. PORTFOLIO CRITICAL DOWNSIDE & CATALYST ALERT BANNER
          ───────────────────────────────────────────────────────────── */}
      {portfolioCriticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl space-y-3 animate-pulse-slow">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-rose-200">
                    {isHe
                      ? `⚠️ התראת סיכון קריטית: זוהו ${portfolioCriticalAlerts.length} מניות בתיק האישי שלך עם אזהרות חריגות!`
                      : `⚠️ Critical Risk Alert: Detected ${portfolioCriticalAlerts.length} holdings in your portfolio with severe alerts!`}
                  </h3>
                </div>
                <p className="text-xs text-rose-300/90">
                  {isHe
                    ? 'האינטליגנציה המוסדית זיהתה קטליזטורים שליליים או שיבושים תפעוליים במניות המוחזקות בתיק שלך. להלן תקציר הסיכונים:'
                    : 'Institutional intelligence flagged severe negative catalysts or operational disruptions for your holdings:'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {portfolioCriticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-slate-950/80 border border-rose-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs"
                    >
                      <strong className="font-mono bg-rose-900/80 text-rose-100 px-2 py-0.5 rounded font-extrabold">
                        {alert.ticker}
                      </strong>
                      <span className="text-slate-200 font-semibold">{alert.headline}</span>
                      <span className="font-mono text-rose-400 font-bold">
                        {alert.preMarketChangePercent ? `${alert.preMarketChangePercent}%` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMovementFilter('MY_PORTFOLIO')}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-950/60 shrink-0 transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>{isHe ? 'סנן רק מניות מהתיק שלי' : 'View My Portfolio Alerts'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1.5. UNIVERSAL BROAD-MARKET STOCK SCANNER (ANY STOCK IN THE WORLD)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Search className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{isHe ? 'סורק מניות גלובלי לכל השוק (חפש כל מניה בעולם)' : 'Universal Broad Market Stock Scanner'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono">
                  {isHe ? 'ללא הגבלת מניות יסוד' : 'Full Market Coverage'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {isHe
                  ? 'הקלד כל סימול מניה (BSX, UNH, TSLA, NVDA, CRWD, INTC, LLY, AMD...) להפקת ניתוח קדם-מסחר, חדשות חמות, התראות סיכון ותוכנית פעולה לפתיחה.'
                  : 'Type any ticker (BSX, UNH, TSLA, NVDA, CRWD, INTC, LLY, AMD...) to instantly scan breaking catalysts, downside alerts, and game plans.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanAllPortfolio}
              disabled={isScanningAllPortfolio}
              className="px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/50 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {isScanningAllPortfolio
                  ? (isHe ? 'סורק את כל מניות התיק...' : 'Scanning Holdings...')
                  : (isHe ? 'סרוק את כל מניות התיק שלי בבת-אחת' : 'Scan All My Portfolio Holdings')}
              </span>
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickScanStock();
          }}
          className="flex flex-col sm:flex-row gap-2 pt-1"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={quickScanInput}
              onChange={(e) => setQuickScanInput(e.target.value.toUpperCase())}
              placeholder={isHe ? 'הקלד סימול מניה (לדוגמה: BSX, UNH, TSLA, CRWD, AMD, INTC)...' : 'Type ticker (e.g. BSX, UNH, TSLA, CRWD, AMD)...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition uppercase"
              disabled={isScanningTicker}
            />
          </div>

          <button
            type="submit"
            disabled={isScanningTicker || !quickScanInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-lg shadow-cyan-950/50 cursor-pointer shrink-0"
          >
            {isScanningTicker ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isHe ? 'מאתר חדשות ומנתח...' : 'Scanning Ticker...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>{isHe ? 'סרוק מניה עכשיו' : 'Scan Stock Alert'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Ticker Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">{isHe ? 'סריקות מהירות נפוצות:' : 'Quick Presets:'}</span>
          <button
            onClick={() => handleQuickScanStock('CVS')}
            className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-700/60 font-mono text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>CVS (אזהרת WSJ 2027)</span>
          </button>
          <button
            onClick={() => handleQuickScanStock('BSX')}
            className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 font-mono text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>BSX (מתקפת סייבר)</span>
          </button>
          <button
            onClick={() => handleQuickScanStock('UNH')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 font-mono text-[11px] font-bold transition cursor-pointer"
          >
            <span>UNH (תביעות MLR)</span>
          </button>
          <button
            onClick={() => handleQuickScanStock('NVDA')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 font-mono text-[11px] font-bold transition cursor-pointer"
          >
            <span>NVDA (ביקושי Blackwell)</span>
          </button>
          <button
            onClick={() => handleQuickScanStock('TSLA')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] font-bold transition cursor-pointer"
          >
            <span>TSLA</span>
          </button>
          <button
            onClick={() => handleQuickScanStock('INTC')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-[11px] font-bold transition cursor-pointer"
          >
            <span>INTC</span>
          </button>
        </div>

        {scanFeedback && (
          <div className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/80 text-cyan-200 flex items-center justify-between">
            <span>{scanFeedback}</span>
            <button
              onClick={() => setScanFeedback(null)}
              className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1.5. LIVE MULTI-SOURCE WEB NEWS INTELLIGENCE ENGINE (WSJ, Bloomberg, Reuters, CNBC, FT)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-indigo-900/40">
          <div className="flex items-start gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0 mt-0.5">
              <Globe className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  {isHe ? 'מנוע סריקת רשת רב-מקורות (WSJ, Bloomberg, Reuters, CNBC, ועוד)' : 'Live Multi-Source Web News Intelligence Engine'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-200 border border-indigo-600 font-mono">
                  LIVE WEB RSS & AI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHe
                  ? 'משיכת דיווחים ישירים ממקורות פיננסיים מובילים בעולם כולל The Wall Street Journal, בלומברג, רויטרס, CNBC, ו-Yahoo Finance.'
                  : 'Pulling verified real-time financial reporting from The Wall Street Journal, Bloomberg, Reuters, CNBC, FT, and Yahoo Finance.'}
              </p>
            </div>
          </div>

          {/* Major Outlets Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/80 font-mono shadow-sm">
              ⭐ זקס (Zacks Research)
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600/80 font-mono shadow-sm">
              🏛️ מורגן (Morgan Stanley & JPM)
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 font-serif">
              WSJ
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-700/60 font-mono">
              Bloomberg
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-red-950 text-red-300 border border-red-700/60 font-mono">
              Reuters
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 font-mono">
              CNBC
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60 font-mono">
              Yahoo Finance
            </span>
          </div>
        </div>

        {/* Search Bar for Web News */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchWebNews();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-indigo-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={webSearchQuery}
              onChange={(e) => setWebSearchQuery(e.target.value)}
              placeholder={isHe ? 'חפש כותרת, חברה או סקירת אנליסטים (למשל: Zacks Rank #1 NVDA, Morgan Stanley TSLA)...' : 'Search any web news topic (e.g. Zacks Rank #1 NVDA, Morgan Stanley TSLA)...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              disabled={isSearchingWebNews}
            />
          </div>

          <button
            type="submit"
            disabled={isSearchingWebNews || !webSearchQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-lg shadow-indigo-950/50 cursor-pointer shrink-0"
          >
            {isSearchingWebNews ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{isHe ? 'סורק ברשת...' : 'Searching Web...'}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-white" />
                <span>{isHe ? 'סרוק ברשת עכשיו' : 'Search Web News'}</span>
              </>
            )}
          </button>
        </form>

        {/* Presets / Common examples */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">{isHe ? 'דוגמאות לחיפוש מהיר:' : 'Quick Presets:'}</span>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('Zacks Rank 1 Strong Buy semiconductor top picks');
              handleSearchWebNews('Zacks Rank 1 Strong Buy semiconductor top picks');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-600/70 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
          >
            <span>⭐ זקס (Zacks Rank #1 Strong Buy)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('Morgan Stanley research overweight technology AI');
              handleSearchWebNews('Morgan Stanley research overweight technology AI');
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900/90 text-blue-200 border border-blue-600/70 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
          >
            <span>🏛️ מורגן סטנלי (Morgan Stanley Top Picks)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('JPMorgan equity research market forecast');
              handleSearchWebNews('JPMorgan equity research market forecast');
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900/90 text-blue-200 border border-blue-600/70 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
          >
            <span>🏛️ ג\'יי פי מורגן (JPMorgan Research)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('CVS Stock Down On Early Warnings About 2027 - WSJ');
              handleSearchWebNews('CVS Stock Down On Early Warnings About 2027 - WSJ');
            }}
            className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <span>📰 CVS - WSJ Warning</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('Boston Scientific BSX Farapulse PFA Zacks Morgan Stanley upgrade');
              handleSearchWebNews('Boston Scientific BSX Farapulse PFA Zacks Morgan Stanley upgrade');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/50 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <span>⭐ BSX Farapulse Growth (+2%)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('Yahoo Finance trending stocks pre-market movers top gainers');
              handleSearchWebNews('Yahoo Finance trending stocks pre-market movers top gainers');
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
          >
            <span>🟣 יאהו פייננס (Yahoo Finance Trending)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setWebSearchQuery('NVIDIA Blackwell demand TSMC CoWoS');
              handleSearchWebNews('NVIDIA Blackwell demand TSMC CoWoS');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition cursor-pointer"
          >
            <span>NVIDIA Blackwell Demand</span>
          </button>
        </div>

        {webNewsFeedback && (
          <div className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-200">
            {webNewsFeedback}
          </div>
        )}

        {/* Web Articles Feed Grid */}
        {isSearchingWebNews ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-indigo-300">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span>{isHe ? 'מתחבר למקורות הפיננסיים ברשת (WSJ, Bloomberg, CNBC, Reuters) ומנתח תוכן...' : 'Querying global financial outlets (WSJ, Bloomberg, CNBC, Reuters)...'}</span>
          </div>
        ) : webArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {webArticles.slice(0, 8).map((art) => {
              const isBearish = art.sentiment === 'BEARISH';
              const isBullish = art.sentiment === 'BULLISH';
              const isCritical = art.catalystSeverity === 'CRITICAL';
              const isWsj = art.source.includes('WSJ') || art.source.includes('Wall Street Journal');
              const isBloomberg = art.source.includes('Bloomberg');
              const isReuters = art.source.includes('Reuters');
              const isCnbc = art.source.includes('CNBC');

              return (
                <div
                  key={art.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400'
                      : isBearish
                      ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400'
                      : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Source Pill */}
                    {renderSourceBadge(art.source, art.url)}

                    {/* Sentiment / Severity */}
                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                          {isHe ? '⚠️ אזהרה קריטית' : '⚠️ Critical Warning'}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isBearish
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : isBullish
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isBearish ? 'BEARISH' : isBullish ? 'BULLISH' : 'NEUTRAL'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Published Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {art.pubDate && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {(() => {
                          const d = new Date(art.pubDate);
                          if (isNaN(d.getTime())) return art.pubDate;
                          return d.toLocaleString(isHe ? 'he-IL' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        })()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-2 line-clamp-2 leading-snug">
                    {art.title}
                  </h4>

                  {/* Hebrew Summary */}
                  {art.summaryHe && (
                    <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                      {art.summaryHe}
                    </p>
                  )}

                  {/* Recommendation action if available */}
                  {art.recommendation?.openingBellGamePlanHe && (
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-amber-200 mb-3">
                      <span className="font-bold text-amber-400">{isHe ? 'תוכנית לפתיחה: ' : 'Opening Plan: '}</span>
                      {art.recommendation.openingBellGamePlanHe}
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    {art.link ? (
                      <a
                        href={art.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
                      >
                        <span>{isHe ? 'קרא מקור ברשת' : 'Read original article'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-500">{art.source}</span>
                    )}

                    <button
                      onClick={() => handleQuickScanStock(art.ticker || 'CVS')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      <span>{isHe ? 'סרוק התראה זו לרדאר' : 'Scan into Radar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : hasSearchedWebNews ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {isHe ? 'לא נמצאו דיווחים מתאימים לשאילתה זו ברשת. נסה סימול או מילת מפתח אחרת.' : 'No web news found for this query.'}
          </div>
        ) : null}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1.6. S&P 500 & NASDAQ PRE-MARKET CATALYST RADAR & ALERTS BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{isHe ? 'ראדאר קטליזטורים S&P 500 ונאסד"ק: התראות לפני קפיצה או ירידה' : 'S&P 500 & NASDAQ Pre-Market Catalyst Radar'}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {isHe
                ? 'סריקה יומית רציפה של כל מניות המדדים המובילים לאיתור חריגות ווליום, עקיפת תחזיות, אישורי FDA, והנמכות רווח לפני פתיחת המסחר.'
                : 'Continuous morning catalyst scan across S&P 500 and NASDAQ 100 detecting impending gap-ups and sharp downside risks.'}
            </p>
          </div>

          {/* Action buttons & Notification toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleNotifications}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                notificationsEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>
                {notificationsEnabled
                  ? (isHe ? 'התראות בוקר פעילות' : 'Morning Alerts ON')
                  : (isHe ? 'הפעל התראות בוקר' : 'Enable Morning Alerts')}
              </span>
              <span className={`w-2 h-2 rounded-full ${notificationsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </button>

            <button
              onClick={handleSimulateAlert}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              title={isHe ? 'בדוק כיצד נראית הודעת בוקר מוקפצת' : 'Simulate morning push notification'}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? 'הדמיית התראת פתיחה' : 'Simulate Alert'}</span>
            </button>

            <button
              onClick={() => setShowMorningDigestModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHe ? 'תקציר מניות מהיר' : 'Quick Digest'}</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Radar Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 ml-1">
            {isHe ? 'סנן לפי קטליזטור:' : 'Filter Radar:'}
          </span>

          <button
            onClick={() => setSelectedMovementFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            <span>{isHe ? 'כל המניות שנסרקו' : 'All Scanned'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
              {stats.totalCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('MY_PORTFOLIO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'MY_PORTFOLIO'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60'
                : 'bg-slate-800/90 text-blue-300 hover:bg-slate-700 border border-blue-700/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHe ? '💼 מניות התיק שלי' : 'My Portfolio Holdings'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
              {stats.portfolioCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('WATCHLIST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'WATCHLIST'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60'
                : 'bg-slate-800/90 text-amber-300 hover:bg-slate-700 border border-amber-700/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHe ? '⭐ מניות המעקב שלי' : 'My Watchlist'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
              {stats.watchlistCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('DROPS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'DROPS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400/50'
                : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-700/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isHe ? '🔴 אזהרת ירידה' : '🔴 Sharp Drop Warnings'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-900/90 text-rose-200 text-[10px] font-mono">
              {stats.dropsCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('JUMPS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'JUMPS'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/50'
                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-700/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isHe ? '🟢 אפשרות לעלייה חדה' : '🟢 Sharp Rise Potential'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/90 text-emerald-200 text-[10px] font-mono">
              {stats.jumpsCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('REVISIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'REVISIONS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60 ring-2 ring-blue-400/50'
                : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 border border-blue-700/50'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHe ? '🔵 שינוי תחזיות' : '🔵 Forecast Revisions'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-900/90 text-blue-200 text-[10px] font-mono">
              {stats.revisionsCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('NASDAQ')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'NASDAQ'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
                : 'bg-slate-800/90 text-cyan-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            <span>{isHe ? '💻 נאסד"ק 100' : 'NASDAQ 100'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
              {stats.nasdaqCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedMovementFilter('SP500')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedMovementFilter === 'SP500'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                : 'bg-slate-800/90 text-purple-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            <span>{isHe ? '🏛️ S&P 500' : 'S&P 500'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] font-mono">
              {stats.spCount}
            </span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CUSTOM NEWS / HEADLINE INSTANT AI ANALYZER
      ───────────────────────────────────────────────────────────── */}
      {showCustomAnalyzer && (
        <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {isHe ? 'ניתוח מיידי של כל כותרת או הודעה מהעולם (AI Analyst)' : 'Instant Custom News AI Analyzer'}
              </h3>
            </div>
            <span className="text-xs text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded font-mono">
              {isHe ? 'Gemini 3.8 Flash Engine' : 'Powered by Gemini'}
            </span>
          </div>

          <form onSubmit={handleAnalyzeCustomNews} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isHe ? 'הדבק כותרת, הודעה לבורסה או קטע חדשותי:' : 'Paste any headline, SEC filing, or news snippet:'}
                </label>
                <input
                  type="text"
                  value={customNewsInput}
                  onChange={(e) => setCustomNewsInput(e.target.value)}
                  placeholder={
                    isHe
                      ? 'לדוגמה: "טסלה משיקה שירות Robotaxi ב-10 ערים נוספות" או "פייזר מקבלת אישור FDA מואץ לתרופה חדשה"...'
                      : 'e.g. "Apple acquires autonomous robotics startup for $1.2B" or "TSMC announces 2nm volume expansion"...'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  disabled={isAnalyzingCustom}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isHe ? 'סימול מניה (אופציונלי):' : 'Ticker (Optional):'}
                </label>
                <input
                  type="text"
                  value={customTickerInput}
                  onChange={(e) => setCustomTickerInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TSLA, NVDA"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500 transition uppercase"
                  disabled={isAnalyzingCustom}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isAnalyzingCustom || !customNewsInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 flex items-center gap-2 transition disabled:opacity-40"
              >
                {isAnalyzingCustom ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{isHe ? 'מנתח כותרת ומפיק המלצה...' : 'Generating Actionable Recommendation...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>{isHe ? 'נתח עכשיו והפק המלצה לפתיחת המסחר' : 'Analyze & Produce Recommendation'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. FILTER BAR & SEARCH CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 ml-1 mr-1">
              <Filter className="w-3 h-3 text-slate-500" />
              <span>{isHe ? 'ענפים:' : 'Categories:'}</span>
            </span>

            {[
              { id: 'ALL', labelHe: 'כל החדשות (הכל)', labelEn: 'All News' },
              { id: 'TECH_AI_CHIPS', labelHe: 'טכנולוגיה ושבבים', labelEn: 'Tech & AI' },
              { id: 'MACRO_RATES', labelHe: 'מאקרו וריבית', labelEn: 'Macro & Rates' },
              { id: 'HEALTHCARE_BIO', labelHe: 'בריאות ופארמה', labelEn: 'Healthcare' },
              { id: 'CONSUMER_RETAIL', labelHe: 'צריכה וקמעונאות', labelEn: 'Consumer' },
              { id: 'ANALYST_RATINGS', labelHe: 'דירוגי אנליסטים', labelEn: 'Analyst Ratings' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-900/40'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                {isHe ? cat.labelHe : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHe ? 'חיפוש מניה או כותרת...' : 'Search ticker or headline...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Action filter sub-row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="font-semibold text-slate-400">{isHe ? 'סנן לפי המלצה לפתיחה:' : 'Filter by Recommendation:'}</span>
          <button
            onClick={() => setSelectedActionFilter('ALL')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
              selectedActionFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isHe ? 'הכל' : 'All'}
          </button>
          <button
            onClick={() => setSelectedActionFilter('BUY')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
              selectedActionFilter === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            {isHe ? 'קנייה חזקה בלבד' : 'Strong Buy Only'}
          </button>
          <button
            onClick={() => setSelectedActionFilter('ACCUMULATE')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
              selectedActionFilter === 'ACCUMULATE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            {isHe ? 'צבירה בירידות' : 'Accumulate on Dip'}
          </button>
          <button
            onClick={() => setSelectedActionFilter('HOLD')}
            className={`px-2.5 py-0.5 rounded text-xs font-medium transition ${
              selectedActionFilter === 'HOLD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            {isHe ? 'החזקה ומעקב' : 'Hold & Monitor'}
          </button>
        </div>

        {/* Research Sources filter sub-row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-xs">
          <span className="font-semibold text-slate-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isHe ? 'סנן לפי מקור מחקר:' : 'Filter by Source:'}</span>
          </span>
          {[
            { id: 'ALL', labelHe: 'כל המקורות', labelEn: 'All Sources' },
            { id: 'ZACKS', labelHe: '⭐ זקס (Zacks Research)', labelEn: '⭐ Zacks Research' },
            { id: 'MORGAN', labelHe: '🏛️ מורגן (Morgan Stanley / JPM)', labelEn: '🏛️ Morgan Stanley & JPM' },
            { id: 'WSJ', labelHe: '📰 Wall Street Journal', labelEn: '📰 WSJ' },
            { id: 'BLOOMBERG', labelHe: '⚡ בלומברג (Bloomberg)', labelEn: '⚡ Bloomberg' },
            { id: 'YAHOO', labelHe: '🟣 יאהו פייננס (Yahoo Finance)', labelEn: '🟣 Yahoo Finance' },
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSourceFilter(src.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                selectedSourceFilter === src.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700/60'
              }`}
            >
              {isHe ? src.labelHe : src.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN NEWS FEED CARDS WITH INSTITUTIONAL RECOMMENDATION BOX
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {filteredNews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <BellRing className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">
              {isHe ? 'לא נמצאו מבזקי חדשות לפי הסינון שנבחר' : 'No pre-market news found for selected filters'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isHe ? 'נסה לאפס את החיפוש או לבחור קטגוריה אחרת, או לחץ על סנכרון חדשות שוק עולמיות.' : 'Try resetting your search query or refresh the global news feed.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedActionFilter('ALL');
                setSelectedSourceFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition"
            >
              {isHe ? 'אפס את כל הסינונים' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          filteredNews.map((item) => {
            const stockMatch = stocks.find((s) => s.ticker === item.ticker);
            const liveQuote = livePrices[item.ticker] || liveNewsQuotes[item.ticker];
            const displayPrice = liveQuote?.price || item.preMarketPrice || (stockMatch ? parseFloat(stockMatch.currentPrice.replace(/[^0-9.]/g, '')) : 100);
            const displayChange = liveQuote?.changePercent ?? item.preMarketChangePercent ?? 0;
            const inWatchlist = watchlist.some((w) => w.ticker === item.ticker);

            const isJump = item.movementType === 'IMPENDING_JUMP' || item.messageCategory === 'SHARP_RISE' || (item.preMarketChangePercent || 0) > 1.8;
            const isDrop = item.movementType === 'SHARP_DROP_WARNING' || item.messageCategory === 'DROP_WARNING' || (item.preMarketChangePercent || 0) < -1.5;
            const isRevision = item.movementType === 'FORECAST_REVISION' || item.messageCategory === 'FORECAST_REVISION';

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-5 sm:p-6 shadow-xl transition space-y-5 group relative overflow-hidden border ${
                  isDrop
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900/98 to-rose-950/25 border-rose-500/40 hover:border-rose-400 shadow-rose-950/20'
                    : isJump
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900/98 to-emerald-950/25 border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20'
                    : isRevision
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900/98 to-blue-950/25 border-blue-500/40 hover:border-blue-400 shadow-blue-950/20'
                    : 'bg-slate-900/95 border-slate-800 hover:border-slate-700/90'
                }`}
              >
                {/* Catalyst & Movement Radar Tag Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getMovementBadge(item)}
                    {getIndexBadge(item.indexOrigin)}
                    {portfolioTickersSet.has(item.ticker.toUpperCase()) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/60 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Briefcase className="w-3 h-3 text-blue-400" />
                        <span>{isHe ? '💼 בתיק האישי שלך' : 'In Your Portfolio'}</span>
                      </span>
                    )}
                    {watchlistTickersSet.has(item.ticker.toUpperCase()) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{isHe ? '⭐ ברשימת מעקב' : 'Watchlist'}</span>
                      </span>
                    )}
                    {getCatalystLabel(item) && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700/80 text-[10px] font-bold">
                        {getCatalystLabel(item)}
                      </span>
                    )}
                  </div>
                  {item.catalystSeverity && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        item.catalystSeverity === 'CRITICAL'
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-700'
                          : 'bg-amber-950/90 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {item.catalystSeverity === 'CRITICAL' ? (isHe ? 'קטליזטור קריטי' : 'Critical Catalyst') : (isHe ? 'עוצמת קטליזטור גבוהה' : 'High Impact')}
                    </span>
                  )}
                </div>

                {/* Header: Meta source & Stock Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  
                  {/* Stock Identification */}
                  <div className="flex items-center gap-3">
                    <StockLogoBadge ticker={item.ticker} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-base tracking-wide font-mono">
                          {item.ticker}
                        </span>
                        <span className="text-xs text-slate-300 font-medium truncate max-w-[200px] sm:max-w-[280px]">
                          {item.companyName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>
                      
                      {/* Price info */}
                      <div className="flex items-center gap-2 text-xs font-mono pt-0.5">
                        <span className="text-slate-400 font-medium">
                          {isHe ? 'מחיר קדם-מסחר:' : 'Pre-market:'} <strong className="text-white">${displayPrice.toFixed(2)}</strong>
                        </span>
                        <span
                          className={`font-bold flex items-center gap-0.5 ${
                            displayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {displayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {displayChange >= 0 ? `+${displayChange.toFixed(2)}%` : `${displayChange.toFixed(2)}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* News Source & Published Time */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 sm:self-center">
                    {renderSourceBadge(item.source, item.sourceUrl)}
                    <span className="text-slate-500">•</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.publishedTime}</span>
                    </span>
                  </div>
                </div>

                {/* Headline & Summary */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug group-hover:text-cyan-300 transition">
                    {item.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    CORE RECOMMENDATION & ACTIONABLE GAME PLAN BOX
                ───────────────────────────────────────────────────────── */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border border-cyan-800/40 hover:border-cyan-600/60 rounded-xl p-4 sm:p-5 space-y-4 shadow-inner">
                  
                  {/* Recommendation Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        {isHe ? 'המלצת פעולה מוסדית לפתיחת המסחר:' : 'Opening Bell Recommendation:'}
                      </span>
                      {getActionBadge(item.recommendation.action, isHe ? item.recommendation.actionLabelHe : item.recommendation.actionLabelEn)}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">{isHe ? 'ציון ביטחון אנליסט:' : 'Confidence Score:'}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                        {item.recommendation.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  {/* Impact Analysis & Opening Bell Game Plan */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
                    
                    {/* Column 1: Moat & 2Y Thesis Impact */}
                    <div className="space-y-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isHe ? 'השפעה על חפיר ותזת השנתיים (Moat & Financials):' : '2-Year Moat Impact:'}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {isHe ? item.recommendation.impactAnalysisHe : item.recommendation.impactAnalysisEn}
                      </p>
                    </div>

                    {/* Column 2: Specific Opening Bell Action */}
                    <div className="space-y-1.5 bg-cyan-950/20 p-3.5 rounded-xl border border-cyan-800/40">
                      <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>{isHe ? 'תוכנית פעולה מדויקת לפתיחת המסחר:' : 'Opening Bell Action Plan:'}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-medium">
                        {isHe ? item.recommendation.openingBellGamePlanHe : item.recommendation.openingBellGamePlanEn}
                      </p>
                    </div>
                  </div>

                  {/* Valuation Target & Risk Guidance */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/80 font-mono">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>
                        <span className="text-slate-400">{isHe ? 'מחיר יעד 12 חודשים:' : 'Target Price:'}</span>{' '}
                        <strong className="text-emerald-300 font-extrabold">${item.recommendation.targetPrice.toFixed(2)}</strong>
                      </span>
                      <span>
                        <span className="text-slate-400">{isHe ? 'טווח כניסה מומלץ עד:' : 'Buy Zone Up To:'}</span>{' '}
                        <strong className="text-cyan-300 font-extrabold">${item.recommendation.buyZoneMax.toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-sans">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{isHe ? 'גורם סיכון עיקרי:' : 'Key Risk:'} <strong className="text-slate-300">{isHe ? item.recommendation.riskFactorHe : item.recommendation.riskFactorEn}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    {stockMatch && (
                      <button
                        onClick={() => onOpenDeepDive(stockMatch)}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isHe ? 'מחקר מעמיק (אופק 2Y)' : 'Full Deep Dive'}</span>
                      </button>
                    )}

                    {stockMatch && (
                      <button
                        onClick={() => onAddToPortfolio(stockMatch)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isHe ? 'הוסף לתיק' : 'Add to Portfolio'}</span>
                      </button>
                    )}

                    {stockMatch && (
                      <button
                        onClick={() => onToggleWatchlist(stockMatch)}
                        className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition ${
                          inWatchlist
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                        <span>{inWatchlist ? (isHe ? 'במעקב' : 'Watching') : (isHe ? 'הוסף למעקב' : 'Watch')}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live AI Re-scan button */}
                    <button
                      onClick={() => handleQuickScanStock(item.ticker, true)}
                      disabled={isScanningTicker}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition text-xs disabled:opacity-50 cursor-pointer"
                      title={isHe ? `רענן סריקה וניתוח חי עבור ${item.ticker}` : `Live AI Re-scan for ${item.ticker}`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isScanningTicker ? 'animate-spin' : ''}`} />
                      <span>{isHe ? 'רענן ניתוח חי' : 'Live Re-scan'}</span>
                    </button>

                    {/* Share / Copy Summary Button */}
                    <button
                      onClick={() => handleCopyShare(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition text-xs"
                      title={isHe ? 'העתק את המבזק וההמלצה' : 'Copy Brief and Recommendation'}
                    >
                      {copiedId === item.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{isHe ? 'הועתק בהצלחה!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{isHe ? 'העתק ניתוח והמלצה' : 'Share Brief'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TOAST NOTIFICATION: MORNING PRE-MARKET ALERT
      ───────────────────────────────────────────────────────────── */}
      {showNotificationToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-bounce-short">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0">
              <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
            </span>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                  {showNotificationToast.impact}
                </span>
                <button
                  onClick={() => setShowNotificationToast(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-sm font-bold text-white">
                {showNotificationToast.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {showNotificationToast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. MORNING CATALYST DIGEST MODAL
      ───────────────────────────────────────────────────────────── */}
      {showMorningDigestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isHe ? 'דו"ח קטליזטורים וול-סטריט: נאסד"ק & S&P 500' : 'Wall Street Morning Catalyst Report'}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {pulse.nyTimeStr} EST • {new Date().toLocaleDateString('he-IL')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowMorningDigestModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  <span>{isHe ? 'מועמדות לזינוק (Breakouts)' : 'Impending Jumps'}</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {stats.jumpsCount} מניות
                </div>
                <div className="text-[11px] text-slate-300">
                  {isHe ? 'נתמכות בעקיפת תחזיות, אישורי FDA וחוזים.' : 'Catalyzed by beats, FDA approvals, and contracts.'}
                </div>
              </div>

              <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{isHe ? 'אזהרות ירידה חדה (Downside Risk)' : 'Sharp Drop Warnings'}</span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {stats.dropsCount} מניות
                </div>
                <div className="text-[11px] text-slate-300">
                  {isHe ? 'סיכון לפער ירידה בעקבות הנמכת רווח או הורדת דירוג.' : 'Gap down risk on guidance cuts or downgrades.'}
                </div>
              </div>
            </div>

            {/* Detailed Mover List in Digest */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isHe ? 'פירוט המניות הבולטות להיום:' : 'Key Stocks of the Day:'}
              </h4>
              <div className="space-y-2">
                {newsList.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-white font-mono text-sm">{item.ticker}</span>
                      <span className="text-slate-400 truncate max-w-[160px]">{item.companyName}</span>
                      {getIndexBadge(item.indexOrigin)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold ${
                          (item.preMarketChangePercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(item.preMarketChangePercent || 0) >= 0 ? '+' : ''}
                        {(item.preMarketChangePercent || 0).toFixed(2)}%
                      </span>
                      {item.estimatedImpactPct && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {item.estimatedImpactPct}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={handleToggleNotifications}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-2"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{notificationsEnabled ? (isHe ? 'התראות פועלות' : 'Alerts Active') : (isHe ? 'הפעל התראות יומיות' : 'Enable Daily Alerts')}</span>
              </button>
              <button
                onClick={() => setShowMorningDigestModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-900/30"
              >
                {isHe ? 'סגור דו"ח' : 'Close Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
