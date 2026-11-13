import React, { useState } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { QuickActionPlusMenu } from './QuickActionPlusMenu';
import { getStockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import {
  Star,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { SupportedLanguage, translations } from '../i18n';
import { localizeStock, SECTOR_TRANSLATIONS } from '../data/stockLocalization';

interface ModernStockExplorerProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  initialSearchQuery?: string;
}

export const ModernStockExplorer: React.FC<ModernStockExplorerProps> = ({
  stocks,
  watchlist,
  livePrices,
  onToggleWatchlist,
  onAddToPortfolio,
  onSelectStock,
  onOpenDeepDive,
  currentLang = 'he',
  initialSearchQuery = ''
}) => {
  const t = translations[currentLang] || translations.en;
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedMoatFilter, setSelectedMoatFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'cagr' | 'roic'>('score');

  const validRawStocks = stocks.filter(Boolean);
  const localizedStocks = validRawStocks.map((s) => localizeStock(s, currentLang));
  const sectorMap = SECTOR_TRANSLATIONS[currentLang] || SECTOR_TRANSLATIONS.en;
  const sectors = ['ALL', ...Array.from(new Set(validRawStocks.map((s) => s?.sector).filter(Boolean)))];

  const filteredStocks = localizedStocks
    .filter((s) => {
      const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector || s.sector === sectorMap[selectedSector];
      const matchesMoat = selectedMoatFilter === 'ALL' || s.moatTrend === selectedMoatFilter;
      const matchesQuery =
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.thesisSummary && s.thesisSummary.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSector && matchesMoat && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.investmentScore - a.investmentScore;
      if (sortBy === 'price') {
        const pA = livePrices[a.ticker]?.price || parseFloat(a.currentPrice.replace(/[^0-9.]/g, '')) || 0;
        const pB = livePrices[b.ticker]?.price || parseFloat(b.currentPrice.replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (sortBy === 'roic') {
        const rA = parseFloat(a.financialQuality.roicCurrent.value.replace(/[^0-9.]/g, '')) || 0;
        const rB = parseFloat(b.financialQuality.roicCurrent.value.replace(/[^0-9.]/g, '')) || 0;
        return rB - rA;
      }
      if (sortBy === 'cagr') {
        const cA = parseFloat(a.scenarios.baseCase.expectedCAGR.replace(/[^0-9.]/g, '')) || 0;
        const cB = parseFloat(b.scenarios.baseCase.expectedCAGR.replace(/[^0-9.]/g, '')) || 0;
        return cB - cA;
      }
      return 0;
    });

  // Top 3 featured high-conviction leaders
  const heroPicks = localizedStocks.slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Card: Professional Wealth Dashboard Style */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.heroUniverseTag}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.heroTitle}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t.heroDesc}
            </p>
          </div>

          {/* Quick Metrics summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
            <div className="text-center sm:text-left">
              <div className="text-xs text-slate-400 font-medium">{t.screenedUniverse}</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{stocks.length}</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 justify-center sm:justify-start">
                <CheckCircle2 className="w-2.5 h-2.5" /> {t.zeroTraps}
              </div>
            </div>
            <div className="text-center sm:text-left border-l border-slate-800 pl-3 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-3">
              <div className="text-xs text-slate-400 font-medium">{t.avgQualityScore}</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {(stocks.reduce((acc, s) => acc + s.investmentScore, 0) / (stocks.length || 1)).toFixed(1)}/100
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{t.topTierLabel}</div>
            </div>
            <div className="text-center sm:text-left col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 rtl:border-l-0 rtl:sm:border-r rtl:sm:pl-0 rtl:sm:pr-3">
              <div className="text-xs text-slate-400 font-medium">{t.fiveYearTarget}</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">13.8% CAGR</div>
              <div className="text-[10px] text-slate-400 font-medium">{t.compoundingAvg}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 High-Conviction Spotlight Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 bg-cyan-500 rounded-full" />
            <h3 className="text-lg font-bold text-white">{t.convictionLeaders}</h3>
          </div>
          <span className="text-xs text-slate-400">{t.convictionSubtitle}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {heroPicks.map((stock) => {
            const live = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
            const price = (live && typeof live.price === 'number' && !isNaN(live.price))
              ? live.price
              : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 0);
            const chg = (live && typeof live.changePercent === 'number' && !isNaN(live.changePercent))
              ? live.changePercent
              : 0;
            const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

            return (
              <div
                key={stock.ticker}
                onClick={() => onSelectStock(stock)}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40 cursor-pointer flex flex-col justify-between"
              >
                {/* Top Badge Banner */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="lg" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-lg text-white group-hover:text-cyan-300 transition">
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {stock.exchange}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {stock.finalVerdict}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                        {stock.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right rtl:text-left">
                      <div className="text-base font-bold font-mono text-white">
                        ${price.toFixed(2)}
                      </div>
                      <div className={`text-xs font-mono font-semibold flex items-center justify-end rtl:justify-start gap-0.5 ${chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {chg >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* Quick Action Plus Button */}
                    <QuickActionPlusMenu
                      stock={stock}
                      watchlist={watchlist}
                      onToggleWatchlist={onToggleWatchlist}
                      onAddToPortfolio={onAddToPortfolio}
                      currentLang={currentLang}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Score & Core Moat Highlights */}
                <div className="my-4 space-y-3">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{t.qualityScore}:</span>
                      <span className="text-cyan-400 font-bold">{stock.investmentScore} / 100</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                        style={{ width: `${stock.investmentScore}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500">ROIC: </span>
                        <span className="text-slate-200 font-semibold">{stock.financialQuality.roicCurrent.value}</span>
                      </div>
                      <div className="text-right rtl:text-left">
                        <span className="text-slate-500">5Y Base: </span>
                        <span className="text-emerald-400 font-semibold">{stock.scenarios.baseCase.expectedCAGR}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {stock.whyInTopUniverse}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock);
                      }}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isWatched
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700'
                      }`}
                      title={isWatched ? t.saved : t.watch}
                    >
                      <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-300' : ''}`} />
                      <span className="text-[11px]">{isWatched ? t.saved : t.watch}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToPortfolio(stock);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                      title={t.invest}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{t.invest}</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDeepDive(stock);
                    }}
                    className="text-xs text-cyan-400 group-hover:text-cyan-300 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>{t.fullMemo}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Filter & Interactive Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchFilterPlaceholder}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Sorters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-mono">{t.sortBy}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="score">{t.sortScore}</option>
                <option value="cagr">{t.sortCagr}</option>
                <option value="roic">{t.sortRoic}</option>
                <option value="price">{t.sortPrice}</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Table View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-slate-500 text-[11px] pr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> {t.sector}
          </span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
                selectedSector === sec
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {sec === 'ALL' ? t.sectorAll : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock, index) => {
            const live = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
            const price = (live && typeof live.price === 'number' && !isNaN(live.price))
              ? live.price
              : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 0);
            const chg = (live && typeof live.changePercent === 'number' && !isNaN(live.changePercent))
              ? live.changePercent
              : 0;
            const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

            return (
              <div
                key={stock.ticker}
                onClick={() => onSelectStock(stock)}
                className="group rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 p-5 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-base text-white group-hover:text-cyan-300">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            #{stock.rank || index + 1}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {stock.finalVerdict}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium truncate max-w-[170px]">
                          {stock.companyName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left font-mono">
                      <div className="text-sm font-bold text-white">${price.toFixed(2)}</div>
                      <div className={`text-[11px] font-semibold flex items-center justify-end rtl:justify-start gap-0.5 ${chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Badges / Category */}
                  {(() => {
                    const profile = getStockCompetitiveProfile(stock, price);
                    return (
                      <>
                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                            {profile.opportunityType}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            Thesis {profile.thesisStrengthScore}/100
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                            Implied {profile.marketImpliedGrowthRate}% vs {profile.fundamentalExpectedGrowthRate}%
                          </span>
                        </div>
                      </>
                    );
                  })()}

                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                      {stock.sector}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-slate-800">
                      ROIC {stock.financialQuality.roicCurrent.value}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-emerald-300 border border-slate-800">
                      5Y Base {stock.scenarios.baseCase.expectedCAGR}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                    {stock.whyInTopUniverse}
                  </p>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-500">{t.qualityScore}:</span>
                    <span className="font-bold text-cyan-400">{stock.investmentScore}/100</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <QuickActionPlusMenu
                      stock={stock}
                      watchlist={watchlist}
                      onToggleWatchlist={onToggleWatchlist}
                      onAddToPortfolio={onAddToPortfolio}
                      currentLang={currentLang}
                      size="sm"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDeepDive(stock);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-0.5 ml-1"
                    >
                      <span>{t.deepDive}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode Fallback View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <table className="w-full text-left rtl:text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right rtl:text-left">Price</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">ROIC (SEC)</th>
                <th className="py-3 px-4">5Y CAGR (Base)</th>
                <th className="py-3 px-4">Moat Trend</th>
                <th className="py-3 px-4 text-center">Verdict</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStocks.map((stock, idx) => {
                const live = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
                const price = (live && typeof live.price === 'number' && !isNaN(live.price))
                  ? live.price
                  : (parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 0);
                const chg = (live && typeof live.changePercent === 'number' && !isNaN(live.changePercent))
                  ? live.changePercent
                  : 0;
                const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

                return (
                  <tr
                    key={stock.ticker}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <StockLogoBadge ticker={stock.ticker} size="sm" />
                        <div>
                          <div className="font-bold text-white font-mono">{stock.ticker}</div>
                          <div className="text-slate-400 text-[11px] truncate max-w-[160px]">{stock.companyName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{stock.sector}</td>
                    <td className="py-3 px-4 text-right rtl:text-left font-mono">
                      <div className="font-bold text-white">${price.toFixed(2)}</div>
                      <div className={`text-[10px] font-semibold ${chg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-cyan-400">
                      {stock.investmentScore}/100
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200">{stock.financialQuality.roicCurrent.value}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{stock.scenarios.baseCase.expectedCAGR}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-950 font-mono text-slate-300 border border-slate-800">
                        {stock.moatTrend}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {stock.finalVerdict}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        <QuickActionPlusMenu
                          stock={stock}
                          watchlist={watchlist}
                          onToggleWatchlist={onToggleWatchlist}
                          onAddToPortfolio={onAddToPortfolio}
                          currentLang={currentLang}
                          size="sm"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDeepDive(stock);
                          }}
                          className="p-1.5 rounded text-slate-500 hover:text-white"
                          title={t.deepDive}
                        >
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
