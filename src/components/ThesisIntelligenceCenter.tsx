import React, { useState, useEffect } from 'react';
import { ResearchStock } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getStockCompetitiveProfile, StockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import {
  FileText,
  ShieldCheck,
  Award,
  BookOpen,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  UserCheck,
  PieChart,
} from 'lucide-react';

interface ThesisIntelligenceCenterProps {
  stocks: ResearchStock[];
  selectedStock?: ResearchStock;
  onOpenDeepDive: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
}

export const ThesisIntelligenceCenter: React.FC<ThesisIntelligenceCenterProps> = ({
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

  // Investment Diary LocalStorage state
  const diaryStorageKey = `moatguard_thesis_diary_${stock.ticker}`;
  const [userThesisNotes, setUserThesisNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem(diaryStorageKey);
    if (savedNotes) {
      setUserThesisNotes(savedNotes);
    } else {
      setUserThesisNotes(
        isHe
          ? `תזה אישית עבור ${stock.companyName} (${stock.ticker}):\n1. חפיר כלכלי מוביל בעל כוח תמחור מוכח.\n2. צמיחה שולית באיכות הון גבוהה (ROIC ${stock.financialQuality.roic5YAvg.value}).\n3. נקודות מעקב ברבעון הבא: שמירה על מרווחים וצמיחה אורגנית.`
          : `Personal Investment Thesis for ${stock.companyName} (${stock.ticker}):\n1. Dominant economic moat with proven pricing power.\n2. High incremental ROIC (${stock.financialQuality.roic5YAvg.value}) and capital-light free cash flow.\n3. Key quarterly watch items: margin preservation and organic volume expansion.`
      );
    }
    setIsSaved(false);
  }, [stock.ticker, isHe]);

  const handleSaveDiary = () => {
    localStorage.setItem(diaryStorageKey, userThesisNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const audit = profile.quarterlyAudit8Q;

  const questions8 = [
    { num: '01', q: isHe ? 'מה קרה בפועל ברבעון החולף?' : 'What happened in the recent quarter?', a: audit.whatHappened, icon: Clock },
    { num: '02', q: isHe ? 'מה הפתיע ביחס לציפיות השוק?' : 'What surprised consensus expectations?', a: audit.whatSurprised, icon: Sparkles },
    { num: '03', q: isHe ? 'מה השתנה במודל העסקי או בהקצאת ההון?' : 'What changed in capital allocation / operations?', a: audit.whatChanged, icon: TrendingUp },
    { num: '04', q: isHe ? 'השפעה על מסלול הריצה לשנתיים (2Y Runway):' : 'Impact on 2-Year Compounding Runway:', a: audit.fiveYearRunwayImpact, icon: Award },
    { num: '05', q: isHe ? 'האם החפיר התחזק או נחלש?' : 'Is the Moat stronger or weaker?', a: `${audit.moatStatus} — ${profile.moatEvidenceSummary}`, icon: ShieldCheck },
    { num: '06', q: isHe ? 'האם התמחור הפך אטרקטיבי יותר או מתוח?' : 'Is Valuation better or worse?', a: `${audit.valuationShift} (Implied growth: ${profile.marketImpliedGrowthRate}%)`, icon: PieChart },
    { num: '07', q: isHe ? 'האם יש לשנות את תזת ההשקעה (2Y Thesis)?' : 'Should the 2-Year Thesis Change?', a: audit.shouldThesisChange, icon: CheckCircle2 },
    { num: '08', q: isHe ? 'מהם הסיגנלים הקריטיים למעקב ברבעון הבא?' : 'Critical items to monitor next quarter:', a: audit.watchNextQuarter, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isHe ? 'מרכז בקרת תזה ומודיעין רבעוני' : 'Thesis Monitor & Quarterly Intelligence'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isHe ? 'בדיקת תוקף תזת ההשקעה ויומן משקיע אישי' : 'Investment Thesis Verification & Investor Diary'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isHe
                ? 'מעקב מתודולוגי מבוסס 8 שאלות מוסדיות לבחינת תזת השנתיים בכל רבעון, מעקב אמינות הנהלה, ומניעת דילול מניות.'
                : 'Quarterly thesis audits via 8 institutional golden questions, guidance credibility tracking, and personal investment diary.'}
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
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
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

      {/* Top 3 Score Cards: Thesis Strength, Management Credibility, Dilution Watch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Thesis Strength Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'חוזק תזת ההשקעה:' : 'Thesis Strength Score:'}</span>
            <span className="text-emerald-400 font-bold">{profile.thesisStrengthScore}/100</span>
          </div>
          <div className="text-xl font-bold text-white flex items-center justify-between">
            <span>{profile.thesisTrend} Thesis</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              {profile.opportunityType}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {isHe ? 'הסיפור הפונדמנטלי שבגללו החברה נבחרה מתקיים במלואו' : 'Core 5-year compounding drivers remain fully intact.'}
          </div>
        </div>

        {/* Management Credibility & Guidance Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'אמינות הנהלה ודיוק תחזיות:' : 'Management Credibility:'}</span>
            <span className="text-cyan-400 font-bold">{profile.guidanceAccuracyScore}/100</span>
          </div>
          <div className="text-xl font-bold text-cyan-300 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <span>{profile.guidanceBeatRate8Q}</span>
          </div>
          <div className="text-xs text-slate-400">
            {isHe ? `פעולה אחרונה: ${profile.lastGuidanceAction}` : `Recent Action: ${profile.lastGuidanceAction}`}
          </div>
        </div>

        {/* Dilution Watch & SBC Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{isHe ? 'בקרת דילול מניות (SBC):' : 'Dilution Watch:'}</span>
            <span className="text-indigo-400 font-bold">SBC: {profile.sbcAsPctRevenue}</span>
          </div>
          <div className="text-xl font-bold text-indigo-300 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            <span>{profile.netShareCountCAGR5Y} {isHe ? 'צמצום נטו' : 'Net/yr'}</span>
          </div>
          <div className="text-xs text-slate-400">
            <strong className="text-emerald-400">{profile.dilutionWatchVerdict}</strong>
          </div>
        </div>
      </div>

      {/* 8-Question Quarterly Institutional Intelligence Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-mono">
              {isHe ? `שמונת מבחני העומק הרבעוניים: ${stock.companyName} (${stock.ticker})` : `8-Question Quarterly Thesis Audit: ${stock.companyName} (${stock.ticker})`}
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
            {isHe ? 'תזה בתוקף מלא ✅' : 'Thesis Validated ✅'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions8.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.num} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px]">
                    {item.num}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-200">{item.q}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pr-6 rtl:pr-0 rtl:pl-6">
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Personal Investment Diary (יומן השקעה אישי) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              {isHe ? `יומן השקעות אישי ובקרת תזה (${stock.ticker})` : `Personal Investment Diary & Thesis Notes (${stock.ticker})`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isHe ? 'נשמר בהצלחה!' : 'Saved!'}</span>
              </span>
            )}
            <button
              onClick={handleSaveDiary}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isHe ? 'שמור יומן' : 'Save Notes'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {isHe
            ? 'תעד כאן את הנימוקים האישיים שלך להחזקת המניה. המערכת שומרת את הרישומים שלך בדפדפן לצורך השוואה מול תוצאות הדוחות הבאים.'
            : 'Document your personal reasoning for owning this stock. Saved locally so you can review your original thesis after future earnings.'}
        </p>

        <textarea
          rows={4}
          value={userThesisNotes}
          onChange={(e) => setUserThesisNotes(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-sans focus:border-cyan-500 focus:outline-none leading-relaxed"
          placeholder={isHe ? 'כתוב כאן את תזת ההשקעה שלך...' : 'Write your investment thesis here...'}
        />
      </div>
    </div>
  );
};
