import React, { useState, useMemo } from 'react';
import { ResearchStock, SeniorAnalystReport } from '../types';
import { getSeniorAnalystData, SeniorAnalystStats } from '../data/seniorAnalystData';
import { SupportedLanguage } from '../i18n';
import {
  Users,
  TrendingUp,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Target,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Search,
  FileCheck2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface SeniorAnalystRankingsProps {
  stock: ResearchStock;
  livePrice?: number;
  currentLang?: SupportedLanguage;
  onGoToDeepDive?: (stock: ResearchStock) => void;
  intrinsicFairValue?: number;
}

type SortOption = 'rank' | 'targetHigh' | 'targetLow' | 'upside' | 'date';
type FilterOption = 'all' | 'tier1' | 'strongBuy' | 'highUpside';

export const SeniorAnalystRankings: React.FC<SeniorAnalystRankingsProps> = ({
  stock,
  livePrice,
  currentLang = 'he',
  intrinsicFairValue,
}) => {
  const isHe = currentLang === 'he';

  const stats: SeniorAnalystStats = useMemo(() => {
    return getSeniorAnalystData(stock, livePrice);
  }, [stock, livePrice]);

  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter and sort the reports
  const processedReports = useMemo(() => {
    let result = [...stats.reports];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.analystName.toLowerCase().includes(q) ||
          r.firm.toLowerCase().includes(q) ||
          r.valuationMethodology.toLowerCase().includes(q) ||
          r.thesisHeadline.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterBy === 'tier1') {
      result = result.filter((r) => r.firmTier === 'Tier 1 Bulge Bracket');
    } else if (filterBy === 'strongBuy') {
      result = result.filter((r) => r.rating === 'Strong Buy' || r.rating === 'Overweight');
    } else if (filterBy === 'highUpside') {
      result = result.filter((r) => r.impliedUpsidePercent >= 25);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return b.starRating - a.starRating || b.impliedUpsidePercent - a.impliedUpsidePercent;
        case 'targetHigh':
          return b.priceTarget - a.priceTarget;
        case 'targetLow':
          return a.priceTarget - b.priceTarget;
        case 'upside':
          return b.impliedUpsidePercent - a.impliedUpsidePercent;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [stats.reports, searchQuery, filterBy, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Helper for rating badge color
  const getRatingBadgeClass = (rating: SeniorAnalystReport['rating']) => {
    switch (rating) {
      case 'Strong Buy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Overweight':
      case 'Outperform':
      case 'Buy':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Neutral':
      case 'Hold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  // Helper for action badge
  const getActionBadgeClass = (action: SeniorAnalystReport['action']) => {
    switch (action) {
      case 'Target Raised':
      case 'Upgraded':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'Initiated':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      case 'Reiterated':
        return 'text-slate-400 bg-slate-800/60 border-slate-700';
      default:
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
    }
  };

  // Target corridor percentage positions
  const corridorMin = Math.min(stats.minTarget, stats.currentPrice * 0.95);
  const corridorMax = Math.max(stats.maxTarget, stats.currentPrice * 1.05);
  const corridorSpan = Math.max(1, corridorMax - corridorMin);

  const getPercentPos = (val: number) => {
    const pct = ((val - corridorMin) / corridorSpan) * 100;
    return Math.min(98, Math.max(2, pct));
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Top Banner / Summary Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-cyan-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-mono text-white">
                  {isHe ? 'דירוג והערכות שווי אנליסטים בכירים' : 'Senior Wall Street Analyst Valuations'}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {stats.totalCount} {isHe ? 'דוחות מוסדיים' : 'Top Reports'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHe
                  ? 'מחירי יעד, מודלי DCF ומכפילים של ראשי מחלקות המחקר בבנקי ההשקעות המובילים בעולם'
                  : 'Target prices, DCF models, and multiples from leading Wall Street research heads'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono self-end sm:self-auto">
            <div className="text-right sm:text-left px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{isHe ? 'ביטחון מוסדי' : 'Conviction'}</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{stats.institutionalConfidenceScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs text-center">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isHe ? 'מחיר יעד ממוצע' : 'Consensus Target'}</span>
            <div className="text-base sm:text-lg font-bold text-cyan-300 mt-0.5">${stats.meanTarget.toFixed(2)}</div>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              {stats.averageUpsidePercent >= 0 ? `+${stats.averageUpsidePercent}%` : `${stats.averageUpsidePercent}%`}{' '}
              {isHe ? 'אפסייד ממוצע' : 'Upside'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isHe ? 'יעד שורי עליון (Bull)' : 'Highest Bull Target'}</span>
            <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">${stats.maxTarget.toFixed(2)}</div>
            <span className="text-[10px] text-slate-400 block truncate" title={stats.highestBullReport.firm}>
              {stats.highestBullReport.firm} ({stats.highestBullReport.analystName.split(' ')[0]})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isHe ? 'יעד שמרני (Conservative)' : 'Conservative Target'}</span>
            <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">${stats.minTarget.toFixed(2)}</div>
            <span className="text-[10px] text-slate-400 block truncate" title={stats.mostConservativeReport.firm}>
              {stats.mostConservativeReport.firm} ({stats.mostConservativeReport.analystName.split(' ')[0]})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isHe ? 'התפלגות המלצות' : 'Rating Split'}</span>
            <div className="text-xs font-bold text-slate-200 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-emerald-400">{stats.strongBuyCount + stats.buyCount} {isHe ? 'קנייה' : 'Buy'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">{stats.holdCount} {isHe ? 'החזק' : 'Hold'}</span>
              {stats.sellCount > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-rose-400">{stats.sellCount} {isHe ? 'מכירה' : 'Sell'}</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              {Math.round(((stats.strongBuyCount + stats.buyCount) / Math.max(1, stats.totalCount)) * 100)}% {isHe ? 'חיובי' : 'Bullish'}
            </span>
          </div>
        </div>

        {/* Visual Target Corridor Bar */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">
              {isHe ? 'מסדרון מחירי יעד מול מחיר שוק נוכחי' : 'Target Price Corridor vs Current Market'}
            </span>
            <span className="text-cyan-400">
              {isHe ? 'מחיר שוק:' : 'Current:'} <strong className="text-white">${stats.currentPrice.toFixed(2)}</strong>
            </span>
          </div>

          <div className="relative h-7 w-full bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
            {/* The Corridor Range Span */}
            <div
              className="absolute h-3.5 rounded bg-gradient-to-r from-amber-500/30 via-cyan-500/40 to-emerald-500/50 border border-cyan-500/50"
              style={{
                left: `${getPercentPos(stats.minTarget)}%`,
                width: `${Math.max(4, getPercentPos(stats.maxTarget) - getPercentPos(stats.minTarget))}%`,
              }}
            />

            {/* Current Price Pin */}
            <div
              className="absolute z-10 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${getPercentPos(stats.currentPrice)}%` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-cyan-500/60 shadow" />
            </div>

            {/* Mean Target Marker */}
            <div
              className="absolute z-10 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${getPercentPos(stats.meanTarget)}%` }}
            >
              <div className="w-1.5 h-4 bg-cyan-400 rounded-full" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5">
            <span>
              {isHe ? 'מינימום:' : 'Min:'} <strong className="text-slate-300">${stats.minTarget}</strong>
            </span>
            <span className="text-cyan-300 font-semibold">
              {isHe ? 'יעד ממוצע:' : 'Consensus:'} ${stats.meanTarget} (+{stats.averageUpsidePercent}%)
            </span>
            <span>
              {isHe ? 'מקסימום:' : 'Max:'} <strong className="text-emerald-400">${stats.maxTarget}</strong>
            </span>
          </div>
        </div>

        {/* Intrinsic DCF vs Senior Analyst Comparison */}
        {intrinsicFairValue && intrinsicFairValue > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">
                {isHe ? 'השוואה לשווי פנימי (מודל DCF במערכת):' : 'Intrinsic DCF Comparison:'}
              </span>
              <strong className="text-cyan-300">${intrinsicFairValue}</strong>
            </div>
            <div className="text-[11px] text-slate-400">
              {intrinsicFairValue > stats.meanTarget ? (
                <span className="text-emerald-400 font-medium">
                  {isHe
                    ? `מודל ה-DCF השמרני אופטימי ב-${Math.round(((intrinsicFairValue - stats.meanTarget) / stats.meanTarget) * 100)}% מעל קונצנזוס האנליסטים`
                    : `Fundamental DCF is ${Math.round(((intrinsicFairValue - stats.meanTarget) / stats.meanTarget) * 100)}% above analyst consensus`}
                </span>
              ) : (
                <span className="text-cyan-300 font-medium">
                  {isHe
                    ? `קונצנזוס האנליסטים מקדים את ה-DCF ב-${Math.round(((stats.meanTarget - intrinsicFairValue) / intrinsicFairValue) * 100)}% (פרמיית צמיחה)`
                    : `Analyst consensus implies ${Math.round(((stats.meanTarget - intrinsicFairValue) / intrinsicFairValue) * 100)}% premium to DCF baseline`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter, Sort & Search Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHe ? 'חפש אנליסט, בנק או מתודולוגיה...' : 'Search analyst, bank, or method...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 text-[10px] hidden sm:inline">{isHe ? 'סינון:' : 'Filter:'}</span>
          <button
            onClick={() => setFilterBy('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'הכל' : 'All'} ({stats.totalCount})
          </button>
          <button
            onClick={() => setFilterBy('tier1')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'tier1'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'בנקים Tier-1' : 'Tier 1 Bulge'}
          </button>
          <button
            onClick={() => setFilterBy('strongBuy')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'strongBuy'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'קנייה חזקה' : 'Strong Buy'}
          </button>
          <button
            onClick={() => setFilterBy('highUpside')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'highUpside'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'אפסייד > 25%' : 'Upside > 25%'}
          </button>
        </div>

        {/* Sort Dropdown & View Mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="rank">{isHe ? '🏆 דירוג מומחיות (Top Analyst)' : '🏆 Analyst Rank'}</option>
              <option value="targetHigh">{isHe ? '📈 מחיר יעד (גבוה לנמוך)' : '📈 Target (High to Low)'}</option>
              <option value="targetLow">{isHe ? '📉 מחיר יעד (נמוך לגבוה)' : '📉 Target (Low to High)'}</option>
              <option value="upside">{isHe ? '🚀 אפסייד צפוי (%)' : '🚀 Highest Upside'}</option>
              <option value="date">{isHe ? '📅 עדכון אחרון' : '📅 Most Recent'}</option>
            </select>
          </div>

          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2 py-0.5 text-[11px] rounded transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHe ? 'כרטיסים' : 'Cards'}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-0.5 text-[11px] rounded transition cursor-pointer ${
                viewMode === 'table' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isHe ? 'טבלה' : 'Table'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: List of Senior Analyst Reports */}
      {processedReports.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs">
          {isHe ? 'לא נמצאו דוחות אנליסטים התואמים את הסינון הנוכחי' : 'No analyst reports match the selected filters'}
        </div>
      ) : viewMode === 'table' ? (
        /* DENSE TABLE VIEW */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow">
          <table className="w-full text-right sm:text-right border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[11px]">
                <th className="p-3 text-right">{isHe ? 'אנליסט ומוסד' : 'Analyst & Firm'}</th>
                <th className="p-3 text-center">{isHe ? 'דירוג והמלצה' : 'Rating'}</th>
                <th className="p-3 text-center">{isHe ? 'פעולה' : 'Action'}</th>
                <th className="p-3 text-center">{isHe ? 'מחיר יעד' : 'Price Target'}</th>
                <th className="p-3 text-center">{isHe ? 'אפסייד צפוי' : 'Implied Upside'}</th>
                <th className="p-3 text-right hidden md:table-cell">{isHe ? 'מתודולוגיית הערכת שווי' : 'Valuation Methodology'}</th>
                <th className="p-3 text-center">{isHe ? 'תאריך' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {processedReports.map((report) => {
                const isExpanded = expandedId === report.id;
                return (
                  <React.Fragment key={report.id}>
                    <tr
                      onClick={() => toggleExpand(report.id)}
                      className={`hover:bg-slate-800/50 transition cursor-pointer ${
                        isExpanded ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{report.analystName}</span>
                              <div className="flex items-center text-amber-400 text-[10px]">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="ml-0.5">{report.starRating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="text-[11px] text-cyan-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>{report.firm}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRatingBadgeClass(
                            report.rating
                          )}`}
                        >
                          {report.rating}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getActionBadgeClass(
                            report.action
                          )}`}
                        >
                          {report.action}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-white text-sm">${report.priceTarget.toFixed(2)}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-bold ${
                            report.impliedUpsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {report.impliedUpsidePercent >= 0
                            ? `+${report.impliedUpsidePercent}%`
                            : `${report.impliedUpsidePercent}%`}
                        </span>
                      </td>
                      <td className="p-3 text-right hidden md:table-cell">
                        <span className="text-[11px] text-slate-300 line-clamp-1 max-w-[280px]">
                          {report.valuationMethodology}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-400 text-[11px]">
                        {report.date}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-b border-cyan-800/40">
                        <td colSpan={7} className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2 space-y-2">
                              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                <FileCheck2 className="w-3.5 h-3.5" />
                                <span>{report.thesisHeadline}</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                                {report.valuationRationale}
                              </p>
                            </div>
                            <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                {isHe ? 'פרמטרי מודל הערכת שווי' : 'Model Parameters'}
                              </span>
                              <div className="space-y-1 text-[11px]">
                                {report.bullCaseTarget && (
                                  <div className="flex justify-between">
                                    <span className="text-emerald-400">{isHe ? 'תרחיש שורי (Bull):' : 'Bull Case:'}</span>
                                    <strong className="text-white">${report.bullCaseTarget}</strong>
                                  </div>
                                )}
                                {report.bearCaseTarget && (
                                  <div className="flex justify-between">
                                    <span className="text-rose-400">{isHe ? 'תרחיש דובי (Bear):' : 'Bear Case:'}</span>
                                    <strong className="text-white">${report.bearCaseTarget}</strong>
                                  </div>
                                )}
                                {report.epsEstimateFY1 && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">{isHe ? 'תחזית רווח למניה:' : 'FY1 EPS:'}</span>
                                    <strong className="text-cyan-300">{report.epsEstimateFY1}</strong>
                                  </div>
                                )}
                                {report.peTargetMultiple && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">{isHe ? 'מכפיל יעד:' : 'Target P/E:'}</span>
                                    <strong className="text-white">{report.peTargetMultiple}x</strong>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS VIEW - INSTITUTIONAL DETAILED CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {processedReports.map((report, idx) => {
            const isExpanded = expandedId === report.id;
            return (
              <div
                key={report.id}
                className={`p-4 rounded-xl border transition duration-150 flex flex-col justify-between ${
                  isExpanded
                    ? 'bg-slate-900 border-cyan-500/80 shadow-lg ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold font-mono text-cyan-400 text-xs shrink-0 shadow-inner">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{report.analystName}</h4>
                          <div className="flex items-center text-amber-400 text-[11px] font-mono">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="ml-0.5 font-bold">{report.starRating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-cyan-300 font-mono flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          <span>{report.firm}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[10px] text-slate-400">{report.rankPercentile}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-base sm:text-lg font-bold text-white">${report.priceTarget.toFixed(2)}</div>
                      <div
                        className={`text-xs font-bold ${
                          report.impliedUpsidePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {report.impliedUpsidePercent >= 0
                          ? `+${report.impliedUpsidePercent}%`
                          : `${report.impliedUpsidePercent}%`}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation, Action & Date Badges */}
                  <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${getRatingBadgeClass(
                        report.rating
                      )}`}
                    >
                      {report.rating}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getActionBadgeClass(
                        report.action
                      )}`}
                    >
                      {report.action}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 ml-auto">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                    </span>
                  </div>

                  {/* Headline & Valuation Methodology */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-slate-200 leading-snug">
                      {report.thesisHeadline}
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-300">
                      <span className="text-slate-500 block text-[10px] font-sans">
                        {isHe ? 'מתודולוגיית הערכת שווי:' : 'Valuation Methodology:'}
                      </span>
                      <span className="text-cyan-300">{report.valuationMethodology}</span>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">
                          {isHe ? 'תמצית ניתוח והצדקת שווי:' : 'Analyst Valuation Rationale:'}
                        </span>
                        {report.valuationRationale}
                      </div>

                      {/* Model Scenarios */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        {report.bullCaseTarget && (
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                            <span className="text-[10px] text-emerald-400 block">
                              {isHe ? 'תרחיש שורי (Bull):' : 'Bull Case:'}
                            </span>
                            <div className="font-bold text-slate-200">${report.bullCaseTarget}</div>
                          </div>
                        )}
                        {report.bearCaseTarget && (
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                            <span className="text-[10px] text-rose-400 block">
                              {isHe ? 'תרחיש דובי (Bear):' : 'Bear Case:'}
                            </span>
                            <div className="font-bold text-slate-200">${report.bearCaseTarget}</div>
                          </div>
                        )}
                        {report.epsEstimateFY1 && (
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">
                              {isHe ? 'רווח צפוי למניה (EPS):' : 'Est. FY1 EPS:'}
                            </span>
                            <div className="font-bold text-cyan-300">{report.epsEstimateFY1}</div>
                          </div>
                        )}
                        {report.peTargetMultiple && (
                          <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">
                              {isHe ? 'מכפיל רווח יעד:' : 'Target P/E Multiple:'}
                            </span>
                            <div className="font-bold text-slate-200">{report.peTargetMultiple}x</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Toggle Button */}
                <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {report.firmTier}
                  </span>
                  <button
                    onClick={() => toggleExpand(report.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{isExpanded ? (isHe ? 'הסתר פירוט' : 'Collapse') : (isHe ? 'פירוט הערכת שווי מלאה' : 'Full Valuation Thesis')}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
