import React, { useState, useMemo, useEffect } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage, translations } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getStockCompetitiveProfile, StockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import { getResearchStock, resolveTickerSymbol } from '../data/researchStockGenerator';
import {
  TrendingUp,
  Sliders,
  Scale,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCircle2,
  Percent,
  DollarSign,
  Compass,
  Search,
  RefreshCw,
} from 'lucide-react';

interface ReverseDcfExpectationsProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  onAddStockToUniverse?: (stock: ResearchStock) => void;
}

export const ReverseDcfExpectations: React.FC<ReverseDcfExpectationsProps> = ({
  stocks,
  selectedStock,
  livePrices = {},
  onOpenDeepDive,
  currentLang = 'he',
  onAddStockToUniverse,
}) => {
  const isHe = currentLang === 'he';
  const t = translations[currentLang] || translations.en;

  const [selectedTicker, setSelectedTicker] = useState<string>(
    selectedStock?.ticker || stocks[0]?.ticker || 'UNH'
  );
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStock?.ticker && selectedStock.ticker !== selectedTicker) {
      setSelectedTicker(selectedStock.ticker);
    }
  }, [selectedStock?.ticker]);

  const rawStock = useMemo(() => {
    const found = stocks.find((s) => s.ticker === selectedTicker);
    if (found) return found;
    return getResearchStock(selectedTicker);
  }, [stocks, selectedTicker]);

  const stock = localizeStock(rawStock, currentLang);
  const liveInfo = livePrices[stock.ticker];
  const parsedPrice = parseFloat(stock.currentPrice.replace(/[^0-9.]/g, ''));
  const currentPrice = (liveInfo && liveInfo.price > 0) ? liveInfo.price : (!isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 100);
  const profile: StockCompetitiveProfile = getStockCompetitiveProfile(rawStock, currentPrice);

  // Reverse DCF Interactive Parameters
  const [discountRate, setDiscountRate] = useState<number>(9.5);
  const [terminalMultiple, setTerminalMultiple] = useState<number>(22.0);
  const [terminalGrowth, setTerminalGrowth] = useState<number>(3.0);

  const handleStockChange = (newTicker: string) => {
    const clean = resolveTickerSymbol(newTicker);
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
    const clean = resolveTickerSymbol(searchInput);
    if (!clean) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      let resolved = stocks.find((s) => s.ticker === clean);
      if (!resolved) {
        const res = await fetch('/api/analyze-ticker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ticker: clean, language: currentLang }),
        });
        const contentType = res.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
        if (res.status === 404) {
          setSearchError(data?.error || (isHe ? `הסימול ${clean} לא נמצא בבורסה או ב-SEC.` : `Ticker ${clean} not found.`));
          return;
        }
        if (res.ok && data?.stock) {
          resolved = localizeStock(data.stock, currentLang);
        } else {
          resolved = getResearchStock(clean);
        }
        if (onAddStockToUniverse && resolved) {
          onAddStockToUniverse(resolved);
        }
      }
      setSelectedTicker(clean);
      setSearchInput('');
    } catch {
      const generated = getResearchStock(clean);
      if (onAddStockToUniverse && generated) onAddStockToUniverse(generated);
      setSelectedTicker(clean);
      setSearchInput('');
    } finally {
      setIsSearching(false);
    }
  };

  const popularTickers = ['NVDA', 'MSFT', 'UNH', 'GOOGL', 'AAPL', 'COST', 'V', 'PLTR', 'TSLA', 'AMZN', 'META', 'LLY', 'AVGO'];

  // Dynamic Implied Growth calculation based on user adjustments
  // Formula: Higher price / higher discount rate requires higher growth
  const baseImplied = profile.marketImpliedGrowthRate;
  const adjustedImpliedGrowth = Math.max(
    2.0,
    parseFloat((baseImplied + (discountRate - 9.5) * 1.2 - (terminalMultiple - 22.0) * 0.35 + (currentPrice / profile.fairValueMidpoint - 1.0) * 8.0).toFixed(1))
  );

  const growthGap = parseFloat((profile.fundamentalExpectedGrowthRate - adjustedImpliedGrowth).toFixed(1));
  const isAsymmetricPositive = growthGap > 1.5;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>{isHe ? 'ניהול ציפיות ותמחור הפוך (Expectations Investing)' : 'Reverse DCF & Implied Expectations'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isHe ? 'מה השוק כבר מתמחר במחיר המניה הנוכחי?' : 'What Growth Is Priced into the Current Stock Price?'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isHe
                ? 'בדוק לכל מניה מהו קצב הצמיחה השנתי (CAGR) שהשוק דורש ממנה כדי להצדיק את המחיר הנוכחי, ומצא אסימטריה חיובית להשקעה.'
                : 'Check for ANY stock what annual FCF/EPS growth rate the market is expecting to find asymmetric investment opportunities.'}
            </p>
          </div>

          {/* Universal Search & Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isHe ? 'הקלד טיקר (למשל PLTR)...' : 'Search ticker (e.g. PLTR)...'}
                className="w-full pl-8 rtl:pr-8 rtl:pl-14 pr-14 py-2 bg-slate-950 border border-cyan-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={isSearching || !searchInput.trim()}
                className="absolute right-1 rtl:left-1 rtl:right-auto top-1 px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold rounded transition cursor-pointer"
              >
                {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : isHe ? 'חשב' : 'Go'}
              </button>
            </form>

            <div className="sm:w-52">
              <select
                value={selectedTicker}
                onChange={(e) => handleStockChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {stocks.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} — {s.companyName.slice(0, 18)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {searchError && (
            <div className="text-xs font-mono text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg px-3 py-2">
              {searchError}
            </div>
          )}
        </div>

        {/* Quick Tickers Bar */}
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

      {/* Main Analysis Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Implied Growth Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <StockLogoBadge ticker={stock.ticker} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{stock.companyName}</h2>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                      {stock.ticker}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {isHe ? 'מחיר שוק חי:' : 'Live Price:'} <strong className="text-white">${currentPrice.toFixed(2)}</strong> | {isHe ? 'סקטור:' : 'Sector:'} {stock.sector}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  isAsymmetricPositive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isHe ? (isAsymmetricPositive ? '🟢 הזדמנות אסימטרית חיובית' : '🟡 תמחור מאוזן') : (isAsymmetricPositive ? '🟢 Asymmetric Opportunity' : '🟡 Balanced Valuation')}
                </span>
              </div>
            </div>

            {/* Core Expectations Comparison Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Market Implied Rate */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {isHe ? 'צמיחה שגלומה במחיר השוק (Market Implied)' : 'Market Implied 5Y Growth'}
                </div>
                <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">
                  {adjustedImpliedGrowth}% <span className="text-xs text-slate-500 font-normal">CAGR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {isHe
                    ? `במחיר הנוכחי ($${currentPrice.toFixed(2)}), המשקיעים מתמחרים צמיחת תזרים מזומנים חופשי של ${adjustedImpliedGrowth}% לשנה.`
                    : `At $${currentPrice.toFixed(2)}, the market requires ${adjustedImpliedGrowth}% annualized FCF growth to justify current valuation.`}
                </p>
              </div>

              {/* Fundamental Expected Rate */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 relative overflow-hidden">
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  {isHe ? 'התחזית הפונדמנטלית שלנו (Our Fundamental)' : 'Our Fundamental 5Y Growth'}
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                  {profile.fundamentalExpectedGrowthRate}% <span className="text-xs text-slate-500 font-normal">CAGR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {isHe
                    ? `הערכתנו המבוססת על כוח תמחור, חפיר וגידול שוק חופשי היא ${profile.fundamentalExpectedGrowthRate}% לשנה.`
                    : `Our bottom-up estimate based on moat pricing power and unit volume growth is ${profile.fundamentalExpectedGrowthRate}% CAGR.`}
                </p>
              </div>
            </div>

            {/* Gap Analysis Bar */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-6">
              <div className="flex justify-between items-center text-xs mb-2 font-mono">
                <span className="text-slate-400">{isHe ? 'פער הציפיות (Expectations Gap / Margin of Safety):' : 'Expectations Gap (Safety Margin):'}</span>
                <span className={`font-bold ${growthGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {growthGap > 0 ? `+${growthGap}%` : `${growthGap}%`} {isHe ? 'מרווח חיובי' : 'Spread'}
                </span>
              </div>
              
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-cyan-500 h-full"
                  style={{ width: `${Math.min(100, (adjustedImpliedGrowth / 25) * 100)}%` }}
                  title="Market Implied"
                />
                {growthGap > 0 && (
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${Math.min(100, (growthGap / 25) * 100)}%` }}
                    title="Our Upside Spread"
                  />
                )}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0%</span>
                <span className="text-cyan-400">● {isHe ? 'שוק' : 'Market'}: {adjustedImpliedGrowth}%</span>
                <span className="text-emerald-400">● {isHe ? 'הערכתנו' : 'Our Estimate'}: {profile.fundamentalExpectedGrowthRate}%</span>
                <span>25% CAGR</span>
              </div>
            </div>

            {/* Interactive Model Sensitivity Sliders */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>{isHe ? 'מנופי רגישות למודל (Reverse DCF Sensitivity Inputs)' : 'Model Sensitivity Controls'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                {/* Discount Rate */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isHe ? 'מחיר הון (WACC):' : 'Discount Rate:'}</span>
                    <strong className="text-cyan-300">{discountRate.toFixed(1)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="7.0"
                    max="13.0"
                    step="0.25"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                  />
                </div>

                {/* Terminal Multiple */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isHe ? 'מכפיל יציאה 5Y:' : 'Terminal P/E:'}</span>
                    <strong className="text-cyan-300">{terminalMultiple.toFixed(1)}x</strong>
                  </div>
                  <input
                    type="range"
                    min="14.0"
                    max="32.0"
                    step="0.5"
                    value={terminalMultiple}
                    onChange={(e) => setTerminalMultiple(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                  />
                </div>

                {/* Terminal Growth */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isHe ? 'צמיחה נצחית:' : 'Terminal Growth:'}</span>
                    <strong className="text-cyan-300">{terminalGrowth.toFixed(1)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="4.5"
                    step="0.25"
                    value={terminalGrowth}
                    onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Incremental ROIC (ROIIC) & Capital Allocation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{isHe ? 'תשואה שולית על הון מושקע (Incremental ROIC / ROIIC)' : 'Incremental Return on Invested Capital (ROIIC)'}</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {profile.incrementalROIC_5Y} 5Y ROIIC
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {isHe
                ? `התשואה השולית (Incremental ROIC) מודדת כמה רווח תפעולי נוסף החברה מפיקה על כל דולר חדש שהיא משקיעה בצמיחה. ציון של ${profile.incrementalROIC_5Y} מוכיח שהצמיחה היא איכותית ביותר ומייצרת ערך ממשי לבעלי המניות.`
                : `Incremental ROIC measures the operating profit generated for every new dollar of capital reinvested in the business. A ${profile.incrementalROIC_5Y} 5-year ROIIC proves that future growth compounds intrinsic shareholder value at premium rates.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isHe ? 'השקעה בתחזוקה:' : 'Maint. CapEx:'}</span>
                <strong className="text-slate-200 text-sm">{profile.maintenanceCapExPct}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isHe ? 'השקעה בצמיחה:' : 'Growth Reinvest:'}</span>
                <strong className="text-emerald-400 text-sm">{profile.growthInvestmentPct}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isHe ? 'SBC מסך ההכנסות:' : 'SBC % of Rev:'}</span>
                <strong className="text-slate-200 text-sm">{profile.sbcAsPctRevenue}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isHe ? 'צמצום מניות 5Y:' : 'Net Share Change:'}</span>
                <strong className="text-emerald-400 text-sm">{profile.netShareCountCAGR5Y}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Buy Zones & Why Now (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Buy Zone / Watch Zone / Avoid Zone Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'טווחי החלטה מוסדיים (Buy / Watch / Avoid Zones)' : 'Institutional Valuation Zones'}</span>
            </h3>

            {/* Target Price Spectrum */}
            <div className="space-y-3 font-mono text-xs">
              {/* Buy Zone */}
              <div className={`p-3.5 rounded-xl border transition ${
                currentPrice <= profile.buyZoneThreshold
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isHe ? 'אזור קנייה אטרקטיבי (Buy Zone):' : 'Strong Buy Zone:'}</span>
                  </span>
                  <span className="font-extrabold text-sm text-emerald-300">&lt; ${profile.buyZoneThreshold}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {isHe
                    ? 'תמחור המציע יחס סיכוי-סיכון אסימטרי ומרווח ביטחון משמעותי מול תזת הצמיחה.'
                    : 'Valuation provides wide margin of safety with strong asymmetric upside vs risk.'}
                </p>
              </div>

              {/* Watch Zone */}
              <div className={`p-3.5 rounded-xl border transition ${
                currentPrice > profile.buyZoneThreshold && currentPrice <= profile.watchZoneUpper
                  ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <Info className="w-3.5 h-3.5" />
                    <span>{isHe ? 'אזור מעקב ואיסוף שקול (Watch Zone):' : 'Hold / Accumulate Zone:'}</span>
                  </span>
                  <span className="font-extrabold text-sm text-cyan-300">${profile.buyZoneThreshold} – ${profile.watchZoneUpper}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {isHe
                    ? 'מחיר הוגן המשקף תשואה נאותה לחברה איכותית, מומלץ להמתין להזדמנות תנודתית או איסוף מדורג.'
                    : 'Fair valuation reflecting solid long-term returns; dollar-cost averaging recommended.'}
                </p>
              </div>

              {/* Avoid Zone */}
              <div className={`p-3.5 rounded-xl border transition ${
                currentPrice > profile.expensiveZoneThreshold
                  ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isHe ? 'אזור תמחור מתוח (Expensive / Avoid):' : 'Overvalued / Avoid Zone:'}</span>
                  </span>
                  <span className="font-extrabold text-sm text-rose-300">&gt; ${profile.expensiveZoneThreshold}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {isHe
                    ? 'השוק מתמחר צמיחה אגרסיבית ללא מרווח ביטחון לטעויות תפעוליות.'
                    : 'Current price requires unrealistic long-term execution with high multiple contraction risk.'}
                </p>
              </div>
            </div>
          </div>

          {/* Why Now & Thesis Strength Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono">{isHe ? 'למה דווקא עכשיו? (Why Now)' : 'Strategic Context (Why Now)'}</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {profile.opportunityType}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              {profile.whyNow}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onOpenDeepDive(rawStock)}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs font-mono transition flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <span>{isHe ? `צפה במחקר עומק מלא על ${stock.ticker}` : `Open Full Institutional Memo on ${stock.ticker}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
