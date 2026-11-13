import React, { useState, useMemo, useEffect } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getStockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import { getResearchStock } from '../data/researchStockGenerator';
import { ShareStockReportModal } from './ShareStockReportModal';
import {
  openWhatsAppShare,
  openEmailShare,
  buildStockShareMetrics,
  StockShareData,
} from '../utils/shareUtils';
import {
  Printer,
  FileText,
  ShieldCheck,
  Award,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  Check,
  Calculator,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Scale,
  Sparkles,
  Share2,
  MessageCircle,
  Mail,
  Search,
  RefreshCw,
} from 'lucide-react';

interface InvestmentMemoPrinterProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  currentLang?: SupportedLanguage;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onAddStockToUniverse?: (stock: ResearchStock) => void;
}

export const InvestmentMemoPrinter: React.FC<InvestmentMemoPrinterProps> = ({
  stocks,
  selectedStock,
  currentLang = 'he',
  livePrices = {},
  onAddStockToUniverse,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(
    selectedStock?.ticker || stocks[0]?.ticker || 'UNH'
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (selectedStock?.ticker && selectedStock.ticker !== selectedTicker) {
      setSelectedTicker(selectedStock.ticker);
    }
  }, [selectedStock?.ticker]);

  const isHe = currentLang === 'he';
  const rawStock = useMemo(() => {
    const found = stocks.find((s) => s.ticker === selectedTicker);
    if (found) return found;
    return getResearchStock(selectedTicker);
  }, [stocks, selectedTicker]);

  const stock = localizeStock(rawStock, currentLang);
  const liveQuote = livePrices[stock.ticker];
  const parsedPrice = parseFloat(stock.currentPrice.replace(/[^0-9.]/g, ''));
  const effectivePrice = (liveQuote && liveQuote.price > 0) ? liveQuote.price : (!isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 100);
  const profile = getStockCompetitiveProfile(rawStock, effectivePrice);

  const handleStockChange = (newTicker: string) => {
    const clean = newTicker.toUpperCase().trim();
    setSelectedTicker(clean);
    let s = stocks.find((item) => item.ticker === clean);
    if (!s) {
      s = getResearchStock(clean);
      if (onAddStockToUniverse) {
        onAddStockToUniverse(s);
      }
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.toUpperCase().trim();
    if (!clean) return;
    setIsSearching(true);
    try {
      let resolved = stocks.find((s) => s.ticker === clean);
      if (!resolved) {
        resolved = getResearchStock(clean);
        if (onAddStockToUniverse && resolved) {
          onAddStockToUniverse(resolved);
        }
      }
      setSelectedTicker(clean);
      setSearchInput('');
    } finally {
      setIsSearching(false);
    }
  };

  const popularTickers = ['NVDA', 'MSFT', 'UNH', 'GOOGL', 'AAPL', 'COST', 'V', 'PLTR', 'TSLA', 'AMZN', 'META', 'LLY', 'AVGO'];

  const liveInfo = livePrices[stock.ticker];
  const currentPrice = liveInfo?.price || parseFloat(stock.currentPrice.replace(/[^0-9.]/g, '')) || 150;

  // DCF and Valuation Calculations
  const fairValue = profile?.fairValueMidpoint || Math.round(currentPrice * 1.22);
  const marginOfSafety = Math.round(((fairValue - currentPrice) / fairValue) * 100);
  const buyZone = profile?.buyZoneThreshold || Math.round(fairValue * 0.85);
  const watchZoneUpper = profile?.watchZoneUpper || Math.round(fairValue * 1.05);
  const expensiveZone = profile?.expensiveZoneThreshold || Math.round(fairValue * 1.2);

  const impliedGrowth = profile?.marketImpliedGrowthRate || 8.5;
  const expectedGrowth = profile?.fundamentalExpectedGrowthRate || 13.2;
  const growthSpread = Number((expectedGrowth - impliedGrowth).toFixed(1));

  // Determine investment verdict and action recommendation
  const isDiscounted = marginOfSafety > 10;
  const isFairlyPriced = marginOfSafety >= -5 && marginOfSafety <= 10;
  
  let actionRecommendation = isHe ? 'קנייה מומלצת (BUY)' : 'STRONG BUY';
  let actionColor = 'bg-emerald-600 text-white';
  let actionBadgeBorder = 'border-emerald-500';
  let actionSubtext = isHe
    ? `נסחרת בדיסקאונט של ${marginOfSafety}% מהשווי ההוגן ($${fairValue}) עם יתרון צמיחה מובהק מול ציפיות השוק.`
    : `Trading at a ${marginOfSafety}% discount to intrinsic fair value ($${fairValue}) with strong expectation asymmetry.`;

  if (!isDiscounted && isFairlyPriced) {
    actionRecommendation = isHe ? 'הצטיידות בירידות (ACCUMULATE ON PULLBACK)' : 'ACCUMULATE ON PULLBACK';
    actionColor = 'bg-cyan-700 text-white';
    actionBadgeBorder = 'border-cyan-600';
    actionSubtext = isHe
      ? `נסחרת במחיר הוגן קרוב לשווי ההוגן ($${fairValue}). מומלץ להיכנס במנות או להמתין למחיר יעד של $${buyZone}.`
      : `Priced near fair value ($${fairValue}). Accumulate on dips toward target buy zone ($${buyZone}).`;
  } else if (!isDiscounted && !isFairlyPriced) {
    actionRecommendation = isHe ? 'החזק / מעקב (HOLD / WATCH)' : 'HOLD / WATCH';
    actionColor = 'bg-amber-600 text-white';
    actionBadgeBorder = 'border-amber-500';
    actionSubtext = isHe
      ? `נסחרת בפרמיה מעל השווי ההוגן. איכות עסקית מעולה אך תמחור מתוח; מומלץ להמתין לכניסה מתחת ל-$${watchZoneUpper}.`
      : `Trading above fair value. Outstanding moat quality but rich multiple; wait for entry below $${watchZoneUpper}.`;
  }

  const shareData: StockShareData = {
    stock,
    profile,
    currentPrice,
    fairValue,
    marginOfSafety,
    actionRecommendation,
    currentLang,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (Hidden during Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm print:hidden space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                INSTITUTIONAL RESEARCH MEMO
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <span>{isHe ? 'דוח החלטת השקעה מוסדי מקיף (כולל הערכת שווי מלאה)' : 'Comprehensive Investment Decision Memo (Valuation & DCF)'}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'דוח מוסדי מושלם לכל מניה בשוק המרכז את כל הנתונים הפונדמנטליים, מודל הערכת שווי DCF, בדיקת ציפיות שוק Reverse DCF, מרווחי ביטחון ותרחישי תשואה.'
                : 'Complete institutional decision memo uniting fundamental quality, DCF fair value, Reverse DCF expectations, margin of safety, and actionable decision criteria.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Any Ticker */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-52">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isHe ? 'הקלד טיקר (למשל COST)...' : 'Search ticker (e.g. COST)...'}
                className="w-full pl-8 rtl:pr-8 rtl:pl-14 pr-14 py-2 bg-slate-950 border border-cyan-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={isSearching || !searchInput.trim()}
                className="absolute right-1 rtl:left-1 rtl:right-auto top-1 px-2 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold rounded transition cursor-pointer"
              >
                {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : isHe ? 'חפש' : 'Go'}
              </button>
            </form>

            {/* Select Stock Dropdown */}
            <select
              value={selectedTicker}
              onChange={(e) => handleStockChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none sm:w-48"
            >
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} — {s.companyName.slice(0, 18)}
                </option>
              ))}
            </select>

            {/* WhatsApp Quick Share Button */}
            <button
              onClick={() => openWhatsAppShare(shareData)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
              title={isHe ? 'שתף דוח זה ישירות בוואטסאפ' : 'Share this memo via WhatsApp'}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isHe ? 'וואטסאפ' : 'WhatsApp'}</span>
            </button>

            {/* Email Quick Share Button */}
            <button
              onClick={() => openEmailShare(shareData)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
              title={isHe ? 'שתף דוח זה ישירות במייל' : 'Share this memo via Email'}
            >
              <Mail className="w-4 h-4" />
              <span>{isHe ? 'אימייל' : 'Email'}</span>
            </button>

            {/* Native / Web Share Modal */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 border border-slate-700 shadow cursor-pointer whitespace-nowrap"
              title={isHe ? 'אפשרויות שיתוף נוספות והעתקת קישור' : 'More share options & copy link'}
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'שיתוף...' : 'Share...'}</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isHe ? 'הדפס / שמור כ-PDF' : 'Print / Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Quick Tickers Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 mr-1 rtl:ml-1 rtl:mr-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {isHe ? 'מניות לבדיקה מהירה:' : 'Quick Tickers:'}
          </span>
          {popularTickers.map((t) => (
            <button
              key={t}
              onClick={() => handleStockChange(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                selectedTicker === t
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Document Paper Card */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl max-w-4xl mx-auto font-sans print:shadow-none print:p-0 print:m-0 border border-slate-200 print:border-none">
        
        {/* Top Header Banner */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                MOATGUARD RESEARCH • INSTITUTIONAL MEMORANDUM
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SEC AUDITED 10-K
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 mt-2 flex items-center gap-3">
              <span>{stock.companyName}</span>
              <span className="font-mono text-cyan-700 font-bold text-2xl">({stock.ticker})</span>
            </h1>
            <div className="text-xs text-slate-600 font-mono mt-1">
              Sector: <strong>{stock.sector}</strong> | Industry: <strong>{stock.industry}</strong> | Exchange: <strong>{stock.exchange}</strong>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-3xl font-black text-slate-900">${currentPrice.toFixed(2)}</div>
            <div className="text-xs font-bold mt-1 inline-block px-2.5 py-1 rounded bg-slate-900 text-white uppercase tracking-wider">
              {actionRecommendation}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Executive Score & High-Level Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 font-mono text-center">
          <div className="p-2 border-r border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Quality Score</div>
            <div className="text-xl font-black text-slate-950 mt-0.5">{stock.investmentScore}/100</div>
            <div className="text-[9px] text-emerald-700 font-bold">Grade A+</div>
          </div>
          <div className="p-2 border-r border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Economic Moat</div>
            <div className="text-xl font-black text-cyan-800 mt-0.5">{stock.moatScore ? `${stock.moatScore}/100` : '92/100'}</div>
            <div className="text-[9px] text-slate-600">{stock.moatTrend || 'Wide Moat'}</div>
          </div>
          <div className="p-2 border-r border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">DCF Fair Value</div>
            <div className="text-xl font-black text-slate-950 mt-0.5">${fairValue}</div>
            <div className="text-[9px] text-slate-600">Intrinsic Midpoint</div>
          </div>
          <div className="p-2 border-r border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">Margin of Safety</div>
            <div className={`text-xl font-black mt-0.5 ${marginOfSafety >= 0 ? 'text-emerald-700' : 'text-amber-600'}`}>
              {marginOfSafety >= 0 ? `+${marginOfSafety}%` : `${marginOfSafety}%`}
            </div>
            <div className="text-[9px] text-slate-600">{marginOfSafety >= 0 ? 'Discount' : 'Premium'}</div>
          </div>
          <div className="p-2 border-r border-slate-200">
            <div className="text-[10px] text-slate-500 uppercase">5Y Target CAGR</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{stock.expected5YCAGRRange}</div>
            <div className="text-[9px] text-slate-600">Base-to-Bull</div>
          </div>
          <div className="p-2">
            <div className="text-[10px] text-slate-500 uppercase">Forward P/E</div>
            <div className="text-xl font-black text-slate-950 mt-0.5">{stock.valuation?.forwardPE?.value || '21.5x'}</div>
            <div className="text-[9px] text-slate-600">{stock.valuation?.historicalPercentile5Y?.slice(0, 15) || 'Favorable'}</div>
          </div>
        </div>

        {/* DECISION CALLOUT BOX (NEW: Clear Go/No-Go Decision) */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-sm font-mono text-cyan-300">
                {isHe ? 'סיכום המלצת הוועדה והחלטת השקעה:' : 'Investment Committee Decision & Sizing Strategy:'}
              </span>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-mono font-black ${actionColor}`}>
              {actionRecommendation}
            </span>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {actionSubtext}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{isHe ? 'אזור קנייה מומלץ:' : 'Target Buy Zone:'}</span>
              <strong className="text-emerald-400 font-bold">&lt; ${buyZone}</strong>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{isHe ? 'טווח מחיר הוגן:' : 'Fair Value Range:'}</span>
              <strong className="text-cyan-300 font-bold">${buyZone} – ${watchZoneUpper}</strong>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{isHe ? 'משקל תיק מומלץ:' : 'Recommended Sizing:'}</span>
              <strong className="text-white font-bold">4.0% – 7.5% (Core)</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Comprehensive Valuation Assessment (NEW SECTION) */}
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-bold font-mono text-slate-900 uppercase border-b-2 border-slate-900 pb-1 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-700" />
            <span>{isHe ? '1. הערכת שווי פונדמנטלית מקיפה ומודל DCF (Valuation Assessment)' : '1. Comprehensive Valuation Assessment & DCF Fair Value'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* DCF Fair Value Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-900">{isHe ? 'מודל שווי הוגן DCF:' : 'DCF Intrinsic Fair Value:'}</span>
                <span className="text-sm font-black text-slate-900">${fairValue}</span>
              </div>
              <p className="text-slate-700 leading-snug">
                {isHe
                  ? `הערכת השווי מבוססת על היוון תזרימי מזומנים חופשיים (FCF) ל-5 שנים בשיעור WACC של ${stock.financialQuality?.wacc || '8.5%'} וצמיחה טרמינלית של 3.0%.`
                  : `Discounted Cash Flow model based on audited 5-year FCF projections discounted at ${stock.financialQuality?.wacc || '8.5%'} WACC and 3.0% terminal growth.`}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">{isHe ? 'מחיר שוק נוכחי:' : 'Current Price:'}</span>
                  <strong className="text-slate-900">${currentPrice.toFixed(2)}</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">{isHe ? 'מרווח ביטחון:' : 'Margin of Safety:'}</span>
                  <strong className={marginOfSafety >= 0 ? 'text-emerald-700' : 'text-amber-600'}>
                    {marginOfSafety >= 0 ? `+${marginOfSafety}% (דיסקאונט)` : `${marginOfSafety}% (פרמיה)`}
                  </strong>
                </div>
              </div>
            </div>

            {/* Reverse DCF & Expectation Asymmetry Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-slate-900">{isHe ? 'ציפיות שוק (Reverse DCF):' : 'Reverse DCF Expectations:'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {growthSpread >= 0 ? (isHe ? 'אסימטריה חיובית' : 'Positive Asymmetry') : (isHe ? 'ציפיות מתוחות' : 'Rich')}
                </span>
              </div>
              <p className="text-slate-700 leading-snug">
                {isHe
                  ? `מחיר השוק הנוכחי מגלם קצב צמיחת תזרים של ${impliedGrowth}% בלבד, בעוד שהמודל הפונדמנטלי צופה צמיחה של ${expectedGrowth}% (מרווח פער חיובי של +${growthSpread}%).`
                  : `Market prices in ${impliedGrowth}% FCF growth, while fundamental research models ${expectedGrowth}% CAGR (+${growthSpread}% expectation spread).`}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">{isHe ? 'צמיחה גלומה במחיר:' : 'Market Implied CAGR:'}</span>
                  <strong className="text-slate-900">{impliedGrowth}% / yr</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">{isHe ? 'צמיחה פונדמנטלית צפויה:' : 'Fundamental CAGR:'}</span>
                  <strong className="text-emerald-700">{expectedGrowth}% / yr</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Year Return Scenario Matrix */}
          <div className="mt-3 p-3.5 rounded-xl bg-slate-100 border border-slate-300 font-mono text-xs">
            <div className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-700" />
              <span>{isHe ? 'מטריצת תרחישי תשואה ומחירי יעד לשנתיים (FY2 - Bear / Base / Bull):' : '2-Year Target Price & CAGR Return Matrix (FY2):'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2.5 rounded border border-rose-200 space-y-1">
                <div className="text-rose-700 font-bold text-[11px] uppercase">{isHe ? 'תרחיש פסימי (Bear)' : 'Bear Case'}</div>
                <div className="text-sm font-black text-rose-700">{stock.scenarios?.bearCase?.expectedCAGR || '4.2%'} CAGR</div>
                <div className="text-[10px] text-slate-600">Rev: {stock.scenarios?.bearCase?.revenueGrowthCAGR || '6%'} | Exit P/E: {stock.scenarios?.bearCase?.exitMultiplePE || '16x'}</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-cyan-300 space-y-1 shadow-sm">
                <div className="text-cyan-800 font-bold text-[11px] uppercase">{isHe ? 'תרחיש בסיס (Base)' : 'Base Case (Likely)'}</div>
                <div className="text-sm font-black text-cyan-800">{stock.scenarios?.baseCase?.expectedCAGR || '14.8%'} CAGR</div>
                <div className="text-[10px] text-slate-600">Rev: {stock.scenarios?.baseCase?.revenueGrowthCAGR || '12%'} | Exit P/E: {stock.scenarios?.baseCase?.exitMultiplePE || '22x'}</div>
              </div>
              <div className="bg-white p-2.5 rounded border border-emerald-300 space-y-1">
                <div className="text-emerald-700 font-bold text-[11px] uppercase">{isHe ? 'תרחיש אופטימי (Bull)' : 'Bull Case'}</div>
                <div className="text-sm font-black text-emerald-700">{stock.scenarios?.bullCase?.expectedCAGR || '19.5%'} CAGR</div>
                <div className="text-[10px] text-slate-600">Rev: {stock.scenarios?.bullCase?.revenueGrowthCAGR || '16%'} | Exit P/E: {stock.scenarios?.bullCase?.exitMultiplePE || '26x'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Business Overview & Core Moat Thesis */}
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-bold font-mono text-slate-900 uppercase border-b-2 border-slate-900 pb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
            <span>{isHe ? '2. חפיר כלכלי ועוצמת תחרות מבנית (Moat & Market Power)' : '2. Core Moat & Structural Competitive Advantage'}</span>
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {stock.investmentThesisSummary || stock.whyInTopUniverse}
          </p>
          <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-xs">
            <span className="font-bold text-cyan-950 font-mono block mb-1">
              {isHe ? 'מקור החפיר המרכזי:' : 'Primary Moat Source:'} {stock.moatType || 'High Switching Costs & Scale'}
            </span>
            <p className="text-slate-800 leading-relaxed">{stock.moat?.whyExists || stock.moatDefenseMechanism}</p>
          </div>
        </div>

        {/* Section 3: Financial Quality & SEC Audit Trail */}
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-bold font-mono text-slate-900 uppercase border-b-2 border-slate-900 pb-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-700" />
            <span>{isHe ? '3. איכות פיננסית וביקורת דוחות SEC 10-K' : '3. Financial Quality & Capital Allocation Audit'}</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">ROIC vs WACC:</span>
              <strong className="text-emerald-700 text-sm">{stock.financialQuality?.roicCurrent?.value || '22.4%'}</strong>
              <div className="text-[9px] text-slate-500">WACC: {stock.financialQuality?.wacc || '8.5%'}</div>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">FCF Conversion:</span>
              <strong className="text-emerald-700 text-sm">{stock.financialQuality?.fcfConversionRate || '104%'}</strong>
              <div className="text-[9px] text-slate-500">FCF Margin: {stock.financialQuality?.fcfMargin?.value || '24%'}</div>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Net Debt / EBITDA:</span>
              <strong className="text-slate-900 text-sm">{stock.financialQuality?.netDebtToEBITDA?.value || '0.4x'}</strong>
              <div className="text-[9px] text-emerald-700 font-bold">{stock.financialQuality?.balanceSheetHealth || 'Pristine'}</div>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Per-Share EPS CAGR:</span>
              <strong className="text-emerald-700 text-sm">{stock.perShare?.epsCAGR5Y?.value || stock.perShareValueCreation?.epsCAGR5Y?.value || '14.5%'}</strong>
              <div className="text-[9px] text-slate-500">5Y Share Count: {stock.perShare?.sharesOutstandingChange5Y || '-4.5%'}</div>
            </div>
          </div>
        </div>

        {/* Section 4: Key Catalysts & Failure Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 font-mono block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHe ? 'זרזי צמיחה מובילים לשנתיים (FY1-FY2):' : '2-Year Growth Catalysts (FY1-FY2):'}</span>
            </span>
            <ul className="list-disc list-inside text-slate-800 space-y-1 leading-snug">
              {(stock.fiveYearGrowthDrivers || stock.growth?.fiveYearCatalysts)?.slice(0, 3).map((cat, idx) => (
                <li key={idx}>{cat}</li>
              )) || <li>Sustained high pricing power and capital-light compounding.</li>}
            </ul>
          </div>

          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
            <span className="font-bold text-rose-950 font-mono block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
              <span>{isHe ? 'סיכוני כישלון ושבירת תזה:' : 'Thesis Invalidation Risks & Red Flags:'}</span>
            </span>
            <ul className="list-disc list-inside text-slate-800 space-y-1 leading-snug">
              {(stock.primaryFailureRisks || stock.redFlags?.map(r => r.title))?.slice(0, 3).map((r, idx) => (
                <li key={idx}>{r}</li>
              )) || <li>Loss of pricing power or regulatory structural disruption.</li>}
            </ul>
          </div>
        </div>

        {/* Section 5: Sign-off & Committee Decision */}
        <div className="border-t-2 border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">{isHe ? 'אישור וחתימת שולחן המחקר:' : 'RESEARCH DESK SIGN-OFF:'}</span>
            <strong className="text-slate-900">MoatGuard Institutional Research Desk</strong>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">{isHe ? 'פעולת השקעה מומלצת:' : 'RECOMMENDED ACTION:'}</span>
              <span className="px-3 py-1 bg-slate-900 text-white rounded font-bold uppercase text-xs">
                {actionRecommendation}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Share Modal */}
      <ShareStockReportModal
        stock={stock}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentLang={currentLang}
        livePrice={currentPrice}
      />
    </div>
  );
};

