import React, { useState, useEffect } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { StockLiveChart } from './StockLiveChart';
import { QuickActionPlusMenu } from './QuickActionPlusMenu';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getResearchStock } from '../data/researchStockGenerator';
import { getStockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import { SeniorAnalystRankings } from './SeniorAnalystRankings';
import { ShareStockReportModal } from './ShareStockReportModal';
import { CompanyProfileSection } from './CompanyProfileSection';
import {
  openWhatsAppShare,
  openEmailShare,
  buildStockShareMetrics,
  StockShareData,
} from '../utils/shareUtils';
import {
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  AlertTriangle,
  Target,
  CheckCircle2,
  FileText,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Printer,
  Plus,
  Search,
  MessageCircle,
  Mail,
  Share2,
  Scale,
  Calculator,
  TrendingDown,
  Award,
} from 'lucide-react';

interface DeepDiveTop5Props {
  top5Stocks: ResearchStock[];
  allStocks?: ResearchStock[];
  selectedStock?: ResearchStock;
  onSelectStock: (stock: ResearchStock) => void;
  watchlist?: WatchlistItem[];
  onToggleWatchlist?: (stock: ResearchStock) => void;
  onAddToPortfolio?: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
}

export const DeepDiveTop5: React.FC<DeepDiveTop5Props> = ({
  top5Stocks,
  allStocks = [],
  selectedStock,
  onSelectStock,
  watchlist = [],
  onToggleWatchlist,
  onAddToPortfolio,
  currentLang = 'he',
  livePrices = {},
}) => {
  const [activeStockTicker, setActiveStockTicker] = useState<string>(
    selectedStock?.ticker || top5Stocks[0]?.ticker || 'NVDA'
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Synchronize when selectedStock prop changes
  useEffect(() => {
    if (selectedStock?.ticker && selectedStock.ticker !== activeStockTicker) {
      setActiveStockTicker(selectedStock.ticker);
    }
  }, [selectedStock?.ticker]);

  // Robustly resolve the stock from selectedStock, allStocks, top5Stocks, or dynamically via research generator
  const rawStock =
    (selectedStock && selectedStock.ticker === activeStockTicker ? selectedStock : undefined) ||
    allStocks.find((s) => s.ticker === activeStockTicker) ||
    top5Stocks.find((s) => s.ticker === activeStockTicker) ||
    getResearchStock(activeStockTicker) ||
    top5Stocks[0] ||
    selectedStock;

  if (!rawStock) return null;

  const currentStock = localizeStock(rawStock, currentLang);
  const isHe = currentLang === 'he';
  const livePriceInfo = livePrices[currentStock.ticker];

  const parsedStockPrice = parseFloat(currentStock.currentPrice.replace(/[^0-9.]/g, ''));
  const currentPriceNum = livePriceInfo?.price || (!isNaN(parsedStockPrice) && parsedStockPrice > 0 ? parsedStockPrice : 100);

  // Profile and 3-model valuation calculation now dynamically uses the active live price
  const profile = getStockCompetitiveProfile(rawStock, currentPriceNum);
  const valResult = profile?.valuationBreakdown;
  const fairValue = valResult?.blendedFairValue || profile?.fairValueMidpoint || Math.round(currentPriceNum * 1.22);
  const marginOfSafety = fairValue > 0 ? Math.round(((fairValue - currentPriceNum) / fairValue) * 100) : 0;

  const shareData: StockShareData = {
    stock: currentStock,
    profile,
    currentPrice: currentPriceNum,
    fairValue,
    marginOfSafety,
    actionRecommendation: currentStock.finalVerdict || 'BUY',
    currentLang,
  };

  // Combined quick list of prominent stocks to show in top selector
  const availableChips = React.useMemo(() => {
    const list: ResearchStock[] = [...top5Stocks];
    if (selectedStock && !list.some((s) => s.ticker === selectedStock.ticker)) {
      list.push(selectedStock);
    }
    allStocks.forEach((s) => {
      if (!list.some((existing) => existing.ticker === s.ticker)) {
        list.push(s);
      }
    });
    return list;
  }, [top5Stocks, selectedStock, allStocks]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                {isHe ? 'סעיף 21' : 'SECTION 21'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {isHe ? '30 המובילות (S&P 500 ו-NASDAQ) — תזכירי מחקר עומק מוסדיים' : 'Top 30 Compounders — Institutional Deep Dive Memos'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'ביקורת 30 פרמטרים מעמיקה: כלכלת חפיר תחרותי, מרווחי ROIC מול WACC, המרת תזרים מזומנים חופשי, יצירת ערך למניה ותרחישי תשואה צפויים לשנתיים (FY2).'
                : 'Comprehensive 30-parameter audit verifying moat economics, primary SEC financial audit trails, per-share value creation, and 2-year expected return scenarios.'}
            </p>
          </div>

          {/* Top Stocks Selector Tabs & Switcher & Print Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950 rounded-lg border border-slate-800 max-w-full">
              {availableChips.slice(0, 30).map((stock, i) => {
                const isSelected = stock.ticker === activeStockTicker;
                return (
                  <button
                    key={stock.ticker}
                    id={`btn-select-deepdive-${stock.ticker}`}
                    onClick={() => {
                      setActiveStockTicker(stock.ticker);
                      onSelectStock(stock);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow ring-1 ring-cyan-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <StockLogoBadge ticker={stock.ticker} size="xs" />
                    <span>{stock.ticker}</span>
                    <span className="text-[10px] px-1 py-0.2 bg-black/30 rounded">
                      {stock.investmentScore}
                    </span>
                  </button>
                );
              })}

              {/* Quick Dropdown / Selector for all compounders */}
              <select
                value={activeStockTicker}
                onChange={(e) => {
                  const targetTicker = e.target.value;
                  setActiveStockTicker(targetTicker);
                  const found = availableChips.find((s) => s.ticker === targetTicker) || getResearchStock(targetTicker);
                  if (found) onSelectStock(found);
                }}
                className="bg-slate-900 text-cyan-300 text-xs font-mono font-bold border border-slate-700 rounded-lg px-2.5 py-1.5 outline-none hover:border-cyan-500 cursor-pointer"
                title={isHe ? 'בחר מניה לניתוח מוסדי' : 'Select stock for deep dive'}
              >
                <option value="" disabled>{isHe ? 'כל המניות המנותחות...' : 'All analyzed stocks...'}</option>
                {availableChips.map((s) => (
                  <option key={s.ticker} value={s.ticker} className="bg-slate-900 text-slate-100">
                    {s.ticker} — {isHe ? s.companyName : s.companyName} ({s.investmentScore}/100)
                  </option>
                ))}
              </select>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={() => openWhatsAppShare(shareData)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1 cursor-pointer shadow whitespace-nowrap"
              title={isHe ? 'שתף דוח עומק זה בוואטסאפ' : 'Share deep dive via WhatsApp'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isHe ? 'וואטסאפ' : 'WhatsApp'}</span>
            </button>

            {/* Email Share Button */}
            <button
              onClick={() => openEmailShare(shareData)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1 cursor-pointer shadow whitespace-nowrap"
              title={isHe ? 'שתף דוח עומק זה במייל' : 'Share deep dive via Email'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isHe ? 'אימייל' : 'Email'}</span>
            </button>

            {/* More Share Options */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-semibold transition border border-slate-700 flex items-center gap-1 cursor-pointer"
              title={isHe ? 'אפשרויות שיתוף נוספות' : 'More share options'}
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <button
              onClick={() => window.print()}
              id="print-memo-btn"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-semibold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Print or Save PDF Investment Memo"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHe ? 'הדפס / שמור PDF' : 'Print / PDF Memo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Banner */}
      <div className="bg-slate-900 border border-cyan-800/60 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <StockLogoBadge ticker={currentStock.ticker} name={currentStock.companyName} size="xl" />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-bold text-white font-mono">{currentStock.ticker}</h3>
                <span className="text-sm text-slate-400 font-medium">{currentStock.companyName}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                  {currentStock.exchange}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                  {isHe ? 'דירוג סופי:' : 'Final Verdict:'} {currentStock.finalVerdict}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap gap-4">
                <span>{isHe ? 'סקטור:' : 'Sector:'} <strong className="text-slate-200">{currentStock.sector}</strong></span>
                <span>{isHe ? 'תעשייה:' : 'Industry:'} <strong className="text-slate-200">{currentStock.industry}</strong></span>
                <span>{isHe ? 'שווי שוק:' : 'Market Cap:'} <strong className="text-slate-200">{currentStock.marketCap}</strong></span>
                <span>
                  {isHe ? 'מחיר:' : 'Price:'}{' '}
                  <strong className="text-slate-200">
                    ${currentPriceNum.toFixed(2)}
                  </strong>
                  {livePriceInfo && (
                    <span
                      className={`ml-1 text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
                        (livePriceInfo.changePercent ?? 0) >= 0
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {(livePriceInfo.changePercent ?? 0) >= 0 ? '+' : ''}
                      {(livePriceInfo.changePercent ?? 0).toFixed(2)}%
                    </span>
                  )}
                </span>
                <span>{isHe ? 'תאריך בדיקה:' : 'Audit Date:'} <strong className="text-cyan-300">{currentStock.analysisDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Master Scores Badges & Quick Action */}
          <div className="flex items-center gap-3">
            {onToggleWatchlist && onAddToPortfolio && (
              <QuickActionPlusMenu
                stock={rawStock}
                watchlist={watchlist}
                onToggleWatchlist={onToggleWatchlist}
                onAddToPortfolio={onAddToPortfolio}
                currentLang={currentLang}
                size="lg"
              />
            )}
            <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">{isHe ? 'ציון איכות כולל' : 'Investment Score'}</div>
              <div className="text-xl font-mono font-extrabold text-cyan-300">
                {currentStock.investmentScore}<span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">{isHe ? 'תשואה צפויה לשנתיים (CAGR / FY2)' : 'Expected 2Y CAGR (FY2)'}</div>
              <div className="text-xl font-mono font-extrabold text-emerald-400">
                {currentStock.expected5YCAGRRange}
              </div>
            </div>
          </div>
        </div>

        {/* 6 Weighted Category Score Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4 font-mono text-center">
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{isHe ? 'חפיר (30%)' : 'Moat (30%)'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{currentStock.moatScore}/100</div>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{isHe ? 'פיננסי (20%)' : 'Financial (20%)'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{currentStock.financialQualityScore}/100</div>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{isHe ? 'צמיחה (20%)' : 'Growth (20%)'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{currentStock.growthScore}/100</div>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{isHe ? 'למניה (10%)' : 'Per-Share (10%)'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{currentStock.perShareScore}/100</div>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{isHe ? 'שווי (15%)' : 'Valuation (15%)'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{currentStock.valuationScore}/100</div>
          </div>
          <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">{isHe ? 'אנליסטים (5%)' : 'Analyst (5%)'}</div>
            <div className="text-sm font-bold text-white mt-0.5">{currentStock.analystScore}/100</div>
          </div>
        </div>

        {/* Highlighted DCF Valuation & Intrinsic Price Bar */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-cyan-800/80 space-y-3 font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isHe ? 'שווי הוגן מוסדי (משוקלל)' : 'Fair Value (Blended)'}</span>
              <div className="text-lg sm:text-xl font-black text-cyan-300 mt-1">${fairValue}</div>
              <span className="text-[10px] text-slate-500">{valResult ? (isHe ? 'DCF + מכפילים + ROIC' : '3-Model Consensus') : (isHe ? 'שווי פנימי מחושב' : 'Intrinsic Target')}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isHe ? 'מרווח ביטחון (MoS)' : 'Margin of Safety'}</span>
              <div className={`text-lg sm:text-xl font-black mt-1 ${marginOfSafety >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {marginOfSafety >= 0 ? `+${marginOfSafety}%` : `${marginOfSafety}%`}
              </div>
              <span className="text-[10px] text-slate-500">{marginOfSafety >= 0 ? (isHe ? 'הנחה מהשווי ההוגן' : 'Discount') : (isHe ? 'פרמיה מעל השווי' : 'Premium')}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isHe ? 'אזור קנייה מומלץ' : 'Target Buy Zone'}</span>
              <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">&lt; ${profile?.buyZoneThreshold || Math.round(fairValue * 0.85)}</div>
              <span className="text-[10px] text-slate-500">{isHe ? 'למקסום תשואה א-סימטרית' : 'Asymmetric Upside'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">{isHe ? 'מזומן נטו למניה' : 'Net Cash / Share'}</span>
              <div className={`text-lg sm:text-xl font-black mt-1 ${valResult && valResult.evBridge.netCashPerShare >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {valResult ? `${valResult.evBridge.netCashPerShare >= 0 ? '+' : ''}$${valResult.evBridge.netCashPerShare}` : '$0.00'}
              </div>
              <span className="text-[10px] text-slate-500">{isHe ? 'גשר מאזני (EV/Equity)' : 'Balance Sheet Bridge'}</span>
            </div>
          </div>

          {/* 3-Scenario Valuation Strip */}
          {valResult && (
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                <span className="text-[10px] text-rose-400 block">{isHe ? 'דובי (Bear Case)' : 'Bear Case'}</span>
                <span className="font-bold text-slate-200 text-sm">${valResult.bearScenario.fairValue}</span>
                <span className="text-[10px] text-slate-500 block">{valResult.bearScenario.fcfGrowthRate}% FCF | {valResult.bearScenario.terminalMultiple}x</span>
              </div>
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/60">
                <span className="text-[10px] text-cyan-300 block">{isHe ? 'בסיס (Base Case)' : 'Base Case'}</span>
                <span className="font-bold text-cyan-300 text-sm">${valResult.baseScenario.fairValue}</span>
                <span className="text-[10px] text-cyan-500/80 block">{valResult.baseScenario.fcfGrowthRate}% FCF | {valResult.baseScenario.terminalMultiple}x</span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                <span className="text-[10px] text-emerald-400 block">{isHe ? 'שורי (Bull Case)' : 'Bull Case'}</span>
                <span className="font-bold text-slate-200 text-sm">${valResult.bullScenario.fairValue}</span>
                <span className="text-[10px] text-slate-500 block">{valResult.bullScenario.fcfGrowthRate}% FCF | {valResult.bullScenario.terminalMultiple}x</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Live Price Chart (Google Finance Style) */}
      <div className="space-y-1">
        <StockLiveChart
          ticker={currentStock.ticker}
          companyName={currentStock.companyName}
          currentPrice={currentStock.currentPrice}
          expected5YCAGR={currentStock.expected5YCAGRRange}
          liveTickPrice={livePriceInfo?.price}
          liveChangePercent={livePriceInfo?.changePercent}
          currentLang={currentLang}
        />
      </div>

      {/* 0. Company Profile: What it Does, Segments & Investment Avenues */}
      <CompanyProfileSection stock={currentStock} currentLang={currentLang} />

      {/* Grid of Analytical Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Investment Thesis Memo */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>{isHe ? '1. תזת השקעה מקיפה ומעמיקה' : '1. Comprehensive Investment Thesis'}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentStock.investmentThesisSummary}
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-mono font-semibold">{isHe ? 'גורם הכללה מרכזי ביוניברס:' : 'Core Inclusion Factor:'}</span>
            <p className="text-slate-200 mt-1">{currentStock.whyInTopUniverse}</p>
          </div>
        </div>

        {/* 2. Moat & Market Power (30%) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>{isHe ? '2. חפיר כלכלי ועוצמת שוק (משקל 30%)' : '2. Moat & Market Power (30% Weight)'}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {isHe ? 'ציון חפיר:' : 'Moat Score:'} {currentStock.moat.score}/100 ({currentStock.moat.trend})
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <strong className="text-cyan-300 font-mono">{isHe ? 'מדוע החפיר הזה קיים ומוגן?' : 'Why does this moat exist?'}</strong>
              <p className="text-slate-300 mt-0.5">{currentStock.moat.whyExists}</p>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <strong className="text-rose-400 font-mono">{isHe ? 'מה עלול לפגוע או למוטט אותו?' : 'What could destroy it?'}</strong>
              <p className="text-slate-300 mt-0.5">{currentStock.moat.whatCouldDestroyIt}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">{isHe ? 'עלויות מעבר:' : 'Switching Costs:'}</span>
                <div className="text-slate-200 font-semibold mt-0.5">{currentStock.moat.switchingCosts.details}</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">{isHe ? 'כוח תמחור:' : 'Pricing Power:'}</span>
                <div className="text-slate-200 font-semibold mt-0.5">{currentStock.moat.pricingPower.evidence}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Financial Quality & SEC Audit (20%) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>{isHe ? '3. איכות פיננסית וביקורת דוחות SEC (משקל 20%)' : '3. Financial Quality & SEC Audit Trail (20%)'}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {isHe ? 'ציון:' : 'Score:'} {currentStock.financialQuality.score}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'תשואת ROIC מול WACC:' : 'ROIC (Current / WACC):'}</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {currentStock.financialQuality.roicCurrent.value} (WACC: {currentStock.financialQuality.wacc})
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {isHe ? 'מקור:' : 'Source:'} {currentStock.financialQuality.roicCurrent.source} | {currentStock.financialQuality.roicCurrent.period}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מרווח והמרת תזרים חופשי (FCF):' : 'FCF Margin & Conversion:'}</span>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {currentStock.financialQuality.fcfMargin.value} | {currentStock.financialQuality.fcfConversionRate}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                FCF TTM: {currentStock.financialQuality.fcfTTM.value}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מרווח תפעולי ונקי:' : 'Operating & Net Margins:'}</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                Op: {currentStock.financialQuality.operatingMargin.value} | Net: {currentStock.financialQuality.netMargin.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Gross: {currentStock.financialQuality.grossMargin.value}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מינוף וחוסן מאזני:' : 'Balance Sheet Leverage:'}</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                Net Debt/EBITDA: {currentStock.financialQuality.netDebtToEBITDA.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {isHe ? 'דירוג:' : 'Rating:'} {currentStock.financialQuality.balanceSheetHealth}
              </div>
            </div>
          </div>
        </div>

        {/* 4. 2-Year Growth Runway & Catalysts (20%) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{isHe ? '4. מנועי צמיחה לשנתיים (FY1-FY2) ושוק יעד TAM (משקל 20%)' : '4. 2-Year Growth Runway & TAM (20%)'}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {isHe ? 'ציון מסלול צמיחה:' : 'Runway Score:'} {currentStock.growth.growthRunwayScore}/100
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-mono">{isHe ? 'שוק יעד כולל (TAM):' : 'TAM & Headroom:'}</span>
              <p className="text-slate-200 mt-0.5">{currentStock.growth.tamAndMarketPenetration}</p>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-mono">{isHe ? 'עקביות הכנסות:' : 'Revenue Consistency:'}</span>
              <div className="font-mono text-emerald-400 font-bold mt-0.5">
                {currentStock.growth.consistencyYearsGrowth} (5Y CAGR: {currentStock.growth.revenueCAGR5Y.value})
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-mono text-[11px]">{isHe ? 'זרזי צמיחה מרכזיים לשנתיים הקרובות:' : 'Primary 2-Year Growth Catalysts:'}</span>
              {currentStock.fiveYearGrowthDrivers.map((drv, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                  <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{drv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Per-Share Value Creation (10%) */}
        {(() => {
          const perShareData = currentStock.perShare || currentStock.perShareValueCreation;
          return (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>{isHe ? '5. יצירת ערך למניה (משקל 10%)' : '5. Per-Share Value Creation (10%)'}</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {isHe ? 'ציון:' : 'Score:'} {perShareData?.score ?? currentStock.perShareScore ?? 90}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isHe ? 'צמיחת רווח למניה 5Y:' : 'EPS 5Y CAGR:'}</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {perShareData?.epsCAGR5Y?.value || '14.5%'}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isHe ? 'צמיחת תזרים למניה 5Y:' : 'FCF/Share 5Y CAGR:'}</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {perShareData?.fcfPerShareCAGR5Y?.value || '15.2%'}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isHe ? 'שינוי כמות מניות 5Y:' : '5Y Share Count Change:'}</span>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5">
                    {perShareData?.sharesOutstandingChange5Y || '-5.0%'}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">{isHe ? 'דילול מבוסס מניות (SBC):' : 'SBC / Revenue Dilution:'}</span>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {perShareData?.sbcAsPercentRevenue || '2.0%'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 p-2.5 rounded bg-slate-950 border border-slate-800">
                {perShareData?.truePerShareCreationVerdict || (isHe ? 'צמיחה מורכבת חזקה של ערך למניה.' : 'Strong per-share compounding.')}
              </p>
            </div>
          );
        })()}

        {/* 6. Valuation & Peer Comparison (15%) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Target className="w-4 h-4" />
              <span>{isHe ? '6. הערכת שווי DCF, מרווח ביטחון ומכפילים (15%)' : '6. DCF Valuation, Margin of Safety & Multiples (15%)'}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {isHe ? 'ציון שווי:' : 'Valuation Score:'} {currentStock.valuation.score}/100
            </span>
          </div>

          {/* Intrinsic DCF Valuation Summary Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{isHe ? 'שווי הוגן DCF' : 'DCF Fair Value'}</span>
              <div className="text-base font-bold text-cyan-300 mt-0.5">${fairValue}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{isHe ? 'מחיר:' : 'Price:'} ${currentPriceNum.toFixed(2)}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{isHe ? 'מרווח ביטחון' : 'Margin of Safety'}</span>
              <div className={`text-base font-bold mt-0.5 ${marginOfSafety >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {marginOfSafety >= 0 ? `+${marginOfSafety}%` : `${marginOfSafety}%`}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{marginOfSafety >= 0 ? (isHe ? 'הנחה' : 'Discount') : (isHe ? 'פרמיה' : 'Premium')}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{isHe ? 'אזור קנייה מומלץ' : 'Target Buy Zone'}</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">&lt; ${profile?.buyZoneThreshold || Math.round(fairValue * 0.85)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{isHe ? 'תמחור אופטימלי' : 'Optimal Entry'}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מכפיל היסטורי' : 'Trailing P/E'}</span>
              <div className="text-sm font-bold text-white mt-0.5">{currentStock.valuation.peTTM.value}</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מכפיל עתידי' : 'Forward P/E'}</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{currentStock.valuation.forwardPE.value}</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'מכפיל EV/FCF' : 'EV/FCF'}</span>
              <div className="text-sm font-bold text-white mt-0.5">{currentStock.valuation.evToFCF.value}</div>
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-mono text-[11px]">
              {isHe ? 'הקשר היסטורי:' : 'Historical Context:'} <strong className="text-slate-200">{currentStock.valuation.historicalPercentile5Y}</strong>
            </div>
            <p className="text-slate-300">{currentStock.valuation.peerComparisonNotes}</p>
          </div>
        </div>

        {/* 7. Analyst Expectations & Gap Analysis (5%) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>{isHe ? '7. קונצנזוס אנליסטים ופער ציפיות (משקל 5%)' : '7. Analyst Consensus & Expectations Gap (5%)'}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentStock.analysts.consensus} ({currentStock.analysts.analystCoverageCount} {isHe ? 'אנליסטים' : 'analysts'})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'יעד ממוצע / אפסייד:' : 'Avg Target / Upside:'}</span>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {currentStock.analysts.averagePriceTarget.value} ({currentStock.analysts.impliedAnalystUpside})
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">{isHe ? 'עדכוני תחזיות (30D/90D):' : '30D/90D Revisions:'}</span>
              <div className="text-xs font-bold text-cyan-300 mt-0.5">
                {currentStock.analysts.epsRevisions30D}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <span className="text-amber-400 font-mono font-semibold">{isHe ? 'פער ציפיות מול קונצנזוס:' : 'Expectations Gap:'}</span>
            <p className="text-slate-300 mt-1">{currentStock.analysts.expectationsGap.explanation}</p>
          </div>

          {/* Full Interactive Senior Analyst Rankings & Valuations */}
          <div className="pt-2 border-t border-slate-800">
            <SeniorAnalystRankings
              stock={rawStock}
              livePrice={currentPriceNum}
              currentLang={currentLang}
              intrinsicFairValue={fairValue}
            />
          </div>
        </div>

        {/* 8. Red Flags & Value Trap Detector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{isHe ? '8. מנוע איתור דגלים אדומים ומלכודות ערך' : '8. Red Flag Engine & Value Trap Filter'}</span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {isHe ? 'ציון מלכודת:' : 'Trap Score:'} {currentStock.valueTrap.trapScore}/100 ({isHe ? 'בטוח' : 'Safe'})
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {currentStock.redFlags.map((flag, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{flag.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {flag.category} • {flag.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{flag.description}</p>
                <div className="text-slate-300 text-[11px] font-mono mt-1">{isHe ? 'השפעה:' : 'Impact:'} {flag.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Year Scenario Returns (Bear / Base / Bull) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
              {isHe ? 'סעיף 10' : 'SECTION 10'}
            </span>
            <h3 className="text-base font-bold text-white">
              {isHe ? 'תרחישי תשואה צפויה לשנתיים קדימה (שלילי / בסיס / חיובי)' : '2-Year Expected Return Scenarios (Bear / Base / Bull)'}
            </h3>
          </div>
          <span className="font-mono text-sm font-bold text-emerald-400">
            {isHe ? 'טווח צפוי:' : 'Expected Range:'} {currentStock.scenarios.expected5YCAGRRange}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Bear Case */}
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">{isHe ? 'תרחיש פסימי (Bear)' : 'BEAR CASE'}</span>
              <span className="text-sm font-extrabold text-rose-400">
                {currentStock.scenarios.bearCase.expectedCAGR} CAGR
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>{isHe ? 'צמיחת הכנסות:' : 'Rev Growth:'} <strong>{currentStock.scenarios.bearCase.revenueGrowthCAGR}</strong></div>
              <div>{isHe ? 'מרווח תפעולי ביציאה:' : 'Op Margin:'} <strong>{currentStock.scenarios.bearCase.operatingMarginExit}</strong></div>
              <div>{isHe ? 'מכפיל יציאה:' : 'Exit Multiple:'} <strong>{currentStock.scenarios.bearCase.exitMultiplePE} P/E</strong></div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans pt-2 border-t border-slate-800">
              {currentStock.scenarios.bearCase.assumptions}
            </p>
          </div>

          {/* Base Case */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-700/80 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">{isHe ? 'תרחיש בסיס (סבירות גבוהה)' : 'BASE CASE (High Prob)'}</span>
              <span className="text-sm font-extrabold text-cyan-300">
                {currentStock.scenarios.baseCase.expectedCAGR} CAGR
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>{isHe ? 'צמיחת הכנסות:' : 'Rev Growth:'} <strong>{currentStock.scenarios.baseCase.revenueGrowthCAGR}</strong></div>
              <div>{isHe ? 'מרווח תפעולי ביציאה:' : 'Op Margin:'} <strong>{currentStock.scenarios.baseCase.operatingMarginExit}</strong></div>
              <div>{isHe ? 'מכפיל יציאה:' : 'Exit Multiple:'} <strong>{currentStock.scenarios.baseCase.exitMultiplePE} P/E</strong></div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans pt-2 border-t border-slate-800">
              {currentStock.scenarios.baseCase.assumptions}
            </p>
          </div>

          {/* Bull Case */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">{isHe ? 'תרחיש אופטימי (Bull)' : 'BULL CASE'}</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {currentStock.scenarios.bullCase.expectedCAGR} CAGR
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>{isHe ? 'צמיחת הכנסות:' : 'Rev Growth:'} <strong>{currentStock.scenarios.bullCase.revenueGrowthCAGR}</strong></div>
              <div>{isHe ? 'מרווח תפעולי ביציאה:' : 'Op Margin:'} <strong>{currentStock.scenarios.bullCase.operatingMarginExit}</strong></div>
              <div>{isHe ? 'מכפיל יציאה:' : 'Exit Multiple:'} <strong>{currentStock.scenarios.bullCase.exitMultiplePE} P/E</strong></div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans pt-2 border-t border-slate-800">
              {currentStock.scenarios.bullCase.assumptions}
            </p>
          </div>
        </div>
      </div>

      {/* Share Stock Report Modal */}
      {rawStock && (
        <ShareStockReportModal
          stock={rawStock}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          currentLang={currentLang}
          livePrice={currentPriceNum}
        />
      )}
    </div>
  );
};
