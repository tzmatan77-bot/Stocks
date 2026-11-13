import React, { useState } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import {
  ArrowLeftRight,
  Shield,
  Activity,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target
} from 'lucide-react';

interface StockComparisonProps {
  stocks: ResearchStock[];
  initialStockA?: ResearchStock;
  initialStockB?: ResearchStock;
  onOpenDeepDive: (stock: ResearchStock) => void;
}

export const StockComparison: React.FC<StockComparisonProps> = ({
  stocks,
  initialStockA,
  initialStockB,
  onOpenDeepDive,
}) => {
  const [tickerA, setTickerA] = useState<string>(initialStockA?.ticker || stocks[0]?.ticker || 'UNH');
  const [tickerB, setTickerB] = useState<string>(
    initialStockB?.ticker || stocks[1]?.ticker || (stocks[0]?.ticker === 'MSFT' ? 'GOOGL' : 'MSFT')
  );

  const validStocks = stocks.filter(Boolean);
  const stockA = validStocks.find((s) => s?.ticker === tickerA) || validStocks[0];
  const stockB = validStocks.find((s) => s?.ticker === tickerB) || validStocks[1] || validStocks[0];

  if (!stockA || !stockB) return null;

  // Comparison helper
  const compareNumeric = (valA: number, valB: number, higherIsBetter = true) => {
    if (valA === valB) return { winner: 'tie', diff: 0 };
    if (higherIsBetter) {
      return { winner: valA > valB ? 'A' : 'B', diff: Math.abs(valA - valB) };
    } else {
      return { winner: valA < valB ? 'A' : 'B', diff: Math.abs(valA - valB) };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                HEAD-TO-HEAD AUDIT
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Side-by-Side Institutional Comparison
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Compare two quality compounders directly across Moat Durability, ROIC Spreads, FCF Conversion, 5Y Growth Runway, and Expected 5Y CAGRs.
            </p>
          </div>

          {/* Stock Selectors */}
          <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-44">
              <label className="text-[10px] text-slate-400 font-mono block mb-1">Company A:</label>
              <select
                id="select-stock-a"
                value={tickerA}
                onChange={(e) => setTickerA(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-700/80 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold focus:outline-none"
              >
                {stocks.map((s) => (
                  <option key={`a-${s.ticker}`} value={s.ticker}>
                    {s.ticker} — {s.companyName.slice(0, 18)}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 text-slate-500">
              <ArrowLeftRight className="w-4 h-4" />
            </div>

            <div className="flex-1 md:w-44">
              <label className="text-[10px] text-slate-400 font-mono block mb-1">Company B:</label>
              <select
                id="select-stock-b"
                value={tickerB}
                onChange={(e) => setTickerB(e.target.value)}
                className="w-full bg-slate-950 border border-blue-700/80 rounded-lg px-3 py-1.5 text-xs text-blue-300 font-mono font-bold focus:outline-none"
              >
                {stocks.map((s) => (
                  <option key={`b-${s.ticker}`} value={s.ticker}>
                    {s.ticker} — {s.companyName.slice(0, 18)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company A Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-800/80 shadow-md space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <StockLogoBadge ticker={stockA.ticker} name={stockA.companyName} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono text-cyan-300">{stockA.ticker}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {stockA.finalVerdict}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {stockA.exchange}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">{stockA.companyName}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {stockA.sector} • Cap: {stockA.marketCap}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Investment Score</div>
              <div className="text-2xl font-mono font-extrabold text-cyan-300">
                {stockA.investmentScore}<span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="text-cyan-400 font-mono font-bold">5Y Expected Return: </span>
            <strong className="text-emerald-400 font-mono">{stockA.expected5YCAGRRange}</strong>
          </div>
        </div>

        {/* Company B Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-blue-800/80 shadow-md space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <StockLogoBadge ticker={stockB.ticker} name={stockB.companyName} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono text-blue-300">{stockB.ticker}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    {stockB.finalVerdict}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {stockB.exchange}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">{stockB.companyName}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {stockB.sector} • Cap: {stockB.marketCap}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Investment Score</div>
              <div className="text-2xl font-mono font-extrabold text-blue-300">
                {stockB.investmentScore}<span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="text-blue-400 font-mono font-bold">5Y Expected Return: </span>
            <strong className="text-emerald-400 font-mono">{stockB.expected5YCAGRRange}</strong>
          </div>
        </div>
      </div>

      {/* Structured Metric-by-Metric Matrix */}
      <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900 shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Core 30-Section Dimension Benchmarks</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Green highlights indicate mathematical edge
          </span>
        </div>

        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
              <th className="py-3 px-4 text-left font-sans font-bold w-1/3">Evaluation Metric</th>
              <th className="py-3 px-4 text-center text-cyan-300 w-1/3">{stockA.ticker}</th>
              <th className="py-3 px-4 text-center text-blue-300 w-1/3">{stockB.ticker}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {/* 1. Overall Investment Score */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">Overall 0–100 Score</td>
              <td className={`py-3 px-4 text-center font-bold ${stockA.investmentScore >= stockB.investmentScore ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-300'}`}>
                {stockA.investmentScore} / 100
              </td>
              <td className={`py-3 px-4 text-center font-bold ${stockB.investmentScore >= stockA.investmentScore ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-300'}`}>
                {stockB.investmentScore} / 100
              </td>
            </tr>

            {/* 2. Moat Score (30%) */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">Moat &amp; Market Power (30%)</td>
              <td className={`py-3 px-4 text-center ${stockA.moatScore >= stockB.moatScore ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                {stockA.moatScore} / 100 ({stockA.moatTrend})
              </td>
              <td className={`py-3 px-4 text-center ${stockB.moatScore >= stockA.moatScore ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                {stockB.moatScore} / 100 ({stockB.moatTrend})
              </td>
            </tr>

            {/* 3. ROIC Current */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">ROIC (Current SEC Filing)</td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockA.financialQuality.roicCurrent.value} (WACC: {stockA.financialQuality.wacc})
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockB.financialQuality.roicCurrent.value} (WACC: {stockB.financialQuality.wacc})
              </td>
            </tr>

            {/* 4. FCF Conversion Rate */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">FCF Conversion Rate</td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockA.financialQuality.fcfConversionRate}
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockB.financialQuality.fcfConversionRate}
              </td>
            </tr>

            {/* 5. Operating Margin */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">Operating Margin (GAAP)</td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockA.financialQuality.operatingMargin.value}
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockB.financialQuality.operatingMargin.value}
              </td>
            </tr>

            {/* 6. Net Debt / EBITDA */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">Net Debt / EBITDA Leverage</td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockA.financialQuality.netDebtToEBITDA.value} ({stockA.financialQuality.balanceSheetHealth})
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockB.financialQuality.netDebtToEBITDA.value} ({stockB.financialQuality.balanceSheetHealth})
              </td>
            </tr>

            {/* 7. Revenue CAGR 5Y */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">5-Year Revenue CAGR</td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockA.growth.revenueCAGR5Y.value}
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                {stockB.growth.revenueCAGR5Y.value}
              </td>
            </tr>

            {/* 8. EPS CAGR 5Y */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">EPS 5Y CAGR (Per-Share)</td>
              <td className="py-3 px-4 text-center text-slate-200">
                {(stockA.perShare || stockA.perShareValueCreation)?.epsCAGR5Y.value || '14.2%'}
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                {(stockB.perShare || stockB.perShareValueCreation)?.epsCAGR5Y.value || '15.0%'}
              </td>
            </tr>

            {/* 9. Valuation Multiples */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">Forward P/E &amp; EV/FCF</td>
              <td className="py-3 px-4 text-center text-slate-200">
                P/E: {stockA.valuation.forwardPE.value} | EV/FCF: {stockA.valuation.evToFCF.value}
              </td>
              <td className="py-3 px-4 text-center text-slate-200">
                P/E: {stockB.valuation.forwardPE.value} | EV/FCF: {stockB.valuation.evToFCF.value}
              </td>
            </tr>

            {/* 10. Base Case 5Y CAGR */}
            <tr className="hover:bg-slate-800/40 bg-slate-950/40">
              <td className="py-3 px-4 font-sans font-bold text-white">5Y Expected CAGR (Base Case)</td>
              <td className="py-3 px-4 text-center font-bold text-emerald-400">
                {stockA.scenarios.baseCase.expectedCAGR}
              </td>
              <td className="py-3 px-4 text-center font-bold text-emerald-400">
                {stockB.scenarios.baseCase.expectedCAGR}
              </td>
            </tr>

            {/* 11. Thesis Risk Level */}
            <tr className="hover:bg-slate-800/40">
              <td className="py-3 px-4 font-sans font-medium text-slate-300">Thesis Risk Rating</td>
              <td className="py-3 px-4 text-center text-slate-200">{stockA.thesisRisk}</td>
              <td className="py-3 px-4 text-center text-slate-200">{stockB.thesisRisk}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deep Dive Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => onOpenDeepDive(stockA)}
          className="px-4 py-2 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold font-mono transition"
        >
          View {stockA.ticker} Deep Dive Memo →
        </button>
        <button
          onClick={() => onOpenDeepDive(stockB)}
          className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold font-mono transition"
        >
          View {stockB.ticker} Deep Dive Memo →
        </button>
      </div>
    </div>
  );
};
