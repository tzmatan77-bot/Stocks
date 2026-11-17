import React, { useState, useMemo } from 'react';
import { ResearchStock, SeniorAnalystReport } from '../types';
import { getSeniorAnalystData, SeniorAnalystStats } from '../data/seniorAnalystData';
import { SupportedLanguage } from '../i18n';
import {
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  Search,
  FileCheck2,
  LayoutList,
  LayoutGrid,
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
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  // Filter and sort the reports
  const processedReports = useMemo(() => {
    let result = [...stats.reports];

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

    if (filterBy === 'tier1') {
      result = result.filter((r) => r.firmTier === 'Tier 1 Bulge Bracket');
    } else if (filterBy === 'strongBuy') {
      result = result.filter((r) => r.rating === 'Strong Buy' || r.rating === 'Overweight');
    } else if (filterBy === 'highUpside') {
      result = result.filter((r) => r.impliedUpsidePercent >= 20);
    }

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

  const formatRatingLabel = (rating: SeniorAnalystReport['rating']) => {
    if (!isHe) return rating;
    switch (rating) {
      case 'Strong Buy':
        return 'קנייה חזקה';
      case 'Overweight':
        return 'משקל יתר (קנייה)';
      case 'Outperform':
        return 'תשואת יתר';
      case 'Buy':
        return 'קנייה';
      case 'Neutral':
        return 'ניטרלי';
      case 'Hold':
        return 'החזק';
      case 'Underweight':
        return 'משקל חסר';
      case 'Sell':
        return 'מכירה';
      default:
        return rating;
    }
  };

  const formatActionLabel = (action: SeniorAnalystReport['action']) => {
    if (!isHe) return action;
    switch (action) {
      case 'Target Raised':
        return 'יעד הועלה';
      case 'Upgraded':
        return 'שדרוג המלצה';
      case 'Initiated':
        return 'תחילת כיסוי';
      case 'Reiterated':
        return 'אישור המלצה';
      case 'Target Lowered':
        return 'יעד הופחת';
      case 'Downgraded':
        return 'הורדת דירוג';
      default:
        return action;
    }
  };

  const formatTierLabel = (tier: SeniorAnalystReport['firmTier']) => {
    if (!isHe) return tier;
    return tier === 'Tier 1 Bulge Bracket' ? 'בנק השקעות מוביל' : 'בית מחקר מוסדי';
  };

  const getRatingBadgeClass = (rating: SeniorAnalystReport['rating']) => {
    switch (rating) {
      case 'Strong Buy':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'Overweight':
      case 'Outperform':
      case 'Buy':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
      case 'Neutral':
      case 'Hold':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    }
  };

  const getActionBadgeClass = (action: SeniorAnalystReport['action']) => {
    switch (action) {
      case 'Target Raised':
      case 'Upgraded':
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80';
      case 'Initiated':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-800/80';
      case 'Reiterated':
        return 'text-slate-300 bg-slate-800/70 border-slate-700';
      default:
        return 'text-amber-300 bg-amber-950/60 border-amber-800/80';
    }
  };

  const totalBuy = stats.strongBuyCount + stats.buyCount;
  const totalCount = Math.max(1, stats.totalCount);
  const buyPct = Math.round((totalBuy / totalCount) * 100);
  const holdPct = Math.round((stats.holdCount / totalCount) * 100);
  const sellPct = Math.max(0, 100 - buyPct - holdPct);

  const consensusLabel =
    buyPct >= 75
      ? isHe
        ? 'קנייה חזקה'
        : 'Strong Buy'
      : buyPct >= 55
      ? isHe
        ? 'קנייה מתונה'
        : 'Moderate Buy'
      : isHe
      ? 'החזק / מעורב'
      : 'Hold / Mixed';

  // Target corridor calculation
  const corridorMin = Math.min(stats.minTarget, stats.currentPrice * 0.94);
  const corridorMax = Math.max(stats.maxTarget, stats.currentPrice * 1.04);
  const corridorSpan = Math.max(1, corridorMax - corridorMin);
  const getPercentPos = (val: number) => {
    const pct = ((val - corridorMin) / corridorSpan) * 100;
    return Math.min(97, Math.max(3, pct));
  };

  return (
    <div className="space-y-4 text-slate-100" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Executive Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-lg space-y-5">
        {/* Title Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isHe ? 'סקירת אנליסטים ומחירי יעד בוול סטריט' : 'Wall Street Analyst Consensus & Price Targets'}
                </h3>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                  {stats.totalCount} {isHe ? 'גופים מוסדיים' : 'Analysts'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHe
                  ? 'תמונה מרוכזת של המלצות הבנקים המובילים, טווח מחירי היעד ופוטנציאל התשואה מול המחיר היום'
                  : 'Clear summary of leading bank ratings, price target spread, and implied upside vs current price'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">{isHe ? 'מדד ביטחון מוסדי:' : 'Conviction:'}</span>
            <strong className="text-sm font-mono text-emerald-400 tabular-nums">{stats.institutionalConfidenceScore}/100</strong>
          </div>
        </div>

        {/* 2-Column Clean Visual Summary: Recommendation Distribution + Price Target Corridor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Consensus & Buy/Hold/Sell Bar */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-slate-400 font-medium">
                  {isHe ? 'המלצת קונצנזוס משוקללת' : 'Consensus Rating'}
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5">
                  {consensusLabel}
                </div>
              </div>
              <div className="text-end">
                <div className="text-xl font-bold font-mono text-white tabular-nums">{buyPct}%</div>
                <div className="text-[11px] text-slate-400">
                  {isHe ? 'ממליצים קנייה' : 'Bullish'}
                </div>
              </div>
            </div>

            {/* Proportional Bar */}
            <div className="space-y-2.5">
              <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex border border-slate-800" dir="ltr">
                {buyPct > 0 && (
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${buyPct}%` }}
                    title={`Buy: ${totalBuy}`}
                  />
                )}
                {holdPct > 0 && (
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${holdPct}%` }}
                    title={`Hold: ${stats.holdCount}`}
                  />
                )}
                {sellPct > 0 && (
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${sellPct}%` }}
                    title={`Sell: ${stats.sellCount}`}
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{isHe ? 'קנייה' : 'Buy'}</span>
                  </span>
                  <strong className="font-mono text-emerald-400 tabular-nums">{totalBuy}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span>{isHe ? 'החזק' : 'Hold'}</span>
                  </span>
                  <strong className="font-mono text-amber-300 tabular-nums">{stats.holdCount}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{isHe ? 'מכירה' : 'Sell'}</span>
                  </span>
                  <strong className="font-mono text-rose-400 tabular-nums">{stats.sellCount}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Target Price Anchors + Visual Range */}
          <div className="lg:col-span-7 p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">
                  {isHe ? 'יעד שמרני (מינימום)' : 'Low Target'}
                </span>
                <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1 tabular-nums">
                  ${stats.minTarget.toFixed(0)}
                </div>
                <span className="text-[11px] text-slate-400 block truncate mt-0.5" title={stats.mostConservativeReport.firm}>
                  {stats.mostConservativeReport.firm}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center">
                <span className="text-[11px] text-cyan-300 font-semibold block">
                  {isHe ? 'מחיר יעד ממוצע' : 'Average Target'}
                </span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-white mt-0.5 tabular-nums">
                  ${stats.meanTarget.toFixed(1)}
                </div>
                <span
                  className={`inline-block text-xs font-mono font-bold mt-0.5 px-2 py-0.5 rounded-md ${
                    stats.averageUpsidePercent >= 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {stats.averageUpsidePercent >= 0 ? `+${stats.averageUpsidePercent}%` : `${stats.averageUpsidePercent}%`}{' '}
                  {isHe ? 'אפסייד' : 'Upside'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">
                  {isHe ? 'יעד אופטימי (גבוה)' : 'High Target'}
                </span>
                <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                  ${stats.maxTarget.toFixed(0)}
                </div>
                <span className="text-[11px] text-slate-400 block truncate mt-0.5" title={stats.highestBullReport.firm}>
                  {stats.highestBullReport.firm}
                </span>
              </div>
            </div>

            {/* Clean Visual Track (always LTR numerically low -> high) */}
            <div className="space-y-1.5 pt-1" dir="ltr">
              <div className="flex justify-between items-center text-[11px] text-slate-400" dir={isHe ? 'rtl' : 'ltr'}>
                <span>{isHe ? 'מיקום המחיר הנוכחי בטווח היעדים:' : 'Current price within analyst target range:'}</span>
                <span className="font-mono text-white font-semibold tabular-nums">
                  {isHe ? 'מחיר היום:' : 'Now:'} ${stats.currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="relative h-6 w-full bg-slate-900 rounded-lg border border-slate-800 flex items-center px-2">
                <div
                  className="absolute h-2.5 rounded-full bg-gradient-to-r from-amber-500/40 via-cyan-400/60 to-emerald-500/60"
                  style={{
                    left: `${getPercentPos(stats.minTarget)}%`,
                    width: `${Math.max(4, getPercentPos(stats.maxTarget) - getPercentPos(stats.minTarget))}%`,
                  }}
                />
                {/* Current Price Marker */}
                <div
                  className="absolute z-10 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${getPercentPos(stats.currentPrice)}%` }}
                  title={`Current Price: $${stats.currentPrice.toFixed(2)}`}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-950 ring-2 ring-white/40 shadow" />
                </div>
                {/* Mean Target Marker */}
                <div
                  className="absolute z-10 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${getPercentPos(stats.meanTarget)}%` }}
                  title={`Mean Target: $${stats.meanTarget.toFixed(2)}`}
                >
                  <div className="w-2 h-5 rounded-full bg-cyan-400 border border-slate-950 shadow" />
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span>${stats.minTarget.toFixed(0)}</span>
                <div className="flex items-center gap-4 text-[11px] font-sans">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                    <span>{isHe ? 'מחיר נוכחי' : 'Current'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-2 h-3 rounded-full bg-cyan-400 inline-block" />
                    <span>{isHe ? 'ממוצע אנליסטים' : 'Mean Target'}</span>
                  </span>
                </div>
                <span className="text-emerald-400">${stats.maxTarget.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean DCF Comparison Strip */}
        {intrinsicFairValue && intrinsicFairValue > 0 && (
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/70 border border-cyan-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">
                {isHe ? 'השוואה לשווי ההוגן במודל המערכת (DCF):' : 'Comparison to MoatGuard Intrinsic DCF:'}
              </span>
              <strong className="font-mono text-cyan-300 text-sm">${intrinsicFairValue}</strong>
            </div>
            <div className="text-xs">
              {intrinsicFairValue > stats.meanTarget ? (
                <span className="text-emerald-400 font-medium">
                  {isHe
                    ? `הערכת המערכת שמרנית-חיובית ב-${Math.round(((intrinsicFairValue - stats.meanTarget) / stats.meanTarget) * 100)}% מעל ממוצע האנליסטים`
                    : `DCF fair value is ${Math.round(((intrinsicFairValue - stats.meanTarget) / stats.meanTarget) * 100)}% above consensus`}
                </span>
              ) : (
                <span className="text-cyan-300 font-medium">
                  {isHe
                    ? `ממוצע האנליסטים גבוה ב-${Math.round(((stats.meanTarget - intrinsicFairValue) / intrinsicFairValue) * 100)}% מהערכת ה-DCF הבסיסית`
                    : `Consensus target sits ${Math.round(((stats.meanTarget - intrinsicFairValue) / intrinsicFairValue) * 100)}% above baseline DCF`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter, Sort & View Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHe ? 'חפש בנק השקעות, שם אנליסט או מילות מפתח...' : 'Search firm, analyst, or thesis...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterBy('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? `כל האנליסטים (${stats.totalCount})` : `All (${stats.totalCount})`}
          </button>
          <button
            onClick={() => setFilterBy('tier1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'tier1'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'בנקי ענק (Tier-1)' : 'Tier-1 Banks'}
          </button>
          <button
            onClick={() => setFilterBy('strongBuy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'strongBuy'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'קנייה חזקה בלבד' : 'Strong Buy'}
          </button>
          <button
            onClick={() => setFilterBy('highUpside')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterBy === 'highUpside'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {isHe ? 'אפסייד מעל 20%' : 'Upside > 20%'}
          </button>
        </div>

        {/* Sort & View Switch */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="rank">{isHe ? 'מיון: דירוג מומחיות האנליסט' : 'Sort: Top Ranked'}</option>
              <option value="targetHigh">{isHe ? 'מיון: מחיר יעד (גבוה לנמוך)' : 'Sort: Target (High-Low)'}</option>
              <option value="targetLow">{isHe ? 'מיון: מחיר יעד (נמוך לגבוה)' : 'Sort: Target (Low-High)'}</option>
              <option value="upside">{isHe ? 'מיון: פוטנציאל עלייה (%)' : 'Sort: Highest Upside'}</option>
              <option value="date">{isHe ? 'מיון: תאריך עדכון אחרון' : 'Sort: Most Recent'}</option>
            </select>
          </div>

          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>{isHe ? 'רשימה ברורה' : 'List'}</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isHe ? 'כרטיסים' : 'Cards'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty Filter Result */}
      {processedReports.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
          {isHe ? 'לא נמצאו אנליסטים התואמים את הסינון שבחרת' : 'No analyst reports match the selected filters'}
        </div>
      ) : viewMode === 'list' ? (
        /* CLEAN RESPONSIVE STRUCTURED LIST (DEFAULT — EASY TO SCAN AT A GLANCE) */
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden divide-y divide-slate-800/80 shadow">
          {/* Desktop Column Headers */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-4 py-3 bg-slate-950 text-[11px] font-semibold text-slate-400">
            <div className="col-span-3">{isHe ? 'בנק השקעות ואנליסט' : 'Firm & Analyst'}</div>
            <div className="col-span-2 text-center">{isHe ? 'המלצה ועדכון' : 'Rating & Action'}</div>
            <div className="col-span-2 text-center">{isHe ? 'מחיר יעד ואפסייד' : 'Price Target'}</div>
            <div className="col-span-4">{isHe ? 'שורה תחתונה מהניתוח' : 'Key Thesis'}</div>
            <div className="col-span-1 text-center">{isHe ? 'פירוט' : 'Details'}</div>
          </div>

          {processedReports.map((report, idx) => {
            const isExpanded = expandedId === report.id;
            return (
              <div key={report.id} className={isExpanded ? 'bg-slate-950/60' : 'hover:bg-slate-800/35 transition'}>
                {/* Clickable Row */}
                <div
                  onClick={() => toggleExpand(report.id)}
                  className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:items-center cursor-pointer"
                >
                  {/* Col 1: Firm + Analyst */}
                  <div className="lg:col-span-3 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{report.firm}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300 flex-wrap">
                        <span className="font-medium">{report.analystName}</span>
                        <span className="inline-flex items-center gap-0.5 text-amber-400 font-mono text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{report.starRating.toFixed(1)}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{formatTierLabel(report.firmTier)}</div>
                    </div>
                  </div>

                  {/* Col 2: Rating & Action */}
                  <div className="lg:col-span-2 flex lg:flex-col items-center lg:justify-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getRatingBadgeClass(report.rating)}`}
                    >
                      {formatRatingLabel(report.rating)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] border ${getActionBadgeClass(report.action)}`}
                    >
                      {formatActionLabel(report.action)}
                    </span>
                  </div>

                  {/* Col 3: Price Target + Upside */}
                  <div className="lg:col-span-2 flex lg:flex-col items-center lg:justify-center gap-2 lg:gap-1">
                    <span className="text-base sm:text-lg font-bold font-mono text-white tabular-nums">
                      ${report.priceTarget.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded tabular-nums ${
                        report.impliedUpsidePercent >= 0
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {report.impliedUpsidePercent >= 0
                        ? `+${report.impliedUpsidePercent}%`
                        : `${report.impliedUpsidePercent}%`}
                    </span>
                  </div>

                  {/* Col 4: Clear Headline */}
                  <div className="lg:col-span-4 space-y-1">
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      {report.thesisHeadline}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{report.date}</span>
                    </div>
                  </div>

                  {/* Col 5: Expand Button */}
                  <div className="lg:col-span-1 flex justify-end lg:justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(report.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        isExpanded
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{isExpanded ? (isHe ? 'סגור' : 'Hide') : (isHe ? 'הרחב' : 'Read')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Clean Detail Panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1">
                    <div className="p-4 rounded-xl bg-slate-900 border border-cyan-800/50 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-3">
                          <div>
                            <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                              <FileCheck2 className="w-4 h-4" />
                              <span>{isHe ? 'ניתוח מלא והסבר האנליסט' : 'Full Analyst Rationale'}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                              {report.valuationRationale}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                            <span className="text-slate-400 font-semibold block mb-0.5">
                              {isHe ? 'שיטת חישוב השווי:' : 'Valuation Method:'}
                            </span>
                            <span className="text-cyan-300">{report.valuationMethodology}</span>
                          </div>
                        </div>

                        {/* Model Parameters Box */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                          <div className="font-bold text-white border-b border-slate-800 pb-1.5">
                            {isHe ? 'מספרי יעד ותחזיות במודל' : 'Model Forecasts & Targets'}
                          </div>
                          <div className="space-y-2">
                            {report.bullCaseTarget && (
                              <div className="flex justify-between items-center">
                                <span className="text-emerald-400">{isHe ? 'תרחיש אופטימי (Bull):' : 'Bull Target:'}</span>
                                <strong className="font-mono text-white">${report.bullCaseTarget}</strong>
                              </div>
                            )}
                            {report.bearCaseTarget && (
                              <div className="flex justify-between items-center">
                                <span className="text-rose-400">{isHe ? 'תרחיש שמרני (Bear):' : 'Bear Target:'}</span>
                                <strong className="font-mono text-white">${report.bearCaseTarget}</strong>
                              </div>
                            )}
                            {report.epsEstimateFY1 && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">{isHe ? 'צפי רווח למניה (EPS):' : 'Est. FY1 EPS:'}</span>
                                <strong className="font-mono text-cyan-300">{report.epsEstimateFY1}</strong>
                              </div>
                            )}
                            {report.peTargetMultiple && (
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">{isHe ? 'מכפיל רווח יעד:' : 'Target P/E:'}</span>
                                <strong className="font-mono text-white">{report.peTargetMultiple}x</strong>
                              </div>
                            )}
                            <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                              {report.rankPercentile}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* SPACIOUS CARDS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {processedReports.map((report, idx) => {
            const isExpanded = expandedId === report.id;
            return (
              <div
                key={report.id}
                className={`p-4 sm:p-5 rounded-xl border transition flex flex-col justify-between gap-4 ${
                  isExpanded
                    ? 'bg-slate-900 border-cyan-500/70 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Top */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold font-mono text-cyan-400 text-xs shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate">{report.firm}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5 flex-wrap">
                          <span>{report.analystName}</span>
                          <span className="inline-flex items-center gap-0.5 text-amber-400 font-mono">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold">{report.starRating.toFixed(1)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-end font-mono shrink-0">
                      <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
                        ${report.priceTarget.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-0.5 tabular-nums ${
                          report.impliedUpsidePercent >= 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {report.impliedUpsidePercent >= 0
                          ? `+${report.impliedUpsidePercent}%`
                          : `${report.impliedUpsidePercent}%`}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold border ${getRatingBadgeClass(report.rating)}`}>
                      {formatRatingLabel(report.rating)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border ${getActionBadgeClass(report.action)}`}>
                      {formatActionLabel(report.action)}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 rtl:mr-auto ltr:ml-auto font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{report.date}</span>
                    </span>
                  </div>

                  {/* Thesis Headline & Method */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                      {report.thesisHeadline}
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-400 font-semibold">{isHe ? 'שיטת שווי: ' : 'Method: '}</span>
                      <span className="text-cyan-300">{report.valuationMethodology}</span>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        {report.valuationRationale}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {report.bullCaseTarget && (
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[11px] text-emerald-400 block">{isHe ? 'אופטימי' : 'Bull'}</span>
                            <div className="font-mono font-bold text-white mt-0.5">${report.bullCaseTarget}</div>
                          </div>
                        )}
                        {report.bearCaseTarget && (
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[11px] text-rose-400 block">{isHe ? 'שמרני' : 'Bear'}</span>
                            <div className="font-mono font-bold text-white mt-0.5">${report.bearCaseTarget}</div>
                          </div>
                        )}
                        {report.epsEstimateFY1 && (
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[11px] text-slate-400 block">{isHe ? 'צפי EPS' : 'EPS Est.'}</span>
                            <div className="font-mono font-bold text-cyan-300 mt-0.5">{report.epsEstimateFY1}</div>
                          </div>
                        )}
                        {report.peTargetMultiple && (
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[11px] text-slate-400 block">{isHe ? 'מכפיל יעד' : 'Target P/E'}</span>
                            <div className="font-mono font-bold text-white mt-0.5">{report.peTargetMultiple}x</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{formatTierLabel(report.firmTier)}</span>
                  <button
                    onClick={() => toggleExpand(report.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{isExpanded ? (isHe ? 'הסתר פירוט' : 'Hide Details') : (isHe ? 'קרא ניתוח מלא' : 'Read Full Note')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
