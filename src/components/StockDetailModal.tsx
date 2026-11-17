import React, { useState } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { StockLiveChart } from './StockLiveChart';
import { QuickActionPlusMenu } from './QuickActionPlusMenu';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
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
  X,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Target,
  FileText,
  AlertTriangle,
  ExternalLink,
  Scale,
  CheckCircle2,
  MessageCircle,
  Mail,
  Share2,
  Calculator,
  Award,
  ArrowUpRight,
} from 'lucide-react';

interface StockDetailModalProps {
  stock: ResearchStock | null;
  watchlist?: WatchlistItem[];
  onToggleWatchlist?: (stock: ResearchStock) => void;
  onAddToPortfolio?: (stock: ResearchStock) => void;
  onClose: () => void;
  onGoToDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  livePrice?: { price: number; changePercent: number; changeAmount: number };
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock: rawStock,
  watchlist = [],
  onToggleWatchlist,
  onAddToPortfolio,
  onClose,
  onGoToDeepDive,
  currentLang = 'he',
  livePrice,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysts' | 'moat'>('overview');

  if (!rawStock) return null;

  const stock = localizeStock(rawStock, currentLang);
  const isHe = currentLang === 'he';
  const parsedStockPrice = parseFloat((stock.currentPrice || '').replace(/[^0-9.]/g, ''));
  const currentPriceNum = livePrice && typeof livePrice.price === 'number' && livePrice.price > 0
    ? livePrice.price
    : (!isNaN(parsedStockPrice) && parsedStockPrice > 0 ? parsedStockPrice : 100);

  const profile = getStockCompetitiveProfile(rawStock, currentPriceNum);
  const valResult = profile?.valuationBreakdown;
  const fairValue = valResult?.blendedFairValue || profile?.fairValueMidpoint || Math.round(currentPriceNum * 1.22);
  const marginOfSafety = fairValue > 0 ? Math.round(((fairValue - currentPriceNum) / fairValue) * 100) : 0;

  const shareData: StockShareData = {
    stock,
    profile,
    currentPrice: currentPriceNum,
    fairValue,
    marginOfSafety,
    actionRecommendation: stock.finalVerdict || 'BUY',
    currentLang,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-slate-900 border border-cyan-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-800 pr-10">
          <div className="flex items-center gap-4">
            <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-bold font-mono text-white">{stock.ticker}</span>
                <span className="text-sm font-medium text-slate-300">{stock.companyName}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {stock.exchange}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                  {stock.finalVerdict}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                  {isHe
                    ? profile.opportunityType === 'Quality at Value'
                      ? 'איכות בתמחור נוח'
                      : profile.opportunityType === 'Growth Compounder'
                      ? 'קומפאונדר צמיחה'
                      : profile.opportunityType === 'Contrarian Quality'
                      ? 'איכות מנוגדת למגמה'
                      : profile.opportunityType === 'Fair Value'
                      ? 'מחיר הוגן'
                      : 'אזור מעקב'
                    : profile.opportunityType}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                {stock.sector} • {stock.industry} • {isHe ? 'שווי שוק:' : 'Market Cap:'} {stock.marketCap}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <div className="text-[10px] text-slate-400">{isHe ? 'ציון' : 'Score'}</div>
              <div className="text-lg font-bold text-cyan-300">{stock.investmentScore}/100</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <div className="text-[10px] text-slate-400">{isHe ? 'חוזק תזה' : 'Thesis'}</div>
              <div className="text-lg font-bold text-emerald-400">{profile.thesisStrengthScore}/100</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <div className="text-[10px] text-slate-400">{isHe ? 'תשואה 5Y' : '5Y CAGR'}</div>
              <div className="text-lg font-bold text-emerald-400">{stock.expected5YCAGRRange}</div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{isHe ? 'סקירה ותמחור פנימי (DCF)' : 'Overview & DCF'}</span>
          </button>

          <button
            onClick={() => setActiveTab('analysts')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'analysts'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHe ? 'דירוג והערכות שווי אנליסטים בכירים' : 'Senior Analyst Valuations'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-700 ml-1">
              Wall St
            </span>
          </button>

          <button
            onClick={() => setActiveTab('moat')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'moat'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isHe ? 'חפיר ותזה עסקית' : 'Moat & Thesis'}</span>
          </button>
        </div>

        {/* Tab 1: Overview & Intrinsic DCF */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Company Business Activity, Segments & Investment Avenues */}
            <CompanyProfileSection stock={stock} currentLang={currentLang} />

            {/* Reverse DCF & Expectations Strip */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/70 space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isHe ? 'הערכת שווי פנימי (DCF) ואזורי תמחור' : 'Intrinsic DCF Valuation & Pricing Zones'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{isHe ? 'מחיר נוכחי:' : 'Current Price:'}</span>
                  <strong className="text-white">${currentPriceNum.toFixed(2)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{isHe ? 'שווי הוגן מוסדי' : 'Fair Value (Blended)'}</span>
                  <div className="text-base font-bold text-cyan-300 mt-0.5">${fairValue}</div>
                  <span className="text-[10px] text-slate-500">{valResult ? (isHe ? 'שילוב 3 מודלים' : '3-Model Blend') : (isHe ? 'שווי פנימי מחושב' : 'Intrinsic Target')}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{isHe ? 'מרווח ביטחון' : 'Margin of Safety'}</span>
                  <div className={`text-base font-bold mt-0.5 ${marginOfSafety >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {marginOfSafety >= 0 ? `+${marginOfSafety}%` : `${marginOfSafety}%`}
                  </div>
                  <span className="text-[10px] text-slate-500">{marginOfSafety >= 0 ? (isHe ? 'הנחה מהשווי' : 'Discount') : (isHe ? 'פרמיה' : 'Premium')}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{isHe ? 'אזור קנייה מומלץ' : 'Target Buy Zone'}</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">&lt; ${profile.buyZoneThreshold}</div>
                  <span className="text-[10px] text-slate-500">{isHe ? 'תמחור אופטימלי' : 'Optimal Entry'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{isHe ? 'מזומן נטו למניה' : 'Net Cash / Share'}</span>
                  <div className={`text-base font-bold mt-0.5 ${valResult && valResult.evBridge.netCashPerShare >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {valResult ? `${valResult.evBridge.netCashPerShare >= 0 ? '+' : ''}$${valResult.evBridge.netCashPerShare}` : '$0.00'}
                  </div>
                  <span className="text-[10px] text-slate-500">{isHe ? 'גשר מאזני (EV/Equity)' : 'Balance Sheet Bridge'}</span>
                </div>
              </div>

              {/* 3-Scenario Valuation Strip */}
              {valResult && (
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-rose-400 block">{isHe ? 'דובי (Bear)' : 'Bear Case'}</span>
                    <span className="font-bold text-slate-200">${valResult.bearScenario.fairValue}</span>
                  </div>
                  <div className="p-1.5 rounded bg-cyan-950/30 border border-cyan-800/50">
                    <span className="text-[10px] text-cyan-300 block">{isHe ? 'בסיס (Base)' : 'Base Case'}</span>
                    <span className="font-bold text-cyan-300">${valResult.baseScenario.fairValue}</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
                    <span className="text-[10px] text-emerald-400 block">{isHe ? 'שורי (Bull)' : 'Bull Case'}</span>
                    <span className="font-bold text-slate-200">${valResult.bullScenario.fairValue}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Google Finance Interactive Live Chart */}
            <div className="space-y-1">
              <StockLiveChart
                ticker={stock.ticker}
                companyName={stock.companyName}
                currentPrice={stock.currentPrice}
                expected5YCAGR={stock.expected5YCAGRRange}
                liveTickPrice={livePrice?.price}
                liveChangePercent={livePrice?.changePercent}
                currentLang={currentLang}
              />
            </div>

            {/* 6 Category Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-center text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">{isHe ? 'חפיר (30%)' : 'Moat (30%)'}</div>
                <div className="text-sm font-bold text-white mt-0.5">{stock.moatScore}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">{isHe ? 'איכות (20%)' : 'Quality (20%)'}</div>
                <div className="text-sm font-bold text-white mt-0.5">{stock.financialQualityScore}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">{isHe ? 'צמיחה (20%)' : 'Growth (20%)'}</div>
                <div className="text-sm font-bold text-white mt-0.5">{stock.growthScore}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">{isHe ? 'למניה (10%)' : 'Per-Share (10%)'}</div>
                <div className="text-sm font-bold text-white mt-0.5">{stock.perShareScore}</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">{isHe ? 'שווי (15%)' : 'Valuation (15%)'}</div>
                <div className="text-sm font-bold text-white mt-0.5">{stock.valuationScore}</div>
              </div>
              <div
                onClick={() => setActiveTab('analysts')}
                className="p-2.5 rounded bg-slate-950 border border-cyan-800/80 hover:border-cyan-400 cursor-pointer transition group"
                title={isHe ? 'לחץ לצפייה בדירוג אנליסטים בכירים' : 'Click to view senior analyst rankings'}
              >
                <div className="text-[10px] text-cyan-400 font-bold group-hover:text-cyan-300">
                  {isHe ? 'אנליסטים (5%) ★' : 'Analyst (5%) ★'}
                </div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">{stock.analystScore}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5 underline">
                  {isHe ? 'צפה ברשימה' : 'View list'}
                </div>
              </div>
            </div>

            {/* Senior Analyst Valuation Quick Callout */}
            <div
              onClick={() => setActiveTab('analysts')}
              className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-700/60 hover:border-cyan-400 flex items-center justify-between gap-3 cursor-pointer transition shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-900/60 text-indigo-300 group-hover:text-cyan-300 border border-indigo-700 shadow-inner">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 flex items-center gap-2 flex-wrap">
                    <span>{isHe ? 'דירוג והערכות שווי אנליסטים בכירים' : 'Senior Wall Street Analyst Valuations'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {stock.analysts?.consensus || 'Buy'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {stock.analysts?.analystCoverageCount || 35} {isHe ? 'אנליסטים מוסדיים' : 'analysts'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {isHe ? 'מחיר יעד קונצנזוס:' : 'Consensus Target:'}{' '}
                    <strong className="text-cyan-300">
                      {stock.analysts?.averagePriceTarget?.value || `$${fairValue}`}
                    </strong>{' '}
                    ({stock.analysts?.impliedAnalystUpside || '+19%'}) •{' '}
                    <span className="text-slate-300">
                      {isHe
                        ? 'כולל דוחות מפורטים מ-Goldman Sachs, Morgan Stanley, JPMorgan, BofA...'
                        : 'Includes Goldman Sachs, Morgan Stanley, JPMorgan, BofA...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-cyan-400 group-hover:text-cyan-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0">
                <span className="hidden sm:inline">{isHe ? 'צפה ברשימה המלאה' : 'View Full List'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Investment Thesis & Moat Summary */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {isHe ? 'תזת השקעה מרכזית:' : 'Core Investment Thesis:'}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{stock.investmentThesisSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-mono">{isHe ? 'עמידות ומבנה החפיר הכלכלי:' : 'Moat Defense & Durability:'}</span>
                  <p className="text-slate-200 mt-1">{stock.moat.whyExists}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-mono">{isHe ? 'מרווח ROIC מול WACC:' : 'ROIC vs WACC Spread:'}</span>
                  <div className="font-mono text-emerald-400 font-bold mt-1">
                    ROIC: {stock.financialQuality.roicCurrent.value} (WACC: {stock.financialQuality.wacc})
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {isHe ? 'מקור ביקורת:' : 'Audit Citation:'} {stock.financialQuality.roicCurrent.source} ({stock.financialQuality.roicCurrent.period})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Senior Analyst Valuations & Ranked Breakdown */}
        {activeTab === 'analysts' && (
          <div className="space-y-4">
            <SeniorAnalystRankings
              stock={rawStock}
              livePrice={currentPriceNum}
              currentLang={currentLang}
              intrinsicFairValue={fairValue}
              onGoToDeepDive={onGoToDeepDive}
            />
          </div>
        )}

        {/* Tab 3: Moat & Business Thesis */}
        {activeTab === 'moat' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    {isHe ? 'ניתוח חפיר כלכלי ועמידות מבנית' : 'Economic Moat & Durability Analysis'}
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  {stock.moatScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{isHe ? 'מקור החפיר העיקרי:' : 'Primary Moat Source:'}</span>
                  <p className="text-slate-200 text-xs leading-relaxed">{stock.moat.whyExists}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">{isHe ? 'כוח תמחור וגמישות:' : 'Pricing Power & Elasticity:'}</span>
                  <p className="text-slate-200 text-xs leading-relaxed">{stock.moat.pricingPower}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[11px]">{isHe ? 'סמני התרחבות או שחיקה של החפיר:' : 'Moat Trajectory Indicators:'}</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isHe ? 'מגמת חפיר' : 'Moat Trend'}</span>
                    <span className="text-emerald-400 font-bold">{stock.moatTrend}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isHe ? 'עלויות מעבר' : 'Switching Costs'}</span>
                    <span className="text-cyan-300 font-bold">{isHe ? 'גבוהות מאוד' : 'Very High'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isHe ? 'אפקט רשת' : 'Network Effects'}</span>
                    <span className="text-cyan-300 font-bold">{isHe ? 'דומיננטי' : 'Dominant'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">{isHe ? 'יתרון עלות' : 'Cost Advantage'}</span>
                    <span className="text-emerald-400 font-bold">{isHe ? 'מבני' : 'Structural'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">{isHe ? 'מרווח ROIC מול WACC ויצירת ערך למניה:' : 'ROIC vs WACC Spread:'}</span>
                <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                  <span className="text-emerald-400">ROIC: {stock.financialQuality.roicCurrent.value}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">WACC: {stock.financialQuality.wacc}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-300">{isHe ? 'יצירת ערך כלכלי מובהקת' : 'Economic Value Added'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 font-mono">
            {isHe ? 'תאריך בדיקה:' : 'Analysis Date:'} {stock.analysisDate} • SEC 10-K Audited
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Quick WhatsApp Share */}
            <button
              onClick={() => openWhatsAppShare(shareData)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow"
              title={isHe ? 'שתף בוואטסאפ' : 'Share via WhatsApp'}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isHe ? 'וואטסאפ' : 'WhatsApp'}</span>
            </button>

            {/* Quick Email Share */}
            <button
              onClick={() => openEmailShare(shareData)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold font-mono rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow"
              title={isHe ? 'שתף באימייל' : 'Share via Email'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isHe ? 'אימייל' : 'Email'}</span>
            </button>

            {/* More Share Options */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs rounded-lg transition border border-slate-700 cursor-pointer"
              title={isHe ? 'אפשרויות שיתוף נוספות' : 'More share options'}
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              {isHe ? 'סגור' : 'Close'}
            </button>
            <button
              onClick={() => {
                onClose();
                onGoToDeepDive(rawStock);
              }}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1 cursor-pointer"
            >
              <span>{isHe ? 'תזכיר מחקר מעמיק' : 'Deep Dive'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareStockReportModal
        stock={rawStock}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentLang={currentLang}
        livePrice={currentPriceNum}
      />
    </div>
  );
};
