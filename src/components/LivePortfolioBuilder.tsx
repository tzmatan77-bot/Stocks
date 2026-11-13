import React, { useState, useEffect } from 'react';
import { ResearchStock, PortfolioPosition } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import {
  Briefcase,
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  PieChart as PieIcon,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Edit2,
  Check,
  AlertCircle
} from 'lucide-react';

interface LivePortfolioBuilderProps {
  stocks: ResearchStock[];
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onOpenDeepDive: (stock: ResearchStock) => void;
  onOpenCompare?: (stockA: ResearchStock, stockB: ResearchStock) => void;
}

const STORAGE_KEY = 'INSTITUTIONAL_PORTFOLIO_DATA_V1';

const DEFAULT_POSITIONS: PortfolioPosition[] = [
  {
    id: 'pos-1',
    ticker: 'UNH',
    companyName: 'UnitedHealth Group Inc.',
    shares: 40,
    buyPrice: 485.00,
    targetWeight: 20,
    purchaseDate: '2024-01-15',
    notes: 'Core healthcare moat, Optum pharmacy integration'
  },
  {
    id: 'pos-2',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    shares: 45,
    buyPrice: 395.00,
    targetWeight: 20,
    purchaseDate: '2024-02-10',
    notes: 'Enterprise cloud dominance, Copilot monetization'
  },
  {
    id: 'pos-3',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    shares: 110,
    buyPrice: 165.00,
    targetWeight: 20,
    purchaseDate: '2024-03-01',
    notes: 'Search monopoly, YouTube, GCP growth compounder'
  },
  {
    id: 'pos-4',
    ticker: 'V',
    companyName: 'Visa Inc.',
    shares: 60,
    buyPrice: 270.00,
    targetWeight: 20,
    purchaseDate: '2024-03-15',
    notes: 'Global payment duopoly, high operating margins'
  },
  {
    id: 'pos-5',
    ticker: 'COST',
    companyName: 'Costco Wholesale Corp.',
    shares: 25,
    buyPrice: 810.00,
    targetWeight: 20,
    purchaseDate: '2024-04-05',
    notes: 'Membership model, scale economies shared'
  }
];

export const LivePortfolioBuilder: React.FC<LivePortfolioBuilderProps> = ({
  stocks,
  livePrices,
  onOpenDeepDive,
  onOpenCompare
}) => {
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load portfolio', e);
    }
    return DEFAULT_POSITIONS;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState(stocks[0]?.ticker || 'UNH');
  const [sharesInput, setSharesInput] = useState<string>('20');
  const [buyPriceInput, setBuyPriceInput] = useState<string>('500');
  const [purchaseDateInput, setPurchaseDateInput] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notesInput, setNotesInput] = useState<string>('');

  // Editing row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editShares, setEditShares] = useState<number>(0);
  const [editBuyPrice, setEditBuyPrice] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch (e) {
      console.error('Failed to save portfolio', e);
    }
  }, [positions]);

  // Helper to get current live price of ticker
  const getCurrentPrice = (ticker: string, fallbackStr: string): number => {
    const cleanT = (ticker || '').toUpperCase();
    const live = livePrices[cleanT] || livePrices[ticker];
    if (live && typeof live.price === 'number' && !isNaN(live.price)) {
      return live.price;
    }
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

  // Add position handler
  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = stocks.find((s) => s.ticker === selectedTicker);
    const sharesNum = parseFloat(sharesInput);
    const buyPriceNum = parseFloat(buyPriceInput);

    if (!sharesNum || sharesNum <= 0 || !buyPriceNum || buyPriceNum <= 0) return;

    const newPos: PortfolioPosition = {
      id: `pos-${Date.now()}`,
      ticker: selectedTicker,
      companyName: stock?.companyName || selectedTicker,
      shares: sharesNum,
      buyPrice: buyPriceNum,
      purchaseDate: purchaseDateInput,
      notes: notesInput.trim() || undefined
    };

    setPositions((prev) => [...prev, newPos]);
    setIsAddOpen(false);
    setNotesInput('');
  };

  const handleDeletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStartEdit = (pos: PortfolioPosition) => {
    setEditingId(pos.id);
    setEditShares(pos.shares);
    setEditBuyPrice(pos.buyPrice);
    setEditNotes(pos.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    setPositions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              shares: editShares > 0 ? editShares : p.shares,
              buyPrice: editBuyPrice > 0 ? editBuyPrice : p.buyPrice,
              notes: editNotes
            }
          : p
      )
    );
    setEditingId(null);
  };

  // Quick preset loader
  const loadPreset = (presetName: string) => {
    if (presetName === 'top5') {
      const top5 = stocks.slice(0, 5);
      const newPos = top5.map((s, idx) => ({
        id: `preset-top5-${s.ticker}-${idx}`,
        ticker: s.ticker,
        companyName: s.companyName,
        shares: Math.round(20000 / getCurrentPrice(s.ticker, s.currentPrice)),
        buyPrice: getCurrentPrice(s.ticker, s.currentPrice),
        purchaseDate: new Date().toISOString().slice(0, 10),
        notes: `Rank #${idx + 1} High Conviction Moat (${s.moatScore}/100)`
      }));
      setPositions(newPos);
    } else if (presetName === 'top10') {
      const top10 = stocks.slice(0, 10);
      const newPos = top10.map((s, idx) => ({
        id: `preset-top10-${s.ticker}-${idx}`,
        ticker: s.ticker,
        companyName: s.companyName,
        shares: Math.max(1, Math.round(10000 / getCurrentPrice(s.ticker, s.currentPrice))),
        buyPrice: getCurrentPrice(s.ticker, s.currentPrice),
        purchaseDate: new Date().toISOString().slice(0, 10),
        notes: `Top 10 Universe Equal Weight`
      }));
      setPositions(newPos);
    }
  };

  // Calculations
  let totalCostBasis = 0;
  let totalCurrentValue = 0;
  let totalTodayGain = 0;
  let weightedQualityScore = 0;
  let weightedMoatScore = 0;
  let weighted5YCAGR = 0;

  const positionsDetailed = positions.map((pos) => {
    const stock = stocks.find((s) => s.ticker === pos.ticker);
    const curPrice = getCurrentPrice(pos.ticker, stock?.currentPrice || `$${pos.buyPrice}`);
    const liveChange = getLiveChange(pos.ticker);
    
    const actionFee = typeof pos.actionFee === 'number' ? pos.actionFee : 7.50;
    const cost = (pos.shares * pos.buyPrice) + actionFee; // Includes $7.50 action fee
    const value = pos.shares * curPrice;
    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;
    const todayChangeDollar = pos.shares * liveChange.changeAmount;

    totalCostBasis += cost;
    totalCurrentValue += value;
    totalTodayGain += todayChangeDollar;

    return {
      ...pos,
      actionFee,
      stock,
      curPrice,
      liveChange,
      cost,
      value,
      gainLoss,
      gainLossPercent,
      todayChangeDollar
    };
  });

  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  const todayGainPercent = totalCurrentValue > 0 ? (totalTodayGain / (totalCurrentValue - totalTodayGain)) * 100 : 0;

  // Compute weighted metrics
  positionsDetailed.forEach((p) => {
    if (totalCurrentValue > 0 && p.stock) {
      const weight = p.value / totalCurrentValue;
      weightedQualityScore += (p.stock.investmentScore || 90) * weight;
      weightedMoatScore += (p.stock.moatScore || 90) * weight;
      const cagrNum = parseFloat((p.stock.scenarios?.baseCase?.expectedCAGR || '12%').replace('%', ''));
      weighted5YCAGR += (isNaN(cagrNum) ? 12 : cagrNum) * weight;
    }
  });

  // Sector Breakdown
  const sectorWeights: Record<string, number> = {};
  positionsDetailed.forEach((p) => {
    const sec = p.stock?.sector || 'Other';
    sectorWeights[sec] = (sectorWeights[sec] || 0) + p.value;
  });

  // Export CSV
  const exportPortfolioCSV = () => {
    const headers = ['Ticker', 'Company Name', 'Shares', 'Buy Price ($)', 'Current Price ($)', 'Cost Basis ($)', 'Current Value ($)', 'Unrealized P&L ($)', 'Return (%)', 'Weight (%)', 'Purchase Date', 'Notes'];
    const rows = positionsDetailed.map((p) => [
      p.ticker,
      `"${p.companyName.replace(/"/g, '""')}"`,
      p.shares,
      p.buyPrice.toFixed(2),
      p.curPrice.toFixed(2),
      p.cost.toFixed(2),
      p.value.toFixed(2),
      p.gainLoss.toFixed(2),
      p.gainLossPercent.toFixed(2) + '%',
      (totalCurrentValue > 0 ? ((p.value / totalCurrentValue) * 100).toFixed(2) : '0') + '%',
      p.purchaseDate,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Institutional_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                LIVE PORTFOLIO BUILDER
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Institutional Quality Portfolio &amp; P&amp;L Tracker
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Construct, track, and monitor your active positions in real-time with automatic P&amp;L calculation, weighted Moat scoring, and 5-year compounding trajectory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </button>

            <button
              onClick={exportPortfolioCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <div className="dropdown relative group">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition flex items-center gap-1 border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Presets ▾</span>
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-1 w-52 bg-slate-950 border border-slate-800 rounded-lg shadow-xl p-1 z-20 text-xs font-mono">
                <button
                  onClick={() => loadPreset('top5')}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Load Top 5 Conviction ($100k)
                </button>
                <button
                  onClick={() => loadPreset('top10')}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                >
                  Load Top 10 Equal Weight
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Position Modal / Panel */}
      {isAddOpen && (
        <form
          onSubmit={handleAddPosition}
          className="p-5 bg-slate-900 border border-cyan-800/80 rounded-xl space-y-4 shadow-lg animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Add New Holding to Portfolio</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              Cancel ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {/* Ticker select */}
            <div>
              <label className="text-slate-400 font-mono block mb-1">Company / Ticker:</label>
              <select
                value={selectedTicker}
                onChange={(e) => {
                  setSelectedTicker(e.target.value);
                  const st = stocks.find((s) => s.ticker === e.target.value);
                  if (st) {
                    const cp = getCurrentPrice(st.ticker, st.currentPrice);
                    setBuyPriceInput(cp.toFixed(2));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                {stocks.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} - {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Shares */}
            <div>
              <label className="text-slate-400 font-mono block mb-1">Number of Shares:</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={sharesInput}
                onChange={(e) => setSharesInput(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Buy Price */}
            <div>
              <label className="text-slate-400 font-mono block mb-1">Average Buy Price ($):</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={buyPriceInput}
                onChange={(e) => setBuyPriceInput(e.target.value)}
                placeholder="e.g. 485.50"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-slate-400 font-mono block mb-1">Purchase Date:</label>
              <input
                type="date"
                value={purchaseDateInput}
                onChange={(e) => setPurchaseDateInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-2 rounded-lg transition"
              >
                Save Holding
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono block mb-1 text-xs">Investment Thesis Note (Optional):</label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. High pricing power, durable ROIC > 25%, 5-year compounding hold"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </form>
      )}

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* Total Portfolio Value */}
        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-800/60 shadow space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Portfolio Value</div>
          <div className="text-2xl font-black text-white">
            ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Cost Basis:</span>
            <span className="font-semibold text-slate-300">
              ${totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Unrealized P&L */}
        <div className={`p-4 rounded-xl bg-slate-900 border ${totalGainLoss >= 0 ? 'border-emerald-800/80' : 'border-rose-800/80'} shadow space-y-1`}>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Unrealized P&amp;L</div>
          <div className={`text-2xl font-black flex items-center gap-1.5 ${totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span>
              {totalGainLoss >= 0 ? '+' : '-'}${Math.abs(totalGainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`text-[11px] font-bold ${totalGainLossPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}% Total Return
          </div>
        </div>

        {/* Today's Real-Time Gain/Loss */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Today's Live Change</div>
          <div className={`text-xl font-bold flex items-center gap-1 ${totalTodayGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>
              {totalTodayGain >= 0 ? '+' : '-'}${Math.abs(totalTodayGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs">({todayGainPercent >= 0 ? '+' : ''}{todayGainPercent.toFixed(2)}%)</span>
          </div>
          <div className="text-[10px] text-slate-500">Live ticks &amp; market price updates</div>
        </div>

        {/* Weighted Quality & CAGR */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Weighted Quality Score</div>
          <div className="text-xl font-bold text-cyan-300">
            {weightedQualityScore > 0 ? weightedQualityScore.toFixed(1) : '90.0'}<span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="text-[11px] text-emerald-400">
            Expected 5Y CAGR: ~{weighted5YCAGR > 0 ? weighted5YCAGR.toFixed(1) : '13.5'}%
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900 shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Active Holdings ({positions.length})
            </h3>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Values update automatically with live simulated feed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                <th className="py-3 px-3 text-left">Holding / Ticker</th>
                <th className="py-3 px-3 text-right">Shares</th>
                <th className="py-3 px-3 text-right">Avg Buy ($)</th>
                <th className="py-3 px-3 text-right text-amber-300">Action Fee ($)</th>
                <th className="py-3 px-3 text-right">Live Price ($)</th>
                <th className="py-3 px-3 text-right">Day Chg</th>
                <th className="py-3 px-3 text-right">Market Value</th>
                <th className="py-3 px-3 text-right">Total P&amp;L</th>
                <th className="py-3 px-3 text-right">Weight</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positionsDetailed.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    No holdings in portfolio yet. Click "Add Position" or load a preset to start tracking.
                  </td>
                </tr>
              ) : (
                positionsDetailed.map((p) => {
                  const isEditing = editingId === p.id;
                  const weightPercent = totalCurrentValue > 0 ? (p.value / totalCurrentValue) * 100 : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      {/* Ticker & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <StockLogoBadge ticker={p.ticker} name={p.companyName} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => p.stock && onOpenDeepDive(p.stock)}
                                className="font-bold text-cyan-300 hover:text-cyan-200 text-sm flex items-center gap-1"
                              >
                                <span>{p.ticker}</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </button>
                              {p.stock && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  {p.stock.investmentScore}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {p.companyName}
                            </div>
                          </div>
                        </div>
                        {p.notes && !isEditing && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-[180px] truncate">
                            "{p.notes}"
                          </div>
                        )}
                      </td>

                      {/* Shares */}
                      <td className="py-3 px-3 text-right font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            step="any"
                            value={editShares}
                            onChange={(e) => setEditShares(parseFloat(e.target.value) || 0)}
                            className="w-16 bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-right text-white"
                          />
                        ) : (
                          p.shares.toLocaleString()
                        )}
                      </td>

                      {/* Buy Price */}
                      <td className="py-3 px-3 text-right text-slate-300">
                        {isEditing ? (
                          <input
                            type="number"
                            step="any"
                            value={editBuyPrice}
                            onChange={(e) => setEditBuyPrice(parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-right text-white"
                          />
                        ) : (
                          `$${p.buyPrice.toFixed(2)}`
                        )}
                      </td>

                      {/* Action Fee ($7.50 flat) */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-600/60 px-1.5 py-0.5 rounded text-[11px]">
                          ${p.actionFee.toFixed(2)}
                        </span>
                      </td>

                      {/* Live Price */}
                      <td className="py-3 px-3 text-right font-bold text-white">
                        ${p.curPrice.toFixed(2)}
                      </td>

                      {/* Day Change */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.liveChange.changePercent >= 0
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-rose-950 text-rose-300'
                          }`}
                        >
                          {p.liveChange.changePercent >= 0 ? '+' : ''}
                          {p.liveChange.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Current Value */}
                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        ${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Total P&L */}
                      <td className="py-3 px-3 text-right">
                        <div className={`font-bold ${p.gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.gainLoss >= 0 ? '+' : '-'}${Math.abs(p.gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] ${p.gainLossPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {p.gainLossPercent >= 0 ? '+' : ''}{p.gainLossPercent.toFixed(2)}%
                        </div>
                      </td>

                      {/* Weight % */}
                      <td className="py-3 px-3 text-right font-semibold text-cyan-400">
                        {weightPercent.toFixed(1)}%
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(p.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="Edit holding"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePosition(p.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition"
                            title="Remove holding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Allocation Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <PieIcon className="w-4 h-4 text-cyan-400" />
          <span>Sector Diversification Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-mono">
          {Object.entries(sectorWeights).map(([sector, val]) => {
            const pct = totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0;
            return (
              <div key={sector} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <div className="text-slate-400 text-[11px] truncate" title={sector}>
                  {sector}
                </div>
                <div className="text-base font-bold text-white">{pct.toFixed(1)}%</div>
                <div className="text-[10px] text-slate-500">${Math.round(val).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
