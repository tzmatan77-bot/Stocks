import { TopPremarketGainer, PremarketMoveVerdict } from '../types';

export interface PremarketQuantEngineMetrics {
  earlySignalToBreakoutRate: number; // e.g. 71.4%
  falseCatalystDetectionRate: number; // e.g. 96.2%
  averageFadeRateOnThinTraps: number; // e.g. 92.8%
  totalUniverseScanned: number; // 7,840 US stocks
  activeCandidatesTracked: number; // 10
  lastSnapshotTimeEST: string; // "07:25:00 EST"
  providers: {
    discovery: string;
    monitoring: string;
    secEdgar: string;
    llmEngine: string;
  };
}

export const PREMARKET_QUANT_METRICS: PremarketQuantEngineMetrics = {
  earlySignalToBreakoutRate: 71.4,
  falseCatalystDetectionRate: 96.2,
  averageFadeRateOnThinTraps: 92.8,
  totalUniverseScanned: 7840,
  activeCandidatesTracked: 10,
  lastSnapshotTimeEST: '07:25:00 EST',
  providers: {
    discovery: 'Massive / Polygon.io REST Movers Snapshot ($29/mo Starter tier)',
    monitoring: 'Real-Time WebSocket Level-1 Feed (Top Candidates)',
    secEdgar: 'SEC EDGAR 8-K RSS Live Pipeline (Direct Regulatory Wire - Free)',
    llmEngine: 'Gemini AI Quant Catalyst Classifier & Disinformation Filter',
  },
};

export const TOP_10_PREMARKET_GAINERS: TopPremarketGainer[] = [
  {
    rank: 1,
    ticker: 'ARM',
    companyName: 'Arm Holdings plc',
    sector: 'Technology / Semiconductors',
    preMarketPrice: 148.20,
    previousClose: 115.42,
    changePercent: 28.4,
    changeAmount: 32.78,
    preMarketVolume: '4.8M',
    relativeVolume: 19.2,
    liquidityTier: 'HIGH_INSTITUTIONAL',
    
    // v2.0 Quant Additions
    detectionStage: 'CONFIRMED_BREAKOUT',
    fiveMinBucket: {
      currentBucketVolume: '620K',
      historicalBucketBaseline: '32K',
      bucketRvolMultiplier: 19.4,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '1,025M',
    floatTurnoverPct: 0.47,
    fadeProbabilityPct: 8,
    llmEvaluation: {
      score: 97,
      category: 'EARNINGS',
      sourceCredibility: 'SEC_EDGAR_8K',
      credibilityWeight: 0.98,
      llmReasoningHe: 'דוח 8-K רשמי מבוקר המאשר עקיפת רווח של 36% והעלאת תחזית שנתית. נפח דלי 5 דקות גבוה פי 19.4 מהנורמה. סיכון דילול אפסי.',
      shelfOfferingRisk: 'LOW_NONE',
    },
    
    verdict: 'VERIFIED_NEWS',
    hasRealNews: true,
    catalystType: 'EARNINGS_BEAT',
    headlineHe: 'דוחות כספיים פנומנליים: זינוק של 52% בהכנסות מתמלוגי שבבי AI והרחבת הסכם רישוי בלעדי',
    headlineEn: 'Phenomenal Earnings Beat: 52% surge in AI chip licensing royalties and multi-year contract expansion',
    whyItMovedHe: 'ארם הכתה את תחזיות וול סטריט ברווח למניה ב-36% והעלתה את תחזית ההכנסות השנתית ל-4.2 מיליארד דולר, הודות לאימוץ מסיבי של ארכיטקטורת Arm v9 בשרתי ענן מתקדמים (Nvidia Grace, AWS Graviton) ובסמארטפונים מהדור הבא.',
    whyItMovedEn: 'Arm beat consensus EPS estimates by 36% and raised full-year revenue guidance to $4.2B, driven by accelerated enterprise adoption of the v9 architecture across cloud servers and AI smartphones.',
    hasNewsExplanationHe: '✅ כן! חדשה מהותית ורשמית (Verified News): החברה הגישה דוח 8-K רשמי ל-SEC וקיימה שיחת ועידה מוסדית. העלייה מגובה במחזור מסחר ענק של מיליוני מניות מקרנות מוסדיות ובנקים.',
    hasNewsExplanationEn: 'Verified News: Company filed official 8-K with the SEC with massive institutional trading volume confirming fundamental validity.',
    authenticityScore: 98,
    traderAdviceHe: 'מומנטום מוסדי איתן בגיבוי מזומנים אמיתיים. פער מחירים (Gap) מוצדק לחלוטין. מומלץ להמתין למשיכה קלה (Pullback) ב-30 הדקות הראשונות של המסחר ולא לקנות בשיא המיידי.',
    traderAdviceEn: 'Strong institutional conviction backed by real cash flows. Avoid chasing at the premarket spike; wait for opening 30-min price discovery.',
    sourceCiting: 'SEC 8-K Filing & Official Q3 Earnings Release',
  },
  {
    rank: 2,
    ticker: 'VKTX',
    companyName: 'Viking Therapeutics, Inc.',
    sector: 'Healthcare / Biotechnology',
    preMarketPrice: 86.50,
    previousClose: 69.42,
    changePercent: 24.6,
    changeAmount: 17.08,
    preMarketVolume: '3.2M',
    relativeVolume: 14.5,
    liquidityTier: 'HIGH_INSTITUTIONAL',
    
    // v2.0 Quant Additions
    detectionStage: 'CONFIRMED_BREAKOUT',
    fiveMinBucket: {
      currentBucketVolume: '480K',
      historicalBucketBaseline: '34K',
      bucketRvolMultiplier: 14.1,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '110M',
    floatTurnoverPct: 2.91,
    fadeProbabilityPct: 12,
    llmEvaluation: {
      score: 95,
      category: 'BIOPHARMA_CLINICAL',
      sourceCredibility: 'NEWSWIRE_PR',
      credibilityWeight: 0.94,
      llmReasoningHe: 'תוצאות קליניות רשמיות שלב 2 בניסוי כפול-סמיות. ירידה של 15.3% במשקל. מאומת במאגר הניסויים הרפואי. גיוס הון לא צפוי מיידית עקב יתרת מזומן איתנה.',
      shelfOfferingRisk: 'LOW_NONE',
    },

    verdict: 'VERIFIED_NEWS',
    hasRealNews: true,
    catalystType: 'FDA_APPROVAL',
    headlineHe: 'תוצאות קליניות מעולות לשלב 2: גלולת ההרזיה הפומבית הפחיתה 15.3% ממשקל הגוף ללא תופעות לוואי חריגות',
    headlineEn: 'Stellar Phase 2 Clinical Trial: Oral obesity pill VK2735 achieved 15.3% weight reduction with pristine safety',
    whyItMovedHe: 'נתוני הניסוי הקליני בגלולת VK2735 עברו את התרחיש השורי ביותר של וול סטריט, והציגו ירידה דרמטית במשקל עם פרופיל בטיחות מעולה ללא פגיעה במסת שריר.',
    whyItMovedEn: 'Phase 2 trial results for oral VK2735 exceeded Wall Street bull-case expectations, delivering double-digit weight loss with competitive tolerability.',
    hasNewsExplanationHe: '✅ כן! חדשה קלינית דרמטית ומאומתת: פרסום רשמי של נתוני ניסוי שלב 2b בכתב העת הרפואי ובמאגר ה-FDA. אנליסטים מ-BofA ו-JPMorgan מעלים את סיכויי אישור השיווק ל-85%.',
    hasNewsExplanationEn: 'Verified News: Clinical trial data published in medical registry and validated by top biopharma analysts raising approval odds to 85%.',
    authenticityScore: 95,
    traderAdviceHe: 'חדשה מדעית משנת שוק. פוטנציאל גבוה להמשך מומנטום וספקולציית רכישה (M&A target) ע"י ענקיות פארמה כמו פייזר או נוברטיס.',
    traderAdviceEn: 'Legitimate medical breakthrough. High probability of sustained institutional accumulation and takeover speculation.',
    sourceCiting: 'ClinicalTrials.gov & Biopharma Regulatory Wire',
  },
  {
    rank: 3,
    ticker: 'CYBN',
    companyName: 'Cybin Inc.',
    sector: 'Healthcare / Penny Pharma',
    preMarketPrice: 0.425,
    previousClose: 0.349,
    changePercent: 21.8,
    changeAmount: 0.076,
    preMarketVolume: '18.5K',
    relativeVolume: 0.25,
    liquidityTier: 'THIN_DANGEROUS',
    
    // v2.0 Quant Additions
    detectionStage: 'TRAP_DETECTED',
    fiveMinBucket: {
      currentBucketVolume: '1.2K',
      historicalBucketBaseline: '8.5K',
      bucketRvolMultiplier: 0.14,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '28.5M',
    floatTurnoverPct: 0.06,
    fadeProbabilityPct: 96,
    llmEvaluation: {
      score: 11,
      category: 'UNSUBSTANTIATED_PUMP',
      sourceCredibility: 'NONE',
      credibilityWeight: 0.05,
      llmReasoningHe: 'אפס הגשות ב-SEC, אפס הודעות יח"צ. מרווח Bid-Ask רחב של 14%. נזילות דלה במיוחד. לחברה תשקיף מדף פעיל (S-3) וסיכון דילול מיידי.',
      shelfOfferingRisk: 'HIGH_IMMINENT',
    },

    verdict: 'NO_NEWS_FAKE_PUMP',
    hasRealNews: false,
    catalystType: 'THIN_SPREAD_TRAP',
    headlineHe: '⚠️ התראת מלכודת: זינוק של 21.8% ללא שום דיווח, במחזור דליל של 18 אלף מניות בלבד',
    headlineEn: '⚠️ Trap Alert: 21.8% pre-market jump on ZERO news and paper-thin volume (18K shares)',
    whyItMovedHe: 'פקודת מרקט בודדת שנשלחה במרווח קנייה-מכירה (Spread) רחב בשעה 05:20 בבוקר הזניקה את המחיר המוצג. אין שום קונים מוסדיים בספר הפקודות והנזילות דלה ביותר.',
    whyItMovedEn: 'An isolated retail market order crossed an artificially wide bid-ask spread in pre-market hours without any institutional backing.',
    hasNewsExplanationHe: '❌ לא! אין שום חדשה (סתם עולה / מלכודת טרום-מסחר): בדיקה מעמיקה במערכות SEC, בלומברג, רויטרס והודעות החברה מעלה שאין שום דיווח, הודעה לעיתונות או שינוי עסקי. מדובר בעיוות נזילות קלאסי של טרום-מסחר.',
    hasNewsExplanationEn: 'No News (False Pump): Comprehensive scan of SEC filings, Bloomberg, and press releases shows zero material disclosures. Classic pre-market illiquidity artifact.',
    authenticityScore: 14,
    traderAdviceHe: '🚨 סכנת מלכודת פתיחה חמורה! אל תרדוף אחרי המניה בטרום-מסחר. סבירות של מעל 90% לצניחה חזרה ומחיקת כל העלייה מיד בפתיחת המסחר הרציף ב-09:30.',
    traderAdviceEn: 'Dangerous fake pump. Over 90% probability of an immediate flush at the 09:30 regular market open. Do not buy.',
    sourceCiting: 'ללא מקור / עיוות מרווח Bid-Ask דליל בשוק מוקדם',
  },
  {
    rank: 4,
    ticker: 'PLTR',
    companyName: 'Palantir Technologies Inc.',
    sector: 'Technology / Enterprise AI Software',
    preMarketPrice: 44.10,
    previousClose: 38.28,
    changePercent: 15.2,
    changeAmount: 5.82,
    preMarketVolume: '5.4M',
    relativeVolume: 11.8,
    liquidityTier: 'HIGH_INSTITUTIONAL',
    
    // v2.0 Quant Additions
    detectionStage: 'CONFIRMED_BREAKOUT',
    fiveMinBucket: {
      currentBucketVolume: '710K',
      historicalBucketBaseline: '65K',
      bucketRvolMultiplier: 10.9,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '2,080M',
    floatTurnoverPct: 0.26,
    fadeProbabilityPct: 10,
    llmEvaluation: {
      score: 94,
      category: 'CONTRACT',
      sourceCredibility: 'SEC_EDGAR_8K',
      credibilityWeight: 0.95,
      llmReasoningHe: 'זכייה רשמית בהרחבת חוזה משרד ההגנה האמריקאי (DoD). גיבוי מוסדי מסיבי במחזורי ענק. אין סיכון דילול.',
      shelfOfferingRisk: 'LOW_NONE',
    },

    verdict: 'VERIFIED_NEWS',
    hasRealNews: true,
    catalystType: 'MEGA_CONTRACT',
    headlineHe: 'זכייה בחוזה ממשלתי בלעדי של 480 מיליון דולר להרחבת מערכת הבינה המלאכותית הצבאית (AIP)',
    headlineEn: 'Secured landmark $480M US Department of Defense contract expansion for Project Maven & AIP',
    whyItMovedHe: 'משרד ההגנה האמריקאי (DoD) העניק לפלנטיר הרחבה רב-שנתית של פרויקט Maven, לצד הכרזה על שילוב מודלי AI מתקדמים של החברה במערכות נאט"ו.',
    whyItMovedEn: 'The US Department of Defense expanded its contract with Palantir for AI targeting systems and enterprise data orchestration.',
    hasNewsExplanationHe: '✅ כן! חדשה מהותית מאומתת: הודעה רשמית של משרד ההגנה האמריקאי (DoD Contract Award) ואישור ב-SEC. נפח מסחר עצום של מיליוני מניות מעיד על כניסת כסף מוסדי כבד.',
    hasNewsExplanationEn: 'Verified News: Verified DoD contract award announcement and SEC disclosure with heavy institutional volume.',
    authenticityScore: 94,
    traderAdviceHe: 'מניה איכותית בעלת חפיר תוכנה חזק. עליות בגיבוי מחזור מוסדי רחב. מתאים להחזקה ארוכת טווח.',
    traderAdviceEn: 'High-quality software compounder with wide moat. Supported by deep institutional buying.',
    sourceCiting: 'US Department of Defense Contract Awards & Reuters',
  },
  {
    rank: 5,
    ticker: 'FFIE',
    companyName: 'Faraday Future Intelligent Electric',
    sector: 'Consumer Discretionary / EV Penny',
    preMarketPrice: 1.68,
    previousClose: 1.48,
    changePercent: 13.5,
    changeAmount: 0.20,
    preMarketVolume: '890K',
    relativeVolume: 4.2,
    liquidityTier: 'MODERATE',
    
    // v2.0 Quant Additions
    detectionStage: 'EARLY_SIGNAL',
    fiveMinBucket: {
      currentBucketVolume: '115K',
      historicalBucketBaseline: '28K',
      bucketRvolMultiplier: 4.1,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '43.8M',
    floatTurnoverPct: 2.03,
    fadeProbabilityPct: 78,
    llmEvaluation: {
      score: 30,
      category: 'UNSUBSTANTIATED_PUMP',
      sourceCredibility: 'SOCIAL_RETAIL',
      credibilityWeight: 0.25,
      llmReasoningHe: 'ציוצים ויראליים ברשת X ופורומי Reddit. שום שינוי בדו"חות הכספיים. יתרת מזומנים נמוכה במיוחד וסיכון גבוה להנפקת מניות מדללת (ATM).',
      shelfOfferingRisk: 'HIGH_IMMINENT',
    },

    verdict: 'SPECULATIVE_MOMENTUM',
    hasRealNews: false,
    catalystType: 'SOCIAL_RETAIL_BUZZ',
    headlineHe: '⚠️ באזז ברשתות החברתיות ופוסטים ברדיט (Reddit) על שורט סקוויז ללא שינוי פונדמנטלי',
    headlineEn: '⚠️ Meme stock retail buzz on Reddit & X pushing short squeeze narrative without fundamentals',
    whyItMovedHe: 'תנועת קמעונאים מרוכזת בפורומים של מסחר במניות מם, בעקבות ציוץ ויראלי של משקיע ברשת X על שיעור שורט גבוה.',
    whyItMovedEn: 'Coordinated retail message board chatter amplifying a short squeeze angle following viral social media posts.',
    hasNewsExplanationHe: '⚠️ אין חדשה עסקית אמיתית (מומנטום ספקולטיבי): אין שום דיווח כספי, אין השקעה חדשה ואין שיפור במצב התזרימי הקשה של החברה. העלייה מונעת מספקולציה טהורה של סוחרים קמעונאיים.',
    hasNewsExplanationEn: 'Speculative Momentum (No Fundamental News): No cash infusion, no audited improvement in operations. Pure speculative momentum.',
    authenticityScore: 32,
    traderAdviceHe: 'תנודתיות קיצונית ביותר. מתאים אך ורק לסוחרי יום מנוסים עם ניהול סיכונים הדוק. לא מתאים להשקעה מוסדית או לטווח ארוך.',
    traderAdviceEn: 'High volatility casino play. Only suitable for nimble day traders with tight stops; avoid for long-term investing.',
    sourceCiting: 'Reddit / StockTwits Social Sentiment Monitor',
  },
  {
    rank: 6,
    ticker: 'CRWD',
    companyName: 'CrowdStrike Holdings, Inc.',
    sector: 'Technology / Cybersecurity',
    preMarketPrice: 348.50,
    previousClose: 312.80,
    changePercent: 11.4,
    changeAmount: 35.70,
    preMarketVolume: '1.8M',
    relativeVolume: 6.5,
    liquidityTier: 'HIGH_INSTITUTIONAL',
    
    // v2.0 Quant Additions
    detectionStage: 'CONFIRMED_BREAKOUT',
    fiveMinBucket: {
      currentBucketVolume: '230K',
      historicalBucketBaseline: '35K',
      bucketRvolMultiplier: 6.6,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '238M',
    floatTurnoverPct: 0.76,
    fadeProbabilityPct: 11,
    llmEvaluation: {
      score: 91,
      category: 'ANALYST_ACTION',
      sourceCredibility: 'TIER1_RESEARCH',
      credibilityWeight: 0.92,
      llmReasoningHe: 'שדרוג כפול של מורגן סטנלי ל-Overweight עם מחיר יעד $390. אישורי שימור לקוחות מעל 96%. ללא סיכון דילול.',
      shelfOfferingRisk: 'LOW_NONE',
    },

    verdict: 'VERIFIED_NEWS',
    hasRealNews: true,
    catalystType: 'TIER1_ANALYST_UPGRADE',
    headlineHe: 'מורגן סטנלי מעלה המלצה ל-Overweight עם מחיר יעד $390: "קצב חידוש החוזים וה-ARR גבוה מהצפוי"',
    headlineEn: 'Morgan Stanley double-upgrades to Overweight with $390 price target on enterprise retention resilience',
    whyItMovedHe: 'אנליסט אבטחת הענן המוביל במורגן סטנלי פרסם דוח מקיף המראה כי למעלה מ-96% מלקוחות האנטרפרייז חידשו את החוזים הרב-שנתיים בפלטפורמת Falcon, ושולי הרווח התפעולי מתרחבים.',
    whyItMovedEn: 'Tier-1 analyst report highlights 96%+ gross retention and accelerating customer adoption of next-gen Falcon security modules.',
    hasNewsExplanationHe: '✅ כן! חדשה מוסדית מאומתת: שדרוג רשמי של בנק השקעות מוביל מדרג ראשון (Morgan Stanley) עם עדכון מודל DCF ותחזית רווח מפורטת.',
    hasNewsExplanationEn: 'Verified Institutional Catalyst: Comprehensive Wall Street bulge bracket research upgrade with updated DCF and earnings models.',
    authenticityScore: 90,
    traderAdviceHe: 'אישור מוסדי להתאוששות פונדמנטלית מהירה. המניה חוזרת למגמת צמיחה ארוכת טווח.',
    traderAdviceEn: 'Institutional green light confirming strong competitive moat and resilient customer lifetime value.',
    sourceCiting: 'Morgan Stanley Institutional Equity Research Note',
  },
  {
    rank: 7,
    ticker: 'KULR',
    companyName: 'KULR Technology Group',
    sector: 'Technology / Energy Storage',
    preMarketPrice: 0.29,
    previousClose: 0.264,
    changePercent: 9.8,
    changeAmount: 0.026,
    preMarketVolume: '22K',
    relativeVolume: 0.4,
    liquidityTier: 'THIN_DANGEROUS',
    
    // v2.0 Quant Additions
    detectionStage: 'TRAP_DETECTED',
    fiveMinBucket: {
      currentBucketVolume: '1.8K',
      historicalBucketBaseline: '5.2K',
      bucketRvolMultiplier: 0.35,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '142M',
    floatTurnoverPct: 0.02,
    fadeProbabilityPct: 94,
    llmEvaluation: {
      score: 15,
      category: 'UNSUBSTANTIATED_PUMP',
      sourceCredibility: 'NONE',
      credibilityWeight: 0.08,
      llmReasoningHe: 'אפס דיווחים. מחזור זניח של 22K מניות. פער ארטיפקט במרווח Bid-Ask. היסטוריה של הנפקות דילול חוזרות.',
      shelfOfferingRisk: 'HIGH_IMMINENT',
    },

    verdict: 'NO_NEWS_FAKE_PUMP',
    hasRealNews: false,
    catalystType: 'THIN_SPREAD_TRAP',
    headlineHe: '⚠️ "סתם עולה" - מחזור מסחר זניח של 22 אלף מניות ללא כל הודעה או שינוי עסקי',
    headlineEn: '⚠️ Fake Move: 9.8% uptick on negligible volume of 22K shares with zero catalysts',
    whyItMovedHe: 'תנודה טכנית אקראית שנגרמה מסגירת פקודת לימיט בודדת בשוק דק מאוד של טרום-מסחר ללא השתתפות שוק רחבה.',
    whyItMovedEn: 'Random tick caused by an isolated limit fill in an illiquid early book with virtually no volume.',
    hasNewsExplanationHe: '❌ לא, אין שום חדשה (Fake Move / No News): שום מקור רשמי, אין הודעת דיווח ואין שינוי בפעילות. הציטוט מייצג פער מלאכותי שאינו נתמך בנפח אמיתי.',
    hasNewsExplanationEn: 'No News: Zero filings, zero news wires. Pure illiquidity artifact in low-volume microcap pre-market.',
    authenticityScore: 18,
    traderAdviceHe: 'מלכודת אופיינית למניות Penny Stocks בשעות המוקדמות. הימנע מקנייה נמהרת.',
    traderAdviceEn: 'Classic micro-cap morning trap. Avoid chasing.',
    sourceCiting: 'ללא מקור / מחזור מסחר אפסי',
  },
  {
    rank: 8,
    ticker: 'NVDA',
    companyName: 'Nvidia Corporation',
    sector: 'Technology / AI Computing',
    preMarketPrice: 128.80,
    previousClose: 120.15,
    changePercent: 7.2,
    changeAmount: 8.65,
    preMarketVolume: '7.8M',
    relativeVolume: 8.4,
    liquidityTier: 'HIGH_INSTITUTIONAL',
    
    // v2.0 Quant Additions
    detectionStage: 'CONFIRMED_BREAKOUT',
    fiveMinBucket: {
      currentBucketVolume: '940K',
      historicalBucketBaseline: '110K',
      bucketRvolMultiplier: 8.5,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '24,500M',
    floatTurnoverPct: 0.03,
    fadeProbabilityPct: 5,
    llmEvaluation: {
      score: 99,
      category: 'CONTRACT',
      sourceCredibility: 'SEC_EDGAR_8K',
      credibilityWeight: 0.99,
      llmReasoningHe: 'אישור אספקות Blackwell ראשונות לענקיות הענן. שרשרת אספקה מאושרת מול TSMC. נזילות מוסדית עולמית מהדרג העליון.',
      shelfOfferingRisk: 'LOW_NONE',
    },

    verdict: 'VERIFIED_NEWS',
    hasRealNews: true,
    catalystType: 'MEGA_CONTRACT',
    headlineHe: 'אישור אספקה מוקדמת של שרתי Blackwell NVL72 למיקרוסופט ו-AWS בהיקף של מיליארדי דולרים',
    headlineEn: 'Confirmed initial volume shipments of Blackwell NVL72 rack-scale systems to Microsoft and AWS',
    whyItMovedHe: 'הנהלת החברה אישרה כי מערכות Blackwell החלו להימסר למרכזי הנתונים של ענקיות הענן וכי הביקוש ממשיך לגבור על ההיצע בעשרות מונים.',
    whyItMovedEn: 'Management confirmed early customer deliveries of flagship Blackwell architecture with hyperscalers fully absorbing allocation.',
    hasNewsExplanationHe: '✅ כן! חדשה מהותית רשמית ומאומתת: הודעה רשמית של החברה בכנס מפתחים בינלאומי, בליווי אישורי שרשרת אספקה מ-TSMC.',
    hasNewsExplanationEn: 'Verified News: Official company announcement validated by supply chain partners and customer capex disclosures.',
    authenticityScore: 99,
    traderAdviceHe: 'נכס איכות מובהק. עלייה בריאה עם מחזור ענק של מוסדיים שמבטיח יציבות.',
    traderAdviceEn: 'Tier-1 institutional compounder. Strong and durable pre-market gap with broad liquidity support.',
    sourceCiting: 'Nvidia Official Keynote & Bloomberg Terminal',
  },
  {
    rank: 9,
    ticker: 'SMCI',
    companyName: 'Super Micro Computer, Inc.',
    sector: 'Technology / Server Hardware',
    preMarketPrice: 45.20,
    previousClose: 42.32,
    changePercent: 6.8,
    changeAmount: 2.88,
    preMarketVolume: '2.1M',
    relativeVolume: 3.8,
    liquidityTier: 'MODERATE',
    
    // v2.0 Quant Additions
    detectionStage: 'EARLY_SIGNAL',
    fiveMinBucket: {
      currentBucketVolume: '280K',
      historicalBucketBaseline: '72K',
      bucketRvolMultiplier: 3.9,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '58.5M',
    floatTurnoverPct: 3.59,
    fadeProbabilityPct: 58,
    llmEvaluation: {
      score: 45,
      category: 'UNSUBSTANTIATED_PUMP',
      sourceCredibility: 'SOCIAL_RETAIL',
      credibilityWeight: 0.42,
      llmReasoningHe: 'שמועות בשוק לגבי מינוי רואה חשבון חדש. עדיין אין טופס 8-K רשמי מאושר. תנועה מעורבת משורט סקוויז.',
      shelfOfferingRisk: 'MODERATE',
    },

    verdict: 'SPECULATIVE_MOMENTUM',
    hasRealNews: false,
    catalystType: 'SHORT_SQUEEZE',
    headlineHe: 'סגירת פוזיציות שורט (Short Covering) ושמועות על התקדמות בבדיקת רואי החשבון',
    headlineEn: 'Aggressive short covering and market speculation regarding delayed annual 10-K audit filing',
    whyItMovedHe: 'לאחר גל ירידות חד, סוחרים סוגרים פוזיציות שורט בעקבות שמועות בשוק על מינוי פירמת רואי חשבון בינלאומית חדשה.',
    whyItMovedEn: 'Traders buying back shares to cover short exposure amid unconfirmed rumors of auditor appointment.',
    hasNewsExplanationHe: '⚠️ חדשות חלקיות/ספקולטיביות ללא אישור רשמי: אין עדיין הגשה מאושרת של דוח ה-10-K השנתי. התנועה מונעת מהקלה טכנית ושורט סקוויז ולא מדיווח מבוקר.',
    hasNewsExplanationEn: 'Speculative Momentum: No audited 10-K filed yet. Movement is driven by technical short covering rather than verified compliance.',
    authenticityScore: 48,
    traderAdviceHe: 'תנודתיות גבוהה. יש להמתין להודעה רשמית של החברה ל-SEC לפני קבלת החלטת השקעה לטווח ארוך.',
    traderAdviceEn: 'High volatility. Wait for official audited SEC disclosures before entering long positions.',
    sourceCiting: 'Market Rumors & Short Covering Flows',
  },
  {
    rank: 10,
    ticker: 'LUNR',
    companyName: 'Intuitive Machines, Inc.',
    sector: 'Industrials / Aerospace & Defense',
    preMarketPrice: 6.18,
    previousClose: 5.82,
    changePercent: 6.2,
    changeAmount: 0.36,
    preMarketVolume: '1.1M',
    relativeVolume: 5.2,
    liquidityTier: 'MODERATE',
    
    // v2.0 Quant Additions
    detectionStage: 'CONFIRMED_BREAKOUT',
    fiveMinBucket: {
      currentBucketVolume: '145K',
      historicalBucketBaseline: '26K',
      bucketRvolMultiplier: 5.6,
      timeBucketLabel: '07:20 - 07:25 EST',
    },
    freeFloat: '49.2M',
    floatTurnoverPct: 2.24,
    fadeProbabilityPct: 16,
    llmEvaluation: {
      score: 89,
      category: 'CONTRACT',
      sourceCredibility: 'NEWSWIRE_PR',
      credibilityWeight: 0.90,
      llmReasoningHe: 'אישור תשלום אבן דרך רשמי מנאס"א בסך 34 מיליון דולר. יציבות תזרימית משופרת.',
      shelfOfferingRisk: 'LOW_NONE',
    },

    verdict: 'VERIFIED_NEWS',
    hasRealNews: true,
    catalystType: 'MEGA_CONTRACT',
    headlineHe: 'נאס"א (NASA) אישרה תשלום אבן דרך של 34 מיליון דולר לקראת משימת הנחיתה הירחית הבאה',
    headlineEn: 'NASA greenlights $34M lunar mission milestone payment for upcoming IM-2 South Pole landing',
    whyItMovedHe: 'סוכנות החלל האמריקאית נתנה אור ירוק לשיגור חללית המחקר IM-2 ואישרה עמידה בכל מבחני הניסוי הטכנולוגיים.',
    whyItMovedEn: 'NASA validated all critical milestone benchmarks for the upcoming lunar landing mission, releasing $34M in contract funding.',
    hasNewsExplanationHe: '✅ כן! חדשה מאומתת: פרסום רשמי באתר NASA ודיווח חוזי רכש ממשלתיים בארה"ב.',
    hasNewsExplanationEn: 'Verified News: Official NASA procurement release and federal contract register confirmation.',
    authenticityScore: 88,
    traderAdviceHe: 'זרימת מזומנים חיובית המבטיחה את המשך הפעילות לשנה הקרובה.',
    traderAdviceEn: 'Positive cash milestone bolstering near-term runway. Constructive technical setup.',
    sourceCiting: 'NASA Procurement & Official Release',
  },
];

export interface PremarketGainersSummaryStats {
  totalGainersCount: number;
  verifiedNewsCount: number;
  speculativeCount: number;
  fakePumpNoNewsCount: number;
  averageGainPercent: number;
  averageRealNewsGain: number;
  averageFakePumpGain: number;
  mostLegitimateStock: TopPremarketGainer;
  biggestTrapStock: TopPremarketGainer;
  quantMetrics: PremarketQuantEngineMetrics;
}

export function getPremarketGainersStats(gainers: TopPremarketGainer[] = TOP_10_PREMARKET_GAINERS): PremarketGainersSummaryStats {
  const totalGainersCount = gainers.length;
  let verifiedNewsCount = 0;
  let speculativeCount = 0;
  let fakePumpNoNewsCount = 0;

  let totalGainSum = 0;
  let realNewsGainSum = 0;
  let fakePumpGainSum = 0;

  gainers.forEach((g) => {
    totalGainSum += g.changePercent;
    if (g.verdict === 'VERIFIED_NEWS') {
      verifiedNewsCount++;
      realNewsGainSum += g.changePercent;
    } else if (g.verdict === 'SPECULATIVE_MOMENTUM') {
      speculativeCount++;
    } else {
      fakePumpNoNewsCount++;
      fakePumpGainSum += g.changePercent;
    }
  });

  const averageGainPercent = totalGainersCount > 0 ? Math.round((totalGainSum / totalGainersCount) * 10) / 10 : 0;
  const averageRealNewsGain = verifiedNewsCount > 0 ? Math.round((realNewsGainSum / verifiedNewsCount) * 10) / 10 : 0;
  const averageFakePumpGain = fakePumpNoNewsCount > 0 ? Math.round((fakePumpGainSum / fakePumpNoNewsCount) * 10) / 10 : 0;

  const mostLegitimateStock = [...gainers].sort((a, b) => b.authenticityScore - a.authenticityScore)[0] || gainers[0];
  const biggestTrapStock = [...gainers].filter(g => g.verdict === 'NO_NEWS_FAKE_PUMP').sort((a, b) => a.authenticityScore - b.authenticityScore)[0] || gainers[2];

  return {
    totalGainersCount,
    verifiedNewsCount,
    speculativeCount,
    fakePumpNoNewsCount,
    averageGainPercent,
    averageRealNewsGain,
    averageFakePumpGain,
    mostLegitimateStock,
    biggestTrapStock,
    quantMetrics: PREMARKET_QUANT_METRICS,
  };
}
