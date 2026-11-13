import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  Calculator,
  Sliders,
  TrendingUp,
  DollarSign,
  Layers,
  ShieldCheck,
  Activity,
  ArrowLeftRight,
  BarChart3,
  FileText,
  PieChart,
  BookOpen,
  Printer,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Compass
} from 'lucide-react';
import { SupportedLanguage, translations } from '../i18n';

interface InstitutionalToolsHubProps {
  onSelectTool: (toolId: string) => void;
  onNavigateHome: () => void;
  currentLang: SupportedLanguage;
}

export const InstitutionalToolsHub: React.FC<InstitutionalToolsHubProps> = ({
  onSelectTool,
  onNavigateHome,
  currentLang
}) => {
  const isHe = currentLang === 'he';
  const t = translations[currentLang] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => [
    {
      id: 'valuation',
      title: isHe ? '📊 מודלים והערכות שווי (Valuation & DCF)' : '📊 Valuation & DCF Models',
      shortLabel: isHe ? 'הערכות שווי ו-DCF' : 'Valuation & DCF',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      tools: [
        {
          id: 'dcf',
          label: t.tabDcf || 'DCF Valuation Calculator',
          icon: Calculator,
          desc: isHe
            ? 'מחשבון שווי הוגן DCF מקצועי לפי תזרימי מזומנים חופשיים, מרווחי ביטחון ותרחישי צמיחה מותאמים אישית.'
            : 'Discounted cash flow fair value model with margin of safety and multi-scenario projections.',
          tag: isHe ? 'שווי הוגן' : 'Fair Value',
          badge: 'DCF'
        },
        {
          id: 'reversedcf',
          label: t.tabReverseDcf || 'Reverse DCF & Expectations',
          icon: Sliders,
          desc: isHe
            ? 'Reverse DCF – בדיקה מדויקת איזו צמיחה שנתית השוק מגלם כרגע במחיר המניה והאם הציפיות מציאותיות.'
            : 'Reverse DCF calculating exact implied growth priced into current market valuation.',
          tag: isHe ? 'ציפיות שוק' : 'Implied Growth',
          badge: 'Reverse DCF'
        },
        {
          id: 'simulator',
          label: t.tabSimulator || '2Y Growth Simulator',
          icon: TrendingUp,
          desc: isHe
            ? 'סימולטור צמיחה לשנתיים (FY2): תרחישי בסיס, שור ודוב למחיר היעד, מכפילי יציאה ותשואה שנתית מצטברת.'
            : '2-year compounding simulator with Bull/Base/Bear scenarios and expected annual returns (FY2).',
          tag: isHe ? 'סימולטור 2Y' : '2Y Forecast',
          badge: '2Y CAGR'
        },
        {
          id: 'yield',
          label: t.tabShareholder || 'Shareholder Yield & Buybacks',
          icon: DollarSign,
          desc: isHe
            ? 'תשואת בעלי מניות כוללת: ניתוח קצב רכישות חוזרות של מניות (Buybacks), תשואת דיבידנד ותזרים חופשי.'
            : 'Total shareholder return analysis: share buybacks, cash dividends, and free cash flow yield.',
          tag: isHe ? 'רכישות חוזרות' : 'Buybacks',
          badge: 'Yield'
        },
      ],
    },
    {
      id: 'moat_risk',
      title: isHe ? '🛡️ ניתוח חפיר תחרותי, סיכונים ומאקרו' : '🛡️ Moat Positioning & Macro Risk',
      shortLabel: isHe ? 'חפיר ומאקרו' : 'Moat & Risk',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      tools: [
        {
          id: 'compmap',
          label: t.tabCompetitiveMap || 'Competitive Moat Map',
          icon: Layers,
          desc: isHe
            ? 'מפת עליונות תחרותית: השוואת חוזק החפיר הכלכלי של החברה (אפקט רשת, עלויות מעבר, מיתוג) מול מתחרותיה.'
            : 'Structural moat positioning matrix vs. direct industry peers across key moat drivers.',
          tag: isHe ? 'חפיר כלכלי' : 'Moat Map',
          badge: 'Moat'
        },
        {
          id: 'thesismonitor',
          label: t.tabThesisMonitor || 'Thesis Monitor & Decision Diary',
          icon: ShieldCheck,
          desc: isHe
            ? 'יומן ובקרת תזה: בדיקת בריאות התזה, התרעות שבירת תזה מוקדמות ויומן קבלת החלטות השקעה מסודר.'
            : 'Thesis tracking diary, early warning triggers, and audited investment decision log.',
          tag: isHe ? 'יומן החלטות' : 'Thesis Health',
          badge: 'Health'
        },
        {
          id: 'macro',
          label: t.tabMacro || 'Macro Stress Testing',
          icon: Activity,
          desc: isHe
            ? 'מבחני לחץ מאקרו: בדיקת עמידות החברה בסביבת ריבית גבוהה, זעזועי אינפלציה, שרשראות אספקה ומיתון.'
            : 'Macroeconomic resilience simulator testing interest rate shocks, inflation, and recession.',
          tag: isHe ? 'מבחן לחץ' : 'Stress Test',
          badge: 'Macro'
        },
        {
          id: 'compare',
          label: t.tabCompare || 'Head-to-Head Compare',
          icon: ArrowLeftRight,
          desc: isHe
            ? 'השוואה ראש בראש: השוואה מעמיקה בין 2 מניות בכל 30 המדדים הפיננסיים, האיכותיים והתמחוריים.'
            : 'Direct side-by-side comparison across all 30 fundamental and valuation criteria.',
          tag: isHe ? 'ראש בראש' : 'Compare',
          badge: 'VS'
        },
      ],
    },
    {
      id: 'financials_terminals',
      title: isHe ? '⚡ מסופים, דוחות כספיים וטבלאות נתונים' : '⚡ Financials, Transcripts & Terminals',
      shortLabel: isHe ? 'מסופים ודוחות' : 'Terminals & Data',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      tools: [
        {
          id: 'terminal',
          label: t.tabTerminal || 'Bloomberg Pro Terminal',
          icon: BarChart3,
          desc: isHe
            ? 'מסוף בלומברג Pro דחוס: סביבת עבודה מקצועית עם תרשימים טכניים, נתוני מסחר ופקודות מקלדת מהירות.'
            : 'Dense command-driven institutional workstation with technical charts and fast hotkeys.',
          tag: isHe ? 'מסוף Pro' : 'Terminal',
          badge: 'Terminal'
        },
        {
          id: 'quarterly',
          label: t.tabQuarterly || 'Quarterly Health Monitor',
          icon: Activity,
          desc: isHe
            ? 'ניטור דוחות רבעוניים: מעקב מגמות הכנסות, מרווח תפעולי, שיעורי רווח והפתעות רווח למניה (EPS).'
            : 'Track quarterly revenue acceleration, gross margin expansion, and EPS surprises.',
          tag: isHe ? 'דוחות רבעוניים' : 'Quarterly',
          badge: '10-Q'
        },
        {
          id: 'earnings',
          label: t.tabEarnings || 'Earnings Calendar & AI Transcripts',
          icon: FileText,
          desc: isHe
            ? 'יומן דוחות כספיים קרובים ותקצירי שיחות ועידה רשמיות באמצעות מודלי AI לזיהוי רמזים ניהוליים.'
            : 'Upcoming earnings dates, AI-generated earnings call transcripts and management sentiment.',
          tag: isHe ? 'שיחות ועידה' : 'Transcripts',
          badge: 'Earnings'
        },
        {
          id: 'top20',
          label: t.tabTop20 || '30 Stocks Full Data Matrix',
          icon: PieChart,
          desc: isHe
            ? 'מטריצת 30 המניות המלאה: גיליון נתונים אינטראקטיבי המציג את כל 30 המדדים במקביל לכל המניות.'
            : 'Complete 30-stock spreadsheet matrix with live sorting across all fundamental criteria.',
          tag: isHe ? 'מטריצת אקסל' : 'Matrix',
          badge: 'Matrix'
        },
      ],
    },
    {
      id: 'methodology_export',
      title: isHe ? '📜 ספר המתודולוגיה וייצוא דוחות' : '📜 Methodology & Export Memos',
      shortLabel: isHe ? 'מתודולוגיה וייצוא' : 'Methodology & PDF',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      tools: [
        {
          id: 'rules',
          label: t.tabRules || '30-Rule Quality Specification',
          icon: BookOpen,
          desc: isHe
            ? 'ספר 30 הכללים המוסדיים: הגדרות מתמטיות מדויקות, ספי איכות וחלוקת משקולות לציון האפיון.'
            : 'Complete 30-rule mathematical formulas, scoring weights, and quality threshold standards.',
          tag: isHe ? '30 הכללים' : 'Rules Spec',
          badge: 'Spec'
        },
        {
          id: 'print',
          label: t.tabPrintMemo || 'Export Institutional PDF Memo',
          icon: Printer,
          desc: isHe
            ? 'ייצוא והדפסת תזכיר מחקר מוסדי מוכן להדפסה או שמירה כ-PDF עם כל הנתונים, הגרפים והניתוחים.'
            : 'Generate ready-to-publish institutional investment memos formatted for print and PDF.',
          tag: isHe ? 'ייצוא PDF' : 'Export PDF',
          badge: 'PDF'
        },
      ],
    },
  ], [isHe, t]);

  const filteredCategories = useMemo(() => {
    let list = categories;
    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.id === selectedCategory);
    }
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list
      .map((cat) => {
        const matchingTools = cat.tools.filter(
          (t) =>
            t.label.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.tag.toLowerCase().includes(q)
        );
        return { ...cat, tools: matchingTools };
      })
      .filter((cat) => cat.tools.length > 0);
  }, [categories, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BANNER: Clean, Professional Hub Header
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isHe ? 'מרכז הכלים המוסדיים • 14 מודלים מתקדמים' : 'Institutional Tools Hub • 14 Professional Models'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {isHe ? 'ארגז הכלים המוסדיים למחקר והערכות שווי' : 'Institutional Toolkit for Research & Valuation'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {isHe
                  ? 'כלים חישוביים מתקדמים למשקיעים מוסדיים: מודלי DCF, סימולטור צמיחה 5Y, ניתוחי חפיר ומאקרו, מסופי נתונים ודוחות כספיים. לחץ על כל כלי לכניסה ישירה.'
                  : 'Advanced institutional modules: DCF valuation models, 5-year compounding simulators, competitive moat positioning, macro stress tests, and financial data terminals.'}
              </p>
            </div>

            {/* Back to Screener Action */}
            <button
              onClick={onNavigateHome}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-sm shrink-0"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>{isHe ? 'חזרה לגלאי מניות השוק' : 'Back to Market Screener'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isHe ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Search and Category Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
            
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isHe ? 'כל 14 הכלים' : 'All 14 Tools'}
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.shortLabel}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30 opacity-80">
                      {cat.tools.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHe ? 'סנן כלי (DCF, מאקרו, דוחות...)' : 'Search tools (DCF, Macro...)'}
                className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. TOOLS GRID: Categorized & Visual
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <p className="text-base text-slate-300">
              {isHe ? 'לא נמצאו כלים מוסדיים התואמים לחיפוש שלך.' : 'No institutional tools matched your search.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              {isHe ? 'איפוס סינון והצגת כל הכלים' : 'Clear filter & show all'}
            </button>
          </div>
        ) : (
          filteredCategories.map((group) => (
            <div key={group.id} className="space-y-4">
              
              {/* Category Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>{group.title}</span>
                </h2>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${group.badgeColor}`}>
                  {group.tools.length} {isHe ? 'כלים' : 'tools'}
                </span>
              </div>

              {/* Tools Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {group.tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => onSelectTool(tool.id)}
                      className="bg-slate-900/90 border border-slate-800/90 hover:border-indigo-400 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-950/30 group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        
                        {/* Top: Icon + Badge */}
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-xl bg-slate-950 text-indigo-400 border border-slate-800 group-hover:border-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                            <ToolIcon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {tool.badge}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                            {tool.label}
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                            {tool.desc}
                          </p>
                        </div>

                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                        <span>{isHe ? 'פתח כלי זה' : 'Open Tool'}</span>
                        <ChevronRight className={`w-4 h-4 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition ${isHe ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}

      </section>

    </div>
  );
};
