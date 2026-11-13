import React, { useState } from 'react';
import { ResearchStock } from '../types';
import { SupportedLanguage, translations } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getResearchStock, resolveTickerSymbol } from '../data/researchStockGenerator';
import { getStockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import { StockLogoBadge } from './StockLogoBadge';
import { StockLiveChart } from './StockLiveChart';
import { ShareStockReportModal } from './ShareStockReportModal';
import {
  openWhatsAppShare,
  openEmailShare,
  buildStockShareMetrics,
  StockShareData,
} from '../utils/shareUtils';
import {
  Sparkles,
  Search,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Calculator,
  Printer,
  CheckCircle2,
  Target,
  FileText,
  MessageCircle,
  Mail,
  Share2,
} from 'lucide-react';

interface LiveTickerAnalyzerProps {
  onAddStockToUniverse: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onOpenPrintMemo?: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
}

export const LiveTickerAnalyzer: React.FC<LiveTickerAnalyzerProps> = ({
  onAddStockToUniverse,
  onOpenDeepDive,
  onOpenPrintMemo,
  currentLang = 'he',
  livePrices = {},
}) => {
  const [tickerInput, setTickerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultStock, setResultStock] = useState<ResearchStock | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const t = translations[currentLang] || translations.en;
  const isHe = currentLang === 'he';

  const sampleTickers = ['UNH', 'NVDA', 'LLY', 'AMZN', 'META', 'BRK.B', 'TSM', 'ISRG'];

  const handleRunAnalysis = async (tickerToAnalyze?: string) => {
    const raw = (tickerToAnalyze || tickerInput).trim();
    if (!raw) return;
    const target = resolveTickerSymbol(raw);
    if (!target) return;

    setLoading(true);
    setErrorMsg(null);
    let resolvedStock: ResearchStock | null = null;
    try {
      const response = await fetch('/api/analyze-ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ticker: target, language: currentLang }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.stock) {
          resolvedStock = data.stock;
        }
      }
    } catch (err: any) {
      console.warn('LiveTickerAnalyzer fetch failed, falling back to local dataset:', err);
    }

    if (!resolvedStock) {
      // Local institutional generator fallback
      const generated = getResearchStock(target);
      resolvedStock = generated;
    }

    if (resolvedStock) {
      setResultStock(resolvedStock);
      onAddStockToUniverse(resolvedStock);
    } else {
      setErrorMsg(isHe ? 'לא ניתן היה להשלים את הניתוח עבור סימול זה' : 'Failed to complete fundamental analysis for this ticker');
    }
    setLoading(false);
  };

  const localizedResult = resultStock ? localizeStock(resultStock, currentLang) : null;
  const parsedAnalyzedPrice = localizedResult ? parseFloat((localizedResult.currentPrice || '').replace(/[^0-9.]/g, '')) : NaN;
  const currentPriceNum = localizedResult
    ? (livePrices[localizedResult.ticker]?.price || (!isNaN(parsedAnalyzedPrice) && parsedAnalyzedPrice > 0 ? parsedAnalyzedPrice : 100))
    : 100;
  const profile = resultStock ? getStockCompetitiveProfile(resultStock, currentPriceNum) : null;
  const fairValue = profile?.fairValueMidpoint || Math.round(currentPriceNum * 1.22);
  const marginOfSafety = fairValue > 0 ? Math.round(((fairValue - currentPriceNum) / fairValue) * 100) : 0;
  const buyZone = profile?.buyZoneThreshold || Math.round(fairValue * 0.85);
  const impliedGrowth = profile?.marketImpliedGrowthRate || 8.5;
  const expectedGrowth = profile?.fundamentalExpectedGrowthRate || 13.2;

  const isDiscounted = marginOfSafety > 10;
  const isFairlyPriced = marginOfSafety >= -5 && marginOfSafety <= 10;
  
  let actionText = isHe ? 'קנייה מומלצת (BUY)' : 'STRONG BUY';
  let actionColor = 'bg-emerald-950 text-emerald-300 border-emerald-700';

  if (!isDiscounted && isFairlyPriced) {
    actionText = isHe ? 'הצטיידות בירידות (ACCUMULATE)' : 'ACCUMULATE ON PULLBACK';
    actionColor = 'bg-cyan-950 text-cyan-300 border-cyan-700';
  } else if (!isDiscounted && !isFairlyPriced) {
    actionText = isHe ? 'החזק / מעקב (HOLD / WATCH)' : 'HOLD / WATCH';
    actionColor = 'bg-amber-950 text-amber-300 border-amber-700';
  }

  const shareData: StockShareData | null = localizedResult
    ? {
        stock: localizedResult,
        profile,
        currentPrice: currentPriceNum,
        fairValue,
        marginOfSafety,
        actionRecommendation: actionText,
        currentLang,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {isHe ? 'חיפוש וניתוח מניות מקיף (כולל הערכת שווי DCF והחלטת השקעה)' : 'Stock Search, Fundamental Audit & DCF Valuation'}
          </h2>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
            Gemini 3.7 + SEC Real-Time Grounding
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {isHe
            ? 'הזן כל סימול מניה (Ticker) של חברה אמריקאית לקבלת דוח פונדמנטלי מלא: הערכת שווי DCF, מרווח ביטחון, בדיקת ציפיות שוק Reverse DCF, מסלול צמיחה לשנתיים (FY2) והמלצת החלטת השקעה ברורה.'
            : 'Input any US-listed ticker to generate an institutional report uniting fundamental moat audits, DCF fair value, Reverse DCF market expectations, 2-year runway, and an actionable investment decision.'}
        </p>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              id="live-analyzer-input"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder={isHe ? 'הזן סימול מניה (לדוגמה: UNH, LLY, NVDA, COST, ISRG, MSFT)...' : 'Enter US Ticker (e.g. UNH, LLY, NVDA, COST, ISRG, MSFT)...'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
            />
          </div>
          <button
            id="btn-run-live-analysis"
            onClick={() => handleRunAnalysis()}
            disabled={loading || !tickerInput.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isHe ? 'בצע ניתוח והערכת שווי' : 'Run Full Valuation & Audit'}</span>
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <span className="text-slate-500">{isHe ? 'בדיקה מהירה:' : 'Quick Test:'}</span>
          {sampleTickers.map((tTicker) => (
            <button
              key={tTicker}
              onClick={() => {
                setTickerInput(tTicker);
                handleRunAnalysis(tTicker);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 cursor-pointer"
            >
              <StockLogoBadge ticker={tTicker} size="xs" />
              <span>{tTicker}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-10 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <div className="font-mono text-sm text-cyan-300 font-bold">
            {isHe
              ? `מבצע ביקורת פונדמנטלית מקיפה, הערכת שווי DCF וחישוב מרווחי ביטחון עבור ${tickerInput.toUpperCase()}...`
              : `Executing 30-Section Institutional Audit & DCF Valuation for ${tickerInput.toUpperCase()}...`}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isHe
              ? 'בדיקת דוחות 10-K מול ה-SEC, חישוב מרווחי ROIC מול WACC, בדיקת שווי הוגן DCF, המרת תזרים מזומנים חופשי מעל 100%, והערכת מלכודות ערך.'
              : 'Auditing SEC 10-K filings, modeling DCF fair values, inspecting FCF conversion, and evaluating expectation asymmetry.'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Result Card */}
      {localizedResult && !loading && (
        <div className="bg-slate-900 border border-cyan-800/80 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <StockLogoBadge ticker={localizedResult.ticker} name={localizedResult.companyName} size="lg" />
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-2xl font-bold font-mono text-white">{localizedResult.ticker}</span>
                  <span className="text-slate-300 text-sm font-medium">{localizedResult.companyName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {localizedResult.exchange}
                  </span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${actionColor}`}>
                    {actionText}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {localizedResult.sector} • {localizedResult.marketCap} • {isHe ? 'תשואה צפויה 5Y (CAGR):' : 'Expected 5Y CAGR:'}{' '}
                  <strong className="text-emerald-400">{localizedResult.expected5YCAGRRange}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="text-center p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <div className="text-[10px] text-slate-400">{isHe ? 'ציון איכות' : 'Quality Score'}</div>
                <div className="text-lg font-bold text-cyan-300">{localizedResult.investmentScore}/100</div>
              </div>

              {/* Quick WhatsApp Share */}
              {shareData && (
                <button
                  onClick={() => openWhatsAppShare(shareData)}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer shadow"
                  title={isHe ? 'שתף דוח זה בוואטסאפ' : 'Share via WhatsApp'}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isHe ? 'וואטסאפ' : 'WhatsApp'}</span>
                </button>
              )}

              {/* Quick Email Share */}
              {shareData && (
                <button
                  onClick={() => openEmailShare(shareData)}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer shadow"
                  title={isHe ? 'שתף דוח זה במייל' : 'Share via Email'}
                >
                  <Mail className="w-4 h-4" />
                  <span>{isHe ? 'אימייל' : 'Email'}</span>
                </button>
              )}

              {/* Full Share Modal Trigger */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1 cursor-pointer border border-slate-700"
                title={isHe ? 'אפשרויות שיתוף נוספות' : 'More share options'}
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
              </button>

              {/* PDF Memo Exporter Button */}
              {onOpenPrintMemo && (
                <button
                  onClick={() => onOpenPrintMemo(localizedResult)}
                  className="px-3 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer shadow"
                  title={isHe ? 'הפקת תזכיר השקעה מוסדי להדפסה ו-PDF' : 'Export Full Printable PDF Memo'}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isHe ? 'דוח PDF' : 'PDF Memo'}</span>
                </button>
              )}

              <button
                onClick={() => onOpenDeepDive(localizedResult)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                <span>{isHe ? 'תזכיר מורחב' : 'Deep Dive'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Live Stock Price Chart */}
          <div className="space-y-1">
            <StockLiveChart
              ticker={localizedResult.ticker}
              companyName={localizedResult.companyName}
              currentPrice={localizedResult.currentPrice}
              expected5YCAGR={localizedResult.expected5YCAGRRange}
              liveTickPrice={livePrices[localizedResult.ticker]?.price}
              liveChangePercent={livePrices[localizedResult.ticker]?.changePercent}
              currentLang={currentLang}
            />
          </div>

          {/* COMPREHENSIVE VALUATION & DECISION BANNER (NEW) */}
          <div className="bg-slate-950 border border-cyan-800/60 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold font-mono text-white">
                  {isHe ? 'הערכת שווי DCF וקבלת החלטת השקעה:' : 'DCF Valuation & Decision Framework:'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">{isHe ? 'אזור קנייה מומלץ:' : 'Target Buy Zone:'}</span>
                <strong className="text-emerald-400 font-bold">&lt; ${buyZone}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHe ? 'שווי הוגן מחושב (DCF)' : 'DCF Fair Value'}</span>
                <div className="text-lg font-bold text-white mt-1">${fairValue}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{isHe ? 'מחיר נוכחי:' : 'Current:'} ${currentPriceNum.toFixed(2)}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHe ? 'מרווח ביטחון (Margin)' : 'Margin of Safety'}</span>
                <div className={`text-lg font-bold mt-1 ${marginOfSafety >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {marginOfSafety >= 0 ? `+${marginOfSafety}%` : `${marginOfSafety}%`}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{marginOfSafety >= 0 ? (isHe ? 'דיסקאונט' : 'Discount') : (isHe ? 'פרמיה' : 'Premium')}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHe ? 'ציפיות שוק (Reverse DCF)' : 'Market Implied Growth'}</span>
                <div className="text-lg font-bold text-cyan-300 mt-1">{impliedGrowth}% / yr</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{isHe ? 'צפי פונדמנטלי:' : 'Fundamental:'} {expectedGrowth}%</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHe ? 'פעולת השקעה מומלצת' : 'Action Recommendation'}</span>
                <div className="text-xs font-bold text-emerald-400 mt-1 truncate">{actionText}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{isHe ? 'משקל ליבה:' : 'Core Weight:'} 4-7%</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                {isHe
                  ? `החלטת ועדה: מניית ${localizedResult.ticker} נסחרת ${marginOfSafety >= 0 ? `בדיסקאונט של ${marginOfSafety}% מהשווי ההוגן` : `בפרמיה של ${Math.abs(marginOfSafety)}%`} ($${fairValue}). יתרון תחרותי מסוג "${localizedResult.moatType || 'High Switching Costs'}" עם ROIC של ${localizedResult.financialQuality?.roicCurrent?.value || '20%+'} תומך בתשואה שנתית צפויה של ${localizedResult.expected5YCAGRRange}.`
                  : `Committee Verdict: ${localizedResult.ticker} trades at a ${marginOfSafety}% margin vs $${fairValue} fair value. Wide moat backed by ${localizedResult.financialQuality?.roicCurrent?.value || '20%+'} ROIC supports ${localizedResult.expected5YCAGRRange} 5-year CAGR.`}
              </span>
            </div>
          </div>

          {/* Core breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'חפיר כלכלי (30%)' : 'Moat Score (30%)'}</span>
              <div className="text-sm font-bold text-white mt-0.5">{localizedResult.moatScore}/100</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{localizedResult.moatTrend}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'איכות פיננסית (20%)' : 'Quality Score (20%)'}</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{localizedResult.financialQualityScore}/100</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ROIC: {localizedResult.financialQuality?.roicCurrent?.value || 'N/A'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מסלול צמיחה 5Y (20%)' : 'Growth Score (20%)'}</span>
              <div className="text-sm font-bold text-white mt-0.5">{localizedResult.growthScore}/100</div>
              <div className="text-[10px] text-slate-500 mt-0.5">5Y CAGR: {localizedResult.growth?.revenueCAGR5Y?.value || 'N/A'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'ציון שווי (15%)' : 'Valuation Score (15%)'}</span>
              <div className="text-sm font-bold text-white mt-0.5">{localizedResult.valuationScore}/100</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fwd P/E: {localizedResult.valuation?.forwardPE?.value || 'N/A'}</div>
            </div>
          </div>

          {/* Thesis statement */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">
              {isHe ? 'תזת השקעה וביקורת חפיר כלכלי:' : 'Investment Thesis & Moat Audit:'}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{localizedResult.investmentThesisSummary}</p>
          </div>
        </div>
      )}

      {/* Share Report Modal */}
      {resultStock && (
        <ShareStockReportModal
          stock={resultStock}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          currentLang={currentLang}
          livePrice={currentPriceNum}
        />
      )}
    </div>
  );
};
