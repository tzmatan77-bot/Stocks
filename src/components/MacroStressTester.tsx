import React, { useState, useMemo } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import {
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Flame,
  Scale,
} from 'lucide-react';

interface MacroStressTesterProps {
  stocks: ResearchStock[];
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

interface PredefinedScenario {
  id: string;
  nameHe: string;
  nameEn: string;
  descHe: string;
  descEn: string;
  icon: any;
  rateDelta: number; // bps
  gdpGrowthDelta: number; // %
  inflationDelta: number; // %
  usdDelta: number; // %
}

const PREDEFINED_SCENARIOS: PredefinedScenario[] = [
  {
    id: 'hawkish_rates',
    nameHe: 'העלאת ריבית אגרסיבית (+100 נ"ב)',
    nameEn: 'Hawkish Fed (+100bps Rate Hike)',
    descHe: 'ריבית גבוהה לאורך זמן, היוון מחמיר והכבדה על חברות ממונפות.',
    descEn: 'Higher-for-longer policy rates compressing valuation multiples and straining levered balance sheets.',
    icon: Flame,
    rateDelta: 100,
    gdpGrowthDelta: -0.5,
    inflationDelta: 0.8,
    usdDelta: 4.0,
  },
  {
    id: 'global_recession',
    nameHe: 'מיתון עולמי עמוק (-2.5% תוצר)',
    nameEn: 'Deep Global Recession (-2.5% GDP)',
    descHe: 'ירידה בביקושים צרכניים ותעשייתיים; בוחן את אופי הביקוש הקשיח והחפיר.',
    descEn: 'Severe macro demand drop testing pricing power, gross margin defense, and moat necessity.',
    icon: AlertOctagon,
    rateDelta: -75,
    gdpGrowthDelta: -2.5,
    inflationDelta: -1.2,
    usdDelta: -2.0,
  },
  {
    id: 'usd_surge',
    nameHe: 'זינוק בדולר האמריקאי (+12% DXY)',
    nameEn: 'USD Surge / Dollar Shock (+12%)',
    descHe: 'התחזקות חדה בדולר הפוגעת בהכנסות בינלאומיות של תאגידי ענק.',
    descEn: 'Strong USD headwinds on international sales translation and foreign market margins.',
    icon: Globe,
    rateDelta: 50,
    gdpGrowthDelta: -0.2,
    inflationDelta: 0.2,
    usdDelta: 12.0,
  },
  {
    id: 'tariffs_inflation',
    nameHe: 'מכסי מגן ואינפלציית שרשראות אספקה',
    nameEn: 'Supply Chain Tariffs & Trade Shock',
    descHe: 'הטלת מכסים של 20%+, עליית מחירי שינוע ובוחן יכולת העלאת מחירים (Pricing Power).',
    descEn: 'Protectionist tariffs increasing input costs; tests customer lock-in and gross margin retention.',
    icon: Scale,
    rateDelta: 75,
    gdpGrowthDelta: -1.0,
    inflationDelta: 2.5,
    usdDelta: 5.0,
  },
];

export const MacroStressTester: React.FC<MacroStressTesterProps> = ({
  stocks,
  onOpenDeepDive,
  currentLang = 'he',
}) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('hawkish_rates');
  const [customRateBps, setCustomRateBps] = useState<number>(100);
  const [customGdpDelta, setCustomGdpDelta] = useState<number>(-1.0);
  const [customInflationDelta, setCustomInflationDelta] = useState<number>(1.0);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const isHe = currentLang === 'he';

  const selectedScenario = PREDEFINED_SCENARIOS.find((s) => s.id === activeScenarioId) || PREDEFINED_SCENARIOS[0];

  const effectiveRateBps = isCustomMode ? customRateBps : selectedScenario.rateDelta;
  const effectiveGdpDelta = isCustomMode ? customGdpDelta : selectedScenario.gdpGrowthDelta;
  const effectiveInflationDelta = isCustomMode ? customInflationDelta : selectedScenario.inflationDelta;

  // Calculate stress performance for each stock
  const stressResults = useMemo(() => {
    return stocks.filter(Boolean).map((rawStock) => {
      const s = localizeStock(rawStock, currentLang);
      const rawDebtStr = s.financialQuality?.netDebtToEBITDA?.value || '';
      const parsedDebt = parseFloat(rawDebtStr.replace(/[^0-9.-]/g, ''));
      const debtToEbitda = rawDebtStr.toLowerCase().includes('net cash')
        ? -0.5
        : !isNaN(parsedDebt)
        ? parsedDebt
        : 0.5;
      const pricingPower = s.moat?.pricingPower?.level || 'High';
      const parsedGM = parseFloat((s.financialQuality?.grossMargin?.value || '').replace(/[^0-9.-]/g, ''));
      const grossMargin = !isNaN(parsedGM) ? parsedGM : 50;
      const isHealthcareOrDefense =
        s.sector === 'Health Care' || s.sector === 'Healthcare' || s.industry?.includes('Aerospace');
      const isTech = s.sector === 'Information Technology' || s.sector === 'Technology';

      // 1. Rate Impact (Balance sheet net debt + PE compression)
      let rateImpact = -(effectiveRateBps / 100) * (debtToEbitda > 1.5 ? 4.5 : 2.0);
      if (isTech) rateImpact -= (effectiveRateBps / 100) * 2.5; // duration sensitivity

      // 2. GDP Recession Impact
      let gdpImpact = effectiveGdpDelta * (isHealthcareOrDefense ? 0.4 : 1.8);
      if (pricingPower === 'High') gdpImpact *= 0.65; // pricing defense

      // 3. Inflation / Cost Impact
      let inflationImpact = -effectiveInflationDelta * (grossMargin > 60 ? 0.4 : 1.6);
      if (pricingPower === 'High') inflationImpact *= 0.4;

      // Net Estimated Price & Earnings Shock
      const totalEstimatedImpact = Number((rateImpact + gdpImpact + inflationImpact).toFixed(1));

      // Resilience Score (0 to 100)
      const resilienceScore = Math.max(
        15,
        Math.min(98, Math.round(75 + (totalEstimatedImpact * 2.2) + (s.investmentScore * 0.2)))
      );

      return {
        ...s,
        rawStock,
        totalEstimatedImpact,
        resilienceScore,
        rateImpact: Number(rateImpact.toFixed(1)),
        gdpImpact: Number(gdpImpact.toFixed(1)),
        inflationImpact: Number(inflationImpact.toFixed(1)),
        pricingPower,
      };
    }).sort((a, b) => b.resilienceScore - a.resilienceScore);
  }, [stocks, currentLang, effectiveRateBps, effectiveGdpDelta, effectiveInflationDelta]);

  // Average Portfolio Resilience
  const avgResilience = Math.round(
    stressResults.reduce((acc, s) => acc + s.resilienceScore, 0) / (stressResults.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold">
                INSTITUTIONAL STRESS TEST
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <span>{isHe ? 'מבחני לחץ מאקרו ורגישות פיננסית' : 'Macroeconomic Stress Testing & Resilience Engine'}</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isHe
                ? 'סימולציית תרחישי קיצון (העלאות ריבית, מיתון גלובלי, זינוק באינפלציה) לבחינת עמידות החברות ומבנה החוב.'
                : 'Simulate macro shockwaves (rate hikes, stagflation, recessions, tariffs) to test moat durability and balance sheet fortress qualities.'}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isCustomMode
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isHe ? 'התאמת פרמטרים אישית' : 'Custom Shock Sliders'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      {!isCustomMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PREDEFINED_SCENARIOS.map((sc) => {
            const isSelected = activeScenarioId === sc.id;
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-lg ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {isHe ? sc.nameHe : sc.nameEn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {isHe ? sc.descHe : sc.descEn}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{isHe ? 'ריבית:' : 'Rate:'} {sc.rateDelta > 0 ? `+${sc.rateDelta}bps` : `${sc.rateDelta}bps`}</span>
                  <span>{isHe ? 'תוצר:' : 'GDP:'} {sc.gdpGrowthDelta}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Sliders Box if in custom mode */}
      {isCustomMode && (
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-800/80 shadow space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{isHe ? 'הגדרת זעזוע מאקרו מותאם אישית' : 'Custom Macro Shock Parameters'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">{isHe ? 'שינוי ריבית (נ"ב)' : 'Interest Rate Shock'}</span>
                <span className="text-cyan-400 font-bold">
                  {customRateBps > 0 ? `+${customRateBps}` : customRateBps} bps
                </span>
              </div>
              <input
                type="range"
                min="-200"
                max="300"
                step="25"
                value={customRateBps}
                onChange={(e) => setCustomRateBps(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">{isHe ? 'שינוי צמיחת תוצר (GDP)' : 'GDP Growth Shock'}</span>
                <span className="text-cyan-400 font-bold">{customGdpDelta.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="-5"
                max="2"
                step="0.5"
                value={customGdpDelta}
                onChange={(e) => setCustomGdpDelta(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">{isHe ? 'אינפלציה נוספת (%)' : 'Inflation Shock (%)'}</span>
                <span className="text-cyan-400 font-bold">+{customInflationDelta.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.5"
                value={customInflationDelta}
                onChange={(e) => setCustomInflationDelta(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Portfolio Resilience Metric */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {isHe ? 'ציון חוסן יוניברס משוקלל לתרחיש:' : 'Universe Macro Resilience Score:'}
            </div>
            <div className="text-xs text-slate-400">
              {isHe ? 'מבוסס על מבנה הון נקי מחוב, קשיחות ביקושים וכוח תמחור מונפול' : 'Calculated from pristine balance sheets, essential demand inelasticity & high pricing power'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-3xl font-extrabold text-emerald-400">{avgResilience}</span>
          <span className="text-xs text-slate-400">/ 100</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
            {avgResilience >= 80 ? (isHe ? 'חוסן מוסדי גבוה' : 'High Fortress Resilience') : (isHe ? 'עמידות ממוצעת' : 'Moderate Resilience')}
          </span>
        </div>
      </div>

      {/* Ranked Resilience Table */}
      <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900 shadow">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>{isHe ? 'תוצאות מבחן הלחץ לפי מניות' : 'Stock-by-Stock Stress Test Results'}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {isHe ? 'ממוין לפי החברות העמידות ביותר' : 'Ranked by highest resilience'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="py-3 px-4 text-left font-sans font-bold">{isHe ? 'חברה' : 'Company'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'ציון חוסן' : 'Resilience'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'השפעה משוערת' : 'Est. Price Shock'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'רגישות ריבית' : 'Rate Impact'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'רגישות תוצר' : 'GDP Impact'}</th>
                <th className="py-3 px-3 text-center">{isHe ? 'כוח תמחור' : 'Pricing Power'}</th>
                <th className="py-3 px-4 text-right font-sans">{isHe ? 'פעולה' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stressResults.map((s) => {
                const isTopResilience = s.resilienceScore >= 85;
                return (
                  <tr key={s.ticker} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <StockLogoBadge ticker={s.ticker} name={s.companyName} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-cyan-300">{s.ticker}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {s.sector}
                            </span>
                          </div>
                          <div className="text-slate-300 font-sans text-xs truncate max-w-[170px]">
                            {s.companyName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Resilience Score */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                          isTopResilience
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {s.resilienceScore} / 100
                      </span>
                    </td>

                    {/* Total Estimated Impact */}
                    <td
                      className={`py-3 px-3 text-center font-bold text-sm ${
                        s.totalEstimatedImpact >= -3
                          ? 'text-emerald-400'
                          : s.totalEstimatedImpact >= -8
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {s.totalEstimatedImpact > 0 ? `+${s.totalEstimatedImpact}%` : `${s.totalEstimatedImpact}%`}
                    </td>

                    {/* Rate impact */}
                    <td className="py-3 px-3 text-center text-slate-300">{s.rateImpact}%</td>

                    {/* GDP impact */}
                    <td className="py-3 px-3 text-center text-slate-300">{s.gdpImpact}%</td>

                    {/* Pricing power */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.pricingPower === 'High'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.pricingPower}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenDeepDive(s.rawStock)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition text-xs font-mono cursor-pointer"
                      >
                        {isHe ? 'תזכיר ←' : 'Memo →'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
