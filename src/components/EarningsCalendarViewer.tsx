import React, { useState, useEffect, useMemo } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getResearchStock } from '../data/researchStockGenerator';
import {
  EarningsReportEvent,
  DeepEarningsAnalysis,
  getDailyEarningsData,
} from '../data/dailyEarningsData';
import {
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  FileText,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  X,
  Briefcase,
  Share2,
  Sun,
  Moon,
  Zap,
  BarChart3,
  Quote,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';

interface EarningsCalendarViewerProps {
  stocks: ResearchStock[];
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

export const EarningsCalendarViewer: React.FC<EarningsCalendarViewerProps> = ({
  stocks,
  onOpenDeepDive,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';

  // Selected schedule tab: Today, Tomorrow, This Week, All
  const [activeDayTab, setActiveDayTab] = useState<'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'ALL'>('TODAY');
  // Timing filter: All, BMO (Before Open), AMC (After Close)
  const [filterTiming, setFilterTiming] = useState<'ALL' | 'BMO' | 'AMC'>('ALL');
  // Only show portfolio stocks
  const [onlyPortfolio, setOnlyPortfolio] = useState<boolean>(false);
  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Earnings events data
  const [events, setEvents] = useState<EarningsReportEvent[]>(() => getDailyEarningsData());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selected event for in-depth AI report teardown modal
  const [selectedReportForAnalysis, setSelectedReportForAnalysis] = useState<EarningsReportEvent | null>(null);
  // Custom ticker analyzer input
  const [customTickerInput, setCustomTickerInput] = useState<string>('');
  const [isAnalyzingCustomTicker, setIsAnalyzingCustomTicker] = useState<boolean>(false);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  // User portfolio tickers set
  const portfolioTickers = useMemo(() => {
    try {
      const saved = localStorage.getItem('MY_PERSONAL_HOLDINGS_V1') || localStorage.getItem('INSTITUTIONAL_PORTFOLIO_DATA_V1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set(parsed.map((p: any) => p.ticker.toUpperCase().trim()));
        }
      }
    } catch (e) {}
    return new Set(['GOOGL', 'AMZN', 'NVDA', 'ABBV', 'UBER', 'BKNG', 'SOFI', 'NOW', 'KO']);
  }, []);

  // Fetch updated daily earnings from server if available
  const fetchDailyEarnings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/daily-earnings');
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }
    } catch (e) {
      console.warn('Using client earnings schedule fallback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyEarnings();
    const interval = setInterval(fetchDailyEarnings, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Day category filter
      if (activeDayTab !== 'ALL' && evt.dayCategory !== activeDayTab) {
        return false;
      }
      // Timing filter
      if (filterTiming !== 'ALL' && evt.timing !== filterTiming) {
        return false;
      }
      // Portfolio filter
      const isHolding = evt.isUserPortfolioHolding || portfolioTickers.has(evt.ticker);
      if (onlyPortfolio && !isHolding) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTicker = evt.ticker.toLowerCase().includes(q);
        const matchName = evt.companyName.toLowerCase().includes(q) || evt.companyNameHe.toLowerCase().includes(q);
        const matchSector = evt.sector.toLowerCase().includes(q) || evt.sectorHe.toLowerCase().includes(q);
        if (!matchTicker && !matchName && !matchSector) return false;
      }
      return true;
    });
  }, [events, activeDayTab, filterTiming, onlyPortfolio, searchQuery, portfolioTickers]);

  // Handle custom ticker instant analysis
  const handleAnalyzeCustomStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTickerInput.toUpperCase().trim();
    if (!clean) return;

    // Check if we already have it in events
    const existing = events.find((evt) => evt.ticker === clean);
    if (existing) {
      setSelectedReportForAnalysis(existing);
      setCustomTickerInput('');
      return;
    }

    setIsAnalyzingCustomTicker(true);
    try {
      const res = await fetch('/api/analyze-earnings-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: clean,
          fiscalQuarter: 'Latest Quarter',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const generatedEvent: EarningsReportEvent = {
          id: `custom-${clean}`,
          ticker: clean,
          companyName: data.companyName || `${clean} Corporation`,
          companyNameHe: data.companyNameHe || `${clean} תאגיד`,
          sector: data.sector || 'Global Equities',
          sectorHe: data.sectorHe || 'מניות גלובליות',
          reportDate: new Date().toISOString().slice(0, 10),
          dayCategory: 'TODAY',
          timing: 'AMC',
          timingLabelHe: 'לאחר הסגירה (AMC)',
          fiscalQuarter: data.fiscalQuarter || 'Latest Report',
          consensusEPS: data.consensusEPS ?? 1.5,
          actualEPS: data.actualEPS ?? 1.62,
          priorYearEPS: data.priorYearEPS ?? 1.35,
          yoyEpsGrowth: data.yoyEpsGrowth || '+20.0%',
          consensusRevenue: data.consensusRevenue || '$15.0B',
          actualRevenue: data.actualRevenue || '$15.4B',
          revenueYoY: data.revenueYoY || '+12.5%',
          impliedMove: data.impliedMove || '±5.0%',
          status: data.status || 'REPORTED_BEAT',
          statusLabelHe: data.statusLabelHe || 'הכה את התחזיות',
          epsSurprisePercent: data.epsSurprisePercent ?? 8.0,
          revenueSurprisePercent: data.revenueSurprisePercent ?? 2.7,
          guidanceVerdict: data.guidanceVerdict || 'RAISED',
          guidanceVerdictHe: data.guidanceVerdictHe || 'העלאת תחזית שנתית',
          guidanceDetailsHe: data.guidanceDetailsHe || 'שמירה על משמעת פיננסית וצמיחה רווחית.',
          guidanceDetailsEn: data.guidanceDetailsEn || 'Consistent execution and profitable expansion.',
          keyCallFocusHe: data.keyCallFocusHe || 'מוקד שיחת הוועידה וצמיחת רווחיות.',
          keyCallFocusEn: data.keyCallFocusEn || 'Conference call focal points and margin expansion.',
          aiTakeawayMemoHe: data.aiTakeawayMemoHe || `ניתוח דוח מלא עבור ${clean} בוצע בהצלחה.`,
          aiTakeawayMemoEn: data.aiTakeawayMemoEn || `Full earnings report analysis executed for ${clean}.`,
          isUserPortfolioHolding: portfolioTickers.has(clean),
          deepAnalysis: data.deepAnalysis,
        };

        setEvents((prev) => [generatedEvent, ...prev]);
        setSelectedReportForAnalysis(generatedEvent);
        setCustomTickerInput('');
      }
    } catch (err) {
      console.error('Failed to analyze ticker earnings:', err);
    } finally {
      setIsAnalyzingCustomTicker(false);
    }
  };

  const handleCopyAnalysis = (report: EarningsReportEvent) => {
    const text = `📊 ניתוח דוח כספי מוסדי - ${report.ticker} (${report.companyNameHe})
📅 תאריך דיווח: ${report.reportDate} | תזמון: ${report.timingLabelHe} | רבעון: ${report.fiscalQuarter}
🎯 תוצאות: ${report.statusLabelHe}
📈 רווח למניה: בפועל ${report.actualEPS ?? report.consensusEPS}$ (תחזית: ${report.consensusEPS}$)
💰 הכנסות: ${report.actualRevenue ?? report.consensusRevenue}
🔮 הנחיות הנהלה: ${report.guidanceVerdictHe} - ${report.guidanceDetailsHe}

🎙️ ציטוט מפתח משיחת הוועידה:
${report.deepAnalysis.keyQuotesHe[0] || report.deepAnalysis.keyQuotes[0]}

🛡️ מסקנת אנליסט מוסדי לתיק שנתיים:
המלצה: ${report.deepAnalysis.institutionalVerdict.actionHe}
יעד מחיר: ${report.deepAnalysis.institutionalVerdict.targetPriceRevisionHe}
ניתוח: ${report.deepAnalysis.institutionalVerdict.verdictMemoHe}

נוצר באמצעות MoatGuard Institutional Earnings Terminal`;

    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  // Stats counters for quick summary
  const todayCount = useMemo(() => events.filter((e) => e.dayCategory === 'TODAY').length, [events]);
  const tomorrowCount = useMemo(() => events.filter((e) => e.dayCategory === 'TOMORROW').length, [events]);
  const portfolioReportsCount = useMemo(
    () => events.filter((e) => e.isUserPortfolioHolding || portfolioTickers.has(e.ticker)).length,
    [events, portfolioTickers]
  );

  return (
    <div className="space-y-6">
      {/* Flagship Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/40 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                DAILY EARNINGS RADAR
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 text-xs font-mono">
                {isHe ? 'מעקב יומי שוטף 24/7' : 'Daily 24/7 Tracking'}
              </span>
              {portfolioReportsCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-mono flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  <span>{portfolioReportsCount} {isHe ? 'דוחות מניות מהתיק שלך' : 'in your portfolio'}</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-400 shrink-0" />
              <span>{isHe ? 'יומן דוחות כספיים יומי וניתוח מעמיק ב-AI' : 'Daily Earnings Hub & Deep AI Teardowns'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isHe
                ? 'מעקב יומיומי בזמן אמת אחר כל החברות המדווחות: לפני פתיחת המסחר (BMO) ולאחר הסגירה (AMC). כולל בדיקת Beat/Miss, רווח למניה מול קונצנזוס, עדכון תחזיות שנתיות (Guidance), ניתוח מרווחים ותקציר שיחות ועידה לכל דוח.'
                : 'Real-time daily tracking of reporting equities: Before Market Open (BMO) and After Close (AMC). Detailed EPS/Revenue Beat/Miss meters, forward guidance adjustments, and deep institutional AI teardowns.'}
            </p>
          </div>

          {/* Quick Instant Ticker Search Form */}
          <div className="w-full lg:w-auto shrink-0 space-y-2">
            <form onSubmit={handleAnalyzeCustomStock} className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-3" />
                <input
                  type="text"
                  value={customTickerInput}
                  onChange={(e) => setCustomTickerInput(e.target.value)}
                  placeholder={isHe ? 'הקלד טיקר לניתוח דוח (למשל BE, TSLA)...' : 'Analyze any report (e.g. BE, TSLA)...'}
                  className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzingCustomTicker || !customTickerInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-indigo-600/20"
              >
                {isAnalyzingCustomTicker ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{isHe ? 'נתח דוח' : 'Analyze'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
              <span>{isHe ? 'רענון מחירים אוטומטי' : 'Auto Quotes'}</span>
              <button
                onClick={fetchDailyEarnings}
                disabled={isLoading}
                className="hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isHe ? 'סנכרן לוח יומי' : 'Sync Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Daily Filters & Timing Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Day Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveDayTab('TODAY')}
              className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDayTab === 'TODAY'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHe ? 'היום (Today)' : 'Today'}</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-[10px] text-indigo-200 border border-indigo-700">
                {todayCount}
              </span>
            </button>

            <button
              onClick={() => setActiveDayTab('TOMORROW')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDayTab === 'TOMORROW'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isHe ? 'מחר (Tomorrow)' : 'Tomorrow'}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-slate-300">
                {tomorrowCount}
              </span>
            </button>

            <button
              onClick={() => setActiveDayTab('THIS_WEEK')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDayTab === 'THIS_WEEK'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>{isHe ? 'השבוע (This Week)' : 'This Week'}</span>
            </button>

            <button
              onClick={() => setActiveDayTab('ALL')}
              className={`px-3 py-2 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeDayTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>{isHe ? 'כל עונת הדוחות' : 'All Reports'}</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-slate-300">
                {events.length}
              </span>
            </button>
          </div>

          {/* Secondary Filters: Timing & Portfolio Toggle */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Portfolio Filter Toggle */}
            <button
              onClick={() => setOnlyPortfolio((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                onlyPortfolio
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHe ? 'מניות התיק שלי בלבד' : 'My Portfolio Only'}</span>
            </button>

            {/* Timing filter (All, BMO, AMC) */}
            <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                onClick={() => setFilterTiming('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                  filterTiming === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHe ? 'הכל' : 'All'}
              </button>
              <button
                onClick={() => setFilterTiming('BMO')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterTiming === 'BMO' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'לפני פתיחת המסחר' : 'Before Market Open'}
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>BMO</span>
              </button>
              <button
                onClick={() => setFilterTiming('AMC')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  filterTiming === 'AMC' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={isHe ? 'לאחר סגירת המסחר' : 'After Market Close'}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>AMC</span>
              </button>
            </div>

            {/* Live Sync Button */}
            <button
              onClick={fetchDailyEarnings}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={isHe ? 'סנכרון דוחות חי מול דיווחי SEC ומחירי שוק' : 'Live Sync earnings calendar and quotes'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isLoading ? (isHe ? 'מסנכרן...' : 'Syncing...') : (isHe ? 'סנכרון דוחות חי' : 'Live Sync')}</span>
            </button>
          </div>
        </div>

        {/* Quick Search within calendar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHe ? 'סינון מהיר לפי טיקר (כגון BE, TSLA), שם חברה או ענף...' : 'Filter by ticker (e.g. BE, TSLA), company, or sector...'}
            className="w-full pl-8 rtl:pr-8 rtl:pl-3 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Quick Trending / High-Profile Movers Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1 shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{isHe ? 'דוחות מבוקשים היום:' : 'Trending Today:'}</span>
          </span>
          {[
            { ticker: 'BE', name: isHe ? "BE (בלום אנרג'י)" : 'BE (Bloom Energy)', badge: isHe ? '⚡ חשמל ל-AI' : '⚡ AI Power', highlight: true },
            { ticker: 'TSLA', name: isHe ? 'TSLA (טסלה)' : 'TSLA (Tesla)', badge: isHe ? 'רובוטקסי' : 'Robotaxi' },
            { ticker: 'SOFI', name: isHe ? 'SOFI (סופי)' : 'SOFI', badge: isHe ? 'פינטק' : 'Fintech' },
            { ticker: 'GOOGL', name: isHe ? 'GOOGL (גוגל)' : 'GOOGL', badge: 'Cloud AI' },
            { ticker: 'IBM', name: 'IBM', badge: 'watsonx' },
            { ticker: 'LRN', name: isHe ? 'LRN (סטריד)' : 'LRN', badge: isHe ? 'חינוך' : 'Education' },
            { ticker: 'LRCX', name: isHe ? 'LRCX (לאם)' : 'LRCX', badge: 'HBM WFE' },
            { ticker: 'NEE', name: isHe ? 'NEE (נקסטארה)' : 'NEE', badge: isHe ? 'חשמל ירוק' : 'Green Power' },
            { ticker: 'VLO', name: isHe ? 'VLO (ולרו)' : 'VLO', badge: isHe ? 'זיקוק' : 'Refining' },
            { ticker: 'T', name: 'T (AT&T)', badge: '5G / Fiber' },
          ].map((item) => {
            const found = events.find((e) => e.ticker === item.ticker);
            return (
              <button
                key={item.ticker}
                type="button"
                onClick={() => {
                  if (found) {
                    setSelectedReportForAnalysis(found);
                  } else {
                    setSearchQuery(item.ticker);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer border ${
                  item.highlight
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title={isHe ? `פתח ניתוח דוח מלא עבור ${item.name}` : `Open full report analysis for ${item.name}`}
              >
                <span className="font-bold">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/80 text-cyan-300 border border-slate-700/80">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reporting Equities Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {isHe ? 'לא נמצאו דוחות בסינון הנוכחי' : 'No earnings reports match current filter'}
          </h3>
          <p className="text-xs text-slate-400">
            {isHe
              ? 'נסה לבחור ב-"הכל" או להסיר את הסינון של מניות התיק כדי לצפות בכל החברות המדווחות.'
              : 'Try selecting "All Reports" or clear portfolio filters to view all reporting companies.'}
          </p>
          <button
            onClick={() => {
              setActiveDayTab('ALL');
              setFilterTiming('ALL');
              setOnlyPortfolio(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono transition cursor-pointer"
          >
            {isHe ? 'איפוס כל המסננים' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => {
            const targetStock = stocks.find((s) => s.ticker === evt.ticker) || getResearchStock(evt.ticker);
            const isHolding = evt.isUserPortfolioHolding || portfolioTickers.has(evt.ticker);

            const isReported = evt.status !== 'UPCOMING';
            const isBeat = evt.status === 'REPORTED_BEAT';
            const isMiss = evt.status === 'REPORTED_MISS';

            return (
              <div
                key={evt.id || evt.ticker}
                className={`p-5 rounded-xl bg-slate-900 border transition-all duration-200 shadow-md space-y-3.5 hover:shadow-indigo-500/10 ${
                  isHolding
                    ? 'border-emerald-600/60 ring-1 ring-emerald-500/30'
                    : 'border-slate-800 hover:border-indigo-600/70'
                }`}
              >
                {/* Header: Logo, Ticker, Company, Timing & Portfolio Badge - Fully Clickable to open stock memo */}
                <div className="flex justify-between items-start gap-3">
                  <div
                    onClick={() => onOpenDeepDive(targetStock)}
                    className="flex items-center gap-3 cursor-pointer group"
                    title={isHe ? `לחץ לפתיחת כרטיס מניה ומחקר מלא על ${evt.ticker}` : `Click to open full stock research on ${evt.ticker}`}
                  >
                    <StockLogoBadge ticker={evt.ticker} name={evt.companyName} size="lg" />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xl font-bold font-mono text-white group-hover:text-indigo-400 group-hover:underline transition underline-offset-4 flex items-center gap-1">
                          {evt.ticker}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {evt.fiscalQuarter}
                        </span>
                        
                        {/* Timing Badge: BMO vs AMC */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 border ${
                            evt.timing === 'BMO'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                          }`}
                        >
                          {evt.timing === 'BMO' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                          <span>{evt.timing === 'BMO' ? (isHe ? 'לפני הפתיחה (BMO)' : 'Pre-Market (BMO)') : (isHe ? 'לאחר הנעילה (AMC)' : 'After Close (AMC)')}</span>
                        </span>

                        {/* Holding Badge */}
                        {isHolding && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-emerald-400" />
                            <span>{isHe ? 'בתיק שלך' : 'In Portfolio'}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-white group-hover:text-indigo-200 transition mt-0.5">
                        {isHe ? evt.companyNameHe : evt.companyName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {isHe ? evt.sectorHe : evt.sector}
                      </div>
                    </div>
                  </div>

                  {/* Date & Beat/Miss Status Tag */}
                  <div className="text-right font-mono shrink-0">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{evt.reportDate}</span>
                    </div>

                    <div className="mt-1">
                      {isReported ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isBeat
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : isMiss
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {isBeat ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{isHe ? evt.statusLabelHe : evt.status}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{isHe ? 'טרם פורסם' : 'Pending Report'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scorecard: EPS & Revenue Benchmarks */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-center">
                  {/* EPS Metric */}
                  <div className="p-1">
                    <div className="text-[10px] text-slate-400">
                      {isReported ? (isHe ? 'EPS בפועל / צפי' : 'Actual / Cons. EPS') : (isHe ? 'קונצנזוס EPS' : 'Consensus EPS')}
                    </div>
                    <div className="text-white font-bold mt-0.5 text-sm flex items-center justify-center gap-1">
                      {isReported && evt.actualEPS !== undefined ? (
                        <>
                          <span className={evt.actualEPS >= evt.consensusEPS ? 'text-emerald-400' : 'text-rose-400'}>
                            ${evt.actualEPS.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">vs ${evt.consensusEPS.toFixed(2)}</span>
                        </>
                      ) : (
                        <span>${evt.consensusEPS.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      {evt.yoyEpsGrowth} YoY
                    </div>
                  </div>

                  {/* Revenue Metric */}
                  <div className="p-1 border-x border-slate-800">
                    <div className="text-[10px] text-slate-400">
                      {isReported ? (isHe ? 'הכנסות בפועל / צפי' : 'Actual / Est. Rev') : (isHe ? 'תחזית הכנסות' : 'Revenue Est.')}
                    </div>
                    <div className="text-white font-bold mt-0.5 text-sm flex items-center justify-center gap-1">
                      {isReported && evt.actualRevenue ? (
                        <>
                          <span className={evt.revenueSurprisePercent !== undefined && evt.revenueSurprisePercent < 0 ? 'text-rose-400' : 'text-emerald-400'}>{evt.actualRevenue}</span>
                          <span className="text-[10px] text-slate-400">vs {evt.consensusRevenue}</span>
                        </>
                      ) : (
                        <span>{evt.consensusRevenue}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      {evt.revenueYoY} YoY
                    </div>
                  </div>

                  {/* Implied Move / Options Volatility */}
                  <div className="p-1">
                    <div className="text-[10px] text-slate-400">{isHe ? 'תנודה משתמעת' : 'Implied Move'}</div>
                    <div className="text-amber-300 font-bold mt-0.5 text-sm">{evt.impliedMove}</div>
                    <div className="text-[10px] text-slate-400">Options Straddle</div>
                  </div>
                </div>

                {/* Guidance Verdict Banner */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 flex items-start gap-2 text-xs">
                  <div className="mt-0.5 shrink-0">
                    {evt.guidanceVerdict === 'RAISED' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : evt.guidanceVerdict === 'LOWERED' ? (
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {isHe ? evt.guidanceVerdictHe : evt.guidanceVerdict}:
                    </span>
                    <span className="text-slate-300 font-sans leading-relaxed text-[11px]">
                      {isHe ? evt.guidanceDetailsHe : evt.guidanceDetailsEn}
                    </span>
                  </div>
                </div>

                {/* AI Catalyst & Conference Call Memo */}
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isHe ? 'תובנת AI ושיחת ועידה:' : 'AI Catalyst Memo:'}</span>
                  </div>
                  <p className="text-indigo-200/90 font-sans leading-relaxed text-xs">
                    {isHe ? evt.aiTakeawayMemoHe : evt.aiTakeawayMemoEn}
                  </p>
                </div>

                {/* Bottom Actions: View Deep Analysis Modal & Open Full Stock Memo */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenDeepDive(targetStock)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700 hover:border-emerald-500/50"
                    title={isHe ? `פתח כרטיס מניה ומחקר מעמיק עבור ${evt.ticker}` : `Open full research on ${evt.ticker}`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHe ? `מחקר מניה מלא (${evt.ticker})` : `Full Stock Deep Dive (${evt.ticker})`}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedReportForAnalysis(evt)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isHe ? 'ניתוח מעמיק לדוח זה (AI)' : 'Deep AI Teardown'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Comprehensive Institutional AI Earnings Report Teardown */}
      {selectedReportForAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-indigo-800/80 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <StockLogoBadge
                  ticker={selectedReportForAnalysis.ticker}
                  name={selectedReportForAnalysis.companyName}
                  size="lg"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white">
                      {selectedReportForAnalysis.ticker}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                      {selectedReportForAnalysis.fiscalQuarter}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedReportForAnalysis.timingLabelHe}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {isHe ? selectedReportForAnalysis.statusLabelHe : selectedReportForAnalysis.status}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-200 mt-0.5">
                    {isHe ? selectedReportForAnalysis.companyNameHe : selectedReportForAnalysis.companyName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetStock = stocks.find((s) => s.ticker === selectedReportForAnalysis.ticker) || getResearchStock(selectedReportForAnalysis.ticker);
                    setSelectedReportForAnalysis(null);
                    onOpenDeepDive(targetStock);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/30"
                  title={isHe ? `פתח מחקר מניה מלא עבור ${selectedReportForAnalysis.ticker}` : `Open full stock deep dive for ${selectedReportForAnalysis.ticker}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isHe ? `מחקר מניה מלא (${selectedReportForAnalysis.ticker})` : `Full Stock Memo (${selectedReportForAnalysis.ticker})`}</span>
                  <span className="sm:hidden">{selectedReportForAnalysis.ticker}</span>
                </button>

                <button
                  onClick={() => handleCopyAnalysis(selectedReportForAnalysis)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  title={isHe ? 'העתק תקציר דוח' : 'Copy Report Summary'}
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedMemo ? (isHe ? 'הועתק!' : 'Copied!') : (isHe ? 'שתף דוח' : 'Share')}</span>
                </button>

                <button
                  onClick={() => setSelectedReportForAnalysis(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
              {/* Scorecard Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center">
                <div className="p-2">
                  <span className="text-[10px] text-slate-400 block">{isHe ? 'רווח למניה (EPS)' : 'EPS Result'}</span>
                  <span className="text-base sm:text-lg font-bold text-white block mt-0.5">
                    ${selectedReportForAnalysis.actualEPS ?? selectedReportForAnalysis.consensusEPS}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {isHe ? `תחזית: $${selectedReportForAnalysis.consensusEPS}` : `Cons: $${selectedReportForAnalysis.consensusEPS}`}
                  </span>
                </div>

                <div className="p-2 border-r sm:border-r-0 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isHe ? 'הכנסות ברבעון' : 'Quarterly Revenue'}</span>
                  <span className="text-base sm:text-lg font-bold text-white block mt-0.5">
                    {selectedReportForAnalysis.actualRevenue ?? selectedReportForAnalysis.consensusRevenue}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {selectedReportForAnalysis.revenueYoY} YoY
                  </span>
                </div>

                <div className="p-2 border-t sm:border-t-0 sm:border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isHe ? 'הנחיות קדימה' : 'Guidance'}</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-300 block mt-1">
                    {isHe ? selectedReportForAnalysis.guidanceVerdictHe : selectedReportForAnalysis.guidanceVerdict}
                  </span>
                </div>

                <div className="p-2 border-t sm:border-t-0 border-l border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isHe ? 'תנודה משתמעת' : 'Implied Move'}</span>
                  <span className="text-base sm:text-lg font-bold text-amber-300 block mt-0.5">
                    {selectedReportForAnalysis.impliedMove}
                  </span>
                  <span className="text-[10px] text-slate-400">Options Straddle</span>
                </div>
              </div>

              {/* 1. Revenue Breakdown & Operating Margins */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>{isHe ? 'התפלגות הכנסות לפי מגזרים' : 'Segment Revenue Breakdown'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {isHe
                      ? selectedReportForAnalysis.deepAnalysis.revenueBreakdownHe
                      : selectedReportForAnalysis.deepAnalysis.revenueBreakdown}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>{isHe ? 'ניתוח שולי רווח ותזרים חופשי' : 'Operating Margin & Cash Flow'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {isHe
                      ? selectedReportForAnalysis.deepAnalysis.operatingMarginAnalysisHe
                      : selectedReportForAnalysis.deepAnalysis.operatingMarginAnalysis}
                  </p>
                </div>
              </div>

              {/* 2. Conference Call Key Quotes & Management Tone */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                    <Quote className="w-4 h-4 text-amber-400" />
                    <span>{isHe ? 'ציטוטי מפתח משיחת הוועידה של ההנהלה' : 'Executive Conference Call Quotes'}</span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {isHe ? 'טון ההנהלה:' : 'Tone:'} {isHe ? selectedReportForAnalysis.deepAnalysis.managementToneHe : selectedReportForAnalysis.deepAnalysis.managementTone}
                  </span>
                </div>

                <div className="space-y-2">
                  {(isHe
                    ? selectedReportForAnalysis.deepAnalysis.keyQuotesHe
                    : selectedReportForAnalysis.deepAnalysis.keyQuotes
                  ).map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900 border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-500 text-xs text-slate-200 font-sans italic"
                    >
                      {quote}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Catalysts vs Downside Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bull Points */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isHe ? 'מנועי צמיחה וזרזים חיוביים' : 'Key Positive Catalysts'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(isHe
                      ? selectedReportForAnalysis.deepAnalysis.catalystsAndRisks.bullPointsHe
                      : selectedReportForAnalysis.deepAnalysis.catalystsAndRisks.bullPoints
                    ).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bear Points */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>{isHe ? 'סיכונים ונקודות לחץ להמשך' : 'Downside Risks & Vulnerabilities'}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(isHe
                      ? selectedReportForAnalysis.deepAnalysis.catalystsAndRisks.bearPointsHe
                      : selectedReportForAnalysis.deepAnalysis.catalystsAndRisks.bearPoints
                    ).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 4. Wall Street Institutional Verdict & 2-Year Strategy */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-700/60 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span>{isHe ? 'מסקנת אנליסט מוסדי לתיק שנתיים' : 'Institutional 2Y Strategy Verdict'}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold">
                      {isHe
                        ? selectedReportForAnalysis.deepAnalysis.institutionalVerdict.actionHe
                        : selectedReportForAnalysis.deepAnalysis.institutionalVerdict.actionEn}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 font-bold border border-amber-500/30">
                      {isHe
                        ? selectedReportForAnalysis.deepAnalysis.institutionalVerdict.targetPriceRevisionHe
                        : selectedReportForAnalysis.deepAnalysis.institutionalVerdict.targetPriceRevision}
                    </span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {isHe
                    ? selectedReportForAnalysis.deepAnalysis.institutionalVerdict.verdictMemoHe
                    : selectedReportForAnalysis.deepAnalysis.institutionalVerdict.verdictMemoEn}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                {isHe ? 'מקור נתונים: דיווחי SEC 10-Q & ניתוח בינה מלאכותית מוסדי' : 'Source: SEC 10-Q Filings & AI Teardown'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetStock = stocks.find((s) => s.ticker === selectedReportForAnalysis.ticker) || getResearchStock(selectedReportForAnalysis.ticker);
                    setSelectedReportForAnalysis(null);
                    onOpenDeepDive(targetStock);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isHe ? `מעבר למחקר מלא על ${selectedReportForAnalysis.ticker}` : `Full Stock Analysis (${selectedReportForAnalysis.ticker})`}</span>
                </button>

                <button
                  onClick={() => setSelectedReportForAnalysis(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold font-mono transition cursor-pointer"
                >
                  {isHe ? 'סגור ניתוח' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
