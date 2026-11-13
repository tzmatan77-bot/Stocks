import React, { useState } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getStockCompetitiveProfile, StockCompetitiveProfile, CompetitorComparison } from '../data/thesisAndCompetitiveData';
import {
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface CompetitiveMapViewerProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

export const CompetitiveMapViewer: React.FC<CompetitiveMapViewerProps> = ({
  stocks,
  selectedStock,
  onOpenDeepDive,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';
  const [selectedTicker, setSelectedTicker] = useState<string>(
    selectedStock?.ticker || stocks[0]?.ticker || 'UNH'
  );

  const rawStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];
  const stock = localizeStock(rawStock, currentLang);
  const profile: StockCompetitiveProfile = getStockCompetitiveProfile(stock);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>{isHe ? 'מפת עליונות תחרותית ואיכות ענפית' : 'Competitive Moat Map & Peer Benchmark'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isHe ? 'השוואת עליונות כלכלית ראש-בראש מול המתחרים המובילים' : 'Head-to-Head Moat Benchmark vs Top Competitors'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isHe
                ? 'ציון חפיר מופשט אינו מספיק – המערכת משווה את מרווחי הרווח, ה-ROIC והתשואה השולית (ROIIC) מול המתחרות הישירות כדי לוודא יתרון בר-קיימא.'
                : 'Abstract moat ratings are backed by hard data: comparing gross margins, ROIC, incremental ROIIC, and market share against direct industry rivals.'}
            </p>
          </div>

          {/* Quick Select Stock Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            {stocks.slice(0, 7).map((s) => (
              <button
                key={s.ticker}
                onClick={() => setSelectedTicker(s.ticker)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedTicker === s.ticker
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <StockLogoBadge ticker={s.ticker} size="sm" />
                <span>{s.ticker}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Quality & Moat Evidence Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Industry Attractiveness */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'איכות ומבנה הענף:' : 'Industry Quality Score:'}</span>
            <span className="text-indigo-400 font-bold">{profile.industryQualityScore}/100</span>
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>{stock.industry}</span>
          </div>
          <div className="text-xs text-slate-400">
            {isHe ? 'סיווג מחזוריות:' : 'Cyclicality:'}{' '}
            <strong className="text-emerald-400">{profile.cyclicality}</strong>
          </div>
        </div>

        {/* Moat Evidence Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'מהימנות ראיות החפיר:' : 'Moat Evidence Confidence:'}</span>
            <span className="text-emerald-400 font-bold">{profile.confidenceScore}/100</span>
          </div>
          <div className="text-lg font-bold text-emerald-300 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>{profile.moatEvidenceQuality} Confidence Audit</span>
          </div>
          <div className="text-xs text-slate-400 truncate">
            {profile.moatEvidenceSummary}
          </div>
        </div>

        {/* 5Y Incremental ROIIC Leader */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'תשואה שולית על הון (ROIIC):' : 'Incremental ROIC (5Y):'}</span>
            <span className="text-cyan-400 font-bold">{profile.incrementalROIC_5Y}</span>
          </div>
          <div className="text-lg font-bold text-cyan-300 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>{isHe ? 'יעילות הקצאת הון עילאית' : 'Elite Capital Allocation'}</span>
          </div>
          <div className="text-xs text-slate-400">
            {isHe ? 'שומרת על פער מרווחים מול המתחרים' : 'Sustained pricing spread vs direct peers'}
          </div>
        </div>
      </div>

      {/* Head to Head Benchmark Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white font-mono">
              {isHe ? `מטריצת תחרות ישירה: ${stock.companyName} מול השוק` : `Direct Peer Benchmark: ${stock.companyName} vs Rivals`}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {isHe ? 'נתוני SEC EDGAR מבוקרים' : 'Audited SEC Filings Benchmark'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">{isHe ? 'חברה' : 'Company'}</th>
                <th className="py-3 px-3">{isHe ? 'מרווח גולמי' : 'Gross Margin'}</th>
                <th className="py-3 px-3">{isHe ? 'מרווח תפעולי' : 'Operating Margin'}</th>
                <th className="py-3 px-3">{isHe ? 'תשואת הון (ROIC)' : 'ROIC (5Y Avg)'}</th>
                <th className="py-3 px-3">{isHe ? 'תשואה שולית (ROIIC)' : 'Incremental ROIIC'}</th>
                <th className="py-3 px-3">{isHe ? 'נתח שוק' : 'Market Share'}</th>
                <th className="py-3 px-3">{isHe ? 'עלויות החלפה' : 'Switching Costs'}</th>
                <th className="py-3 px-3">{isHe ? 'המרת FCF' : 'FCF Conversion'}</th>
                <th className="py-3 px-3 text-right">{isHe ? 'דירוג חפיר' : 'Moat Rating'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profile.competitors.map((peer, idx) => {
                const isTarget = peer.ticker === stock.ticker;
                return (
                  <tr
                    key={peer.name}
                    className={`transition ${
                      isTarget
                        ? 'bg-indigo-950/40 font-bold text-white border-l-2 border-indigo-500'
                        : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2.5">
                      {peer.ticker && <StockLogoBadge ticker={peer.ticker} size="sm" />}
                      <div>
                        <div className="text-white font-bold">{peer.name}</div>
                        {peer.ticker && <div className="text-[10px] text-slate-500">{peer.ticker}</div>}
                      </div>
                      {isTarget && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] border border-indigo-500/40">
                          {isHe ? 'נבחרת' : 'Target'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-200">{peer.grossMargin}</td>
                    <td className={`py-3 px-3 ${isTarget ? 'text-emerald-400 font-extrabold' : 'text-slate-300'}`}>
                      {peer.operatingMargin}
                    </td>
                    <td className={`py-3 px-3 ${isTarget ? 'text-cyan-400 font-extrabold' : 'text-slate-300'}`}>
                      {peer.roic}
                    </td>
                    <td className={`py-3 px-3 ${isTarget ? 'text-indigo-300 font-extrabold' : 'text-slate-400'}`}>
                      {peer.roiic}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{peer.marketShare}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        peer.switchingCosts === 'High'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : peer.switchingCosts === 'Medium'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {peer.switchingCosts}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{peer.fcfConversion}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        peer.moatRating === 'Wide'
                          ? 'bg-emerald-900 text-emerald-200'
                          : peer.moatRating === 'Narrow'
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {peer.moatRating} Moat
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
          <div className="text-slate-400">
            {isHe
              ? 'חברות בעלות מרווח תפעולי גבוה ו-ROIC כפול מהמתחרים מוכיחות כוח תמחור מונופוליסטי.'
              : 'Companies commanding double the ROIC and operating margins of peers possess structural pricing power.'}
          </div>
          <button
            onClick={() => onOpenDeepDive(rawStock)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isHe ? `תזכיר חפיר מלא (${stock.ticker})` : `Open Full Moat Memo`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
