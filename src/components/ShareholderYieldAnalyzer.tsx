import React, { useState, useMemo } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import {
  Coins,
  TrendingUp,
  ShieldCheck,
  Percent,
  RefreshCw,
  PieChart,
  Award,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface ShareholderYieldAnalyzerProps {
  stocks: ResearchStock[];
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

export const ShareholderYieldAnalyzer: React.FC<ShareholderYieldAnalyzerProps> = ({
  stocks,
  onOpenDeepDive,
  currentLang = 'he',
}) => {
  const [selectedSort, setSelectedSort] = useState<'totalYield' | 'buyback' | 'dividend' | 'score'>('totalYield');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const isHe = currentLang === 'he';

  // Extract shareholder metrics for all stocks
  const enrichedStocks = useMemo(() => {
    const parsePctSafe = (raw: string | undefined, fallback: number): number => {
      if (!raw) return fallback;
      const cleaned = raw.replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? fallback : Math.max(0, num);
    };

    return stocks.filter(Boolean).map((s) => {
      const localized = localizeStock(s, currentLang);
      const perShareObj = s.perShare || s.perShareValueCreation;
      const divStr = perShareObj?.dividendYield;
      const buybackStr = perShareObj?.buybackYield;
      const divCagrStr = perShareObj?.dividendCAGR5Y;
      const sharesReducedStr = perShareObj?.sharesOutstandingChange5Y || '0.0%';

      const divNum = parsePctSafe(divStr, 0);
      const buybackNum = parsePctSafe(buybackStr, 0);
      const totalYieldNum = Number((divNum + buybackNum).toFixed(2));
      const divCagrNum = parsePctSafe(divCagrStr, 0);

      // Calculate FCF payout sustainability
      const fcfMarginRaw = parseFloat((s.financialQuality?.fcfMargin?.value || '').replace(/[^0-9.-]/g, ''));
      const fcfMarginNum = isNaN(fcfMarginRaw) ? 18 : fcfMarginRaw;
      const safetyScore = Math.min(99, Math.max(35, Math.round(72 + fcfMarginNum * 0.55 + ((s.financialQualityScore || 75) * 0.15))));

      return {
        ...localized,
        rawStock: s,
        divNum,
        buybackNum,
        totalYieldNum,
        divCagrNum,
        sharesReducedStr,
        safetyScore,
      };
    });
  }, [stocks, currentLang]);

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let result = enrichedStocks;
    if (selectedSector !== 'ALL') {
      result = result.filter((s) => s.sector === selectedSector);
    }
    return [...result].sort((a, b) => {
      if (selectedSort === 'totalYield') return b.totalYieldNum - a.totalYieldNum;
      if (selectedSort === 'buyback') return b.buybackNum - a.buybackNum;
      if (selectedSort === 'dividend') return b.divNum - a.divNum;
      return b.investmentScore - a.investmentScore;
    });
  }, [enrichedStocks, selectedSector, selectedSort]);

  const sectors = useMemo(() => {
    const valid = stocks.filter(Boolean);
    return ['ALL', ...Array.from(new Set(valid.map((s) => s?.sector).filter(Boolean)))];
  }, [stocks]);

  // Top Yield Leader & Computed Averages
  const topYieldStock = filteredAndSorted[0];
  const universeStats = useMemo(() => {
    const list = filteredAndSorted.length > 0 ? filteredAndSorted : enrichedStocks;
    const n = list.length || 1;
    const avgDiv = list.reduce((acc, s) => acc + s.divNum, 0) / n;
    const avgBuyback = list.reduce((acc, s) => acc + s.buybackNum, 0) / n;
    const avgTotal = avgDiv + avgBuyback;
    const avgSafety = Math.round(list.reduce((acc, s) => acc + s.safetyScore, 0) / n);
    return {
      avgDiv: avgDiv.toFixed(2),
      avgBuyback: avgBuyback.toFixed(2),
      avgTotal: avgTotal.toFixed(2),
      avgSafety,
    };
  }, [filteredAndSorted, enrichedStocks]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-xs font-mono font-bold">
                CAPITAL RETURN AUDIT
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{isHe ? 'תשואת בעלי מניות ורכישה עצמית (Shareholder Yield)' : 'Shareholder Yield & Buyback Compounders'}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'תשואת בעלי מניות כוללת = תשואת דיבידנד + תשואת רכישה עצמית (Buybacks). המנוע בוחן הפחתת מניות וכיסוי FCF.'
                : 'Total Shareholder Yield combines dividend yield with net share buybacks, tracking 5Y dilution reduction and cash return discipline.'}
            </p>
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? (isHe ? 'כל הסקטורים' : 'All Sectors') : sec}
                </option>
              ))}
            </select>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-slate-950 border border-amber-600/80 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none"
            >
              <option value="totalYield">{isHe ? 'תשואת בעלי מניות כוללת' : 'Total Shareholder Yield'}</option>
              <option value="buyback">{isHe ? 'תשואת רכישה עצמית (Buybacks)' : 'Buyback Yield'}</option>
              <option value="dividend">{isHe ? 'תשואת דיבידנד בלבד' : 'Dividend Yield'}</option>
              <option value="score">{isHe ? 'ציון איכות השקעה' : 'Investment Quality Score'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-800/60 shadow space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>{isHe ? '#1 תשואת החזר כוללת' : '#1 Highest Total Yield'}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-3">
            <StockLogoBadge ticker={topYieldStock?.ticker || 'UNH'} name={topYieldStock?.companyName || ''} size="md" />
            <div>
              <div className="text-lg font-bold font-mono text-amber-300">{topYieldStock?.ticker || '—'}</div>
              <div className="text-xs text-slate-400">{topYieldStock?.companyName || ''}</div>
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">
            {topYieldStock?.totalYieldNum ?? 0}% <span className="text-xs text-slate-400 font-normal">{isHe ? 'תשואה שנתית' : 'Total Yield'}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>{isHe ? 'ממוצע תשואת החזר ביוניברס' : 'Universe Avg Shareholder Yield'}</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-300 mt-2">
            {universeStats.avgTotal}%
          </div>
          <p className="text-xs text-slate-400">
            {isHe
              ? `מורכב מ-${universeStats.avgDiv}% דיבידנד + ${universeStats.avgBuyback}% רכישה עצמית ממוצעת`
              : `${universeStats.avgDiv}% Dividend + ${universeStats.avgBuyback}% Net Share Buybacks`}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>{isHe ? 'עמידות תזרימית (FCF Coverage)' : 'FCF Dividend Safety Coverage'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-2">
            {universeStats.avgSafety} / 100
          </div>
          <p className="text-xs text-slate-400">
            {isHe ? 'ציון כיסוי ממוצע של תזרים המזומנים החופשי לחלוקת דיבידנד ורכישות' : 'Weighted Free Cash Flow coverage across displayed compounders'}
          </p>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900 shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{isHe ? 'טבלת דירוג תשואת בעלי מניות מקיפה' : 'Full Shareholder Yield & Buyback Breakdown'}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filteredAndSorted.length} {isHe ? 'מניות מוצגות' : 'stocks listed'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="py-3 px-4 text-left font-sans font-bold">{isHe ? 'חברה וסימול' : 'Company'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'תשואת בעלי מניות' : 'Total Yield'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'תשואת דיבידנד' : 'Div Yield'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'רכישה עצמית (Buybacks)' : 'Buyback Yield'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'צמיחת דיבידנד 5Y' : '5Y Div CAGR'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'הפחתת מניות 5Y' : '5Y Share Count'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'ציון בטיחות דיבידנד' : 'Safety Score'}</th>
                <th className="py-3 px-4 text-right font-sans">{isHe ? 'פעולה' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAndSorted.map((stock) => (
                <tr key={stock.ticker} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-cyan-300">{stock.ticker}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {stock.sector}
                          </span>
                        </div>
                        <div className="text-slate-300 font-sans text-xs truncate max-w-[180px]">
                          {stock.companyName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Total Yield */}
                  <td className="py-3 px-3 text-center font-bold text-sm text-amber-300 bg-amber-950/20">
                    {stock.totalYieldNum}%
                  </td>

                  {/* Div Yield */}
                  <td className="py-3 px-3 text-center text-slate-200">
                    {stock.divNum}%
                  </td>

                  {/* Buyback Yield */}
                  <td className="py-3 px-3 text-center text-emerald-400 font-semibold">
                    {stock.buybackNum}%
                  </td>

                  {/* 5Y Div CAGR */}
                  <td className="py-3 px-3 text-center text-slate-200">
                    {stock.divCagrNum}%
                  </td>

                  {/* 5Y Share Reduction */}
                  <td className="py-3 px-3 text-center text-cyan-400 font-medium">
                    {stock.sharesReducedStr}
                  </td>

                  {/* Dividend Safety Score */}
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[11px]">
                      {stock.safetyScore} / 100
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenDeepDive(stock.rawStock)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition text-xs font-mono cursor-pointer"
                    >
                      {isHe ? 'תזכיר ←' : 'Memo →'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
