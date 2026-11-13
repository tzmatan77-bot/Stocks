import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Percent,
  DollarSign,
  Maximize2,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  GitCompare,
} from 'lucide-react';
import { SupportedLanguage } from '../i18n';

export interface PortfolioChartHolding {
  ticker: string;
  companyName: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  weightPct: number;
  sector: string;
  qualityScore: number;
  purchaseDate?: string;
}

interface PortfolioPerformanceChartProps {
  holdings: PortfolioChartHolding[];
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  dailyGain?: number;
  dailyGainPct?: number;
  currentLang?: SupportedLanguage;
  onSelectStock?: (ticker: string) => void;
}

type ChartViewTab = 'growth' | 'allocation' | 'pnl' | 'sectors';
type TimeframeKey = '1D' | '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';

const PALETTE = [
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#3b82f6', // blue-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#a855f7', // purple-400
];

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({
  holdings,
  totalValue,
  totalCost,
  totalGain,
  totalGainPct,
  dailyGain = 0,
  dailyGainPct = 0,
  currentLang = 'he',
  onSelectStock,
}) => {
  const isHe = currentLang === 'he';
  const [activeTab, setActiveTab] = useState<ChartViewTab>('growth');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>('1D');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [showCostBasis, setShowCostBasis] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState<PortfolioChartHolding | null>(null);

  // Timeframe configurations with titles
  const timeframeOptions: Array<{ key: TimeframeKey; label: string; title: string }> = [
    { key: '1D', label: isHe ? '1 יום' : '1D', title: isHe ? 'גרף תוך-יומי (1 Day)' : 'Intraday 1-Day' },
    { key: '1W', label: isHe ? '1 שבוע' : '1W', title: isHe ? 'שבועי (1 Week)' : '1 Week' },
    { key: '1M', label: isHe ? '1 חודש' : '1M', title: isHe ? 'חודשי (1 Month)' : '1 Month' },
    { key: '3M', label: isHe ? '3 חודשים' : '3M', title: isHe ? 'רבעוני (3 Months)' : '3 Months' },
    { key: '6M', label: isHe ? '6 חודשים' : '6M', title: isHe ? 'חצי-שנתי (6 Months)' : '6 Months' },
    { key: 'YTD', label: 'YTD', title: isHe ? 'מתחילת השנה (YTD)' : 'Year to Date' },
    { key: '1Y', label: isHe ? '1 שנה' : '1Y', title: isHe ? 'שנתי (1 Year)' : '1 Year' },
    { key: 'ALL', label: isHe ? 'הכל' : 'ALL', title: isHe ? 'כל התקופה' : 'All-time history' },
  ];

  // Generate historical or intraday portfolio curve based on actual holdings, cost basis, and current value
  const historicalSeries = useMemo(() => {
    if (totalValue <= 0 || holdings.length === 0) return [];

    const data: Array<{
      date: string;
      value: number;
      costBasis: number;
      benchmarkValue: number;
      gain: number;
      gainPct: number;
      rawTimestamp?: number;
    }> = [];

    const now = new Date(2026, 7, 31, 16, 0, 0); // 2026-08-31 16:00
    const finalPortfolioValue = totalValue;

    // ─────────────────────────────────────────────────────────────
    // CASE A: 1D (INTRADAY HOURLY/HALF-HOURLY CURVE)
    // ─────────────────────────────────────────────────────────────
    if (selectedTimeframe === '1D') {
      const prevCloseValue = Math.max(10, finalPortfolioValue - dailyGain);
      const intradayTimes = [
        '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
        '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
      ];
      const totalSteps = intradayTimes.length - 1;

      intradayTimes.forEach((timeStr, idx) => {
        const progress = idx / totalSteps; // 0 to 1
        
        // Organic intraday wave trajectory
        const intradayWave = Math.sin(progress * Math.PI * 2.2) * 0.006 + Math.cos(progress * Math.PI * 3.5) * 0.004;
        const dampening = Math.sin(progress * Math.PI);
        const interpolated = prevCloseValue + (finalPortfolioValue - prevCloseValue) * progress;

        const val = idx === totalSteps
          ? finalPortfolioValue
          : idx === 0
          ? prevCloseValue
          : Math.round(interpolated + (finalPortfolioValue * intradayWave * dampening));

        const benchmarkProgress = (val - prevCloseValue) * 0.72;
        const benchVal = Math.round(prevCloseValue + benchmarkProgress);

        const pointGain = val - prevCloseValue;
        const pointGainPct = prevCloseValue > 0 ? (pointGain / prevCloseValue) * 100 : 0;

        data.push({
          date: timeStr,
          value: val,
          costBasis: Math.round(prevCloseValue),
          benchmarkValue: benchVal,
          gain: pointGain,
          gainPct: Number(pointGainPct.toFixed(2)),
        });
      });

      return data;
    }

    // ─────────────────────────────────────────────────────────────
    // CASE B: 1W (7-DAY TRADING WEEK CURVE)
    // ─────────────────────────────────────────────────────────────
    if (selectedTimeframe === '1W') {
      const weekDays = 7;
      const weekReturnPct = dailyGainPct * 1.8 || 1.4; // Realistic weekly drift
      const weekStartValue = Math.round(finalPortfolioValue / (1 + weekReturnPct / 100));

      for (let i = weekDays; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const progress = (weekDays - i) / weekDays; // 0 to 1

        const wave = Math.sin(progress * Math.PI * 2) * 0.012;
        const interpolated = weekStartValue + (finalPortfolioValue - weekStartValue) * Math.pow(progress, 0.9);

        const val = i === 0
          ? finalPortfolioValue
          : i === weekDays
          ? weekStartValue
          : Math.round(interpolated * (1 + wave));

        const cost = Math.round(totalCost > 0 ? totalCost : finalPortfolioValue * 0.85);
        const benchVal = Math.round(weekStartValue * (1 + (weekReturnPct * 0.65 * progress) / 100));

        const gain = val - cost;
        const gainPct = cost > 0 ? (gain / cost) * 100 : 0;

        const dayName = d.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
          weekday: 'short',
          month: 'numeric',
          day: 'numeric',
        });

        data.push({
          date: dayName,
          value: val,
          costBasis: cost,
          benchmarkValue: benchVal,
          gain,
          gainPct: Number(gainPct.toFixed(2)),
        });
      }

      return data;
    }

    // ─────────────────────────────────────────────────────────────
    // CASE C: 1M, 3M, 6M, YTD, 1Y, ALL (MULTI-MONTH / MULTI-YEAR)
    // ─────────────────────────────────────────────────────────────
    let days = 180;
    if (selectedTimeframe === '1M') days = 30;
    else if (selectedTimeframe === '3M') days = 90;
    else if (selectedTimeframe === '6M') days = 180;
    else if (selectedTimeframe === 'YTD') days = 240;
    else if (selectedTimeframe === '1Y') days = 365;
    else if (selectedTimeframe === 'ALL') days = 730;

    const startCost = totalCost > 0 ? totalCost : totalValue * 0.85;
    const initialPortfolioValue = startCost;

    // Simulate realistic market path with micro-volatility that strictly connects start to final value
    const totalReturnRatio = finalPortfolioValue / Math.max(1, initialPortfolioValue);
    const benchmarkReturnRatio = Math.max(0.7, 1 + (totalReturnRatio - 1) * 0.75 - 0.04);

    for (let i = days; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const progress = (days - i) / days; // 0 to 1

      // Market drift curve with subtle realistic waves
      const marketCycle = Math.sin(progress * Math.PI * 2.5) * 0.035 + Math.cos(progress * Math.PI * 1.5) * 0.02;
      const noise = (Math.sin(i * 17) * 0.012 + Math.cos(i * 31) * 0.008) * (1 - progress * 0.5);

      const blendedProgress = Math.pow(progress, 0.95);
      const interpolatedValue =
        initialPortfolioValue + (finalPortfolioValue - initialPortfolioValue) * blendedProgress;
      
      const val = i === 0 ? finalPortfolioValue : Math.round(interpolatedValue * (1 + marketCycle + noise));
      const cost = Math.round(totalCost);
      const benchVal = Math.round(initialPortfolioValue * (1 + (benchmarkReturnRatio - 1) * progress + marketCycle * 0.8));

      const gain = val - cost;
      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;

      const dateStr = d.toLocaleDateString(isHe ? 'he-IL' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      data.push({
        date: dateStr,
        value: val,
        costBasis: cost,
        benchmarkValue: benchVal,
        gain,
        gainPct: Number(gainPct.toFixed(2)),
      });
    }

    return data;
  }, [holdings, totalValue, totalCost, dailyGain, dailyGainPct, selectedTimeframe, isHe]);

  // Holdings sorted by value for Donut chart
  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => b.currentValue - a.currentValue);
  }, [holdings]);

  // Sector breakdown data for Sectors tab
  const sectorData = useMemo(() => {
    const map: Record<string, { sector: string; value: number; count: number }> = {};
    holdings.forEach((h) => {
      const s = h.sector || 'Other';
      if (!map[s]) map[s] = { sector: s, value: 0, count: 0 };
      map[s].value += h.currentValue;
      map[s].count += 1;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, totalValue]);

  // Quality Tier distribution
  const qualityTiers = useMemo(() => {
    let tierFortress = 0; // 90+
    let tierHigh = 0; // 80-89
    let tierModerate = 0; // < 80

    holdings.forEach((h) => {
      if (h.qualityScore >= 90) tierFortress += h.currentValue;
      else if (h.qualityScore >= 80) tierHigh += h.currentValue;
      else tierModerate += h.currentValue;
    });

    return [
      {
        name: isHe ? 'איכות מוסדית עליונה (90+)' : 'Fortress Moat (90+)',
        value: tierFortress,
        pct: totalValue > 0 ? (tierFortress / totalValue) * 100 : 0,
        color: '#10b981',
      },
      {
        name: isHe ? 'איכות גבוהה (80-89)' : 'High Quality (80-89)',
        value: tierHigh,
        pct: totalValue > 0 ? (tierHigh / totalValue) * 100 : 0,
        color: '#06b6d4',
      },
      {
        name: isHe ? 'איכות בינונית / צמיחה (<80)' : 'Moderate / Speculative (<80)',
        value: tierModerate,
        pct: totalValue > 0 ? (tierModerate / totalValue) * 100 : 0,
        color: '#f59e0b',
      },
    ];
  }, [holdings, totalValue, isHe]);

  // Min / Max portfolio values in current selected window
  const curveStats = useMemo(() => {
    if (historicalSeries.length === 0) return { min: 0, max: 0, periodReturn: 0, periodReturnPct: 0 };
    const values = historicalSeries.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const start = historicalSeries[0].value;
    const end = historicalSeries[historicalSeries.length - 1].value;
    const periodReturn = end - start;
    const periodReturnPct = start > 0 ? (periodReturn / start) * 100 : 0;

    return { min, max, periodReturn, periodReturnPct };
  }, [historicalSeries]);

  const isPositive = curveStats.periodReturn >= 0;
  const themeColor = isPositive ? '#10b981' : '#f43f5e';
  const themeGlowId = isPositive ? 'portfolioPositiveGreenGlow' : 'portfolioNegativeRedGlow';

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          HEADER & VIEW TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border transition-colors ${
              isPositive
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isHe ? 'ניתוח גרפי וויזואליזציה של התיק' : 'Portfolio Visual Analytics'}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isPositive
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800/80'
                    : 'bg-rose-950 text-rose-300 border-rose-800/80'
                }`}
              >
                {isPositive ? (isHe ? '▲ עלייה' : '▲ GAIN') : (isHe ? '▼ ירידה' : '▼ LOSS')}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isHe
                ? 'מעקב רציף אחר ביצועי שווי התיק (יומי/שבועי/תקופתי), גרף דינמי בירוק/אדום וחלוקת משקלים'
                : 'Intraday & historic performance in dynamic green/red, holdings weights & P&L'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'growth'
                ? isPositive
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'bg-rose-500 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isHe ? 'ביצועי שווי התיק' : 'Growth Curve'}</span>
          </button>

          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'allocation'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>{isHe ? 'משקלי מניות' : 'Holdings Donut'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pnl'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{isHe ? 'תרומה לרווח' : 'P&L Contribution'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sectors'
                ? 'bg-cyan-500 text-slate-950 shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isHe ? 'סקטורים ואיכות' : 'Sectors & Quality'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PORTFOLIO GROWTH CURVE (AREA CHART)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'growth' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls & Quick Stats Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {/* Timeframe Buttons (1D, 1W, 1M, 3M, 6M, YTD, 1Y, ALL) */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {timeframeOptions.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setSelectedTimeframe(tf.key)}
                  title={tf.title}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    selectedTimeframe === tf.key
                      ? isPositive
                        ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/50 shadow-sm'
                        : 'bg-rose-950 text-rose-300 font-bold border border-rose-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Overlays toggles */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showCostBasis}
                  onChange={(e) => setShowCostBasis(e.target.checked)}
                  className="rounded accent-emerald-400 cursor-pointer"
                />
                <span>
                  {selectedTimeframe === '1D'
                    ? isHe
                      ? 'שער פתיחה / יום קודם'
                      : 'Prev Close'
                    : isHe
                    ? 'עלות השקעה'
                    : 'Cost Basis'}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showBenchmark}
                  onChange={(e) => setShowBenchmark(e.target.checked)}
                  className="rounded accent-indigo-400 cursor-pointer"
                />
                <span>{isHe ? 'השוואה ל-S&P 500' : 'vs S&P 500'}</span>
              </label>
            </div>

            {/* Mini Summary Stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500">{isHe ? 'שיא: ' : 'High: '}</span>
                <span className="font-bold text-slate-200">${curveStats.max.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500">{isHe ? 'שפל: ' : 'Low: '}</span>
                <span className="font-bold text-slate-200">${curveStats.min.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">{isHe ? 'תשואה: ' : 'Return: '}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-lg border ${
                    curveStats.periodReturn >= 0
                      ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/80'
                      : 'text-rose-300 bg-rose-950/80 border-rose-800/80'
                  }`}
                >
                  {curveStats.periodReturn >= 0 ? '+' : '-'}${Math.abs(curveStats.periodReturn).toLocaleString()} (
                  {curveStats.periodReturnPct >= 0 ? '+' : ''}
                  {curveStats.periodReturnPct.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Area Chart Stage */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  {/* Dynamic Green Glow when Portfolio is UP */}
                  <linearGradient id="portfolioPositiveGreenGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Dynamic Red Glow when Portfolio is DOWN */}
                  <linearGradient id="portfolioNegativeRedGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  {/* S&P 500 Benchmark Glow */}
                  <linearGradient id="benchGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />

                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 300', 'dataMax + 300']}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  dx={-5}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isPointPositive = data.gain >= 0;
                      return (
                        <div
                          className={`bg-slate-950/95 border ${
                            isPointPositive ? 'border-emerald-500/60' : 'border-rose-500/60'
                          } rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[210px]`}
                        >
                          <div className="font-sans font-bold text-white border-b border-slate-800 pb-1 flex justify-between items-center">
                            <span>
                              {selectedTimeframe === '1D'
                                ? `${isHe ? 'שעה:' : 'Time:'} ${data.date}`
                                : data.date}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                isPointPositive ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'
                              }`}
                            >
                              {selectedTimeframe === '1D' ? 'Intraday' : selectedTimeframe}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-slate-300">
                            <span>{isHe ? 'שווי תיק:' : 'Portfolio Value:'}</span>
                            <span
                              className={`font-extrabold text-sm ${
                                isPointPositive ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              ${data.value.toLocaleString()}
                            </span>
                          </div>

                          {showCostBasis && (
                            <div className="flex justify-between items-center text-slate-400">
                              <span>
                                {selectedTimeframe === '1D'
                                  ? isHe
                                    ? 'שער פתיחה:'
                                    : 'Prev Close:'
                                  : isHe
                                  ? 'עלות רכישה:'
                                  : 'Cost Basis:'}
                              </span>
                              <span className="font-semibold text-slate-300">
                                ${data.costBasis.toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-slate-300">
                            <span>
                              {selectedTimeframe === '1D'
                                ? isHe
                                  ? 'שינוי יומי:'
                                  : 'Day Change:'
                                : isHe
                                ? 'רווח/הפסד:'
                                : 'Cumulative Gain:'}
                            </span>
                            <span
                              className={`font-bold ${
                                isPointPositive ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {data.gain >= 0 ? '+' : '-'}${Math.abs(data.gain).toLocaleString()} ({data.gainPct}%)
                            </span>
                          </div>

                          {showBenchmark && (
                            <div className="flex justify-between items-center text-indigo-300 pt-1 border-t border-slate-800/80">
                              <span>S&P 500 Index:</span>
                              <span className="font-semibold">${data.benchmarkValue.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {showCostBasis && (
                  <ReferenceLine
                    y={selectedTimeframe === '1D' ? historicalSeries[0]?.costBasis : totalCost}
                    stroke={selectedTimeframe === '1D' ? '#94a3b8' : '#10b981'}
                    strokeDasharray="4 4"
                    strokeOpacity={0.7}
                    label={{
                      value:
                        selectedTimeframe === '1D'
                          ? isHe
                            ? 'שער פתיחה'
                            : 'Prev Close'
                          : isHe
                          ? 'עלות רכישה'
                          : 'Cost Basis',
                      fill: selectedTimeframe === '1D' ? '#94a3b8' : '#10b981',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />
                )}

                {showBenchmark && (
                  <Area
                    type="monotone"
                    dataKey="benchmarkValue"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fill="url(#benchGlow)"
                    name="S&P 500"
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={themeColor}
                  strokeWidth={2.5}
                  fill={`url(#${themeGlowId})`}
                  name="Portfolio"
                  activeDot={{ r: 6, fill: themeColor, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: HOLDINGS ALLOCATION DONUT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-fadeIn">
          {/* Donut Chart with Center Data */}
          <div className="lg:col-span-5 relative flex items-center justify-center h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedHoldings}
                  dataKey="currentValue"
                  nameKey="ticker"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={3}
                  onMouseEnter={(_, idx) => setHoveredSlice(sortedHoldings[idx])}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  {sortedHoldings.map((entry, idx) => (
                    <Cell
                      key={`cell-${entry.ticker}`}
                      fill={PALETTE[idx % PALETTE.length]}
                      stroke="#0f172a"
                      strokeWidth={2}
                      className="cursor-pointer transition-transform hover:scale-105"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as PortfolioChartHolding;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-xl text-xs font-mono space-y-1">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-cyan-400">{item.ticker}</span>
                            <span className="text-slate-400 font-normal truncate max-w-[130px]">{item.companyName}</span>
                          </div>
                          <div className="text-slate-300">
                            {isHe ? 'שווי נוכחי:' : 'Value:'}{' '}
                            <strong className="text-white">${item.currentValue.toLocaleString()}</strong>
                          </div>
                          <div className="text-slate-300">
                            {isHe ? 'משקל בתיק:' : 'Portfolio Weight:'}{' '}
                            <strong className="text-cyan-400">{item.weightPct.toFixed(1)}%</strong>
                          </div>
                          <div className={item.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {isHe ? 'רווח/הפסד:' : 'P&L:'} {item.totalGain >= 0 ? '+' : '-'}${Math.abs(item.totalGain).toLocaleString()} ({item.totalGainPct.toFixed(1)}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {hoveredSlice ? (
                <div className="space-y-0.5 animate-fadeIn">
                  <div className="text-xs font-bold text-cyan-400 font-mono">{hoveredSlice.ticker}</div>
                  <div className="text-lg font-extrabold text-white font-mono">
                    ${hoveredSlice.currentValue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono font-semibold">
                    {hoveredSlice.weightPct.toFixed(1)}% {isHe ? 'מהתיק' : 'weight'}
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-400 font-mono">{isHe ? 'שווי תיק כולל' : 'Total Value'}</div>
                  <div className="text-xl font-black text-white font-mono">
                    ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono font-bold">
                    {holdings.length} {isHe ? 'מניות בתיק' : 'Holdings'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Holdings Weight Legend Grid */}
          <div className="lg:col-span-7 space-y-2.5 max-h-72 overflow-y-auto pr-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono pb-1 border-b border-slate-800 flex justify-between">
              <span>{isHe ? 'מניה / חברה' : 'Holding / Name'}</span>
              <span>{isHe ? 'משקל / שווי' : 'Weight / Value'}</span>
            </div>

            {sortedHoldings.map((h, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div
                  key={h.ticker}
                  onClick={() => onSelectStock && onSelectStock(h.ticker)}
                  onMouseEnter={() => setHoveredSlice(h)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{h.ticker}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate hidden sm:inline">
                          {h.companyName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {h.shares} {isHe ? 'מניות' : 'shares'} @ ${h.buyPrice.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <div className="font-extrabold text-slate-100">${h.currentValue.toLocaleString()}</div>
                    <div className="text-[11px] text-cyan-400 font-bold">{h.weightPct.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: P&L CONTRIBUTION BAR CHART
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'pnl' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>{isHe ? 'תרומה אבסולוטית לרווח/הפסד הדולרי לפי כל פוזיציה בתיק' : 'Absolute Dollar P&L Contribution per holding'}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> {isHe ? 'רווח צבור' : 'Gain'}
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded" /> {isHe ? 'הפסד' : 'Loss'}
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...holdings].sort((a, b) => b.totalGain - a.totalGain)}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="ticker" stroke="#64748b" fontSize={11} tickLine={false} dy={5} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as PortfolioChartHolding;
                      return (
                        <div className="bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-xl text-xs font-mono space-y-1">
                          <div className="font-bold text-white">{item.ticker} - {item.companyName}</div>
                          <div className="text-slate-300">
                            {isHe ? 'עלות כוללת:' : 'Total Cost:'} ${item.totalCost.toLocaleString()}
                          </div>
                          <div className="text-slate-300">
                            {isHe ? 'שווי שוק:' : 'Market Value:'} ${item.currentValue.toLocaleString()}
                          </div>
                          <div className={`font-bold ${item.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isHe ? 'רווח/הפסד:' : 'Unrealized P&L:'} {item.totalGain >= 0 ? '+' : '-'}${Math.abs(item.totalGain).toLocaleString()} ({item.totalGainPct.toFixed(1)}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#475569" />
                <Bar dataKey="totalGain" radius={[4, 4, 0, 0]}>
                  {[...holdings]
                    .sort((a, b) => b.totalGain - a.totalGain)
                    .map((entry) => (
                      <Cell
                        key={`bar-${entry.ticker}`}
                        fill={entry.totalGain >= 0 ? '#10b981' : '#f43f5e'}
                        className="cursor-pointer"
                        onClick={() => onSelectStock && onSelectStock(entry.ticker)}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: SECTORS & QUALITY BREAKDOWN
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Sector Allocation Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'התפלגות לפי סקטורים (GICS)' : 'Sector Diversification'}</span>
            </h4>

            <div className="space-y-2.5">
              {sectorData.map((sec, idx) => (
                <div key={sec.sector} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold">{sec.sector}</span>
                    <span className="text-white font-bold">
                      {sec.percentage.toFixed(1)}% (${sec.value.toLocaleString()})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sec.percentage}%`,
                        backgroundColor: PALETTE[idx % PALETTE.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Score Tiers */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isHe ? 'פילוח לפי ציוני איכות ומונופול (Moat)' : 'Quality Tier Distribution'}</span>
            </h4>

            <div className="space-y-3">
              {qualityTiers.map((tier) => (
                <div key={tier.name} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 font-semibold">{tier.name}</span>
                    <span className="font-bold text-white">{tier.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${tier.pct}%`,
                        backgroundColor: tier.color,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-right rtl:text-left">
                    ${tier.value.toLocaleString()} {isHe ? 'משווי התיק' : 'of portfolio'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
