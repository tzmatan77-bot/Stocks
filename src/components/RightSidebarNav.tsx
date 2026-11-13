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
  TrendingDown,
  ArrowUpDown,
  DollarSign,
  Layers,
  Activity,
  ArrowLeftRight,
  BarChart3,
  PieChart,
  BookOpen,
  Printer,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Zap,
  LayoutGrid,
  Menu,
  X,
  ExternalLink,
  BellRing
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations } from '../i18n';
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
}

export const RightSidebarNav: React.FC<RightSidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onSearchTicker,
  isSearching,
  onSelectStock,
  onLaunchStockTool,
  portfolioCount,
  watchlistCount,
  watchlist,
  isLiveStreaming,
  onToggleLiveStream,
  onManualRefreshPrices,
  livePrices,
  currentLang,
  onLanguageChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showToolsSubmenu, setShowToolsSubmenu] = useState(false);
  const [selectedStockActionMenu, setSelectedStockActionMenu] = useState<string | null>(null);
  const [quickActionTicker, setQuickActionTicker] = useState('MCD');
  const [sidebarSortMode, setSidebarSortMode] = useState<'GAINERS' | 'DIPS' | 'DEFAULT'>('GAINERS');
  const [sidebarFeedTab, setSidebarFeedTab] = useState<'WATCHLIST' | 'MARKET'>('WATCHLIST');

  const isHe = currentLang === 'he';
  const t = translations[currentLang] || translations.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchTicker(searchInput.trim().toUpperCase());
    }
  };

  const handleExecuteTool = (ticker: string, toolTab: string) => {
    if (onLaunchStockTool) {
      onLaunchStockTool(ticker.toUpperCase().trim(), toolTab);
    } else {
      onSelectStock(ticker.toUpperCase().trim());
      setActiveTab(toolTab);
    }
    setSelectedStockActionMenu(null);
  };

  const tickerTape = ['UNH', 'MSFT', 'GOOGL', 'V', 'COST', 'NVDA', 'AAPL', 'MCD'];

  const displaySidebarTickers = useMemo(() => {
    const rawList =
      sidebarFeedTab === 'WATCHLIST' && watchlist && watchlist.length > 0
        ? watchlist.map((w) => w.ticker)
        : tickerTape;

    if (sidebarSortMode === 'GAINERS') {
      return [...rawList].sort((a, b) => {
        const itemA = livePrices[a] || livePrices[a?.toUpperCase()];
        const itemB = livePrices[b] || livePrices[b?.toUpperCase()];
        const chgA = typeof itemA?.changePercent === 'number' && !isNaN(itemA.changePercent) ? itemA.changePercent : 0;
        const chgB = typeof itemB?.changePercent === 'number' && !isNaN(itemB.changePercent) ? itemB.changePercent : 0;
        return chgB - chgA; // שינוי יומי מהגבוה לנמוך (עליות בראש)
      });
    }

    if (sidebarSortMode === 'DIPS') {
      return [...rawList].sort((a, b) => {
        const itemA = livePrices[a] || livePrices[a?.toUpperCase()];
        const itemB = livePrices[b] || livePrices[b?.toUpperCase()];
        const chgA = typeof itemA?.changePercent === 'number' && !isNaN(itemA.changePercent) ? itemA.changePercent : 0;
        const chgB = typeof itemB?.changePercent === 'number' && !isNaN(itemB.changePercent) ? itemB.changePercent : 0;
        return chgA - chgB; // שינוי יומי מהנמוך לגבוה (ירידות בראש)
      });
    }

    return rawList;
  }, [sidebarFeedTab, watchlist, sidebarSortMode, livePrices]);

  // Core navigation items
  const mainNavItems = [
    { id: 'home', label: isHe ? 'דף הבית' : 'Home', icon: Home, badge: 'AI', color: 'text-cyan-400' },
    { id: 'premarket', label: isHe ? 'קדם-מסחר & חדשות' : 'Pre-Market & News', icon: BellRing, badge: 'LIVE', color: 'text-amber-400' },
    { id: 'earnings', label: isHe ? 'יומן דוחות יומי וניתוח' : 'Daily Earnings & AI', icon: Calendar, badge: 'TODAY', color: 'text-indigo-400' },
    { id: 'top10', label: isHe ? 'גלאי מניות השוק' : 'Market Screener', icon: Award, badge: '30', color: 'text-amber-400' },
    { id: 'portfolio', label: isHe ? 'ניהול תיק אישי' : 'Personal Portfolio', icon: Briefcase, badge: `${portfolioCount}`, color: 'text-emerald-400' },
    { id: 'watchlist', label: isHe ? 'רשימת מעקב' : 'Watchlist', icon: Star, badge: `${watchlistCount}`, color: 'text-yellow-400' },
    { id: 'top5', label: isHe ? 'מחקר מעמיק (5 הגדולות)' : 'Deep Dive Research', icon: FileText, badge: 'Deep Dive', color: 'text-blue-400' },
    { id: 'analyzer', label: isHe ? 'אנליסט שוק חי (AI)' : 'Live AI Analyst', icon: Sparkles, badge: 'LIVE', color: 'text-purple-400' },
  ];

  // Secondary institutional tools
  const institutionalTools = [
    { id: 'toolshub', label: isHe ? '🗂️ כל 14 הכלים המוסדיים' : '🗂️ All 14 Institutional Tools', icon: SlidersHorizontal },
    { id: 'dcf', label: isHe ? 'מודל שווי הוגן (DCF)' : 'DCF Valuation Model', icon: Calculator },
    { id: 'reversedcf', label: isHe ? 'ציפיות שוק (Reverse DCF)' : 'Reverse DCF Expectations', icon: Sliders },
    { id: 'simulator', label: isHe ? 'סימולטור צמיחה לשנתיים' : '2Y Growth Simulator', icon: TrendingUp },
    { id: 'yield', label: isHe ? 'תשואת בעלי מניות ובייבק' : 'Shareholder Yield & Buybacks', icon: DollarSign },
    { id: 'compmap', label: isHe ? 'מפת חפיר תחרותית' : 'Competitive Moat Map', icon: Layers },
    { id: 'thesismonitor', label: isHe ? 'בקרת תזה ויומן השקעות' : 'Thesis Monitor & Diary', icon: ShieldCheck },
    { id: 'quarterly', label: isHe ? 'בקרת דוחות רבעוניים' : 'Quarterly Monitor', icon: Activity },
    { id: 'stress', label: isHe ? 'מבחן לחץ מאקרו ואינפלציה' : 'Macro Stress Tester', icon: BarChart3 },
    { id: 'earnings', label: isHe ? 'לוח שנה לדוחות' : 'Earnings Calendar', icon: Calendar },
    { id: 'comparison', label: isHe ? 'השוואת מניות מרובה' : 'Stock Comparison', icon: ArrowLeftRight },
    { id: 'builder', label: isHe ? 'בונה תיקים אופטימלי' : 'Portfolio Builder', icon: PieChart },
    { id: 'memo', label: isHe ? 'מחולל מזכר השקעה' : 'Investment Memo', icon: Printer },
    { id: 'methodology', label: isHe ? 'מתודולוגיית 100 נקודות' : '100-Pt Methodology', icon: BookOpen },
  ];

  const isInstitutionalToolActive = institutionalTools.some((t) => t.id === activeTab);

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-screen bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-white tracking-tight truncate">
                  MoatGuard <span className="text-cyan-400 text-xs font-bold">PRO</span>
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  2Y
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isHe ? 'סרגל ימני פעיל' : 'Right Sidebar'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          title={isCollapsed ? (isHe ? 'הרחב סרגל' : 'Expand Sidebar') : (isHe ? 'כווץ סרגל' : 'Collapse Sidebar')}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Fast Search & Quick Live Controls */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800 space-y-2.5 shrink-0 bg-slate-950/40">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isHe ? 'חפש טיקר (למשל NVDA)...' : 'Search ticker...'}
              className="w-full pl-8 rtl:pr-8 rtl:pl-16 pr-16 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSearching || !searchInput.trim()}
              className="absolute right-1 rtl:left-1 rtl:right-auto top-1 px-2 py-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : isHe ? 'חפש' : 'Go'}
            </button>
          </form>

          {/* Quick controls bar */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleLiveStream}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer ${
                  isLiveStreaming
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
                title={isLiveStreaming ? 'השהה שידור חי' : 'הפעל שידור חי'}
              >
                {isLiveStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span className="text-[10px]">{isLiveStreaming ? (isHe ? 'שידור חי' : 'Live') : (isHe ? 'מושהה' : 'Paused')}</span>
              </button>

              <button
                onClick={onManualRefreshPrices}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title={isHe ? 'רענן מחירים' : 'Refresh'}
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition cursor-pointer"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>{currentLangObj.flag}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {showLangMenu && (
                <div
                  className="absolute left-0 rtl:right-0 rtl:left-auto top-7 w-36 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl z-50 animate-fadeIn space-y-0.5"
                  onMouseLeave={() => setShowLangMenu(false)}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-start flex items-center justify-between px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                        currentLang === lang.code
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 no-scrollbar">
        
        {/* Core Tabs Section */}
        {!isCollapsed && (
          <div className="px-2 pt-1 pb-0.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            {isHe ? 'ניווט ראשי' : 'Main Navigation'}
          </div>
        )}

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Institutional Tools Accordion / Group */}
        <div className="pt-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider">
              <span>{isHe ? 'כלים מוסדיים (14)' : 'Institutional Tools (14)'}</span>
              <button
                onClick={() => setShowToolsSubmenu((prev) => !prev)}
                className="text-indigo-400 hover:text-indigo-200 text-xs cursor-pointer"
              >
                {showToolsSubmenu ? '▲' : '▼'}
              </button>
            </div>
          )}

          {/* Primary Toolshub Button */}
          <button
            onClick={() => {
              setActiveTab('toolshub');
              setShowToolsSubmenu(true);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'toolshub' || (isInstitutionalToolActive && !showToolsSubmenu)
                ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 text-indigo-200 border border-indigo-400 shadow-md'
                : 'text-indigo-300 hover:bg-indigo-950/40 hover:text-white border border-indigo-900/40'
            }`}
            title={isCollapsed ? (isHe ? 'מרכז כלים מוסדיים (14)' : 'Institutional Tools Hub') : undefined}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="truncate">{isHe ? 'מרכז הכלים המוסדיים' : 'Institutional Tools Hub'}</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                14
              </span>
            )}
          </button>

          {/* Submenu for Individual Tools */}
          {!isCollapsed && showToolsSubmenu && (
            <div className="pr-3 pl-1 pt-1.5 space-y-1 animate-fadeIn border-r-2 border-indigo-500/40 mr-2 my-1">
              {institutionalTools.slice(1).map((subTool) => {
                const SubIcon = subTool.icon;
                const isSubActive = activeTab === subTool.id;
                return (
                  <button
                    key={subTool.id}
                    onClick={() => setActiveTab(subTool.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer text-start ${
                      isSubActive
                        ? 'bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-400/50'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-indigo-300' : 'text-slate-500'}`} />
                    <span className="truncate">{subTool.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Universal Stock Tools Quick Launcher */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-slate-800/80 my-1">
            <div className="px-2 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                {isHe ? '⚡ הפעלת כלים על כל מניה' : '⚡ Any Stock Tools'}
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ANY
              </span>
            </div>

            {/* Quick stock selector & tool buttons */}
            <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={quickActionTicker}
                  onChange={(e) => setQuickActionTicker(e.target.value.toUpperCase())}
                  placeholder={isHe ? 'הקלד טיקר (MCD, NVDA)...' : 'Type ticker...'}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Grid of tool launch shortcuts for the chosen stock */}
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => handleExecuteTool(quickActionTicker || 'MCD', 'dcf')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-800 flex items-center gap-1.5 transition text-start font-medium cursor-pointer"
                  title={isHe ? `חשב שווי הוגן DCF עבור ${quickActionTicker}` : `Calculate DCF for ${quickActionTicker}`}
                >
                  <Calculator className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{isHe ? 'מחשבון DCF' : 'DCF Model'}</span>
                </button>

                <button
                  onClick={() => handleExecuteTool(quickActionTicker || 'MCD', 'top5')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-blue-950/60 hover:text-blue-300 border border-slate-800 flex items-center gap-1.5 transition text-start font-medium cursor-pointer"
                  title={isHe ? `דוח חברה ומחקר מעמיק עבור ${quickActionTicker}` : `Deep Dive report for ${quickActionTicker}`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{isHe ? 'דוח מעמיק' : 'Deep Dive'}</span>
                </button>

                <button
                  onClick={() => handleExecuteTool(quickActionTicker || 'MCD', 'reversedcf')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-950/60 hover:text-purple-300 border border-slate-800 flex items-center gap-1.5 transition text-start font-medium cursor-pointer"
                  title={isHe ? `ציפיות שוק Reverse DCF עבור ${quickActionTicker}` : `Reverse DCF for ${quickActionTicker}`}
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{isHe ? 'Reverse DCF' : 'Rev DCF'}</span>
                </button>

                <button
                  onClick={() => handleExecuteTool(quickActionTicker || 'MCD', 'simulator')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/60 hover:text-emerald-300 border border-slate-800 flex items-center gap-1.5 transition text-start font-medium cursor-pointer"
                  title={isHe ? `סימולטור תשואה לשנתיים עבור ${quickActionTicker}` : `2Y Simulator for ${quickActionTicker}`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{isHe ? 'סימולטור 2Y' : 'Simulator'}</span>
                </button>

                <button
                  onClick={() => handleExecuteTool(quickActionTicker || 'MCD', 'yield')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/60 hover:text-amber-300 border border-slate-800 flex items-center gap-1.5 transition text-start font-medium cursor-pointer"
                  title={isHe ? `תשואת בעלי מניות ובייבק עבור ${quickActionTicker}` : `Shareholder Yield for ${quickActionTicker}`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{isHe ? 'תשואת בייבק' : 'Yield'}</span>
                </button>

                <button
                  onClick={() => handleExecuteTool(quickActionTicker || 'MCD', 'thesismonitor')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/60 hover:text-indigo-300 border border-slate-800 flex items-center gap-1.5 transition text-start font-medium cursor-pointer"
                  title={isHe ? `יומן ובקרת תזה עבור ${quickActionTicker}` : `Thesis Monitor for ${quickActionTicker}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{isHe ? 'בקרת תזה' : 'Thesis'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Ticker Quick Feed inside Sidebar */}
        {!isCollapsed && (
          <div className="pt-3">
            <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSidebarFeedTab('WATCHLIST')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[9px] ${
                    sidebarFeedTab === 'WATCHLIST'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={isHe ? 'הצג מניות שבמעקב' : 'Show Watchlist stocks'}
                >
                  {isHe ? 'מעקב' : 'Watchlist'}{watchlist && watchlist.length > 0 ? ` (${watchlist.length})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarFeedTab('MARKET')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[9px] ${
                    sidebarFeedTab === 'MARKET'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={isHe ? 'הצג מניות שוק מובילות' : 'Show Market leaders'}
                >
                  {isHe ? 'שוק' : 'Market'}
                </button>
              </div>

              {/* Sorting controls for Sidebar Feed */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSidebarSortMode('GAINERS')}
                  className={`p-1 rounded transition cursor-pointer ${
                    sidebarSortMode === 'GAINERS'
                      ? 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-400'
                      : 'text-slate-500 hover:text-emerald-400'
                  }`}
                  title={isHe ? 'סדר לפי שינוי יומי: מהגבוה לנמוך (עליות בראש)' : 'Sort by daily change: High to Low'}
                >
                  <TrendingUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarSortMode('DIPS')}
                  className={`p-1 rounded transition cursor-pointer ${
                    sidebarSortMode === 'DIPS'
                      ? 'bg-rose-500/30 text-rose-300 ring-1 ring-rose-400'
                      : 'text-slate-500 hover:text-rose-400'
                  }`}
                  title={isHe ? 'סדר לפי שינוי יומי: מהנמוך לגבוה (ירידות בראש)' : 'Sort by daily change: Low to High'}
                >
                  <TrendingDown className="w-3 h-3" />
                </button>
                {sidebarSortMode !== 'DEFAULT' && (
                  <button
                    type="button"
                    onClick={() => setSidebarSortMode('DEFAULT')}
                    className="text-[9px] text-slate-500 hover:text-slate-300 px-1 py-0.5 transition cursor-pointer"
                    title={isHe ? 'איפוס סדר' : 'Reset sort'}
                  >
                    ⟲
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              {displaySidebarTickers.map((t) => {
                const data = livePrices[t] || livePrices[t?.toUpperCase()];
                const chg = typeof data?.changePercent === 'number' && !isNaN(data.changePercent) ? data.changePercent : 0;
                const isPos = chg >= 0;
                const hasValidPrice = typeof data?.price === 'number' && !isNaN(data.price);
                const isMenuOpen = selectedStockActionMenu === t;

                return (
                  <div key={t} className="rounded-lg bg-slate-950/60 border border-slate-800/80 overflow-hidden">
                    <button
                      onClick={() => setSelectedStockActionMenu(isMenuOpen ? null : t)}
                      className="w-full p-2 hover:bg-slate-800/60 flex items-center justify-between text-[11px] font-mono transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <StockLogoBadge ticker={t} size="xs" />
                        <span>{t}</span>
                        {hasValidPrice ? (
                          <span className="text-[10px] text-slate-400 font-normal">${data.price.toFixed(1)}</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isPos ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                        }`}>
                          {isPos ? '+' : ''}{chg.toFixed(2)}%
                        </span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                      </div>
                    </button>

                    {/* Expandable Per-Stock Action Menu */}
                    {isMenuOpen && (
                      <div className="p-1.5 bg-slate-900 border-t border-slate-800 grid grid-cols-3 gap-1 text-[10px] animate-fadeIn">
                        <button
                          onClick={() => handleExecuteTool(t, 'dcf')}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 text-center font-mono cursor-pointer"
                          title={isHe ? `מחשבון שווי הוגן DCF` : `DCF Calculator`}
                        >
                          🧮 DCF
                        </button>
                        <button
                          onClick={() => handleExecuteTool(t, 'top5')}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-blue-900/60 text-blue-300 text-center font-mono cursor-pointer"
                          title={isHe ? `דוח ומחקר מעמיק` : `Deep Dive Report`}
                        >
                          📄 דוח
                        </button>
                        <button
                          onClick={() => handleExecuteTool(t, 'reversedcf')}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-purple-900/60 text-purple-300 text-center font-mono cursor-pointer"
                          title={isHe ? `Reverse DCF` : `Reverse DCF`}
                        >
                          📊 Rev DCF
                        </button>
                        <button
                          onClick={() => handleExecuteTool(t, 'simulator')}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-emerald-900/60 text-emerald-300 text-center font-mono cursor-pointer"
                          title={isHe ? `סימולטור שנתיים` : `2Y Simulator`}
                        >
                          📈 סימולטור
                        </button>
                        <button
                          onClick={() => handleExecuteTool(t, 'yield')}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-amber-900/60 text-amber-300 text-center font-mono cursor-pointer"
                          title={isHe ? `תשואת בייבק ודיבידנד` : `Shareholder Yield`}
                        >
                          💰 תשואה
                        </button>
                        <button
                          onClick={() => handleExecuteTool(t, 'portfolio')}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-emerald-900/60 text-emerald-300 text-center font-mono cursor-pointer"
                          title={isHe ? `הוסף לתיק האישי` : `Add to Portfolio`}
                        >
                          💼 תיק
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <div className="text-[10px] text-center text-slate-500 font-mono">
            {isHe ? 'MoatGuard Institutional 2Y v3.2' : 'MoatGuard Institutional 2Y'}
          </div>
        </div>
      )}

    </aside>
  );
};
