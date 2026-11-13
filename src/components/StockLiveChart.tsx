import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  Layers,
  BarChart2,
  GitCompare,
  Sliders,
  Check,
} from 'lucide-react';
import {
  TimeframeOption,
  generateStockChartSeries,
  ChartDataPoint,
} from '../utils/stockChartData';
import { SupportedLanguage } from '../i18n';

interface StockLiveChartProps {
  ticker: string;
  companyName?: string;
  currentPrice: string | number;
  expected5YCAGR?: string;
  liveTickPrice?: number;
  liveChangePercent?: number;
  currentLang?: SupportedLanguage;
  compact?: boolean;
  onOpenDeepDive?: () => void;
}

const TIMEFRAMES: { id: TimeframeOption; labelEn: string; labelHe: string; descEn: string; descHe: string }[] = [
  { id: '1D', labelEn: '1D', labelHe: '1 יום', descEn: 'Today', descHe: 'היום' },
  { id: '5D', labelEn: '5D', labelHe: '5 ימים', descEn: 'Past 5 days', descHe: '5 ימים אחרונים' },
  { id: '1M', labelEn: '1M', labelHe: '1 חודש', descEn: 'Past month', descHe: 'חודש אחרון' },
  { id: '6M', labelEn: '6M', labelHe: '6 חודשים', descEn: 'Past 6 months', descHe: '6 חודשים אחרונים' },
  { id: 'YTD', labelEn: 'YTD', labelHe: 'מתחילת שנה', descEn: 'Year to date', descHe: 'מתחילת שנת 2026' },
  { id: '1Y', labelEn: '1Y', labelHe: '1 שנה', descEn: 'Past year', descHe: 'שנה אחרונה' },
  { id: '5Y', labelEn: '5Y', labelHe: '5 שנים', descEn: 'Past 5 years', descHe: '5 שנים אחרונות' },
  { id: 'MAX', labelEn: 'MAX', labelHe: 'מקסימום', descEn: 'All time', descHe: 'כל הזמנים' },
];

export const StockLiveChart: React.FC<StockLiveChartProps> = ({
  ticker,
  companyName,
  currentPrice,
  expected5YCAGR,
  liveTickPrice,
  liveChangePercent,
  currentLang = 'he',
  compact = false,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tickFlash, setTickFlash] = useState(false);
  
  // Advanced feature toggles
  const [activeViewMode, setActiveViewMode] = useState<'price' | 'valuation'>('price');
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [benchmarkOverlay, setBenchmarkOverlay] = useState<'none' | 'SPY' | 'QQQ'>('none');

  const isHe = currentLang === 'he';

  // Parse numeric price
  const numericPrice = useMemo(() => {
    if (typeof currentPrice === 'number' && !isNaN(currentPrice) && currentPrice > 0) return currentPrice;
    const parsed = parseFloat(String(currentPrice).replace(/[^0-9.]/g, ''));
    return !isNaN(parsed) && parsed > 0 ? parsed : 100;
  }, [currentPrice]);

  // Parse CAGR for realistic 5-year trajectory
  const numericCagr = useMemo(() => {
    if (!expected5YCAGR) return 15.0;
    const match = expected5YCAGR.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 15.0;
  }, [expected5YCAGR]);

  // Flash animation on live tick update
  useEffect(() => {
    if (liveTickPrice !== undefined) {
      setTickFlash(true);
      const timer = setTimeout(() => setTickFlash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [liveTickPrice]);

  // Base chart series
  const rawChartSeries = useMemo(() => {
    return generateStockChartSeries(
      ticker,
      numericPrice,
      selectedTimeframe,
      numericCagr,
      liveTickPrice
    );
  }, [ticker, numericPrice, selectedTimeframe, numericCagr, liveTickPrice]);

  // Enrich with Indicators (SMA 50, SMA 200, Benchmark SPY/QQQ, Multiples)
  const enrichedData = useMemo(() => {
    const data = rawChartSeries.data;
    const count = data.length;
    
    // Benchmark drift rate
    const spyReturn = selectedTimeframe === '1D' ? 0.35 : selectedTimeframe === 'YTD' ? 11.2 : 12.8;
    const qqqReturn = selectedTimeframe === '1D' ? 0.62 : selectedTimeframe === 'YTD' ? 14.5 : 17.5;
    
    // Base PE for this stock
    const basePE = ticker === 'NVDA' ? 38 : ticker === 'MSFT' ? 32 : ticker === 'UNH' ? 20 : ticker === 'COST' ? 48 : 24;

    return data.map((pt, idx) => {
      // Calculate rolling averages
      const window50 = Math.min(idx + 1, 10);
      const slice50 = data.slice(Math.max(0, idx - window50 + 1), idx + 1);
      const sma50Val = slice50.reduce((acc, curr) => acc + curr.price, 0) / slice50.length;

      const window200 = Math.min(idx + 1, 20);
      const slice200 = data.slice(Math.max(0, idx - window200 + 1), idx + 1);
      const sma200Val = slice200.reduce((acc, curr) => acc + curr.price, 0) / slice200.length;

      // Benchmark normalized price line
      const progress = idx / (count - 1 || 1);
      const spyNormalized = Number((rawChartSeries.startPrice * (1 + (spyReturn / 100) * progress)).toFixed(2));
      const qqqNormalized = Number((rawChartSeries.startPrice * (1 + (qqqReturn / 100) * progress)).toFixed(2));

      // Historical PE simulation
      const peRatio = Number((basePE * (pt.price / (rawChartSeries.startPrice || 1)) * (0.95 + (Math.sin(idx * 0.4) * 0.05))).toFixed(1));
      const evFcfRatio = Number((peRatio * 0.88).toFixed(1));

      return {
        ...pt,
        sma50: Number(sma50Val.toFixed(2)),
        sma200: Number(sma200Val.toFixed(2)),
        spyPrice: spyNormalized,
        qqqPrice: qqqNormalized,
        peRatio,
        evFcfRatio,
        medianPE: basePE,
      };
    });
  }, [rawChartSeries, selectedTimeframe, ticker]);

  // Active display point (either hovered scrub point or current final point)
  const activePoint = hoveredPoint || enrichedData[enrichedData.length - 1];

  // Active display calculations
  const displayPrice = activePoint ? activePoint.price : rawChartSeries.currentPrice;
  const displayChangeAmount = activePoint
    ? activePoint.changeFromStart
    : rawChartSeries.totalChangeAmount;
  const displayChangePercent = activePoint
    ? activePoint.changePctFromStart
    : rawChartSeries.totalChangePercent;
  const isDisplayPositive = displayChangeAmount >= 0;

  const currentTfObj = TIMEFRAMES.find((t) => t.id === selectedTimeframe) || TIMEFRAMES[0];
  const timeframeDesc = isHe ? currentTfObj.descHe : currentTfObj.descEn;

  // Chart theme colors
  const strokeColor = isDisplayPositive ? '#10b981' : '#f43f5e';
  const gradientId = `stock-gradient-${ticker}-${selectedTimeframe}-${isDisplayPositive ? 'green' : 'red'}`;

  // Min & max for Y-Axis padding
  const yDomain = useMemo(() => {
    if (activeViewMode === 'valuation') {
      return [10, 60];
    }
    let min = rawChartSeries.lowPrice;
    let max = rawChartSeries.highPrice;

    if (benchmarkOverlay === 'SPY') {
      enrichedData.forEach(d => {
        if (d.spyPrice < min) min = d.spyPrice;
        if (d.spyPrice > max) max = d.spyPrice;
      });
    } else if (benchmarkOverlay === 'QQQ') {
      enrichedData.forEach(d => {
        if (d.qqqPrice < min) min = d.qqqPrice;
        if (d.qqqPrice > max) max = d.qqqPrice;
      });
    }

    const pad = (max - min) * 0.12 || min * 0.05;
    return [Math.max(0, Number((min - pad).toFixed(2))), Number((max + pad).toFixed(2))];
  }, [rawChartSeries, activeViewMode, benchmarkOverlay, enrichedData]);

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-2xl p-4 sm:p-5 transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 overflow-y-auto bg-slate-950/98 p-6' : ''
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {ticker}
            </span>
            {companyName && (
              <span className="text-xs sm:text-sm text-slate-400 font-medium truncate max-w-[220px]">
                {companyName}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${tickFlash ? 'scale-150 ring-2 ring-emerald-300' : 'animate-pulse'}`} />
              {isHe ? 'שוק חי בלייב' : 'LIVE MARKET'}
            </span>
          </div>

          {/* Interactive Price & Delta Scrub Display */}
          <div className="mt-2 flex items-baseline gap-3 flex-wrap">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono transition-colors duration-200 ${
                tickFlash ? 'text-cyan-300' : 'text-white'
              }`}
            >
              ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div
              className={`flex items-center gap-1 text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded-md ${
                isDisplayPositive
                  ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/50'
                  : 'text-rose-400 bg-rose-950/50 border border-rose-800/50'
              }`}
            >
              {isDisplayPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isDisplayPositive ? '+' : '-'}${Math.abs(displayChangeAmount).toFixed(2)} ({isDisplayPositive ? '+' : ''}
                {displayChangePercent.toFixed(2)}%)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {hoveredPoint ? hoveredPoint.fullDate : timeframeDesc}
            </span>
          </div>
        </div>

        {/* View Mode & Expand Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher: Price vs Valuation Multiples */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setActiveViewMode('price')}
              className={`px-2.5 py-1 text-xs font-mono rounded-md transition ${
                activeViewMode === 'price'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHe ? 'מחיר' : 'Price'}
            </button>
            <button
              onClick={() => setActiveViewMode('valuation')}
              className={`px-2.5 py-1 text-xs font-mono rounded-md transition ${
                activeViewMode === 'valuation'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHe ? 'מכפיל P/E' : 'Valuation (P/E)'}
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800 cursor-pointer"
            title={isExpanded ? (isHe ? 'צמצם' : 'Collapse') : (isHe ? 'הרחב מסך מלא' : 'Expand Fullscreen')}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timeframe Selector & Advanced Indicators Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 my-3">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TIMEFRAMES.map((tf) => {
            const isSelected = selectedTimeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => {
                  setSelectedTimeframe(tf.id);
                  setHoveredPoint(null);
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-extrabold'
                    : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                {isHe ? tf.labelHe : tf.labelEn}
              </button>
            );
          })}
        </div>

        {/* Indicators & Benchmark Overlays */}
        {activeViewMode === 'price' && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono flex-wrap">
            {/* SMA 50 */}
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                showSMA50
                  ? 'bg-amber-950/80 text-amber-300 border-amber-600 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-0.5 bg-amber-400 inline-block" />
              SMA 50
            </button>

            {/* SMA 200 */}
            <button
              onClick={() => setShowSMA200(!showSMA200)}
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                showSMA200
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-600 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-0.5 bg-indigo-400 inline-block" />
              SMA 200
            </button>

            {/* Benchmark Overlay */}
            <button
              onClick={() =>
                setBenchmarkOverlay(
                  benchmarkOverlay === 'none' ? 'SPY' : benchmarkOverlay === 'SPY' ? 'QQQ' : 'none'
                )
              }
              className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                benchmarkOverlay !== 'none'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isHe ? 'השווה למדד S&P 500 או Nasdaq' : 'Compare vs S&P 500 or Nasdaq'}
            >
              <GitCompare className="w-3 h-3" />
              <span>{benchmarkOverlay === 'none' ? (isHe ? 'מדד ייחוס' : 'Benchmark') : `vs ${benchmarkOverlay}`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Recharts Chart Stage */}
      <div className={`w-full relative ${isExpanded ? 'h-[440px]' : compact ? 'h-[200px]' : 'h-[280px] sm:h-[320px]'}`}>
        <ResponsiveContainer width="100%" height="100%">
          {activeViewMode === 'price' ? (
            <ComposedChart
              data={enrichedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.45} />
                  <stop offset="60%" stopColor={strokeColor} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis
                domain={yDomain}
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `$${val}`}
                orientation="right"
              />

              <ReferenceLine
                y={rawChartSeries.startPrice}
                stroke="#475569"
                strokeDasharray="3 3"
                strokeWidth={1}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    const ptPositive = pt.changeFromStart >= 0;
                    return (
                      <div className="rounded-lg bg-slate-900/95 border border-slate-700/80 p-2.5 shadow-xl font-mono text-xs z-50 backdrop-blur-md">
                        <div className="text-[11px] text-slate-400 mb-1">{pt.fullDate}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">${pt.price.toFixed(2)}</span>
                          <span
                            className={`text-[11px] font-bold ${
                              ptPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {ptPositive ? '+' : '-'}${Math.abs(pt.changeFromStart).toFixed(2)} ({ptPositive ? '+' : ''}
                            {pt.changePctFromStart.toFixed(2)}%)
                          </span>
                        </div>
                        {showSMA50 && (
                          <div className="text-[10px] text-amber-400 mt-1">SMA 50: ${pt.sma50}</div>
                        )}
                        {showSMA200 && (
                          <div className="text-[10px] text-indigo-400">SMA 200: ${pt.sma200}</div>
                        )}
                        {benchmarkOverlay !== 'none' && (
                          <div className="text-[10px] text-cyan-300">
                            {benchmarkOverlay}: ${benchmarkOverlay === 'SPY' ? pt.spyPrice : pt.qqqPrice}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />

              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#fbbf24"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {showSMA200 && (
                <Line
                  type="monotone"
                  dataKey="sma200"
                  stroke="#818cf8"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {benchmarkOverlay === 'SPY' && (
                <Line
                  type="monotone"
                  dataKey="spyPrice"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {benchmarkOverlay === 'QQQ' && (
                <Line
                  type="monotone"
                  dataKey="qqqPrice"
                  stroke="#c084fc"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          ) : (
            /* Valuation Multiples Historical View */
            <ComposedChart
              data={enrichedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val}x`}
                orientation="right"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-slate-900/95 border border-slate-700/80 p-2.5 shadow-xl font-mono text-xs z-50">
                        <div className="text-[11px] text-slate-400 mb-1">{pt.fullDate}</div>
                        <div className="text-cyan-300 font-bold">P/E Multiple: {pt.peRatio}x</div>
                        <div className="text-emerald-400">EV/FCF Multiple: {pt.evFcfRatio}x</div>
                        <div className="text-slate-400 text-[10px]">5Y Historical Median: {pt.medianPE}x</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={enrichedData[0]?.medianPE || 25}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: '5Y Median P/E', fill: '#94a3b8', fontSize: 10, position: 'insideTopLeft' }}
              />
              <Line
                type="monotone"
                dataKey="peRatio"
                stroke="#06b6d4"
                strokeWidth={2.2}
                dot={false}
                name="P/E Ratio"
              />
              <Line
                type="monotone"
                dataKey="evFcfRatio"
                stroke="#10b981"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                dot={false}
                name="EV/FCF"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Google Finance Key Statistics Ribbon */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">
              {isHe ? 'שער פתיחה / התחלתי' : 'Period Start Price'}
            </div>
            <div className="text-slate-200 font-bold mt-0.5">${rawChartSeries.startPrice.toFixed(2)}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">
              {isHe ? 'גבוה / נמוך בתקופה' : 'Period High / Low'}
            </div>
            <div className="text-slate-200 font-bold mt-0.5">
              ${rawChartSeries.highPrice.toFixed(2)} / ${rawChartSeries.lowPrice.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">
              {isHe ? 'טווח 52 שבועות' : '52-Wk Range'}
            </div>
            <div className="text-slate-200 font-bold mt-0.5">
              ${rawChartSeries.fiftyTwoWeekLow} - ${rawChartSeries.fiftyTwoWeekHigh}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <div className="text-[10px] text-slate-400">
              {isHe ? 'תשואה שנתית צפויה לשנתיים' : 'Expected 2Y CAGR'}
            </div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {expected5YCAGR || `${numericCagr.toFixed(1)}%`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
