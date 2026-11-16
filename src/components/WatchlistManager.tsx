import React, { useState, useMemo } from 'react';
import { ResearchStock, WatchlistItem, NamedWatchlist } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { MARKET_UNIVERSE_CATALOG } from '../data/marketUniverseData';
import { getResearchStock, resolveTickerSymbol } from '../data/researchStockGenerator';
import { SupportedLanguage } from '../i18n';
import {
  Star,
  Plus,
  Trash2,
  Bell,
  TrendingUp,
  TrendingDown,
  Briefcase,
  CheckCircle2,
  Edit2,
  Check,
  Search,
  BarChart2,
  LayoutGrid,
  List,
  Target,
  FolderPlus,
  Folder,
  X,
  CopyPlus,
} from 'lucide-react';

interface WatchlistManagerProps {
  stocks: ResearchStock[];
  watchlist: WatchlistItem[];
  watchlists?: NamedWatchlist[];
  activeWatchlistId?: string;
  onSelectWatchlist?: (id: string) => void;
  onCreateWatchlist?: (name: string) => void;
  onRenameWatchlist?: (id: string, name: string) => void;
  onDeleteWatchlist?: (id: string) => void;
  onToggleWatchlist: (stock: ResearchStock) => void;
  onUpdateWatchlistItem: (item: WatchlistItem, targetListId?: string) => void;
  onRemoveFromWatchlist: (ticker: string, targetListId?: string) => void;
  onAddFromWatchlistToPortfolio: (stock: ResearchStock, buyPrice: number, shares: number) => void;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onSelectStock?: (stock: ResearchStock) => void;
  onRegisterTickers?: (tickers: string[]) => void;
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number; timestamp?: number }>;
  currentLang?: SupportedLanguage;
}

interface CombinedWatchlistEntry extends WatchlistItem {
  listId: string;
  listName: string;
}

export const WatchlistManager: React.FC<WatchlistManagerProps> = ({
  stocks,
  watchlist,
  watchlists = [],
  activeWatchlistId = 'default',
  onSelectWatchlist,
  onCreateWatchlist,
  onRenameWatchlist,
  onDeleteWatchlist,
  onUpdateWatchlistItem,
  onRemoveFromWatchlist,
  onAddFromWatchlistToPortfolio,
  onOpenDeepDive,
  onSelectStock,
  onRegisterTickers,
  livePrices,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';

  const effectiveWatchlists: NamedWatchlist[] = useMemo(() => {
    if (watchlists.length > 0) return watchlists;
    return [
      {
        id: 'default',
        name: isHe ? 'רשימת מעקב ראשית' : 'Primary Watchlist',
        createdAt: new Date().toISOString().slice(0, 10),
        items: watchlist,
      },
    ];
  }, [watchlists, watchlist, isHe]);

  // Multi-watchlist UI state
  const [showAllCombined, setShowAllCombined] = useState<boolean>(false);
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTrigger, setFilterTrigger] = useState<'ALL' | 'TRIGGER_HIT' | 'STRONG_MOAT'>('ALL');
  const [sortOption, setSortOption] = useState<
    'CHANGE_DESC' | 'CHANGE_ASC' | 'PRICE_DESC' | 'PRICE_ASC' | 'SCORE_DESC' | 'TARGET_GAP_ASC' | 'TICKER_ASC' | 'DEFAULT'
  >('CHANGE_DESC');

  // Add Stock state
  const allAvailableStocks = useMemo(() => {
    const list: Array<{ ticker: string; name: string; score?: number }> = [];
    const seen = new Set<string>();
    stocks.forEach((s) => {
      if (s?.ticker && !seen.has(s.ticker.toUpperCase())) {
        seen.add(s.ticker.toUpperCase());
        list.push({ ticker: s.ticker.toUpperCase(), name: s.companyName, score: s.investmentScore });
      }
    });
    MARKET_UNIVERSE_CATALOG.forEach((m) => {
      if (m?.ticker && !seen.has(m.ticker.toUpperCase())) {
        seen.add(m.ticker.toUpperCase());
        list.push({
          ticker: m.ticker.toUpperCase(),
          name: m.nameHe ? `${m.name} (${m.nameHe})` : m.name,
          score: m.score,
        });
      }
    });
    return list;
  }, [stocks]);

  const [selectedTickerToAdd, setSelectedTickerToAdd] = useState<string>(stocks[0]?.ticker || 'NVDA');
  const [customTickerInput, setCustomTickerInput] = useState<string>('');
  const [targetListIdToAdd, setTargetListIdToAdd] = useState<string>(activeWatchlistId);
  const [targetBuyPriceInput, setTargetBuyPriceInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  // Quick Portfolio Buy Modal
  const [portfolioModalStock, setPortfolioModalStock] = useState<ResearchStock | null>(null);
  const [buyShares, setBuyShares] = useState<number>(20);
  const [buyPrice, setBuyPrice] = useState<number>(100);

  // Edit Item state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Copy stock to another list dropdown
  const [copyingTickerKey, setCopyingTickerKey] = useState<string | null>(null);

  const activeList = effectiveWatchlists.find((w) => w.id === activeWatchlistId) || effectiveWatchlists[0];

  // Items currently displayed (either active list OR all lists combined)
  const displayedRawItems: CombinedWatchlistEntry[] = useMemo(() => {
    if (showAllCombined) {
      const combined: CombinedWatchlistEntry[] = [];
      effectiveWatchlists.forEach((wl) => {
        wl.items.forEach((item) => {
          combined.push({ ...item, listId: wl.id, listName: wl.name });
        });
      });
      return combined;
    }
    return (activeList?.items || []).map((item) => ({
      ...item,
      listId: activeList.id,
      listName: activeList.name,
    }));
  }, [showAllCombined, effectiveWatchlists, activeList]);

  const totalStocksAcrossLists = useMemo(() => {
    const s = new Set<string>();
    effectiveWatchlists.forEach((wl) => wl.items.forEach((i) => s.add(i.ticker.toUpperCase())));
    return s.size;
  }, [effectiveWatchlists]);

  const resolveStock = (ticker: string): ResearchStock => {
    const found = stocks.find((s) => s.ticker.toUpperCase() === ticker.toUpperCase());
    if (found) return found;
    return getResearchStock(ticker);
  };

  const getCurrentPrice = (ticker: string, fallbackStr?: string): number => {
    const cleanT = (ticker || '').toUpperCase();
    const live = livePrices[cleanT] || livePrices[ticker];
    if (live && typeof live.price === 'number' && !isNaN(live.price)) return live.price;
    const clean = parseFloat(String(fallbackStr || '').replace(/[^0-9.]/g, ''));
    return isNaN(clean) ? 100 : clean;
  };

  const getLiveChange = (ticker: string) => {
    const cleanT = (ticker || '').toUpperCase();
    const live = livePrices[cleanT] || livePrices[ticker];
    return {
      price: typeof live?.price === 'number' && !isNaN(live.price) ? live.price : 0,
      changePercent: typeof live?.changePercent === 'number' && !isNaN(live.changePercent) ? live.changePercent : 0,
      changeAmount: typeof live?.changeAmount === 'number' && !isNaN(live.changeAmount) ? live.changeAmount : 0,
    };
  };

  const handleCreateNewListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !onCreateWatchlist) return;
    onCreateWatchlist(newListName.trim());
    setNewListName('');
    setIsCreatingList(false);
    setShowAllCombined(false);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (renameValue.trim() && onRenameWatchlist) {
      onRenameWatchlist(id, renameValue.trim());
    }
    setRenamingListId(null);
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = (customTickerInput.trim() || selectedTickerToAdd).trim();
    const cleanTicker = resolveTickerSymbol(rawInput);
    if (!cleanTicker) return;

    if (onRegisterTickers) {
      onRegisterTickers([cleanTicker]);
    }

    const matchedResearch = resolveStock(cleanTicker);
    const companyName = matchedResearch.companyName || `${cleanTicker} Corporation`;

    const newItem: WatchlistItem = {
      ticker: cleanTicker,
      companyName,
      addedAt: new Date().toISOString().slice(0, 10),
      targetBuyPrice: targetBuyPriceInput ? parseFloat(targetBuyPriceInput) : undefined,
      alertOnThesisBreak: true,
      notes: notesInput.trim() || matchedResearch.whyInTopUniverse || undefined,
    };

    const destId = showAllCombined ? targetListIdToAdd || activeList.id : activeList.id;
    onUpdateWatchlistItem(newItem, destId);
    setCustomTickerInput('');
    setTargetBuyPriceInput('');
    setNotesInput('');
  };

  const handleStartEdit = (entry: CombinedWatchlistEntry) => {
    setEditingKey(`${entry.listId}:${entry.ticker}`);
    setEditTargetPrice(entry.targetBuyPrice || 0);
    setEditNotes(entry.notes || '');
  };

  const handleSaveEdit = (entry: CombinedWatchlistEntry) => {
    onUpdateWatchlistItem(
      {
        ...entry,
        targetBuyPrice: editTargetPrice > 0 ? editTargetPrice : undefined,
        notes: editNotes.trim() || undefined,
      },
      entry.listId
    );
    setEditingKey(null);
  };

  const handleCopyToList = (entry: CombinedWatchlistEntry, destListId: string) => {
    onUpdateWatchlistItem(
      {
        ticker: entry.ticker,
        companyName: entry.companyName,
        addedAt: new Date().toISOString().slice(0, 10),
        targetBuyPrice: entry.targetBuyPrice,
        targetPE: entry.targetPE,
        alertOnThesisBreak: entry.alertOnThesisBreak,
        notes: entry.notes,
      },
      destListId
    );
    setCopyingTickerKey(null);
  };

  const handleOpenStockDetail = (ticker: string) => {
    const resolved = resolveStock(ticker);
    if (onSelectStock) {
      onSelectStock(resolved);
    } else {
      onOpenDeepDive(resolved);
    }
  };

  const handleOpenPortfolioModal = (stock: ResearchStock) => {
    const cp = getCurrentPrice(stock.ticker, stock.currentPrice);
    setPortfolioModalStock(stock);
    setBuyPrice(cp);
    setBuyShares(20);
  };

  const handleConfirmPortfolioBuy = () => {
    if (!portfolioModalStock || buyShares <= 0 || buyPrice <= 0) return;
    onAddFromWatchlistToPortfolio(portfolioModalStock, buyPrice, buyShares);
    setPortfolioModalStock(null);
  };

  let targetTriggeredCount = 0;
  displayedRawItems.forEach((w) => {
    const st = resolveStock(w.ticker);
    const cp = getCurrentPrice(w.ticker, st?.currentPrice || '$0');
    if (w.targetBuyPrice && cp <= w.targetBuyPrice) targetTriggeredCount++;
  });

  const filteredWatchlist = useMemo(() => {
    const filtered = displayedRawItems.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.ticker.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.listName.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));
      if (!matchSearch) return false;

      if (filterTrigger === 'TRIGGER_HIT') {
        const st = resolveStock(item.ticker);
        const cp = getCurrentPrice(item.ticker, st.currentPrice);
        return Boolean(item.targetBuyPrice && cp <= item.targetBuyPrice);
      }
      if (filterTrigger === 'STRONG_MOAT') {
        const st = resolveStock(item.ticker);
        return (st.investmentScore || 0) >= 90;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const stockA = resolveStock(a.ticker);
      const stockB = resolveStock(b.ticker);
      const priceA = getCurrentPrice(a.ticker, stockA?.currentPrice || '$0');
      const priceB = getCurrentPrice(b.ticker, stockB?.currentPrice || '$0');
      const chgA = livePrices[a.ticker]?.changePercent ?? 0;
      const chgB = livePrices[b.ticker]?.changePercent ?? 0;

      switch (sortOption) {
        case 'CHANGE_DESC':
          return chgB - chgA;
        case 'CHANGE_ASC':
          return chgA - chgB;
        case 'PRICE_DESC':
          return priceB - priceA;
        case 'PRICE_ASC':
          return priceA - priceB;
        case 'SCORE_DESC':
          return (stockB?.investmentScore || 90) - (stockA?.investmentScore || 90);
        case 'TARGET_GAP_ASC': {
          const diffA = a.targetBuyPrice ? (priceA - a.targetBuyPrice) / a.targetBuyPrice : 999;
          const diffB = b.targetBuyPrice ? (priceB - b.targetBuyPrice) / b.targetBuyPrice : 999;
          return diffA - diffB;
        }
        case 'TICKER_ASC':
          return a.ticker.localeCompare(b.ticker);
        default:
          return 0;
      }
    });
  }, [displayedRawItems, searchQuery, filterTrigger, livePrices, sortOption]);

  return (
    <div className="space-y-5">
      {/* 1. MULTI-WATCHLIST HEADER & UNLIMITED LISTS SWITCHER */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono tabular-nums">
              {isHe
                ? `${effectiveWatchlists.length} רשימות מעקב · ${totalStocksAcrossLists} מניות סה"כ (ללא הגבלה)`
                : `${effectiveWatchlists.length} Lists · ${totalStocksAcrossLists} Unique Stocks (Unlimited)`}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isHe ? 'רשימות המעקב שלי' : 'My Watchlists'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Target Trigger Filter Button */}
            <button
              onClick={() => setFilterTrigger(filterTrigger === 'TRIGGER_HIT' ? 'ALL' : 'TRIGGER_HIT')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums flex items-center gap-1.5 transition cursor-pointer ${
                filterTrigger === 'TRIGGER_HIT'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHe ? `טריגר יעד (${targetTriggeredCount})` : `Targets Hit (${targetTriggeredCount})`}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isHe ? 'כרטיסים' : 'Cards'}</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{isHe ? 'טבלה' : 'Table'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Unlimited Lists Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          {/* Show All Combined button */}
          {effectiveWatchlists.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllCombined(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border whitespace-nowrap ${
                showAllCombined
                  ? 'bg-indigo-500 text-white border-indigo-400 font-semibold'
                  : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{isHe ? `כל הרשימות יחד (${displayedRawItems.length === totalStocksAcrossLists ? totalStocksAcrossLists : effectiveWatchlists.reduce((a, b) => a + b.items.length, 0)})` : 'All Lists'}</span>
            </button>
          )}

          {/* Individual Named Lists */}
          {effectiveWatchlists.map((wl) => {
            const isSelected = !showAllCombined && wl.id === activeList.id;
            const isRenaming = renamingListId === wl.id;

            if (isRenaming) {
              return (
                <form
                  key={wl.id}
                  onSubmit={(e) => handleRenameSubmit(e, wl.id)}
                  className="flex items-center gap-1 bg-slate-950 border border-cyan-500 rounded-lg px-2 py-1"
                >
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                    className="bg-transparent text-xs text-white focus:outline-none w-32"
                  />
                  <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingListId(null)}
                    className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              );
            }

            return (
              <div
                key={wl.id}
                className={`flex items-center gap-1 rounded-lg border text-xs transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold'
                    : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowAllCombined(false);
                    onSelectWatchlist?.(wl.id);
                    setTargetListIdToAdd(wl.id);
                  }}
                  className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>{wl.name}</span>
                  <span
                    className={`font-mono tabular-nums text-[11px] ${
                      isSelected ? 'text-slate-900/80' : 'text-slate-500'
                    }`}
                  >
                    ({wl.items.length})
                  </span>
                </button>

                {isSelected && (
                  <div className="flex items-center gap-0.5 ltr:pr-1.5 rtl:pl-1.5">
                    {onRenameWatchlist && (
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingListId(wl.id);
                          setRenameValue(wl.name);
                        }}
                        title={isHe ? 'שנה שם רשימה' : 'Rename list'}
                        className="p-1 rounded hover:bg-slate-950/20 text-slate-900 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteWatchlist && effectiveWatchlists.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteWatchlist(wl.id)}
                        title={isHe ? 'מחק רשימה' : 'Delete list'}
                        className="p-1 rounded hover:bg-rose-600/20 text-slate-900 hover:text-rose-950 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Create Unlimited New List */}
          {onCreateWatchlist && (
            isCreatingList ? (
              <form
                onSubmit={handleCreateNewListSubmit}
                className="flex items-center gap-1.5 bg-slate-950 border border-cyan-500 rounded-lg px-2.5 py-1"
              >
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder={isHe ? 'שם רשימה (לדוגמה: AI / דיבידנד)...' : 'New list name...'}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-44"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[11px] font-bold cursor-pointer"
                >
                  {isHe ? 'צור' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingList(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingList(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-dashed border-slate-700 hover:border-cyan-500/60 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isHe ? '+ רשימה חדשה' : '+ New List'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 2. ADD UNLIMITED STOCK TO SELECTED OR ANY WATCHLIST */}
      <form
        onSubmit={handleAddStock}
        className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col lg:flex-row items-end gap-3 text-xs"
      >
        <div className="flex-1 w-full lg:w-auto">
          <label className="text-slate-400 block mb-1">{isHe ? 'בחר מניה מהמאגר:' : 'Select Stock:'}</label>
          <select
            value={selectedTickerToAdd}
            onChange={(e) => {
              setSelectedTickerToAdd(e.target.value);
              setCustomTickerInput('');
              const st = stocks.find((s) => s.ticker === e.target.value);
              if (st) {
                const cp = getCurrentPrice(st.ticker, st.currentPrice);
                setTargetBuyPriceInput((cp * 0.9).toFixed(2));
              } else {
                const live = livePrices[e.target.value]?.price;
                if (live) setTargetBuyPriceInput((live * 0.9).toFixed(2));
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {allAvailableStocks.map((s) => (
              <option key={s.ticker} value={s.ticker}>
                {s.ticker} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-40">
          <label className="text-slate-400 block mb-1">{isHe ? 'או כל טיקר חופשי:' : 'Or Any Ticker:'}</label>
          <input
            type="text"
            placeholder="PLTR, TSLA, AVGO..."
            value={customTickerInput}
            onChange={(e) => setCustomTickerInput(e.target.value.toUpperCase())}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500 uppercase"
          />
        </div>

        {showAllCombined && effectiveWatchlists.length > 1 && (
          <div className="w-full lg:w-44">
            <label className="text-slate-400 block mb-1">{isHe ? 'הוסף לרשימה:' : 'Target List:'}</label>
            <select
              value={targetListIdToAdd}
              onChange={(e) => setTargetListIdToAdd(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {effectiveWatchlists.map((wl) => (
                <option key={wl.id} value={wl.id}>
                  {wl.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full lg:w-28">
          <label className="text-slate-400 block mb-1">{isHe ? 'מחיר יעד ($):' : 'Target ($):'}</label>
          <input
            type="number"
            step="any"
            placeholder="450.00"
            value={targetBuyPriceInput}
            onChange={(e) => setTargetBuyPriceInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex-1 w-full lg:w-auto">
          <label className="text-slate-400 block mb-1">{isHe ? 'הערה:' : 'Note:'}</label>
          <input
            type="text"
            placeholder={isHe ? 'הערת מעקב קצרה...' : 'Optional note...'}
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="w-full lg:w-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>
            {showAllCombined
              ? isHe ? 'הוסף לרשימה' : 'Add to List'
              : isHe ? `הוסף ל-${activeList.name}` : `Add to ${activeList.name}`}
          </span>
        </button>
      </form>

      {/* 3. FILTER & SORT TOOLBAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isHe ? 'סנן לפי טיקר, שם חברה או שם רשימה...' : 'Search ticker, company, or list name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="CHANGE_DESC">{isHe ? 'מיון: עליות יומיות בראש' : 'Day Change: High → Low'}</option>
            <option value="CHANGE_ASC">{isHe ? 'מיון: ירידות יומיות בראש' : 'Day Change: Low → High'}</option>
            <option value="TARGET_GAP_ASC">{isHe ? 'מיון: קרובות למחיר יעד' : 'Closest to Target'}</option>
            <option value="SCORE_DESC">{isHe ? 'מיון: ציון איכות' : 'Quality Score'}</option>
            <option value="PRICE_DESC">{isHe ? 'מיון: מחיר גבוה לנמוך' : 'Price: High → Low'}</option>
            <option value="TICKER_ASC">{isHe ? 'מיון: A-Z' : 'Ticker A-Z'}</option>
            <option value="DEFAULT">{isHe ? 'סדר הוספה' : 'Added Order'}</option>
          </select>

          <button
            type="button"
            onClick={() => setFilterTrigger('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTrigger === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHe ? `הכל (${displayedRawItems.length})` : `All (${displayedRawItems.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterTrigger('STRONG_MOAT')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterTrigger === 'STRONG_MOAT' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isHe ? 'ציון 90+' : 'Score 90+'}
          </button>
        </div>
      </div>

      {/* 4A. CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredWatchlist.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-2">
              <Star className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">
                {isHe ? 'הרשימה ריקה כרגע' : 'This watchlist is empty'}
              </h4>
              <p className="text-xs text-slate-500">
                {isHe ? 'הוסף כל מניה שתרצה באמצעות הטופס למעלה.' : 'Add any ticker using the form above.'}
              </p>
            </div>
          ) : (
            filteredWatchlist.map((entry) => {
              const stock = resolveStock(entry.ticker);
              const curPrice = getCurrentPrice(entry.ticker, stock.currentPrice);
              const liveChange = getLiveChange(entry.ticker);
              const isPositive = liveChange.changePercent >= 0;
              const entryKey = `${entry.listId}:${entry.ticker}`;
              const isEditing = editingKey === entryKey;
              const isCopying = copyingTickerKey === entryKey;

              const targetPrice = entry.targetBuyPrice;
              const isTargetHit = Boolean(targetPrice && curPrice <= targetPrice);
              const discountToTarget = targetPrice ? ((curPrice - targetPrice) / curPrice) * 100 : null;

              const otherLists = effectiveWatchlists.filter(
                (wl) => wl.id !== entry.listId && !wl.items.some((i) => i.ticker === entry.ticker)
              );

              return (
                <div
                  key={entryKey}
                  className={`bg-slate-900/70 hover:bg-slate-900 border rounded-xl p-4 flex flex-col justify-between gap-3 transition ${
                    isTargetHit ? 'border-emerald-500/60' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* List label when viewing all combined */}
                    {showAllCombined && (
                      <div className="text-[11px] font-medium text-indigo-300 flex items-center justify-between">
                        <span>{entry.listName}</span>
                      </div>
                    )}

                    {/* Stock Header + Live Price */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => handleOpenStockDetail(entry.ticker)}
                        className="flex items-center gap-2.5 cursor-pointer group min-w-0"
                      >
                        <StockLogoBadge ticker={entry.ticker} name={entry.companyName} size="md" />
                        <div className="min-w-0">
                          <div className="font-bold font-mono text-base text-white group-hover:text-cyan-300 transition">
                            {entry.ticker}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{entry.companyName}</div>
                        </div>
                      </div>

                      <div className="text-end font-mono tabular-nums shrink-0">
                        <div className="text-base font-bold text-white">${curPrice.toFixed(2)}</div>
                        <div
                          className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>
                            {isPositive ? '+' : ''}
                            {liveChange.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Target Buy Status */}
                    {isTargetHit ? (
                      <div className="text-xs font-mono tabular-nums text-emerald-400 font-semibold flex items-center justify-between py-1.5 border-y border-emerald-500/20">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isHe ? 'יעד קנייה הושג' : 'Buy Target Hit'}
                        </span>
                        <span>${curPrice.toFixed(2)} ≤ ${targetPrice?.toFixed(2)}</span>
                      </div>
                    ) : discountToTarget !== null ? (
                      <div className="text-xs font-mono tabular-nums text-slate-400 flex items-center justify-between py-1.5 border-y border-slate-800/70">
                        <span>{isHe ? `יעד: $${targetPrice?.toFixed(2)}` : `Target: $${targetPrice?.toFixed(2)}`}</span>
                        <span className={discountToTarget > 0 ? 'text-amber-300' : 'text-emerald-400'}>
                          {discountToTarget > 0 ? `+${discountToTarget.toFixed(1)}%` : `${discountToTarget.toFixed(1)}%`}
                        </span>
                      </div>
                    ) : null}

                    {/* Clean Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                      <div>
                        <span className="text-slate-500 block text-[10px]">{isHe ? 'ציון' : 'Score'}</span>
                        <span className="font-semibold text-white">{stock.investmentScore || 90}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">ROIC</span>
                        <span className="font-semibold text-emerald-400">
                          {stock.financialQuality?.roic5YAvg?.value || '22%'}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-slate-500 block text-[10px]">{isHe ? 'צפי 5Y' : '5Y CAGR'}</span>
                        <span className="font-semibold text-cyan-300">
                          {stock.scenarios?.baseCase?.expectedCAGR || '13.5%'}
                        </span>
                      </div>
                    </div>

                    {/* Notes or Inline Editor */}
                    {isEditing ? (
                      <div className="space-y-2 p-2.5 bg-slate-950 rounded-lg border border-cyan-500/60 text-xs">
                        <input
                          type="number"
                          step="any"
                          value={editTargetPrice}
                          onChange={(e) => setEditTargetPrice(parseFloat(e.target.value) || 0)}
                          placeholder={isHe ? 'מחיר יעד ($)' : 'Target Price'}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                        />
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder={isHe ? 'הערה...' : 'Notes...'}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingKey(null)}
                            className="px-2 py-1 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isHe ? 'ביטול' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(entry)}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                          >
                            {isHe ? 'שמור' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : entry.notes ? (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{entry.notes}</p>
                    ) : null}

                    {/* Copy to another list picker */}
                    {isCopying && otherLists.length > 0 && (
                      <div className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs space-y-1.5">
                        <div className="text-slate-400 text-[11px]">{isHe ? 'העתק גם לרשימה:' : 'Copy to list:'}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {otherLists.map((wl) => (
                            <button
                              key={wl.id}
                              type="button"
                              onClick={() => handleCopyToList(entry, wl.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-[11px] font-medium transition cursor-pointer"
                            >
                              + {wl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenStockDetail(entry.ticker)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{isHe ? 'גרף וסיכום' : 'Details'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPortfolioModal(stock)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                        title={isHe ? 'קנה לתיק' : 'Buy'}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{isHe ? 'קנה' : 'Buy'}</span>
                      </button>

                      {otherLists.length > 0 && (
                        <button
                          onClick={() => setCopyingTickerKey(isCopying ? null : entryKey)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                          title={isHe ? 'הוסף לרשימה נוספת' : 'Copy to another list'}
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEdit(entry)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title={isHe ? 'ערוך' : 'Edit'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onRemoveFromWatchlist(entry.ticker, entry.listId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        title={isHe ? 'הסר מרשימה זו' : 'Remove'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4B. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4 text-start">{isHe ? 'מניה' : 'Stock'}</th>
                {showAllCombined && <th className="py-3 px-3 text-start">{isHe ? 'רשימה' : 'List'}</th>}
                <th className="py-3 px-3 text-end">{isHe ? 'מחיר לייב' : 'Price'}</th>
                <th className="py-3 px-3 text-end">{isHe ? 'שינוי יומי' : 'Day Chg'}</th>
                <th className="py-3 px-3 text-end">{isHe ? 'יעד קנייה' : 'Target'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'ציון' : 'Score'}</th>
                <th className="py-3 px-3 text-start hidden lg:table-cell">{isHe ? 'הערה' : 'Notes'}</th>
                <th className="py-3 px-4 text-center">{isHe ? 'פעולות' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
              {filteredWatchlist.map((entry) => {
                const stock = resolveStock(entry.ticker);
                const curPrice = getCurrentPrice(entry.ticker, stock.currentPrice);
                const liveChange = getLiveChange(entry.ticker);
                const isPositive = liveChange.changePercent >= 0;
                const entryKey = `${entry.listId}:${entry.ticker}`;

                return (
                  <tr
                    key={entryKey}
                    onClick={() => handleOpenStockDetail(entry.ticker)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <StockLogoBadge ticker={entry.ticker} name={entry.companyName} size="sm" />
                        <div>
                          <div className="font-bold text-white text-sm">{entry.ticker}</div>
                          <div className="text-[11px] font-sans text-slate-400 truncate max-w-[140px]">
                            {entry.companyName}
                          </div>
                        </div>
                      </div>
                    </td>
                    {showAllCombined && (
                      <td className="py-3 px-3 font-sans text-indigo-300 text-xs">{entry.listName}</td>
                    )}
                    <td className="py-3 px-3 text-end font-semibold text-white">${curPrice.toFixed(2)}</td>
                    <td
                      className={`py-3 px-3 text-end font-semibold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {liveChange.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-end text-slate-300">
                      {entry.targetBuyPrice ? `$${entry.targetBuyPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center text-cyan-300 font-bold">
                      {stock.investmentScore || 90}/100
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-400 text-xs max-w-xs truncate hidden lg:table-cell">
                      {entry.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenPortfolioModal(stock)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-sans cursor-pointer"
                        >
                          {isHe ? 'קנה' : 'Buy'}
                        </button>
                        <button
                          onClick={() => onRemoveFromWatchlist(entry.ticker, entry.listId)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Quick Portfolio Buy Modal */}
      {portfolioModalStock && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>{isHe ? `רכישת ${portfolioModalStock.ticker} לתיק` : `Buy ${portfolioModalStock.ticker}`}</span>
              </h3>
              <button
                onClick={() => setPortfolioModalStock(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">{isHe ? 'כמות מניות:' : 'Shares:'}</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={buyShares}
                  onChange={(e) => setBuyShares(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">{isHe ? 'מחיר ($):' : 'Price ($):'}</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPortfolioModalStock(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                {isHe ? 'ביטול' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmPortfolioBuy}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {isHe ? 'אשר והוסף לתיק' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
