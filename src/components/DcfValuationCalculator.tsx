import React, { useState, useMemo, useEffect } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getResearchStock, resolveTickerSymbol } from '../data/researchStockGenerator';
import { calculateMultiModelValuation, extractFinancialInputs, MultiModelValuationResult } from '../data/valuationEngine';
import {
  Calculator,
  Sliders,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Search,
  RefreshCw,
  Edit3,
  RotateCcw,
  Landmark,
  Scale,
  DollarSign,
  PieChart,
} from 'lucide-react';

interface DcfValuationCalculatorProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onAddStockToUniverse?: (stock: ResearchStock) => void;
}

export const DcfValuationCalculator: React.FC<DcfValuationCalculatorProps> = ({
  stocks,
  selectedStock,
  onOpenDeepDive,
  currentLang = 'he',
  livePrices = {},
  onAddStockToUniverse,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>(
    selectedStock?.ticker || stocks[0]?.ticker || 'UNH'
  );
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCustomOverrides, setShowCustomOverrides] = useState(false);
  const [customFcfOverride, setCustomFcfOverride] = useState<number | null>(null);
  const [customSharesOverride, setCustomSharesOverride] = useState<number | null>(null);
  const [customPriceOverride, setCustomPriceOverride] = useState<number | null>(null);
  const [customCashOverride, setCustomCashOverride] = useState<number | null>(null);
  const [customDebtOverride, setCustomDebtOverride] = useState<number | null>(null);

  // Sync with selectedStock if it changes externally
  useEffect(() => {
    if (selectedStock?.ticker && selectedStock.ticker !== selectedTicker) {
      setSelectedTicker(selectedStock.ticker);
      resetOverridesForStock(selectedStock);
    }
  }, [selectedStock?.ticker]);

  const activeRawStock = useMemo(() => {
    const found = stocks.find((s) => s.ticker === selectedTicker);
    if (found) return found;
    return getResearchStock(selectedTicker);
  }, [stocks, selectedTicker]);

  const activeStock = localizeStock(activeRawStock, currentLang);
  const isHe = currentLang === 'he';

  // Current market price
  const livePriceInfo = livePrices[activeStock.ticker];
  const parsedActivePrice = parseFloat(activeStock.currentPrice.replace(/[^0-9.]/g, ''));
  const autoMarketPrice = livePriceInfo?.price || (!isNaN(parsedActivePrice) && parsedActivePrice > 0 ? parsedActivePrice : 100);
  const marketPrice = customPriceOverride !== null ? customPriceOverride : autoMarketPrice;

  // Extracted balance sheet & fundamental inputs from institutional engine
  const autoFinancials = useMemo(() => {
    return extractFinancialInputs(activeRawStock, autoMarketPrice);
  }, [activeRawStock, autoMarketPrice]);

  // Base stock initial FCF TTM in Billions
  const autoBaseFcfBillion = autoFinancials.baseFcfBillion;
  const baseFcfBillion = customFcfOverride !== null ? customFcfOverride : autoBaseFcfBillion;

  // Shares outstanding approximate (in Billions)
  const autoSharesOutstandingBillion = autoFinancials.sharesBillion;
  const sharesOutstandingBillion = customSharesOverride !== null ? customSharesOverride : autoSharesOutstandingBillion;

  // Cash and Debt in Billions
  const cashBillion = customCashOverride !== null ? customCashOverride : autoFinancials.cashBillion;
  const debtBillion = customDebtOverride !== null ? customDebtOverride : autoFinancials.debtBillion;
  const netCashBillion = cashBillion - debtBillion;

  // Model parameters (Interactive state)
  const [fcfGrowthY1_5, setFcfGrowthY1_5] = useState<number>(autoFinancials.baseCagr); // %
  const [terminalMethod, setTerminalMethod] = useState<'multiple' | 'gordon'>('multiple');
  const [terminalMultiple, setTerminalMultiple] = useState<number>(
    autoFinancials.roic >= 30 ? 28 : autoFinancials.roic >= 20 ? 22 : 18
  ); // EV/FCF
  const [perpetualGrowthRate, setPerpetualGrowthRate] = useState<number>(2.5); // % (Gordon Growth)
  const [discountRateWACC, setDiscountRateWACC] = useState<number>(8.5); // %
  const [marginOfSafety, setMarginOfSafety] = useState<number>(15.0); // %

  const resetOverridesForStock = (s: ResearchStock) => {
    setCustomFcfOverride(null);
    setCustomSharesOverride(null);
    setCustomPriceOverride(null);
    setCustomCashOverride(null);
    setCustomDebtOverride(null);
    const fin = extractFinancialInputs(s);
    setFcfGrowthY1_5(fin.baseCagr);
    setTerminalMultiple(
      fin.roic >= 30 ? 28 : fin.roic >= 20 ? 22 : 18
    );
    setPerpetualGrowthRate(2.5);
    setDiscountRateWACC(8.5);
    setMarginOfSafety(15.0);
  };

  // Reset defaults when stock changes
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
    resetOverridesForStock(s);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = resolveTickerSymbol(searchInput);
    if (!clean) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      let resolved = stocks.find((s) => s.ticker === clean);
      let notFound = false;
      if (!resolved) {
        try {
          const res = await fetch('/api/analyze-ticker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ticker: clean, language: currentLang }),
          });
          const contentType = res.headers.get('content-type') || '';
          const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
          if (res.status === 404) {
            notFound = true;
            setSearchError(data?.error || (isHe ? `הסימול ${clean} לא נמצא בבורסה או ב-SEC.` : `Ticker ${clean} not found.`));
          } else if (res.ok && data?.stock) {
            resolved = localizeStock(data.stock, currentLang);
          }
        } catch {
          // ignore network error and fallback
        }
        if (notFound) return;
        if (!resolved) {
          resolved = getResearchStock(clean);
        }
        if (onAddStockToUniverse && resolved) {
          onAddStockToUniverse(resolved);
        }
      }
      setSelectedTicker(clean);
      if (resolved) {
        resetOverridesForStock(resolved);
      }
      setSearchInput('');
    } finally {
      setIsSearching(false);
    }
  };

  // Quick ticker presets
  const popularTickers = ['NVDA', 'MSFT', 'UNH', 'GOOGL', 'AAPL', 'COST', 'V', 'PLTR', 'TSLA', 'AMZN', 'META', 'LLY', 'AVGO'];

  // DCF Calculations with Gordon Growth Option & Mathematical Guardrails
  const dcfModel = useMemo(() => {
    const safeWacc = Math.max(2.0, discountRateWACC);
    const years = [1, 2, 3, 4, 5];
    const projectedFCFs: { year: number; fcf: number; pvFcf: number }[] = [];
    let currentFCF = Math.max(0.01, baseFcfBillion);
    let sumPvFcf = 0;

    years.forEach((yr) => {
      currentFCF = currentFCF * (1 + fcfGrowthY1_5 / 100);
      const discountFactor = Math.pow(1 + safeWacc / 100, yr);
      const pv = currentFCF / discountFactor;
      sumPvFcf += pv;
      projectedFCFs.push({
        year: yr,
        fcf: Number(currentFCF.toFixed(2)),
        pvFcf: Number(pv.toFixed(2)),
      });
    });

    // Terminal Value calculation
    const year5FCF = projectedFCFs[4].fcf;
    let terminalValue = 0;
    let hasGordonAnomaly = false;
    let effectiveGordonGrowth = perpetualGrowthRate;

    if (terminalMethod === 'multiple') {
      terminalValue = year5FCF * Math.max(5, terminalMultiple);
    } else {
      // Gordon Growth Model: TV = (Year 5 FCF * (1 + g)) / (r - g)
      if (perpetualGrowthRate >= safeWacc) {
        hasGordonAnomaly = true;
        effectiveGordonGrowth = Math.max(0.5, safeWacc - 0.5);
      }
      const spread = (safeWacc - effectiveGordonGrowth) / 100;
      const safeSpread = Math.max(0.005, spread);
      terminalValue = (year5FCF * (1 + effectiveGordonGrowth / 100)) / safeSpread;
    }

    const pvTerminalValue = terminalValue / Math.pow(1 + safeWacc / 100, 5);

    // Enterprise / Equity Value Bridge (Bottom-Up Institutional Standard)
    const enterpriseValue = sumPvFcf + pvTerminalValue;
    const equityValue = enterpriseValue + netCashBillion;
    const safeShares = Math.max(0.01, sharesOutstandingBillion);
    const rawFairValue = equityValue / safeShares;
    const fairValuePerShare = isFinite(rawFairValue) && rawFairValue > 0 ? Number(rawFairValue.toFixed(2)) : 0;
    const netCashPerShare = Number((netCashBillion / safeShares).toFixed(2));
    const buyTargetWithMoS = Number((fairValuePerShare * (1 - marginOfSafety / 100)).toFixed(2));

    const safeMarketPrice = Math.max(0.01, marketPrice);
    const upsidePercent = Number((((fairValuePerShare - safeMarketPrice) / safeMarketPrice) * 100).toFixed(1));
    const isUndervalued = fairValuePerShare >= safeMarketPrice;

    // Scenarios: Bear, Base, Bull
    const bearFairValue = Number((fairValuePerShare * 0.78).toFixed(2));
    const bullFairValue = Number((fairValuePerShare * 1.28).toFixed(2));

    return {
      projectedFCFs,
      sumPvFcf: Number(sumPvFcf.toFixed(2)),
      terminalValue: Number(terminalValue.toFixed(2)),
      pvTerminalValue: Number(pvTerminalValue.toFixed(2)),
      enterpriseValue: Number(enterpriseValue.toFixed(2)),
      equityValue: Number(equityValue.toFixed(2)),
      netCashBillion: Number(netCashBillion.toFixed(2)),
      netCashPerShare,
      cashBillion,
      debtBillion,
      fairValuePerShare,
      buyTargetWithMoS,
      upsidePercent,
      isUndervalued,
      bearFairValue,
      bullFairValue,
      hasGordonAnomaly,
      effectiveGordonGrowth,
    };
  }, [baseFcfBillion, fcfGrowthY1_5, discountRateWACC, terminalMethod, terminalMultiple, perpetualGrowthRate, sharesOutstandingBillion, marginOfSafety, marketPrice, netCashBillion, cashBillion, debtBillion]);

  // Full Multi-Model Valuation Engine Blend (DCF + Multiples + ROIC Reinvestment)
  const multiModel = useMemo(() => {
    return calculateMultiModelValuation(activeRawStock, marketPrice, {
      fcfGrowthRate: fcfGrowthY1_5,
      discountRateWACC,
      terminalMultiple,
      terminalMethod,
      perpetualGrowthRate,
      marginOfSafetyPct: marginOfSafety,
      cashBillion,
      debtBillion,
      sharesBillion: sharesOutstandingBillion,
      customBaseFcfBillion: baseFcfBillion,
    });
  }, [activeRawStock, marketPrice, fcfGrowthY1_5, discountRateWACC, terminalMultiple, terminalMethod, perpetualGrowthRate, marginOfSafety, cashBillion, debtBillion, sharesOutstandingBillion, baseFcfBillion]);

  const applyScenario = (type: 'bear' | 'base' | 'bull') => {
    const sc = type === 'bear' ? multiModel.bearScenario : type === 'base' ? multiModel.baseScenario : multiModel.bullScenario;
    setFcfGrowthY1_5(sc.fcfGrowthRate);
    setTerminalMultiple(sc.terminalMultiple);
    setDiscountRateWACC(sc.discountRateWACC);
  };

  // Sensitivity Matrix (Growth vs WACC)
  const sensitivityMatrix = useMemo(() => {
    const growthSteps = [fcfGrowthY1_5 - 4, fcfGrowthY1_5 - 2, fcfGrowthY1_5, fcfGrowthY1_5 + 2, fcfGrowthY1_5 + 4];
    const waccSteps = [discountRateWACC - 1.5, discountRateWACC - 0.75, discountRateWACC, discountRateWACC + 0.75, discountRateWACC + 1.5];

    return waccSteps.map((w) => {
      return {
        wacc: Number(w.toFixed(2)),
        columns: growthSteps.map((g) => {
          let cF = baseFcfBillion;
          let sPv = 0;
          for (let yr = 1; yr <= 5; yr++) {
            cF = cF * (1 + g / 100);
            sPv += cF / Math.pow(1 + w / 100, yr);
          }
          const tVal = (cF * terminalMultiple) / Math.pow(1 + w / 100, 5);
          const fv = (sPv + tVal) / sharesOutstandingBillion;
          return {
            growth: Number(g.toFixed(1)),
            fairValue: Number(fv.toFixed(1)),
            isCurrent: g === fcfGrowthY1_5 && w === discountRateWACC,
          };
        }),
      };
    });
  }, [baseFcfBillion, fcfGrowthY1_5, discountRateWACC, terminalMultiple, sharesOutstandingBillion]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Universal Stock Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                INTRINSIC VALUATION LAB
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>{isHe ? 'מחשבון שווי הוגן DCF לכל מניה' : 'Universal DCF Fair Value Calculator'}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'בדוק הערכת שווי DCF מלאה לכל מניה בשוק (כולל חיפוש כל טיקר), היוון תזרימי מזומנים (FCF) ל-5 שנים ומבחני רגישות.'
                : 'Run comprehensive DCF valuation on ANY stock in the market with 5Y cash flow discounting and sensitivity matrices.'}
            </p>
          </div>

          {/* Universal Search & Dropdown Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Search Input for ANY Ticker */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isHe ? 'הקלד כל טיקר (למשל TSLA)...' : 'Search any ticker (e.g. TSLA)...'}
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

            {/* Existing Stock Dropdown */}
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
        </div>
        {searchError && (
          <div className="text-xs font-mono text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg px-3 py-2">
            {searchError}
          </div>
        )}

        {/* Popular Ticker Quick Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 mr-1 rtl:ml-1 rtl:mr-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {isHe ? 'מניות מובילות לבדיקה מהירה:' : 'Quick Tickers:'}
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
          <button
            onClick={() => setShowCustomOverrides((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ml-auto rtl:mr-auto rtl:ml-0 ${
              showCustomOverrides
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>{isHe ? 'התאמת נתוני FCF ומניות ידנית' : 'Custom Financial Inputs'}</span>
          </button>
        </div>

        {/* Custom Override Drawer */}
        {showCustomOverrides && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono animate-fadeIn">
            <div>
              <label className="text-slate-400 block text-[11px] mb-1">
                {isHe ? 'תזרים מזומנים ($B FCF):' : 'Base FCF ($B):'}
              </label>
              <input
                type="number"
                step="0.1"
                value={baseFcfBillion}
                onChange={(e) => setCustomFcfOverride(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block text-[11px] mb-1">
                {isHe ? 'מניות מדוללות ($B Shares):' : 'Shares ($B):'}
              </label>
              <input
                type="number"
                step="0.01"
                value={Number(sharesOutstandingBillion.toFixed(2))}
                onChange={(e) => setCustomSharesOverride(parseFloat(e.target.value) || 0.1)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block text-[11px] mb-1">
                {isHe ? 'מחיר מניה נוכחי ($):' : 'Current Price ($):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={marketPrice}
                onChange={(e) => setCustomPriceOverride(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-cyan-300 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block text-[11px] mb-1">
                {isHe ? 'מזומן והשקעות ($B Cash):' : 'Cash & ST Inv ($B):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={cashBillion}
                onChange={(e) => setCustomCashOverride(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-emerald-400 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 block text-[11px] mb-1">
                {isHe ? 'חוב כולל ($B Debt):' : 'Total Debt ($B):'}
              </label>
              <input
                type="number"
                step="0.5"
                value={debtBillion}
                onChange={(e) => setCustomDebtOverride(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-rose-400 font-bold"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCustomFcfOverride(null);
                  setCustomSharesOverride(null);
                  setCustomPriceOverride(null);
                  setCustomCashOverride(null);
                  setCustomDebtOverride(null);
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isHe ? 'איפוס למאזן אוטומטי' : 'Reset Inputs'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Stock Banner & Fair Value Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Stock & Output Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <StockLogoBadge ticker={activeStock.ticker} name={activeStock.companyName} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-mono text-cyan-300">{activeStock.ticker}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {activeStock.finalVerdict}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {activeStock.sector}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">{activeStock.companyName}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-right">
                <div>
                  <div className="text-[10px] text-slate-400">{isHe ? 'מחיר שוק נוכחי' : 'Current Market Price'}</div>
                  <div className="text-xl font-bold text-white">${marketPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{isHe ? 'מזומן נטו למניה' : 'Net Cash / Share'}</div>
                  <div className={`text-xl font-bold ${dcfModel.netCashPerShare >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {dcfModel.netCashPerShare >= 0 ? '+' : ''}${dcfModel.netCashPerShare}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{isHe ? 'תזרים מזומנים TTM' : 'FCF (TTM)'}</div>
                  <div className="text-xl font-bold text-cyan-400">${baseFcfBillion.toFixed(1)}B</div>
                </div>
              </div>
            </div>

            {/* Fair Value Verdict Ribbon */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {isHe ? 'שווי הוגן מוסדי משוקלל (Blended Consensus):' : 'Blended Institutional Fair Value:'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    3 מודלים
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-extrabold font-mono text-cyan-400">
                    ${multiModel.blendedFairValue}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    (DCF: ${dcfModel.fairValuePerShare})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                    multiModel.isUndervalued
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      : 'bg-rose-950/80 text-rose-300 border-rose-700'
                  }`}
                >
                  {multiModel.isUndervalued ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>
                    {isHe ? multiModel.valuationZoneHe : multiModel.valuationZone}{' '}
                    ({multiModel.upsideToBasePercent > 0 ? '+' : ''}
                    {multiModel.upsideToBasePercent}%)
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="text-slate-400">{isHe ? 'אזור קנייה מוסדי: ' : 'Buy Target (MoS): '}</span>
                  <strong className="text-emerald-400">&lt; ${multiModel.buyZoneThreshold}</strong>
                </div>
              </div>
            </div>

            {/* EV to Equity Bridge Strip */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">{isHe ? 'שווי פעילות (EV)' : 'Enterprise Value'}</span>
                <span className="font-bold text-slate-200">${dcfModel.enterpriseValue}B</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">{isHe ? '+ מזומן והשקעות' : '+ Cash & ST Inv'}</span>
                <span className="font-bold text-emerald-400">+${cashBillion.toFixed(1)}B</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">{isHe ? '- חוב פיננסי' : '- Total Debt'}</span>
                <span className="font-bold text-rose-400">-${debtBillion.toFixed(1)}B</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">{isHe ? '= שווי הון עצמי' : '= Equity Value'}</span>
                <span className="font-bold text-cyan-300">${dcfModel.equityValue}B</span>
              </div>
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-800/40">
                <span className="text-[10px] text-cyan-400 block">{isHe ? 'מזומן נטו / מניה' : 'Net Cash Impact'}</span>
                <span className={`font-bold ${dcfModel.netCashPerShare >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dcfModel.netCashPerShare >= 0 ? '+' : ''}${dcfModel.netCashPerShare}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Model Triangulation Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold font-mono text-white">
                  {isHe ? 'שילוב 3 מודלי תמחור מוסדיים (Triangulation Blend)' : 'Multi-Model Institutional Triangulation'}
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {isHe ? 'שקלול: 45% DCF | 35% מכפילים | 20% תשואה על הון מושקע' : 'Weight: 45% DCF | 35% Multiples | 20% ROIC Reinvestment'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>1. DCF Bottom-Up</span>
                    <span className="text-cyan-400 font-bold">45% משקל</span>
                  </div>
                  <div className="text-xl font-bold text-white">${multiModel.dcfPerShare}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  {isHe ? 'היוון תזרימי מזומנים חופשיים + שווי טרמינלי + גשר מאזני' : '5Y Discounted Cash Flow + Terminal + Net Cash Bridge'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>2. מכפילים מנורמלים</span>
                    <span className="text-purple-400 font-bold">35% משקל</span>
                  </div>
                  <div className="text-xl font-bold text-white">${multiModel.multiplesPerShare}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  {isHe ? 'מכפיל P/E היסטורי מנורמל ו-EV/FCF מותאם איכות' : 'Normalized 10Y Median P/E & Quality-Adjusted EV/FCF'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>3. השקעה מחדש ו-ROIC</span>
                    <span className="text-emerald-400 font-bold">20% משקל</span>
                  </div>
                  <div className="text-xl font-bold text-white">${multiModel.reinvestmentPerShare}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  {isHe ? 'ערך מוסף כלכלי (EVA) מתשואה על ההון המושקע' : 'Economic Value Added (EVA) Reinvestment Compounding'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Form */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>{isHe ? 'התאמת פרמטרי מודל ה-DCF בלייב' : 'DCF Interactive Model Assumptions'}</span>
              </h3>

              {/* Terminal Value Method Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setTerminalMethod('multiple')}
                  className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                    terminalMethod === 'multiple'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isHe ? 'מכפיל יציאה (Exit Multiple)' : 'Exit Multiple'}
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalMethod('gordon')}
                  className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                    terminalMethod === 'gordon'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isHe ? 'צמיחה פרפטואלית (Gordon Growth)' : 'Gordon Growth'}
                </button>
              </div>
            </div>

            {/* Mathematical Safety Guardrail Alert Banner */}
            {dcfModel.hasGordonAnomaly && (
              <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-500/60 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>{isHe ? 'הגנת מתמטיקה פיננסית פעילה:' : 'Financial Math Guard Active:'}</strong>{' '}
                  {isHe
                    ? `שיעור הצמיחה לנצח (Gordon Growth Rate: ${perpetualGrowthRate}%) לא יכול לעלות על שיעור ההיוון (WACC: ${discountRateWACC}%). הערך הוגבל אוטומטית ל-${dcfModel.effectiveGordonGrowth.toFixed(1)}% כדי למנוע חלוקה באפס או שווי אינסופי.`
                    : `Perpetual growth (${perpetualGrowthRate}%) cannot exceed discount rate (${discountRateWACC}%). Clamped to ${dcfModel.effectiveGordonGrowth.toFixed(1)}% to maintain mathematical validity.`}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Slider 1: FCF 5Y CAGR */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">
                    {isHe ? 'קצב צמיחת FCF שנתי (5Y CAGR)' : '5Y Annual FCF Growth'}
                  </span>
                  <span className="text-cyan-400 font-bold text-sm">{fcfGrowthY1_5.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.5"
                  value={fcfGrowthY1_5}
                  onChange={(e) => setFcfGrowthY1_5(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0% (סטגנציה)</span>
                  <span>15% (צמיחה סולידית)</span>
                  <span>35% (היפר-צמיחה)</span>
                </div>
              </div>

              {/* Slider 2: Terminal Multiple OR Gordon Growth Rate */}
              {terminalMethod === 'multiple' ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">
                      {isHe ? 'מכפיל יציאה טרמינלי (Exit EV/FCF)' : 'Terminal Exit Multiple'}
                    </span>
                    <span className="text-cyan-400 font-bold text-sm">{terminalMultiple.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="1"
                    value={terminalMultiple}
                    onChange={(e) => setTerminalMultiple(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10x (שמרני)</span>
                    <span>22x (איכות שוק)</span>
                    <span>45x (מובילת שוק)</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">
                      {isHe ? 'שיעור צמיחה לנצח (Perpetual Gordon g)' : 'Perpetual Growth Rate (g)'}
                    </span>
                    <span className="text-purple-400 font-bold text-sm">{perpetualGrowthRate.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.25"
                    value={perpetualGrowthRate}
                    onChange={(e) => setPerpetualGrowthRate(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1.0% (שמרני)</span>
                    <span>2.5% (קצב תמ"ג עולמי)</span>
                    <span>5.0% (גבוה)</span>
                  </div>
                </div>
              )}

              {/* Slider 3: Discount Rate / WACC */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">
                    {isHe ? 'שיעור היוון / מחיר הון (WACC)' : 'Discount Rate (WACC)'}
                  </span>
                  <span className="text-cyan-400 font-bold text-sm">{discountRateWACC.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="0.25"
                  value={discountRateWACC}
                  onChange={(e) => setDiscountRateWACC(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>6.0% (ריבית נמוכה)</span>
                  <span>8.5% (סטנדרט)</span>
                  <span>14.0% (סיכון מוגבר)</span>
                </div>
              </div>

              {/* Slider 4: Margin of Safety */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">
                    {isHe ? 'מרווח ביטחון לקנייה (Margin of Safety)' : 'Margin of Safety (MoS)'}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">{marginOfSafety.toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="5"
                  value={marginOfSafety}
                  onChange={(e) => setMarginOfSafety(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0%</span>
                  <span>15% (מומלץ לקומפאונדר)</span>
                  <span>35% (שמרני מאוד)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Scenario Summary & Projected Cash Flows */}
        <div className="space-y-4">
          {/* Scenario Case Breakdown */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>{isHe ? 'ניתוח תרחישים מוסדי (3 Scenarios)' : 'Institutional Scenario Matrix'}</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {isHe ? 'יחס סיכוי/סיכון:' : 'Asymmetry:'}{' '}
                <strong className={multiModel.asymmetryRatio >= 1.5 ? 'text-emerald-400' : 'text-slate-300'}>
                  {multiModel.asymmetryRatio}x
                </strong>
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {/* Bear Scenario */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-rose-400 font-semibold">{isHe ? 'תרחיש פסימי (Bear)' : 'Bear Case'}</span>
                  </div>
                  <span className="text-white font-bold text-sm">${multiModel.bearScenario.fairValue}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>צמיחה: {multiModel.bearScenario.fcfGrowthRate}% | מכפיל: {multiModel.bearScenario.terminalMultiple}x | WACC: {multiModel.bearScenario.discountRateWACC}%</span>
                  <button
                    onClick={() => applyScenario('bear')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] cursor-pointer transition"
                  >
                    {isHe ? 'החל' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Base Scenario */}
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/60 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-cyan-300 font-semibold">{isHe ? 'תרחיש בסיס (Base)' : 'Base Case'}</span>
                  </div>
                  <span className="text-cyan-300 font-bold text-sm">${multiModel.baseScenario.fairValue}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>צמיחה: {multiModel.baseScenario.fcfGrowthRate}% | מכפיל: {multiModel.baseScenario.terminalMultiple}x | WACC: {multiModel.baseScenario.discountRateWACC}%</span>
                  <button
                    onClick={() => applyScenario('base')}
                    className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[10px] cursor-pointer transition font-bold"
                  >
                    {isHe ? 'החל' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Bull Scenario */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-emerald-400 font-semibold">{isHe ? 'תרחיש אופטימי (Bull)' : 'Bull Case'}</span>
                  </div>
                  <span className="text-white font-bold text-sm">${multiModel.bullScenario.fairValue}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>צמיחה: {multiModel.bullScenario.fcfGrowthRate}% | מכפיל: {multiModel.bullScenario.terminalMultiple}x | WACC: {multiModel.bullScenario.discountRateWACC}%</span>
                  <button
                    onClick={() => applyScenario('bull')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] cursor-pointer transition"
                  >
                    {isHe ? 'החל' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Year Cash Flow Projection Breakdown */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'תחזית FCF ל-5 השנים הקרובות' : '5-Year FCF Schedule'}</span>
            </h3>

            <div className="space-y-1.5 font-mono text-xs">
              {dcfModel.projectedFCFs.map((item) => (
                <div key={item.year} className="flex justify-between items-center p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
                  <span className="text-slate-400">{isHe ? `שנה ${item.year}` : `Year ${item.year}`}:</span>
                  <span className="text-slate-200 font-semibold">${item.fcf}B (PV: ${item.pvFcf}B)</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-cyan-300 font-bold">
                <span>{isHe ? 'שווי טרמינלי מהוון:' : 'PV Terminal Value:'}</span>
                <span>${dcfModel.pvTerminalValue}B</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenDeepDive(activeStock)}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition shadow-md cursor-pointer"
          >
            {isHe ? `צפה בתזכיר המלא של ${activeStock.ticker} ←` : `View Full ${activeStock.ticker} Memo →`}
          </button>
        </div>
      </div>

      {/* Sensitivity Heatmap Matrix (WACC vs Growth Rate) */}
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{isHe ? 'מטריצת רגישות שווי (WACC מול קצב צמיחה)' : 'Valuation Sensitivity Heatmap (Growth vs WACC)'}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {isHe ? 'התא מסומן בתכלת מייצג את ההנחות הפעילות' : 'Cyan box represents active assumptions'}
          </span>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="p-2 text-left bg-slate-950/80">WACC \ FCF Growth</th>
                {sensitivityMatrix[0].columns.map((c) => (
                  <th key={c.growth} className="p-2 text-center bg-slate-950/80">
                    {c.growth}% Growth
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sensitivityMatrix.map((row) => (
                <tr key={row.wacc} className="hover:bg-slate-800/30">
                  <td className="p-2 text-slate-300 font-bold bg-slate-950/40">
                    {row.wacc}% WACC
                  </td>
                  {row.columns.map((col, idx) => {
                    const isHigher = col.fairValue > marketPrice;
                    return (
                      <td
                        key={idx}
                        className={`p-2 text-center transition ${
                          col.isCurrent
                            ? 'ring-2 ring-cyan-400 bg-cyan-950/80 font-bold text-cyan-200'
                            : isHigher
                            ? 'text-emerald-400 bg-emerald-950/10'
                            : 'text-slate-300'
                        }`}
                      >
                        ${col.fairValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
