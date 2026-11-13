import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Shield, Activity, TrendingUp, DollarSign, Users, AlertTriangle } from 'lucide-react';

export const MethodologyViewer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const sections = [
    { num: 1, title: 'Universe Definition', desc: 'US Companies on NYSE / NASDAQ with Market Cap > $5B (Large/Mega/High-Quality Mid Cap).', cat: 'Universe' },
    { num: 2, title: '5-Year Investment Horizon', desc: 'Evaluation strictly based on 5-year business compounding power, not short-term noise or trading momentum.', cat: 'Strategy' },
    { num: 3, title: 'Moat & Market Power (30%)', desc: 'Switching costs, Network effects, Intangibles (brand/patents), Cost advantages, Efficient scale, and Pricing power.', cat: 'Scoring' },
    { num: 4, title: 'Financial Quality (20%)', desc: 'ROIC vs WACC (>2-3x spread), Gross/Op/Net margins, FCF conversion rate (>100%), and Low Net Debt / EBITDA (<2.5x).', cat: 'Scoring' },
    { num: 5, title: '5-Year Growth Runway (20%)', desc: 'Historical consistency (5Y/10Y CAGR), TAM headroom, market penetration, organic vs M&A breakdown.', cat: 'Scoring' },
    { num: 6, title: 'Per-Share Value Creation (10%)', desc: 'EPS CAGR vs FCF/share CAGR, SBC dilution audit, and disciplined capital allocation.', cat: 'Scoring' },
    { num: 7, title: 'Valuation & Multiples (15%)', desc: 'P/E, EV/FCF, EV/EBITDA, FCF Yield, PEG, historical 5-year percentiles, and growth-adjusted attractiveness.', cat: 'Scoring' },
    { num: 8, title: 'Analyst Expectations & Gap (5%)', desc: 'Consensus EPS/Revenue, revision momentum, price targets, and fundamental expectations gap analysis.', cat: 'Scoring' },
    { num: 9, title: 'Value Trap Detection Engine', desc: 'Zero tolerance for structural declining ROIC, deteriorating FCF conversion, debt spikes, or market share loss.', cat: 'Risk' },
    { num: 10, title: '5-Year Return Scenarios (Bear/Base/Bull)', desc: 'Rigorous 3-case simulation computing 5-year expected CAGR based on revenue growth, margins, and exit multiples.', cat: 'Modeling' },
    { num: 11, title: 'Red Flag Checklist', desc: 'Auditing accounting quality, customer concentration, regulatory headwinds, and key person risks.', cat: 'Risk' },
    { num: 12, title: 'Primary SEC Sourcing Mandate', desc: 'All material financial figures derived directly from SEC 10-K / 10-Q filings with explicit period citations.', cat: 'Compliance' },
    { num: 13, title: 'No Invented Data Rule', desc: 'Strict prohibition of placeholder or hallucinated financial metrics. Transparent distinction between facts and estimates.', cat: 'Compliance' },
    { num: 14, title: 'ROIC Spread Standard', desc: 'ROIC must consistently exceed WACC by a wide margin across full business and interest rate cycles.', cat: 'Scoring' },
    { num: 15, title: 'FCF Conversion Rate Mandate', desc: 'High conversion of Net Income into Free Cash Flow (>100% preferred) confirming earnings quality.', cat: 'Scoring' },
    { num: 16, title: 'Moat Durability & Trend Rating', desc: 'Assessing whether competitive advantages are strengthening, stable, or deteriorating over time.', cat: 'Moat' },
    { num: 17, title: 'Per-Share Compounding Integrity', desc: 'Verifying that high company-level growth actually translates into per-share value rather than being diluted away by SBC.', cat: 'Scoring' },
    { num: 18, title: 'Expectations Gap Identification', desc: 'Capitalizing on mispricings where market consensus underappreciates moat durability or 5-year TAM expansion.', cat: 'Strategy' },
    { num: 19, title: 'TOP 20 Universe Presentation', desc: 'Comprehensive ranked table with 14 standardized institutional columns across the qualifying universe.', cat: 'Output' },
    { num: 20, title: 'TOP 10 High-Conviction Matrix', desc: 'Refined cohort optimizing the multi-variable balance of Quality, Growth, Valuation, and Balance Sheet Risk.', cat: 'Output' },
    { num: 21, title: 'TOP 5 Deep Dive Research Memos', desc: 'Institutional grade investment memos detailing thesis, moats, financial audits, and bear/base/bull models.', cat: 'Output' },
    { num: 22, title: 'Quarterly Monitoring Protocol', desc: 'Systematic quarterly audit tracking Income Statement, Cash Flow, Balance Sheet, and Guidance changes.', cat: 'Monitoring' },
    { num: 23, title: '8-Point Quarterly Thesis Health Score', desc: 'Binary 8-question health evaluation generating a 0-100 ongoing conviction index after every earnings print.', cat: 'Monitoring' },
    { num: 24, title: 'Quarterly Revisions & Sentiment Tracking', desc: 'Monitoring post-earnings consensus estimate revisions and guidance trajectory.', cat: 'Monitoring' },
    { num: 25, title: 'Thesis Break & Exit Conditions', desc: 'Predefined triggers mandating position exit: ROIC < WACC for 2 consecutive quarters, Moat collapse, or extreme leverage.', cat: 'Monitoring' },
    { num: 26, title: 'Peer & Industry Benchmarking', desc: 'Comparative analysis against direct competitors across margins, market share, and unit economics.', cat: 'Scoring' },
    { num: 27, title: 'Capital Allocation Efficiency', desc: 'Evaluating management track record on reinvestment ROIC, disciplined accretive M&A, and buyback timing.', cat: 'Scoring' },
    { num: 28, title: 'Organic Growth Isolation', desc: 'Separating organic growth from debt-fueled M&A to ensure core product vitality and pricing power.', cat: 'Scoring' },
    { num: 29, title: 'Scoring Normalization (0-100)', desc: 'Objective standardized scoring framework ensuring unbiased comparison across varied economic sectors.', cat: 'Scoring' },
    { num: 30, title: 'Final Verdict Rating System', desc: 'Grading scale: A+ (Generational Compounder), A (Core Quality Compounder), B+ (Favorable Compounder), B (Monitor), C (Weak), D (Sell), Reject.', cat: 'Output' },
  ];

  const categories = ['ALL', 'Scoring', 'Moat', 'Output', 'Monitoring', 'Risk', 'Compliance', 'Universe', 'Strategy', 'Modeling'];

  const filteredSections = activeCategory === 'ALL'
    ? sections
    : sections.filter((s) => s.cat === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Master Investment Research Specification — V1.0 (All 30 Sections)
          </h2>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
            Institutional Standard
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete architectural specification defining the mathematical scoring model, SEC primary audit rules, 5-year horizon filters, and quarterly monitoring protocol.
        </p>

        {/* Categories Bar */}
        <div className="mt-4 flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-mono transition ${
                activeCategory === cat
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSections.map((sec) => (
          <div
            key={sec.num}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                Section #{sec.num}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {sec.cat}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">{sec.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
