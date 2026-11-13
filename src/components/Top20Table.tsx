import React, { useState } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { QuickActionPlusMenu } from './QuickActionPlusMenu';
import { SupportedLanguage } from '../i18n';
import { localizeStock, SECTOR_TRANSLATIONS } from '../data/stockLocalization';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpDown,
  ChevronRight,
  ExternalLink,
  Download,
  Star,
  Briefcase,
  Check
} from 'lucide-react';

interface Top20TableProps {
  stocks: ResearchStock[];
  watchlist?: WatchlistItem[];
  onToggleWatchlist?: (stock: ResearchStock) => void;
  onAddToPortfolio?: (stock: ResearchStock) => void;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

type SortField = 'investmentScore' | 'moatScore' | 'financialQualityScore' | 'growthScore' | 'valuationScore' | 'ticker';

export const Top20Table: React.FC<Top20TableProps> = ({
  stocks,
  watchlist = [],
  onToggleWatchlist,
  onAddToPortfolio,
  livePrices = {},
  onSelectStock,
  onOpenDeepDive,
  currentLang = 'he',
}) => {
  const [sortField, setSortField] = useState<SortField>('investmentScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  const isHe = currentLang === 'he';
  const localizedStocks = stocks.map((s) => localizeStock(s, currentLang));

  const exportToCSV = () => {
    const headers = [
      'Rank',
      'Ticker',
      'Company Name',
      'Exchange',
      'Sector',
      'Market Cap',
      'Live Price',
      'Investment Score',
      'Final Verdict',
      'Moat Score',
      'Moat Type',
      'ROIC Current',
      'Revenue 5Y CAGR',
      'Forward PE',
      'Expected 5Y CAGR (Base)',
      'Thesis Risk',
    ];

    const rows = localizedStocks.map((s) => {
      const live = livePrices[s.ticker];
      const prc = live ? `$${live.price.toFixed(2)}` : s.currentPrice;
      return [
        s.rank,
        s.ticker,
        `"${s.companyName.replace(/"/g, '""')}"`,
        s.exchange,
        `"${s.sector}"`,
        s.marketCap,
        prc,
        s.investmentScore,
        s.finalVerdict,
        s.moatScore,
        `"${s.moatType || 'Wide Moat'}"`,
        `"${s.financialQuality.roicCurrent.value}"`,
        `"${s.growth.revenueCAGR5Y.value}"`,
        `"${s.valuation.forwardPE.value}"`,
        `"${s.scenarios.baseCase.expectedCAGR}"`,
        `"${s.thesisRisk}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `US_Quality_Compounders_TOP20_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validStocks = stocks.filter(Boolean);
  const rawSectors = Array.from(new Set(validStocks.map((s) => s?.sector).filter(Boolean)));
  const sectorMap = SECTOR_TRANSLATIONS[currentLang] || SECTOR_TRANSLATIONS.en;

  const sectors = [
    { key: 'ALL', label: isHe ? 'כל הסקטורים' : 'ALL Sectors' },
    ...rawSectors.map((sec) => ({
      key: sec,
      label: sectorMap[sec] || sec,
    })),
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredStocks = localizedStocks
    .filter((s) => (sectorFilter === 'ALL' ? true : s.sector === sectorFilter || s.sector === sectorMap[sectorFilter]))
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    if (score >= 80) return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
    if (score >= 70) return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
  };

  const getVerdictBadgeClass = (verdict: string) => {
    if (verdict === 'A+') return 'bg-emerald-500 text-slate-950 font-bold';
    if (verdict === 'A') return 'bg-emerald-600 text-white font-semibold';
    if (verdict === 'B+') return 'bg-cyan-600 text-white font-semibold';
    if (verdict === 'B') return 'bg-amber-600 text-white font-semibold';
    return 'bg-rose-600 text-white font-semibold';
  };

  return (
    <div className="space-y-4">
      {/* Section Header & Explanations */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              #19 TOP 20 — US 5-Year Investment Opportunities
            </h2>
            <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded font-mono">
              Scanned Universe: {stocks.length} Companies ($5B+ Cap)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filtered by 6-category weighted scoring model. Zero tolerance for structural value traps or unsustainable leverage.
          </p>
        </div>

        {/* Sector Filter & CSV Export */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Sector:</span>
            <select
              id="top20-sector-filter"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={exportToCSV}
            id="export-top20-csv"
            className="px-3 py-1 bg-slate-800 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white rounded transition flex items-center gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60 shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
              <th className="py-3 px-3 w-12 text-center">Rank</th>
              <th
                onClick={() => handleSort('ticker')}
                className="py-3 px-3 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1">
                  <span>Ticker / Company</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('investmentScore')}
                className="py-3 px-3 cursor-pointer hover:text-cyan-400 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Investment Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Live Price</th>
              <th
                onClick={() => handleSort('moatScore')}
                className="py-3 px-3 cursor-pointer hover:text-cyan-400 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Moat (30%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('financialQualityScore')}
                className="py-3 px-3 cursor-pointer hover:text-cyan-400 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Quality (20%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('growthScore')}
                className="py-3 px-3 cursor-pointer hover:text-cyan-400 transition"
              >
                <div className="flex items-center gap-1">
                  <span>5Y Growth (20%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Per-Share (10%)</th>
              <th
                onClick={() => handleSort('valuationScore')}
                className="py-3 px-3 cursor-pointer hover:text-cyan-400 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Valuation (15%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Analyst (5%)</th>
              <th className="py-3 px-3">5Y Expected CAGR</th>
              <th className="py-3 px-3">Moat Trend</th>
              <th className="py-3 px-3">Risk</th>
              <th className="py-3 px-3 text-center">Verdict</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredStocks.map((stock, idx) => {
              const isHighlight = stock.ticker === 'UNH';
              const live = livePrices[stock.ticker];
              const curPrice = live ? live.price : parseFloat(stock.currentPrice.replace(/[^0-9.]/g, '')) || 0;
              const curChg = live ? live.changePercent : 0;
              const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

              return (
                <tr
                  key={stock.ticker}
                  id={`top20-row-${stock.ticker}`}
                  className={`hover:bg-slate-800/50 transition cursor-pointer ${
                    isHighlight ? 'bg-blue-950/20' : ''
                  }`}
                  onClick={() => onSelectStock(stock)}
                >
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-cyan-300">{stock.ticker}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {stock.exchange}
                          </span>
                        </div>
                        <div className="text-slate-300 text-xs font-medium truncate max-w-[180px]">
                          {stock.companyName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {stock.sector} • {stock.marketCap}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    <span
                      className={`px-2.5 py-1 rounded text-xs border font-bold ${getScoreBadgeClass(
                        stock.investmentScore
                      )}`}
                    >
                      {stock.investmentScore} / 100
                    </span>
                  </td>

                  {/* Live Price Column */}
                  <td className="py-3.5 px-3 font-mono text-right">
                    <div className="font-bold text-slate-200 text-xs sm:text-sm">
                      ${curPrice.toFixed(2)}
                    </div>
                    <div className={`text-[10px] font-semibold ${curChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {curChg >= 0 ? '+' : ''}{curChg.toFixed(2)}%
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-semibold text-slate-200">{stock.moatScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-semibold text-slate-200">{stock.financialQualityScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-semibold text-slate-200">{stock.growthScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-semibold text-slate-200">{stock.perShareScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-semibold text-slate-200">{stock.valuationScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-semibold text-slate-200">{stock.analystScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-emerald-400">
                    {stock.expected5YCAGRRange}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                        stock.moatTrend === 'Strengthening'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : stock.moatTrend === 'Stable'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {stock.moatTrend}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                        stock.thesisRisk === 'Low'
                          ? 'text-emerald-400'
                          : stock.thesisRisk === 'Medium'
                          ? 'text-amber-400'
                          : 'text-rose-400 font-bold'
                      }`}
                    >
                      {stock.thesisRisk}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getVerdictBadgeClass(
                        stock.finalVerdict
                      )}`}
                    >
                      {stock.finalVerdict}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onToggleWatchlist && onAddToPortfolio && (
                        <QuickActionPlusMenu
                          stock={stock}
                          watchlist={watchlist}
                          onToggleWatchlist={onToggleWatchlist}
                          onAddToPortfolio={onAddToPortfolio}
                          currentLang={currentLang}
                          size="sm"
                        />
                      )}

                      {/* Deep Dive Memo */}
                      <button
                        id={`btn-deepdive-${stock.ticker}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeepDive(stock);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded text-xs font-medium transition inline-flex items-center gap-1"
                        title="Open 5Y Institutional Memo"
                      >
                        <span>Memo</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
