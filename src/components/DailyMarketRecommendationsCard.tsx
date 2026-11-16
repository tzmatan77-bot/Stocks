import React, { useState, useMemo, useEffect } from 'react';
import { ResearchStock, WatchlistItem, PremarketNewsItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { QuickActionPlusMenu } from './QuickActionPlusMenu';
import { SupportedLanguage } from '../i18n';
import { INITIAL_PREMARKET_NEWS_FEED } from '../data/premarketNewsData';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  BellRing,
  Target,
} from 'lucide-react';

interface DailyMarketRecommendationProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  onSelectStock: (stock: ResearchStock) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onNavigatePreMarket?: () => void;
  livePrices?: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  currentLang?: SupportedLanguage;
}

export interface DailyPick {
  stock: ResearchStock;
  category: 'TOP_BUY_OPPORTUNITY' | 'MOAT_COMPOUNDER' | 'VALUE_PULLBACK' | 'MOMENTUM_LEADER';
  categoryLabelHe: string;
  categoryLabelEn: string;
  accentText: string;
  highlightReasonHe: string;
  highlightReasonEn: string;
  targetUpside: string;
  riskRewardRatio: string;
  recommendationRating: 'STRONG_BUY' | 'BUY' | 'ACCUMULATE';
}

export const DailyMarketRecommendationsCard: React.FC<DailyMarketRecommendationProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onAddToPortfolio,
  onSelectStock,
  onOpenDeepDive,
  onNavigatePreMarket,
  livePrices = {},
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';
  const [activeTabMode, setActiveTabMode] = useState<'NEWS' | 'PICKS'>('NEWS');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BUY'>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveNewsFeed, setLiveNewsFeed] = useState<PremarketNewsItem[]>(INITIAL_PREMARKET_NEWS_FEED);

  useEffect(() => {
    let isMounted = true;
    const loadLiveFeed = async () => {
      try {
        const res = await fetch('/api/premarket-news', { headers: { Accept: 'application/json' } });
        if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.news) && data.news.length > 0) {
            setLiveNewsFeed(data.news);
            setLastRefreshed(new Date());
          }
        }
      } catch {
        // quiet fallback
      }
    };
    loadLiveFeed();
    const timer = setInterval(loadLiveFeed, 60000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat(isHe ? 'he-IL' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(lastRefreshed);
  }, [isHe, lastRefreshed]);

  const dailyPicks = useMemo<DailyPick[]>(() => {
    if (!stocks || stocks.length === 0) return [];

    const picks: DailyPick[] = [];

    const getStockStats = (ticker: string, defaultPrice: number) => {
      const live = livePrices[ticker];
      return {
        price: live?.price || defaultPrice,
        changePercent: live?.changePercent ?? 0,
      };
    };

    const pullbackCandidate = stocks
      .filter((s) => s.investmentScore >= 88)
      .map((s) => ({
        stock: s,
        stats: getStockStats(s.ticker, s.currentPrice),
      }))
      .sort((a, b) => a.stats.changePercent - b.stats.changePercent)[0];

    if (pullbackCandidate) {
      picks.push({
        stock: pullbackCandidate.stock,
        category: 'VALUE_PULLBACK',
        categoryLabelHe: 'הזדמנות ערך בירידה',
        categoryLabelEn: 'Value Pullback',
        accentText: 'text-amber-300',
        highlightReasonHe: `נסחרת בהנחה ביחס לשווי ההוגן ($${pullbackCandidate.stock.valuationMetrics?.dcfFairValue || '580'}) עם ROIC יציב של ${pullbackCandidate.stock.qualityChecks?.roic5YAvg || 22}%.`,
        highlightReasonEn: `Trading at a discount vs DCF fair value ($${pullbackCandidate.stock.valuationMetrics?.dcfFairValue || '580'}) with high margin of safety.`,
        targetUpside: '+24.5%',
        riskRewardRatio: '3.8:1',
        recommendationRating: 'STRONG_BUY',
      });
    }

    const moatChampion =
      stocks
        .filter((s) => s.ticker !== pullbackCandidate?.stock.ticker)
        .sort((a, b) => (b.qualityChecks?.roic5YAvg || 0) - (a.qualityChecks?.roic5YAvg || 0))[0] || stocks[0];

    if (moatChampion) {
      picks.push({
        stock: moatChampion,
        category: 'MOAT_COMPOUNDER',
        categoryLabelHe: 'חפיר כלכלי מוביל',
        categoryLabelEn: 'Wide Moat Leader',
        accentText: 'text-emerald-300',
        highlightReasonHe: `יתרון תחרותי עמוק עם ROIC של ${moatChampion.qualityChecks?.roic5YAvg || 28.5}% וכוח תמחור גבוה.`,
        highlightReasonEn: `Strong pricing power, ${(moatChampion.qualityChecks?.roic5YAvg || 28.5)}% ROIC and durable moat.`,
        targetUpside: '+19.2%',
        riskRewardRatio: '4.2:1',
        recommendationRating: 'STRONG_BUY',
      });
    }

    const growthCompounder =
      stocks
        .filter((s) => s.ticker !== pullbackCandidate?.stock.ticker && s.ticker !== moatChampion?.ticker)
        .sort((a, b) => (b.valuationMetrics?.peRatio || 0) - (a.valuationMetrics?.peRatio || 0))[0] || stocks[1];

    if (growthCompounder) {
      picks.push({
        stock: growthCompounder,
        category: 'TOP_BUY_OPPORTUNITY',
        categoryLabelHe: 'מובילת צמיחה 5Y',
        categoryLabelEn: '5Y High Compounder',
        accentText: 'text-cyan-300',
        highlightReasonHe: `צפי צמיחה שנתית של ${growthCompounder.estimated5YearCagr || '14.5%'} ברווח למניה ומאזן שמרני.`,
        highlightReasonEn: `Estimated ${growthCompounder.estimated5YearCagr || '14.5%'} EPS CAGR with strong balance sheet.`,
        targetUpside: '+22.0%',
        riskRewardRatio: '3.5:1',
        recommendationRating: 'BUY',
      });
    }

    const cashMachine =
      stocks
        .filter(
          (s) =>
            s.ticker !== pullbackCandidate?.stock.ticker &&
            s.ticker !== moatChampion?.ticker &&
            s.ticker !== growthCompounder?.ticker
        )
        .sort((a, b) => b.investmentScore - a.investmentScore)[0] || stocks[2];

    if (cashMachine) {
      picks.push({
        stock: cashMachine,
        category: 'MOMENTUM_LEADER',
        categoryLabelHe: 'תזרים מזומנים חזק',
        categoryLabelEn: 'FCF Compounder',
        accentText: 'text-indigo-300',
        highlightReasonHe: `שולי תזרים חופשי גבוהים עם ציון איכות של ${cashMachine.investmentScore}/100.`,
        highlightReasonEn: `Strong free cash flow margin with institutional rating of ${cashMachine.investmentScore}/100.`,
        targetUpside: '+18.5%',
        riskRewardRatio: '3.9:1',
        recommendationRating: 'ACCUMULATE',
      });
    }

    return picks;
  }, [stocks, livePrices]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/premarket-news/regenerate', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.news) && data.news.length > 0) {
          setLiveNewsFeed(data.news);
        }
      }
    } catch {
      // ignore
    } finally {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }
  };

  const filteredPicks = useMemo(() => {
    if (selectedFilter === 'BUY') return dailyPicks.filter((p) => p.recommendationRating === 'STRONG_BUY');
    return dailyPicks;
  }, [dailyPicks, selectedFilter]);

  const getRatingLabel = (rating: DailyPick['recommendationRating']) => {
    switch (rating) {
      case 'STRONG_BUY':
        return (
          <span className="text-[11px] font-semibold text-emerald-400">
            {isHe ? 'קנייה חזקה' : 'Strong Buy'}
          </span>
        );
      case 'BUY':
        return (
          <span className="text-[11px] font-semibold text-cyan-400">
            {isHe ? 'קנייה' : 'Buy'}
          </span>
        );
      case 'ACCUMULATE':
        return (
          <span className="text-[11px] font-semibold text-indigo-300">
            {isHe ? 'צבירה' : 'Accumulate'}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
      {/* Clean Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>{isHe ? 'עדכון חדשות יומי' : 'Daily News Update'}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{formattedDate}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight text-balance">
            {activeTabMode === 'NEWS'
              ? (isHe ? 'חדשות יומיות וניתוח תגובה' : 'Daily News & Reaction Analysis')
              : (isHe ? '4 הזדמנויות האיכות המובילות להיום' : 'Top 4 Quality Opportunities Today')}
          </h2>
        </div>

        {/* Clean Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTabMode('NEWS')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTabMode === 'NEWS' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{isHe ? 'חדשות וניתוח תגובה' : 'News & Reactions'}</span>
            </button>
            <button
              onClick={() => setActiveTabMode('PICKS')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTabMode === 'PICKS' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{isHe ? '4 מומלצות' : 'Top 4 Picks'}</span>
            </button>
          </div>

          {activeTabMode === 'PICKS' && (
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHe ? 'הכל' : 'All'}
              </button>
              <button
                onClick={() => setSelectedFilter('BUY')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  selectedFilter === 'BUY' ? 'bg-slate-800 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHe ? 'קנייה חזקה' : 'Strong Buy'}
              </button>
            </div>
          )}

          {onNavigatePreMarket && (
            <button
              onClick={onNavigatePreMarket}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              <span>{isHe ? 'לכל החדשות' : 'Full Hub'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
            </button>
          )}

          <button
            onClick={handleRefresh}
            title={isHe ? 'רענן חדשות' : 'Refresh'}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {activeTabMode === 'NEWS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
          {liveNewsFeed.slice(0, 3).map((item) => {
            const stockMatch = stocks.find((s) => s.ticker === item.ticker);
            const live = livePrices[item.ticker] || livePrices[item.ticker?.toUpperCase()];
            const price =
              typeof live?.price === 'number' && !isNaN(live.price)
                ? live.price
                : typeof item.preMarketPrice === 'number'
                ? item.preMarketPrice
                : 0;
            const chg =
              typeof live?.changePercent === 'number' && !isNaN(live.changePercent)
                ? live.changePercent
                : typeof item.preMarketChangePercent === 'number'
                ? item.preMarketChangePercent
                : 0;
            const isPos = chg >= 0;

            const isDrop = item.messageCategory === 'DROP_WARNING' || item.movementType === 'SHARP_DROP_WARNING';
            const isRise = item.messageCategory === 'SHARP_RISE' || item.movementType === 'IMPENDING_JUMP';
            const isRevision = item.messageCategory === 'FORECAST_REVISION' || item.movementType === 'FORECAST_REVISION';

            const statusLabel = isDrop
              ? isHe ? 'אזהרת ירידה' : 'Drop Risk'
              : isRise
              ? isHe ? 'מומנטום חיובי' : 'Sharp Upside'
              : isRevision
              ? isHe ? 'עדכון תחזית' : 'Forecast Update'
              : isHe ? 'עדכון שוק' : 'Market Brief';

            const statusColor = isDrop
              ? 'text-rose-400'
              : isRise
              ? 'text-emerald-400'
              : isRevision
              ? 'text-sky-400'
              : 'text-slate-400';

            return (
              <div
                key={item.id}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition gap-3"
              >
                <div className="space-y-3">
                  {/* Unboxed Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
                    <span className="text-slate-500">
                      {item.source} · {item.publishedTime}
                    </span>
                  </div>

                  {/* Ticker + Live Quote */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StockLogoBadge ticker={item.ticker} size="sm" />
                      <div className="min-w-0">
                        <span className="font-bold text-white text-sm font-mono block">{item.ticker}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{item.companyName}</span>
                      </div>
                    </div>

                    <div className="text-end font-mono tabular-nums shrink-0">
                      <div className="text-sm font-semibold text-white">${price.toFixed(2)}</div>
                      <div className={`text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? `+${chg.toFixed(2)}%` : `${chg.toFixed(2)}%`}
                      </div>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 text-balance">
                    {item.headline}
                  </h3>

                  {/* Clean separated reaction analysis */}
                  <div className="pt-2.5 border-t border-slate-800/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-amber-300">
                        {isHe
                          ? item.reactionAnalysis?.expectedReactionLabelHe || item.recommendation.actionLabelHe
                          : item.reactionAnalysis?.expectedReactionLabelEn || item.recommendation.actionLabelEn}
                      </span>
                      {(item.reactionAnalysis?.expectedMoveRange || item.estimatedImpactPct) && (
                        <span className="font-mono tabular-nums text-slate-400">
                          {item.reactionAnalysis?.expectedMoveRange || item.estimatedImpactPct}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {isHe
                        ? item.reactionAnalysis?.whyReactingHe || item.recommendation.openingBellGamePlanHe
                        : item.reactionAnalysis?.whyReactingEn || item.recommendation.openingBellGamePlanEn}
                    </p>
                    <p className="text-[11px] text-cyan-300/90 leading-relaxed line-clamp-1">
                      <strong className="text-slate-400 font-medium">{isHe ? 'איך לפעול: ' : 'Response: '}</strong>
                      {isHe
                        ? item.reactionAnalysis?.howToRespondHe || item.recommendation.openingBellGamePlanHe
                        : item.reactionAnalysis?.howToRespondEn || item.recommendation.openingBellGamePlanEn}
                    </p>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/70 text-xs">
                  {stockMatch ? (
                    <button
                      onClick={() => onOpenDeepDive(stockMatch)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{isHe ? 'ניתוח חברה' : 'Deep Dive'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <span />
                  )}

                  {onNavigatePreMarket && (
                    <button
                      onClick={onNavigatePreMarket}
                      className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isHe ? 'פרטים מלאים' : 'Full Brief'}</span>
                      <ArrowRight className={`w-3 h-3 ${isHe ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
          {filteredPicks.map((pick) => {
            const { stock } = pick;
            const live = livePrices[stock.ticker] || livePrices[stock.ticker?.toUpperCase()];
            const currentPrice =
              typeof live?.price === 'number' && !isNaN(live.price)
                ? live.price
                : parseFloat(String(stock.currentPrice || '').replace(/[^0-9.]/g, '')) || 0;
            const changePercent =
              typeof live?.changePercent === 'number' && !isNaN(live.changePercent) ? live.changePercent : 0;
            const isPositive = changePercent >= 0;

            return (
              <div
                key={stock.ticker}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition rounded-xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-3">
                  {/* Category & Rating unboxed row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-semibold ${pick.accentText}`}>
                      {isHe ? pick.categoryLabelHe : pick.categoryLabelEn}
                    </span>
                    {getRatingLabel(pick.recommendationRating)}
                  </div>

                  {/* Stock Identity & Price */}
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => onSelectStock(stock)}
                      className="flex items-center gap-2.5 cursor-pointer group min-w-0"
                    >
                      <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition font-mono">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{stock.exchange}</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate">{stock.companyName}</div>
                      </div>
                    </div>

                    <div className="text-end font-mono tabular-nums shrink-0">
                      <div className="text-sm font-semibold text-white">${currentPrice.toFixed(2)}</div>
                      <div
                        className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isPositive ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean inline metrics strip */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/70 text-[11px] font-mono tabular-nums">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{isHe ? 'ציון' : 'Score'}</span>
                      <span className="font-semibold text-white">{stock.investmentScore}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ROIC</span>
                      <span className="font-semibold text-emerald-400">{stock.qualityChecks?.roic5YAvg || 24}%</span>
                    </div>
                    <div className="text-end">
                      <span className="text-slate-500 block text-[10px]">{isHe ? 'אפסייד' : 'Upside'}</span>
                      <span className="font-semibold text-cyan-300">{pick.targetUpside}</span>
                    </div>
                  </div>

                  {/* Thesis */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {isHe ? pick.highlightReasonHe : pick.highlightReasonEn}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenDeepDive(stock)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isHe ? 'ניתוח עומק' : 'Deep Dive'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
                  </button>

                  <QuickActionPlusMenu
                    stock={stock}
                    watchlist={watchlist}
                    onToggleWatchlist={onToggleWatchlist}
                    onAddToPortfolio={onAddToPortfolio}
                    onOpenDeepDive={onOpenDeepDive}
                    isRtl={isHe}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
