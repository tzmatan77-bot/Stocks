import React, { useState } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface QuarterlyMonitorProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  onSelectStock: (stock: ResearchStock) => void;
}

export const QuarterlyMonitor: React.FC<QuarterlyMonitorProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
}) => {
  const [activeTicker, setActiveTicker] = useState<string>(
    selectedStock?.ticker || stocks[0]?.ticker || 'UNH'
  );

  const currentStock =
    stocks.find((s) => s.ticker === activeTicker) || stocks[0];

  if (!currentStock) return null;

  const review = currentStock.quarterlyMonitoring.lastQuarterReview;

  const healthQuestions = [
    { label: '1. Moat Strengthened / Defended?', passed: review.moatStrengthened },
    { label: '2. Revenue Growing Organically?', passed: review.revenueGrowingOrganically },
    { label: '3. Operating Margins Improving / Maintained?', passed: review.marginsImproving },
    { label: '4. FCF Cash Conversion Healthy (>100%)?', passed: review.fcfCashConversionHealthy },
    { label: '5. ROIC Comfortably Above Cost of Capital?', passed: review.roicAboveCostOfCapital },
    { label: '6. Capital Allocation Disciplined (Repurchases/ROIC)?', passed: review.capitalAllocationDiscipline },
    { label: '7. Analyst Revisions Neutral or Constructive?', passed: review.analystRevisionsConstructive },
    { label: '8. Valuation Remains Favorable to Long-Term IRR?', passed: review.valuationFavorable },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                SECTIONS 22–25
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Quarterly Thesis Monitoring & Thesis Break Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active quarterly maintenance verifying that the 5-year compounding engine remains uncompromised across SEC 10-Q earnings prints.
            </p>
          </div>

          {/* Stock selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
            {stocks.slice(0, 8).map((stock) => {
              const isSelected = stock.ticker === activeTicker;
              return (
                <button
                  key={stock.ticker}
                  id={`btn-monitor-select-${stock.ticker}`}
                  onClick={() => {
                    setActiveTicker(stock.ticker);
                    onSelectStock(stock);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <StockLogoBadge ticker={stock.ticker} size="xs" />
                  <span>{stock.ticker}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Stock Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <StockLogoBadge ticker={currentStock.ticker} name={currentStock.companyName} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-cyan-300">{currentStock.ticker}</span>
                <span className="text-slate-300 text-sm font-medium">{currentStock.companyName}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Filing: {review.quarter} ({review.filingDate})
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Primary Source: {review.revenue.source} • Audit Standard: GAAP / Non-GAAP Reconciliation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Quarterly Health Score</div>
              <div className="text-2xl font-mono font-extrabold text-emerald-400">
                {currentStock.quarterlyMonitoring.currentHealthScore}
                <span className="text-xs text-slate-500">/100</span>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Thesis Break Triggered</div>
              <div className={`text-sm font-mono font-bold mt-1 px-2 py-0.5 rounded ${
                review.thesisBreakTriggered
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {review.thesisBreakTriggered ? 'ALERT TRIGGERED' : 'NO BREAK (HEALTHY)'}
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Print Financials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Quarterly Revenue:</span>
            <div className="text-sm font-bold text-white mt-0.5">{review.revenue.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{review.revenue.period}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Operating Income:</span>
            <div className="text-sm font-bold text-white mt-0.5">{review.operatingIncome.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{review.operatingIncome.period}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Free Cash Flow:</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">{review.fcf.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{review.fcf.period}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400">EPS (Diluted):</span>
            <div className="text-sm font-bold text-white mt-0.5">{review.eps.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{review.eps.period}</div>
          </div>
        </div>
      </div>

      {/* 8-Point Quarterly Checklist & Health Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 8 Questions Checklist */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Section 23: 8-Point Quarterly Thesis Checklist</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {healthQuestions.filter((q) => q.passed).length}/8 Passed
            </span>
          </div>

          <div className="space-y-2">
            {healthQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <span className="text-slate-300 font-medium">{q.label}</span>
                {q.passed ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> YES
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-mono font-bold text-xs bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                    <XCircle className="w-3.5 h-3.5" /> NO
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guidance, Revisions & Thesis Break Protocol */}
        <div className="space-y-4">
          {/* Guidance & Revisions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Guidance Changes & Revisions Sentiment</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Management Guidance:</span>
                <div className={`text-sm font-bold mt-1 ${
                  review.guidanceChange === 'Raised' ? 'text-emerald-400' : 'text-slate-200'
                }`}>
                  {review.guidanceChange}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Consensus Revisions:</span>
                <div className={`text-sm font-bold mt-1 ${
                  review.consensusRevisionsAfterPrint === 'Positive' ? 'text-emerald-400' : 'text-slate-200'
                }`}>
                  {review.consensusRevisionsAfterPrint}
                </div>
              </div>
            </div>
          </div>

          {/* Section 25 Thesis Break Alerts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Section 25: Thesis Break Conditions & Exit Engine</span>
            </h3>
            {review.thesisBreakAlerts.length > 0 ? (
              <div className="space-y-2">
                {review.thesisBreakAlerts.map((alert, i) => (
                  <div key={i} className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                    {alert}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero Thesis Break Conditions Triggered</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Under the specification, an immediate exit is required if: ROIC drops below WACC for 2 consecutive quarters, Moat collapses, Debt/EBITDA exceeds 3.5x without repayment plan, or FCF conversion drops below 70% due to aggressive capitalizations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
