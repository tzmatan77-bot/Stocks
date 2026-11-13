import React, { useState, useMemo } from 'react';
import { ResearchStock } from '../types';
import {
  EARLY_ANALYST_SIGNALS,
  EarlyAnalystSignal,
  SeniorBankName,
  SignalTimingStage,
} from '../data/earlyAnalystSignalsData';
import { StockLogoBadge } from './StockLogoBadge';
import { getResearchStock } from '../data/researchStockGenerator';
import { SupportedLanguage } from '../i18n';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Info,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Briefcase,
  Star,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  Radio,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface EarlyAnalystRadarProps {
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive?: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  livePrices?: Record<string, { price: number; changePercent?: number; changeAmount?: number }>;
}

type BankFilter = 'ALL' | SeniorBankName;
type StageFilter = 'ALL' | SignalTimingStage;
type MessageCategoryFilter = 'ALL' | 'DROP_WARNING' | 'SHARP_RISE' | 'FORECAST_REVISION';
type ViewMode = 'CARDS' | 'TABLE' | 'COMPACT';

export const EarlyAnalystRadar: React.FC<EarlyAnalystRadarProps> = ({
  onSelectStock,
  onOpenDeepDive,
  currentLang = 'he',
  livePrices = {},
}) => {
  const isHe = currentLang === 'he';

  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategoryFilter>('ALL');
  const [selectedBank, setSelectedBank] = useState<BankFilter>('ALL');
  const [selectedStage, setSelectedStage] = useState<StageFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      dropWarnings: EARLY_ANALYST_SIGNALS.filter((s) => s.messageCategory === 'DROP_WARNING').length,
      sharpRises: EARLY_ANALYST_SIGNALS.filter((s) => s.messageCategory === 'SHARP_RISE').length,
      forecastRevisions: EARLY_ANALYST_SIGNALS.filter((s) => s.messageCategory === 'FORECAST_REVISION').length,
    };
  }, []);

  const filteredSignals = useMemo(() => {
    let list = [...EARLY_ANALYST_SIGNALS];

    if (selectedCategory !== 'ALL') {
      list = list.filter((s) => s.messageCategory === selectedCategory);
    }

    if (selectedBank !== 'ALL') {
      list = list.filter((s) => s.bank === selectedBank);
    }

    if (selectedStage !== 'ALL') {
      list = list.filter((s) => s.timingStage === selectedStage);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q) ||
          s.analystName.toLowerCase().includes(q) ||
          s.bankDisplayNameHe.toLowerCase().includes(q) ||
          s.headlineHe.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, selectedBank, selectedStage, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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

  const getCategoryHeaderBadge = (category?: MessageCategoryFilter) => {
    switch (category) {
      case 'DROP_WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-mono font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{isHe ? '🔴 אזהרת ירידה' : '🔴 Drop Alert'}</span>
          </span>
        );
      case 'SHARP_RISE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isHe ? '🟢 עלייה חדה' : '🟢 Sharp Rise'}</span>
          </span>
        );
      case 'FORECAST_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/50 text-xs font-mono font-bold">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHe ? '🔵 שינוי תחזית' : '🔵 Revision'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getStageBadge = (stage: SignalTimingStage) => {
    switch (stage) {
      case 'EARLY_WHISPER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono">
            <Radio className="w-3 h-3 text-indigo-400" />
            <span>{isHe ? 'איתות מקדים (שבוע לפני)' : 'Early Whisper'}</span>
          </span>
        );
      case 'PREMARKET_FLASH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{isHe ? 'טרום-מסחר (בוקר)' : 'Pre-Market Flash'}</span>
          </span>
        );
      case 'DOWNGRADE_ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>{isHe ? 'התראת שינמוך' : 'Downgrade'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 text-slate-100 font-sans animate-fadeIn">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPACT & CLEAN HEADER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-indigo-400" />
              <span>Wall Street Consensus & Early Revisions</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
              {filteredSignals.length} {isHe ? 'מניות מסונכרנות' : 'Stocks Monitored'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>{isHe ? '🏛️ רדאר אנליסטים בכירים: מחירי יעד ושינויי תחזיות' : 'Senior Wall Street Analyst Target Tracker'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHe
              ? 'שדרוגים, הורדות המלצה ורביזיות מחיר של גולדמן זאקס, מורגן סטנלי, סיטי, זקס וג\'יי פי מורגן בזמן אמת.'
              : 'Real-time consensus price targets, target revisions and quantitative Earnings ESP models.'}
          </p>
        </div>

        {/* View Switcher & Guide Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isHe ? 'תצוגת כרטיסים נוחה' : 'Cards view'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHe ? 'כרטיסים' : 'Cards'}</span>
            </button>

            <button
              onClick={() => setViewMode('COMPACT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'COMPACT'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isHe ? 'תצוגה מקוצרת ומהירה' : 'Compact view'}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHe ? 'קומפקטי' : 'Compact'}</span>
            </button>

            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isHe ? 'תצוגת טבלה להשוואה' : 'Table view'}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHe ? 'טבלה' : 'Table'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showGuide ? (isHe ? 'הסתר הסברים' : 'Hide Guide') : (isHe ? 'איך זה עובד?' : 'How It Works')}</span>
            {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Optional Explanatory Drawer */}
      {showGuide && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/90 border border-indigo-900/50 text-xs animate-fadeIn">
          <div className="bg-slate-950/70 border border-indigo-500/30 p-3 rounded-xl space-y-1">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>{isHe ? '1. מודל Zacks Earnings ESP' : '1. Zacks Earnings ESP'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHe
                ? 'משווה את הערכות האנליסטים העדכניות מ-14 הימים האחרונים מול הקונצנזוס הישן. ציון ESP חיובי מעל 3%+ חוזה עקיפת תחזיות בדיוק של מעל 70%.'
                : 'Compares most recent 14-day analyst revisions vs stale consensus. Positive ESP > +3% predicts earnings beat.'}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-cyan-500/30 p-3 rounded-xl space-y-1">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? '2. סיטי: 30-Day Catalyst Watch' : '2. Citi 30-Day Catalyst Watch'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHe
                ? 'התראה מוקדמת של סיטי ללקוחות מוסדיים על שינוי כיוון חיובי או שלילי צפוי לפני כנסי משקיעים או דוחות.'
                : 'Advance institutional alerts on imminent upside/downside catalysts before quarterly releases.'}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-emerald-500/30 p-3 rounded-xl space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{isHe ? '3. פתקי בוקר מוקדמים (05:00-07:30 EST)' : '3. Pre-Bell Flash Notes'}</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {isHe
                ? 'הורדות דירוג והעלאות מחירי יעד של ג\'יי פי מורגן ומורגן סטנלי שמתפרסמות בטרום-מסחר לפני הצלצול בוול סטריט.'
                : 'Tier-1 upgrades and target hikes published in pre-market hours before the opening bell.'}
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. FILTERS & SEARCH TOOLBAR (STREAMLINED)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isHe ? 'הכל' : 'All'} ({EARLY_ANALYST_SIGNALS.length})
            </button>

            <button
              onClick={() => setSelectedCategory('SHARP_RISE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'SHARP_RISE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>{isHe ? 'שדרוגים / עליות' : 'Upgrades / Rises'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/80 text-emerald-200 text-[10px] font-mono">
                {categoryCounts.sharpRises}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('FORECAST_REVISION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'FORECAST_REVISION'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 border border-blue-800/40'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>{isHe ? 'עדכוני תחזית' : 'Revisions'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-900/80 text-blue-200 text-[10px] font-mono">
                {categoryCounts.forecastRevisions}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('DROP_WARNING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'DROP_WARNING'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-800/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{isHe ? 'אזהרות ירידה' : 'Downgrades'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-900/80 text-rose-200 text-[10px] font-mono">
                {categoryCounts.dropWarnings}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHe ? 'חיפוש טיקר, אנליסט, בנק...' : 'Filter ticker, analyst, bank...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bank Chips (Fast Selector) */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] ml-1">{isHe ? 'סנן לפי מוסד:' : 'Filter Bank:'}</span>
          {(['ALL', 'CITI', 'NEEDHAM', 'ZACKS', 'MORGAN_STANLEY', 'JPMORGAN', 'BOFA', 'GOLDMAN_SACHS', 'BERNSTEIN'] as BankFilter[]).map((b) => {
            const labels: Record<string, string> = {
              ALL: isHe ? 'הכל' : 'All',
              CITI: 'סיטי (Citi)',
              NEEDHAM: 'נידהאם (Needham)',
              ZACKS: 'זקס (Zacks)',
              MORGAN_STANLEY: 'מורגן סטנלי (MS)',
              JPMORGAN: "ג'יי פי מורגן (JPM)",
              BOFA: 'בנק אוף אמריקה (BofA)',
              GOLDMAN_SACHS: 'גולדמן זאקס (GS)',
              BERNSTEIN: 'ברנשטיין (AB)',
            };
            return (
              <button
                key={b}
                onClick={() => setSelectedBank(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  selectedBank === b
                    ? 'bg-slate-700 text-white ring-1 ring-white/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {labels[b] || b}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE A: TABLE VIEW (Quick Comparative Overview)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-3.5">{isHe ? 'מניה' : 'Stock'}</th>
                  <th className="p-3.5">{isHe ? 'מוסד / אנליסט' : 'Institution / Analyst'}</th>
                  <th className="p-3.5">{isHe ? 'סוג התראה' : 'Signal Type'}</th>
                  <th className="p-3.5">{isHe ? 'מחיר נוכחי' : 'Current Price'}</th>
                  <th className="p-3.5">{isHe ? 'יעד ישן ➔ חדש' : 'Target Old ➔ New'}</th>
                  <th className="p-3.5">{isHe ? 'שינוי יעד' : 'Revision'}</th>
                  <th className="p-3.5">{isHe ? 'פער אפסייד' : 'Upside'}</th>
                  <th className="p-3.5 text-center">{isHe ? 'פעולות' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredSignals.map((item) => {
                  const live = livePrices[item.ticker]?.price;
                  const displayPrice = live && live > 0 ? live : item.currentPrice;
                  const dynamicUpside = displayPrice > 0
                    ? Number((((item.newPriceTarget - displayPrice) / displayPrice) * 100).toFixed(1))
                    : item.impliedUpsidePct;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleStockClick(item.ticker)}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <StockLogoBadge ticker={item.ticker} name={item.companyName} size="sm" />
                          <div>
                            <span className="font-extrabold text-white text-sm block">{item.ticker}</span>
                            <span className="text-[11px] text-slate-400 font-sans truncate max-w-[140px] block">
                              {item.companyName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className="font-bold text-indigo-300 block">{item.bankDisplayNameHe}</span>
                        <span className="text-slate-400 text-[11px]">{item.analystName}</span>
                      </td>
                      <td className="p-3.5">
                        {getCategoryHeaderBadge(item.messageCategory)}
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-white text-sm">${displayPrice.toFixed(2)}</span>
                        {live && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />}
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-500 line-through">${item.oldPriceTarget.toFixed(2)}</span>
                        <span className="text-slate-400 mx-1">➔</span>
                        <span className={`font-extrabold ${item.targetDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${item.newPriceTarget.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          item.targetDeltaPct >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.targetDeltaPct >= 0 ? '+' : ''}{item.targetDeltaPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold ${dynamicUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dynamicUpside >= 0 ? '+' : ''}{dynamicUpside.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.id);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-sans font-bold transition cursor-pointer"
                        >
                          {expandedId === item.id ? (isHe ? 'סגור' : 'Close') : (isHe ? 'פירוט' : 'Details')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE B: COMPACT LIST VIEW
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'COMPACT' && (
        <div className="space-y-2.5">
          {filteredSignals.map((item) => {
            const isExpanded = expandedId === item.id;
            const live = livePrices[item.ticker]?.price;
            const displayPrice = live && live > 0 ? live : item.currentPrice;
            const dynamicUpside = displayPrice > 0
              ? Number((((item.newPriceTarget - displayPrice) / displayPrice) * 100).toFixed(1))
              : item.impliedUpsidePct;

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3 sm:p-4 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div
                    onClick={() => handleStockClick(item.ticker)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <StockLogoBadge ticker={item.ticker} name={item.companyName} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-base group-hover:text-cyan-300 transition font-mono">
                          {item.ticker}
                        </span>
                        <span className="text-xs text-slate-400 font-sans">{item.companyName}</span>
                        {getCategoryHeaderBadge(item.messageCategory)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans">
                        {item.bankDisplayNameHe} • {item.analystName}
                      </span>
                    </div>
                  </div>

                  {/* Quick corridor */}
                  <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">{isHe ? 'מחיר נוכחי:' : 'Price:'}</span>
                      <span className="font-bold text-white">${displayPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">{isHe ? 'יעד חדש:' : 'Target:'}</span>
                      <span className={`font-extrabold ${item.targetDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${item.newPriceTarget.toFixed(2)} ({item.targetDeltaPct >= 0 ? '+' : ''}{item.targetDeltaPct.toFixed(1)}%)
                      </span>
                    </div>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? (isHe ? 'סגור' : 'Less') : (isHe ? 'הסבר ופעולה' : 'Thesis & Action')}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs animate-fadeIn">
                    <h3 className="font-bold text-white">{isHe ? item.headlineHe : item.headlineEn}</h3>
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-slate-200 text-[11px] leading-relaxed">
                      <strong className="text-amber-300 block mb-1">
                        {isHe ? '🔍 הסימנים המקדימים שקדמו להמלצה:' : 'Early Clues:'}
                      </strong>
                      {isHe ? item.earlyCluesHe : item.earlyCluesEn}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <strong className="text-indigo-300 block mb-1">{isHe ? 'נימוק האנליסט:' : 'Thesis:'}</strong>
                        <p className="text-slate-300">{isHe ? item.fundamentalRationaleHe : item.fundamentalRationaleEn}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <strong className="text-emerald-300 block mb-1">{isHe ? 'תוכנית מסחר לפתיחה:' : 'Playbook:'}</strong>
                        <p className="text-slate-300">{isHe ? item.traderPlaybookHe : item.traderPlaybookEn}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. VIEW MODE C: MODERN & CLEAR CARD VIEW (DEFAULT)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'CARDS' && (
        <div className="space-y-4">
          {filteredSignals.map((item) => {
            const isExpanded = expandedId === item.id;
            const isDrop = item.messageCategory === 'DROP_WARNING' || item.timingStage === 'DOWNGRADE_ALERT';
            const isRise = item.messageCategory === 'SHARP_RISE';
            const isRevision = item.messageCategory === 'FORECAST_REVISION';

            const live = livePrices[item.ticker]?.price;
            const displayCurrentPrice = live && live > 0 ? live : item.currentPrice;
            const dynamicImpliedUpside = displayCurrentPrice > 0
              ? Number((((item.newPriceTarget - displayCurrentPrice) / displayCurrentPrice) * 100).toFixed(1))
              : item.impliedUpsidePct;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isDrop
                    ? 'bg-slate-900/90 border-rose-500/40 hover:border-rose-400'
                    : isRise
                    ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-900/90 border-blue-500/40 hover:border-blue-400'
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Top Bar: Stock info + Badges */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => handleStockClick(item.ticker)}
                        className="cursor-pointer group flex items-center gap-2.5"
                      >
                        <StockLogoBadge ticker={item.ticker} name={item.companyName} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-white group-hover:text-cyan-300 transition font-mono flex items-center gap-1">
                              <span>{item.ticker}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100" />
                            </span>
                            <span className="text-xs text-slate-300 font-medium">{item.companyName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-bold text-indigo-300">{item.bankDisplayNameHe}</span>
                            <span>•</span>
                            <span>{item.analystName}</span>
                            <span className="text-amber-400">★ {item.starRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                      {getCategoryHeaderBadge(item.messageCategory)}
                      {getStageBadge(item.timingStage)}
                      <span className="text-[11px] font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {item.publishedTimeEST}
                      </span>
                    </div>
                  </div>

                  {/* Clean Target Price Corridor Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isHe ? 'מחיר נוכחי (Live):' : 'Current Price:'}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-extrabold text-white text-base">${displayCurrentPrice.toFixed(2)}</span>
                        {live && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Quote" />
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">{isHe ? 'יעד ישן ➔ יעד חדש:' : 'Target Old ➔ New:'}</span>
                      <span className="font-bold flex items-center gap-1 mt-0.5">
                        <span className="text-slate-500 line-through">${item.oldPriceTarget.toFixed(2)}</span>
                        <span className="text-slate-400">➔</span>
                        <span className={item.targetDeltaPct >= 0 ? 'text-emerald-400 text-sm font-extrabold' : 'text-rose-400 text-sm font-extrabold'}>
                          ${item.newPriceTarget.toFixed(2)}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">{isHe ? 'שינוי תחזית האנליסט:' : 'Target Revision:'}</span>
                      <span className={`font-extrabold text-sm block mt-0.5 ${item.targetDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.targetDeltaPct >= 0 ? '+' : ''}{item.targetDeltaPct.toFixed(1)}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">{isHe ? 'פוטנציאל אפסייד משוער:' : 'Implied Upside:'}</span>
                      <span className={`font-extrabold text-sm block mt-0.5 ${dynamicImpliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dynamicImpliedUpside >= 0 ? '+' : ''}{dynamicImpliedUpside.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {isHe ? item.headlineHe : item.headlineEn}
                  </h3>

                  {/* Predictive Tags */}
                  {(item.zacksEspScore || item.zacksRank || item.citiCatalystStatus) && (
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {item.zacksEspScore && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950/70 text-amber-300 border border-amber-500/40 font-mono flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span><strong>Earnings ESP:</strong> {item.zacksEspScore}</span>
                        </span>
                      )}
                      {item.zacksRank && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono">
                          {item.zacksRank}
                        </span>
                      )}
                      {item.citiCatalystStatus && (
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-mono flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.citiCatalystStatus}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* The Clues & Theses (Always clean, collapsible or prominent) */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHe ? '🔍 הסימנים המקדימים (איך היה ניתן לדעת מראש?):' : 'Early Clues:'}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px] sm:text-xs">
                      {isHe ? item.earlyCluesHe : item.earlyCluesEn}
                    </p>
                  </div>

                  {/* Bottom Rationale & Trader Playbook */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="font-bold text-indigo-300 block">
                        {isHe ? '💡 הנימוק הפונדמנטלי של האנליסט:' : 'Analyst Thesis:'}
                      </span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        {isHe ? item.fundamentalRationaleHe : item.fundamentalRationaleEn}
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isDrop
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    }`}>
                      <span className="font-bold flex items-center gap-1">
                        {isDrop ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <Target className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{isHe ? '🎯 תוכנית פעולה מעשית לסוחר לפתיחה:' : 'Trader Playbook:'}</span>
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {isHe ? item.traderPlaybookHe : item.traderPlaybookEn}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.analystWallStreetRank}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeepDiveClick(e, item.ticker)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer shadow"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isHe ? 'ניתוח מעמיק ו-DCF' : 'Deep Dive & DCF'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
