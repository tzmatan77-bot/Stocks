import React, { useState, useEffect, useMemo } from 'react';
import { ResearchStock, PortfolioPosition, RealizedTransaction, PortfolioTranche } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { PortfolioPerformanceChart, PortfolioChartHolding } from './PortfolioPerformanceChart';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { MARKET_UNIVERSE_CATALOG, MarketScreenerStock } from '../data/marketUniverseData';
import { getResearchStock } from '../data/researchStockGenerator';
import { INITIAL_PREMARKET_NEWS_FEED } from '../data/premarketNewsData';
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Award,
  AlertCircle,
  Clock,
  ShieldCheck,
  Edit2,
  Check,
  Bell,
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  Globe,
  SlidersHorizontal,
  Flame,
  RefreshCw,
  Activity,
  Upload,
  Download,
  FileSpreadsheet,
  Coins,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  AlertTriangle,
  Zap,
  Layers,
  History,
  ArrowDownRight,
  Percent,
  Info,
  ShieldAlert,
  Scale,
  ChevronDown,
  ChevronUp,
  Calculator,
  Calendar,
  FileText,
} from 'lucide-react';

interface PersonalPortfolioTrackerProps {
  stocks: ResearchStock[];
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number; previousClose?: number; timestamp?: number; source?: string }>;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onSelectStock?: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  onRefreshQuotes?: () => void;
  onRegisterTickers?: (tickers: string[]) => void;
  isSyncingQuotes?: boolean;
  lastQuotesSyncTime?: number;
}

const STORAGE_KEY = 'MY_PERSONAL_HOLDINGS_V1';
const REALIZED_STORAGE_KEY = 'MY_REALIZED_TRANSACTIONS_V1';

// מחיר פעולה קבוע לפעולה (לא למניה) - מעודכן מהיום ל-7 דולר קדימה (עסקאות היסטוריות נשמרות לפי 7.50)
export const ACTION_FEE_USD = 7.00;

const DEFAULT_PORTFOLIO: PortfolioPosition[] = [
  {
    id: 'pos-sofi',
    ticker: 'SOFI',
    companyName: 'SoFi Technologies, Inc.',
    shares: 20,
    buyPrice: 16.00,
    actionFee: 14.50,
    purchaseDate: '2026-08-01',
    notes: '2 מנות ($7.50+$7.00) - בנקאות דיגיטלית ופינטק',
  },
  {
    id: 'pos-bkng',
    ticker: 'BKNG',
    companyName: 'Booking Holdings Inc.',
    shares: 2,
    buyPrice: 172.86,
    actionFee: 7.00,
    purchaseDate: '2026-08-05',
    notes: 'פלטפורמת נסיעות ומלונות גלובלית',
  },
  {
    id: 'pos-abbv',
    ticker: 'ABBV',
    companyName: 'AbbVie Inc.',
    shares: 2,
    buyPrice: 262.00,
    actionFee: 7.00,
    purchaseDate: '2026-08-10',
    notes: 'ביופארמה, אימונולוגיה ודיבידנד צומח',
  },
  {
    id: 'pos-ko',
    ticker: 'KO',
    companyName: 'The Coca-Cola Company',
    shares: 3,
    buyPrice: 87.89,
    actionFee: 7.00,
    purchaseDate: '2026-08-12',
    notes: 'עוגן צריכה בסיסית הגנתי ותשואת דיבידנד',
  },
  {
    id: 'pos-nvda',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    shares: 7,
    buyPrice: 223.31,
    actionFee: 21.00,
    purchaseDate: '2026-07-20',
    notes: '3 מנות (DCA) - מונופול חומרת AI ומאיצים',
  },
  {
    id: 'pos-amzn',
    ticker: 'AMZN',
    companyName: 'Amazon.com, Inc.',
    shares: 7,
    buyPrice: 239.69,
    actionFee: 14.00,
    purchaseDate: '2026-07-15',
    notes: '3 מנות (DCA) - מסחר וענן AWS',
  },
  {
    id: 'pos-uber',
    ticker: 'UBER',
    companyName: 'Uber Technologies, Inc.',
    shares: 6,
    buyPrice: 72.72,
    actionFee: 14.00,
    purchaseDate: '2026-08-15',
    notes: '2 מנות (DCA). ציון איכות: 89/100',
  },
  {
    id: 'pos-googl',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    shares: 6,
    buyPrice: 343.68,
    actionFee: 29.50,
    purchaseDate: '2026-07-01',
    notes: '4 מנות (DCA). ציון איכות: 93/100',
  },
  {
    id: 'pos-now',
    ticker: 'NOW',
    companyName: 'ServiceNow, Inc.',
    shares: 2,
    buyPrice: 137.26,
    actionFee: 7.50,
    purchaseDate: '2026-08-20',
    notes: 'פוזיציית איכות לשנתיים (FY2). ציון מודל: 90/100',
  },
];

export const PersonalPortfolioTracker: React.FC<PersonalPortfolioTrackerProps> = ({
  stocks,
  livePrices,
  onOpenDeepDive,
  onSelectStock,
  currentLang = 'he',
  onRefreshQuotes,
  onRegisterTickers,
  isSyncingQuotes = false,
  lastQuotesSyncTime = Date.now(),
}) => {
  const isHe = currentLang === 'he';

  const handleStockClick = (stock: ResearchStock) => {
    if (onSelectStock) {
      onSelectStock(stock);
    } else {
      onOpenDeepDive(stock);
    }
  };

  // Load persisted holdings
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out dummy starter positions pos-1 (BSX) and pos-2 (UNH)
          const cleaned = parsed.filter(
            (p) => !(p.ticker === 'BSX' && p.id === 'pos-1') && !(p.ticker === 'UNH' && p.id === 'pos-2')
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
            window.dispatchEvent(new Event('portfolio-updated'));
          }
          return cleaned.length > 0 ? cleaned : DEFAULT_PORTFOLIO;
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_PORTFOLIO;
  });

  // Re-sync with localStorage if changed externally (e.g. from modal or other tab)
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPositions(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('portfolio-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('portfolio-updated', handleSync);
    };
  }, []);

  // Sync to server on first load
  useEffect(() => {
    fetch('/api/user-portfolio', { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.positions) && data.positions.length > 0) {
          // If server has custom positions, sync them
          setPositions(data.positions);
        } else if (positions && positions.length > 0) {
          // Send current client positions to server
          fetch('/api/user-portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ positions }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Realized Transactions State (מימושים שבוצעו)
  const [realizedTransactions, setRealizedTransactions] = useState<RealizedTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(REALIZED_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'real-demo-1',
        ticker: 'NVDA',
        companyName: 'NVIDIA Corporation',
        sharesSold: 15,
        sellPrice: 128.50,
        avgBuyPrice: 104.00,
        actionFee: 7.50,
        buyActionFee: 7.50,
        grossProceeds: 1927.50,
        netProceeds: 1920.00,
        realizedPnL: 352.50,
        realizedPnLPct: 22.49,
        saleDate: '2026-08-18',
        notes: 'מימוש רווחים חלקי לפי תוכנית מסחר',
        timestamp: Date.now() - 20 * 86400000,
      },
      {
        id: 'real-demo-2',
        ticker: 'LLY',
        companyName: 'Eli Lilly and Company',
        sharesSold: 10,
        sellPrice: 945.00,
        avgBuyPrice: 780.00,
        actionFee: 7.50,
        buyActionFee: 7.50,
        grossProceeds: 9450.00,
        netProceeds: 9442.50,
        realizedPnL: 1635.00,
        realizedPnLPct: 20.94,
        saleDate: '2026-07-10',
        notes: 'נעילת רווחי שיא לאחר פריצת GLP-1',
        timestamp: Date.now() - 60 * 86400000,
      },
      {
        id: 'real-demo-3',
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        sharesSold: 20,
        sellPrice: 215.00,
        avgBuyPrice: 190.00,
        actionFee: 7.50,
        buyActionFee: 7.50,
        grossProceeds: 4300.00,
        netProceeds: 4292.50,
        realizedPnL: 485.00,
        realizedPnLPct: 12.74,
        saleDate: '2025-11-14',
        notes: 'איזון תיק סוף שנה 2025',
        timestamp: Date.now() - 300 * 86400000,
      }
    ];
  });

  // Save Realized Transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REALIZED_STORAGE_KEY, JSON.stringify(realizedTransactions));
    } catch (e) {}
  }, [realizedTransactions]);

  // Memoize tickers string to avoid spurious re-triggers
  const tickersKey = useMemo(() => {
    return positions.map((p) => p.ticker.toUpperCase().trim()).sort().join(',');
  }, [positions]);

  // Automatically register all portfolio tickers for live market quote feed
  useEffect(() => {
    if (onRegisterTickers && tickersKey) {
      const tickers = tickersKey.split(',');
      onRegisterTickers(tickers);
    }
  }, [tickersKey, onRegisterTickers]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Table filter search
  const [tableFilter, setTableFilter] = useState('');
  // Filter tab: all, warnings, profit, loss
  const [filterTab, setFilterTab] = useState<'all' | 'warnings' | 'profit' | 'loss'>('all');

  // Table sorting state: supports sorting by Daily Change % (High to Low / Low to High) and other key metrics
  type SortField = 'default' | 'dailyChangePct' | 'dailyGain' | 'currentValue' | 'totalGain' | 'totalGainPct' | 'currentPrice' | 'buyPrice' | 'shares' | 'ticker' | 'actionFee' | 'weight';
  type SortDirection = 'asc' | 'desc';

  const [sortBy, setSortBy] = useState<SortField>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleToggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleResetSort = () => {
    setSortBy('default');
    setSortDirection('desc');
  };

  // Add Position Modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'catalog' | 'custom'>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedStockTicker, setSelectedStockTicker] = useState<string>('NVDA');
  const [customTicker, setCustomTicker] = useState<string>('');
  const [customCompanyName, setCustomCompanyName] = useState<string>('');
  const [sharesInput, setSharesInput] = useState<string>('10');
  const [costBasisInput, setCostBasisInput] = useState<string>('150.00');
  const [purchaseDateInput, setPurchaseDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notesInput, setNotesInput] = useState<string>('');

  // Edit Position Modal state
  const [editingPosition, setEditingPosition] = useState<PortfolioPosition | null>(null);
  const [editShares, setEditShares] = useState<string>('');
  const [editBuyPrice, setEditBuyPrice] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  // BUY MORE / DCA MODAL STATE (קנייה שוב במחיר שונה ושקלול ממוצע)
  const [buyingMorePosition, setBuyingMorePosition] = useState<PortfolioPosition | null>(null);
  const [buyMoreShares, setBuyMoreShares] = useState<string>('10');
  const [buyMorePrice, setBuyMorePrice] = useState<string>('');
  const [buyMoreDate, setBuyMoreDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [buyMoreNotes, setBuyMoreNotes] = useState<string>('');

  // SELL / REALIZE MODAL STATE (מימוש ומכירת מניות)
  const [sellingPosition, setSellingPosition] = useState<PortfolioPosition | null>(null);
  const [sellShares, setSellShares] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('');
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sellNotes, setSellNotes] = useState<string>('');

  // REALIZED TRADES JOURNAL MODAL (יומן מימושים)
  const [showRealizedLogModal, setShowRealizedLogModal] = useState<boolean>(false);

  // Portfolio Primary View Tab: 'active' (פוזיציות פתוחות בתיק), 'realized' (טבלת מימושים שנתית), 'both' (הצג את שתיהן יחד)
  const [portfolioViewTab, setPortfolioViewTab] = useState<'active' | 'realized' | 'both'>('both');

  // Realized Trades Year Filter (e.g. 'all', '2026', '2025')
  const [realizedYearFilter, setRealizedYearFilter] = useState<string>('all');

  // DCA Educational Guide Collapsible State
  const [showDcaGuideBanner, setShowDcaGuideBanner] = useState<boolean>(true);

  // HOLDING RISK / CATALYST ALERT DETAIL MODAL
  const [selectedAlertHolding, setSelectedAlertHolding] = useState<{
    ticker: string;
    companyName: string;
    severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'FORECAST';
    title: string;
    summary: string;
    badgeLabel: string;
    actionLabel: string;
    openingBellPlan: string;
    impactOnMoat: string;
    source?: string;
    publishedTime?: string;
  } | null>(null);

  // Live News Alerts scan from server
  const [portfolioNewsAlerts, setPortfolioNewsAlerts] = useState<Record<string, any>>({});

  useEffect(() => {
    const scanPortfolio = async () => {
      try {
        const tickers = positions.map((p) => p.ticker.toUpperCase().trim());
        if (tickers.length === 0) return;
        const res = await fetch('/api/portfolio-news-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ tickers }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.alerts && typeof data.alerts === 'object') {
            setPortfolioNewsAlerts(data.alerts);
          } else if (data && Array.isArray(data.results)) {
            const map: Record<string, any> = {};
            data.results.forEach((r: any) => {
              if (r?.ticker) map[r.ticker.toUpperCase().trim()] = r;
            });
            setPortfolioNewsAlerts(map);
          }
        }
      } catch (e) {
        // silent fallback to local catalyst catalog
      }
    };
    scanPortfolio();
  }, [tickersKey]);

  // CSV Import Modal state
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvInputText, setCsvInputText] = useState('');
  const [csvImportError, setCsvImportError] = useState<string | null>(null);

  // Handle CSV Import
  const handleImportCsv = (e: React.FormEvent) => {
    e.preventDefault();
    setCsvImportError(null);
    if (!csvInputText.trim()) {
      setCsvImportError(isHe ? 'נא להזין נתוני CSV תקינים' : 'Please provide valid CSV content');
      return;
    }

    try {
      const lines = csvInputText.trim().split('\n');
      const imported: PortfolioPosition[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Skip header if contains ticker or symbol
        if (i === 0 && (line.toLowerCase().includes('ticker') || line.toLowerCase().includes('symbol'))) {
          continue;
        }
        const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length < 2) continue;
        const ticker = parts[0].toUpperCase();
        const shares = parseFloat(parts[1]) || 1;
        const buyPrice = parseFloat(parts[2]) || 100;
        const purchaseDate = parts[3] || new Date().toISOString().slice(0, 10);
        const notes = parts[4] || (isHe ? 'יובא באמצעות CSV' : 'Imported via CSV');

        const researchObj = getResearchStock(ticker);
        imported.push({
          id: `csv-${Date.now()}-${i}-${ticker}`,
          ticker,
          companyName: researchObj.companyName || `${ticker} Corp`,
          shares,
          buyPrice,
          purchaseDate,
          actionFee: ACTION_FEE_USD,
          notes,
        });
      }

      if (imported.length === 0) {
        setCsvImportError(isHe ? 'לא זוהו שורות תקינות בקובץ' : 'No valid lines identified');
        return;
      }

      setPositions((prev) => [...imported, ...prev]);
      if (onRegisterTickers) {
        onRegisterTickers(imported.map((p) => p.ticker));
      }
      setShowCsvImportModal(false);
      setCsvInputText('');
    } catch (err: any) {
      setCsvImportError(err?.message || (isHe ? 'שגיאה בניתוח קובץ CSV' : 'Failed to parse CSV'));
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    try {
      const headers = ['Ticker', 'Company', 'Shares', 'BuyPrice', 'ActionFee', 'PurchaseDate', 'CurrentPrice', 'CurrentValue', 'TotalProfit', 'TotalProfitPercent', 'AnnualDividends', 'Notes'];
      const rows = calculatedPositions.map((p) => [
        p.ticker,
        `"${(p.companyName || '').replace(/"/g, '""')}"`,
        p.shares,
        p.buyPrice,
        p.actionFee.toFixed(2),
        p.purchaseDate || p.buyDate || '',
        p.currentPrice,
        p.currentValue.toFixed(2),
        p.totalGain.toFixed(2),
        p.totalGainPct.toFixed(2),
        p.annualDividends.toFixed(2),
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `portfolio_holdings_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Failed to export CSV', e);
    }
  };

  // Persist positions to localStorage and sync to server
  useEffect(() => {
    try {
      const json = JSON.stringify(positions);
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem('INSTITUTIONAL_PORTFOLIO_DATA_V1', json);
      fetch('/api/user-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to save portfolio to local storage', e);
    }
  }, [positions]);

  // Combined stock lookup universe for catalog selection
  const allCatalogStocks = useMemo(() => {
    const list: Array<{ ticker: string; name: string; nameHe?: string; sector: string; pe?: number; score?: number }> = [];
    const seen = new Set<string>();

    // 1. Add stocks from top 30
    stocks.forEach((s) => {
      if (!seen.has(s.ticker.toUpperCase())) {
        seen.add(s.ticker.toUpperCase());
        list.push({
          ticker: s.ticker,
          name: s.companyName,
          sector: s.sector,
          score: s.investmentScore
        });
      }
    });

    // 2. Add all stocks from market catalog (hundreds of stocks)
    MARKET_UNIVERSE_CATALOG.forEach((m) => {
      if (!seen.has(m.ticker.toUpperCase())) {
        seen.add(m.ticker.toUpperCase());
        list.push({
          ticker: m.ticker,
          name: m.name,
          nameHe: m.nameHe,
          sector: m.sector,
          pe: m.pe,
          score: m.score
        });
      }
    });

    return list;
  }, [stocks]);

  // Filtered catalog stocks for search
  const filteredCatalogStocks = useMemo(() => {
    if (!catalogSearch.trim()) return allCatalogStocks.slice(0, 40);
    const q = catalogSearch.toLowerCase().trim();
    return allCatalogStocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.nameHe && s.nameHe.toLowerCase().includes(q)) ||
        s.sector.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [allCatalogStocks, catalogSearch]);

  // When custom ticker is typed, auto-fetch / estimate details
  const handleCustomTickerChange = (tickerStr: string) => {
    const clean = tickerStr.toUpperCase().trim();
    setCustomTicker(clean);
    if (clean.length >= 1) {
      const match = allCatalogStocks.find((s) => s.ticker.toUpperCase() === clean);
      if (match) {
        setCustomCompanyName(match.name);
        const live = livePrices[clean]?.price;
        if (live) setCostBasisInput(live.toFixed(2));
      } else {
        const generated = getResearchStock(clean);
        setCustomCompanyName(generated.companyName);
        const p = parseFloat(generated.currentPrice.replace(/[^0-9.]/g, '')) || 100;
        setCostBasisInput(p.toFixed(2));
      }
    }
  };

  // Open Add modal with defaults
  const handleOpenAddModal = () => {
    setAddMode('catalog');
    setCatalogSearch('');
    setSelectedStockTicker('NVDA');
    const nvdaLive = livePrices['NVDA']?.price || 125;
    setCostBasisInput(nvdaLive.toFixed(2));
    setSharesInput('10');
    setNotesInput('');
    setCustomTicker('');
    setCustomCompanyName('');
    setPurchaseDateInput(new Date().toISOString().split('T')[0]);
    setShowAddForm(true);
  };

  // Select stock in catalog mode
  const handleSelectCatalogStock = (ticker: string) => {
    setSelectedStockTicker(ticker);
    const live = livePrices[ticker]?.price;
    if (live) {
      setCostBasisInput(live.toFixed(2));
    } else {
      const rs = getResearchStock(ticker);
      const parsed = parseFloat(rs.currentPrice.replace(/[^0-9.]/g, ''));
      const p = !isNaN(parsed) && parsed > 0 ? parsed : 100;
      setCostBasisInput(p.toFixed(2));
    }
  };

  // Handle Add Position Submit (with automatic DCA consolidation if stock already in portfolio)
  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = addMode === 'catalog' ? selectedStockTicker.toUpperCase() : (customTicker.toUpperCase() || 'CUSTOM');
    const researchObj = getResearchStock(ticker);
    const companyName = addMode === 'catalog'
      ? researchObj.companyName
      : (customCompanyName.trim() || researchObj.companyName || `${ticker} Corp`);

    const sharesNum = Math.max(0.001, parseFloat(sharesInput) || 1);
    const costNum = Math.max(0.01, parseFloat(costBasisInput) || 100);

    const existingPos = positions.find((p) => p.ticker.toUpperCase() === ticker);
    if (existingPos) {
      // Consolidate into existing holding and calculate weighted average cost!
      const currentShares = existingPos.shares;
      const currentPrice = existingPos.buyPrice;
      const currentFee = existingPos.actionFee ?? ACTION_FEE_USD;
      const totalShares = currentShares + sharesNum;
      const totalCost = (currentShares * currentPrice) + (sharesNum * costNum);
      const newWeightedAvg = totalCost / totalShares;
      const newTotalFee = currentFee + ACTION_FEE_USD;

      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === existingPos.id) {
            return {
              ...p,
              shares: Number(totalShares.toFixed(4)),
              buyPrice: Number(newWeightedAvg.toFixed(2)),
              actionFee: newTotalFee,
              notes: notesInput.trim() ? `${p.notes ? p.notes + ' | ' : ''}${notesInput.trim()}` : p.notes,
            };
          }
          return p;
        })
      );
      showToast(
        isHe
          ? `✅ מניית ${ticker} כבר קיימת בתיק! כמות המניות עודכנה ל-${totalShares.toFixed(2)} ומחיר הקנייה הממוצע שוקלל ל-$${newWeightedAvg.toFixed(2)} (נוסף מחיר פעולה $${ACTION_FEE_USD.toFixed(2)}).`
          : `Position ${ticker} consolidated to ${totalShares.toFixed(2)} shares @ $${newWeightedAvg.toFixed(2)} weighted avg cost (added $${ACTION_FEE_USD.toFixed(2)} action fee).`,
        'success'
      );
      setShowAddForm(false);
      return;
    }

    const newPos: PortfolioPosition = {
      id: `pos-${Date.now()}-${ticker}`,
      ticker: ticker,
      companyName: companyName,
      shares: sharesNum,
      buyPrice: costNum,
      actionFee: ACTION_FEE_USD, // $7.00 קבוע לפעולה (מעודכן מהיום)
      purchaseDate: purchaseDateInput || new Date().toISOString().split('T')[0],
      notes: notesInput.trim() || undefined,
    };

    setPositions((prev) => [newPos, ...prev]);
    if (onRegisterTickers) {
      onRegisterTickers([ticker]);
    }
    showToast(isHe ? `✅ מניית ${ticker} נוספה בהצלחה לתיק האישי! (מחיר פעולה: $${ACTION_FEE_USD.toFixed(2)})` : `Added ${ticker} to your portfolio! ($${ACTION_FEE_USD.toFixed(2)} action fee applied)`, 'success');
    setShowAddForm(false);
  };

  // Handle Delete
  const handleDeletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
    showToast(isHe ? '🗑️ הפוזיציה הוסרה מהתיק.' : 'Position removed from portfolio.', 'info');
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (pos: PortfolioPosition) => {
    setEditingPosition(pos);
    setEditShares(pos.shares.toString());
    setEditBuyPrice(pos.buyPrice.toString());
    setEditNotes(pos.notes || '');
    setEditDate(pos.purchaseDate || pos.buyDate || new Date().toISOString().split('T')[0]);
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition) return;
    const sharesNum = Math.max(0.001, parseFloat(editShares) || 1);
    const buyNum = Math.max(0.01, parseFloat(editBuyPrice) || 1);

    setPositions((prev) =>
      prev.map((p) => {
        if (p.id === editingPosition.id) {
          return {
            ...p,
            shares: sharesNum,
            buyPrice: buyNum,
            notes: editNotes.trim() || undefined,
            purchaseDate: editDate,
          };
        }
        return p;
      })
    );
    showToast(isHe ? `✅ עודכנה בהצלחה פוזיציית ${editingPosition.ticker}.` : `Updated ${editingPosition.ticker}.`, 'success');
    setEditingPosition(null);
  };

  // BUY MORE / DCA HANDLERS (קנייה שוב במחיר שונה ושקלול מחיר ממוצע)
  const handleOpenBuyMore = (pos: PortfolioPosition) => {
    setBuyingMorePosition(pos);
    const live = livePrices[pos.ticker.toUpperCase()]?.price || pos.buyPrice;
    setBuyMoreShares('10');
    setBuyMorePrice(live.toFixed(2));
    setBuyMoreDate(new Date().toISOString().split('T')[0]);
    setBuyMoreNotes('');
  };

  const handleConfirmBuyMore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingMorePosition) return;
    const currentShares = buyingMorePosition.shares;
    const currentBuyPrice = buyingMorePosition.buyPrice;
    const currentFee = buyingMorePosition.actionFee ?? ACTION_FEE_USD;
    const addedShares = Math.max(0.001, parseFloat(buyMoreShares) || 1);
    const addedPrice = Math.max(0.01, parseFloat(buyMorePrice) || 1);

    const totalShares = currentShares + addedShares;
    const totalCost = (currentShares * currentBuyPrice) + (addedShares * addedPrice);
    const newWeightedAvg = totalCost / totalShares;
    const newTotalActionFee = currentFee + ACTION_FEE_USD; // $7.00 נוסף לפעולת הקנייה הנוספת

    setPositions((prev) =>
      prev.map((p) => {
        if (p.id === buyingMorePosition.id) {
          const existingTranches = p.tranches || [
            {
              id: `tranche-init-${p.id}`,
              shares: currentShares,
              price: currentBuyPrice,
              date: p.purchaseDate || p.buyDate || 'Initial',
              actionFee: currentFee,
              notes: p.notes || 'Initial Lot',
            },
          ];
          const newTranche: PortfolioTranche = {
            id: `tranche-${Date.now()}`,
            shares: addedShares,
            price: addedPrice,
            date: buyMoreDate || new Date().toISOString().split('T')[0],
            actionFee: ACTION_FEE_USD,
            notes: buyMoreNotes.trim() || undefined,
          };
          return {
            ...p,
            shares: Number(totalShares.toFixed(4)),
            buyPrice: Number(newWeightedAvg.toFixed(2)),
            actionFee: newTotalActionFee,
            tranches: [...existingTranches, newTranche],
            notes: buyMoreNotes.trim() ? `${p.notes ? p.notes + ' | ' : ''}${buyMoreNotes.trim()}` : p.notes,
          };
        }
        return p;
      })
    );

    const diff = newWeightedAvg - currentBuyPrice;
    const diffText = diff < 0
      ? `מחיר הקנייה הממוצע הוזל ב-$${Math.abs(diff).toFixed(2)} למניה (-${((Math.abs(diff) / currentBuyPrice) * 100).toFixed(1)}%)`
      : `המחיר הממוצע שוקלל ל-$${newWeightedAvg.toFixed(2)}`;

    showToast(
      isHe
        ? `✅ נרכשו בהצלחה ${addedShares} מניות נוספות של ${buyingMorePosition.ticker} במחיר $${addedPrice.toFixed(2)}! ${diffText} (נוספה עמלת פעולה של $${ACTION_FEE_USD.toFixed(2)}).`
        : `Purchased ${addedShares} shares of ${buyingMorePosition.ticker} at $${addedPrice.toFixed(2)}. New weighted avg cost: $${newWeightedAvg.toFixed(2)} (added $${ACTION_FEE_USD.toFixed(2)} fee).`,
      'success'
    );
    setBuyingMorePosition(null);
  };

  // SELL / REALIZE HANDLERS (מימוש פוזיציה, מכירת מניות ונעילת רווח/הפסד)
  const handleOpenSell = (pos: PortfolioPosition) => {
    setSellingPosition(pos);
    const live = livePrices[pos.ticker.toUpperCase()]?.price || pos.buyPrice;
    setSellShares(pos.shares.toString());
    setSellPrice(live.toFixed(2));
    setSellDate(new Date().toISOString().split('T')[0]);
    setSellNotes('');
  };

  const handleConfirmSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingPosition) return;
    const currentShares = sellingPosition.shares;
    const avgCost = sellingPosition.buyPrice;
    const sharesToSell = Math.min(currentShares, Math.max(0.001, parseFloat(sellShares) || currentShares));
    const salePrice = Math.max(0.01, parseFloat(sellPrice) || 1);

    const grossProceeds = sharesToSell * salePrice;
    const sellActionFee = ACTION_FEE_USD; // $7.00 לפעולת מכירה (מעודכן מהיום)
    const netProceeds = grossProceeds - sellActionFee;

    const currentPosBuyFee = typeof sellingPosition.actionFee === 'number' ? sellingPosition.actionFee : ACTION_FEE_USD;
    const isFullSell = (currentShares - sharesToSell) <= 0.0001;
    const buyFeeForThisSale = isFullSell ? currentPosBuyFee : (currentPosBuyFee * (sharesToSell / currentShares));
    const costBasisWithBuyFee = (sharesToSell * avgCost) + buyFeeForThisSale;

    // Realized Net Profit = Net Cash Proceeds - Cost Basis (including buy and sell action fees!)
    const realizedProfit = netProceeds - costBasisWithBuyFee;
    const realizedProfitPct = costBasisWithBuyFee > 0 ? (realizedProfit / costBasisWithBuyFee) * 100 : 0;

    const newTx: RealizedTransaction = {
      id: `real-${Date.now()}-${sellingPosition.ticker}`,
      ticker: sellingPosition.ticker,
      companyName: sellingPosition.companyName,
      sharesSold: sharesToSell,
      sellPrice: salePrice,
      avgBuyPrice: avgCost,
      actionFee: sellActionFee,
      buyActionFee: Number(buyFeeForThisSale.toFixed(2)),
      grossProceeds: Number(grossProceeds.toFixed(2)),
      netProceeds: Number(netProceeds.toFixed(2)),
      realizedPnL: Number(realizedProfit.toFixed(2)),
      realizedPnLPct: Number(realizedProfitPct.toFixed(2)),
      saleDate: sellDate || new Date().toISOString().split('T')[0],
      notes: sellNotes.trim() || undefined,
      timestamp: Date.now(),
    };

    setRealizedTransactions((prev) => [newTx, ...prev]);

    const remaining = currentShares - sharesToSell;
    if (remaining <= 0.0001) {
      setPositions((prev) => prev.filter((p) => p.id !== sellingPosition.id));
      showToast(
        isHe
          ? `✅ מימוש מלא של ${sellingPosition.ticker}: נמכרו כל ${sharesToSell} המניות ב-$${salePrice.toFixed(2)}. תקבול נטו (בניכוי מחיר פעולה של $${sellActionFee.toFixed(2)}): $${netProceeds.toFixed(2)}. רווח/הפסד ממומש נטו: ${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toFixed(2)}.`
          : `Fully sold ${sharesToSell} shares of ${sellingPosition.ticker}. Net proceeds (after $${sellActionFee.toFixed(2)} fee): $${netProceeds.toFixed(2)}. Realized Net P&L: ${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toFixed(2)}.`,
        realizedProfit >= 0 ? 'success' : 'warning'
      );
    } else {
      const remainingBuyFee = Math.max(0, currentPosBuyFee - buyFeeForThisSale);
      setPositions((prev) =>
        prev.map((p) => {
          if (p.id === sellingPosition.id) {
            return {
              ...p,
              shares: Number(remaining.toFixed(4)),
              actionFee: Number(remainingBuyFee.toFixed(2)),
              notes: sellNotes.trim() ? `${p.notes ? p.notes + ' | ' : ''}מומשו ${sharesToSell} מניות ב-$${salePrice.toFixed(2)}` : p.notes,
            };
          }
          return p;
        })
      );
      showToast(
        isHe
          ? `✅ מימוש חלקי של ${sellingPosition.ticker}: נמכרו ${sharesToSell} מניות ב-$${salePrice.toFixed(2)}. תקבול נטו (בניכוי מחיר פעולה של $${sellActionFee.toFixed(2)}): $${netProceeds.toFixed(2)}. יתרה בתיק: ${remaining.toFixed(2)} מניות. רווח/הפסד ממומש נטו: ${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toFixed(2)}.`
          : `Trimmed ${sharesToSell} shares of ${sellingPosition.ticker}. Net proceeds (after $${sellActionFee.toFixed(2)} fee): $${netProceeds.toFixed(2)}. Realized Net P&L: ${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toFixed(2)}.`,
        realizedProfit >= 0 ? 'success' : 'warning'
      );
    }

    setSellingPosition(null);
  };

  // Quick 1-click add BSX if user does not have it in holdings
  const handleAddBsxQuick = () => {
    const bsxPos: PortfolioPosition = {
      id: `pos-${Date.now()}-BSX`,
      ticker: 'BSX',
      companyName: 'Boston Scientific Corporation',
      shares: 45,
      buyPrice: 86.50,
      actionFee: ACTION_FEE_USD,
      purchaseDate: '2026-06-12',
      notes: 'צנתרי אלקטרופיזיולוגיה PFA (נבדקת השפעת מתקפת הסייבר)',
    };
    setPositions((prev) => [bsxPos, ...prev]);
    if (onRegisterTickers) onRegisterTickers(['BSX']);
    showToast(isHe ? '✅ מניית בוסטון סיינטיפיק (BSX) נוספה לתיק עם אזהרת הסייבר הפעילה!' : 'Added BSX to portfolio with active risk alert!', 'success');
  };

  // Quick 1-click add CVS if user does not have it in holdings
  const handleAddCvsQuick = () => {
    const cvsPos: PortfolioPosition = {
      id: `pos-${Date.now()}-CVS`,
      ticker: 'CVS',
      companyName: 'CVS Health Corporation',
      shares: 60,
      buyPrice: 73.20,
      actionFee: ACTION_FEE_USD,
      purchaseDate: '2026-07-15',
      notes: 'אזהרת WSJ: שחיקת מרווחי Caremark ו-340B עד 2027',
    };
    setPositions((prev) => [cvsPos, ...prev]);
    if (onRegisterTickers) onRegisterTickers(['CVS']);
    showToast(isHe ? '✅ מניית CVS Health נוספה לתיק עם אזהרת WSJ 2027 הפעילה!' : 'Added CVS to portfolio with active WSJ 2027 risk alert!', 'success');
  };

  // Holding Risk & Catalyst Alert evaluator
  const getHoldingAlert = (pos: { ticker: string; companyName?: string; dailyChangePct: number; currentPrice: number; buyPrice: number; matchedStock?: any }) => {
    const ticker = pos.ticker.toUpperCase().trim();
    const company = pos.companyName || pos.matchedStock?.companyName || `${ticker} Corp`;

    // 1. Check API scanned alert
    const apiAlert = portfolioNewsAlerts[ticker];
    if (apiAlert) {
      const isBull = apiAlert.sentiment === 'BULLISH' || apiAlert.movementType === 'IMPENDING_JUMP';
      const isBear = apiAlert.sentiment === 'BEARISH' || apiAlert.movementType === 'SHARP_DROP_WARNING';
      const isCritical = isBear && (apiAlert.catalystSeverity === 'CRITICAL' || pos.dailyChangePct <= -3.0);

      const severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'FORECAST' = isCritical
        ? 'CRITICAL'
        : isBear
        ? 'WARNING'
        : isBull
        ? 'OPPORTUNITY'
        : 'FORECAST';

      const badgeLabel = isCritical
        ? (isHe ? '⚠️ אזהרת ירידה חדה' : '⚠️ Downside Warning')
        : isBear
        ? (isHe ? '⚠️ זהירות ותנודתיות' : '⚠️ Volatility Caution')
        : isBull
        ? (isHe ? '🚀 זרז חיובי לפריצה' : '🚀 Bullish Catalyst')
        : (isHe ? '🔵 שינוי תחזיות ומעקב' : '🔵 Forecast Revision');

      return {
        ticker,
        companyName: company,
        severity,
        title: apiAlert.headline,
        summary: apiAlert.summary,
        badgeLabel,
        actionLabel: apiAlert.recommendation?.actionLabelHe || (isHe ? 'מעקב וניהול פוזיציה' : 'Position Monitoring'),
        openingBellPlan: apiAlert.recommendation?.openingBellGamePlanHe || (isHe ? 'המתנה לפתיחה מסודרת ללא פעולות חפוזות.' : 'Wait for order balance.'),
        impactOnMoat: apiAlert.recommendation?.impactAnalysisHe || (isHe ? 'מעקב מוסדי אחר תוצאות הפעילות.' : 'Institutional thesis tracking.'),
        source: apiAlert.source,
        publishedTime: apiAlert.publishedTime,
      };
    }

    // 2. Pre-market curated news feed
    const pmMatch = INITIAL_PREMARKET_NEWS_FEED.find((n) => n.ticker.toUpperCase() === ticker);
    if (pmMatch) {
      const isBull = pmMatch.sentiment === 'BULLISH' || pmMatch.movementType === 'IMPENDING_JUMP';
      const isBear = pmMatch.sentiment === 'BEARISH' || pmMatch.movementType === 'SHARP_DROP_WARNING';
      const isCritical = isBear && (pmMatch.catalystSeverity === 'CRITICAL' || pos.dailyChangePct <= -3.0);

      const severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'FORECAST' = isCritical
        ? 'CRITICAL'
        : isBear
        ? 'WARNING'
        : isBull
        ? 'OPPORTUNITY'
        : 'FORECAST';

      const badgeLabel = isCritical
        ? (isHe ? '⚠️ אזהרת ירידה חדה' : '⚠️ Downside Warning')
        : isBear
        ? (isHe ? '⚠️ זהירות ותנודתיות' : '⚠️ Volatility Caution')
        : isBull
        ? (isHe ? '🚀 זרז חיובי לפריצה' : '🚀 Bullish Catalyst')
        : (isHe ? '🔵 שינוי תחזיות ומעקב' : '🔵 Forecast Revision');

      return {
        ticker,
        companyName: company,
        severity,
        title: pmMatch.headline,
        summary: pmMatch.summary,
        badgeLabel,
        actionLabel: isHe ? pmMatch.recommendation.actionLabelHe : pmMatch.recommendation.actionLabelEn,
        openingBellPlan: isHe ? pmMatch.recommendation.openingBellGamePlanHe : pmMatch.recommendation.openingBellGamePlanEn,
        impactOnMoat: isHe ? pmMatch.recommendation.impactAnalysisHe : pmMatch.recommendation.impactAnalysisEn,
        source: pmMatch.source,
        publishedTime: pmMatch.publishedTime,
      };
    }

    // 3. Special Case: Boston Scientific (BSX)
    if (ticker === 'BSX') {
      return {
        ticker: 'BSX',
        companyName: company,
        severity: 'CRITICAL' as const,
        title: isHe
          ? '⚠️ אזהרת רווח ושיבוש תפעולי: מתקפת סייבר גלובלית משביתה קווי ייצור ומשלוחי הזמנות של בוסטון סיינטיפיק'
          : '⚠️ Profit & Operations Warning: Global Cyberattack Disrupts Manufacturing & Shipments',
        summary: isHe
          ? 'בוסטון סיינטיפיק דיווחה על פגיעת סייבר חמורה במערכות ה-IT הגלובליות. החברה הודיעה כי סביר להניח שלא תעמוד בתחזיות המכירות והרווח למניה (EPS) לרבעון 3 ולשנת 2026, לצד ריקולים למוליכי צנתור Infinion CX.'
          : 'Boston Scientific reports severe cyber disruption affecting medical device production with expected EPS guidance cut.',
        badgeLabel: isHe ? '⚠️ סייבר ושיבוש תפעולי' : '⚠️ Cyber Disruption',
        actionLabel: isHe ? '⚠️ זהירות - שקול מימוש חלקי להגנה' : 'Caution - Consider Trimming',
        openingBellPlan: isHe
          ? 'להמתין מחוץ למניה או לממש חלק מהפוזיציה כדי להגן על התיק עד לכימות מלא של הפגיעה הכספית והתייצבות המסחר.'
          : 'Avoid adding new risk; trim partial shares to hedge against guidance downgrade.',
        impactOnMoat: isHe
          ? 'פגיעה תפעולית קצרת טווח עם סיכון לאובדן נתח שוק מול Medtronic ו-Abbott בתחום האלקטרופיזיולוגיה (PFA).'
          : 'Near-term disruption risking share loss to competitors in electrophysiology catheters.',
        source: 'Bloomberg / SEC 8-K',
        publishedTime: '08:15 AM EST',
      };
    }

    // 4. Special Case: UnitedHealth Group (UNH)
    if (ticker === 'UNH') {
      return {
        ticker: 'UNH',
        companyName: company,
        severity: 'WARNING' as const,
        title: isHe
          ? '📊 עדכון שיעור תביעות רפואיות (MLR) והעלאת פרמיות מסחריות ב-6-8%'
          : '📊 Medical Loss Ratio (MLR) Surge & Commercial Premium Price Adjustments',
        summary: isHe
          ? 'יונייטד-הלת מתמודדת עם עליית שיעור התביעות הרפואיות (MLR ל-85.4%). החברה מעלה פרמיות בביטוחים מסחריים כדי להגן על שולי הרווח. החפיר של Optum איתן.'
          : 'UnitedHealth raises commercial premiums 6-8% to offset higher elective surgical care claims.',
        badgeLabel: isHe ? '⚠️ בדיקת תמחור ו-MLR' : '⚠️ MLR & Pricing Check',
        actionLabel: isHe ? 'צבירה מבוקרת בירידות (DCA)' : 'Accumulate on Dips (DCA)',
        openingBellPlan: isHe
          ? 'איסוף מנות הדרגתי סביב רמות תמיכה. החברה בעלת כוח תמחור יוצא דופן המאפשר גלגול עלויות.'
          : 'Stage buying orders near support; strong moat allows passing higher medical costs.',
        impactOnMoat: isHe
          ? 'שילוב Optum וביטוח מעניק חפיר עמוק, אך שנת בחירות עשויה להגביר לחץ פוליטי על תמחור שירותי בריאות.'
          : 'Optum integration provides durable moat, though healthcare reform debates create headline volatility.',
        source: 'Healthcare Intelligence Digest',
        publishedTime: '07:45 AM EST',
      };
    }

    // 5. Special Case: CVS Health (CVS) - WSJ 2027 Early Warning
    if (ticker === 'CVS') {
      return {
        ticker: 'CVS',
        companyName: company,
        severity: 'CRITICAL' as const,
        title: isHe
          ? '⚠️ וול סטריט ג\'ורנל (WSJ): אזהרות הנהלה מוקדמות ל-2027 ושחיקת מרווחי Caremark ו-340B'
          : '⚠️ Wall Street Journal (WSJ): Early 2027 Headwinds & Caremark/340B Margin Erosion',
        summary: isHe
          ? 'דיווח ב-WSJ חשף כי מניית CVS צונחת בעקבות אזהרות הנהלה מוקדמות ל-2027: חטיבת Caremark צפויה לחוות ירידה במבוטחים עקב תמחור חוזים ונשירת לקוחות, לצד לחצי רווחיות מתוכנית 340B. תחזית רווח מוקדמת של "לפחות $8.44" נתפסה בוול סטריט כתקרה שמרנית.'
          : 'WSJ reports CVS shares under severe selling pressure following early 2027 headwinds in Caremark PBM client renewals and 340B drug margin pressures.',
        badgeLabel: isHe ? '⚠️ אזהרת WSJ 2027' : '⚠️ WSJ 2027 Warning',
        actionLabel: isHe ? '⚠️ זהירות - שקול מימוש/המתנה להגנה' : 'Caution - Wait or Trim to Protect Capital',
        openingBellPlan: isHe
          ? 'להמתין מחוץ למניה או לממש חלק מהפוזיציה להגנה על ההון; אין למהר לקנות עד לספיגת עדכוני התחזיות השליליים של האנליסטים בוול סטריט.'
          : 'Avoid aggressive dip-buying at open; wait for analyst consensus EPS revisions to settle.',
        impactOnMoat: isHe
          ? 'שחיקת מרווחי Caremark והידוק רגולטורי על PBMs בוחנים את עוצמת החפיר, אף שתשואת הדיבידנד כ-4.5% ומכפיל הרווח ההיסטורי נמוך (8.8x).'
          : 'Caremark margin headwinds and regulatory scrutiny test moat resilience despite ~4.5% dividend yield.',
        source: 'The Wall Street Journal (WSJ)',
        publishedTime: '08:10 AM EST',
      };
    }

    // 6. Live sharp drop alert (<= -1.8%)
    if (pos.dailyChangePct <= -1.8) {
      return {
        ticker,
        companyName: company,
        severity: 'CRITICAL' as const,
        title: isHe
          ? `⚠️ ירידה יומית חדה (${pos.dailyChangePct.toFixed(2)}%) במסחר`
          : `⚠️ Sharp Downside Drop (${pos.dailyChangePct.toFixed(2)}%)`,
        summary: isHe
          ? `המניה חווה לחצי מכירה חריגים במסחר הנוכחי. מומלץ לבדוק האם מדובר בשינוי פונדמנטלי ולבחון מימוש להפחתת חשיפה או חיזוק במחיר נמוך.`
          : `Significant selling pressure detected. Review your risk allocation or stage entry for lower average cost.`,
        badgeLabel: isHe ? `⚠️ ירידה ${pos.dailyChangePct.toFixed(1)}%` : `⚠️ Down ${pos.dailyChangePct.toFixed(1)}%`,
        actionLabel: isHe ? 'בחינת מימוש או חיזוק (DCA)' : 'Review Trim or DCA',
        openingBellPlan: isHe
          ? 'הימנעו מרכישה חפוזה; תנו למחזורי המכירה להיחלש וקבעו סטופ-לוס מנטלי.'
          : 'Do not rush to catch a falling knife; wait for volume equilibrium.',
        impactOnMoat: isHe ? 'יש לוודא האם הירידה פוגעת בתזת ההשקעה ל-5 שנים.' : 'Check if 5-year compounding thesis is intact.',
        source: 'Live Market Watchdog',
        publishedTime: 'Live Session',
      };
    }

    // 6. Live surge opportunity (>= 2.8%)
    if (pos.dailyChangePct >= 2.8) {
      return {
        ticker,
        companyName: company,
        severity: 'OPPORTUNITY' as const,
        title: isHe
          ? `🚀 זינוק יומי חזק (+${pos.dailyChangePct.toFixed(2)}%)`
          : `🚀 Strong Intraday Surge (+${pos.dailyChangePct.toFixed(2)}%)`,
        summary: isHe
          ? `המניה רושמת עליות חדות בליווי ביקושים ערים. מומלץ לבחון האם זהו מועד אידיאלי למימוש רווחים חלקי (Take Profit) או הותרת הפוזיציה לריצה.`
          : `High volume rally. Consider whether partial profit-taking is attractive.`,
        badgeLabel: isHe ? `🚀 זינוק +${pos.dailyChangePct.toFixed(1)}%` : `🚀 Surge +${pos.dailyChangePct.toFixed(1)}%`,
        actionLabel: isHe ? 'שקול מימוש רווחים חלקי' : 'Consider Taking Profits',
        openingBellPlan: isHe
          ? 'ניתן לממש 25-50% מהרווחים לנעילת תשואה, ולהשאיר את יתרת המניות להמשך מומנטום.'
          : 'Lock in 25-50% profits while letting the core position compound.',
        impactOnMoat: isHe ? 'אישור של עוצמת המומנטום והביקושים המוסדיים.' : 'Institutional inflow confirmation.',
        source: 'Live Market Watchdog',
        publishedTime: 'Live Session',
      };
    }

    return null;
  };

  // Calculations for all positions using dynamic getResearchStock and real live prices
  const calculatedPositions = useMemo(() => {
    return positions.map((pos) => {
      const tickerClean = pos.ticker.toUpperCase().trim();
      const altDot = tickerClean.replace(/-/g, '.');
      const altHyphen = tickerClean.replace(/\./g, '-');
      const matchedStock = getResearchStock(tickerClean);
      const localized = localizeStock(matchedStock, currentLang);
      const parsedStockPrice = parseFloat(matchedStock.currentPrice.replace(/[^0-9.]/g, ''));
      const fallbackPrice = !isNaN(parsedStockPrice) && parsedStockPrice > 0 ? parsedStockPrice : 100;
      const liveInfo = livePrices[tickerClean] || livePrices[altDot] || livePrices[altHyphen];

      const currentPrice = liveInfo && typeof liveInfo.price === 'number' && liveInfo.price > 0
        ? liveInfo.price
        : fallbackPrice;

      const dailyChangePct = liveInfo && typeof liveInfo.changePercent === 'number'
        ? liveInfo.changePercent
        : 0;

      const dailyChangeAmount = liveInfo && typeof liveInfo.changeAmount === 'number'
        ? liveInfo.changeAmount
        : Number((currentPrice * (dailyChangePct / 100)).toFixed(2));

      const actionFee = typeof pos.actionFee === 'number' && !isNaN(pos.actionFee) ? pos.actionFee : ACTION_FEE_USD;
      const grossCost = pos.shares * pos.buyPrice;
      const totalCost = grossCost + actionFee; // Total cost basis includes $7.50 flat fee per action
      const currentValue = pos.shares * currentPrice;
      const totalGain = currentValue - totalCost; // Net P&L factoring in the action fee
      const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
      const dailyGain = pos.shares * dailyChangeAmount;

      // Dividend metrics
      const rawDivYield = matchedStock.perShareValueCreation?.dividendYield || matchedStock.perShare?.dividendYield;
      const divYieldPct = rawDivYield
        ? (parseFloat(rawDivYield.replace(/[^0-9.]/g, '')) || 0)
        : (matchedStock.ticker === 'MSFT' ? 0.7 : matchedStock.ticker === 'AAPL' ? 0.5 : matchedStock.ticker === 'UNH' ? 1.6 : matchedStock.ticker === 'JNJ' ? 3.1 : matchedStock.ticker === 'PG' ? 2.4 : matchedStock.ticker === 'KO' ? 3.0 : 1.2);

      const annualDividends = Number(((currentValue * divYieldPct) / 100).toFixed(2));

      return {
        ...pos,
        actionFee,
        grossCost,
        matchedStock,
        localized,
        currentPrice,
        dailyChangePct,
        dailyChangeAmount,
        totalCost,
        currentValue,
        totalGain,
        totalGainPct,
        dailyGain,
        divYieldPct,
        annualDividends,
        qualityScore: matchedStock.investmentScore,
        liveSource: liveInfo?.source || 'live_market',
        timestamp: liveInfo?.timestamp,
      };
    });
  }, [positions, livePrices, currentLang]);

  // Available Years for Realized Trades Filter
  const availableRealizedYears = useMemo(() => {
    const years = new Set<string>();
    realizedTransactions.forEach((tx) => {
      const y = tx.saleDate ? tx.saleDate.slice(0, 4) : '';
      if (y && /^\d{4}$/.test(y)) years.add(y);
    });
    years.add('2026');
    return Array.from(years).sort().reverse();
  }, [realizedTransactions]);

  // Filtered Realized Trades by Selected Year
  const filteredRealizedTrades = useMemo(() => {
    if (realizedYearFilter === 'all') return realizedTransactions;
    return realizedTransactions.filter((tx) => tx.saleDate && tx.saleDate.startsWith(realizedYearFilter));
  }, [realizedTransactions, realizedYearFilter]);

  // Realized Summary Totals & Key Performance Indicators
  const realizedSummary = useMemo(() => {
    let totalGain = 0;
    let totalProceeds = 0;
    let totalCostBasis = 0;
    let totalActionFees = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    filteredRealizedTrades.forEach((t) => {
      const fee = typeof t.actionFee === 'number' ? t.actionFee : ACTION_FEE_USD;
      const buyFee = typeof t.buyActionFee === 'number' ? t.buyActionFee : ACTION_FEE_USD;
      totalActionFees += fee;
      totalGain += t.realizedPnL;
      totalProceeds += t.netProceeds ?? (t.sharesSold * t.sellPrice - fee);
      totalCostBasis += (t.sharesSold * t.avgBuyPrice) + buyFee;
      if (t.realizedPnL >= 0) winningTrades++;
      else losingTrades++;
    });

    const netReturnPct = totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0;
    const winRate = filteredRealizedTrades.length > 0 ? (winningTrades / filteredRealizedTrades.length) * 100 : 0;
    const estimatedTax = totalGain > 0 ? totalGain * 0.25 : 0;

    return {
      totalGain,
      totalProceeds,
      totalCostBasis,
      totalActionFees,
      netReturnPct,
      winningTrades,
      losingTrades,
      winRate,
      estimatedTax,
      tradesCount: filteredRealizedTrades.length,
      allTimeTradesCount: realizedTransactions.length,
    };
  }, [filteredRealizedTrades, realizedTransactions]);

  // Realized CSV Export Handler
  const handleExportRealizedCsv = () => {
    if (filteredRealizedTrades.length === 0) {
      showToast(isHe ? 'אין עסקאות מימוש להורדה בטווח זה' : 'No realized trades to export', 'warning');
      return;
    }

    const headers = [
      'תאריך מימוש (Date)',
      'סימול (Ticker)',
      'שם חברה (Company)',
      'כמות מניות (Shares)',
      'מחיר קנייה ממוצע ($ Buy Price)',
      'מחיר מימוש ($ Sell Price)',
      'מחיר פעולה ($ Action Fee)',
      'סך עלות השקעה ($ Total Cost)',
      'סך תמורה במזומן ($ Total Proceeds)',
      'רווח/הפסד ממומש ($ Realized PnL)',
      'תשואה באחוזים (% Return)',
      'הערות (Notes)'
    ];

    const rows = filteredRealizedTrades.map((tx) => {
      const fee = tx.actionFee ?? ACTION_FEE_USD;
      const cost = (tx.sharesSold * tx.avgBuyPrice) + (tx.buyActionFee ?? ACTION_FEE_USD);
      const proceeds = tx.netProceeds ?? (tx.sharesSold * tx.sellPrice - fee);
      return [
        tx.saleDate,
        tx.ticker,
        `"${(tx.companyName || '').replace(/"/g, '""')}"`,
        tx.sharesSold,
        tx.avgBuyPrice.toFixed(2),
        tx.sellPrice.toFixed(2),
        fee.toFixed(2),
        cost.toFixed(2),
        proceeds.toFixed(2),
        tx.realizedPnL.toFixed(2),
        `${tx.realizedPnLPct.toFixed(2)}%`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `realized_trades_${realizedYearFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isHe ? '✅ דוח המימושים השנתי יוצא בהצלחה לקובץ CSV לאקסל!' : 'Realized trades exported to CSV!', 'success');
  };

  const handleDeleteRealizedTx = (id: string) => {
    if (window.confirm(isHe ? 'האם למחוק שורת מימוש זו מטבלת המימושים?' : 'Delete this realized transaction record?')) {
      setRealizedTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast(isHe ? 'שורת המימוש נמחקה בהצלחה.' : 'Realized record deleted.', 'info');
    }
  };

  // Filtered and sorted positions for display table
  const displayedPositions = useMemo(() => {
    let result = calculatedPositions;

    // Filter Tab (all, warnings, profit, loss)
    if (filterTab === 'warnings') {
      result = result.filter((p) => Boolean(getHoldingAlert(p)));
    } else if (filterTab === 'profit') {
      result = result.filter((p) => p.totalGain >= 0);
    } else if (filterTab === 'loss') {
      result = result.filter((p) => p.totalGain < 0);
    }

    if (tableFilter.trim()) {
      const q = tableFilter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.ticker.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          (p.matchedStock?.sector && p.matchedStock.sector.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'default') return result;

    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dailyChangePct') {
        comparison = a.dailyChangePct - b.dailyChangePct;
        if (comparison === 0) {
          comparison = a.dailyGain - b.dailyGain;
        }
      } else if (sortBy === 'dailyGain') {
        comparison = a.dailyGain - b.dailyGain;
      } else if (sortBy === 'currentValue') {
        comparison = a.currentValue - b.currentValue;
      } else if (sortBy === 'totalGain') {
        comparison = a.totalGain - b.totalGain;
      } else if (sortBy === 'totalGainPct') {
        comparison = a.totalGainPct - b.totalGainPct;
      } else if (sortBy === 'currentPrice') {
        comparison = a.currentPrice - b.currentPrice;
      } else if (sortBy === 'buyPrice') {
        comparison = a.buyPrice - b.buyPrice;
      } else if (sortBy === 'actionFee') {
        comparison = (a.actionFee ?? ACTION_FEE_USD) - (b.actionFee ?? ACTION_FEE_USD);
      } else if (sortBy === 'shares') {
        comparison = a.shares - b.shares;
      } else if (sortBy === 'weight') {
        comparison = a.currentValue - b.currentValue;
      } else if (sortBy === 'ticker') {
        comparison = a.ticker.localeCompare(b.ticker);
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [calculatedPositions, tableFilter, filterTab, sortBy, sortDirection, portfolioNewsAlerts]);

  // Portfolio Totals
  const portfolioSummary = useMemo(() => {
    let totalVal = 0;
    let totalInvested = 0;
    let totalGrossInvested = 0;
    let totalActionFees = 0;
    let totalDailyProfit = 0;
    let weightedQualitySum = 0;
    let totalAnnualDividends = 0;

    calculatedPositions.forEach((pos) => {
      totalVal += pos.currentValue;
      totalInvested += pos.totalCost;
      totalGrossInvested += pos.grossCost;
      totalActionFees += pos.actionFee;
      totalDailyProfit += pos.dailyGain;
      weightedQualitySum += pos.qualityScore * pos.currentValue;
      totalAnnualDividends += pos.annualDividends;
    });

    const netProfit = totalVal - totalInvested;
    const netProfitPct = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;
    const dailyProfitPct = totalVal > 0 ? (totalDailyProfit / totalVal) * 100 : 0;
    const weightedAvgQuality = totalVal > 0 ? Math.round(weightedQualitySum / totalVal) : 88;
    const portfolioDivYield = totalVal > 0 ? (totalAnnualDividends / totalVal) * 100 : 0;

    return {
      totalVal,
      totalInvested,
      totalGrossInvested,
      totalActionFees,
      netProfit,
      netProfitPct,
      totalDailyProfit,
      dailyProfitPct,
      weightedAvgQuality,
      totalAnnualDividends,
      portfolioDivYield,
    };
  }, [calculatedPositions]);

  // Sector Allocation Breakdown
  const sectorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    calculatedPositions.forEach((pos) => {
      const sec = pos.matchedStock?.sector || 'Other';
      map[sec] = (map[sec] || 0) + pos.currentValue;
    });

    return Object.entries(map).map(([sector, val]) => ({
      sector,
      value: val,
      percentage: portfolioSummary.totalVal > 0 ? (val / portfolioSummary.totalVal) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  }, [calculatedPositions, portfolioSummary.totalVal]);

  // Holdings formatted for the interactive visual chart suite
  const chartHoldings: PortfolioChartHolding[] = useMemo(() => {
    return calculatedPositions.map((pos) => ({
      ticker: pos.ticker,
      companyName: pos.companyName || pos.matchedStock?.companyName || `${pos.ticker} Corp`,
      shares: pos.shares,
      buyPrice: pos.buyPrice,
      currentPrice: pos.currentPrice,
      currentValue: pos.currentValue,
      totalCost: pos.totalCost,
      totalGain: pos.totalGain,
      totalGainPct: pos.totalGainPct,
      weightPct: pos.weight,
      sector: pos.matchedStock?.sector || 'Technology',
      qualityScore: pos.qualityScore || 85,
      purchaseDate: pos.purchaseDate || pos.buyDate,
    }));
  }, [calculatedPositions]);

  const formattedSyncTime = useMemo(() => {
    const d = new Date(lastQuotesSyncTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [lastQuotesSyncTime]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                MY PERSONAL WEALTH
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isHe ? 'ציטוטים חיים מהבורסה בארה"ב' : 'Real-Time US Exchange Quotes'}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {isHe ? `נשמר אוטומטית במכשיר (${positions.length} פוזיציות)` : `Auto-saved in browser (${positions.length} holdings)`}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>{isHe ? 'ניהול תיק השקעות אישי ומעקב רווח/הפסד חי' : 'Personal Portfolio Live P&L Tracker'}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'מעקב גמיש ומדויק: הוסף כל מניה שתרצה (מהשוק או טיקר חופשי), נהל מחירי קנייה, כמויות ורווח יומי בלייב.'
                : 'Flexible portfolio tracking: Add any stock from the market or any custom ticker with live P&L and cost basis.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => {
                const event = new CustomEvent('navigate-tab', { detail: 'premarket' });
                window.dispatchEvent(event);
              }}
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/50 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
              title={isHe ? 'צפה ב-10 המניות שעולות הכי הרבה בטרום-מסחר: מי עולה בגלל חדשות ומי סתם עולה' : 'View Top 10 Pre-Market Gainers Radar'}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{isHe ? '🔥 10 העולות בטרום-מסחר' : 'Top 10 Pre-Market'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE
              </span>
            </button>

            {onRefreshQuotes && (
              <button
                onClick={onRefreshQuotes}
                disabled={isSyncingQuotes}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                title={isHe ? 'רענן שערי מניות עכשיו' : 'Refresh live prices now'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingQuotes ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">
                  {isSyncingQuotes ? (isHe ? 'מרענן שערים...' : 'Syncing...') : (isHe ? 'רענן שערים' : 'Refresh Quotes')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({formattedSyncTime})</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs font-mono transition flex items-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isHe ? 'הוסף מניה לתיק (כל מניה)' : 'Add Stock (Any Ticker)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Holdings Risk & News Alert Center */}
      {(() => {
        const alertedHoldings = calculatedPositions
          .map((p) => ({ pos: p, alert: getHoldingAlert(p) }))
          .filter((item): item is { pos: typeof item.pos; alert: NonNullable<typeof item.alert> } => Boolean(item.alert));

        const hasBsxInPortfolio = calculatedPositions.some((p) => p.ticker.toUpperCase() === 'BSX');
        const hasCvsInPortfolio = calculatedPositions.some((p) => p.ticker.toUpperCase() === 'CVS');

        return (
          <div className="space-y-3">
            {alertedHoldings.length > 0 ? (
              <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/60 border-2 border-rose-500/70 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-rose-900/40">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-extrabold text-rose-200">
                          {isHe
                            ? '⚠️ מרכז אזהרות סיכון וחדשות קריטיות למניות בתיק שלך'
                            : '⚠️ Active Risk & News Alerts for Your Portfolio Holdings'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-200 text-[10px] font-mono font-bold border border-rose-500/40">
                          {alertedHoldings.length} {isHe ? 'מניות באזהרה פעילה' : 'Holdings with active alerts'}
                        </span>
                      </div>
                      <p className="text-xs text-rose-300/90 mt-0.5">
                        {isHe
                          ? 'זוהו קטליזטורים, מתקפת סייבר בבוסטון סיינטיפיק (BSX), לחצי MLR או תנודות חריגות. באפשרותך לממש (למכור) מניות להגנה או לקנות שוב במחיר שונה ולשקלל מחיר ממוצע.'
                          : 'Critical events, cyberattack alerts (BSX), or sharp moves detected. You can realize/sell shares to protect capital or Buy More at a different price.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => {
                        const event = new CustomEvent('navigate-tab', { detail: 'premarket' });
                        window.dispatchEvent(event);
                      }}
                      className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isHe ? 'קרא בחדשות טרום-מסחר' : 'View Premarket Feed'}</span>
                    </button>
                  </div>
                </div>

                {/* Individual Alert Cards for each holding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alertedHoldings.map(({ pos, alert }) => {
                    const isCritical = alert.severity === 'CRITICAL';
                    return (
                      <div
                        key={pos.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCritical
                            ? 'bg-rose-950/40 border-rose-500/50 hover:border-rose-400'
                            : 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div
                            onClick={() => handleStockClick(pos.matchedStock)}
                            className="flex items-center gap-2 cursor-pointer group/holding"
                            title={isHe ? `לחץ לפתיחת מידע מלא והערכת שווי עבור ${pos.ticker}` : `Click to open details & valuations for ${pos.ticker}`}
                          >
                            <span className="font-extrabold text-white group-hover/holding:text-cyan-300 text-sm bg-slate-900 group-hover/holding:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono transition flex items-center gap-1">
                              <span>{pos.ticker}</span>
                              <ExternalLink className="w-3 h-3 text-cyan-400 opacity-60 group-hover/holding:opacity-100" />
                            </span>
                            <span className="text-xs text-slate-200 group-hover/holding:text-white font-semibold truncate max-w-[150px]">
                              {pos.companyName}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              alert.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : alert.severity === 'WARNING'
                                ? 'bg-amber-600/90 text-slate-950'
                                : alert.severity === 'OPPORTUNITY'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-cyan-600 text-white'
                            }`}
                          >
                            {alert.badgeLabel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 line-clamp-2 mb-3 leading-relaxed font-sans">
                          {alert.title}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={() => setSelectedAlertHolding(alert)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Info className="w-3 h-3" />
                            <span>{isHe ? 'צפה בהסבר המלא' : 'View full plan'}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenBuyMore(pos)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              title={isHe ? 'קנה מניות נוספות במחיר שונה ושקלל מחיר ממוצע' : 'Buy more at different price'}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isHe ? 'קנה שוב' : 'Buy More'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenSell(pos)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              title={isHe ? 'מימוש ומכירת מניות מהפוזיציה' : 'Sell / Realize position'}
                            >
                              <Coins className="w-3 h-3" />
                              <span>{isHe ? 'מימוש' : 'Sell'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    {isHe
                      ? 'כל מניות התיק נסחרות כרגע ביציבות ללא אזהרות פונדמנטליות חריגות.'
                      : 'All portfolio holdings are trading stably with no acute disruptions.'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!hasCvsInPortfolio && (
                    <button
                      onClick={handleAddCvsQuick}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isHe ? '+ הוסף את CVS Health (אזהרת WSJ 2027)' : '+ Add CVS (WSJ 2027 Alert)'}</span>
                    </button>
                  )}
                  {!hasBsxInPortfolio && (
                    <button
                      onClick={handleAddBsxQuick}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isHe ? '+ הוסף את בוסטון סיינטיפיק (BSX)' : '+ Add BSX to portfolio'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total Portfolio Value */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-1">
          <div className="text-xs font-mono text-slate-400">{isHe ? 'שווי תיק נוכחי' : 'Total Portfolio Value'}</div>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${portfolioSummary.totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between flex-wrap">
            <span>{isHe ? 'עלות השקעה: ' : 'Invested: '}${portfolioSummary.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-amber-400 font-sans" title={isHe ? 'סך מחיר עמלות פעולה שהתווספו לקניות ($7.00 לפעולה מעודכן, $7.50 בעבר)' : 'Total action fees ($7.00 per trade, historical at $7.50)'}>
              ({isHe ? 'עמלות: ' : 'Fees: '}${portfolioSummary.totalActionFees.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Total Unrealized Gain / Loss */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-1">
          <div className="text-xs font-mono text-slate-400">{isHe ? 'רווח / הפסד לא ממומש' : 'Unrealized P&L'}</div>
          <div
            className={`text-2xl font-extrabold font-mono flex items-center gap-1.5 ${
              portfolioSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {portfolioSummary.netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {portfolioSummary.netProfit >= 0 ? '+' : '-'}$
              {Math.abs(portfolioSummary.netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`text-[11px] font-mono font-bold ${portfolioSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {portfolioSummary.netProfitPct >= 0 ? '+' : ''}{portfolioSummary.netProfitPct.toFixed(2)}%
          </div>
        </div>

        {/* Realized Gain / Loss (רווח ממומש) */}
        <div
          onClick={() => {
            setPortfolioViewTab('realized');
            setTimeout(() => {
              const el = document.getElementById('annual-realized-table-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }}
          className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/40 hover:border-indigo-400 transition cursor-pointer shadow group space-y-1"
          title={isHe ? 'לחץ לצפייה בטבלת המימושים השנתית' : 'Click to view Annual Realized Trades Table'}
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'רווח ממומש מצטבר' : 'Realized P&L'}</span>
            <History className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-45 transition-transform" />
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              realizedSummary.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {realizedSummary.totalGain >= 0 ? '+' : '-'}$
            {Math.abs(realizedSummary.totalGain).toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-indigo-300">
            <span>{realizedSummary.tradesCount} {isHe ? 'עסקאות מימוש' : 'realized sales'}</span>
            <span className="text-[10px] text-cyan-400 underline">{isHe ? 'צפה בטבלה ↵' : 'View table ↵'}</span>
          </div>
        </div>

        {/* Daily Change */}
        <div
          onClick={() => handleToggleSort('dailyChangePct')}
          className={`p-4 rounded-xl transition-all cursor-pointer select-none group relative overflow-hidden ${
            sortBy === 'dailyChangePct'
              ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-2 border-cyan-500/70 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/30'
              : 'bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 shadow'
          }`}
          title={isHe
            ? (sortBy === 'dailyChangePct'
                ? (sortDirection === 'desc' ? 'ממוין מהגבוה לנמוך (לחץ להפיכה מהנמוך לגבוה)' : 'ממוין מהנמוך לגבוה (לחץ להפיכה מהגבוה לנמוך)')
                : 'לחץ למיון מניות התיק לפי שינוי יומי (מהגבוה לנמוך / מהנמוך לגבוה)')
            : 'Click to sort portfolio holdings by daily change'
          }
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span>{isHe ? 'שינוי יומי (בלייב)' : "Today's Change"}</span>
            </div>
            {sortBy === 'dailyChangePct' ? (
              sortDirection === 'desc' ? (
                <ArrowDown className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              ) : (
                <ArrowUp className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
              )
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition shrink-0" />
            )}
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              portfolioSummary.totalDailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {portfolioSummary.totalDailyProfit >= 0 ? '+' : '-'}$
            {Math.abs(portfolioSummary.totalDailyProfit).toFixed(2)}
          </div>
          <div className="flex items-center justify-between">
            <div className={`text-[11px] font-mono font-bold ${portfolioSummary.totalDailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {portfolioSummary.dailyProfitPct >= 0 ? '+' : ''}{portfolioSummary.dailyProfitPct.toFixed(2)}%
            </div>
            <span className="text-[10px] font-sans text-cyan-400/90 group-hover:text-cyan-300 transition">
              {sortBy === 'dailyChangePct' ? (isHe ? 'החלף ⟳' : 'Reverse ⟳') : (isHe ? 'מיין ↵' : 'Sort ↵')}
            </span>
          </div>
        </div>

        {/* Dividend Income */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-1">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>{isHe ? 'דיבידנד שנתי משוער' : 'Est. Dividends'}</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300">
            ${portfolioSummary.totalAnnualDividends.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono font-semibold">
            {isHe ? `תשואה ממוצעת: ${portfolioSummary.portfolioDivYield.toFixed(2)}%` : `Yield: ${portfolioSummary.portfolioDivYield.toFixed(2)}%`}
          </div>
        </div>

        {/* Weighted Quality Score */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-1">
          <div className="text-xs font-mono text-slate-400">{isHe ? 'ציון איכות משוקלל' : 'Quality Score'}</div>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {portfolioSummary.weightedAvgQuality} <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-semibold">
            {isHe ? 'חפיר מוסדי מבוקר' : 'Fortress Quality'}
          </div>
        </div>
      </div>

      {/* Comprehensive Visual Portfolio Performance & Allocation Chart Suite */}
      {calculatedPositions.length > 0 && (
        <PortfolioPerformanceChart
          holdings={chartHoldings}
          totalValue={portfolioSummary.totalVal}
          totalCost={portfolioSummary.totalInvested}
          totalGain={portfolioSummary.netProfit}
          totalGainPct={portfolioSummary.netProfitPct}
          dailyGain={portfolioSummary.totalDailyProfit}
          dailyGainPct={portfolioSummary.dailyProfitPct}
          currentLang={currentLang}
          onSelectStock={(ticker) => onOpenDeepDive(getResearchStock(ticker))}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          PRIMARY PORTFOLIO VIEW SWITCHER (פוזיציות פתוחות / טבלת מימושים שנתית)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPortfolioViewTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-2 ${
              portfolioViewTab === 'active'
                ? 'bg-emerald-600 text-slate-950 shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isHe ? 'פוזיציות פתוחות בתיק' : 'Active Holdings'}</span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${portfolioViewTab === 'active' ? 'bg-emerald-950 text-emerald-200 border border-emerald-700/50' : 'bg-slate-800 text-slate-400'}`}>
              {calculatedPositions.length}
            </span>
          </button>

          <button
            onClick={() => setPortfolioViewTab('realized')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-2 ${
              portfolioViewTab === 'realized'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isHe ? 'טבלת מימושים שנתית (רווחי הון)' : 'Annual Realized Trades'}</span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${portfolioViewTab === 'realized' ? 'bg-indigo-950 text-indigo-200 border border-indigo-700/50' : 'bg-slate-800 text-slate-400'}`}>
              {filteredRealizedTrades.length}
            </span>
          </button>

          <button
            onClick={() => setPortfolioViewTab('both')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition cursor-pointer flex items-center gap-2 ${
              portfolioViewTab === 'both'
                ? 'bg-cyan-600 text-slate-950 shadow-md'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isHe ? 'הצג את שתיהן יחד (מבט מלא)' : 'Show Both Tables'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono px-2 hidden md:flex items-center gap-2">
          {portfolioViewTab === 'active' && (
            <span className="text-emerald-400/90 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isHe ? 'מציג פוזיציות פעילות בלבד' : 'Active holdings only'}
            </span>
          )}
          {portfolioViewTab === 'realized' && (
            <span className="text-indigo-400/90 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              {isHe ? 'מציג טבלת עסקאות מימוש סגורות' : 'Closed realized trades only'}
            </span>
          )}
          {portfolioViewTab === 'both' && (
            <span className="text-cyan-400/90 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {isHe ? 'מבט מלא: פוזיציות פעילות + מימושים' : 'Unified full portfolio view'}
            </span>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE DCA & BUY MORE GUIDE BANNER (הגדלת פוזיציה במחיר שונה)
      ───────────────────────────────────────────────────────────── */}
      {(portfolioViewTab === 'active' || portfolioViewTab === 'both') && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-500/30 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{isHe ? 'איך לקנות עוד מניות ולהגדיל פוזיציה במחיר שונה? (DCA ומחיר ממוצע)' : 'How to Buy More Shares at a Different Price (DCA & Weighted Avg)'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-mono border border-emerald-700/50">
                    {isHe ? 'שקלול אוטומטי' : 'Auto Weighted'}
                  </span>
                </h4>
                <p className="text-xs text-slate-300">
                  {isHe
                    ? 'המערכת משקללת אוטומטית את מחיר הקנייה הממוצע (Weighted Average Cost) בכל קנייה נוספת.'
                    : 'The platform automatically recalculates the weighted average cost basis whenever you buy more.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDcaGuideBanner(!showDcaGuideBanner)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700"
            >
              <span>{showDcaGuideBanner ? (isHe ? 'הסתר הסבר' : 'Hide details') : (isHe ? 'הצג נוסחה והסבר' : 'Show formula')}</span>
              {showDcaGuideBanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showDcaGuideBanner && (
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{isHe ? 'איך לבצע זאת בתיק בפועל:' : 'How to execute in your portfolio:'}</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 leading-relaxed font-sans text-[11px]">
                  <li>
                    <strong>דרך 1 (מומלץ):</strong> לחץ על כפתור <span className="text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/50">+ הגדל פוזיציה</span> בשורת המניה שברצונך לחזק.
                  </li>
                  <li>
                    <strong>דרך 2:</strong> לחץ על <span className="text-emerald-300 font-bold">+ הוסף מניה</span> ובחר מניה שכבר קיימת בתיק — המערכת תזהה אותה ותשקלל אותה אוטומטית.
                  </li>
                  <li>
                    <strong>משיכת מחיר שוק:</strong> בחלון ההגדלה תוכל ללחוץ על <em>"משוך מחיר שוק"</em> כדי למלא את המחיר של הרגע בלחיצה אחת.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 font-mono">
                <div className="font-bold text-cyan-300 font-sans flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isHe ? 'נוסחת השקלול המשוקללת:' : 'Weighted Average Formula:'}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-300 text-center font-bold">
                  {isHe
                    ? 'מחיר ממוצע חדש = ((כמות קיימת × מחיר קודם) + (כמות חדשה × מחיר חדש)) ÷ סה״כ מניות'
                    : 'New Avg = ((Old Shares × Old Price) + (New Shares × New Price)) / Total Shares'}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  {isHe
                    ? 'דוגמה: 10 מניות ב-$100 ($1,000) + קניית עוד 10 מניות ב-$80 ($800) = סה"כ 20 מניות במחיר ממוצע של $90 (Average Down הוזיל ב-$10 למניה).'
                    : 'Example: 10 shares @ $100 + 10 shares @ $80 = 20 shares @ $90 weighted avg cost (Average Down).'}
                </p>
              </div>
            </div>
          )}

          {/* Quick 1-click Preset Selector for Holdings in Portfolio */}
          {calculatedPositions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              <span className="text-slate-400 font-sans text-[11px]">{isHe ? 'בחר מניה מהתיק להגדלה מהירה:' : 'Quick DCA by holding:'}</span>
              {calculatedPositions.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => handleOpenBuyMore(pos)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5"
                  title={isHe ? `הגדל פוזיציה ב-${pos.ticker}` : `Buy more ${pos.ticker}`}
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{pos.ticker}</span>
                  <span className="text-[10px] opacity-75">(${pos.buyPrice.toFixed(0)})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Positions Table */}
      {(portfolioViewTab === 'active' || portfolioViewTab === 'both') && (
      <div className="overflow-hidden border border-slate-800 rounded-2xl bg-slate-900 shadow">
        
        {/* Table Toolbar with Filters & Realized Log Trigger */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isHe ? 'פירוט פוזיציות וניהול עסקאות' : 'Holdings & Active Positions'}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {calculatedPositions.length} {isHe ? 'מניות' : 'stocks'}
                </span>
              </div>

              {sortBy !== 'default' && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[11px] text-cyan-300 font-sans shadow-sm">
                  <span>
                    {isHe ? 'ממוין לפי: ' : 'Sorted by: '}
                    <strong className="font-bold">
                      {sortBy === 'dailyChangePct'
                        ? (isHe ? `שינוי יומי (${sortDirection === 'desc' ? 'מהגבוה לנמוך ↑' : 'מהנמוך לגבוה ↓'})` : `Daily Change (${sortDirection === 'desc' ? 'High → Low' : 'Low → High'})`)
                        : sortBy === 'currentValue'
                        ? (isHe ? `שווי נוכחי (${sortDirection === 'desc' ? 'גבוה לנמוך' : 'נמוך לגבוה'})` : `Market Value (${sortDirection === 'desc' ? 'High → Low' : 'Low → High'})`)
                        : sortBy === 'totalGain'
                        ? (isHe ? `רווח כולל ($) (${sortDirection === 'desc' ? 'גבוה לנמוך' : 'נמוך לגבוה'})` : `Total Gain ($) (${sortDirection === 'desc' ? 'High → Low' : 'Low → High'})`)
                        : sortBy === 'totalGainPct'
                        ? (isHe ? `תשואה כוללת (%) (${sortDirection === 'desc' ? 'גבוה לנמוך' : 'נמוך לגבוה'})` : `Total Gain (%) (${sortDirection === 'desc' ? 'High → Low' : 'Low → High'})`)
                        : sortBy === 'shares'
                        ? (isHe ? `כמות מניות (${sortDirection === 'desc' ? 'גבוה לנמוך' : 'נמוך לגבוה'})` : `Shares (${sortDirection === 'desc' ? 'High → Low' : 'Low → High'})`)
                        : sortBy === 'ticker'
                        ? (isHe ? `סימול (${sortDirection === 'desc' ? 'ת-א' : 'א-ת'})` : `Ticker (${sortDirection === 'desc' ? 'Z-A' : 'A-Z'})`)
                        : sortBy}
                    </strong>
                  </span>
                  <button
                    onClick={handleResetSort}
                    className="p-0.5 hover:bg-cyan-900/60 rounded text-cyan-400 hover:text-white transition cursor-pointer"
                    title={isHe ? 'בטל מיון וחזור לסדר המקורי' : 'Reset sorting'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-2.5" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder={isHe ? 'סנן לפי סימול או שם...' : 'Filter holdings...'}
                  className="w-full pl-8 rtl:pr-8 rtl:pl-3 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
              <button
                onClick={handleOpenAddModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isHe ? 'הוסף מניה' : 'Add'}</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs & Realized Log Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {isHe ? `כל המניות (${calculatedPositions.length})` : `All Stocks (${calculatedPositions.length})`}
              </button>

              <button
                onClick={() => setFilterTab('warnings')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filterTab === 'warnings'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>
                  {isHe
                    ? `⚠️ מניות עם אזהרות פעילות (${calculatedPositions.filter((p) => Boolean(getHoldingAlert(p))).length})`
                    : `Active Alerts (${calculatedPositions.filter((p) => Boolean(getHoldingAlert(p))).length})`}
                </span>
              </button>

              <button
                onClick={() => setFilterTab('profit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'profit'
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {isHe
                  ? `📈 ברווח (${calculatedPositions.filter((p) => p.totalGain >= 0).length})`
                  : `In Profit (${calculatedPositions.filter((p) => p.totalGain >= 0).length})`}
              </button>

              <button
                onClick={() => setFilterTab('loss')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'loss'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {isHe
                  ? `📉 בהפסד (${calculatedPositions.filter((p) => p.totalGain < 0).length})`
                  : `In Loss (${calculatedPositions.filter((p) => p.totalGain < 0).length})`}
              </button>
            </div>

            <button
              onClick={() => setShowRealizedLogModal(true)}
              className="px-3 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isHe
                  ? `יומן מימושים ועסקאות סגורות (${realizedTransactions.length})`
                  : `Realized Trades Log (${realizedTransactions.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Visual Portfolio Allocation Bar (אחוזי אחזקה ופילוח משקלים) */}
        {portfolioSummary.totalVal > 0 && calculatedPositions.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs flex-wrap gap-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>{isHe ? 'פילוח אחוזי אחזקה בתיק (משקל נוכחי)' : 'Portfolio Allocation by Weight'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isHe ? `סה"כ ${calculatedPositions.length} מניות פעילות • 100% הקצאה` : `${calculatedPositions.length} Holdings • 100% Allocated`}
              </span>
            </div>

            {/* Stacked Multi-Colored Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 flex shadow-inner">
              {calculatedPositions
                .map((pos) => ({
                  pos,
                  weight: (pos.currentValue / portfolioSummary.totalVal) * 100,
                }))
                .sort((a, b) => b.weight - a.weight)
                .map(({ pos, weight }, idx) => {
                  const colors = [
                    'bg-cyan-500',
                    'bg-amber-500',
                    'bg-emerald-500',
                    'bg-indigo-500',
                    'bg-rose-500',
                    'bg-purple-500',
                    'bg-blue-500',
                    'bg-teal-500',
                    'bg-orange-500',
                    'bg-fuchsia-500',
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={pos.id}
                      style={{ width: `${Math.max(1.5, weight)}%` }}
                      className={`h-full ${color} hover:brightness-125 transition-all duration-300 cursor-pointer border-r border-slate-950/40`}
                      title={`${pos.ticker} (${pos.companyName}): ${weight.toFixed(1)}% ($${pos.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                      onClick={() => setTableFilter(pos.ticker === tableFilter ? '' : pos.ticker)}
                    />
                  );
                })}
            </div>

            {/* Chips with Ticker & Exact Percentage */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {calculatedPositions
                .map((pos) => ({
                  pos,
                  weight: (pos.currentValue / portfolioSummary.totalVal) * 100,
                }))
                .sort((a, b) => b.weight - a.weight)
                .map(({ pos, weight }, idx) => {
                  const dotColors = [
                    'bg-cyan-400',
                    'bg-amber-400',
                    'bg-emerald-400',
                    'bg-indigo-400',
                    'bg-rose-400',
                    'bg-purple-400',
                    'bg-blue-400',
                    'bg-teal-400',
                    'bg-orange-400',
                    'bg-fuchsia-400',
                  ];
                  const dotColor = dotColors[idx % dotColors.length];
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setTableFilter(pos.ticker === tableFilter ? '' : pos.ticker)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-mono transition cursor-pointer ${
                        tableFilter === pos.ticker
                          ? 'bg-cyan-950 text-cyan-200 border-cyan-500 shadow-sm'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                      title={isHe ? `לחץ לסינון הטבלה לפי ${pos.ticker}` : `Filter by ${pos.ticker}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="font-bold text-white">{pos.ticker}</span>
                      <span className="text-cyan-300 font-semibold">{weight.toFixed(1)}%</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th
                  onClick={() => handleToggleSort('ticker')}
                  className="py-3 px-4 text-left rtl:text-right font-sans font-bold cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי סימול/שם חברה' : 'Click to sort by ticker'}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>{isHe ? 'מניה / חברה' : 'Holding'}</span>
                    {sortBy === 'ticker' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('shares')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי כמות מניות' : 'Click to sort by shares'}
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>{isHe ? 'כמות מניות' : 'Shares'}</span>
                    {sortBy === 'shares' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-3 text-center">{isHe ? 'מחיר קנייה (Cost)' : 'Avg Cost'}</th>

                {/* Column: Action Fee ($7.00 flat per action from today, $7.50 historical) */}
                <th
                  onClick={() => handleToggleSort('actionFee')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי מחיר פעולה ($7.00 לפעולה מהיום קדימה, $7.50 בעבר)' : 'Sort by Action Fee ($7.00 flat per order from today, $7.50 historical)'}
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span className="text-amber-300 font-bold">{isHe ? 'מחיר פעולה' : 'Action Fee'}</span>
                    {sortBy === 'actionFee' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-amber-400" /> : <ArrowUp className="w-3 h-3 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('currentPrice')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי מחיר חי' : 'Click to sort by live price'}
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>{isHe ? 'מחיר חי' : 'Live Price'}</span>
                    {sortBy === 'currentPrice' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('currentValue')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי שווי נוכחי' : 'Click to sort by market value'}
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>{isHe ? 'שוווי נוכחי' : 'Market Value'}</span>
                    {sortBy === 'currentValue' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Column: Portfolio Weight (%) */}
                <th
                  onClick={() => handleToggleSort('weight')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי אחוז אחזקה / משקל בתיק' : 'Click to sort by portfolio weight %'}
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span className="text-cyan-300 font-bold">{isHe ? 'משקל בתיק' : 'Weight'}</span>
                    {sortBy === 'weight' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleToggleSort('totalGainPct')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-200 transition select-none"
                  title={isHe ? 'לחץ למיון לפי רווח/הפסד כולל' : 'Click to sort by total P&L'}
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>{isHe ? 'רווח/הפסד כולל' : 'Total P&L'}</span>
                    {sortBy === 'totalGainPct' ? (
                      sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-600 opacity-40 hover:opacity-100" />
                    )}
                  </div>
                </th>

                {/* Daily Change Header - Highlighted, clickable and sortable */}
                <th
                  onClick={() => handleToggleSort('dailyChangePct')}
                  className={`py-3 px-3 text-center cursor-pointer select-none transition-all group ${
                    sortBy === 'dailyChangePct'
                      ? 'bg-slate-900/90 text-cyan-300'
                      : 'hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                  title={isHe
                    ? (sortBy === 'dailyChangePct'
                        ? (sortDirection === 'desc' ? 'ממוין מהגבוה לנמוך (לחץ למעבר מהנמוך לגבוה)' : 'ממוין מהנמוך לגבוה (לחץ למעבר מהגבוה לנמוך)')
                        : 'לחץ למיון לפי שינוי יומי (מהגבוה לנמוך או מהנמוך לגבוה)')
                    : 'Click to sort by Daily Change (High to Low / Low to High)'
                  }
                >
                  <div className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                    sortBy === 'dailyChangePct'
                      ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-sm'
                      : 'border-slate-800/80 bg-slate-900/40 text-slate-300 group-hover:border-slate-700'
                  }`}>
                    <span className="font-bold text-[11px]">{isHe ? 'שינוי יומי' : 'Daily P&L'}</span>
                    {sortBy === 'dailyChangePct' ? (
                      sortDirection === 'desc' ? (
                        <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-[10px]">
                          <ArrowDown className="w-3.5 h-3.5" />
                          <span className="font-sans">{isHe ? 'מהגבוה לנמוך' : 'High → Low'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-rose-400 font-bold text-[10px]">
                          <ArrowUp className="w-3.5 h-3.5" />
                          <span className="font-sans">{isHe ? 'מהנמוך לגבוה' : 'Low → High'}</span>
                        </span>
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-4 text-right rtl:text-left font-sans">{isHe ? 'פעולות' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedPositions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-sans">{isHe ? 'לא נמצאו פוזיציות התואמות לחיפוש.' : 'No positions found.'}</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="mt-2 text-xs text-emerald-400 hover:underline font-mono cursor-pointer"
                    >
                      {isHe ? '+ הוסף מניה חדשה לתיק' : '+ Add new stock'}
                    </button>
                  </td>
                </tr>
              ) : (
                displayedPositions.map((pos) => {
                  const isPosGain = pos.totalGain >= 0;
                  const alert = getHoldingAlert(pos);
                  return (
                    <tr key={pos.id} className="hover:bg-slate-800/40 transition group">
                      <td className="py-3 px-4">
                        <div
                          onClick={() => handleStockClick(pos.matchedStock)}
                          className="flex items-start gap-3 cursor-pointer group/stock p-1 -m-1 rounded-xl hover:bg-slate-800/80 transition"
                          title={isHe ? `לחץ לצפייה בפרטי המניה, הערכת שווי DCF ודירוג אנליסטים בכירים עבור ${pos.ticker}` : `Click to view stock details, DCF and senior analyst valuations for ${pos.ticker}`}
                        >
                          <StockLogoBadge ticker={pos.ticker} name={pos.companyName} size="md" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-cyan-300 group-hover/stock:text-cyan-200 group-hover/stock:underline flex items-center gap-1">
                                <span>{pos.ticker}</span>
                                <ExternalLink className="w-3 h-3 text-cyan-400 opacity-60 group-hover/stock:opacity-100 transition" />
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-sans">
                                {pos.matchedStock?.sector || 'US Equity'}
                              </span>
                              {pos.tranches && pos.tranches.length > 1 && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-sans flex items-center gap-0.5"
                                  title={`${pos.tranches.length} מנות רכישה שוקללו למחיר ממוצע`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Layers className="w-2.5 h-2.5" />
                                  <span>{pos.tranches.length} מנות (DCA)</span>
                                </span>
                              )}
                            </div>
                            <div className="text-slate-300 group-hover/stock:text-white font-sans text-xs truncate max-w-[180px]">
                              {pos.companyName}
                            </div>
                            {pos.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5 font-sans truncate max-w-[220px]">
                                💬 {pos.notes}
                              </div>
                            )}

                            {/* Alert Chip if alert exists */}
                            {alert && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAlertHolding(alert);
                                }}
                                className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-bold border transition cursor-pointer ${
                                  alert.severity === 'CRITICAL'
                                    ? 'bg-rose-950/90 text-rose-300 border-rose-600/70 hover:bg-rose-900'
                                    : alert.severity === 'WARNING'
                                    ? 'bg-amber-950/90 text-amber-300 border-amber-600/70 hover:bg-amber-900'
                                    : alert.severity === 'OPPORTUNITY'
                                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/70 hover:bg-emerald-900'
                                    : 'bg-cyan-950/90 text-cyan-300 border-cyan-600/70 hover:bg-cyan-900'
                                }`}
                              >
                                {alert.severity === 'CRITICAL' ? (
                                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                ) : alert.severity === 'WARNING' ? (
                                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                ) : alert.severity === 'OPPORTUNITY' ? (
                                  <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <Activity className="w-3 h-3 text-cyan-400 shrink-0" />
                                )}
                                <span>{alert.badgeLabel}</span>
                                <span className="underline opacity-80 mr-1">{isHe ? '(הסבר ופעולה ↵)' : '(details ↵)'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Shares */}
                      <td className="py-3 px-3 text-center font-bold text-slate-200">
                        {pos.shares}
                      </td>

                      {/* Buy Price */}
                      <td className="py-3 px-3 text-center text-slate-300">
                        ${pos.buyPrice.toFixed(2)}
                      </td>

                      {/* Action Fee Column */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-600/60 px-2 py-0.5 rounded text-[11px] shadow-sm">
                            ${pos.actionFee.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-sans mt-0.5" title={isHe ? 'עמלה קבועה לפעולה (לא למניה)' : 'Flat fee per order (not per share)'}>
                            {pos.tranches && pos.tranches.length > 1
                              ? `${pos.tranches.length} מנות (${pos.tranches.map(t => `$${(t.actionFee ?? pos.actionFee / pos.tranches!.length).toFixed(2)}`).join('+')})`
                              : `$${pos.actionFee.toFixed(2)} לפעולה`}
                          </span>
                        </div>
                      </td>

                      {/* Live Price */}
                      <td className="py-3 px-3 text-center font-bold text-white">
                        ${pos.currentPrice.toFixed(2)}
                      </td>

                      {/* Market Value */}
                      <td className="py-3 px-3 text-center font-bold text-cyan-300">
                        ${pos.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Portfolio Weight (%) */}
                      <td className="py-3 px-3 text-center">
                        {(() => {
                          const weightPct = portfolioSummary.totalVal > 0 ? (pos.currentValue / portfolioSummary.totalVal) * 100 : 0;
                          return (
                            <div className="inline-flex flex-col items-center gap-1 min-w-[70px]">
                              <span className="font-mono font-bold text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded text-[11px] shadow-sm">
                                {weightPct.toFixed(1)}%
                              </span>
                              <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(4, weightPct))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Total P&L */}
                      <td className="py-3 px-3 text-center">
                        <div className={`font-bold ${isPosGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPosGain ? '+' : ''}${pos.totalGain.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isPosGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({isPosGain ? '+' : ''}{pos.totalGainPct.toFixed(2)}%)
                        </div>
                      </td>

                      {/* Daily Change */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              pos.dailyChangePct >= 0
                                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                                : 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                            }`}
                          >
                            {pos.dailyChangePct >= 0 ? '+' : ''}{pos.dailyChangePct.toFixed(2)}%
                          </span>
                          <span className={`text-[10px] ${pos.dailyGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pos.dailyGain >= 0 ? '+' : '-'}${Math.abs(pos.dailyGain).toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5 flex-wrap">
                          {/* BUY MORE / DCA BUTTON */}
                          <button
                            onClick={() => handleOpenBuyMore(pos)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1 shadow-sm"
                            title={isHe ? 'קנה מניות נוספות במחיר שונה ושקלל אוטומטית מחיר ממוצע (DCA)' : 'Buy more at different price and average down/up (DCA)'}
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>{isHe ? '+ הגדל פוזיציה' : '+ Buy More'}</span>
                          </button>

                          {/* SELL / REALIZE BUTTON */}
                          <button
                            onClick={() => handleOpenSell(pos)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1 shadow-sm"
                            title={isHe ? 'מכור מניות מהפוזיציה ונעל רווח/הפסד ממומש' : 'Sell shares and realize profit/loss'}
                          >
                            <Coins className="w-3 h-3" />
                            <span>{isHe ? 'מימוש' : 'Sell'}</span>
                          </button>

                          {/* STOCK DETAILS */}
                          <button
                            onClick={() => handleStockClick(pos.matchedStock)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 hover:border-cyan-500 transition text-xs font-mono cursor-pointer flex items-center gap-1 shadow-sm"
                            title={isHe ? 'הצג פרטי מניה מלאים, הערכת שווי DCF ודירוג אנליסטים בכירים' : 'View stock details, DCF & senior analyst ratings'}
                          >
                            <FileText className="w-3 h-3 text-cyan-400" />
                            <span>{isHe ? 'מידע' : 'Info'}</span>
                          </button>

                          {/* RESEARCH */}
                          <button
                            onClick={() => onOpenDeepDive(pos.matchedStock)}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition text-xs font-mono cursor-pointer flex items-center gap-1"
                            title={isHe ? 'מחקר מעמיק למניה זו' : 'Deep Dive Research'}
                          >
                            <span>{isHe ? 'מחקר' : 'Research'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          
                          {/* EDIT */}
                          <button
                            onClick={() => handleOpenEdit(pos)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition cursor-pointer"
                            title={isHe ? 'ערוך פוזיציה' : 'Edit position'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => handleDeletePosition(pos.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title={isHe ? 'מחק פוזיציה מהתיק' : 'Remove position'}
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

        {/* Table Footer Action Bar */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isHe ? 'הנתונים נשמרים מקומית בצורה מאובטחת ומסונכרנים לציטוטי אמת' : 'Holdings saved locally & synced with live real-time feeds'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCsvInputText('');
                setCsvImportError(null);
                setShowCsvImportModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title={isHe ? 'ייבא רשימת פוזיציות מקובץ CSV' : 'Import positions from CSV'}
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHe ? 'יבוא מ-CSV' : 'Import CSV'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={calculatedPositions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={isHe ? 'ייצא את כל הפוזיציות והרווחים לקובץ CSV / Excel' : 'Export all holdings to CSV / Excel'}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHe ? 'ייצוא לאקסל (CSV)' : 'Export CSV'}</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DEDICATED ANNUAL REALIZED TRADES TABLE (טבלת מימושים שנתית קבועה)
      ───────────────────────────────────────────────────────────── */}
      {(portfolioViewTab === 'realized' || portfolioViewTab === 'both') && (
        <div id="annual-realized-table-section" className="overflow-hidden border border-indigo-900/60 rounded-2xl bg-slate-900 shadow-xl space-y-0">
          
          {/* Realized Table Header & Toolbar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-950 to-indigo-950/40 border-b border-indigo-900/50 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {isHe ? 'טבלת מימושים שנתית ודוח עסקאות סגורות' : 'Annual Realized Trades Table & Closed Capital Gains'}
                    </h3>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {filteredRealizedTrades.length} {isHe ? 'עסקאות' : 'trades'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isHe
                      ? 'מעקב מלא אחר מניות שנמכרו, השוואת מחיר קנייה מול מחיר מימוש, חישוב רווחי הון נטו ואומדן מס'
                      : 'Comprehensive tracking of sold shares, buy vs. sell prices, net capital gains and estimated tax.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons & Year Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
                {/* Year Filter Buttons */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="px-2 text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {isHe ? 'שנה:' : 'Year:'}
                  </span>
                  <button
                    onClick={() => setRealizedYearFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                      realizedYearFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isHe ? 'הכל' : 'All'}
                  </button>
                  {availableRealizedYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setRealizedYearFilter(yr)}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                        realizedYearFilter === yr
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>

                {/* Export Realized CSV */}
                <button
                  onClick={handleExportRealizedCsv}
                  disabled={filteredRealizedTrades.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 text-xs font-mono font-bold"
                  title={isHe ? 'הורד דוח מימושים מלא לקובץ אקסל' : 'Export realized trades report to CSV'}
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isHe ? 'ייצא דוח מימושים (CSV)' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Realized Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Total Realized Net Gain */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <div className="text-[11px] font-mono text-slate-400">{isHe ? 'רווח הון ממומש נטו' : 'Net Realized P&L'}</div>
                <div
                  className={`text-xl font-extrabold font-mono mt-0.5 flex items-center gap-1 ${
                    realizedSummary.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {realizedSummary.totalGain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>
                    {realizedSummary.totalGain >= 0 ? '+' : '-'}$
                    {Math.abs(realizedSummary.totalGain).toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {isHe ? 'תשואה משוקללת: ' : 'Return: '}
                  <span className={realizedSummary.netReturnPct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {realizedSummary.netReturnPct >= 0 ? '+' : ''}{realizedSummary.netReturnPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Cash Proceeds */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <div className="text-[11px] font-mono text-slate-400">{isHe ? 'סך תמורה במזומן (פדיון)' : 'Total Cash Proceeds'}</div>
                <div className="text-xl font-extrabold font-mono text-cyan-400 mt-0.5">
                  ${realizedSummary.totalProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {isHe ? 'עלות רכישה: ' : 'Cost basis: '}${realizedSummary.totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Estimated Capital Gains Tax (25%) */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <div className="text-[11px] font-mono text-slate-400">{isHe ? 'אומדן מס רווחי הון (25%)' : 'Est. Capital Gains Tax'}</div>
                <div className="text-xl font-extrabold font-mono text-amber-400 mt-0.5">
                  ${realizedSummary.estimatedTax.toFixed(2)}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {isHe ? 'רווח נטו לאחר מס: ' : 'Net after tax: '}${Math.max(0, realizedSummary.totalGain - realizedSummary.estimatedTax).toFixed(2)}
                </div>
              </div>

              {/* Success / Win Rate */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <div className="text-[11px] font-mono text-slate-400">{isHe ? 'אחוז עסקאות מנצחות' : 'Win Rate'}</div>
                <div className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
                  {realizedSummary.winRate.toFixed(1)}%
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {realizedSummary.winningTrades} {isHe ? 'ברווח' : 'won'} / {realizedSummary.losingTrades} {isHe ? 'בהפסד' : 'lost'}
                </div>
              </div>
            </div>
          </div>

          {/* Realized Trades Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-indigo-900/40 bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider font-sans select-none">
                  <th className="py-3 px-3.5 text-slate-300 font-bold">{isHe ? 'תאריך מכירה' : 'Sale Date'}</th>
                  <th className="py-3 px-3.5 text-slate-300 font-bold">{isHe ? 'מניה / סימול' : 'Asset / Ticker'}</th>
                  <th className="py-3 px-3 text-center text-slate-300 font-bold">{isHe ? 'כמות שנמכרה' : 'Shares Sold'}</th>
                  <th className="py-3 px-3 text-right rtl:text-left text-indigo-300 font-bold">{isHe ? 'מחיר קנייה ממוצע' : 'Avg Buy Price'}</th>
                  <th className="py-3 px-3 text-right rtl:text-left text-cyan-300 font-bold">{isHe ? 'מחיר מימוש (מכירה)' : 'Sell Price'}</th>
                  <th className="py-3 px-3 text-center text-amber-300 font-bold" title={isHe ? 'מחיר פעולת מכירה (קבוע לפעולה, לא למניה)' : 'Action fee (flat per order)'}>{isHe ? 'מחיר פעולה' : 'Action Fee'}</th>
                  <th className="py-3 px-3 text-right rtl:text-left text-slate-300 font-bold">{isHe ? 'עלות השקעה' : 'Cost Basis'}</th>
                  <th className="py-3 px-3 text-right rtl:text-left text-slate-300 font-bold">{isHe ? 'תקבול במזומן' : 'Total Proceeds'}</th>
                  <th className="py-3 px-3 text-right rtl:text-left text-emerald-400 font-bold">{isHe ? 'רווח / הפסד ממומש' : 'Realized P&L'}</th>
                  <th className="py-3 px-3 text-center text-slate-300 font-bold">{isHe ? 'תשואה %' : 'Return %'}</th>
                  <th className="py-3 px-3.5 text-slate-400 font-normal">{isHe ? 'הערות ואסטרטגיה' : 'Notes'}</th>
                  <th className="py-3 px-3 text-center text-slate-400">{isHe ? 'פעולות' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRealizedTrades.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <History className="w-8 h-8 text-slate-600 animate-pulse" />
                        <span className="text-sm font-sans font-bold text-slate-300">
                          {realizedYearFilter === 'all'
                            ? (isHe ? 'אין עסקאות מימוש מתועדות כרגע בתיק' : 'No realized trades logged yet')
                            : (isHe ? `אין עסקאות מימוש שנרשמו בשנת ${realizedYearFilter}` : `No realized trades recorded in ${realizedYearFilter}`)}
                        </span>
                        <p className="text-xs text-slate-500 max-w-md font-sans">
                          {isHe
                            ? 'כאשר תבצע מכירה או מימוש מניות באמצעות כפתור "מימוש" בטבלת הפוזיציות, העסקה תינעל כאן אוטומטית עם פירוט מלא של מחיר קנייה, מחיר מכירה ורווחי הון.'
                            : 'When you sell shares using the "Sell" button on active holdings, completed trades will automatically appear here with full buy/sell details and tax metrics.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRealizedTrades.map((tx) => {
                    const costBasis = tx.sharesSold * tx.avgBuyPrice;
                    const proceeds = tx.sharesSold * tx.sellPrice;
                    const isWin = tx.realizedPnL >= 0;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-indigo-950/20 transition-colors group"
                      >
                        {/* Sale Date */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-slate-300 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{tx.saleDate}</span>
                          </div>
                        </td>

                        {/* Ticker & Company */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStockClick(getResearchStock(tx.ticker))}
                              className="font-extrabold text-sm text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-mono"
                              title={isHe ? 'צפה בפרטי המניה והערכת שווי' : 'Open stock details and valuations'}
                            >
                              {tx.ticker}
                            </button>
                            <span className="text-xs text-slate-400 font-sans hidden sm:inline truncate max-w-[140px]" title={tx.companyName}>
                              {tx.companyName}
                            </span>
                          </div>
                        </td>

                        {/* Shares Sold */}
                        <td className="py-3 px-3 text-center text-white font-bold">
                          {tx.sharesSold.toLocaleString()}
                        </td>

                        {/* Avg Buy Price */}
                        <td className="py-3 px-3 text-right rtl:text-left text-slate-300">
                          ${tx.avgBuyPrice.toFixed(2)}
                        </td>

                        {/* Sell Price */}
                        <td className="py-3 px-3 text-right rtl:text-left text-cyan-300 font-bold">
                          ${tx.sellPrice.toFixed(2)}
                        </td>

                        {/* Action Fee ($7.50 flat per order) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-600/60 px-2 py-0.5 rounded text-[11px] shadow-sm">
                              ${(tx.actionFee ?? ACTION_FEE_USD).toFixed(2)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-sans mt-0.5" title={isHe ? `מחיר פעולת מכירה ($${(tx.actionFee ?? ACTION_FEE_USD).toFixed(2)} קבוע לפעולה)` : `$${(tx.actionFee ?? ACTION_FEE_USD).toFixed(2)} flat sell fee`}>
                              {isHe ? 'עמלת מכירה' : 'sell fee'}
                            </span>
                          </div>
                        </td>

                        {/* Cost Basis */}
                        <td className="py-3 px-3 text-right rtl:text-left text-slate-400">
                          ${costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Total Proceeds */}
                        <td className="py-3 px-3 text-right rtl:text-left text-white font-bold">
                          ${proceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Realized P&L */}
                        <td className="py-3 px-3 text-right rtl:text-left">
                          <div
                            className={`font-extrabold font-mono flex items-center justify-end rtl:justify-start gap-1 ${
                              isWin ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span>{isWin ? '+' : ''}${tx.realizedPnL.toFixed(2)}</span>
                          </div>
                        </td>

                        {/* Return % */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${
                              isWin
                                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50'
                                : 'text-rose-400 bg-rose-950/60 border border-rose-800/50'
                            }`}
                          >
                            {isWin ? '+' : ''}{tx.realizedPnLPct.toFixed(2)}%
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3.5 text-xs text-slate-300 font-sans max-w-[200px] truncate" title={tx.notes || ''}>
                          {tx.notes ? (
                            <span className="text-slate-300 italic">{tx.notes}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteRealizedTx(tx.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title={isHe ? 'מחק רשומת מימוש זו' : 'Delete trade record'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Realized Table Footer */}
          <div className="p-3.5 bg-slate-950/90 border-t border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>
                {isHe
                  ? 'טבלת המימושים נשמרת אוטומטית ומאפשרת מעקב רווחי הון לצורכי דוח שנתי ומס'
                  : 'Realized trade journal is automatically stored locally for capital gains tax tracking and yearly audits'}
              </span>
            </div>

            {realizedTransactions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(isHe ? 'האם אתה בטוח שברצונך לאפס את כל היסטוריית המימושים בתיק?' : 'Clear all realized trade history?')) {
                    setRealizedTransactions([]);
                    showToast(isHe ? 'יומן המימושים אופס.' : 'Realized trades cleared.', 'info');
                  }
                }}
                className="text-slate-500 hover:text-rose-400 transition cursor-pointer text-[11px] font-sans hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isHe ? 'איפוס כל יומן המימושים' : 'Clear realized log'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: ADD POSITION (Any stock in catalog OR custom ticker)
      ───────────────────────────────────────────────────────────── */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto animate-scaleUp font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isHe ? 'הוספת מניה לתיק האישי' : 'Add Stock to Portfolio'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isHe ? 'בחר מניה מהשוק או הקלד כל טיקר שבעולם' : 'Pick from market catalog or type any custom ticker'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddMode('catalog')}
                className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMode === 'catalog'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isHe ? 'חיפוש מהשוק (מאות מניות)' : 'Search Market Universe'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAddMode('custom')}
                className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  addMode === 'custom'
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isHe ? 'הזנת טיקר חופשי (כל מניה)' : 'Custom Ticker (Any Stock)'}</span>
              </button>
            </div>

            <form onSubmit={handleAddPosition} className="space-y-4 text-xs font-mono">
              
              {/* MODE 1: Catalog Search & Dropdown */}
              {addMode === 'catalog' && (
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <label className="block text-slate-300 font-sans font-semibold">
                    {isHe ? 'חיפוש ובחירת מניה:' : 'Search & Select Stock:'}
                  </label>
                  
                  {/* Quick filter input inside catalog */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder={isHe ? 'חפש לפי שם או סימול (למשל Apple, PLTR, אמזון)...' : 'Filter by name or ticker...'}
                      className="w-full pl-8 rtl:pr-8 rtl:pl-3 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-sans"
                    />
                  </div>

                  {/* Stock Selector Dropdown */}
                  <select
                    value={selectedStockTicker}
                    onChange={(e) => handleSelectCatalogStock(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-bold focus:outline-none focus:border-emerald-400 cursor-pointer text-xs"
                    size={4}
                  >
                    {filteredCatalogStocks.map((s) => (
                      <option key={s.ticker} value={s.ticker} className="py-1">
                        {s.ticker} — {s.name} {s.nameHe ? `(${s.nameHe})` : ''} • {s.sector}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* MODE 2: Custom Any Ticker Input */}
              {addMode === 'custom' && (
                <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-slate-300 font-sans font-semibold mb-1">
                      {isHe ? 'הקלד סימול מניה (Ticker Symbol):' : 'Enter Ticker Symbol:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TSLA, PLTR, BABA, SHOP, ARM"
                      value={customTicker}
                      onChange={(e) => handleCustomTickerChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-cyan-300 font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-sans font-semibold mb-1">
                      {isHe ? 'שם החברה (Company Name):' : 'Company Name:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tesla, Inc."
                      value={customCompanyName}
                      onChange={(e) => setCustomCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-sans focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* Shares & Cost Basis */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1">
                    {isHe ? 'כמות מניות:' : 'Number of Shares:'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    required
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1">
                    {isHe ? 'מחיר קנייה ממוצע ($):' : 'Average Buy Price ($):'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={costBasisInput}
                    onChange={(e) => setCostBasisInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Purchase Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1">
                    {isHe ? 'תאריך רכישה:' : 'Purchase Date:'}
                  </label>
                  <input
                    type="date"
                    value={purchaseDateInput}
                    onChange={(e) => setPurchaseDateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1">
                    {isHe ? 'הערות אישיות:' : 'Notes (Optional):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHe ? 'למשל: נרכש בדיפ לטווח ארוך' : 'e.g. 5Y compounder position'}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Total Summary Preview with Action Fee */}
              {(() => {
                const sh = parseFloat(sharesInput) || 0;
                const pr = parseFloat(costBasisInput) || 0;
                const gross = sh * pr;
                const total = gross > 0 ? gross + ACTION_FEE_USD : 0;
                return (
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-sans">{isHe ? 'עלות מניות ברוטו:' : 'Gross Shares Cost:'}</span>
                      <span>${gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="font-sans flex items-center gap-1">
                        <span>{isHe ? 'מחיר פעולה (מעודכן מהיום):' : 'Action Fee (Updated):'}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold">
                          {isHe ? 'קבוע לפעולה' : 'flat fee'}
                        </span>
                      </span>
                      <span className="font-bold">+${ACTION_FEE_USD.toFixed(2)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold">
                      <span className="text-slate-300 font-sans">{isHe ? 'סך עלות השקעה כוללת (כולל פעולה):' : 'Total Capital Invested (incl. Fee):'}</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Existing Holding / DCA Alert if Stock is already in Portfolio */}
              {(() => {
                const effectiveTicker = (addMode === 'catalog' ? selectedStockTicker : customTicker).trim().toUpperCase();
                const existingHold = positions.find((p) => p.ticker.toUpperCase() === effectiveTicker);
                if (!existingHold || !effectiveTicker) return null;

                const addSh = parseFloat(sharesInput) || 0;
                const addPr = parseFloat(costBasisInput) || 0;
                const combinedShares = existingHold.shares + addSh;
                const combinedCost = (existingHold.shares * existingHold.buyPrice) + (addSh * addPr);
                const combinedAvg = combinedShares > 0 ? combinedCost / combinedShares : existingHold.buyPrice;

                return (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold font-sans">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      <span>{isHe ? `שים לב: ${effectiveTicker} כבר קיימת בתיק שלך!` : `Note: ${effectiveTicker} already exists in your portfolio!`}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">
                      {isHe
                        ? `בתיק יש לך ${existingHold.shares} מניות במחיר ממוצע של $${existingHold.buyPrice.toFixed(2)}. שמירה כאן תשקלל אוטומטית (DCA) את הפוזיציה הקיימת לסך של ${combinedShares.toFixed(1)} מניות במחיר ממוצע חדש של $${combinedAvg.toFixed(2)}.`
                        : `You currently hold ${existingHold.shares} shares @ $${existingHold.buyPrice.toFixed(2)}. Saving will automatically average (DCA) your position into ${combinedShares.toFixed(1)} shares @ $${combinedAvg.toFixed(2)}.`}
                    </p>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer font-sans"
                >
                  {isHe ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition shadow cursor-pointer font-sans"
                >
                  {isHe ? 'הוסף לתיק' : 'Save Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: EDIT POSITION
      ───────────────────────────────────────────────────────────── */}
      {editingPosition && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setEditingPosition(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <StockLogoBadge ticker={editingPosition.ticker} size="sm" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isHe ? `עריכת פוזיציה: ${editingPosition.ticker}` : `Edit Position: ${editingPosition.ticker}`}
                  </h3>
                  <div className="text-xs text-slate-400 truncate max-w-[240px]">
                    {editingPosition.companyName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingPosition(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'כמות מניות:' : 'Number of Shares:'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    required
                    value={editShares}
                    onChange={(e) => setEditShares(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'מחיר קנייה ($):' : 'Buy Price ($):'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editBuyPrice}
                    onChange={(e) => setEditBuyPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-sans font-semibold">
                  {isHe ? 'תאריך רכישה:' : 'Purchase Date:'}
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-sans font-semibold">
                  {isHe ? 'הערות אישיות:' : 'Notes:'}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPosition(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer font-sans"
                >
                  {isHe ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition shadow cursor-pointer font-sans"
                >
                  {isHe ? 'שמור שינויים' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: CSV IMPORT
      ───────────────────────────────────────────────────────────── */}
      {showCsvImportModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowCsvImportModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isHe ? 'יבוא פוזיציות מקובץ CSV' : 'Import Portfolio Positions (CSV)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isHe ? 'הדבק טקסט בפורמט: טיקר, כמות, מחיר קנייה, תאריך, הערות' : 'Paste CSV text: Ticker, Shares, BuyPrice, Date, Notes'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCsvImportModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1.5 font-sans font-semibold">
                  {isHe ? 'טקסט נתוני ה-CSV:' : 'CSV Content:'}
                </label>
                <textarea
                  rows={6}
                  value={csvInputText}
                  onChange={(e) => setCsvInputText(e.target.value)}
                  placeholder={`Ticker,Shares,BuyPrice,PurchaseDate,Notes\nNVDA,15,120.50,2026-01-15,AI Core\nAAPL,25,225.00,2026-02-01,Ecosystem\nBRK.B,10,450.00,2026-03-10,Value Moat`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Sample format hint */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-sans space-y-1">
                <div className="font-semibold text-slate-300">
                  {isHe ? 'דוגמת מבנה שורה:' : 'Expected format:'}
                </div>
                <div className="font-mono text-cyan-400">
                  AAPL, 20, 215.50, 2026-01-10, Core holding
                </div>
              </div>

              {csvImportError && (
                <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{csvImportError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCsvImportModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer font-sans"
                >
                  {isHe ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition shadow cursor-pointer font-sans"
                >
                  {isHe ? 'ייבא לתיק האישי' : 'Import Positions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: BUY MORE / DCA (קנייה נוספת ושקלול מחיר ממוצע)
      ───────────────────────────────────────────────────────────── */}
      {buyingMorePosition && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setBuyingMorePosition(null)}
        >
          <div
            className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isHe
                      ? `קנייה נוספת של מניית ${buyingMorePosition.ticker} ושקלול מחיר ממוצע (DCA)`
                      : `Buy More ${buyingMorePosition.ticker} (Dollar-Cost Averaging)`}
                  </h3>
                  <div className="text-xs text-slate-400 truncate max-w-[280px]">
                    {buyingMorePosition.companyName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBuyingMorePosition(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Position Baseline Card */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">{isHe ? 'כמות מניות קיימת:' : 'Current Shares:'}</span>
                <span className="font-bold text-slate-200">{buyingMorePosition.shares} מניות</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">{isHe ? 'מחיר קנייה ממוצע נוכחי:' : 'Current Avg Cost:'}</span>
                <span className="font-bold text-emerald-400">${buyingMorePosition.buyPrice.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmBuyMore} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'כמות מניות נוספת לרכישה:' : 'Additional Shares to Buy:'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    required
                    value={buyMoreShares}
                    onChange={(e) => setBuyMoreShares(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-sans font-semibold">
                      {isHe ? 'מחיר קנייה חדש למניה ($):' : 'New Purchase Price ($):'}
                    </label>
                    {livePrices[buyingMorePosition.ticker.toUpperCase()]?.price && (
                      <button
                        type="button"
                        onClick={() => setBuyMorePrice(livePrices[buyingMorePosition.ticker.toUpperCase()].price.toFixed(2))}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                        title={isHe ? 'מלא את מחיר השוק הנוכחי של המניה' : 'Fill live market price'}
                      >
                        {isHe ? 'משוך מחיר שוק' : 'Fill market'} (${livePrices[buyingMorePosition.ticker.toUpperCase()].price.toFixed(2)})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={buyMorePrice}
                    onChange={(e) => setBuyMorePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'תאריך רכישה:' : 'Purchase Date:'}
                  </label>
                  <input
                    type="date"
                    value={buyMoreDate}
                    onChange={(e) => setBuyMoreDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'הערות (סיבת קנייה):' : 'Notes (e.g. Bought the dip):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHe ? 'למשל: חיזוק בירידה' : 'e.g. Dip buy'}
                    value={buyMoreNotes}
                    onChange={(e) => setBuyMoreNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Dynamic DCA Math Preview Box */}
              {(() => {
                const addSh = Math.max(0, parseFloat(buyMoreShares) || 0);
                const addPr = Math.max(0, parseFloat(buyMorePrice) || 0);
                const newTotShares = buyingMorePosition.shares + addSh;
                const newTotCost = (buyingMorePosition.shares * buyingMorePosition.buyPrice) + (addSh * addPr);
                const newWeightedAvg = newTotShares > 0 ? newTotCost / newTotShares : buyingMorePosition.buyPrice;
                const priceDelta = newWeightedAvg - buyingMorePosition.buyPrice;
                const additionalCapital = addSh * addPr;
                const totalAdditionalWithFee = additionalCapital > 0 ? additionalCapital + ACTION_FEE_USD : 0;

                return (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-bold">
                      <Scale className="w-4 h-4" />
                      <span>{isHe ? 'תחזית שקלול ממוצע חדש (DCA Calculation):' : 'New Weighted Average Calculation:'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">{isHe ? 'סך מניות חדש' : 'New Total Shares'}</span>
                        <span className="font-bold text-white text-sm">{newTotShares.toFixed(2)}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">{isHe ? 'מחיר ממוצע חדש' : 'New Weighted Avg'}</span>
                        <span className="font-bold text-cyan-300 text-sm">${newWeightedAvg.toFixed(2)}</span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">{isHe ? 'תוספת הון (כולל עמלה)' : 'Cash Required'}</span>
                        <span className="font-bold text-emerald-400 text-sm">${totalAdditionalWithFee.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Fee Breakdown Banner */}
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 font-sans flex items-center gap-1">
                        <span>{isHe ? 'מחיר פעולת קנייה זו (מעודכן מהיום):' : 'Action Fee for this Buy (Updated):'}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {isHe ? '$7.00 קבוע לפעולה' : '$7.00 flat fee'}
                        </span>
                      </span>
                      <span className="font-bold text-amber-300">+${ACTION_FEE_USD.toFixed(2)}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-sans pt-0.5 flex items-center justify-between">
                      <span>{isHe ? 'השפעה על מחיר הבסיס למניה:' : 'Cost Basis Impact:'}</span>
                      <span className={`font-mono font-bold ${priceDelta < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {priceDelta < 0 ? '▼ הוזלה של ' : '▲ עלייה של '}${Math.abs(priceDelta).toFixed(2)} ({((Math.abs(priceDelta) / buyingMorePosition.buyPrice) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBuyingMorePosition(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer font-sans"
                >
                  {isHe ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition shadow cursor-pointer font-sans"
                >
                  {isHe ? 'אשר קנייה ושקלל מחיר ממוצע' : 'Confirm Buy & Recalculate DCA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 5: SELL / REALIZE (מימוש ומכירת מניות מהפוזיציה)
      ───────────────────────────────────────────────────────────── */}
      {sellingPosition && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSellingPosition(null)}
        >
          <div
            className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-sans animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isHe
                      ? `מימוש ומכירה של מניית ${sellingPosition.ticker}`
                      : `Realize & Sell Shares: ${sellingPosition.ticker}`}
                  </h3>
                  <div className="text-xs text-slate-400 truncate max-w-[280px]">
                    {sellingPosition.companyName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSellingPosition(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Holding Baseline */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">{isHe ? 'סה"כ מניות זמינות למימוש:' : 'Available Shares:'}</span>
                <span className="font-bold text-slate-200">{sellingPosition.shares} מניות</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-sans">{isHe ? 'מחיר קנייה ממוצע בתיק:' : 'Average Cost Basis:'}</span>
                <span className="font-bold text-cyan-300">${sellingPosition.buyPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Percentage Presets */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 text-xs font-sans font-semibold">
                {isHe ? 'בחר אחוז מימוש מהיר:' : 'Quick Sell %:'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSellShares((sellingPosition.shares * pct).toFixed(2))}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-300 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    {pct === 1 ? (isHe ? '100% (מלא)' : '100% Full') : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleConfirmSell} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'כמות מניות למכירה:' : 'Shares to Sell:'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    max={sellingPosition.shares}
                    required
                    value={sellShares}
                    onChange={(e) => setSellShares(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'מחיר מכירה בפועל ($):' : 'Execution Price ($):'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'תאריך מכירה:' : 'Sale Date:'}
                  </label>
                  <input
                    type="date"
                    value={sellDate}
                    onChange={(e) => setSellDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-sans font-semibold">
                    {isHe ? 'הערות (סיבת המימוש):' : 'Notes (e.g. Taking profits):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHe ? 'למשל: נעילת רווחים' : 'e.g. Lock in gain'}
                    value={sellNotes}
                    onChange={(e) => setSellNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Dynamic Realized P&L Preview */}
              {(() => {
                const numSold = Math.min(sellingPosition.shares, Math.max(0, parseFloat(sellShares) || 0));
                const pSold = Math.max(0, parseFloat(sellPrice) || 0);
                const grossCashIn = numSold * pSold;
                const netCashIn = grossCashIn > 0 ? grossCashIn - ACTION_FEE_USD : 0;
                
                const currentPosBuyFee = typeof sellingPosition.actionFee === 'number' ? sellingPosition.actionFee : ACTION_FEE_USD;
                const isFullSell = (sellingPosition.shares - numSold) <= 0.0001;
                const buyFeeForThisSale = isFullSell ? currentPosBuyFee : (currentPosBuyFee * (numSold / sellingPosition.shares));
                const costBasisWithBuyFee = (numSold * sellingPosition.buyPrice) + buyFeeForThisSale;

                const realizedGain = netCashIn - costBasisWithBuyFee;
                const realizedGainPct = costBasisWithBuyFee > 0 ? (realizedGain / costBasisWithBuyFee) * 100 : 0;
                const remaining = sellingPosition.shares - numSold;

                return (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-amber-950/30 border border-amber-500/40 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-sans font-bold">
                      <Coins className="w-4 h-4" />
                      <span>{isHe ? 'תוצאת המימוש ונעילת הרווח/הפסד (בניכוי מחיר פעולה):' : 'Realization Outcome Preview (Net of Action Fee):'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">{isHe ? 'תקבול נטו לחשבון' : 'Net Cash In'}</span>
                        <span className="font-bold text-white text-sm">${netCashIn.toFixed(2)}</span>
                        <span className="text-[9px] text-slate-500 block font-sans">
                          {isHe ? 'ברוטו ' : 'gross '}${grossCashIn.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">{isHe ? 'רווח/הפסד נטו ממומש' : 'Realized P&L'}</span>
                        <span className={`font-bold text-sm ${realizedGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {realizedGain >= 0 ? '+' : ''}${realizedGain.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-sans">
                          {isHe ? 'כולל עמלות' : 'net of fees'}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">{isHe ? 'תשואת העסקה' : 'Return %'}</span>
                        <span className={`font-bold text-sm ${realizedGainPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {realizedGainPct >= 0 ? '+' : ''}{realizedGainPct.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Action Fee deduction tag */}
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 font-sans flex items-center gap-1">
                        <span>{isHe ? 'מחיר פעולת מכירה (מעודכן מהיום):' : 'Sale Action Fee (Updated):'}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {isHe ? '$7.00 קבוע לפעולה' : '$7.00 flat fee'}
                        </span>
                      </span>
                      <span className="font-bold text-rose-400">-${ACTION_FEE_USD.toFixed(2)}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-sans pt-1 flex items-center justify-between">
                      <span>{isHe ? 'יתרת מניות שתישאר בתיק:' : 'Remaining Shares in Portfolio:'}</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {remaining <= 0.0001 ? (isHe ? '0 (סגירה מלאה)' : '0 (Position Closed)') : `${remaining.toFixed(2)} מניות`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSellingPosition(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer font-sans"
                >
                  {isHe ? 'ביטול' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition shadow cursor-pointer font-sans"
                >
                  {isHe ? 'אשר מימוש ומכירה' : 'Confirm Sale & Realize P&L'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 6: REALIZED TRADES JOURNAL (יומן מימושים ועסקאות סגורות)
      ───────────────────────────────────────────────────────────── */}
      {showRealizedLogModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
          onClick={() => setShowRealizedLogModal(false)}
        >
          <div
            className="bg-slate-900 border border-indigo-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-4xl w-full shadow-2xl space-y-4 my-auto animate-scaleUp font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {isHe ? 'יומן מימושים ועסקאות סגורות (Realized Transactions Journal)' : 'Realized Transactions Journal'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isHe ? 'תיעוד היסטורי של מניות שנמכרו, רווחים/הפסדים שננעלו בפועל ותקבולי מזומן' : 'Historical record of closed trades, locked gains/losses, and cash proceeds'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRealizedLogModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Summary Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono">{isHe ? 'סך רווח/הפסד ממומש:' : 'Total Realized P&L:'}</span>
                <div className={`text-2xl font-extrabold font-mono ${realizedSummary.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {realizedSummary.totalGain >= 0 ? '+' : ''}${realizedSummary.totalGain.toFixed(2)}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono">{isHe ? 'כמות עסקאות שבוצעו:' : 'Total Trades Count:'}</span>
                <div className="text-2xl font-extrabold font-mono text-white">
                  {realizedTransactions.length}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono">{isHe ? 'עסקאות ברווח / הפסד:' : 'Profitable vs Losing:'}</span>
                <div className="text-sm font-bold font-mono text-slate-200 flex items-center gap-2 mt-1">
                  <span className="text-emerald-400">{realizedTransactions.filter((t) => t.realizedPnL >= 0).length} ירוקות</span>
                  <span>/</span>
                  <span className="text-rose-400">{realizedTransactions.filter((t) => t.realizedPnL < 0).length} אדומות</span>
                </div>
              </div>
            </div>

            {/* Table of Realized Trades */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[380px] overflow-y-auto">
              <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">{isHe ? 'תאריך' : 'Date'}</th>
                    <th className="py-2.5 px-3">{isHe ? 'מניה' : 'Ticker'}</th>
                    <th className="py-2.5 px-3 text-center">{isHe ? 'מניות שנמכרו' : 'Shares'}</th>
                    <th className="py-2.5 px-3 text-center">{isHe ? 'מחיר קנייה ממוצע' : 'Avg Cost'}</th>
                    <th className="py-2.5 px-3 text-center">{isHe ? 'מחיר מכירה' : 'Sell Price'}</th>
                    <th className="py-2.5 px-3 text-center">{isHe ? 'רווח/הפסד ממומש' : 'Realized P&L'}</th>
                    <th className="py-2.5 px-3">{isHe ? 'הערות' : 'Notes'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {realizedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 font-sans">
                        {isHe ? 'טרם בוצעו עסקאות מימוש. לחץ על כפתור "מימוש" ליד כל מניה בטבלה כדי למכור מניות.' : 'No realized trades logged yet. Click "Sell" on any portfolio row to realize gains/losses.'}
                      </td>
                    </tr>
                  ) : (
                    realizedTransactions.map((tx) => {
                      const isGain = tx.realizedPnL >= 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {tx.saleDate}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-cyan-300">
                            {tx.ticker}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-200">
                            {tx.sharesSold}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-400">
                            ${tx.avgBuyPrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-white">
                            ${tx.sellPrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isGain ? '+' : ''}${tx.realizedPnL.toFixed(2)}
                            </span>
                            <span className={`text-[10px] block ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ({isGain ? '+' : ''}{tx.realizedPnLPct.toFixed(1)}%)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px] truncate max-w-[160px]">
                            {tx.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              {realizedTransactions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(isHe ? 'האם אתה בטוח שברצונך לנקות את היסטוריית המימושים?' : 'Clear realized transaction history?')) {
                      setRealizedTransactions([]);
                      showToast(isHe ? 'היסטוריית המימושים נוקתה.' : 'Realized trade history cleared.', 'info');
                    }
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  {isHe ? 'נקה היסטוריית מימושים' : 'Clear history'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowRealizedLogModal(false)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer text-xs ml-auto"
              >
                {isHe ? 'סגור' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 7: HOLDING RISK ALERT & ACTION PLAN DETAILS
      ───────────────────────────────────────────────────────────── */}
      {selectedAlertHolding && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedAlertHolding(null)}
        >
          <div
            className={`bg-slate-900 border rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 my-auto animate-scaleUp font-sans ${
              selectedAlertHolding.severity === 'CRITICAL'
                ? 'border-rose-500/60'
                : selectedAlertHolding.severity === 'WARNING'
                ? 'border-amber-500/60'
                : selectedAlertHolding.severity === 'OPPORTUNITY'
                ? 'border-emerald-500/60'
                : 'border-cyan-500/60'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  selectedAlertHolding.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : selectedAlertHolding.severity === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : selectedAlertHolding.severity === 'OPPORTUNITY'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {selectedAlertHolding.severity === 'CRITICAL' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  ) : selectedAlertHolding.severity === 'WARNING' ? (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  ) : selectedAlertHolding.severity === 'OPPORTUNITY' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Activity className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:lg font-bold text-white font-mono">
                      {selectedAlertHolding.ticker}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      selectedAlertHolding.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : selectedAlertHolding.severity === 'WARNING'
                        ? 'bg-amber-600 text-slate-950'
                        : selectedAlertHolding.severity === 'OPPORTUNITY'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-600 text-white'
                    }`}>
                      {selectedAlertHolding.badgeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate max-w-[280px]">
                    {selectedAlertHolding.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertHolding(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Alert Title & Summary */}
            <div className={`p-3.5 border rounded-xl space-y-2 ${
              selectedAlertHolding.severity === 'CRITICAL'
                ? 'bg-rose-950/40 border-rose-500/40'
                : selectedAlertHolding.severity === 'WARNING'
                ? 'bg-amber-950/40 border-amber-500/40'
                : selectedAlertHolding.severity === 'OPPORTUNITY'
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-cyan-950/40 border-cyan-500/40'
            }`}>
              <h4 className={`text-sm font-bold ${
                selectedAlertHolding.severity === 'CRITICAL'
                  ? 'text-rose-200'
                  : selectedAlertHolding.severity === 'WARNING'
                  ? 'text-amber-200'
                  : selectedAlertHolding.severity === 'OPPORTUNITY'
                  ? 'text-emerald-200'
                  : 'text-cyan-200'
              }`}>
                {selectedAlertHolding.title}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedAlertHolding.summary}
              </p>
            </div>

            {/* Game Plan & Impact */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isHe ? 'תוכנית פעולה מוסדית לפתיחת המסחר:' : 'Opening Bell Game Plan:'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {selectedAlertHolding.openingBellPlan}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isHe ? 'השפעה על היתרון התחרותי והחפיר הכלכלי (Moat):' : 'Economic Moat Impact:'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {selectedAlertHolding.impactOnMoat}
                </p>
              </div>
            </div>

            {/* Actions for this Holding */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  const event = new CustomEvent('navigate-tab', { detail: 'premarket' });
                  window.dispatchEvent(event);
                  setSelectedAlertHolding(null);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>{isHe ? 'צפה בחדשות טרום-מסחר' : 'Premarket Feed'}</span>
              </button>

              <div className="flex items-center gap-2">
                {(() => {
                  const targetPos = calculatedPositions.find((p) => p.ticker.toUpperCase() === selectedAlertHolding.ticker.toUpperCase());
                  if (!targetPos) return null;
                  return (
                    <>
                      <button
                        onClick={() => {
                          setSelectedAlertHolding(null);
                          handleOpenBuyMore(targetPos);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isHe ? 'קנה שוב / חזק' : 'Buy More'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAlertHolding(null);
                          handleOpenSell(targetPos);
                        }}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{isHe ? 'מימוש / מכור' : 'Sell / Trim'}</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fadeIn text-xs font-sans max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 border-emerald-500 text-emerald-300'
              : toastMessage.type === 'warning'
              ? 'bg-slate-900 border-amber-500 text-amber-300'
              : 'bg-slate-900 border-cyan-500 text-cyan-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="font-semibold leading-relaxed">{toastMessage.text}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer ml-auto shrink-0"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};
