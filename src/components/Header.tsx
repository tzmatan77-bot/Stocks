import React, { useState, useMemo } from 'react';
import {
  Search,
  Award,
  Sparkles,
  RefreshCw,
  Sliders,
  Briefcase,
  Star,
  Play,
  Pause,
  Compass,
  FileText,
  ShieldCheck,
  ChevronDown,
  Globe,
  Home,
  SlidersHorizontal,
  Calculator,
  TrendingUp,
  DollarSign,
  Layers,
  Activity,
  ArrowLeftRight,
  BarChart3,
  PieChart,
  BookOpen,
  Printer,
  Flame,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from '../i18n';
import { StockLogoBadge } from './StockLogoBadge';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchTicker: (ticker: string) => void;
  isSearching: boolean;
  selectedStockTicker: string;
  onSelectStock: (ticker: string) => void;
  portfolioCount: number;
  watchlistCount: number;
  isLiveStreaming: boolean;
  onToggleLiveStream: () => void;
  onManualRefreshPrices: () => void;
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  navLayout?: 'top' | 'sidebar';
  onToggleLayoutMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSearchTicker,
  isSearching,
  onSelectStock,
  portfolioCount,
  watchlistCount,
  isLiveStreaming,
  onToggleLiveStream,
  onManualRefreshPrices,
  livePrices,
  currentLang,
  onLanguageChange,
  navLayout = 'sidebar',
  onToggleLayoutMode,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isHe = currentLang === 'he';
  const t = translations[currentLang] || translations.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchTicker(searchInput.trim().toUpperCase());
    }
  };

  const tickerTape = ['UNH', 'MSFT', 'GOOGL', 'V', 'COST', 'AAPL', 'NVDA', 'SPGI', 'ISRG', 'TXN'];

  // Primary core user-friendly tabs - now includes dedicated Institutional Tools page tab
  const primaryTabs = [
    { id: 'home', label: t.tabHome || 'Home', icon: Home, badge: 'AI' },
    { id: 'premarket_session', label: isHe ? 'טרום-מסחר' : 'Pre-Market', icon: Sunrise, badge: 'LIVE' },
    { id: 'afterhours_session', label: isHe ? 'לאחר סגירה' : 'After-Hours', icon: Sunset, badge: 'LIVE' },
    { id: 'premarket', label: isHe ? 'חדשות יומיות' : 'Daily News', icon: Flame, badge: 'LIVE' },
    { id: 'top10', label: t.tabTop10Scanner || 'Top 30', icon: Award, badge: '30' },
    { id: 'explore', label: t.tabExplore || 'Discover', icon: Compass, badge: 'S&P/NDQ' },
    { id: 'toolshub', label: t.tabToolsHub || '🛠️ כלים מוסדיים', icon: SlidersHorizontal, badge: '14' },
    { id: 'watchlist', label: t.tabWatchlist || 'Watchlist', icon: Star, badge: `${watchlistCount}` },
    { id: 'portfolio', label: t.tabPortfolio || 'Portfolio', icon: Briefcase, badge: `${portfolioCount}` },
    { id: 'top5', label: t.tabTop5 || 'Research', icon: FileText, badge: 'Deep Dive' },
    { id: 'analyzer', label: t.tabAnalyzer || 'AI Analyst', icon: Sparkles, badge: 'LIVE' },
  ];

  // Specific institutional tool definitions for active state recognition
  const institutionalToolsMap: Record<string, { label: string; desc: string; icon: any }> = useMemo(() => ({
    dcf: { label: t.tabDcf || 'DCF Valuation Calculator', desc: isHe ? 'מחשבון שווי הוגן DCF' : 'DCF Fair Value Model', icon: Calculator },
    reversedcf: { label: t.tabReverseDcf || 'Reverse DCF & Expectations', desc: isHe ? 'ציפיות שוק ו-Reverse DCF' : 'Reverse DCF & Expectations', icon: Sliders },
    simulator: { label: t.tabSimulator || '2Y Growth Simulator', desc: isHe ? 'סימולטור צמיחה לשנתיים' : '2Y Growth Simulator', icon: TrendingUp },
    yield: { label: t.tabShareholder || 'Shareholder Yield & Buybacks', desc: isHe ? 'רכישות חוזרות ודיבידנדים' : 'Shareholder Yield', icon: DollarSign },
    compmap: { label: t.tabCompetitiveMap || 'Competitive Moat Map', desc: isHe ? 'מפת חפיר ועליונות תחרותית' : 'Competitive Moat Map', icon: Layers },
    thesismonitor: { label: t.tabThesisMonitor || 'Thesis Monitor & Diary', desc: isHe ? 'בקרת תזה ויומן השקעות' : 'Thesis Monitor & Diary', icon: ShieldCheck },
    macro: { label: t.tabMacro || 'Macro Stress Testing', desc: isHe ? 'מבחני לחץ מאקרו וריבית' : 'Macro Stress Testing', icon: Activity },
    compare: { label: t.tabCompare || 'Head-to-Head Compare', desc: isHe ? 'השוואה ראש בראש' : 'Head-to-Head Compare', icon: ArrowLeftRight },
    terminal: { label: t.tabTerminal || 'Bloomberg Pro Terminal', desc: isHe ? 'מסוף בלומברג Pro דחוס' : 'Bloomberg Pro Terminal', icon: BarChart3 },
    quarterly: { label: t.tabQuarterly || 'Quarterly Health Monitor', desc: isHe ? 'ניטור דוחות רבעוניים' : 'Quarterly Monitor', icon: Activity },
    earnings: { label: t.tabEarnings || 'Earnings Calendar & Transcripts', desc: isHe ? 'יומן דוחות ותקצירי AI' : 'Earnings & Transcripts', icon: FileText },
    top20: { label: t.tabTop20 || '30 Stocks Full Data Matrix', desc: isHe ? 'מטריצת 30 המניות המלאה' : '30 Stocks Matrix', icon: PieChart },
    rules: { label: t.tabRules || '30-Rule Quality Specification', desc: isHe ? 'ספר 30 הכללים והמתודולוגיה' : '30 Quality Rules', icon: BookOpen },
    print: { label: t.tabPrintMemo || 'Export Institutional PDF Memo', desc: isHe ? 'ייצוא והדפסת תזכיר מוסדי' : 'Export Institutional Memo', icon: Printer },
  }), [isHe, t]);

  const activeSubTool = institutionalToolsMap[activeTab];
  const isSecondaryActive = !!activeSubTool;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      
      {/* Top Bar: Live Status, Feed Controls, Language Switcher & Ticker Tape */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs border-b border-slate-800/50 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-mono font-semibold text-[11px] shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            {isLiveStreaming ? t.liveStream : t.feedPaused}
          </span>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={onToggleLiveStream}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLiveStreaming
                  ? 'bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title={isLiveStreaming ? 'Pause live market feed' : 'Resume live market streaming'}
            >
              {isLiveStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isLiveStreaming ? t.streaming : t.play}</span>
            </button>

            <button
              onClick={onManualRefreshPrices}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title={t.refresh}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center/Right: Language Selector & Layout Switcher */}
        <div className="flex items-center gap-2">
          {onToggleLayoutMode && (
            <button
              onClick={onToggleLayoutMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-semibold transition shadow-sm cursor-pointer"
              title={isHe ? 'העבר לסרגל צד ימין' : 'Switch to Right Sidebar'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isHe ? 'סרגל צד ימין ➡️' : 'Right Sidebar ➡️'}</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowLangMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium transition shadow-sm cursor-pointer"
              title="Change Language / שנה שפה"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-base leading-none">{currentLangObj.flag}</span>
              <span className="font-semibold">{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div
                className="absolute right-0 rtl:left-0 rtl:right-auto mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 animate-fadeIn space-y-0.5"
                onMouseLeave={() => setShowLangMenu(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-semibold uppercase">
                  {t.changeLanguage}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-start flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {lang.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ticker Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-mono py-0.5 no-scrollbar">
          {tickerTape.map((t) => {
            const data = livePrices[t] || livePrices[t?.toUpperCase()];
            const chg = typeof data?.changePercent === 'number' && !isNaN(data.changePercent) ? data.changePercent : 0;
            const isPos = chg >= 0;
            const hasValidPrice = typeof data?.price === 'number' && !isNaN(data.price);
            return (
              <button
                key={t}
                onClick={() => onSelectStock(t)}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg transition cursor-pointer"
              >
                <StockLogoBadge ticker={t} size="xs" />
                <span className="font-bold text-white">{t}</span>
                {data && (
                  <>
                    {hasValidPrice && <span className="text-slate-400">${data.price.toFixed(1)}</span>}
                    <span className={isPos ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {isPos ? '+' : ''}{chg.toFixed(2)}%
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Header Brand & Fast Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                MoatGuard <span className="text-cyan-400 font-semibold text-sm">PRO</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Institutional 2Y Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 rtl:pr-10 rtl:pl-24 pr-24 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-mono shadow-inner transition"
            />
            <button
              type="submit"
              disabled={isSearching || !searchInput.trim()}
              className="absolute right-1.5 rtl:left-1.5 rtl:right-auto top-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1 shadow cursor-pointer"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : t.analyzeBtn}
            </button>
          </form>
        </div>
      </div>

      {/* Modern Clean Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto border-t border-slate-800/80 no-scrollbar">
        <div className="flex items-center gap-1.5 py-1.5">
          
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'toolshub' && isSecondaryActive);
            const isToolsHub = tab.id === 'toolshub';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                  isActive
                    ? isToolsHub
                      ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 text-indigo-200 border border-indigo-400 shadow-md shadow-indigo-950/40'
                      : 'bg-cyan-500/15 text-cyan-300 shadow-sm border border-cyan-500/40'
                    : isToolsHub
                      ? 'text-indigo-300 hover:text-white bg-slate-900/80 border border-indigo-700/50 hover:bg-indigo-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (isToolsHub ? 'text-indigo-300' : 'text-cyan-400') : (isToolsHub ? 'text-indigo-400' : 'text-slate-400')}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive
                        ? isToolsHub
                          ? 'bg-indigo-400 text-slate-950'
                          : 'bg-cyan-400 text-slate-950'
                        : isToolsHub
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                          : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

        </div>
      </div>

      {/* Active Institutional Tool Context Ribbon (When inside a specific sub-tool) */}
      {isSecondaryActive && activeSubTool && (
        <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900/95 to-indigo-950/90 border-t border-indigo-500/30 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] shrink-0 border border-indigo-500/40">
              {isHe ? 'כלי מוסדי פעיל' : 'Active Institutional Tool'}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-white truncate">
              <activeSubTool.icon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{activeSubTool.label}</span>
            </div>
            <span className="text-slate-400 hidden md:inline truncate text-[11px]">
              — {activeSubTool.desc}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('toolshub')}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isHe ? 'חזרה לכל 14 הכלים' : 'All 14 Tools'}</span>
            </button>
            <button
              onClick={() => setActiveTab('top10')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              {isHe ? 'סורק 30 המובילות 🏆' : 'Top 30 Screener 🏆'}
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
