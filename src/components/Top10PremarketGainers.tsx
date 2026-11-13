import React, { useState, useMemo } from 'react';
import { ResearchStock, TopPremarketGainer, PremarketMoveVerdict, DetectionStage } from '../types';
import { TOP_10_PREMARKET_GAINERS, getPremarketGainersStats, PREMARKET_QUANT_METRICS } from '../data/premarketGainersData';
import { StockLogoBadge } from './StockLogoBadge';
import { getResearchStock } from '../data/researchStockGenerator';
import { SupportedLanguage } from '../i18n';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Zap,
  Info,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Activity,
  Layers,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
  Timer,
  BarChart2,
  Scale,
  Sparkles,
  Lock,
} from 'lucide-react';

interface Top10PremarketGainersProps {
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive?: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount?: number }>;
}

type FilterStage = 'ALL' | 'CONFIRMED' | 'EARLY' | 'TRAP' | 'NEWS_ONLY';

export const Top10PremarketGainers: React.FC<Top10PremarketGainersProps> = ({
  onSelectStock,
  onOpenDeepDive,
  currentLang = 'he',
  livePrices = {},
}) => {
  const isHe = currentLang === 'he';

  const [gainersList] = useState<TopPremarketGainer[]>(TOP_10_PREMARKET_GAINERS);
  const [filterStage, setFilterStage] = useState<FilterStage>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showArchDetails, setShowArchDetails] = useState<boolean>(false);

  const stats = useMemo(() => getPremarketGainersStats(gainersList), [gainersList]);

  // Filtered and live-sorted list
  const filteredGainers = useMemo(() => {
    let result = gainersList.map((g) => {
      const live = livePrices[g.ticker];
      if (live && typeof live.price === 'number') {
        return {
          ...g,
          preMarketPrice: live.price,
          changePercent: typeof live.changePercent === 'number' ? live.changePercent : g.changePercent,
          changeAmount: typeof live.changeAmount === 'number' ? live.changeAmount : g.changeAmount,
        };
      }
      return g;
    });

    if (filterStage === 'CONFIRMED') {
      result = result.filter((g) => g.detectionStage === 'CONFIRMED_BREAKOUT');
    } else if (filterStage === 'EARLY') {
      result = result.filter((g) => g.detectionStage === 'EARLY_SIGNAL');
    } else if (filterStage === 'TRAP') {
      result = result.filter((g) => g.detectionStage === 'TRAP_DETECTED' || g.verdict === 'NO_NEWS_FAKE_PUMP');
    } else if (filterStage === 'NEWS_ONLY') {
      result = result.filter((g) => g.hasRealNews);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.ticker.toLowerCase().includes(q) ||
          g.companyName.toLowerCase().includes(q) ||
          g.sector.toLowerCase().includes(q) ||
          g.headlineHe.toLowerCase().includes(q) ||
          g.whyItMovedHe.toLowerCase().includes(q)
      );
    }

    // Dynamic sort by highest live changePercent so rankings remain live
    result.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));

    return result;
  }, [gainersList, filterStage, searchQuery, livePrices]);

  const toggleExpand = (ticker: string) => {
    setExpandedId((prev) => (prev === ticker ? null : ticker));
  };

  const handleStockClick = (ticker: string) => {
    const stock = getResearchStock(ticker);
    if (stock) {
      onSelectStock(stock);
    }
  };

  const handleDeepDiveClick = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation();
    const stock = getResearchStock(ticker);
    if (stock && onOpenDeepDive) {
      onOpenDeepDive(stock);
    } else if (stock) {
      onSelectStock(stock);
    }
  };

  const getStageBadge = (stage: DetectionStage) => {
    switch (stage) {
      case 'CONFIRMED_BREAKOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isHe ? '⚡ פריצה מאומתת' : '⚡ Confirmed Breakout'}</span>
          </span>
        );
      case 'EARLY_SIGNAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHe ? '⏱️ סיגנל מוקדם (במעקב)' : '⏱️ Early Signal'}</span>
          </span>
        );
      case 'TRAP_DETECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isHe ? '🚨 מלכודת נזילות (Fade)' : '🚨 Illiquid Trap'}</span>
          </span>
        );
    }
  };

  const getVerdictBadge = (verdict: PremarketMoveVerdict) => {
    switch (verdict) {
      case 'VERIFIED_NEWS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHe ? '🟢 חדשה מהותית מאומתת' : '🟢 Verified Catalyst'}</span>
          </span>
        );
      case 'SPECULATIVE_MOMENTUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHe ? '🟡 מומנטום ספקולטיבי (רשתות)' : '🟡 Speculative Momentum'}</span>
          </span>
        );
      case 'NO_NEWS_FAKE_PUMP':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{isHe ? '🔴 "סתם עולה" (מלכודת נזילות)' : '🔴 Fake Pump / No News'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fadeIn">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BANNER: v2.0 Quant Pre-Market Engine
      ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-cyan-700/60 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>v2.0 Quant Pre-Market Radar</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isHe ? 'סנכרון שוק חי' : 'Live Sync'} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })} EST</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                {stats.quantMetrics.totalUniverseScanned.toLocaleString()} {isHe ? 'מניות נסרקו ב-Discovery' : 'Stocks Scanned'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>{isHe ? '🔥 10 המניות שעולות הכי הרבה בטרום-מסחר (Top 10)' : 'Top 10 Pre-Market Gainers'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
              {isHe
                ? 'מנוע קוואנט דו-שלבי (Discovery + Monitoring): ניתוח דלי נפח של 5 דקות מול בייסליין, בדיקת אמינות קטליזטורים ע"י LLM ואימות ישיר של SEC 8-K לבידוד עליות אמיתיות ממלכודות נזילות ודעיכה (Fade).'
                : 'Two-stage quant engine (Discovery + Monitoring): 5-minute volume bucket analysis, LLM catalyst scoring, and direct SEC 8-K verification distinguishing real institutional breakouts from illiquid morning traps.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowArchDetails(!showArchDetails)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showArchDetails ? (isHe ? 'הסתר ארכיטקטורה' : 'Hide Pipeline') : (isHe ? 'ארכיטקטורת שני הזרמים' : 'Two-Stream Architecture')}</span>
              {showArchDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Two-Stream Architecture Drawer */}
        {showArchDetails && (
          <div className="bg-slate-950/80 border border-cyan-900/60 rounded-xl p-4 text-xs space-y-3 animate-fadeIn">
            <h4 className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'מפרט ארכיטקטורת זרמי המידע (v2.0 Spec):' : 'Two-Stream Pipeline Architecture:'}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-cyan-400 font-mono font-bold block">1. DISCOVERY (REST)</span>
                <span className="text-white font-bold block">{stats.quantMetrics.providers.discovery}</span>
                <p className="text-[11px] text-slate-400">סריקת שוק מלאה (7,840 מניות) כל 2-3 דקות לקבלת רשימת Top Movers.</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">2. MONITORING (WEBSOCKET)</span>
                <span className="text-white font-bold block">{stats.quantMetrics.providers.monitoring}</span>
                <p className="text-[11px] text-slate-400">האזנה רציפה לשברירי שניות רק עבור 10-15 המועמדות שחצו את הסינון המוקדם.</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-400 font-mono font-bold block">3. SEC EDGAR WIRE</span>
                <span className="text-white font-bold block">{stats.quantMetrics.providers.secEdgar}</span>
                <p className="text-[11px] text-slate-400">אימות מיידי של הגשות 8-K, Form 4 ותשקיפי מדף פעילים (S-3) ישירות מהרגולטור.</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono font-bold block">4. LLM CATALYST SCORER</span>
                <span className="text-white font-bold block">{stats.quantMetrics.providers.llmEngine}</span>
                <p className="text-[11px] text-slate-400">סיווג אוטומטי של דוחות, קליניקה וחוזים מול ספקולציה ורעש רשתות.</p>
              </div>
            </div>
          </div>
        )}

        {/* Quant Success Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-950/70 border border-emerald-500/40 rounded-xl p-3 space-y-0.5">
            <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold block">
              {isHe ? 'המרה: סיגנל מוקדם ➔ פריצה' : 'Signal ➔ Breakout'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              {stats.quantMetrics.earlySignalToBreakoutRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {isHe ? 'שיעור המרה מאומת' : 'Validated conversion rate'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-rose-500/40 rounded-xl p-3 space-y-0.5">
            <span className="text-[10px] text-rose-400 font-mono uppercase font-bold block">
              {isHe ? 'קריסת מלכודות בפתיחה (Fade)' : 'Trap Fade Rate'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {stats.quantMetrics.averageFadeRateOnThinTraps}%
            </div>
            <span className="text-[10px] text-slate-400">
              {isHe ? 'מניות ללא חדשות שמחקו רווח' : 'Traps faded at open'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-cyan-500/40 rounded-xl p-3 space-y-0.5">
            <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold block">
              {isHe ? 'דיוק זיהוי חדשות שווא' : 'False Catalyst Accuracy'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
              {stats.quantMetrics.falseCatalystDetectionRate}%
            </div>
            <span className="text-[10px] text-slate-400">
              {isHe ? 'מניעת כניסה במלכודות' : 'False catalyst filtering'}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-indigo-500/40 rounded-xl p-3 space-y-0.5">
            <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold block">
              {isHe ? 'מועמדות במעקב עומק חי' : 'Depth WebSocket'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
              {stats.quantMetrics.activeCandidatesTracked} / 10
            </div>
            <span className="text-[10px] text-slate-400">
              {isHe ? 'ערוץ WebSocket רציף' : 'Live stream active'}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SEARCH TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterStage('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterStage === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-mono font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            {isHe ? 'כל 10 העולות' : 'All Top 10'} ({gainersList.length})
          </button>

          <button
            onClick={() => setFilterStage('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterStage === 'CONFIRMED'
                ? 'bg-emerald-600 text-white font-mono font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>{isHe ? 'פריצות מאומתות' : 'Confirmed Breakouts'}</span>
          </button>

          <button
            onClick={() => setFilterStage('EARLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterStage === 'EARLY'
                ? 'bg-amber-600 text-white font-mono font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Timer className="w-3 h-3 text-amber-400" />
            <span>{isHe ? 'סיגנלים מוקדמים' : 'Early Signals'}</span>
          </button>

          <button
            onClick={() => setFilterStage('TRAP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterStage === 'TRAP'
                ? 'bg-rose-600 text-white font-mono font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>{isHe ? 'מלכודות נזילות ("סתם עולה")' : 'Traps / Fake Pumps'}</span>
          </button>

          <button
            onClick={() => setFilterStage('NEWS_ONLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              filterStage === 'NEWS_ONLY'
                ? 'bg-indigo-600 text-white font-mono font-bold shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            <span>{isHe ? 'חדשות מאומתות בלבד' : 'Verified News Only'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHe ? 'חיפוש טיקר או סיבה...' : 'Filter ticker or cause...'}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TOP 10 GAINERS CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredGainers.map((item) => {
          const isExpanded = expandedId === item.ticker;
          const isBreakout = item.detectionStage === 'CONFIRMED_BREAKOUT';
          const isTrap = item.detectionStage === 'TRAP_DETECTED' || item.verdict === 'NO_NEWS_FAKE_PUMP';

          return (
            <div
              key={item.ticker}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isTrap
                  ? 'bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 border-rose-500/50 hover:border-rose-400'
                  : isBreakout
                  ? 'bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-900 border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Bar of the Card */}
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <span
                      className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center shrink-0 ${
                        item.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 ring-2 ring-amber-300'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-950 shadow-md ring-1 ring-white/50'
                          : item.rank === 3
                          ? 'bg-amber-700 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      #{item.rank}
                    </span>

                    {/* Stock Logo & Ticker */}
                    <div
                      onClick={() => handleStockClick(item.ticker)}
                      className="cursor-pointer group flex items-center gap-2.5"
                    >
                      <StockLogoBadge ticker={item.ticker} name={item.companyName} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-white group-hover:text-cyan-300 transition font-mono flex items-center gap-1">
                            <span>{item.ticker}</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-[280px]">
                            {item.companyName}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans block">{item.sector}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Metrics Row */}
                  <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                    {getStageBadge(item.detectionStage)}
                    {getVerdictBadge(item.verdict)}

                    {/* Price and Gain */}
                    {(() => {
                      const live = livePrices[item.ticker];
                      const currentPrice = live?.price || item.preMarketPrice;
                      const currentChange = live?.changePercent ?? item.changePercent;
                      return (
                        <div className="text-right pl-2">
                          <div className={`text-lg sm:text-xl font-black font-mono ${currentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {currentChange >= 0 ? `+${currentChange.toFixed(1)}%` : `${currentChange.toFixed(1)}%`}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ${currentPrice.toFixed(2)}{' '}
                            <span className="text-slate-500 line-through">${item.previousClose.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 5-Minute Volume Bucket & Quant Signals Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isHe ? 'דלי 5 דקות נוכחי:' : '5-Min Bucket Vol:'}</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <BarChart2 className="w-3 h-3 text-cyan-400" />
                      <span>{item.fiveMinBucket.currentBucketVolume}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({item.fiveMinBucket.bucketRvolMultiplier}x בייסליין)</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">{isHe ? 'מחזור טרום-מסחר כולל:' : 'Total PM Vol:'}</span>
                    <span className="font-bold text-white">
                      {item.preMarketVolume} <span className="text-[10px] text-slate-400">({item.relativeVolume}x RVOL)</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">{isHe ? 'סיכוי דעיכה (Fade):' : 'Fade Probability:'}</span>
                    <span
                      className={`font-black ${
                        item.fadeProbabilityPct >= 70 ? 'text-rose-400' : item.fadeProbabilityPct <= 20 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {item.fadeProbabilityPct}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">{isHe ? 'סיכון הנפקת מדף (S-3):' : 'Shelf Offering Risk:'}</span>
                    <span
                      className={`font-bold text-[11px] ${
                        item.llmEvaluation.shelfOfferingRisk === 'HIGH_IMMINENT'
                          ? 'text-rose-400'
                          : item.llmEvaluation.shelfOfferingRisk === 'LOW_NONE'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.llmEvaluation.shelfOfferingRisk === 'HIGH_IMMINENT'
                        ? (isHe ? '⚠️ סיכון דילול גבוה' : 'High Imminent Risk')
                        : item.llmEvaluation.shelfOfferingRisk === 'LOW_NONE'
                        ? (isHe ? '✅ ללא סיכון דילול' : 'Low / No Risk')
                        : (isHe ? 'בינוני' : 'Moderate')}
                    </span>
                  </div>
                </div>

                {/* Primary Headline */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {isHe ? item.headlineHe : item.headlineEn}
                  </h3>
                </div>

                {/* The Two Key Answer Boxes: Why it moved vs Is there real news */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Box 1: Why it moved */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isHe ? '🔍 מדוע המניה עלתה?' : 'Why did the stock move?'}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isHe ? item.whyItMovedHe : item.whyItMovedEn}
                    </p>
                  </div>

                  {/* Box 2: Is there verified news or "סתם עולה" */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      isTrap
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : item.hasRealNews
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        {isTrap ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        ) : item.hasRealNews ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{isHe ? '📢 האם יש חדשה מאומתת או שזה "סתם עולה"?' : 'Verified News or Fake Pump?'}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                        {isHe ? `ציון אמינות: ${item.authenticityScore}/100` : `Authenticity: ${item.authenticityScore}/100`}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {isHe ? item.hasNewsExplanationHe : item.hasNewsExplanationEn}
                    </p>
                    {item.sourceCiting && (
                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-white/10">
                        {isHe ? 'מקור בדיקה:' : 'Source Citing:'} <strong>{item.sourceCiting}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* LLM Catalyst Scorer Reasoning Box */}
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">
                        {isHe ? 'סיווג קטליזטור מודל AI (LLM Scorer):' : 'AI Catalyst Classifier:'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ציון קטליזטור משוקלל: <strong className="text-indigo-300">{item.llmEvaluation.score}/100</strong>
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {item.llmEvaluation.llmReasoningHe}
                    </p>
                  </div>
                </div>

                {/* Trader Advice & Action Guidance */}
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300">
                      <strong>{isHe ? 'המלצת מסחר לפתיחה:' : 'Opening Bell Advice:'}</strong>{' '}
                      {isHe ? item.traderAdviceHe : item.traderAdviceEn}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isHe ? 'מעקב שוק טרום-מסחר בארה"ב • סיווג קוואנט v2.0' : 'US Pre-Market Live Feed • Quant v2.0'}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Open Full Stock Details Modal */}
                    <button
                      onClick={() => handleStockClick(item.ticker)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      title={isHe ? 'פתח מידע מלא, DCF והערכות אנליסטים' : 'Open full stock details and analyst valuations'}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isHe ? 'פתח מידע מניה מלא' : 'Full Stock Details'}</span>
                    </button>

                    {/* Open Deep Dive */}
                    {onOpenDeepDive && (
                      <button
                        onClick={(e) => handleDeepDiveClick(e, item.ticker)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        title={isHe ? 'תחקיר עומק מוסדי' : 'Institutional Deep Dive'}
                      >
                        <span>{isHe ? 'תחקיר מעמיק' : 'Deep Dive'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. REGULATORY & COMPLIANCE DISCLAIMER BOX (v2.0 requirement)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Scale className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{isHe ? 'גילוי נאות משפטי ומגבלות מסחר בטרום-מסחר (Regulatory & Legal Disclaimers):' : 'Legal & Trading Disclaimers:'}</span>
        </div>
        <p className="leading-relaxed">
          {isHe
            ? '1. מודול זה מיועד למחקר ולניתוח כמותי (Quant Testing) ואינו מהווה ייעוץ השקעות, המלצה לביצוע פעולה בניירות ערך או שידול לקנייה/מכירה.'
            : '1. This module is intended for quantitative testing and informational research only and does not constitute financial advice.'}
        </p>
        <p className="leading-relaxed">
          {isHe
            ? '2. מסחר בשעות טרום-המסחר (04:00–09:30 EST) מאופיין בנזילות דלה, מרווחי קנייה-מכירה (Bid-Ask Spreads) רחבים ותנודתיות גבוהה. מרבית העליות ללא קטליזטור רגולטורי נוטות לדעיכה (Fade) עם פתיחת המסחר הרציף.'
            : '2. Pre-market trading carries elevated execution risks, wide spreads, and illiquid books. A majority of uncataloged pre-market gap-ups fade at market open.'}
        </p>
        <p className="leading-relaxed text-amber-300/90 font-mono text-[11px] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isHe
              ? '3. תזכורת חוק ניירות ערך: הנתונים מבוססים על מידע ציבורי גלוי בלבד (SEC Filings, PR). חל איסור מוחלט על סחר או הפצת מידע פנים (Material Non-Public Information).'
              : '3. Compliance notice: Systems operate strictly on public filings. Trading on Material Non-Public Information (MNPI) is illegal.'}
          </span>
        </p>
      </div>
    </div>
  );
};
