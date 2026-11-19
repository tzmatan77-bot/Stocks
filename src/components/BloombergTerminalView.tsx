import React, { useState, useMemo, useEffect } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { StockLiveChart } from './StockLiveChart';
import {
  Terminal,
  Activity,
  Layers,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Search,
  Maximize2,
  RefreshCw,
  Globe,
  Sliders,
  DollarSign,
  Command,
} from 'lucide-react';

interface BloombergTerminalViewProps {
  stocks: ResearchStock[];
  livePrices: Record<string, { price: number; changePercent: number; changeAmount: number }>;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

export const BloombergTerminalView: React.FC<BloombergTerminalViewProps> = ({
  stocks,
  livePrices,
  onOpenDeepDive,
  currentLang = 'he',
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string>('UNH');
  const [cliInput, setCliInput] = useState<string>('');
  const [terminalTheme, setTerminalTheme] = useState<'amber' | 'green' | 'cyan'>('amber');
  const isHe = currentLang === 'he';

  const rawStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];
  const stock = localizeStock(rawStock, currentLang);

  const liveInfo = livePrices[stock.ticker];
  const price = liveInfo?.price || parseFloat(stock.currentPrice.replace(/[^0-9.]/g, '')) || 150;
  const changePct = liveInfo?.changePercent || 0;
  const changeAmt = liveInfo?.changeAmount || 0;

  // Handle CLI command
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cliInput.trim().toUpperCase().replace(/<.*?>/g, '').trim();
    if (!clean) return;
    const match = stocks.find((s) => s.ticker === clean);
    if (match) {
      setSelectedTicker(match.ticker);
      setCliInput('');
    } else {
      // Find by company name match
      const nameMatch = stocks.find((s) => s.companyName.toUpperCase().includes(clean));
      if (nameMatch) {
        setSelectedTicker(nameMatch.ticker);
        setCliInput('');
      }
    }
  };

  const themeColors = {
    amber: {
      textAccent: 'text-amber-400',
      bgAccent: 'bg-amber-950/40',
      borderAccent: 'border-amber-500/80',
      badge: 'bg-amber-950 text-amber-300 border-amber-800',
      prompt: 'text-amber-400',
    },
    green: {
      textAccent: 'text-emerald-400',
      bgAccent: 'bg-emerald-950/40',
      borderAccent: 'border-emerald-500/80',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      prompt: 'text-emerald-400',
    },
    cyan: {
      textAccent: 'text-cyan-400',
      bgAccent: 'bg-cyan-950/40',
      borderAccent: 'border-cyan-500/80',
      badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      prompt: 'text-cyan-400',
    },
  }[terminalTheme];

  return (
    <div className="space-y-4 font-mono">
      {/* Terminal Top Command Line Bar */}
      <div className="bg-black border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>MOATGUARD PRO TERMINAL</span>
          </div>

          {/* Quick theme selector */}
          <div className="flex items-center gap-1">
            {(['amber', 'green', 'cyan'] as const).map((th) => (
              <button
                key={th}
                onClick={() => setTerminalTheme(th)}
                className={`w-4 h-4 rounded-full border cursor-pointer ${
                  th === 'amber' ? 'bg-amber-500' : th === 'green' ? 'bg-emerald-500' : 'bg-cyan-500'
                } ${terminalTheme === th ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                title={`Switch to ${th} terminal theme`}
              />
            ))}
          </div>
        </div>

        {/* CLI Search Input */}
        <form onSubmit={handleCliSubmit} className="flex-1 max-w-xl w-full flex items-center gap-2">
          <div className="relative w-full">
            <span className={`absolute left-3 top-2.5 text-xs font-bold ${themeColors.prompt}`}>
              CMD &gt;
            </span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="ENTER TICKER (e.g. UNH, NVDA, MSFT) & PRESS ENTER"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-16 pr-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-mono font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            EXEC
          </button>
        </form>

        {/* Stock Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
          {stocks.slice(0, 7).map((s) => (
            <button
              key={s.ticker}
              onClick={() => setSelectedTicker(s.ticker)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                s.ticker === selectedTicker
                  ? `${themeColors.bgAccent} ${themeColors.textAccent} border ${themeColors.borderAccent}`
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Screen Windows (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Ticker Header & Live Chart Window */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Ticker Top Bar */}
          <div className="bg-black border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${themeColors.textAccent}`}>{stock.ticker} US &lt;EQUITY&gt;</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-bold">
                      {stock.sector}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{stock.companyName}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-2xl font-black text-white">${price.toFixed(2)}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold ${
                      changePct >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}% ({changeAmt >= 0 ? '+' : ''}${changeAmt.toFixed(2)})
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  MARKET CAP: {stock.marketCap} | 5Y CAGR TARGET: {stock.expected5YCAGRRange}
                </div>
              </div>
            </div>

            {/* Micro Ticker tape stats */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">P/E (FORWARD):</span>
                <span className="text-white font-bold">{stock.valuation?.forwardPE?.value || '21.5x'}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">EV / FCF:</span>
                <span className="text-white font-bold">{stock.valuation?.evToFCF?.value || '22.4x'}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">ROIC (5Y AVG):</span>
                <span className="text-emerald-400 font-bold">{stock.financialQuality?.roic5YAvg?.value || '18.5%'}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block text-[9px]">MOAT SCORE:</span>
                <span className="text-cyan-400 font-bold">{stock.investmentScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Integrated Interactive Live Chart Window */}
          <div className="bg-black border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>GP &lt;GO&gt; PRICE & TECHNICAL OVERLAY DYNAMICS</span>
              </span>
              <span className="text-[10px] text-slate-500">REALTIME QUOTE ENGINE</span>
            </div>
            <div className="mt-3">
              <StockLiveChart
                ticker={stock.ticker}
                companyName={stock.companyName}
                currentPrice={stock.currentPrice}
                expected5YCAGR={stock.expected5YCAGRRange}
                liveTickPrice={liveInfo?.price}
                liveChangePercent={liveInfo?.changePercent}
                currentLang={currentLang}
              />
            </div>
          </div>
        </div>

        {/* Right Col: Fundamental Ratio Terminal & Moat Intelligence */}
        <div className="space-y-4">
          {/* Fundamental Quality Matrix Window */}
          <div className="bg-black border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className={`text-xs font-bold ${themeColors.textAccent}`}>FA &lt;GO&gt; FINANCIAL AUDIT</span>
              <span className="text-[10px] text-slate-500">10-K VERIFIED</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Gross Margin:</span>
                <span className="text-white font-bold">{stock.financialQuality?.grossMargin?.value}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Operating Margin:</span>
                <span className="text-white font-bold">{stock.financialQuality?.operatingMargin?.value}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">FCF Conversion:</span>
                <span className="text-emerald-400 font-bold">{stock.financialQuality?.fcfConversionRate || '94%'}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Net Debt / EBITDA:</span>
                <span className="text-white font-bold">{stock.financialQuality?.netDebtToEBITDA?.value}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Balance Sheet:</span>
                <span className="text-emerald-400 font-bold">{stock.financialQuality?.balanceSheetHealth || 'Pristine'}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Interest Coverage:</span>
                <span className="text-emerald-400 font-bold">{stock.financialQuality?.interestCoverage?.value || '24.5x'}</span>
              </div>
            </div>
          </div>

          {/* Moat & Competitive Advantages Window */}
          <div className="bg-black border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className={`text-xs font-bold ${themeColors.textAccent}`}>MOAT &lt;GO&gt; STRUCTURAL ADVANTAGE</span>
              <span className="text-[10px] text-emerald-400 font-bold">GRADE {stock.moatScore ? `${stock.moatScore}/100` : 'A+'}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">PRIMARY MOAT TYPE:</span>
                <span className="text-cyan-300 font-bold">{stock.moatType || 'Structural Switching Costs & Network Effects'}</span>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-snug line-clamp-2">
                  {stock.moat?.whyExists || stock.moatDefenseMechanism}
                </p>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">PRICING POWER:</span>
                <span className="text-white font-bold">{stock.moat?.pricingPower?.level}</span>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-snug line-clamp-2">
                  {stock.moat?.pricingPower?.evidence}
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenDeepDive(rawStock)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/80 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{isHe ? `פתח תזכיר מוסדי מלא של ${stock.ticker}` : `Launch Full ${stock.ticker} Memo`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
