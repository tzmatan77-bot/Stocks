import React, { useState } from 'react';
import { ResearchStock } from '../types';
import {
  PieChart,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Layers,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PortfolioSimulatorProps {
  stocks: ResearchStock[];
  onOpenDeepDive: (stock: ResearchStock) => void;
  onSelectStock?: (stock: ResearchStock) => void;
}

interface AllocationItem {
  ticker: string;
  weight: number; // percentage, e.g. 20
}

export const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({
  stocks,
  onOpenDeepDive,
  onSelectStock,
}) => {
  const top10 = stocks.slice(0, 10);
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { ticker: 'UNH', weight: 20 },
    { ticker: 'MSFT', weight: 20 },
    { ticker: 'GOOGL', weight: 20 },
    { ticker: 'V', weight: 20 },
    { ticker: 'COST', weight: 20 },
  ]);

  const totalWeight = allocations.reduce((acc, curr) => acc + curr.weight, 0);

  // Helper to change weight
  const handleWeightChange = (ticker: string, newWeight: number) => {
    setAllocations((prev) =>
      prev.map((item) => (item.ticker === ticker ? { ...item, weight: Math.max(0, newWeight) } : item))
    );
  };

  // Helper to add or remove a stock
  const handleToggleStock = (ticker: string) => {
    const exists = allocations.find((a) => a.ticker === ticker);
    if (exists) {
      setAllocations((prev) => prev.filter((a) => a.ticker !== ticker));
    } else {
      if (allocations.length >= 10) return;
      setAllocations((prev) => [...prev, { ticker, weight: 10 }]);
    }
  };

  const handleEqualWeight = () => {
    if (allocations.length === 0) return;
    const equalW = Math.floor(100 / allocations.length);
    const remainder = 100 - equalW * allocations.length;
    setAllocations((prev) =>
      prev.map((item, idx) => ({
        ...item,
        weight: idx === 0 ? equalW + remainder : equalW,
      }))
    );
  };

  // Calculations
  const parseCAGR = (cagrStr: string) => {
    // e.g. "13.5%" -> 0.135
    const num = parseFloat(cagrStr.replace('%', ''));
    return isNaN(num) ? 0.12 : num / 100;
  };

  let weightedInvestmentScore = 0;
  let weightedMoatScore = 0;
  let weightedExpectedCAGR = 0;
  let weightedBearCAGR = 0;
  let weightedBullCAGR = 0;

  const validWeightTotal = totalWeight > 0 ? totalWeight : 1;

  allocations.forEach((item) => {
    const stock = stocks.find((s) => s.ticker === item.ticker);
    if (stock) {
      const normalizedWeight = item.weight / validWeightTotal;
      weightedInvestmentScore += stock.investmentScore * normalizedWeight;
      weightedMoatScore += stock.moatScore * normalizedWeight;
      weightedExpectedCAGR += parseCAGR(stock.scenarios.baseCase.expectedCAGR) * normalizedWeight;
      weightedBearCAGR += parseCAGR(stock.scenarios.bearCase.expectedCAGR) * normalizedWeight;
      weightedBullCAGR += parseCAGR(stock.scenarios.bullCase.expectedCAGR) * normalizedWeight;
    }
  });

  const projected2YBase = initialCapital * Math.pow(1 + weightedExpectedCAGR, 2);
  const projected2YBear = initialCapital * Math.pow(1 + weightedBearCAGR, 2);
  const projected2YBull = initialCapital * Math.pow(1 + weightedBullCAGR, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                2-YEAR PORTFOLIO SIMULATOR (FY2)
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                2-Year Quality Compounding Allocator
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Construct an institutional concentrated portfolio of high-conviction compounders and simulate 2-year capital growth (24-month horizon) under Bear, Base, and Bull macroeconomic scenarios.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEqualWeight}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Equal Weight (100%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow text-center">
          <div className="text-[10px] text-slate-400">Weighted Quality Score</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">
            {weightedInvestmentScore.toFixed(1)} / 100
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Moat: {weightedMoatScore.toFixed(1)}/100</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/60 shadow text-center">
          <div className="text-[10px] text-slate-400">Weighted 2Y CAGR (Base)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {(weightedExpectedCAGR * 100).toFixed(1)}% / yr
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Range: {(weightedBearCAGR * 100).toFixed(1)}% – {(weightedBullCAGR * 100).toFixed(1)}%</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow text-center">
          <div className="text-[10px] text-slate-400">Initial Capital</div>
          <div className="text-lg font-bold text-white mt-1">
            ${initialCapital.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Customizable Base</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-800/80 shadow text-center">
          <div className="text-[10px] text-slate-400">Projected 2Y Value (Base)</div>
          <div className="text-xl font-bold text-cyan-300 mt-1">
            ${Math.round(projected2YBase).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">+${Math.round(projected2YBase - initialCapital).toLocaleString()} Gain (2-Year)</div>
        </div>
      </div>

      {/* Main Grid: Allocator + Projection Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Holdings & Allocation Sliders */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Target Allocations &amp; Weights</span>
            </h3>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                totalWeight === 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              Total Weight: {totalWeight}% {totalWeight !== 100 && '(Auto-Normalized)'}
            </span>
          </div>

          {/* Allocation rows */}
          <div className="space-y-3">
            {allocations.map((item) => {
              const stock = stocks.find((s) => s.ticker === item.ticker);
              if (!stock) return null;
              return (
                <div
                  key={item.ticker}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div
                    onClick={() => onSelectStock ? onSelectStock(stock) : onOpenDeepDive(stock)}
                    className="flex items-center gap-3 cursor-pointer group/sim"
                    title={`Click to view ${stock.ticker} details and valuations`}
                  >
                    <span className="font-mono font-bold text-sm text-cyan-300 group-hover/sim:underline group-hover/sim:text-cyan-200 w-16">{stock.ticker}</span>
                    <div>
                      <div className="text-slate-200 font-medium group-hover/sim:text-white">{stock.companyName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Score: {stock.investmentScore}/100 • Base 2Y CAGR: {stock.scenarios.baseCase.expectedCAGR}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-56">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={item.weight}
                      onChange={(e) => handleWeightChange(item.ticker, parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <span className="font-mono font-bold text-white w-10 text-right">{item.weight}%</span>
                    <button
                      onClick={() => handleToggleStock(item.ticker)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Pool */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono block mb-2">
              Add from TOP 10 Universe:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {top10.map((s) => {
                const inPortfolio = allocations.some((a) => a.ticker === s.ticker);
                return (
                  <button
                    key={s.ticker}
                    onClick={() => handleToggleStock(s.ticker)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                      inPortfolio
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {inPortfolio ? `✓ ${s.ticker}` : `+ ${s.ticker}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: 5-Year Capital Compounder Curves */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>2-Year Portfolio Capital Growth ($) (FY2 Target)</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {/* Bear Case */}
            <div className="p-3 rounded-lg bg-slate-950 border border-rose-900/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">Bear Case 2Y Growth</span>
                <span className="text-rose-400 font-bold">{(weightedBearCAGR * 100).toFixed(1)}% CAGR</span>
              </div>
              <div className="text-base font-bold text-slate-200">
                ${Math.round(projected2YBear).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                Multiple compression, slower organic expansion over 24 months.
              </div>
            </div>

            {/* Base Case */}
            <div className="p-3 rounded-lg bg-slate-950 border border-cyan-700/80 space-y-1 shadow">
              <div className="flex items-center justify-between">
                <span className="text-cyan-300 font-bold">Base Case (High Probability 2Y)</span>
                <span className="text-cyan-300 font-bold">{(weightedExpectedCAGR * 100).toFixed(1)}% CAGR</span>
              </div>
              <div className="text-lg font-extrabold text-white">
                ${Math.round(projected2YBase).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                Stable moat defense, ROIC reinvestment compounder through FY2.
              </div>
            </div>

            {/* Bull Case */}
            <div className="p-3 rounded-lg bg-slate-950 border border-emerald-900/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Bull Case 2Y Growth</span>
                <span className="text-emerald-400 font-bold">{(weightedBullCAGR * 100).toFixed(1)}% CAGR</span>
              </div>
              <div className="text-base font-bold text-slate-200">
                ${Math.round(projected2YBull).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                TAM acceleration, multiple expansion, strong FY1-FY2 execution.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-slate-300 font-mono font-semibold">Institutional Allocation Rule:</span>
            <p>
              Concentrated allocations (5–10 quality compounders) minimize non-moat idiosyncratic risk while capturing full compounding power.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
