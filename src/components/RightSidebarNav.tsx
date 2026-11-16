import React, { useState, useMemo } from 'react';
import {
  Search,
  Award,
  Sparkles,
  Briefcase,
  Star,
  ChevronDown,
  Globe,
  Home,
  SlidersHorizontal,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Calendar,
  BellRing,
  X,
  Play,
  Pause,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n';
import { StockLogoBadge } from './StockLogoBadge';
import { WatchlistItem } from '../types';

interface RightSidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchTicker: (ticker: string) => void;
  isSearching: boolean;
  onSelectStock: (ticker: string) => void;
  onLaunchStockTool?: (ticker: string, toolTab: string) => void;
  portfolioCount: number;
  watchlistCount: number;
  watchlist?: WatchlistItem[];
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  onManualRefreshPrices: () => void;
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const RightSidebarNav: React.FC<RightSidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onSearchTicker,
  isSearching,
  onSelectStock,
  portfolioCount,
  watchlistCount,
  watchlist,
  isLiveStreaming,
  onToggleLiveStream,
  livePrices,
  currentLang,
  onLanguageChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isHe = currentLang === 'he';
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
      onCloseMobile?.();
    }
  };

  const handleSelectNav = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile?.();
  };

  const mainNavItems = [
    { id: 'home', label: isHe ? 'דף הבית' : 'Home', icon: Home },
    { id: 'premarket_session', label: isHe ? 'טרום-מסחר' : 'Pre-Market', icon: Sunrise },
    { id: 'afterhours_session', label: isHe ? 'לאחר סגירה' : 'After-Hours', icon: Sunset },
    { id: 'quarterly', label: isHe ? 'דוחות רבעוניים (SEC)' : 'Quarterly Reports', icon: FileText },
    { id: 'premarket', label: isHe ? 'חדשות יומיות' : 'Daily News', icon: BellRing },
    { id: 'top10', label: isHe ? 'גלאי מניות השוק' : 'Market Screener', icon: Award },
    { id: 'portfolio', label: isHe ? 'תיק אישי' : 'Portfolio', icon: Briefcase, count: portfolioCount },
    { id: 'watchlist', label: isHe ? 'רשימת מעקב' : 'Watchlist', icon: Star, count: watchlistCount },
  ];

  const researchNavItems = [
    { id: 'top5', label: isHe ? 'מחקר מעמיק' : 'Deep Dive', icon: ShieldCheck },
    { id: 'analyzer', label: isHe ? 'אנליסט AI' : 'AI Analyst', icon: Sparkles },
    { id: 'earnings', label: isHe ? 'יומן דוחות' : 'Earnings', icon: Calendar },
    { id: 'toolshub', label: isHe ? 'כל הכלים (14)' : 'All Tools (14)', icon: SlidersHorizontal },
  ];

  const institutionalToolIds = new Set([
    'toolshub', 'dcf', 'reversedcf', 'simulator', 'yield',
    'compmap', 'thesismonitor', 'quarterly', 'macro', 'stress',
    'compare', 'comparison', 'builder', 'print', 'memo', 'rules', 'methodology', 'terminal', 'top20'
  ]);

  const quickWatchTickers = useMemo(() => {
    if (watchlist && watchlist.length > 0) {
      return watchlist.slice(0, 5).map((w) => w.ticker);
    }
    return ['NVDA', 'MSFT', 'GOOGL', 'AAPL', 'TSLA'];
  }, [watchlist]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 rtl:right-0 ltr:left-0 z-50 h-screen bg-slate-900 rtl:border-l ltr:border-r border-slate-800/80 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'md:w-16' : 'md:w-64'
        } w-64 ${
          isMobileOpen
            ? 'translate-x-0'
            : 'rtl:translate-x-full ltr:-translate-x-full md:rtl:translate-x-0 md:ltr:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => handleSelectNav('home')}
              className="flex items-center gap-2.5 text-start cursor-pointer min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap truncate">
                MoatGuard
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectNav('home')}
              className="mx-auto w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center cursor-pointer"
              title="MoatGuard"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            title={isCollapsed ? (isHe ? 'הרחב תפריט' : 'Expand sidebar') : (isHe ? 'כווץ תפריט' : 'Collapse sidebar')}
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4 ltr:rotate-180" />
            ) : (
              <ChevronRight className="w-4 h-4 ltr:rotate-180" />
            )}
          </button>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label={isHe ? 'סגור תפריט' : 'Close navigation'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean Ticker Search */}
        {!isCollapsed && (
          <div className="p-3 border-b border-slate-800/80 shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute rtl:right-3 ltr:left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isHe ? 'חפש סימול (NVDA, AAPL)...' : 'Search ticker (NVDA)...'}
                className="w-full rtl:pr-8 rtl:pl-12 ltr:pl-8 ltr:pr-12 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 transition font-mono"
              />
              {searchInput.trim() && (
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute rtl:left-1.5 ltr:right-1.5 top-1.5 px-2 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold rounded transition cursor-pointer"
                >
                  {isSearching ? '...' : isHe ? 'פתח' : 'Go'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 no-scrollbar">
          {/* Primary Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 pb-1 text-[11px] font-medium text-slate-500">
                {isHe ? 'ניווט ראשי' : 'Overview'}
              </div>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </span>
                  {!isCollapsed && typeof item.count === 'number' && (
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Research & Tools Section */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            {!isCollapsed && (
              <div className="px-2.5 pb-1 text-[11px] font-medium text-slate-500">
                {isHe ? 'מחקר וכלים' : 'Research'}
              </div>
            )}
            {researchNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'toolshub' && activeTab !== 'home' && institutionalToolIds.has(activeTab));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Watchlist Quick Strip */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="px-2.5 pb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>{isHe ? 'מעקב מהיר' : 'Quick Watch'}</span>
                <button
                  type="button"
                  onClick={() => handleSelectNav('watchlist')}
                  className="text-slate-400 hover:text-cyan-400 transition cursor-pointer text-[11px]"
                >
                  {isHe ? 'הכל' : 'All'}
                </button>
              </div>
              {quickWatchTickers.map((t) => {
                const data = livePrices[t] || livePrices[t?.toUpperCase()];
                const chg = typeof data?.changePercent === 'number' && !isNaN(data.changePercent) ? data.changePercent : 0;
                const isPos = chg >= 0;
                const hasValidPrice = typeof data?.price === 'number' && !isNaN(data.price);

                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onSelectStock(t);
                      onCloseMobile?.();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-800/50 flex items-center justify-between text-xs transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-mono font-semibold text-slate-200">
                      <StockLogoBadge ticker={t} size="xs" />
                      <span>{t}</span>
                    </span>
                    <span className="flex items-center gap-2 font-mono tabular-nums text-[11px]">
                      {hasValidPrice && <span className="text-slate-400">${data.price.toFixed(2)}</span>}
                      <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPos ? '+' : ''}{chg.toFixed(2)}%
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Clean Sidebar Footer: Live Toggle & Language */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleLiveStream}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-xs text-slate-300 transition cursor-pointer"
              title={isLiveStreaming ? (isHe ? 'השהה עדכון אוטומטי' : 'Pause auto sync') : (isHe ? 'הפעל עדכון אוטומטי' : 'Resume auto sync')}
            >
              {isLiveStreaming ? (
                <Pause className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isLiveStreaming ? (isHe ? 'שידור פעיל' : 'Auto Live') : (isHe ? 'מושהה' : 'Paused')}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentLangObj.flag}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div
                  className="absolute rtl:left-0 ltr:right-0 bottom-10 w-36 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl z-50 space-y-0.5"
                  onMouseLeave={() => setShowLangMenu(false)}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-start flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        currentLang === lang.code
                          ? 'bg-slate-800 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
