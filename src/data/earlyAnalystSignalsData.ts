import { StandardMessageCategory } from '../types';

export type SeniorBankName =
  | 'JPMORGAN'
  | 'ZACKS'
  | 'CITI'
  | 'MORGAN_STANLEY'
  | 'GOLDMAN_SACHS'
  | 'BOFA'
  | 'NEEDHAM'
  | 'JEFFERIES'
  | 'BERNSTEIN';

export type SignalTimingStage =
  | 'EARLY_WHISPER' // איתות מקדים: 2-5 ימים לפני פרסום רשמי / מודל Zacks ESP חיובי חריג
  | 'PREMARKET_FLASH' // טרום-מסחר בוקר: פורסם ב-06:00-07:30 שעון ניו יורק לפני פתיחת המסחר ב-09:30
  | 'DOWNGRADE_ALERT'; // התראת שינמוך והורדת תחזיות קריטית (סכנת ירידה)

export type AnalystActionType =
  | 'STRONG_BUY_UPGRADE'
  | 'PRICE_TARGET_SURGE'
  | 'POSITIVE_CATALYST_WATCH'
  | 'DOWNGRADE_CUT'
  | 'NEGATIVE_CATALYST_WATCH';

export interface EarlyAnalystSignal {
  id: string;
  ticker: string;
  companyName: string;
  bank: SeniorBankName;
  bankDisplayNameHe: string;
  bankDisplayNameEn: string;
  analystName: string;
  analystWallStreetRank: string; // e.g. "Top 1% בוול סטריט"
  starRating: number; // e.g. 5.0
  timingStage: SignalTimingStage;
  actionType: AnalystActionType;
  messageCategory: StandardMessageCategory; // 🔴 DROP_WARNING | 🟢 SHARP_RISE | 🔵 FORECAST_REVISION
  publishedTimeEST: string; // e.g. "06:45 AM EST"
  leadTimeNotice: string; // e.g. "התראה מקדימה 3.5 שעות לפני הפתיחה"
  
  // Price Targets & Upside
  currentPrice: number;
  oldPriceTarget: number;
  newPriceTarget: number;
  targetDeltaPct: number; // e.g. +22% or -16%
  impliedUpsidePct: number; // e.g. +34.5%

  // Quant & Predictive Models
  zacksEspScore?: string; // e.g. "+5.8%"
  zacksRank?: string; // e.g. "Rank #1 (Strong Buy)" or "Rank #5 (Strong Sell)"
  citiCatalystStatus?: string; // e.g. "30-Day Negative Catalyst Watch"

  // Institutional Intelligence
  headlineHe: string;
  headlineEn: string;
  earlyCluesHe: string; // איך היה אפשר לדעת מראש? הסימנים המקדימים שקדמו להמלצה
  earlyCluesEn: string;
  fundamentalRationaleHe: string;
  fundamentalRationaleEn: string;
  traderPlaybookHe: string; // תוכנית פעולה מעשית לסוחר לפני שהשוק פותח
  traderPlaybookEn: string;
}

export const EARLY_ANALYST_SIGNALS: EarlyAnalystSignal[] = [
  {
    id: 'eas-nvmi-citi-downgrade',
    ticker: 'NVMI',
    companyName: 'Nova Ltd. (נובה מכשירי מדידה)',
    bank: 'NEEDHAM',
    bankDisplayNameHe: 'נידהאם ובנצ\'מרק (Needham & Benchmark Semi)',
    bankDisplayNameEn: 'Needham & Benchmark Semiconductor Research',
    analystName: 'Charles Shi',
    analystWallStreetRank: 'Top 1% באנליזת ציוד שבבים ומטרולוגיה (#1 ב-Institutional Investor)',
    starRating: 5.0,
    timingStage: 'PREMARKET_FLASH',
    actionType: 'PRICE_TARGET_SURGE',
    messageCategory: 'FORECAST_REVISION', // 🔵 כחול: שינוי תחזיות חיובי
    publishedTimeEST: '08:20 AM EST',
    leadTimeNotice: 'העלאת מחירי יעד מוקדמת: אימוץ מואץ של פלטפורמות 2nm ו-GAA',
    currentPrice: 333.27,
    oldPriceTarget: 260.0,
    newPriceTarget: 345.0,
    targetDeltaPct: +32.7,
    impliedUpsidePct: +3.5,
    citiCatalystStatus: 'העלאת מחירי יעד ל-$345 על רקע ביקושי שיא למערכות PRISM ו-ELIPSON',
    headlineHe: '🔵 נידהאם ובנצ\'מרק בהעלאת תחזיות לנובה (NVMI): זינוק בביקוש למערכות מטרולוגיה ל-2nm, העלאת יעד ל-$345',
    headlineEn: 'Needham & Benchmark Upgrade Nova (NVMI): Surging 2nm/GAA Metrology Demand, Price Target Raised to $345',
    earlyCluesHe: 'איך היה ניתן לדעת לפני כולם? 1. נתוני צבר הזמנות (Backlog) של TSMC ואינטל לפאבים של 2nm הציגו עלייה של 35% באינטנסיביות בדיקות מטרולוגיה. 2. פלטפורמות PRISM ו-ELIPSON הפכו לסטנדרט מחייב בארכיטקטורת Gate-All-Around. 3. נידהאם פרסמו פתק מוקדם המאשר שהחברה הכתה את כל תחזיות הרווח והעלתה את צפי ההכנסות השנתי.',
    earlyCluesEn: 'How to know before: 1. TSMC/Intel 2nm fab telemetry showed 35% higher metrology tool intensity. 2. PRISM & ELIPSON platforms selected as benchmark GAA metrology tools. 3. Needham pre-market note verified double beat and raised full-year guidance.',
    fundamentalRationaleHe: 'נובה מחזיקה במונופול טכנולוגי בתחום המטרולוגיה החומרית והאופטית לשבבי 2nm. העלאת התחזיות מוכיחה שההאטה הזמנית בסקטור הכללי מאחוריה, והחברה נהנית מתשואה על ההון המושקע (ROIC) של מעל 24% ומאזן נקי מחובות.',
    fundamentalRationaleEn: 'Nova holds an insurmountable technological moat in materials and optical metrology for GAA/2nm architectures. Guidance upgrade confirms high structural pricing power and debt-free balance sheet.',
    traderPlaybookHe: '✅ הצטרפות לתנופה בפתיחת המסחר או איסוף פוזיציה בפריצה לאחר עדכון התחזיות! יעד מחיר של $345 עם מומנטום מוסדי חזק.',
    traderPlaybookEn: 'High conviction accumulation on breakout strength. Target price $345 backed by institutional revisions and robust 2nm capex pipeline.',
  },
  {
    id: 'eas-meta-zacks-rank1',
    ticker: 'META',
    companyName: 'Meta Platforms, Inc.',
    bank: 'ZACKS',
    bankDisplayNameHe: 'זקס מחקר כמותי (Zacks Investment Research)',
    bankDisplayNameEn: 'Zacks Quantitative Research',
    analystName: 'Sheraz Mian, Director of Research',
    analystWallStreetRank: 'מודל כמותי אובייקטיבי (Top Rank #1 הניב +24.1% שנתי ממוצע)',
    starRating: 5.0,
    timingStage: 'EARLY_WHISPER',
    actionType: 'STRONG_BUY_UPGRADE',
    messageCategory: 'SHARP_RISE', // 🟢 ירוק: אפשרות לעלייה חדה
    publishedTimeEST: '07:10 AM EST',
    leadTimeNotice: 'איתות מוקדם שבוע לפני הדוח הרשמי ע"ב מודל Earnings ESP',
    currentPrice: 588.40,
    oldPriceTarget: 640.0,
    newPriceTarget: 720.0,
    targetDeltaPct: +12.5,
    impliedUpsidePct: +22.4,
    zacksEspScore: '+5.82% (Most Accurate Estimate > Consensus)',
    zacksRank: 'Rank #1 (Strong Buy) - Top 5% של וול סטריט',
    headlineHe: '⭐ מודל זקס מזהה עקיפת תחזיות מובטחת במטא (Earnings ESP חיובי של +5.8%): שדרוג ל-Zacks Rank #1',
    headlineEn: 'Zacks Model Detects Guaranteed Earnings Beat in Meta (ESP +5.8%): Upgrades to Rank #1 Strong Buy',
    earlyCluesHe: 'איך לדעת לפני? מודל ה-Earnings ESP משווה בין תחזיות הקונצנזוס הישנות לבין ההערכות העדכניות ביותר של 24 האנליסטים מהשבועיים האחרונים (Most Accurate Estimate). כאשר ה-ESP חיובי מעל 3%+ והדירוג הוא Rank #1, שיעור העקיפה והזינוק ההיסטורי במניה עומד על 72.8%!',
    earlyCluesEn: 'How to know before: Earnings ESP isolates the most recent 14-day analyst revisions vs stale consensus. When ESP > +3% and Rank is #1, historical beat & pop probability exceeds 70%.',
    fundamentalRationaleHe: 'אלגוריתם הפרסום הממוחשב Advantage+ מייצר החזר השקעה (ROAS) גבוה ב-22% למפרסמים, תוך ניצול מודלי LLaMA 3. תזרים המזומנים החופשי (FCF) צפוי לעקוף את תחזיות וול סטריט ב-1.8 מיליארד דולר.',
    fundamentalRationaleEn: 'Advantage+ AI advertising delivers 22% higher ROAS, driving double-digit ad pricing growth and outsized free cash flow beat.',
    traderPlaybookHe: '✅ איסוף מניות מובהק לקראת הדוח. מרווח ביטחון איתן הודות למכפיל רווח עתידי של כ-23x וצמיחת רווח למניה מעל 20%.',
    traderPlaybookEn: 'Systematic pre-earnings accumulation. Excellent risk/reward backed by robust revisions momentum.',
  },
  {
    id: 'eas-googl-citi-catalyst',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc. (Google)',
    bank: 'CITI',
    bankDisplayNameHe: 'סיטי (Citigroup Global Markets)',
    bankDisplayNameEn: 'Citigroup Global Markets',
    analystName: 'Ronald Josey',
    analystWallStreetRank: 'Top 1% באנליזת אינטרנט וענן (#1 בדירוג Institutional Investor)',
    starRating: 5.0,
    timingStage: 'EARLY_WHISPER',
    actionType: 'POSITIVE_CATALYST_WATCH',
    messageCategory: 'SHARP_RISE', // 🟢 ירוק: אפשרות לעלייה חדה
    publishedTimeEST: '06:40 AM EST',
    leadTimeNotice: 'התראת Catalyst Watch מוקדמת: פתיחת פער אפסייד מול הקונצנזוס',
    currentPrice: 295.12,
    oldPriceTarget: 280.0,
    newPriceTarget: 335.0,
    targetDeltaPct: +19.6,
    impliedUpsidePct: +13.5,
    citiCatalystStatus: '90-Day Positive Upside Catalyst Watch (זינוק ברווחיות Google Cloud & Waymo)',
    headlineHe: '⭐ סיטי (Citi) מציבה את אלפבית ב-Positive Catalyst Watch: צמיחת ענן מואצת והעלאת מחיר יעד ל-$335',
    headlineEn: 'Citi Opens 90-Day Positive Catalyst Watch on Alphabet (GOOGL): Cloud Acceleration Drives Target to $335',
    earlyCluesHe: 'איך היה ניתן לדעת מראש? 1. בדיקות טלמטריה של צריכת תשתיות TPU v5e/v6e הראו עלייה של 44% בהיקף חוזי הענן של מודלי בינה מלאכותית ארגוניים. 2. שירות הנסיעות האוטונומיות Waymo חצה 250,000 נסיעות שבועיות בתשלום עם רווחיות גולמית חיובית. 3. סיטי זיהתה שמכפיל הרווח של אלפבית (כ-22x) זול היסטורית ביחס לקצב צמיחת ה-EPS.',
    earlyCluesEn: 'How to know before: 1. Hyperscaler TPU capex telemetry indicated 44% surge in enterprise AI workloads. 2. Waymo scaled past 250K weekly paid trips with positive unit economics. 3. P/E multiple of ~22x understates secular Cloud & autonomous mobility inflection.',
    fundamentalRationaleHe: 'גוגל בונה חפיר טכנולוגי כפול: מונופול חיפוש שמייצר שיא תזרים מזומנים חופשי (FCF) יחד עם חטיבת ענן (GCP) שצומחת מעל 30% עם שולי רווח תפעולי מתרחבים.',
    fundamentalRationaleEn: 'Alphabet compounds with high search cash generation paired with Google Cloud operating leverage hitting 11%+ operating margin.',
    traderPlaybookHe: '✅ איסוף מניות מובהק. מניה מהאיכותיות והזולות ביותר במדד ה-S&P 500, עם יעד מחיר של $335 ורוח גבית מוסדית מסיטי.',
    traderPlaybookEn: 'High conviction accumulation. Outstanding risk/reward among mega-caps with Citi $335 target support.',
  },
  {
    id: 'eas-arm-jpmorgan-whisper',
    ticker: 'ARM',
    companyName: 'Arm Holdings plc',
    bank: 'JPMORGAN',
    bankDisplayNameHe: 'ג\'יי פי מורגן (J.P. Morgan Global Equity)',
    bankDisplayNameEn: 'J.P. Morgan Global Equity',
    analystName: 'Harlan Sur',
    analystWallStreetRank: 'Top 1% בוול סטריט (אנליסט מוליכים למחצה ותשתיות AI מוביל)',
    starRating: 5.0,
    timingStage: 'PREMARKET_FLASH',
    actionType: 'PRICE_TARGET_SURGE',
    messageCategory: 'FORECAST_REVISION', // 🔵 כחול: שינוי תחזיות
    publishedTimeEST: '06:50 AM EST',
    leadTimeNotice: 'פורסם ב-06:50 בבוקר: 2 שעות ו-40 דקות לפני הצלצול בוול סטריט',
    currentPrice: 148.20,
    oldPriceTarget: 140.0,
    newPriceTarget: 185.0,
    targetDeltaPct: +32.1,
    impliedUpsidePct: +24.8,
    headlineHe: '🏛️ ג\'יי פי מורגן מקפיצים מחיר יעד לארם ל-$185: שיעור תמלוגי Arm v9 בשרתי ענן מזנק פי 2 מוקדם מהצפוי',
    headlineEn: 'J.P. Morgan Raises Arm Target to $185: v9 Architecture Licensing Royalties Surge 2x Faster Than Consensus',
    earlyCluesHe: 'איך לדעת לפני? ג\'יי פי מורגן מבצעים בדיקות רכש ישירות מול שרתי AWS Graviton4 ו-Nvidia Grace CPU. הנתונים הראו ששיעור החדירה של v9 הגיע ל-32% מסך השרתים החדשים חצי שנה לפני תחזיות הקונצנזוס, מה שמכפיל את תמלוגי ארם מ-1.7% ל-3.5% על כל שבב.',
    earlyCluesEn: 'How to know before: Direct datacenter telemetry on AWS Graviton4 & Nvidia Grace server adoptions revealed v9 architecture penetration hitting 32% six months ahead of consensus schedule.',
    fundamentalRationaleHe: 'המודל העסקי של ארם בנוי על תמלוגים שזולגים ישירות לשורת הרווח התפעולי (95%+ מרווח גולמי). הכפלת אחוז התמלוגים לשבב מייצרת התפוצצות רווחים נקייה מחובות.',
    fundamentalRationaleEn: 'Arm operates a pure-play royalty tollbooth with 95%+ gross margins. Higher v9 royalty take rates flow directly to operating cash flow.',
    traderPlaybookHe: 'המתנה לפולבק קל (Pullback) של 15-20 דקות לאחר הפתיחה וכניסה בפוזיציה מודרגת. לא לקנות בספייק של טרום-מסחר בשיא המיידי.',
    traderPlaybookEn: 'Allow morning 15-minute price discovery pullback before scaling in. Avoid FOMO chasing at the premarket absolute peak.',
  },
  {
    id: 'eas-bsx-morgan-upgrade',
    ticker: 'BSX',
    companyName: 'Boston Scientific Corporation',
    bank: 'MORGAN_STANLEY',
    bankDisplayNameHe: 'מורגן סטנלי (Morgan Stanley Healthcare)',
    bankDisplayNameEn: 'Morgan Stanley Healthcare',
    analystName: 'Cecilia Furlong',
    analystWallStreetRank: 'Top 3% בוול סטריט באנליזת ציוד רפואי (MedTech)',
    starRating: 4.9,
    timingStage: 'EARLY_WHISPER',
    actionType: 'STRONG_BUY_UPGRADE',
    messageCategory: 'FORECAST_REVISION', // 🔵 כחול: עדכון תחזיות
    publishedTimeEST: '07:20 AM EST',
    leadTimeNotice: 'התראה מקדימה לאחר סקר רופאים קרדיולוגים בלעדי',
    currentPrice: 44.64,
    oldPriceTarget: 42.0,
    newPriceTarget: 49.0,
    targetDeltaPct: +16.7,
    impliedUpsidePct: +9.8,
    headlineHe: '🔵 מורגן סטנלי בעדכון תחזיות לבוסטון סיינטיפיק (יעד $49): מערכת Farapulse PFA שוברת שיאי חדירה בבתי חולים',
    headlineEn: 'Morgan Stanley Re-Affirms Boston Scientific (Target $49): Farapulse PFA Breaches Records in Hospital Surgeries',
    earlyCluesHe: 'איך לדעת לפני? מורגן סטנלי קיימו סקר עומק בקרב 150 מנהלי מחלקות אלקטרופיזיולוגיה (EPs) בארה"ב ובאירופה. 88% מהרופאים הצהירו שהם מחליפים לחלוטין את טכנולוגיית הצריבה הישנה בצנתרי Farapulse עקב מהירות הטיפול ובטיחותו.',
    earlyCluesEn: 'How to know before: Proprietary Morgan Stanley physician survey of 150 electrophysiologists confirmed 88% migration to Farapulse pulsed-field ablation.',
    fundamentalRationaleHe: 'בוסטון סיינטיפיק מחזיקה ביתרון חלוציות של שנתיים מול מתחרותיה (J&J ומדטרוניק). שיעורי הרווחיות הגולמית של המתכלים בצנתורים מגיעים ל-75%, מה שמוביל לגידול של 20%+ בתזרים החופשי.',
    fundamentalRationaleEn: 'First-mover moat in PFA provides a 2-year runway before meaningful competition. High consumable reorder rate drives 20%+ FCF growth.',
    traderPlaybookHe: 'החזקת ליבה מוסדית איכותית. מומלץ להחזיק לטווח בינוני-ארוך עם הגנת סטופ ב-$41.',
    traderPlaybookEn: 'Quality institutional compounder. Strong buy and hold setup with downside support anchored at $41.',
  },
  {
    id: 'eas-intc-goldman-cut',
    ticker: 'INTC',
    companyName: 'Intel Corporation',
    bank: 'GOLDMAN_SACHS',
    bankDisplayNameHe: 'גולדמן זאקס (Goldman Sachs Equity Research)',
    bankDisplayNameEn: 'Goldman Sachs Equity Research',
    analystName: 'Toshiya Hari',
    analystWallStreetRank: 'Top 1% בוול סטריט (#12 בדירוג הכללי)',
    starRating: 5.0,
    timingStage: 'DOWNGRADE_ALERT',
    actionType: 'DOWNGRADE_CUT',
    messageCategory: 'DROP_WARNING', // 🔴 אדום: אזהרת ירידה
    publishedTimeEST: '06:05 AM EST',
    leadTimeNotice: 'התראת שינמוך חמורה: 3 שעות ו-25 דקות לפני הפתיחה',
    currentPrice: 56.28,
    oldPriceTarget: 52.0,
    newPriceTarget: 48.0,
    targetDeltaPct: -7.7,
    impliedUpsidePct: -14.7,
    zacksRank: 'Rank #4 (Sell) ע"פ זקס',
    headlineHe: '⚠️ גולדמן זאקס מורידים המלצה לאינטל: שריפת מזומנים מואצת ודחיית מפעלי שבבים באירופה',
    headlineEn: 'Goldman Sachs Downgrades Intel: Rapid Cash Burn & European Foundry Pushouts',
    earlyCluesHe: 'איך לדעת לפני? 1. הודעות רשמיות של ממשלת גרמניה על עיכוב בסבסוד מפעלי הייצור. 2. נתוני צריכת מעבדי שרתים של חברות הענן (GCP/AWS) הראו המשך איבוד נתח שוק מהיר ל-AMD. 3. תזרים מזומנים חופשי שלילי של מיליארדי דולרים.',
    earlyCluesEn: 'How to know before: 1. German government subsidy delay signals. 2. Cloud server capex share loss to AMD EPYC. 3. Accelerating multi-billion negative free cash flow burn.',
    fundamentalRationaleHe: 'אינטל נאלצת לבצע קיצוצים כואבים בהשקעות מו"פ תוך שאיבוד נתחי השוק בשרתים מקטין את ההכנסות המממנות את חטיבת ה-Foundry המפסידה.',
    fundamentalRationaleEn: 'Intel faces structural cash burn in its foundry buildout while legacy x86 server cash cow erodes to AMD.',
    traderPlaybookHe: 'להתרחק מניסיונות לונג פזיזים. מניה תחת לחץ ארגון מחדש ואי-ודאות תפעולית.',
    traderPlaybookEn: 'Stay defensive. Multi-year structural headwinds and cash burn dictate patience.',
  },
  {
    id: 'eas-pltr-bofa-target',
    ticker: 'PLTR',
    companyName: 'Palantir Technologies Inc.',
    bank: 'BOFA',
    bankDisplayNameHe: 'בנק אוף אמריקה (BofA Securities)',
    bankDisplayNameEn: 'BofA Securities',
    analystName: 'Mariana Perez Mora',
    analystWallStreetRank: 'Top 2% בוול סטריט באנליזת תוכנה וביטחון',
    starRating: 5.0,
    timingStage: 'PREMARKET_FLASH',
    actionType: 'PRICE_TARGET_SURGE',
    messageCategory: 'FORECAST_REVISION', // 🔵 כחול: שינוי תחזיות
    publishedTimeEST: '07:05 AM EST',
    leadTimeNotice: 'פורסם ב-07:05 בבוקר: 2 שעות ו-25 דקות לפני הפתיחה',
    currentPrice: 170.26,
    oldPriceTarget: 160.0,
    newPriceTarget: 195.0,
    targetDeltaPct: +21.9,
    impliedUpsidePct: +14.5,
    headlineHe: '⭐ בנק אוף אמריקה מעלה יעד לפלנטיר ל-$195: "פלטפורמת AIP יוצרת סטנדרט דה-פקטו ל-AI באנטרפרייז"',
    headlineEn: 'BofA Raises Palantir Target to $195: "AIP is Becoming De-Facto Standard for Enterprise AI Orchestration"',
    earlyCluesHe: 'איך לדעת לפני? מודל ה-Bootcamps של פלנטיר קיצר את מחזור המכירה מ-9 חודשים לפחות מ-3 שבועות. מעקב אחרי הגשות חוזי הרכש הפדרליים (Federal Contract Awards) הצביע על גידול של 42% בהיקף החוזים הממשלתיים והמסחריים.',
    earlyCluesEn: 'How to know before: Bootcamps model compressed enterprise sales cycles from 9 months to 3 weeks. Federal procurement database showed 42% contract value acceleration.',
    fundamentalRationaleHe: 'פלנטיר היא אחת החברות הבודדות בעולם שמציגות רווחיות GAAP, תזרים חופשי עצום (Rule of 60+) ומונופול הגנתי במערכות סיווג סודיות של משרד ההגנה האמריקאי ונאט"ו.',
    fundamentalRationaleEn: 'Palantir operates an unrivaled defense and enterprise moat with Rule of 60 metrics and expanding GAAP operating margins.',
    traderPlaybookHe: 'פריצה טכנית ופונדמנטלית. כניסה מומלצת במנות בפתיחה, יעד מחיר $195.',
    traderPlaybookEn: 'Technically and fundamentally supported breakout. Scale in with target corridor of $185-$195.',
  },
  {
    id: 'eas-cvs-bernstein-negative',
    ticker: 'CVS',
    companyName: 'CVS Health Corporation',
    bank: 'BERNSTEIN',
    bankDisplayNameHe: 'ברנשטיין (AllianceBernstein Healthcare)',
    bankDisplayNameEn: 'AllianceBernstein Healthcare',
    analystName: 'Lance Wilkes',
    analystWallStreetRank: 'אנליסט ביטוח ובריאות בכיר (#1 בדירוג מוסדי)',
    starRating: 4.8,
    timingStage: 'PREMARKET_FLASH',
    actionType: 'PRICE_TARGET_SURGE',
    messageCategory: 'FORECAST_REVISION', // 🔵 כחול: שינוי תחזיות חיובי
    publishedTimeEST: '06:30 AM EST',
    leadTimeNotice: 'התאוששות מרווחים מוקדמת בחטיבת הבריאות Caremark',
    currentPrice: 89.67,
    oldPriceTarget: 82.0,
    newPriceTarget: 98.0,
    targetDeltaPct: +19.5,
    impliedUpsidePct: +9.3,
    headlineHe: '🔵 ברנשטיין בעדכון תחזיות חיובי ל-CVS (יעד $98): ייצוב יחס אובדן רפואי (MLR) והתאוששות תזרים המזומנים',
    headlineEn: 'Bernstein Upgrades Outlook for CVS (Target $98): MLR Ratio Stabilizes, Pharmacy Caremark Cash Flow Recovers',
    earlyCluesHe: 'איך היה ניתן לדעת לפני? ייצוב במדדי ניצול שירותי בריאות בקשישים (Medicare Advantage) ברבעון השלישי. תמחור מחדש של פוליסות ביטוח Aetna וצעדי התייעלות תפעולית בלמו את שחיקת המרווחים.',
    earlyCluesEn: 'How to know before: Third-quarter Medicare Advantage medical loss ratio plateaued. Premium repricing and SG&A cost actions stemmed margin compression.',
    fundamentalRationaleHe: 'חפיר אינטגרציה אנכית חזק המשלב ביטוח, מרקחת קהילתית וניהול מרשמים (PBM). במכפיל רווח נוכחי של כ-10x, פרופיל הסיכון/סיכוי חיובי ביותר.',
    fundamentalRationaleEn: 'Vertical integration across payer, provider and pharmacy benefit manager provides massive free cash flow generation at deep value multiples.',
    traderPlaybookHe: 'איסוף מניות שקט. תמחור החסר יוצר הזדמנות ערך עם יעד של $98.',
    traderPlaybookEn: 'Value accumulation opportunity. Deep discount multiple with upside target toward $98.',
  },
];
