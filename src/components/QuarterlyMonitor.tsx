import React, { useState, useEffect, useCallback } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import {
  Search,
  RefreshCw,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

interface SecQuarter {
  endDate: string;
  quarterLabel: string;
  form: string;
  filingDate: string;
  secUrl: string;
  revenue: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  epsDiluted: number | null;
  operatingCashFlow: number | null;
  capex: number | null;
  freeCashFlow: number | null;
  cash: number | null;
  totalDebt: number | null;
  netDebt: number | null;
  grossMarginPct: number | null;
  operatingMarginPct: number | null;
  netMarginPct: number | null;
  fcfMarginPct: number | null;
  capexPctRevenue: number | null;
  fcfConversionPct: number | null;
  revenueYoY: number | null;
  epsYoY: number | null;
  fcfYoY: number | null;
  opMarginYoYDelta: number | null;
}

interface SecFiling {
  form: string;
  filingDate: string;
  reportDate: string;
  accessionNumber: string;
  description: string;
  secUrl: string;
}

interface SecQuarterlyResponse {
  ticker: string;
  cik: string;
  entityName: string;
  sicDescription: string;
  exchanges: string[];
  filings: SecFiling[];
  quarters: SecQuarter[];
  latestChecks: {
    revenueGrowing: boolean;
    epsRising: boolean;
    marginsHealthyOrExpanding: boolean;
    fcfPositive: boolean;
    debtControlled: boolean;
  } | null;
  source: string;
  fetchedAt: string;
}

interface QuarterAnalysis {
  quarterLabel: string;
  endDate: string;
  score: number;
  headline: string;
  executiveSummary: string;
  profitabilityAndMargins: string;
  capexAndFcfAnalysis: string;
  debtAndBalanceSheet: string;
  bullPoints: string[];
  watchRisks: string[];
  investorVerdict: string;
  source: string;
}

interface QuarterlyMonitorProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  onSelectStock: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

const QUICK_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'UNH', 'AVGO', 'V'];

function formatUsdCompact(val: number | null): string {
  if (val === null || isNaN(val)) return '—';
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  return `${sign}$${abs.toLocaleString()}`;
}

export const QuarterlyMonitor: React.FC<QuarterlyMonitorProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';

  const [activeTicker, setActiveTicker] = useState<string>(
    selectedStock?.ticker || stocks[0]?.ticker || 'NVDA'
  );
  const [tickerInput, setTickerInput] = useState<string>('');
  const [secData, setSecData] = useState<SecQuarterlyResponse | null>(null);
  const [isLoadingSec, setIsLoadingSec] = useState<boolean>(false);
  const [secError, setSecError] = useState<string | null>(null);

  const [selectedQuarterEnd, setSelectedQuarterEnd] = useState<string>('');
  const [analysis, setAnalysis] = useState<QuarterAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [viewSection, setViewSection] = useState<'ALL' | 'FILINGS'>('ALL');

  const analyzeQuarter = useCallback(
    async (ticker: string, endDate?: string) => {
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/sec-quarterly-reports/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ticker, endDate, lang: isHe ? 'he' : 'en' }),
        });
        if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
          const data: QuarterAnalysis = await res.json();
          setAnalysis(data);
        }
      } catch {
        // silent fallback
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isHe]
  );

  const loadSecQuarterlyData = useCallback(
    async (ticker: string) => {
      const clean = ticker.toUpperCase().trim();
      if (!clean) return;

      setIsLoadingSec(true);
      setSecError(null);
      setAnalysis(null);

      try {
        const res = await fetch(`/api/sec-quarterly-reports?ticker=${encodeURIComponent(clean)}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load SEC EDGAR data');
        }
        setSecData(data);
        const firstEnd = data.quarters?.[0]?.endDate || '';
        setSelectedQuarterEnd(firstEnd);

        const match = stocks.find((s) => s.ticker === clean);
        if (match) onSelectStock(match);

        if (firstEnd) {
          analyzeQuarter(clean, firstEnd);
        }
      } catch (err: any) {
        setSecError(err?.message || (isHe ? 'שגיאה במשיכת הדוח מ-SEC EDGAR' : 'Failed to load SEC report'));
      } finally {
        setIsLoadingSec(false);
      }
    },
    [stocks, onSelectStock, analyzeQuarter, isHe]
  );

  useEffect(() => {
    loadSecQuarterlyData(activeTicker);
  }, [activeTicker, loadSecQuarterlyData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tickerInput.trim().toUpperCase();
    if (clean) {
      setActiveTicker(clean);
      setTickerInput('');
    }
  };

  const handleSelectQuarter = (endDate: string) => {
    setSelectedQuarterEnd(endDate);
    analyzeQuarter(activeTicker, endDate);
  };

  const selectedQuarter: SecQuarter | undefined =
    secData?.quarters.find((q) => q.endDate === selectedQuarterEnd) || secData?.quarters[0];

  const renderYoY = (val: number | null) => {
    if (val === null || isNaN(val)) return <span className="text-slate-500">—</span>;
    const isPos = val >= 0;
    return (
      <span className={`font-mono tabular-nums text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPos ? `+${val}%` : `${val}%`} YoY
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & TICKER SEARCH */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-cyan-400 font-medium">
              {isHe ? 'מקור רשמי: SEC EDGAR (10-Q / 10-K / XBRL)' : 'Official Source: SEC EDGAR (10-Q / 10-K / XBRL)'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isHe ? 'דוחות כספיים לכל רבעון וניתוח דוח מלא' : 'Quarterly SEC Reports & Analysis'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isHe
                ? 'שליפה ישירה מהדוחות הרשמיים ברשות ני"ע האמריקאית (SEC): הכנסות, שולי רווח, EPS עולה, CapEx, FCF, חובות וקישור לדוח המלא.'
                : 'Direct SEC EDGAR quarterly statements: Revenue, Margins, Rising EPS, CapEx, FCF, Debt, and direct 10-Q/10-K filing links.'}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 rtl:right-3 ltr:left-3" />
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                placeholder={isHe ? 'חפש כל מניה בארה"ב (NVDA, AAPL)...' : 'Any US ticker (NVDA, AAPL)...'}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingSec || !tickerInput.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isHe ? 'טען דוח' : 'Load SEC'}
            </button>
          </form>
        </div>

        {/* Quick Tickers */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {QUICK_TICKERS.map((tk) => (
            <button
              key={tk}
              onClick={() => setActiveTicker(tk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTicker === tk
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <StockLogoBadge ticker={tk} size="xs" />
              <span>{tk}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error State */}
      {isLoadingSec && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <div className="text-sm font-medium text-white">
            {isHe ? `מושך דוחות רבעוניים מאושרים של ${activeTicker} מתוך SEC EDGAR...` : `Fetching SEC EDGAR 10-Q/10-K filings for ${activeTicker}...`}
          </div>
        </div>
      )}

      {secError && !isLoadingSec && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{secError}</span>
          </div>
          <button
            onClick={() => loadSecQuarterlyData(activeTicker)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
          >
            {isHe ? 'נסה שוב' : 'Retry'}
          </button>
        </div>
      )}

      {/* 2. LOADED SEC DATA & ANALYSIS */}
      {secData && !isLoadingSec && (
        <div className="space-y-6">
          {/* Entity Banner + View Toggle + Official SEC Link */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StockLogoBadge ticker={secData.ticker} name={secData.entityName} size="lg" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold font-mono text-white">{secData.ticker}</span>
                  <span className="text-sm font-medium text-slate-300">{secData.entityName}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  CIK {secData.cik} · {secData.sicDescription || 'US Public Issuer'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setViewSection('ALL')}
                  className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                    viewSection === 'ALL' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isHe ? 'נתונים וניתוח דוח' : 'Metrics & Analysis'}
                </button>
                <button
                  onClick={() => setViewSection('FILINGS')}
                  className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                    viewSection === 'FILINGS' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isHe ? `מסמכי SEC הרשמיים (${secData.filings.length})` : `Official SEC Filings (${secData.filings.length})`}
                </button>
              </div>

              {selectedQuarter?.secUrl && (
                <a
                  href={selectedQuarter.secUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isHe ? `פתח דוח ${selectedQuarter.form} מקורי` : `Open Official ${selectedQuarter.form}`}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {viewSection === 'FILINGS' ? (
            /* Official SEC 10-Q / 10-K / 8-K Filings Table */
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                    <th className="py-3 px-4 text-start">{isHe ? 'סוג דוח' : 'Form'}</th>
                    <th className="py-3 px-4 text-start">{isHe ? 'תאריך הגשה' : 'Filing Date'}</th>
                    <th className="py-3 px-4 text-start">{isHe ? 'תום תקופה' : 'Period End'}</th>
                    <th className="py-3 px-4 text-start">{isHe ? 'תיאור' : 'Description'}</th>
                    <th className="py-3 px-4 text-end">{isHe ? 'קישור רשמי' : 'Document'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
                  {secData.filings.map((f, idx) => (
                    <tr key={`${f.accessionNumber}-${idx}`} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-cyan-300">{f.form}</td>
                      <td className="py-3 px-4 text-slate-200">{f.filingDate}</td>
                      <td className="py-3 px-4 text-slate-400">{f.reportDate}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{f.description || f.form}</td>
                      <td className="py-3 px-4 text-end">
                        <a
                          href={f.secUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-sans font-semibold"
                        >
                          <span>{isHe ? 'צפה בדוח SEC' : 'View Filing'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              {/* Quarter Selector Bar */}
              {secData.quarters.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-xs text-slate-400 shrink-0 font-medium">
                    {isHe ? 'בחר רבעון לצפייה וניתוח:' : 'Select Quarter:'}
                  </span>
                  {secData.quarters.map((q) => (
                    <button
                      key={q.endDate}
                      onClick={() => handleSelectQuarter(q.endDate)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums transition cursor-pointer whitespace-nowrap shrink-0 border ${
                        selectedQuarter?.endDate === q.endDate
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                      }`}
                    >
                      {q.quarterLabel} · {q.endDate.slice(0, 7)}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Quarter Metrics Grid */}
              {selectedQuarter && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Revenue */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
                    <span className="text-xs text-slate-400 block">{isHe ? 'הכנסות רבעון' : 'Revenue'}</span>
                    <div className="text-lg font-bold font-mono tabular-nums text-white">
                      {formatUsdCompact(selectedQuarter.revenue)}
                    </div>
                    <div>{renderYoY(selectedQuarter.revenueYoY)}</div>
                  </div>

                  {/* Rising EPS */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
                    <span className="text-xs text-slate-400 block">{isHe ? 'רווח למניה (EPS)' : 'Diluted EPS'}</span>
                    <div className="text-lg font-bold font-mono tabular-nums text-white">
                      {selectedQuarter.epsDiluted !== null ? `$${selectedQuarter.epsDiluted.toFixed(2)}` : '—'}
                    </div>
                    <div>{renderYoY(selectedQuarter.epsYoY)}</div>
                  </div>

                  {/* Margins */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
                    <span className="text-xs text-slate-400 block">{isHe ? 'שולי רווח' : 'Profit Margins'}</span>
                    <div className="text-lg font-bold font-mono tabular-nums text-cyan-300">
                      {selectedQuarter.operatingMarginPct !== null ? `${selectedQuarter.operatingMarginPct}%` : '—'}{' '}
                      <span className="text-xs font-normal text-slate-400">{isHe ? 'תפעולי' : 'Op.'}</span>
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-400">
                      {isHe ? 'גולמי' : 'Gross'}: {selectedQuarter.grossMarginPct ?? '—'}% · {isHe ? 'נקי' : 'Net'}:{' '}
                      {selectedQuarter.netMarginPct ?? '—'}%
                    </div>
                  </div>

                  {/* CapEx & FCF */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
                    <span className="text-xs text-slate-400 block">{isHe ? 'תזרים חופשי (FCF) ו-CapEx' : 'FCF & CapEx'}</span>
                    <div
                      className={`text-lg font-bold font-mono tabular-nums ${
                        (selectedQuarter.freeCashFlow ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatUsdCompact(selectedQuarter.freeCashFlow)}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-400">
                      CapEx: {formatUsdCompact(selectedQuarter.capex)}
                      {selectedQuarter.capexPctRevenue !== null ? ` (${selectedQuarter.capexPctRevenue}%)` : ''}
                    </div>
                  </div>

                  {/* Debt & Cash */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1 col-span-2 lg:col-span-1">
                    <span className="text-xs text-slate-400 block">{isHe ? 'חובות ומזומנים' : 'Debt & Cash'}</span>
                    <div className="text-lg font-bold font-mono tabular-nums text-white">
                      {selectedQuarter.netDebt !== null
                        ? selectedQuarter.netDebt <= 0
                          ? `+${formatUsdCompact(Math.abs(selectedQuarter.netDebt))} ${isHe ? 'מזומן נטו' : 'Net Cash'}`
                          : `${formatUsdCompact(selectedQuarter.netDebt)} ${isHe ? 'חוב נטו' : 'Net Debt'}`
                        : formatUsdCompact(selectedQuarter.cash)}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-400">
                      {isHe ? 'מזומן' : 'Cash'}: {formatUsdCompact(selectedQuarter.cash)} · {isHe ? 'חוב' : 'Debt'}:{' '}
                      {formatUsdCompact(selectedQuarter.totalDebt)}
                    </div>
                  </div>
                </div>
              )}

              {/* Automated 5-Point Report Check Strip */}
              {secData.latestChecks && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    {[
                      {
                        label: isHe ? 'הכנסות צומחות' : 'Revenue Growing',
                        ok: secData.latestChecks.revenueGrowing,
                      },
                      {
                        label: isHe ? 'רווח עולה (EPS)' : 'Rising EPS',
                        ok: secData.latestChecks.epsRising,
                      },
                      {
                        label: isHe ? 'שוליים בריאים' : 'Healthy Margins',
                        ok: secData.latestChecks.marginsHealthyOrExpanding,
                      },
                      {
                        label: isHe ? 'FCF חיובי אחרי CapEx' : 'Positive FCF',
                        ok: secData.latestChecks.fcfPositive,
                      },
                      {
                        label: isHe ? 'חוב בשליטה' : 'Debt Controlled',
                        ok: secData.latestChecks.debtControlled,
                      },
                    ].map((chk, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {chk.ok ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-slate-200 font-medium">{chk.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI + Quantitative Quarterly Report Analysis */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">
                      {isHe
                        ? `ניתוח הדוח הרבעוני — ${selectedQuarter?.quarterLabel || ''}`
                        : `Quarterly Report Analysis — ${selectedQuarter?.quarterLabel || ''}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {analysis && (
                      <span className="text-xs font-mono tabular-nums text-cyan-300 font-bold">
                        {isHe ? `ציון דוח: ${analysis.score}/100` : `Report Score: ${analysis.score}/100`}
                      </span>
                    )}
                    <button
                      onClick={() => analyzeQuarter(activeTicker, selectedQuarter?.endDate)}
                      disabled={isAnalyzing}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>{isAnalyzing ? (isHe ? 'מנתח...' : 'Analyzing...') : isHe ? 'רענן ניתוח' : 'Re-analyze'}</span>
                    </button>
                  </div>
                </div>

                {isAnalyzing && !analysis ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>{isHe ? 'מנתח את נתוני הדוח (שוליים, CapEx, חובות, FCF ו-EPS)...' : 'Analyzing SEC filing metrics...'}</span>
                  </div>
                ) : analysis ? (
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-base">{analysis.headline}</div>
                      <p className="text-slate-300 leading-relaxed">{analysis.executiveSummary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{isHe ? 'רווחיות, שוליים ו-EPS עולה' : 'Margins & Rising EPS'}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{analysis.profitabilityAndMargins}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>{isHe ? 'השקעות הון (CapEx) ותזרים FCF' : 'CapEx & Free Cash Flow'}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{analysis.capexAndFcfAnalysis}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{isHe ? 'חובות, נזילות ואיתנות מאזן' : 'Debt & Balance Sheet'}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{analysis.debtAndBalanceSheet}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="space-y-1.5">
                        <div className="font-bold text-emerald-400">{isHe ? 'נקודות חוזק בדוח' : 'Key Strengths'}</div>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {analysis.bullPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <div className="font-bold text-amber-400">{isHe ? 'נקודות למעקב וסיכונים' : 'Risks to Watch'}</div>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside">
                          {analysis.watchRisks.map((rk, i) => (
                            <li key={i}>{rk}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 text-xs sm:text-sm">
                      <strong className="text-white">{isHe ? 'שורה תחתונה: ' : 'Bottom Line: '}</strong>
                      <span className="text-cyan-200">{analysis.investorVerdict}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Multi-Quarter Audited Comparison Table */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">
                  {isHe ? 'היסטוריית דוחות רבעוניים (SEC XBRL)' : 'Multi-Quarter SEC History'}
                </h3>
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-x-auto">
                  <table className="w-full text-start text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                        <th className="py-3 px-3 text-start">{isHe ? 'רבעון' : 'Quarter'}</th>
                        <th className="py-3 px-3 text-end">{isHe ? 'הכנסות' : 'Revenue'}</th>
                        <th className="py-3 px-3 text-end">YoY</th>
                        <th className="py-3 px-3 text-end">{isHe ? 'גולמי' : 'Gross %'}</th>
                        <th className="py-3 px-3 text-end">{isHe ? 'תפעולי' : 'Op %'}</th>
                        <th className="py-3 px-3 text-end">EPS</th>
                        <th className="py-3 px-3 text-end">CapEx</th>
                        <th className="py-3 px-3 text-end">FCF</th>
                        <th className="py-3 px-3 text-end">{isHe ? 'חוב נטו' : 'Net Debt'}</th>
                        <th className="py-3 px-3 text-center">{isHe ? 'דוח' : 'Filing'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
                      {secData.quarters.map((q) => {
                        const isSelected = q.endDate === selectedQuarter?.endDate;
                        return (
                          <tr
                            key={q.endDate}
                            onClick={() => handleSelectQuarter(q.endDate)}
                            className={`cursor-pointer transition ${
                              isSelected ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                              {q.quarterLabel}
                              <span className="block text-[10px] font-normal text-slate-500">{q.endDate}</span>
                            </td>
                            <td className="py-2.5 px-3 text-end text-white font-semibold">
                              {formatUsdCompact(q.revenue)}
                            </td>
                            <td className="py-2.5 px-3 text-end">
                              {q.revenueYoY !== null ? (
                                <span className={q.revenueYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                  {q.revenueYoY >= 0 ? `+${q.revenueYoY}%` : `${q.revenueYoY}%`}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-end text-slate-300">
                              {q.grossMarginPct !== null ? `${q.grossMarginPct}%` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-end text-cyan-300">
                              {q.operatingMarginPct !== null ? `${q.operatingMarginPct}%` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-end text-white">
                              {q.epsDiluted !== null ? `$${q.epsDiluted.toFixed(2)}` : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-end text-slate-300">
                              {formatUsdCompact(q.capex)}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-end font-semibold ${
                                (q.freeCashFlow ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {formatUsdCompact(q.freeCashFlow)}
                            </td>
                            <td className="py-2.5 px-3 text-end text-slate-300">
                              {q.netDebt !== null ? formatUsdCompact(q.netDebt) : formatUsdCompact(q.totalDebt)}
                            </td>
                            <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={q.secUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                              >
                                <span>{q.form}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
