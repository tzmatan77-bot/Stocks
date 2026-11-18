import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResearchStock, UniverseAnalysisResult, PortfolioPosition, WatchlistItem, NamedWatchlist } from './types';
import { FULL_UNIVERSE_RESULT, TOP_20_SUMMARY_LIST } from './data/universeData';
import { FULL_TOP_20_COMPOUNDERS } from './data/extendedUniverse';
import { MARKET_UNIVERSE_CATALOG } from './data/marketUniverseData';
import { getOfficialTop30Stocks, getOfficialTop20Stocks, getResearchStock, registerResearchedStock, setLivePriceInRegistry } from './data/researchStockGenerator';
import { localizeStock } from './data/stockLocalization';
import { PremiumHomeLanding } from './components/PremiumHomeLanding';
import { Top20Table } from './components/Top20Table';
import { Top10Summary } from './components/Top10Summary';
import { AutoTop10Scanner } from './components/AutoTop10Scanner';
import { AddToPortfolioModal } from './components/AddToPortfolioModal';
import { DeepDiveTop5 } from './components/DeepDiveTop5';
import { LivePortfolioBuilder } from './components/LivePortfolioBuilder';
import { WatchlistManager } from './components/WatchlistManager';
import { StockComparison } from './components/StockComparison';
import { PortfolioSimulator } from './components/PortfolioSimulator';
import { QuarterlyMonitor } from './components/QuarterlyMonitor';
import { LiveTickerAnalyzer } from './components/LiveTickerAnalyzer';
import { MethodologyViewer } from './components/MethodologyViewer';
import { StockDetailModal } from './components/StockDetailModal';
import { DcfValuationCalculator } from './components/DcfValuationCalculator';
import { ShareholderYieldAnalyzer } from './components/ShareholderYieldAnalyzer';
import { MacroStressTester } from './components/MacroStressTester';
import { PersonalPortfolioTracker } from './components/PersonalPortfolioTracker';
import { EarningsCalendarViewer } from './components/EarningsCalendarViewer';
import { BloombergTerminalView } from './components/BloombergTerminalView';
import { InvestmentMemoPrinter } from './components/InvestmentMemoPrinter';
import { ReverseDcfExpectations } from './components/ReverseDcfExpectations';
import { CompetitiveMapViewer } from './components/CompetitiveMapViewer';
import { ThesisIntelligenceCenter } from './components/ThesisIntelligenceCenter';
import { InstitutionalToolsHub } from './components/InstitutionalToolsHub';
import { PremarketNewsIntelligence } from './components/PremarketNewsIntelligence';
import { ExtendedHoursTracker } from './components/ExtendedHoursTracker';
import { RightSidebarNav } from './components/RightSidebarNav';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from './i18n';
import { RefreshCw, Menu } from 'lucide-react';

const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    ticker: 'UNH',
    companyName: 'UnitedHealth Group Incorporated',
    addedAt: '2026-08-01',
    targetBuyPrice: 495.0,
    targetPE: 19.5,
    alertOnThesisBreak: true,
    notes: 'Leader in healthcare & Optum care delivery; buy on any Medicare Advantage rate noise.'
  },
  {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    addedAt: '2026-08-05',
    targetBuyPrice: 420.0,
    targetPE: 30.0,
    alertOnThesisBreak: true,
    notes: 'Secular cloud and enterprise AI dominance with high switching costs.'
  },
  {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    addedAt: '2026-08-10',
    targetBuyPrice: 175.0,
    targetPE: 22.0,
    alertOnThesisBreak: true,
    notes: 'Search monopoly cash engine funding GCP and Waymo autonomous growth.'
  },
  {
    ticker: 'V',
    companyName: 'Visa Inc.',
    addedAt: '2026-08-12',
    targetBuyPrice: 280.0,
    targetPE: 26.0,
    alertOnThesisBreak: true,
    notes: 'Global payment rail tollbooth; capital-light compounder.'
  },
  {
    ticker: 'COST',
    companyName: 'Costco Wholesale Corporation',
    addedAt: '2026-08-15',
    targetBuyPrice: 850.0,
    targetPE: 45.0,
    alertOnThesisBreak: true,
    notes: 'Subscription moat & 93% membership renewal rate; prime retail fortress.'
  }
];

export default function App() {
  const [stocks, setStocks] = useState<ResearchStock[]>(() => getOfficialTop30Stocks());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [screenerInitialSearch, setScreenerInitialSearch] = useState<string>('');
  const [selectedStockForDeepDive, setSelectedStockForDeepDive] = useState<ResearchStock>(() => {
    const list = getOfficialTop30Stocks();
    return list[0] || FULL_TOP_20_COMPOUNDERS[0];
  });
  const [selectedStockForModal, setSelectedStockForModal] = useState<ResearchStock | null>(null);
  const [stockForPortfolioModal, setStockForPortfolioModal] = useState<ResearchStock | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [portfolioPositionsCount, setPortfolioPositionsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.length : 4;
      }
    } catch (e) {
      // ignore
    }
    return 4;
  });

  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('MOATGUARD_SIDEBAR_COLLAPSED_V1') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('MOATGUARD_SIDEBAR_COLLAPSED_V1', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Language state (persisted)
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('MOATGUARD_LANG_V1') as SupportedLanguage;
      if (saved && ['he', 'en', 'de', 'fr', 'es'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'he';
  });

  const t = translations[currentLang] || translations.en;

  const [watchlists, setWatchlists] = useState<NamedWatchlist[]>(() => {
    try {
      const savedV2 = localStorage.getItem('MOATGUARD_WATCHLISTS_V2');
      if (savedV2 !== null) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacySaved = localStorage.getItem('INSTITUTIONAL_WATCHLIST_DATA_V1');
      let initialItems = INITIAL_WATCHLIST;
      if (legacySaved !== null) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (Array.isArray(parsedLegacy)) initialItems = parsedLegacy;
      }
      return [
        {
          id: 'default',
          name: 'רשימת מעקב ראשית',
          createdAt: new Date().toISOString().slice(0, 10),
          items: initialItems,
        },
      ];
    } catch (e) {
      console.warn('Using default watchlist', e);
      return [
        {
          id: 'default',
          name: 'רשימת מעקב ראשית',
          createdAt: new Date().toISOString().slice(0, 10),
          items: INITIAL_WATCHLIST,
        },
      ];
    }
  });

  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(() => {
    try {
      return localStorage.getItem('MOATGUARD_ACTIVE_WATCHLIST_V2') || 'default';
    } catch {
      return 'default';
    }
  });

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];
  const watchlist: WatchlistItem[] = activeWatchlist ? activeWatchlist.items : [];

  // Listen to portfolio updates from other tabs or modals to keep counters in sync
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPortfolioPositionsCount(parsed.length);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('portfolio-updated', handleStorageChange);

    const handleNavigateTab = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        const target = e.detail === 'explore' ? 'top10' : e.detail;
        setActiveTab(target);
      }
    };
    window.addEventListener('navigate-tab', handleNavigateTab);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('portfolio-updated', handleStorageChange);
      window.removeEventListener('navigate-tab', handleNavigateTab);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'explore') {
      setActiveTab('top10');
    }
  }, [activeTab]);

  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [lastQuotesSyncTime, setLastQuotesSyncTime] = useState<number>(Date.now());
  const [isSyncingQuotes, setIsSyncingQuotes] = useState(false);
  const [secondsSinceLastSync, setSecondsSinceLastSync] = useState(0);

  // Live prices dictionary with initial seed
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; changePercent: number; changeAmount: number; previousClose?: number; timestamp?: number; source?: string }>>(() => {
    const initial: Record<string, { price: number; changePercent: number; changeAmount: number; previousClose?: number; timestamp?: number; source?: string }> = {};
    FULL_TOP_20_COMPOUNDERS.filter(Boolean).forEach((s) => {
      const parsed = parseFloat(s.currentPrice.replace(/[^0-9.]/g, ''));
      const base = !isNaN(parsed) && parsed > 0 ? parsed : 100.0;
      initial[s.ticker] = {
        price: base,
        changePercent: 0,
        changeAmount: 0,
        previousClose: base,
        timestamp: Date.now(),
        source: 'initial_model'
      };
    });
    initial['BKNG'] = {
      price: 186.00,
      changePercent: 0,
      changeAmount: 0,
      previousClose: 186.00,
      timestamp: Date.now(),
      source: 'initial_model'
    };
    return initial;
  });

  // Save language to localStorage and update document dir
  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('MOATGUARD_LANG_V1', lang);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  };

  useEffect(() => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
    if (langObj) {
      document.documentElement.dir = langObj.dir;
      document.documentElement.lang = langObj.code;
    }
  }, [currentLang]);

  // Save watchlists to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('MOATGUARD_WATCHLISTS_V2', JSON.stringify(watchlists));
      localStorage.setItem('MOATGUARD_ACTIVE_WATCHLIST_V2', activeWatchlistId);
    } catch (e) {
      console.warn('Failed to save watchlists', e);
    }
  }, [watchlists, activeWatchlistId]);

  // Keep stable refs to avoid re-triggering quotes callbacks and effects
  const stocksRef = useRef(stocks);
  stocksRef.current = stocks;
  const watchlistsRef = useRef(watchlists);
  watchlistsRef.current = watchlists;
  const selectedStockRef = useRef(selectedStockForDeepDive);
  selectedStockRef.current = selectedStockForDeepDive;
  const extraMonitoredTickersRef = useRef<Set<string>>(new Set(['AFL', 'A', 'APD', 'ABT', 'ABBV', 'ACN', 'ADBE', 'AMD']));

  // Fetch real live quotes from backend API with stable callback
  const fetchLiveQuotes = useCallback(async (specificTickers?: string[]) => {
    let tickersToFetch: string[] = [];

    if (specificTickers && specificTickers.length > 0) {
      tickersToFetch = Array.from(new Set(specificTickers.map((t) => t.toUpperCase().trim())));
    } else {
      const tickerSet = new Set<string>();

      // 1. All universe stocks (top compounders)
      stocksRef.current.forEach((s) => {
        if (s?.ticker) tickerSet.add(s.ticker.toUpperCase().trim());
      });

      // 2. All Watchlist tickers across all user-created watchlists
      watchlistsRef.current.forEach((wl) => {
        wl.items.forEach((w) => {
          if (w?.ticker) tickerSet.add(w.ticker.toUpperCase().trim());
        });
      });

      // 3. User personal portfolio tickers from localStorage
      try {
        const savedPortfolio =
          localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') ||
          localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
        if (savedPortfolio) {
          const parsed = JSON.parse(savedPortfolio);
          if (Array.isArray(parsed)) {
            parsed.forEach((p: any) => {
              if (p?.ticker) tickerSet.add(String(p.ticker).toUpperCase().trim());
            });
          }
        }
      } catch (e) {
        // ignore
      }

      // 4. Currently selected stock & modal stock
      if (selectedStockRef.current?.ticker) {
        tickerSet.add(selectedStockRef.current.ticker.toUpperCase().trim());
      }
      if (selectedStockForModal?.ticker) {
        tickerSet.add(selectedStockForModal.ticker.toUpperCase().trim());
      }

      // 5. Common market compounders & frequently monitored mega-caps
      const commonMegaCaps = [
        'MCD', 'COST', 'NVDA', 'AAPL', 'MSFT', 'UNH', 'GOOGL', 'V', 'MA',
        'AMZN', 'META', 'TSLA', 'LLY', 'AVGO', 'TXN', 'SPGI', 'ISRG',
        'KO', 'PEP', 'PG', 'WMT', 'HD', 'JPM', 'BLK', 'BRK.B', 'MNST',
        'CVS', 'ELV', 'CI', 'HUM', 'BSX', 'NVMI'
      ];
      commonMegaCaps.forEach((t) => tickerSet.add(t));

      // 6. Any dynamically registered tickers (e.g. from screener catalog)
      extraMonitoredTickersRef.current.forEach((t) => tickerSet.add(t));

      tickersToFetch = Array.from(tickerSet);
    }

    if (tickersToFetch.length === 0) return;

    setIsSyncingQuotes(true);
    try {
      // Split into batches of 40 tickers to prevent URL length overflow
      const chunks: string[][] = [];
      for (let i = 0; i < tickersToFetch.length; i += 40) {
        chunks.push(tickersToFetch.slice(i, i + 40));
      }

      const allFetchedQuotes: Record<string, any> = {};

      for (const chunk of chunks) {
        try {
          const url = `/api/quotes?tickers=${encodeURIComponent(chunk.join(','))}`;
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && data.quotes) {
              Object.assign(allFetchedQuotes, data.quotes);
            }
          }
        } catch (e) {
          // ignore chunk error
        }
      }

      if (Object.keys(allFetchedQuotes).length > 0) {
        setLivePrices((prev) => {
          const next = { ...prev };
          let changed = false;
          Object.entries(allFetchedQuotes).forEach(([ticker, quote]: [string, any]) => {
            if (quote && typeof quote.price === 'number') {
              // Update global research registry
              setLivePriceInRegistry(ticker, quote.price, quote.previousClose, quote.changePercent);

              const current = next[ticker.toUpperCase()];
              if (!current || current.price !== quote.price) {
                changed = true;
                next[ticker.toUpperCase()] = {
                  price: quote.price,
                  previousClose: quote.previousClose || quote.price,
                  changeAmount: quote.changeAmount || 0,
                  changePercent: typeof quote.changePercent === 'number' ? quote.changePercent : 0,
                  timestamp: quote.timestamp || Date.now(),
                  source: quote.source || 'market_api'
                };
              }
            }
          });
          return changed ? next : prev;
        });

        // Synchronize stocks list once if any price actually changed
        setStocks((prevStocks) => {
          let hasChanges = false;
          const updated = prevStocks.map((s) => {
            const q = allFetchedQuotes[s.ticker.toUpperCase()];
            if (q && typeof q.price === 'number') {
              const formatted = `$${q.price.toFixed(2)}`;
              if (s.currentPrice !== formatted) {
                hasChanges = true;
                return {
                  ...s,
                  currentPrice: formatted
                };
              }
            }
            return s;
          });
          return hasChanges ? updated : prevStocks;
        });

        // Synchronize selectedStockForDeepDive if active
        setSelectedStockForDeepDive((prev) => {
          if (!prev) return prev;
          const q = allFetchedQuotes[prev.ticker.toUpperCase()];
          if (q && typeof q.price === 'number') {
            const formatted = `$${q.price.toFixed(2)}`;
            if (prev.currentPrice !== formatted) {
              return {
                ...prev,
                currentPrice: formatted
              };
            }
          }
          return prev;
        });

        // Synchronize selectedStockForModal if active
        setSelectedStockForModal((prev) => {
          if (!prev) return prev;
          const q = allFetchedQuotes[prev.ticker.toUpperCase()];
          if (q && typeof q.price === 'number') {
            const formatted = `$${q.price.toFixed(2)}`;
            if (prev.currentPrice !== formatted) {
              return {
                ...prev,
                currentPrice: formatted
              };
            }
          }
          return prev;
        });
      }
      setLastQuotesSyncTime(Date.now());
    } catch (err) {
      console.warn('Live quotes sync error:', err);
    } finally {
      setIsSyncingQuotes(false);
    }
  }, []);

  // Fetch from server API on mount
  useEffect(() => {
    async function loadUniverse() {
      try {
        const res = await fetch('/api/universe', { headers: { Accept: 'application/json' } });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data: UniverseAnalysisResult = await res.json();
          if (data && data.top20 && data.top20.length > 0) {
            setStocks(data.top20);
            if (data.top5 && data.top5.length > 0) {
              setSelectedStockForDeepDive(data.top5[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Using embedded universe data:', err);
      }
    }
    loadUniverse();
  }, []);

  // Initial and reactive live quotes fetch
  useEffect(() => {
    fetchLiveQuotes();
  }, [fetchLiveQuotes]);

  // Real-time market tick generator / sync polling (every 10 seconds)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      fetchLiveQuotes();
    }, 10000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, fetchLiveQuotes]);

  // Update seconds count since last quotes sync
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceLastSync(Math.floor((Date.now() - lastQuotesSyncTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastQuotesSyncTime]);

  const handleManualRefreshPrices = useCallback(() => {
    fetchLiveQuotes();
  }, [fetchLiveQuotes]);

  const handleRegisterTickers = useCallback((newTickers: string[]) => {
    if (newTickers && newTickers.length > 0) {
      newTickers.forEach((t) => {
        const clean = t.toUpperCase().trim();
        if (clean) extraMonitoredTickersRef.current.add(clean);
      });
      fetchLiveQuotes(newTickers);
    }
  }, [fetchLiveQuotes]);

  const handleSearchTicker = async (ticker: string) => {
    const cleanTicker = ticker.toUpperCase().trim();
    if (!cleanTicker) return;
    setIsSearching(true);
    let resolvedStock: ResearchStock | null = null;
    try {
      const res = await fetch('/api/analyze-ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ticker: cleanTicker, language: currentLang }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.stock) {
          registerResearchedStock(data.stock);
          resolvedStock = localizeStock(data.stock, currentLang);
        }
      }
    } catch (e) {
      console.warn('Network request to /api/analyze-ticker failed, using local model:', e);
    } finally {
      setIsSearching(false);
    }

    if (!resolvedStock) {
      // Robust client-side fallback
      const generated = getResearchStock(cleanTicker);
      resolvedStock = localizeStock(generated, currentLang);
    }

    if (resolvedStock) {
      const finalStock = resolvedStock;
      setStocks((prev) => {
        const filtered = prev.filter((s) => s.ticker !== finalStock.ticker);
        return [finalStock, ...filtered];
      });
      setSelectedStockForDeepDive(finalStock);
      const stockSpecificTabs = [
        'dcf',
        'reversedcf',
        'memo',
        'print',
        'simulator',
        'yield',
        'compmap',
        'thesismonitor',
        'quarterly',
        'compare',
        'top5',
      ];
      if (!stockSpecificTabs.includes(activeTab)) {
        setActiveTab('top5');
      }
    }
  };

  const handleSelectQuickTicker = (ticker: string) => {
    const found = stocks.find((s) => s.ticker === ticker);
    if (found) {
      setSelectedStockForDeepDive(found);
      const stockSpecificTabs = [
        'dcf',
        'reversedcf',
        'memo',
        'print',
        'simulator',
        'yield',
        'compmap',
        'thesismonitor',
        'quarterly',
        'compare',
        'top5',
      ];
      if (!stockSpecificTabs.includes(activeTab)) {
        setActiveTab('top5');
      }
    } else {
      handleSearchTicker(ticker);
    }
  };

  const handleLaunchStockTool = (ticker: string, toolTab: string) => {
    const clean = ticker.toUpperCase().trim();
    let stock = stocks.find((s) => s.ticker === clean);
    if (!stock) {
      stock = getResearchStock(clean);
      setStocks((prev) => [stock!, ...prev.filter((s) => s.ticker !== clean)]);
    }
    setSelectedStockForDeepDive(stock);
    setActiveTab(toolTab);
    handleRegisterTickers([clean]);
  };

  const handleAddStockToUniverse = (newStock: ResearchStock) => {
    setStocks((prev) => {
      const filtered = prev.filter((s) => s.ticker !== newStock.ticker);
      return [newStock, ...filtered];
    });
    setSelectedStockForDeepDive(newStock);
  };

  const handleOpenDeepDive = (stock: ResearchStock) => {
    setSelectedStockForDeepDive(stock);
    setActiveTab('top5');
  };

  // Multi-Watchlist Actions (Unlimited Lists & Unlimited Stocks)
  const handleToggleWatchlist = (stock: ResearchStock) => {
    setWatchlists((prev) =>
      prev.map((wl) => {
        if (wl.id !== (activeWatchlist?.id || wl.id)) return wl;
        const exists = wl.items.some((w) => w.ticker === stock.ticker);
        if (exists) {
          return { ...wl, items: wl.items.filter((w) => w.ticker !== stock.ticker) };
        }
        const currentP =
          livePrices[stock.ticker]?.price || parseFloat(stock.currentPrice.replace(/[^0-9.]/g, '')) || 100;
        const newItem: WatchlistItem = {
          ticker: stock.ticker,
          companyName: stock.companyName,
          addedAt: new Date().toISOString().slice(0, 10),
          targetBuyPrice: Number((currentP * 0.9).toFixed(2)),
          targetPE: 22,
          alertOnThesisBreak: true,
          notes: stock.whyInTopUniverse || 'High-quality 5Y compounder candidate',
        };
        return { ...wl, items: [newItem, ...wl.items] };
      })
    );
  };

  const handleUpdateWatchlistItem = (item: WatchlistItem, targetListId?: string) => {
    const destId = targetListId || activeWatchlist?.id || 'default';
    setWatchlists((prev) =>
      prev.map((wl) => {
        if (wl.id !== destId) return wl;
        const filtered = wl.items.filter((w) => w.ticker !== item.ticker);
        return { ...wl, items: [item, ...filtered] };
      })
    );
  };

  const handleRemoveFromWatchlist = (ticker: string, targetListId?: string) => {
    const destId = targetListId || activeWatchlist?.id;
    setWatchlists((prev) =>
      prev.map((wl) => {
        if (destId && wl.id !== destId) return wl;
        return { ...wl, items: wl.items.filter((w) => w.ticker !== ticker) };
      })
    );
  };

  const handleCreateWatchlist = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newId = `wl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newList: NamedWatchlist = {
      id: newId,
      name: trimmed,
      createdAt: new Date().toISOString().slice(0, 10),
      items: [],
    };
    setWatchlists((prev) => [...prev, newList]);
    setActiveWatchlistId(newId);
  };

  const handleRenameWatchlist = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setWatchlists((prev) => prev.map((wl) => (wl.id === id ? { ...wl, name: trimmed } : wl)));
  };

  const handleDeleteWatchlist = (id: string) => {
    setWatchlists((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((wl) => wl.id !== id);
      if (activeWatchlistId === id && next[0]) {
        setActiveWatchlistId(next[0].id);
      }
      return next;
    });
  };

  // Direct quick add to portfolio modal
  const handleQuickAddToPortfolio = (stock: ResearchStock) => {
    setStockForPortfolioModal(stock);
  };

  // Add stock confirmed from modal to portfolio
  const handleConfirmAddToPortfolio = (
    stock: ResearchStock,
    shares: number,
    buyPrice: number,
    notes: string,
    actionFee: number = 7.00
  ) => {
    try {
      const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      let currentPositions: PortfolioPosition[] = [];
      if (saved) {
        currentPositions = JSON.parse(saved);
      }
      const existingIdx = currentPositions.findIndex((p) => p.ticker === stock.ticker);
      if (existingIdx >= 0) {
        const existing = currentPositions[existingIdx];
        const newShares = existing.shares + shares;
        const newAvgPrice = (existing.shares * existing.buyPrice + shares * buyPrice) / newShares;
        const currentFee = typeof existing.actionFee === 'number' ? existing.actionFee : 7.00;
        currentPositions[existingIdx] = {
          ...existing,
          shares: newShares,
          buyPrice: Number(newAvgPrice.toFixed(2)),
          actionFee: currentFee + actionFee,
          notes: notes || existing.notes
        };
      } else {
        const newPos: PortfolioPosition = {
          id: `pos-${Date.now()}-${stock.ticker}`,
          ticker: stock.ticker,
          companyName: stock.companyName,
          shares: shares,
          buyPrice: buyPrice,
          actionFee: actionFee,
          buyDate: new Date().toISOString().slice(0, 10),
          notes: notes || `Direct allocation. Quality Score: ${stock.investmentScore}/100.`
        };
        currentPositions.push(newPos);
      }
      const serialized = JSON.stringify(currentPositions);
      localStorage.setItem('MY_PERSONAL_HOLDINGS_V1', serialized);
      localStorage.setItem('INSTITUTIONAL_PORTFOLIO_DATA_V1', serialized);
      window.dispatchEvent(new Event('portfolio-updated'));
      setPortfolioPositionsCount(currentPositions.length);
      setActiveTab('portfolio');
    } catch (e) {
      console.error('Failed to add to portfolio', e);
    }
  };

  // Add stock from watchlist modal to portfolio
  const handleAddFromWatchlistToPortfolio = (stock: ResearchStock, buyPrice: number, shares: number) => {
    handleConfirmAddToPortfolio(stock, shares, buyPrice, `Added from Watchlist. Quality Score: ${stock.investmentScore}/100.`);
  };

  const top5List = stocks.slice(0, 5);
  const pageTitleMap: Record<string, { he: string; en: string }> = {
    home: { he: 'סקירה ראשית', en: 'Overview' },
    premarket_session: { he: 'טרום-מסחר לייב (Pre-Market)', en: 'Live Pre-Market Trading' },
    afterhours_session: { he: 'מסחר לאחר סגירה לייב (After-Hours)', en: 'Live After-Hours Trading' },
    premarket: { he: 'חדשות יומיות וניתוח תגובה', en: 'Daily News & Reaction Analysis' },
    top10: { he: 'גלאי מניות השוק', en: 'Market Screener' },
    portfolio: { he: 'תיק אישי', en: 'Personal Portfolio' },
    watchlist: { he: 'רשימת מעקב', en: 'Watchlist' },
    top5: { he: 'מחקר מעמיק', en: 'Deep Dive Research' },
    analyzer: { he: 'אנליסט AI', en: 'AI Analyst' },
    earnings: { he: 'יומן דוחות כספיים', en: 'Earnings Calendar' },
    toolshub: { he: 'כל הכלים המוסדיים', en: 'Institutional Tools' },
    dcf: { he: 'מודל שווי הוגן (DCF)', en: 'DCF Valuation' },
    reversedcf: { he: 'Reverse DCF', en: 'Reverse DCF' },
    simulator: { he: 'סימולטור תיק השקעות', en: 'Portfolio Simulator' },
    yield: { he: 'תשואת בעלי מניות', en: 'Shareholder Yield' },
    compmap: { he: 'מפת חפיר תחרותית', en: 'Competitive Map' },
    thesismonitor: { he: 'בקרת תזה ויומן', en: 'Thesis Monitor' },
    quarterly: { he: 'דוחות רבעוניים וניתוח SEC', en: 'Quarterly Reports & Analysis' },
    macro: { he: 'מבחן לחץ מאקרו', en: 'Macro Stress Test' },
    terminal: { he: 'מסוף מחקר', en: 'Market Terminal' },
    print: { he: 'מזכר השקעה להדפסה', en: 'Investment Memo' },
    compare: { he: 'השוואת מניות', en: 'Stock Comparison' },
    top20: { he: 'טבלת איכות Top 20', en: 'Top 20 Matrix' },
    rules: { he: 'מתודולוגיית המחקר', en: 'Methodology' },
  };
  const currentPageTitle = pageTitleMap[activeTab]?.[currentLang === 'he' ? 'he' : 'en'] || (currentLang === 'he' ? 'סקירה ראשית' : 'Overview');

  useEffect(() => {
    document.title = `MoatGuard · ${currentPageTitle}`;
  }, [currentPageTitle]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Sidebar (Desktop Fixed + Mobile Drawer) */}
      <RightSidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchTicker={handleSearchTicker}
        isSearching={isSearching}
        onSelectStock={handleSelectQuickTicker}
        onLaunchStockTool={handleLaunchStockTool}
        portfolioCount={portfolioPositionsCount}
        watchlistCount={watchlist.length}
        watchlist={watchlist}
        isLiveStreaming={isLiveStreaming}
        onToggleLiveStream={() => setIsLiveStreaming((prev) => !prev)}
        onManualRefreshPrices={handleManualRefreshPrices}
        livePrices={livePrices}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area: accommodates sidebar width cleanly in both RTL and LTR */}
      <div
        className={`transition-all duration-200 ${
          isSidebarCollapsed
            ? 'rtl:md:mr-16 ltr:md:ml-16'
            : 'rtl:md:mr-64 ltr:md:ml-64'
        }`}
      >
        {/* Clean Top Context Header Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
              aria-label={currentLang === 'he' ? 'פתח תפריט' : 'Open menu'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-bold text-white truncate">{currentPageTitle}</span>
              <span className="hidden sm:inline text-slate-600">·</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-mono truncate">
                {currentLang === 'he'
                  ? `עודכן ${new Date(lastQuotesSyncTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                  : `Synced ${new Date(lastQuotesSyncTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualRefreshPrices}
              disabled={isSyncingQuotes}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingQuotes ? 'animate-spin' : ''}`} />
              <span>{isSyncingQuotes ? (currentLang === 'he' ? 'מסנכרן...' : 'Syncing...') : (currentLang === 'he' ? 'רענן מחירים' : 'Refresh Prices')}</span>
            </button>
          </div>
        </header>

        {/* Flagship Home Landing Page */}
        {activeTab === 'home' && (
          <PremiumHomeLanding
            stocks={stocks}
            watchlist={watchlist}
            livePrices={livePrices}
            onToggleWatchlist={handleToggleWatchlist}
            onAddToPortfolio={handleQuickAddToPortfolio}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
            onOpenDeepDive={handleOpenDeepDive}
            onNavigateTab={(tabId) => setActiveTab(tabId)}
            onSearchPrompt={(query) => {
              setScreenerInitialSearch(query);
              setActiveTab('top10');
            }}
            currentLang={currentLang}
          />
        )}

        {/* Main Container for Tool Tabs */}
        {activeTab !== 'home' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
          {/* Tab: Live Pre-Market Session */}
          {activeTab === 'premarket_session' && (
            <ExtendedHoursTracker
              session="PRE"
              stocks={stocks}
              watchlist={watchlist}
              watchlists={watchlists}
              onToggleWatchlist={handleToggleWatchlist}
              onAddToPortfolio={handleQuickAddToPortfolio}
              onSelectStock={(stk) => setSelectedStockForModal(stk)}
              onOpenDeepDive={handleOpenDeepDive}
              onSwitchSessionTab={(tabId) => setActiveTab(tabId)}
              currentLang={currentLang}
            />
          )}

          {/* Tab: Live After-Hours Session */}
          {activeTab === 'afterhours_session' && (
            <ExtendedHoursTracker
              session="POST"
              stocks={stocks}
              watchlist={watchlist}
              watchlists={watchlists}
              onToggleWatchlist={handleToggleWatchlist}
              onAddToPortfolio={handleQuickAddToPortfolio}
              onSelectStock={(stk) => setSelectedStockForModal(stk)}
              onOpenDeepDive={handleOpenDeepDive}
              onSwitchSessionTab={(tabId) => setActiveTab(tabId)}
              currentLang={currentLang}
            />
          )}

          {/* Tab: Pre-Market Daily Intelligence & Opening Bell Recommendations */}
          {activeTab === 'premarket' && (
            <PremarketNewsIntelligence
              stocks={stocks}
              watchlist={watchlist}
              livePrices={livePrices}
              onToggleWatchlist={handleToggleWatchlist}
              onAddToPortfolio={handleQuickAddToPortfolio}
              onOpenDeepDive={handleOpenDeepDive}
              onSelectStock={(stk) => setSelectedStockForModal(stk)}
              currentLang={currentLang}
            />
          )}

          {/* Tab: Dedicated Institutional Tools Hub */}
          {activeTab === 'toolshub' && (
            <InstitutionalToolsHub
              onSelectTool={(toolId) => setActiveTab(toolId)}
              onNavigateHome={() => setActiveTab('top10')}
              currentLang={currentLang}
            />
          )}

        {/* Tab: Portfolio */}
        {activeTab === 'portfolio' && (
          <PersonalPortfolioTracker
            stocks={stocks}
            livePrices={livePrices}
            onOpenDeepDive={handleOpenDeepDive}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
            currentLang={currentLang}
            onRefreshQuotes={handleManualRefreshPrices}
            onRegisterTickers={handleRegisterTickers}
            isSyncingQuotes={isSyncingQuotes}
            lastQuotesSyncTime={lastQuotesSyncTime}
          />
        )}

        {/* Tab: DCF Fair Value Model */}
        {activeTab === 'dcf' && (
          <DcfValuationCalculator
            stocks={stocks}
            selectedStock={selectedStockForDeepDive}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
            livePrices={livePrices}
            onAddStockToUniverse={handleAddStockToUniverse}
          />
        )}

        {/* Tab: Shareholder Yield & Buybacks */}
        {activeTab === 'yield' && (
          <ShareholderYieldAnalyzer
            stocks={stocks}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Reverse DCF & Implied Expectations */}
        {activeTab === 'reversedcf' && (
          <ReverseDcfExpectations
            stocks={stocks}
            selectedStock={selectedStockForDeepDive}
            livePrices={livePrices}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
            onAddStockToUniverse={handleAddStockToUniverse}
          />
        )}

        {/* Tab: Competitive Moat Map */}
        {activeTab === 'compmap' && (
          <CompetitiveMapViewer
            stocks={stocks}
            selectedStock={selectedStockForDeepDive}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Thesis Monitor & Diary */}
        {activeTab === 'thesismonitor' && (
          <ThesisIntelligenceCenter
            stocks={stocks}
            selectedStock={selectedStockForDeepDive}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Macro Stress Testing */}
        {activeTab === 'macro' && (
          <MacroStressTester
            stocks={stocks}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Earnings Calendar */}
        {activeTab === 'earnings' && (
          <EarningsCalendarViewer
            stocks={stocks}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Bloomberg Terminal Pro */}
        {activeTab === 'terminal' && (
          <BloombergTerminalView
            stocks={stocks}
            livePrices={livePrices}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Printable Investment Memo */}
        {activeTab === 'print' && (
          <InvestmentMemoPrinter
            stocks={stocks}
            selectedStock={selectedStockForDeepDive}
            currentLang={currentLang}
            livePrices={livePrices}
            onAddStockToUniverse={handleAddStockToUniverse}
          />
        )}

        {/* Tab: Watchlist */}
        {activeTab === 'watchlist' && (
          <WatchlistManager
            stocks={stocks}
            watchlist={watchlist}
            watchlists={watchlists}
            activeWatchlistId={activeWatchlist?.id || 'default'}
            onSelectWatchlist={(id) => setActiveWatchlistId(id)}
            onCreateWatchlist={handleCreateWatchlist}
            onRenameWatchlist={handleRenameWatchlist}
            onDeleteWatchlist={handleDeleteWatchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onUpdateWatchlistItem={handleUpdateWatchlistItem}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onAddFromWatchlistToPortfolio={handleAddFromWatchlistToPortfolio}
            onOpenDeepDive={handleOpenDeepDive}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
            onRegisterTickers={handleRegisterTickers}
            livePrices={livePrices}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Top 5 Deep Dives */}
        {activeTab === 'top5' && (
          <DeepDiveTop5
            top5Stocks={top5List}
            allStocks={stocks}
            selectedStock={selectedStockForDeepDive}
            onSelectStock={(stk) => setSelectedStockForDeepDive(stk)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onAddToPortfolio={handleQuickAddToPortfolio}
            currentLang={currentLang}
            livePrices={livePrices}
          />
        )}

        {/* Tab: Live AI Analyzer */}
        {activeTab === 'analyzer' && (
          <LiveTickerAnalyzer
            onAddStockToUniverse={handleAddStockToUniverse}
            onOpenDeepDive={handleOpenDeepDive}
            onOpenPrintMemo={(stk) => {
              setSelectedStockForDeepDive(stk);
              setActiveTab('print');
            }}
            currentLang={currentLang}
            livePrices={livePrices}
          />
        )}

        {/* Tab: Top 20 Matrix */}
        {activeTab === 'top20' && (
          <Top20Table
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onAddToPortfolio={handleQuickAddToPortfolio}
            livePrices={livePrices}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
            onOpenDeepDive={handleOpenDeepDive}
            currentLang={currentLang}
          />
        )}

        {/* Tab: Top 10 Auto Scanner & Leaderboard */}
        {activeTab === 'top10' && (
          <AutoTop10Scanner
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onAddToPortfolio={handleQuickAddToPortfolio}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
            onOpenDeepDive={handleOpenDeepDive}
            livePrices={livePrices}
            currentLang={currentLang}
            initialSearchQuery={screenerInitialSearch}
            onRegisterTickers={handleRegisterTickers}
          />
        )}

        {/* Tab: Head-to-Head Compare */}
        {activeTab === 'compare' && (
          <StockComparison
            stocks={stocks}
            initialStockA={selectedStockForDeepDive}
            initialStockB={stocks.find((s) => s.ticker !== selectedStockForDeepDive.ticker) || stocks[1]}
            onOpenDeepDive={handleOpenDeepDive}
          />
        )}

        {/* Tab: 5Y Allocator Simulator */}
        {activeTab === 'simulator' && (
          <PortfolioSimulator
            stocks={stocks}
            onOpenDeepDive={handleOpenDeepDive}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
          />
        )}

        {/* Tab: Quarterly Monitor */}
        {activeTab === 'quarterly' && (
          <QuarterlyMonitor
            stocks={stocks}
            selectedStock={selectedStockForDeepDive}
            onSelectStock={(stk) => setSelectedStockForDeepDive(stk)}
            currentLang={currentLang}
          />
        )}

        {/* Tab: 30 Rules Specification */}
        {activeTab === 'rules' && <MethodologyViewer />}
      </main>
      )}

      {/* Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStockForModal}
        watchlist={watchlist}
        onToggleWatchlist={handleToggleWatchlist}
        onAddToPortfolio={handleQuickAddToPortfolio}
        onClose={() => setSelectedStockForModal(null)}
        onGoToDeepDive={handleOpenDeepDive}
        currentLang={currentLang}
        livePrice={selectedStockForModal ? livePrices[selectedStockForModal.ticker] : undefined}
      />

      {/* Add To Portfolio Interactive Modal */}
      <AddToPortfolioModal
        stock={stockForPortfolioModal}
        isOpen={!!stockForPortfolioModal}
        onClose={() => setStockForPortfolioModal(null)}
        onConfirmAdd={handleConfirmAddToPortfolio}
        currentLang={currentLang}
        livePrice={stockForPortfolioModal ? livePrices[stockForPortfolioModal.ticker]?.price : undefined}
      />

      {/* Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white">MoatGuard PRO</span>
            <span>• {t.footerCopyright}</span>
          </div>
          <span>{t.footerSources}</span>
        </div>
      </footer>
      </div>
    </div>
  );
}
