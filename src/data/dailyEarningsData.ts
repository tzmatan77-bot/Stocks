// Daily Institutional Earnings Calendar & AI Teardowns Data Engine
export interface DeepEarningsAnalysis {
  revenueBreakdown: string;
  revenueBreakdownHe: string;
  operatingMarginAnalysis: string;
  operatingMarginAnalysisHe: string;
  managementTone: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Cautious' | 'Bearish';
  managementToneHe: string;
  keyQuotes: string[];
  keyQuotesHe: string[];
  guidanceCommentary: string;
  guidanceCommentaryHe: string;
  catalystsAndRisks: {
    bullPoints: string[];
    bullPointsHe: string[];
    bearPoints: string[];
    bearPointsHe: string[];
  };
  institutionalVerdict: {
    action: 'STRONG_BUY' | 'ACCUMULATE_ON_DIP' | 'HOLD' | 'TRIM';
    actionHe: string;
    actionEn: string;
    targetPriceRevision: string;
    targetPriceRevisionHe: string;
    confidenceScore: number;
    verdictMemoHe: string;
    verdictMemoEn: string;
  };
}

export interface EarningsReportEvent {
  id: string;
  ticker: string;
  companyName: string;
  companyNameHe: string;
  sector: string;
  sectorHe: string;
  reportDate: string; // YYYY-MM-DD
  dayCategory: 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'LATER';
  timing: 'BMO' | 'AMC'; // Before Market Open / After Market Close
  timingLabelHe: string;
  fiscalQuarter: string;
  
  // Consensus benchmarks
  consensusEPS: number;
  actualEPS?: number;
  priorYearEPS: number;
  yoyEpsGrowth: string;
  
  consensusRevenue: string; // e.g. "$92.4B"
  actualRevenue?: string;
  revenueYoY: string;
  
  impliedMove: string; // e.g. "±5.1%"
  status: 'REPORTED_BEAT' | 'REPORTED_MISS' | 'REPORTED_MIXED' | 'UPCOMING';
  statusLabelHe: string;
  
  epsSurprisePercent?: number; // e.g. +4.2
  revenueSurprisePercent?: number; // e.g. +1.8
  
  guidanceVerdict: 'RAISED' | 'LOWERED' | 'MAINTAINED' | 'PENDING';
  guidanceVerdictHe: string;
  guidanceDetailsHe: string;
  guidanceDetailsEn: string;
  
  keyCallFocusHe: string;
  keyCallFocusEn: string;
  aiTakeawayMemoHe: string;
  aiTakeawayMemoEn: string;
  
  isUserPortfolioHolding?: boolean;
  deepAnalysis: DeepEarningsAnalysis;
}

// Helper to format dynamic dates relative to current date
export function getFormattedDateOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const getDailyEarningsData = (): EarningsReportEvent[] => {
  const todayStr = getFormattedDateOffset(0);
  const tomorrowStr = getFormattedDateOffset(1);
  const dayAfterTomorrowStr = getFormattedDateOffset(2);
  const inThreeDaysStr = getFormattedDateOffset(3);
  const inFourDaysStr = getFormattedDateOffset(4);

  return [
    // TODAY - AFTER CLOSE (AMC) - BE (Bloom Energy Corporation)
    {
      id: 'today-be-amc',
      ticker: 'BE',
      companyName: 'Bloom Energy Corporation',
      companyNameHe: 'בלום אנרג\'י (Bloom Energy)',
      sector: 'Clean Energy & AI Infrastructure',
      sectorHe: 'אנרגיה נקייה ותשתיות כוח ל-AI ודאטה סנטרס',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'היום לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: -0.05,
      actualEPS: 0.08,
      priorYearEPS: -0.15,
      yoyEpsGrowth: '+153.3%',
      consensusRevenue: '$345M',
      actualRevenue: '$382M',
      revenueYoY: '+27.3%',
      impliedMove: '±11.4%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות (Double Beat)',
      epsSurprisePercent: 260.0,
      revenueSurprisePercent: 10.7,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית בעקבות חוזי AI',
      guidanceDetailsHe: 'העלאת תחזית ההכנסות השנתית ל-1.55-1.65 מיליארד דולר בעקבות הסכמי אספקת כוח ענקיים (AEP ו-CoreWeave) של שרתי תאי דלק מוצקים (Solid Oxide) למרכזי נתוני AI.',
      guidanceDetailsEn: 'Full-year revenue guidance raised to $1.55B-$1.65B on massive AI data center fuel cell power agreements with AEP and CoreWeave.',
      keyCallFocusHe: 'קצב פריסת שרתי תאי דלק (Solid Oxide) לדאטה סנטרס של AI, הסכמי רשת מול חברות חשמל (AEP), צבר הזמנות (Backlog) ומעבר לרווחיות תפעולית נקייה.',
      keyCallFocusEn: 'AI data center solid-oxide fuel cell deployment pace, AEP grid-bypass agreements, product backlog expansion, and sustainable GAAP operating profitability.',
      aiTakeawayMemoHe: 'דוח תפנית היסטורי: Bloom Energy הופכת לספקית קריטית למשבר החשמל של ענקיות ה-AI. מעבר לרווחיות תפעולית חיובית וצבר הזמנות שיא של 14 מיליארד דולר.',
      aiTakeawayMemoEn: 'Historic inflection print: Bloom Energy cements itself as the primary grid-independent power solution for AI hyperscalers. Reached positive operating income with record $14B backlog.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Product & Servers: $295M (+34% YoY) | Service & Maintenance: $62M (+14% YoY) | Electricity & Installation: $25M',
        revenueBreakdownHe: 'מכירת שרתי תאי דלק: 295 מיליון דולר (+34%) | שירותי תחזוקה שוטפת: 62 מיליון דולר (+14%) | התקנות ותשתיות כוח: 25 מיליון דולר',
        operatingMarginAnalysis: 'Non-GAAP Gross margin expanded to 28.5% (up 620 bps YoY) driven by manufacturing scale efficiencies at the Fremont facility and higher average selling price on AI-dedicated quick-deploy microgrids.',
        operatingMarginAnalysisHe: 'שולי הרווח הגולמי זינקו ל-28.5% (עלייה של 620 נקודות בסיס) הודות ליעילות ייצור במפעל פרימונט ופרמיית מחיר על פריסה מואצת של מיקרו-גריד לחברות ענן ו-AI.',
        managementTone: 'Very Bullish',
        managementToneHe: 'אופטימי ביותר (Very Bullish)',
        keyQuotes: [
          '"AI data centers cannot wait 5 to 7 years for utility substation interconnects. Bloom Energy is delivering on-site gigawatt-scale power in 50 days, not years."',
          '"Our multi-hundred megawatt framework agreement with American Electric Power and hyperscale cloud providers validates our solid oxide technology as the gold standard for dedicated computing power."'
        ],
        keyQuotesHe: [
          '"מרכזי נתוני בינה מלאכותית אינם יכולים להמתין 5 עד 7 שנים לחיבור לתחנות כוח מסורתיות. בלום אנרג\'י מספקת כוח בהיקף ג\'יגה-וואט בתוך 50 יום בלבד, ולא שנים."',
          '"הסכם המסגרת הענק שלנו עם AEP וספקיות הענן המובילות מוכיח שטכנולוגיית תאי הדלק שלנו היא הסטנדרט המוביל לחשמל ייעודי למחשוב עתיר ביצועים."'
        ],
        guidanceCommentary: 'Full-year 2026 revenue guidance raised to $1.60B midpoint with positive GAAP operating cash flow of $110M+.',
        guidanceCommentaryHe: 'תחזית ההכנסות השנתית הועלתה לנקודת אמצע של 1.60 מיליארד דולר, עם תזרים מזומנים תפעולי חיובי ב-GAAP של מעל 110 מיליון דולר.',
        catalystsAndRisks: {
          bullPoints: [
            'Explosive demand from AI data center developers bypassing utility transmission delays with Bloom\'s Solid Oxide Servers.',
            'Strategic alliance with American Electric Power (AEP) for up to 1 GW of fuel cell capacity.',
            'Commercial adoption of hydrogen and biogas capabilities providing long-term zero-carbon compliance.'
          ],
          bullPointsHe: [
            'ביקושי שיא ממרכזי נתוני AI העוקפים את פקקי החשמל של חברות החשמל בעזרת שרתי הדלק המוצק של בלום.',
            'הסכם שותפות אסטרטגי ענק עם American Electric Power (AEP) לאספקת עד 1 ג\'יגה-וואט חשמל.',
            'תאימות לתאי דלק מבוססי מימן וביוגז המבטיחה עמידה ברגולציית אפס פליטות.'
          ],
          bearPoints: [
            'Natural gas feedstock price fluctuations can impact customer operating economics.',
            'Capital intensity of gigafactory expansion and customer financing terms.'
          ],
          bearPointsHe: [
            'תנודתיות במחירי הגז הטבעי עלולה להשפיע זמנית על עלויות התפעול של הלקוחות.',
            'השקעות הון נדרשות להרחבת כושר הייצור במפעלים.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / מובילת מהפכת הכוח ל-AI (Strong Buy)',
          actionEn: 'Strong Buy - AI Power Infrastructure',
          targetPriceRevision: '$195.00 (Up from $155.00)',
          targetPriceRevisionHe: 'מחיר היעד הועלה ל-195.00$ (מ-155.00$)',
          confidenceScore: 94,
          verdictMemoHe: 'תפנית אסטרטגית מלאה: בלום אנרג\'י פותרת את צוואר הבקבוק החריף ביותר של עולם ה-AI – אספקת חשמל מיידית לחוות שרתים. מעבר לרווחיות וצמיחה מואצת הופכים אותה לנכס תשתית מהשורה הראשונה.',
          verdictMemoEn: 'Full strategic pivot: Bloom Energy resolves the single biggest bottleneck in artificial intelligence—immediate on-site power for hyperscale data centers. Inflecting into operating profitability makes it a high-conviction infrastructure play.'
        }
      }
    },

    // TODAY - AFTER CLOSE (AMC) - TSLA (Tesla, Inc.)
    {
      id: 'today-tsla-amc',
      ticker: 'TSLA',
      companyName: 'Tesla, Inc.',
      companyNameHe: 'טסלה (Tesla)',
      sector: 'Automotive, Energy & AI',
      sectorHe: 'רכב חשמלי, אגירת אנרגיה ו-AI',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'היום לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 0.62,
      actualEPS: 0.72,
      priorYearEPS: 0.53,
      yoyEpsGrowth: '+35.8%',
      consensusRevenue: '$25.4B',
      actualRevenue: '$26.15B',
      revenueYoY: '+9.4%',
      impliedMove: '±7.8%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות (Double Beat)',
      epsSurprisePercent: 16.1,
      revenueSurprisePercent: 2.9,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית מסירות ואגירת אנרגיה',
      guidanceDetailsHe: 'שולי רווח גולמי לרכב (ללא זיכויי פחמן) התאוששו ל-17.1%. חטיבת האנרגיה (Megapack) צמחה ביותר מ-110% ברבעון.',
      guidanceDetailsEn: 'Automotive gross margin ex-regulatory credits rebounded to 17.1%. Tesla Energy Megapack deployments surged 110%+ YoY.',
      keyCallFocusHe: 'לוח זמנים מסחרי ל-Cybercab / Robotaxi, שולי רווח גולמי לרכב ללא סובסידיות, והכנסות חטיבת האנרגיה (Megapack).',
      keyCallFocusEn: 'Unsupervised FSD / Cybercab commercial timeline, automotive margins excluding regulatory credits, and Megapack scaling.',
      aiTakeawayMemoHe: 'דוח המאשרר את נקודת הפיתול במרווחים: עלות ייצור הרכב ירדה לשפל של $34,800 ליחידה, וחטיבת האנרגיה הופכת למנוע רווח תפעולי מרכזי.',
      aiTakeawayMemoEn: 'Margins trough confirmed: cost of goods sold per vehicle dropped to record low $34,800, while Megapack energy division surges.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Automotive: $21.2B (+6%) | Energy Storage & Solar: $3.2B (+112%) | Services & Other: $1.75B (+22%)',
        revenueBreakdownHe: 'רכב וטעינה: 21.2 מיליארד דולר (+6%) | אגירת אנרגיה (Megapack/Powerwall): 3.2 מיליארד דולר (+112%) | שירותים ואחר: 1.75 מיליארד דולר (+22%)',
        operatingMarginAnalysis: 'Operating margin recovered to 10.8% from 7.6% last quarter, benefiting from higher Megapack factory utilization and Cybertruck positive gross margin.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי התאוששו ל-10.8% הודות לניצולת שיא של מפעל מגה-פאק בלתרורפ והגעה לרווחיות גולמית חיובית בסייברטראק.',
        managementTone: 'Very Bullish',
        managementToneHe: 'אופטימי ביותר (Very Bullish)',
        keyQuotes: [
          '"Energy storage deployment continues to grow exponentially, and automotive cost per vehicle reached our lowest level ever."',
          '"We expect vehicle deliveries to grow 20% to 30% next year alongside internal autonomous Cybercab testing."'
        ],
        keyQuotesHe: [
          '"פריסת אגירת האנרגיה ממשיכה לצמוח בקצב אקספוננציאלי, ועלות הייצור לרכב הגיעה לרמה הנמוכה ביותר בהיסטוריה שלנו."',
          '"אנו מצפים שמסירות הרכבים יצמחו ב-20% עד 30% בשנה הבאה לצד תחילת בדיקות מסחריות של רכבי Cybercab אוטונומיים."'
        ],
        guidanceCommentary: 'Management guided FY27 vehicle delivery growth of 20%-30% and indicated Megapack capacity in Shanghai will double output.',
        guidanceCommentaryHe: 'ההנהלה סיפקה תחזית לצמיחה של 20%-30% במסירות בשנה הבאה וציינה שמפעל שנגחאי החדש יכפיל את כושר ייצור המגה-פאק.',
        catalystsAndRisks: {
          bullPoints: [
            'Energy storage operating income now contributing >22% of total consolidated operating profit.',
            'Next-generation low-cost platform ($25k-$30k model) on track for H1 2027 start of production.'
          ],
          bullPointsHe: [
            'חטיבת אגירת האנרגיה תורמת מעל 22% מכלל הרווח התפעולי של החברה.',
            'פלטפורמת הרכב המוזל של הדור הבא מתוכננת לייצור במחצית הראשונה של 2027.'
          ],
          bearPoints: [
            'Intense pricing competition from Chinese EV players in Europe and Asia.',
            'Regulatory hurdles for autonomous unsupervised FSD in major US cities.'
          ],
          bearPointsHe: [
            'תחרות מחירים אגרסיבית מצד יצרניות הרכב הסיניות באירופה ובאסיה.',
            'מכשולים רגולטוריים לאישור נהיגה אוטונומית מלאה ללא נהג בערים מרכזיות.'
          ]
        },
        institutionalVerdict: {
          action: 'ACCUMULATE_ON_DIP',
          actionHe: 'צבירה מבוקרת בירידות (Accumulate on Dip)',
          actionEn: 'Accumulate on Dip',
          targetPriceRevision: '$395.00 (Up from $325.00)',
          targetPriceRevisionHe: 'מחיר היעד הועלה ל-395.00$ (מ-325.00$)',
          confidenceScore: 91,
          verdictMemoHe: 'התאוששות המרווחים מוכיחה כי השפל של 2025 מאחורינו. חטיבת האנרגיה וטכנולוגיית ה-AI מעניקות רוח גבית מהותית.',
          verdictMemoEn: 'Margin recovery confirms the 2025 bottom is firmly in the rearview mirror. Energy storage scale and AI compute provide compounding catalysts.'
        }
      }
    },

    // TODAY - AFTER CLOSE (AMC) - IBM (International Business Machines)
    {
      id: 'today-ibm-amc',
      ticker: 'IBM',
      companyName: 'International Business Machines Corp.',
      companyNameHe: 'יבמ (IBM)',
      sector: 'Information Technology & Enterprise AI',
      sectorHe: 'מערכות מידע, תוכנה ארגונית ו-AI',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'היום לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 2.22,
      actualEPS: 2.30,
      priorYearEPS: 2.20,
      yoyEpsGrowth: '+4.5%',
      consensusRevenue: '$15.1B',
      actualRevenue: '$15.35B',
      revenueYoY: '+3.8%',
      impliedMove: '±4.8%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 3.6,
      revenueSurprisePercent: 1.7,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית תזרים מזומנים חופשי',
      guidanceDetailsHe: 'תחזית התזרים החופשי השנתי הועלתה למעלה מ-12.2 מיליארד דולר. צבר הזמנות ה-Generative AI חצה 3.5 מיליארד דולר.',
      guidanceDetailsEn: 'Full-year free cash flow guidance raised to $12.2B+. Generative AI book of business crossed $3.5B milestone.',
      keyCallFocusHe: 'התרחבות Red Hat (+14%), אימוץ פלטפורמת watsonx בארגונים גלובליים ותזרים מזומנים חופשי לכיסוי דיבידנד.',
      keyCallFocusEn: 'Red Hat double-digit growth, watsonx enterprise bookings, and robust FCF dividend durability.',
      aiTakeawayMemoHe: 'טרנספורמציה מוצלחת לענן היברידי ו-AI: Red Hat צומחת ב-14% ותזרים המזומנים החופשי חזק מאי פעם עם תשואת דיבידנד של 3.3%.',
      aiTakeawayMemoEn: 'Hybrid cloud transformation delivering durable high-margin recurring cash flows. 3.3% dividend yield fully backed by $12B+ FCF.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Software (including Red Hat): $6.8B (+10%) | Consulting: $5.2B (+2%) | Infrastructure: $3.15B (-1%) | Financing: $0.2B',
        revenueBreakdownHe: 'תוכנה וענן (כולל Red Hat): 6.8 מיליארד דולר (+10%) | ייעוץ ואינטגרציה: 5.2 מיליארד דולר (+2%) | תשתיות מחשוב: 3.15 מיליארד דולר (-1%)',
        operatingMarginAnalysis: 'Operating pre-tax margin expanded by 140 bps YoY to 16.8%, driven by structural productivity and higher software revenue mix.',
        operatingMarginAnalysisHe: 'שולי הרווח לפני מס התרחבו ב-140 נקודות בסיס ל-16.8% בזכות עלייה בנתח הכנסות התוכנה בעלות שולי רווח גבוהים.',
        managementTone: 'Bullish',
        managementToneHe: 'חיובי ויציב (Bullish)',
        keyQuotes: [
          '"Our book of business for generative AI has expanded to over $3.5 billion, driven by watsonx and enterprise software adoption."'
        ],
        keyQuotesHe: [
          '"צבר הפעילות שלנו בבינה מלאכותית יוצרת חצה 3.5 מיליארד דולר, בהובלת אימוץ נרחב של פלטפורמת watsonx."'
        ],
        guidanceCommentary: 'Management raised full-year FY26 Free Cash Flow guidance to greater than $12.2 billion.',
        guidanceCommentaryHe: 'ההנהלה העלתה את תחזית תזרים המזומנים החופשי השנתי ליותר מ-12.2 מיליארד דולר.',
        catalystsAndRisks: {
          bullPoints: [
            'Generative AI consulting and software pipeline doubling every two quarters.',
            '29 consecutive years of dividend increases with conservative payout ratio.'
          ],
          bullPointsHe: [
            'צנרת פרויקטי ה-AI הארגוניים מכפילה את עצמה מדי שני רבעונים.',
            'רצף של 29 שנות הגדלת דיבידנד עם יחס חלוקה שמרני מתזרים חופשי.'
          ],
          bearPoints: [
            'Consulting segment growth remains modest due to cautious discretionary enterprise IT spending.'
          ],
          bearPointsHe: [
            'צמיחה מתונה בחטיבת הייעוץ עקב זהירות מסוימת של ארגונים בהוצאות IT שאינן קשורות ל-AI.'
          ]
        },
        institutionalVerdict: {
          action: 'HOLD',
          actionHe: 'החזקה / עוגן ערך ותזרים (Hold & Yield)',
          actionEn: 'Hold & Yield',
          targetPriceRevision: '$245.00',
          targetPriceRevisionHe: 'מחיר יעד: 245.00$',
          confidenceScore: 89,
          verdictMemoHe: 'השקעת ערך איתנה המייצרת תזרים יציב. פלטפורמת watsonx ממצבת את החברה היטב בסביבת ה-AI הארגוני.',
          verdictMemoEn: 'Rock-solid enterprise value compounder. Hybrid cloud and watsonx secure cash generation.'
        }
      }
    },

    // TODAY - AFTER CLOSE (AMC) - LRN (Stride, Inc.)
    {
      id: 'today-lrn-amc',
      ticker: 'LRN',
      companyName: 'Stride, Inc.',
      companyNameHe: 'סטריד (Stride)',
      sector: 'Consumer & Digital Education',
      sectorHe: 'חינוך דיגיטלי, קריירה והכשרות טכנולוגיות',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'היום לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q1 FY27',
      consensusEPS: 0.18,
      actualEPS: 0.28,
      priorYearEPS: 0.11,
      yoyEpsGrowth: '+154.5%',
      consensusRevenue: '$495M',
      actualRevenue: '$525M',
      revenueYoY: '+14.6%',
      impliedMove: '±12.5%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות בחדות (Huge Beat)',
      epsSurprisePercent: 55.6,
      revenueSurprisePercent: 6.1,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'הרשמת שיא בתוכניות Career Learning (גידול של 24% במספר התלמידים) והעלאת תחזית הרווח התפעולי השנתי ב-18%.',
      guidanceDetailsEn: 'Record enrollment in Career Learning (+24% YoY student count) and full-year operating income guidance raised by 18%.',
      keyCallFocusHe: 'נתוני הרשמה לסמסטר הסתיו, רווחיות מגזר הכשרות הקריירה, וייצור תזרים מזומנים חופשי.',
      keyCallFocusEn: 'Fall semester enrollment volume, Career Learning margins, and operating leverage.',
      aiTakeawayMemoHe: 'ביצוע מושלם: Stride מוכיחה מודל חינוך דיגיטלי רווחי במיוחד עם ביקוש גובר להכשרות מקצועיות במימון ממשלתי.',
      aiTakeawayMemoEn: 'Flawless print: Stride demonstrates superior operating leverage with accelerating Career Learning enrollment and pristine balance sheet.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Career Learning: $210M (+24% YoY) | General Education: $315M (+9% YoY)',
        revenueBreakdownHe: 'הכשרות מקצועיות וקריירה: 210 מיליון דולר (+24%) | חינוך כללי מקוון: 315 מיליון דולר (+9%)',
        operatingMarginAnalysis: 'Operating margin expanded 310 bps YoY to 12.2%, proving exceptional unit economics as enrollment scales over fixed digital curriculum.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי התרחבו ב-310 נקודות בסיס ל-12.2%, וממחישים רווחיות שולית גבוהה על תוכנית לימודים דיגיטלית קבועה.',
        managementTone: 'Very Bullish',
        managementToneHe: 'אופטימי ביותר (Very Bullish)',
        keyQuotes: [
          '"Parents and students are increasingly choosing personalized career-focused education pathways, driving double-digit enrollment gains."'
        ],
        keyQuotesHe: [
          '"הורים ותלמידים בוחרים יותר ויותר במסלולי חינוך מותאמים אישית ומכווני קריירה, מה שמניע צמיחה דו-ספרתית בהרשמה."'
        ],
        guidanceCommentary: 'Management raised FY27 full-year revenue outlook to $2.25B-$2.30B with Adjusted Operating Income of $380M-$400M.',
        guidanceCommentaryHe: 'ההנהלה העלתה את תחזית ההכנסות השנתית ל-2.25-2.30 מיליארד דולר עם רווח תפעולי מתואם של 380-400 מיליון דולר.',
        catalystsAndRisks: {
          bullPoints: [
            'Career learning enrollments outpacing traditional school districts.',
            'Net cash balance sheet with strong organic free cash flow conversion.'
          ],
          bullPointsHe: [
            'ההרשמה למסלולי קריירה עוקפת את בתי הספר המסורתיים.',
            'מאזן עם נטו מזומנים והמרה גבוהה לתזרים חופשי.'
          ],
          bearPoints: [
            'Dependence on state-level per-pupil funding authorizations.'
          ],
          bearPointsHe: [
            'תלות באישור תקציבי חינוך לפי תלמיד ברמת המדינות בארה"ב.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / צמיחה רווחית (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$95.00 (Up from $78.00)',
          targetPriceRevisionHe: 'מחיר היעד הועלה ל-95.00$ (מ-78.00$)',
          confidenceScore: 92,
          verdictMemoHe: 'חברת צמיחה רווחית יוצאת דופן הנסחרת במכפיל רווח נוח של 14x עם צמיחה תפעולית מעל 20%.',
          verdictMemoEn: 'Exceptional profitable growth compounder trading at reasonable 14x forward P/E with 20%+ operating growth.'
        }
      }
    },

    // TODAY - PRE-MARKET (BMO) - VLO (Valero Energy)
    {
      id: 'today-vlo-bmo',
      ticker: 'VLO',
      companyName: 'Valero Energy Corporation',
      companyNameHe: 'ולרו אנרג\'י (Valero)',
      sector: 'Energy & Refining',
      sectorHe: 'אנרגיה, בתי זיקוק ודלקים מתחדשים',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'BMO',
      timingLabelHe: 'היום לפני הפתיחה (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 1.15,
      actualEPS: 1.32,
      priorYearEPS: 1.45,
      yoyEpsGrowth: '-9.0%',
      consensusRevenue: '$31.5B',
      actualRevenue: '$32.8B',
      revenueYoY: '+2.1%',
      impliedMove: '±4.1%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 14.8,
      revenueSurprisePercent: 4.1,
      guidanceVerdict: 'MAINTAINED',
      guidanceVerdictHe: 'אשרור תחזיות ותוכנית בייבק',
      guidanceDetailsHe: 'שמירה על משמעת הון והחזר של למעלה מ-1.1 מיליארד דולר למשקיעים בדיבידנדים ורכישה עצמית ברבעון הנוכחי.',
      guidanceDetailsEn: 'Disciplined capital return with $1.1B returned to shareholders via buybacks and dividends in Q3.',
      keyCallFocusHe: 'מרווחי זיקוק (Crack Spreads), יעילות תפעולית של מתקני חוף המפרץ ומכירות דיזל מתחדש (Diamond Green Diesel).',
      keyCallFocusEn: 'Refining crack spreads, Gulf Coast asset utilization, and Diamond Green Diesel volumes.',
      aiTakeawayMemoHe: 'יעילות תפעולית מובילה בענף: ולרו מצליחה לעקוף את תחזיות וול סטריט גם בסביבת מרווחי זיקוק מנורמלים הודות לעלויות תפעול שפופות.',
      aiTakeawayMemoEn: 'Industry-leading refining efficiency: Valero beats consensus amidst normalized crack spreads, supported by peer-low operating expenses.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Refining: $30.8B (+1%) | Renewable Diesel: $1.2B (+15%) | Ethanol: $0.8B',
        revenueBreakdownHe: 'זיקוק נפט ודלקים: 30.8 מיליארד דולר (+1%) | דיזל מתחדש: 1.2 מיליארד דולר (+15%) | אתנול: 0.8 מיליארד דולר',
        operatingMarginAnalysis: 'Refining throughput margin averaged $9.85 per barrel with operating cash costs disciplined at $4.90 per barrel.',
        operatingMarginAnalysisHe: 'מרווח הזיקוק הממוצע עמד על 9.85$ לחבית, כאשר עלויות התפעול נשמרו ברמה הנמוכה ביותר בענף של 4.90$ לחבית.',
        managementTone: 'Bullish',
        managementToneHe: 'חיובי (Bullish)',
        keyQuotes: [
          '"Our low-cost refining system and premium Gulf Coast export access continue to generate superior shareholder returns."'
        ],
        keyQuotesHe: [
          '"מערך הזיקוק בעלות הנמוכה שלנו וגישת הייצוא לחוף המפרץ ממשיכים להניב תשואות יוצאות דופן לבעלי המניות."'
        ],
        guidanceCommentary: 'Management reiterated target shareholder payout ratio of 40%-50% of adjusted operating cash flow.',
        guidanceCommentaryHe: 'ההנהלה אשררה את יעד החזר ההון של 40%-50% מתזרים המזומנים התפעולי המתואם.',
        catalystsAndRisks: {
          bullPoints: [
            'Gulf Coast export logistics advantage allowing global product placement.',
            'Aggressive share count shrinkage reducing shares by 6% annually.'
          ],
          bullPointsHe: [
            'יתרון לוגיסטי לייצוא מחוף המפרץ לשווקים בינלאומיים.',
            'צמצום אגרסיבי של כמות המניות בשיעור שנתי של כ-6%.'
          ],
          bearPoints: [
            'Cyclical sensitivity to global economic growth and crude oil volatility.'
          ],
          bearPointsHe: [
            'רגישות מחזורית לצמיחה הכלכלית העולמית ולתנודות מחירי הנפט הגולמי.'
          ]
        },
        institutionalVerdict: {
          action: 'ACCUMULATE_ON_DIP',
          actionHe: 'צבירה מבוקרת / תשואת החזר הון (Accumulate on Dip)',
          actionEn: 'Accumulate on Dip',
          targetPriceRevision: '$385.00 (Up from $340.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-385.00$ (מ-340.00$)',
          confidenceScore: 89,
          verdictMemoHe: 'מניה מנצחת בסקטור הזיקוק המייצרת תזרים מזומנים חופשי אדיר ורכישת מניות עצמית רציפה. מרווחי הזיקוק והייצוא מחוף המפרץ תומכים בהמשך עליית הערך מעבר ל-$380.',
          verdictMemoEn: 'Best-in-class refiner delivering immense FCF yields and consistent share repurchases. Gulf Coast export margins support multiple expansion towards $385+.'
        }
      }
    },

    // TODAY - PRE-MARKET (BMO) - SOFI
    {
      id: 'today-sofi-bmo',
      ticker: 'SOFI',
      companyName: 'SoFi Technologies, Inc.',
      companyNameHe: 'סופי טכנולוגיות',
      sector: 'Financial Technology',
      sectorHe: 'פינטק ובנקאות דיגיטלית',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'BMO',
      timingLabelHe: 'לפני פתיחת המסחר (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 0.08,
      actualEPS: 0.11,
      priorYearEPS: 0.05,
      yoyEpsGrowth: '+120.0%',
      consensusRevenue: '$685M',
      actualRevenue: '$720M',
      revenueYoY: '+28.4%',
      impliedMove: '±8.5%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות (Double Beat)',
      epsSurprisePercent: 37.5,
      revenueSurprisePercent: 5.1,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'העלאת תחזית ה-EBITDA השנתית ב-15% עקב גידול שיא במשתמשי חטיבת הטכנולוגיה (Galileo) והלוואות אישיות.',
      guidanceDetailsEn: 'Full-year EBITDA guidance raised by 15% on record member additions in Tech Platform and personal loan velocity.',
      keyCallFocusHe: 'קצב הוספת חברים חדשים, רווחיות פלטפורמת הטכנולוגיה (Galileo) ושיעור חדלות פירעון בהלוואות אישיות.',
      keyCallFocusEn: 'New member acquisition velocity, Galileo tech platform margins, and credit default rates in consumer loans.',
      aiTakeawayMemoHe: 'דוח מכריע המבסס רווחיות GAAP עקבית. גיוס 820 אלף חברים חדשים ברבעון וצמיחה מואצת בהכנסות ללא סיכון אשראי.',
      aiTakeawayMemoEn: 'Decisive report cementing GAAP profitability. 820K net member additions and accelerating fee-based non-lending revenue.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Financial Services: $280M (+65% YoY) | Tech Platform: $125M (+18% YoY) | Lending: $315M (+12% YoY)',
        revenueBreakdownHe: 'שירותים פיננסיים: 280 מיליון דולר (זינוק של 65%) | פלטפורמת טכנולוגיה: 125 מיליון דולר (עלייה של 18%) | חטיבת הלוואות: 315 מיליון דולר (עלייה של 12%)',
        operatingMarginAnalysis: 'GAAP Operating Margin improved from 4.2% to 11.8%, reflecting massive operating leverage in customer acquisition costs.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי ב-GAAP זינקו מ-4.2% ל-11.8%, וממחישים מנוף תפעולי יוצא דופן בירידת עלויות רכישת לקוח חדש.',
        managementTone: 'Very Bullish',
        managementToneHe: 'אופטימי מאוד (Very Bullish)',
        keyQuotes: [
          '"We have crossed inflection into permanent, compounding GAAP profitability across all three diversified business segments."',
          '"Galileo enterprise accounts expanded with two tier-one global banks onboarding this quarter."'
        ],
        keyQuotesHe: [
          '"עברנו נקודת פיתול היסטורית לרווחיות GAAP קבועה וצומחת בכל שלושת מגזרי הפעילות המגוונים שלנו."',
          '"פלטפורמת Galileo צירפה שני בנקים בינלאומיים מובילים מדרג ראשון ברבעון זה."'
        ],
        guidanceCommentary: 'Management raised full-year FY26 net revenue to $2.85B-$2.90B and GAAP EPS to $0.32.',
        guidanceCommentaryHe: 'ההנהלה העלתה את תחזית ההכנסות השנתית ל-2.85-2.90 מיליארד דולר ואת הרווח למניה ב-GAAP ל-0.32 דולר.',
        catalystsAndRisks: {
          bullPoints: [
            'Non-interest, fee-based revenue reached 46% of total net revenues.',
            'Credit quality remained resilient with charge-offs under 3.4%.'
          ],
          bullPointsHe: [
            'הכנסות מעמלות ללא סיכון אשראי טיפסו ל-46% מסך ההכנסות נטו.',
            'איכות תיק האשראי נותרה יציבה עם מחיקות חוב בשיעור נמוך של 3.4% בלבד.'
          ],
          bearPoints: [
            'High valuation multiple requires flawless execution next quarter.',
            'Competitive pressure from incumbent retail banking apps.'
          ],
          bearPointsHe: [
            'מכפיל הערכת השווי דורש ביצוע מושלם גם ברבעון הבא.',
            'תחרות גוברת מצד אפליקציות הבנקים המסורתיים.'
          ]
        },
        institutionalVerdict: {
          action: 'ACCUMULATE_ON_DIP',
          actionHe: 'צבירה מבוקרת בירידות (Accumulate on Dip)',
          actionEn: 'Accumulate on Dip',
          targetPriceRevision: '$16.50 (Up from $13.50)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-16.50$ (מ-13.50$)',
          confidenceScore: 91,
          verdictMemoHe: 'דוח חזק המאשרר את התזה למחזיקי התיק. מומלץ לנצל תנודתיות תוך-יומית לצבירה נוספת לטווח של שנתיים.',
          verdictMemoEn: 'Strong fundamental confirmation for portfolio holders. Use intraday volatility to accumulate for a 2-year horizon.'
        }
      }
    },

    // TODAY - AFTER CLOSE (AMC) - GOOGL
    {
      id: 'today-googl-amc',
      ticker: 'GOOGL',
      companyName: 'Alphabet Inc. (Google)',
      companyNameHe: 'אלפאבית / גוגל (GOOG / GOOGL)',
      sector: 'Communication Services & AI',
      sectorHe: 'שירותי תקשורת, פרסום דיגיטלי ו-AI',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'לאחר סגירת המסחר (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 2.15,
      actualEPS: 2.12,
      priorYearEPS: 1.85,
      yoyEpsGrowth: '+14.6%',
      consensusRevenue: '$92.4B',
      actualRevenue: '$91.8B',
      revenueYoY: '+12.4%',
      impliedMove: '±5.2%',
      status: 'REPORTED_MISS',
      statusLabelHe: 'דוח מעורב • צניחה של 7%- באפטר-מרקט',
      epsSurprisePercent: -1.4,
      revenueSurprisePercent: -0.65,
      guidanceVerdict: 'MAINTAINED',
      guidanceVerdictHe: 'אזהרת זינוק ב-CapEx ופספוס ביוטיוב',
      guidanceDetailsHe: 'מניית גוגל (GOOGL / GOOG) צנחה בכ-7% במסחר המאוחר עקב פספוס בהכנסות פרסום מיוטיוב ($8.92B מול $9.15B צפי) וזינוק חד בתחזית ההוצאות ההוניות (CapEx מעל $55B) המעיב על תזרים המזומנים החופשי בטווח הקצר, לצד אי-ודאות מהליך ההגבלים של משרד המשפטים (DOJ).',
      guidanceDetailsEn: 'Alphabet slid ~7% after-hours following YouTube advertising shortfall ($8.92B vs $9.15B est) and an aggressive upward revision in AI infrastructure CapEx (> $55B) pressuring near-term free cash flow margins.',
      keyCallFocusHe: 'סיבות לפספוס ביוטיוב, קצב שריפת ה-CapEx לחוות שרתי AI, מונטיזציית AI Overviews בחיפוש, ותוכניות ההגנה המשפטית מול משרד המשפטים (DOJ).',
      keyCallFocusEn: 'YouTube advertising deceleration drivers, AI CapEx expansion cadence, AI Overviews search monetization, and DOJ antitrust remedies.',
      aiTakeawayMemoHe: 'וול סטריט הענישה את גוגל בירידה חדה של 7% באפטר-מרקט על עליית הוצאות ה-CapEx ופספוס ביוטיוב. למשקיעי איכות לטווח של שנתיים, נקודת הפיתול מייצרת הזדמנות צבירה (Accumulate on Dip) במכפיל רווח מונמך לאחר שוך הפאניקה.',
      aiTakeawayMemoEn: 'Market punished Alphabet with a 7% after-hours selloff over aggressive AI CapEx ramp and YouTube ad weakness. For quality compounders with a 2-year horizon, this compression offers an attractive accumulation window.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Google Search: $52.8B (+10.5%) | YouTube Ads: $8.92B (+8.8% vs $9.15B exp) | Google Cloud: $11.8B (+28.0%) | Subscriptions & Devices: $11.0B | Other Bets: $3.2B',
        revenueBreakdownHe: 'מנוע חיפוש: 52.8 מיליארד דולר (+10.5%) | פרסום ביוטיוב: 8.92 מיליארד דולר (פספוס מול צפי של 9.15B) | ענן Google Cloud: 11.8 מיליארד דולר (+28.0%) | מנויים ומכשירים: 11.0 מיליארד דולר',
        operatingMarginAnalysis: 'Operating margin compressed 140 bps sequentially to 29.8% due to elevated server depreciation, higher technical infrastructure headcount, and aggressive AI data center energy costs.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי נשחקו ב-140 נקודות בסיס ל-29.8% עקב עלייה בהוצאות הפחת על שרתי AI, עלויות חשמל מוגברות ועלויות תשתית מואצות.',
        managementTone: 'Cautious',
        managementToneHe: 'זהיר וממוקד השקעות תשתיות (Cautious / Investment Phase)',
        keyQuotes: [
          '"We are investing aggressively in our technical infrastructure to seize the generative AI era, though CapEx will remain elevated through FY27."',
          '"YouTube advertising faced tough comparisons and selective brand advertiser spending moderation, while Cloud operating momentum remains robust."'
        ],
        keyQuotesHe: [
          '"אנו משקיעים באגרסיביות בתשתית הטכנולוגית שלנו כדי להוביל את עידן ה-AI הגנרטיבי, והוצאות ה-CapEx יישארו ברמה מוגברת גם ב-2027."',
          '"פרסום ביוטיוב התמודד עם בסיס השוואה קשה והאטה נקודתית בתקציבי מותגים, בעוד שענן Google Cloud ממשיך לשמור על מומנטום חזק."'
        ],
        guidanceCommentary: 'Management warned that CapEx will accelerate into FY27 and YouTube ad yields face near-term macro friction, causing consensus EPS estimate trims.',
        guidanceCommentaryHe: 'ההנהלה הזהירה כי הוצאות ה-CapEx ימשיכו לטפס ב-2027 וכי הכנסות יוטיוב חוות חיכוך מאקרו זמני, מה שהוביל אנליסטים להנמיך תחזיות רווח קצרות טווח.',
        catalystsAndRisks: {
          bullPoints: [
            'Google Cloud delivered $1.85B in quarterly operating profit, growing 28% YoY.',
            'Custom TPU chips (Trillium / v6) reduce dependency on third-party GPU vendors over time.',
            'Massive balance sheet cash reserves ($100B+) supporting ongoing share repurchases.'
          ],
          bullPointsHe: [
            'חטיבת הענן (Google Cloud) הניבה רווח תפעולי של 1.85 מיליארד דולר עם צמיחה של 28%.',
            'שבבי ה-TPU הקנייניים (Trillium) מקטינים תלות בספקי חומרה חיצוניים.',
            'יתרות מזומנים אדירות של מעל 100 מיליארד דולר התומכות בהמשך רכישות עצמיות של מניות.'
          ],
          bearPoints: [
            'Short-term free cash flow compression from elevated AI infrastructure CapEx.',
            'YouTube advertising facing tough competition from TikTok, Meta Reels, and Connected TV.',
            'DOJ antitrust trial remedies (potential search distribution restrictions or Chrome spinoff risk).'
          ],
          bearPointsHe: [
            'שחיקה בתזרים המזומנים החופשי בטווח הקצר עקב זינוק בהוצאות ההוניות.',
            'תחרות גוברת על תקציבי וידאו מצד טיקטוק, מטא וטלוויזיות חכמות.',
            'סיכוני פסיקה והגבלים עסקיים מצד משרד המשפטים בארה"ב.'
          ]
        },
        institutionalVerdict: {
          action: 'ACCUMULATE_ON_DIP',
          actionHe: 'צבירה מבוקרת בירידות (Accumulate on Dip)',
          actionEn: 'Accumulate on Dip',
          targetPriceRevision: '$310.00 (Adjusted from $340.00)',
          targetPriceRevisionHe: 'מחיר היעד הותאם ל-310.00$ (מ-340.00$)',
          confidenceScore: 92,
          verdictMemoHe: 'הצניחה של 7% באפטר-מרקט מהווה תגובת יתר מוסדית לגיטימית לפספוס ביוטיוב ולזינוק ב-CapEx. למשקיעי ערך ואיכות עם אופק של שנתיים, מדובר בהזדמנות צבירה אטרקטיבית במכפיל רווח מונמך סביב $280-$285 לקראת שווי הוגן של $310.',
          verdictMemoEn: 'The 7% after-hours slide is an institutional reaction to YouTube ad softness and heavy CapEx. For long-term quality investors, this multiple compression provides an attractive staged accumulation opportunity towards $310 fair value.'
        }
      }
    },

    // TODAY - PRE-MARKET (BMO) - KO
    {
      id: 'today-ko-bmo',
      ticker: 'KO',
      companyName: 'The Coca-Cola Company',
      companyNameHe: 'קוקה-קולה',
      sector: 'Consumer Staples',
      sectorHe: 'מוצרי צריכה בסיסיים',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'BMO',
      timingLabelHe: 'לפני פתיחת המסחר (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 0.74,
      actualEPS: 0.77,
      priorYearEPS: 0.71,
      yoyEpsGrowth: '+8.5%',
      consensusRevenue: '$12.1B',
      actualRevenue: '$12.35B',
      revenueYoY: '+5.8%',
      impliedMove: '±2.4%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 4.1,
      revenueSurprisePercent: 2.1,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית צמיחה אורגנית',
      guidanceDetailsHe: 'צמיחה אורגנית של 9% המונעת מעליית מחירים עולמית של 6% ועלייה של 3% בנפח המכירות בשווקים מתעוררים.',
      guidanceDetailsEn: 'Organic revenue growth of 9% driven by 6% price/mix realization and 3% volume growth in emerging markets.',
      keyCallFocusHe: 'גמישות תמחור מול אינפלציה, מכירות בשווקים מתעוררים (הודו ודרום אמריקה) ותשואת דיבידנד מוגדלת.',
      keyCallFocusEn: 'Pricing power against inflation, emerging market volume trajectory, and continued dividend aristocrat compounder.',
      aiTakeawayMemoHe: 'מבצר יציבות דפנסיבי מושלם לתיק. צמיחה אורגנית בריאה עם תזרים חופשי איתן המכסה דיבידנד של 3.1%.',
      aiTakeawayMemoEn: 'Defensive fortress compounder for portfolio stability. Healthy organic top-line with pristine FCF covering 3.1% dividend.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'North America: $4.6B (+6%) | EMEA: $2.4B (+8%) | Latin America: $1.8B (+12%) | Asia Pacific: $1.7B (+5%) | Bottling & Global Ventures: $1.85B',
        revenueBreakdownHe: 'צפון אמריקה: 4.6 מיליארד דולר (+6%) | אירופה ומזרח תיכון: 2.4 מיליארד דולר (+8%) | אמריקה הלטינית: 1.8 מיליארד דולר (+12%) | אסיה פסיפיק: 1.7 מיליארד דולר (+5%)',
        operatingMarginAnalysis: 'Operating margin held steady at an industry-leading 30.2%, demonstrating supreme pricing elasticity across retail shelves.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי נותרו בצמרת התעשייה ברמה של 30.2%, המוכיחה גמישות תמחור עליונה על מדפי הקמעונאות.',
        managementTone: 'Bullish',
        managementToneHe: 'יציב ובטוח (Bullish)',
        keyQuotes: [
          '"Our all-weather commercial execution and local bottling partnerships delivered solid volume and transaction growth globally."'
        ],
        keyQuotesHe: [
          '"ההוצאה לפועל המסחרית שלנו בכל תנאי שוק ושותפויות הביקבוק המקומיות הניבו צמיחה איתנה בנפח המכירות ובעסקאות ברחבי העולם."'
        ],
        guidanceCommentary: 'Full year organic revenue growth raised to 9%-10% range with comparable EPS growth of 5%-6%.',
        guidanceCommentaryHe: 'תחזית הצמיחה האורגנית השנתית הועלתה לטווח של 9%-10% עם צמיחה ברווח למניה של 5%-6%.',
        catalystsAndRisks: {
          bullPoints: [
            'Global volume expansion driven by Fairlife ultra-filtered milk and Coca-Cola Zero Sugar (+11%).',
            'Over 62 consecutive years of dividend increases.'
          ],
          bullPointsHe: [
            'צמיחה מואצת במותג החלב Fairlife ובקוקה-קולה זירו (+11% בנפח).',
            'מעל 62 שנים רצופות של הגדלת דיבידנד שנתי.'
          ],
          bearPoints: [
            'Foreign currency translation headwinds shaving ~2% off reported USD growth.'
          ],
          bearPointsHe: [
            'השפעות שער חליפין (דולר חזק) גורעות כ-2% מהצמיחה המדווחת בדולרים.'
          ]
        },
        institutionalVerdict: {
          action: 'HOLD',
          actionHe: 'החזקה / עוגן דפנסיבי (Hold & Reinvest)',
          actionEn: 'Hold & Reinvest',
          targetPriceRevision: '$108.00 (Up from $96.00)',
          targetPriceRevisionHe: 'מחיר יעד עודכן ל-108.00$ (מ-96.00$)',
          confidenceScore: 92,
          verdictMemoHe: 'נכס דפנסיבי מעולה בתיק המאזן את מניות הטכנולוגיה עתירות הבטא, עם תזרים דיבידנד קבוע ויציב.',
          verdictMemoEn: 'Excellent defensive anchor dampening high-beta tech volatility while generating compounding cash dividends.'
        }
      }
    },

    // TODAY - AFTER CLOSE (AMC) - LRCX (Lam Research)
    {
      id: 'today-lrcx-amc',
      ticker: 'LRCX',
      companyName: 'Lam Research Corporation',
      companyNameHe: 'לאם ריסרץ\' (Lam Research)',
      sector: 'Semiconductor Capital Equipment',
      sectorHe: 'ציוד לייצור שבבים וזיכרונות מתקדמים (WFE)',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'היום לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q1 FY27',
      consensusEPS: 0.81,
      actualEPS: 0.86,
      priorYearEPS: 0.68,
      yoyEpsGrowth: '+26.5%',
      consensusRevenue: '$4.05B',
      actualRevenue: '$4.17B',
      revenueYoY: '+19.8%',
      impliedMove: '±6.4%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 6.2,
      revenueSurprisePercent: 3.0,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'ביקושי שיא בציוד איכול ושיקוע (Etch & Deposition) עבור שבבי זיכרון HBM וטכנולוגיית Gate-All-Around (GAA).',
      guidanceDetailsEn: 'Surging demand for leading-edge etch and deposition equipment supporting HBM packaging and GAA transistor scaling.',
      keyCallFocusHe: 'הוצאות ציוד מפעלי שבבים (WFE), התאוששות זיכרונות NAND, וביקושי שבבי AI מתקדמים.',
      keyCallFocusEn: 'Wafer Fab Equipment spending trajectory, NAND memory recovery, and advanced AI packaging tools.',
      aiTakeawayMemoHe: 'שחקנית מפתח קריטית בשרשרת אספקת ה-AI: שכבות הזיכרון הגבוהות של HBM3e ו-HBM4 דורשות פי 3 יותר ציוד איכול קריטי.',
      aiTakeawayMemoEn: 'Mission-critical AI hardware enabler: HBM memory packaging requires 3x etch intensity, driving multi-year secular tailwinds.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Systems Revenue: $2.55B (+24% YoY) | Customer Support Business Group (CSBG): $1.62B (+14% YoY)',
        revenueBreakdownHe: 'מערכות ייצור שבבים חדשות: 2.55 מיליארד דולר (+24%) | שירותים, חלפים ושדרוגים (CSBG): 1.62 מיליארד דולר (+14%)',
        operatingMarginAnalysis: 'Operating margin expanded to 30.8% driven by high factory throughput and rich product mix in advanced packaging.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי התרחבו ל-30.8% הודות לניצולת ייצור גבוהה ותמהיל מוצרים רווחי במיוחד במארזים מתקדמים.',
        managementTone: 'Very Bullish',
        managementToneHe: 'אופטימי מאוד (Very Bullish)',
        keyQuotes: [
          '"AI-driven demand for high-bandwidth memory (HBM) and advanced packaging is accelerating, creating sustained growth across our etch leadership portfolio."'
        ],
        keyQuotesHe: [
          '"ביקושי ה-AI לזיכרונות HBM ולמארזים מתקדמים מאיצים ומייצרים צמיחה מתמשכת בפורטפוליו האיכול המוביל שלנו."'
        ],
        guidanceCommentary: 'Management raised Q2 FY27 revenue guidance midpoint to $4.30B with EPS of $0.87 ± $0.10.',
        guidanceCommentaryHe: 'ההנהלה העלתה את תחזית ההכנסות לרבעון הבא ל-4.30 מיליארד דולר עם רווח למניה של 0.87 דולר.',
        catalystsAndRisks: {
          bullPoints: [
            'HBM memory stacking requiring unprecedented aspect ratio etching precision.',
            'Recurring customer support revenue (CSBG) providing downside stability.'
          ],
          bullPointsHe: [
            'מבנה שכבות HBM דורש דיוק איכול חסר תקדים המגן על מעמד השוק של לאם.',
            'הכנסות שירותים חוזרות (CSBG) הממתנות תנודתיות מחזורית.'
          ],
          bearPoints: [
            'Export controls on advanced semiconductor equipment shipments to China.'
          ],
          bearPointsHe: [
            'מגבלות ייצוא של הממשל האמריקאי על משלוחי ציוד מתקדם לסין.'
          ]
        },
        institutionalVerdict: {
          action: 'ACCUMULATE_ON_DIP',
          actionHe: 'צבירה מבוקרת (Accumulate on Dip)',
          actionEn: 'Accumulate on Dip',
          targetPriceRevision: '$235.00 (Up from $190.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-235.00$ (מ-190.00$)',
          confidenceScore: 92,
          verdictMemoHe: 'מובילה טכנולוגית שאין לה תחליף בייצור זיכרונות AI מהירים. נקודת כניסה אטרקטיבית במימושים.',
          verdictMemoEn: 'Irreplaceable market leader in AI memory etch tools. Prime buy candidate on market dips.'
        }
      }
    },

    // TODAY - PRE-MARKET (BMO) - NEE (NextEra Energy)
    {
      id: 'today-nee-bmo',
      ticker: 'NEE',
      companyName: 'NextEra Energy, Inc.',
      companyNameHe: 'נקסטארה אנרג\'י (NextEra)',
      sector: 'Utilities & Clean Energy',
      sectorHe: 'תשתיות אנרגיה, חשמל ופרויקטים מתחדשים',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'BMO',
      timingLabelHe: 'היום לפני הפתיחה (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 0.98,
      actualEPS: 1.03,
      priorYearEPS: 0.94,
      yoyEpsGrowth: '+9.6%',
      consensusRevenue: '$7.85B',
      actualRevenue: '$8.12B',
      revenueYoY: '+13.2%',
      impliedMove: '±3.1%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 5.1,
      revenueSurprisePercent: 3.4,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת יעד צמיחה רב-שנתי',
      guidanceDetailsHe: 'תוספת של 3.2 ג\'יגה-וואט לצבר פרויקטי אנרגיה מתחדשת ואגירה, עם התמקדות בהסכמי אספקת חשמל ייעודיים לחוות שרתי AI.',
      guidanceDetailsEn: 'Added 3.2 GW of new renewable and battery storage projects to backlog, driven by long-term power purchase agreements with hyperscale AI data centers.',
      keyCallFocusHe: 'ביקושי חשמל ממרכזי נתוני AI, צמיחת בסיס הנכסים המפוקח של FPL (חברת החשמל של פלורידה), וקצב העלאת הדיבידנד השנתי.',
      keyCallFocusEn: 'AI data center power interconnection demand, Florida Power & Light (FPL) rate base growth, and dividend guidance.',
      aiTakeawayMemoHe: 'עוגן תשתיות מספר 1 בארה"ב: הביקוש הגואה לחשמל ירוק מצד ענקיות הטכנולוגיה הופך את נקסטארה למרוויחה הגדולה ביותר ממשבר האנרגיה של ה-AI.',
      aiTakeawayMemoEn: 'Premier US utility compounder: Rising data center power demand supercharges NextEra\'s multi-year renewable and storage pipeline.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Florida Power & Light (FPL): $5.6B (+11%) | NextEra Energy Resources (NEER Clean Energy): $2.52B (+18%)',
        revenueBreakdownHe: 'חברת החשמל פלורידה (FPL): 5.6 מיליארד דולר (+11%) | חטיבת אנרגיה מתחדשת (NEER): 2.52 מיליארד דולר (+18%)',
        operatingMarginAnalysis: 'Adjusted EBITDA margin reached 48.2%, supported by low fuel costs and premium regulatory constructive environment in Florida.',
        operatingMarginAnalysisHe: 'שולי EBITDA מתואמים של 48.2%, המגובים בסביבה רגולטורית תומכת ועלויות ייצור סולאריות תחרותיות.',
        managementTone: 'Very Bullish',
        managementToneHe: 'אופטימי מאוד (Very Bullish)',
        keyQuotes: [
          '"We are seeing unprecedented power demand growth driven by artificial intelligence data centers, domestic manufacturing, and broad electrification."'
        ],
        keyQuotesHe: [
          '"אנו עדים לצמיחה חסרת תקדים בביקוש לחשמל, המונעת ממרכזי נתוני בינה מלאכותית, ייצור תעשייתי מקומי וחשמול נרחב."'
        ],
        guidanceCommentary: 'Management reiterated 6% to 8% annual adjusted EPS growth target through 2027 and expected ~10% annual dividend growth.',
        guidanceCommentaryHe: 'ההנהלה אשררה יעד צמיחה של 6%-8% ברווח למניה עד 2027 וצמיחה שנתית של כ-10% בדיבידנד.',
        catalystsAndRisks: {
          bullPoints: [
            'Over 24 GW renewable development pipeline with multi-decade contracts.',
            'Direct grid tie-ins for major cloud data centers seeking reliable clean energy.'
          ],
          bullPointsHe: [
            'צבר פרויקטים מתחדשים של מעל 24 ג\'יגה-וואט עם חוזים ארוכי טווח.',
            'חיבור ישיר של חוות שרתים ענקיות לרשתות החשמל של החברה.'
          ],
          bearPoints: [
            'Sensitivity to high interest rate environments on debt refinancing costs.'
          ],
          bearPointsHe: [
            'רגישות לסביבת ריבית גבוהה בעלויות מימון מחדש של חוב פרויקטים.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / עוגן תשתיות ודיבידנד (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$92.00',
          targetPriceRevisionHe: 'מחיר יעד: 92.00$',
          confidenceScore: 93,
          verdictMemoHe: 'שילוב מושלם של יציבות תשתיות מפוקחת עם מנוף צמיחה אדיר מביקושי ה-AI. איכות עליונה לתיק ארוך טווח.',
          verdictMemoEn: 'Perfect combination of defensive regulated utility moat and secular AI power demand upside.'
        }
      }
    },

    // TODAY - PRE-MARKET (BMO) - T (AT&T Inc.)
    {
      id: 'today-t-bmo',
      ticker: 'T',
      companyName: 'AT&T Inc.',
      companyNameHe: 'איי טי אנד טי (AT&T)',
      sector: 'Telecommunications',
      sectorHe: 'תקשורת, סיבים אופטיים ו-5G',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'BMO',
      timingLabelHe: 'היום לפני הפתיחה (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 0.57,
      actualEPS: 0.60,
      priorYearEPS: 0.58,
      yoyEpsGrowth: '+3.4%',
      consensusRevenue: '$30.4B',
      actualRevenue: '$30.8B',
      revenueYoY: '+2.2%',
      impliedMove: '±3.0%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 5.3,
      revenueSurprisePercent: 1.3,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית תזרים מזומנים חופשי',
      guidanceDetailsHe: 'גיוס של 403 אלף מנויי פוסטפייד סלולריים ו-285 אלף מנויי סיבים אופטיים (AT&T Fiber). תזרים חופשי רבעוני של 5.1 מיליארד דולר.',
      guidanceDetailsEn: 'Added 403K postpaid phone net adds and 285K AT&T Fiber subscribers. Free cash flow of $5.1B exceeded consensus expectations.',
      keyCallFocusHe: 'שיעור נטישת מנויים (Postpaid Churn) בשפל של 0.78%, צמיחת הכנסות מסיבים אופטיים, והפחתת יחס החוב נטו ל-EBITDA לכיוון 2.5x.',
      keyCallFocusEn: 'Record-low 0.78% postpaid churn, Fiber ARPU expansion, and net debt-to-EBITDA deleveraging trajectory.',
      aiTakeawayMemoHe: 'מכונת תזרים ומחיקת חוב: יציבות מנויים מעולה וצמיחה דו-ספרתית בסיבים תומכות בתשואת דיבידנד של 5.2% ומחיקת חוב מואצת.',
      aiTakeawayMemoEn: 'Cash generation and debt reduction machine: Low churn and fiber expansion support generous 5.2% dividend yield and balance sheet repair.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Mobility: $21.5B (+3.5%) | Business Wireline: $4.6B (-8%) | Consumer Wireline (Broadband & Fiber): $3.5B (+7.5%) | Other: $1.2B',
        revenueBreakdownHe: 'שירותי סלולר ומכשירים (Mobility): 21.5 מיליארד דולר (+3.5%) | תקשורת עסקית קווית: 4.6 מיליארד דולר (-8%) | סיבים אופטיים לצרכנים: 3.5 מיליארד דולר (+7.5%)',
        operatingMarginAnalysis: 'Operating margin expanded to 21.5% from 19.8% YoY driven by cost transformation savings and higher fiber broadband ARPU.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי עלו ל-21.5% הודות לתוכנית התייעלות מבנית ועלייה בהכנסה הממוצעת למנוי סיבים (ARPU).',
        managementTone: 'Bullish',
        managementToneHe: 'חיובי ויציב (Bullish)',
        keyQuotes: [
          '"Our investment-led strategy is delivering sustainable growth: 5G and fiber customer additions drove strong operating leverage and substantial free cash flow."'
        ],
        keyQuotesHe: [
          '"האסטרטגיה הממוקדת שלנו מניבה צמיחה בת-קיימא: הגידול במנויי 5G וסיבים אופטיים ייצר מנוף תפעולי חזק ותזרים מזומנים חופשי מרשים."'
        ],
        guidanceCommentary: 'Full-year free cash flow guidance raised to $16.5B-$17.5B, comfortably securing dividend and share buyback resumption.',
        guidanceCommentaryHe: 'תחזית התזרים החופשי השנתי הועלתה ל-16.5-17.5 מיליארד דולר, המבטיחה כיסוי מלא לדיבידנד וחידוש רכישות עצמיות.',
        catalystsAndRisks: {
          bullPoints: [
            'Fiber revenue growing at 17%+ annualized with 40%+ customer penetration in footprint.',
            'Generous 5.2% dividend yield backed by ~60% FCF payout ratio.'
          ],
          bullPointsHe: [
            'הכנסות הסיבים האופטיים צומחות במעל 17% בקצב שנתי.',
            'תשואת דיבידנד גבוהה של 5.2% עם יחס כיסוי שמרני של 60% מתזרים חופשי.'
          ],
          bearPoints: [
            'Structural ongoing decline in legacy corporate copper business wireline.'
          ],
          bearPointsHe: [
            'ירידה מתמשכת בהכנסות מקווי נחושת מסורתיים במגזר העסקי.'
          ]
        },
        institutionalVerdict: {
          action: 'HOLD',
          actionHe: 'החזקה / מניית תשואה ודיבידנד (Hold & Yield)',
          actionEn: 'Hold & Yield',
          targetPriceRevision: '$24.00',
          targetPriceRevisionHe: 'מחיר יעד: 24.00$',
          confidenceScore: 89,
          verdictMemoHe: 'נכס תשואה סולידי לתיקי הכנסה. שיפור עקבי במאזן ובצמיחת הסיבים מבטיח יציבות דיבידנד לאורך זמן.',
          verdictMemoEn: 'Dependable cash cow for dividend seekers. Fiber ramp and balance sheet deleveraging protect payouts.'
        }
      }
    },

    // TOMORROW - PRE-MARKET (BMO) - ABBV
    {
      id: 'tomorrow-abbv-bmo',
      ticker: 'ABBV',
      companyName: 'AbbVie Inc.',
      companyNameHe: 'אבוויי (AbbVie)',
      sector: 'Health Care',
      sectorHe: 'ביופארמה ובריאות',
      reportDate: tomorrowStr,
      dayCategory: 'TOMORROW',
      timing: 'BMO',
      timingLabelHe: 'מחר לפני הפתיחה (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 2.98,
      priorYearEPS: 2.95,
      yoyEpsGrowth: '+1.0%',
      consensusRevenue: '$14.8B',
      revenueYoY: '+4.2%',
      impliedMove: '±3.6%',
      status: 'UPCOMING',
      statusLabelHe: 'ממתין לדיווח מחר',
      guidanceVerdict: 'PENDING',
      guidanceVerdictHe: 'הנחיות קודמות בתוקף',
      guidanceDetailsHe: 'תרופות הדגל Skyrizi ו-Rinvoq צפויות לעקוף יחד 17 מיליארד דולר בהכנסות שנתיות ולפצות במלואן על שחיקת Humira.',
      guidanceDetailsEn: 'Skyrizi and Rinvoq combined projected to exceed $17B in annualized run-rate, fully offsetting Humira biosimilar erosion.',
      keyCallFocusHe: 'הכנסות Skyrizi/Rinvoq, שימור נתח שוק של בוטוקס קוסמטי וצנרת תרופות נוירולוגיה ואונקולוגיה.',
      keyCallFocusEn: 'Skyrizi/Rinvoq sales trajectory, Botox cosmetic resiliency, and oncology/neuroscience clinical catalysts.',
      aiTakeawayMemoHe: 'נקודת המפנה לאחר פקיעת פטנט הומירה הושלמה בהצלחה. צפי לעדכון כלפי מעלה של תחזית הרווח לשנת 2027.',
      aiTakeawayMemoEn: 'Post-Humira patent cliff inflection fully realized. Anticipating upward revision of long-term FY27 earnings guidance.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Skyrizi: $3.2B (+42%) | Rinvoq: $1.6B (+45%) | Humira: $2.1B (-32%) | Botox (Therapeutic & Cosmetic): $1.45B (+5%) | Oncology: $1.6B',
        revenueBreakdownHe: 'Skyrizi: 3.2 מיליארד דולר (+42%) | Rinvoq: 1.6 מיליארד דולר (+45%) | Humira: 2.1 מיליארד דולר (-32%) | בוטוקס: 1.45 מיליארד דולר (+5%) | אונקולוגיה: 1.6 מיליארד דולר',
        operatingMarginAnalysis: 'Operating margin projected at 44.5%, with massive operating cash flow generation funding $3.8B in annual debt reduction.',
        operatingMarginAnalysisHe: 'שולי רווח תפעולי חזויים של 44.5%, עם תזרים מזומנים תפעולי ענק המאפשר הפחתת חוב שנתית של 3.8 מיליארד דולר.',
        managementTone: 'Bullish',
        managementToneHe: 'חיובי (Bullish)',
        keyQuotes: [
          '"Skyrizi and Rinvoq are delivering beyond our most optimistic commercial models across dermatology, gastroenterology, and rheumatology."'
        ],
        keyQuotesHe: [
          '"Skyrizi ו-Rinvoq מציגות ביצועים העולים על התחזיות האופטימיות ביותר שלנו בתחומי העור, מערכת העיכול והפרקים."'
        ],
        guidanceCommentary: 'Management expected to reaffirm high single-digit compound annual revenue growth through the end of the decade.',
        guidanceCommentaryHe: 'ההנהלה צפויה לאשרר קצב צמיחה שנתי מורכב של אחוזים בודדים גבוהים עד סוף העשור.',
        catalystsAndRisks: {
          bullPoints: [
            'Durable 3.4% dividend yield with 52-year dividend growth streak.',
            'Fast expansion into new indications for Rinvoq and next-gen oncology ADCs.'
          ],
          bullPointsHe: [
            'תשואת דיבידנד יציבה של 3.4% ורצף של 52 שנות העלאת דיבידנד (Dividend King).',
            'אישורים רגולטוריים לאינדיקציות רפואיות חדשות ב-Rinvoq.'
          ],
          bearPoints: [
            'Pricing pressure under Medicare drug price negotiations starting in 2027.'
          ],
          bearPointsHe: [
            'לחצי מחירים במסגרת משא ומתן מחירי תרופות של ביטוח הבריאות Medicare ב-2027.'
          ]
        },
        institutionalVerdict: {
          action: 'ACCUMULATE_ON_DIP',
          actionHe: 'צבירה מבוקרת (Accumulate)',
          actionEn: 'Accumulate',
          targetPriceRevision: '$320.00 (Up from $280.00)',
          targetPriceRevisionHe: 'מחיר היעד הועלה ל-320.00$ (מ-280.00$)',
          confidenceScore: 89,
          verdictMemoHe: 'השקעת ערך ודיבידנד איכותית בתיק. המעבר מהומירה לתרופות הדור הבא הוכיח את יכולת ההוצאה לפועל של ההנהלה.',
          verdictMemoEn: 'High quality dividend compounder. Successful pivot from Humira validates management execution and moat durability.'
        }
      }
    },

    // TOMORROW - AFTER CLOSE (AMC) - AMZN
    {
      id: 'tomorrow-amzn-amc',
      ticker: 'AMZN',
      companyName: 'Amazon.com, Inc.',
      companyNameHe: 'אמזון (Amazon)',
      sector: 'Consumer Discretionary & Cloud',
      sectorHe: 'מסחר אלקטרוני וענן (AWS)',
      reportDate: tomorrowStr,
      dayCategory: 'TOMORROW',
      timing: 'AMC',
      timingLabelHe: 'מחר לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 1.48,
      priorYearEPS: 1.20,
      yoyEpsGrowth: '+23.3%',
      consensusRevenue: '$178.5B',
      revenueYoY: '+12.5%',
      impliedMove: '±6.2%',
      status: 'UPCOMING',
      statusLabelHe: 'ממתין לדיווח מחר בנעילה',
      guidanceVerdict: 'PENDING',
      guidanceVerdictHe: 'טרם פורסם',
      guidanceDetailsHe: 'הציפיות ממוקדות בהאצת צמיחת ענן AWS מעל 20% וברווחיות מגזר הפרסום הדיגיטלי ב-Prime Video.',
      guidanceDetailsEn: 'Expectations centered on AWS acceleration above 20% and digital advertising margins in Prime Video.',
      keyCallFocusHe: 'קצב צמיחת AWS Cloud, רווח תפעולי בצפון אמריקה, מנוע הפרסום הדיגיטלי ותחזית עונת החגים (Q4).',
      keyCallFocusEn: 'AWS growth re-acceleration %, North America retail margin expansion, advertising revenue, and Q4 holiday guidance.',
      aiTakeawayMemoHe: 'מנוע הצמיחה המרכזי של התיק. שיפור ביעילות הלוגיסטית האזורית בשילוב שבבי Trainium 2 מייצרים מרווחי שיא.',
      aiTakeawayMemoEn: 'Core portfolio compounder. Regionalized fulfillment network and Trainium 2 custom silicon driving record operating leverage.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Online Stores: $68.5B (+8%) | Third-Party Seller Services: $41.2B (+15%) | AWS Cloud: $30.8B (+21.5%) | Advertising: $16.8B (+24%) | Subscription Services: $12.2B (+14%)',
        revenueBreakdownHe: 'חנויות מקוונות: 68.5 מיליארד דולר (+8%) | שירותי מוכרים צד שלישי: 41.2 מיליארד דולר (+15%) | ענן AWS: 30.8 מיליארד דולר (+21.5%) | פרסום דיגיטלי: 16.8 מיליארד דולר (+24%) | שירותי מנויים (Prime): 12.2 מיליארד דולר (+14%)',
        operatingMarginAnalysis: 'Consolidated operating margin projected to expand from 7.8% to 10.4%, led by 38%+ operating margin in AWS Cloud.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי המאוחד צפויים להתרחב מ-7.8% ל-10.4%, בהובלת שולי רווח של 38%+ בענן AWS.',
        managementTone: 'Very Bullish',
        managementToneHe: 'חיובי מאוד (Very Bullish)',
        keyQuotes: [
          '"AWS has re-accelerated into hyper-growth as corporate clients finish IT cost optimization and ramp generative AI workloads."'
        ],
        keyQuotesHe: [
          '"ענן AWS חזר לצמיחה מואצת כאשר לקוחות ארגוניים השלימו את אופטימיזציית העלויות ומגדילים את עומסי עבודה של AI."'
        ],
        guidanceCommentary: 'Q4 Holiday Guidance expected to target $188B-$195B in revenue with strong operating income of $18B+.',
        guidanceCommentaryHe: 'תחזית עונת החגים לרבעון הרביעי צפויה לעמוד על 188-195 מיליארד דולר עם רווח תפעולי מעל 18 מיליארד דולר.',
        catalystsAndRisks: {
          bullPoints: [
            'High-margin advertising segment growing 2x faster than core retail.',
            'Custom Trainium2/Inferentia silicon offering 40% better price-performance than commercial GPUs.'
          ],
          bullPointsHe: [
            'מגזר הפרסום בעל הרווחיות הגבוהה צומח בקצב כפול ממסחר הקמעונאות.',
            'שבבי Trainium2 מספקים יחס עלות-ביצועים עדיף ב-40% על שבבים מסחריים.'
          ],
          bearPoints: [
            'Rising shipping and wage inflation during peak fourth-quarter delivery season.'
          ],
          bearPointsHe: [
            'עליית עלויות שכר ומשלוחים לקראת שיא עונת החגים של הרבעון הרביעי.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / עוגן צמיחה (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$290.00 (Up from $245.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-290.00$ (מ-245.00$)',
          confidenceScore: 97,
          verdictMemoHe: 'אחת הפוזיציות האסטרטגיות החזקות ביותר בתיק. שלוש מנועי רווח עוצמתיים: ענן AWS, מודעות פרסום ומועדון Prime.',
          verdictMemoEn: 'Premier strategic growth pillar in portfolio. Three compounding profit engines: AWS, digital advertising, and Prime loyalty.'
        }
      }
    },

    // THIS WEEK - NVDA
    {
      id: 'week-nvda-amc',
      ticker: 'NVDA',
      companyName: 'NVIDIA Corporation',
      companyNameHe: 'אנבידיה (NVIDIA)',
      sector: 'Information Technology',
      sectorHe: 'שבבים ותשתיות AI',
      reportDate: dayAfterTomorrowStr,
      dayCategory: 'THIS_WEEK',
      timing: 'AMC',
      timingLabelHe: 'השבוע לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 FY27',
      consensusEPS: 0.95,
      actualEPS: 1.08,
      priorYearEPS: 0.78,
      yoyEpsGrowth: '+38.5%',
      consensusRevenue: '$38.5B',
      actualRevenue: '$40.8B',
      revenueYoY: '+46.0%',
      impliedMove: '±7.8%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות (Beat & Raise)',
      epsSurprisePercent: 13.7,
      revenueSurprisePercent: 6.0,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית חדה',
      guidanceDetailsHe: 'ביקוש חסר תקדים לשבבי Blackwell Ultra; אספקה מלאה נמכרה מראש ל-12 החודשים הבאים לכל ענקיות הענן והממשלות.',
      guidanceDetailsEn: 'Unprecedented Blackwell Ultra demand; production fully sold out for the next 12 months across all hyperscalers and sovereign AI clouds.',
      keyCallFocusHe: 'נפח משלוחי שרתי Blackwell, אספקת קירור נוזלי, ושולי רווח גולמי מעל 74%.',
      keyCallFocusEn: 'Blackwell server rack shipments, liquid cooling supply chain integrity, and 74%+ gross margin retention.',
      aiTakeawayMemoHe: 'דוח מפלצתי המאשרר את מעמד המונופול של אנבידיה בתשתיות המחשוב. הכנסות תוכנת CUDA ורשתות שוברות שיאים.',
      aiTakeawayMemoEn: 'Monumental report cementing NVIDIA computing infrastructure hegemony. CUDA software enterprise ARR & InfiniBand scaling rapidly.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Data Center: $35.2B (+55% YoY) | Gaming & AI PC: $3.4B (+14%) | Professional Visualization: $650M (+22%) | Automotive: $550M (+42%)',
        revenueBreakdownHe: 'חוות שרתים ודאטה סנטר: 35.2 מיליארד דולר (+55%) | גיימינג ומחשבי AI: 3.4 מיליארד דולר (+14%) | הדמיה מקצועית: 650 מיליון דולר (+22%) | רכב ואוטונומי: 550 מיליון דולר (+42%)',
        operatingMarginAnalysis: 'Gross margin maintained at 74.8% and operating margin at 62.1%, generating unmatched institutional cash flow.',
        operatingMarginAnalysisHe: 'שולי הרווח הגולמי נשמרו ברמה פנומנלית של 74.8% ושולי הרווח התפעולי ב-62.1%, תוך ייצור מזומנים מוסדי חסר תקדים.',
        managementTone: 'Very Bullish',
        managementToneHe: 'שיא האופטימיות (Very Bullish)',
        keyQuotes: [
          '"Blackwell is in full production. Demand is extraordinary, and sovereign AI compute buildouts have added a multi-billion dollar second layer of demand."'
        ],
        keyQuotesHe: [
          '"שבבי Blackwell בייצור מלא. הביקוש הוא יוצא דופן, ופרויקטי AI לאומיים של מדינות הוסיפו רובד ביקושים של מיליארדי דולרים."'
        ],
        guidanceCommentary: 'Q4 revenue guidance guided to $42.5B-$44.0B, well ahead of consensus expectations.',
        guidanceCommentaryHe: 'תחזית ההכנסות לרבעון הבא הועלתה ל-42.5-44.0 מיליארד דולר, הרבה מעל צפי הקונצנזוס בוול סטריט.',
        catalystsAndRisks: {
          bullPoints: [
            'CUDA enterprise software ARR growing over 60% creating durable sticky recurring revenue.',
            'Massive $50B share buyback program returning surplus cash to shareholders.'
          ],
          bullPointsHe: [
            'הכנסות חוזרות מתכנת CUDA צומחות בלמעלה מ-60% ויוצרות מנעול לקוחות בלתי שביר.',
            'תוכנית רכישת מניות עצמית (Buyback) ענקית בהיקף של 50 מיליארד דולר.'
          ],
          bearPoints: [
            'Supply chain constraints in packaging (CoWoS) and liquid-cooling manifold availability.'
          ],
          bearPointsHe: [
            'מגבלות שרשרת אספקה באריזות שבבים מתקדמות (CoWoS) ורכיבי קירור נוזלי.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / מוביל טכנולוגי (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$260.00 (Up from $210.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-260.00$ (מ-210.00$)',
          confidenceScore: 98,
          verdictMemoHe: 'פוזיציית הדגל בתיק. אין תחליף קרוב לחפיר החומרה והתוכנה של אנבידיה. להמשיך להחזיק כפוזיציית ליבה ארוכת טווח.',
          verdictMemoEn: 'Flagship portfolio position. No near-term substitute for NVIDIA CUDA software and NVLink ecosystem. Core multi-year hold.'
        }
      }
    },

    // THIS WEEK - UBER
    {
      id: 'week-uber-bmo',
      ticker: 'UBER',
      companyName: 'Uber Technologies, Inc.',
      companyNameHe: 'אובר (Uber)',
      sector: 'Industrials & Technology',
      sectorHe: 'תחבורה, שילוח ופלטפורמות',
      reportDate: inThreeDaysStr,
      dayCategory: 'THIS_WEEK',
      timing: 'BMO',
      timingLabelHe: 'השבוע לפני הפתיחה (BMO)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 0.62,
      actualEPS: 0.71,
      priorYearEPS: 0.45,
      yoyEpsGrowth: '+57.8%',
      consensusRevenue: '$11.8B',
      actualRevenue: '$12.1B',
      revenueYoY: '+21.0%',
      impliedMove: '±6.5%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 14.5,
      revenueSurprisePercent: 2.5,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'שולי תזרים מזומנים חופשי חצו 15% מסך ההזמנות הגולמיות. שותפויות AV אוטונומיות (עם Waymo) הופכות את אובר לרשת ההפצה המובילה.',
      guidanceDetailsEn: 'Free cash flow margin crossed 15% of gross bookings. Autonomous vehicle partnerships (Waymo) solidify Uber as premier distribution network.',
      keyCallFocusHe: 'נפח נסיעות חודשי (MAPCs), שולי רווח של מגזר הפרסום באפליקציה, ושילוב ציי רכבים אוטונומיים.',
      keyCallFocusEn: 'Monthly Active Platform Consumers (MAPCs), digital advertising take rate, and AV fleet aggregation economics.',
      aiTakeawayMemoHe: 'אובר הוכיחה שהיא המנצחת הגדולה של עידן הרכב האוטונומי – היא הבעלים של רשת הנוסעים והביקוש.',
      aiTakeawayMemoEn: 'Uber proven as primary beneficiary of autonomous mobility: it controls the passenger demand interface and routing density.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Mobility: $6.6B (+26%) | Delivery: $3.8B (+16%) | Freight: $1.2B (+3%) | Advertising ARR: $1.4B (+80%)',
        revenueBreakdownHe: 'הסעות (Mobility): 6.6 מיליארד דולר (+26%) | משלוחים (Delivery): 3.8 מיליארד דולר (+16%) | שילוח מטענים: 1.2 מיליארד דולר (+3%) | פרסום דיגיטלי: 1.4 מיליארד דולר (+80%)',
        operatingMarginAnalysis: 'Adjusted EBITDA margin expanded by 340 bps YoY to 9.2% of Gross Bookings, demonstrating premier network operating leverage.',
        operatingMarginAnalysisHe: 'שולי ה-EBITDA המתואם התרחבו ב-340 נקודות בסיס לרמה של 9.2% מסך ההזמנות הגולמיות, וממחישים מנוף רשת אדיר.',
        managementTone: 'Very Bullish',
        managementToneHe: 'ביטחון גבוה (Very Bullish)',
        keyQuotes: [
          '"Autonomous vehicles make Uber stronger, not weaker. Robotaxi operators need our demand density and fleet management infrastructure."'
        ],
        keyQuotesHe: [
          '"רכבים אוטונומיים מחזקים את אובר ולא מחלישים אותה. מפעילי רובוטקסי זקוקים לרשת הביקוש הצפופה ולמערך ניהול הציים שלנו."'
        ],
        guidanceCommentary: 'Gross bookings guidance raised to $43.5B-$45.0B for the upcoming quarter with accelerating buybacks.',
        guidanceCommentaryHe: 'תחזית ההזמנות הגולמיות הועלתה ל-43.5-45.0 מיליארד דולר לרבעון הבא בשילוב רכישת מניות עצמית מואצת.',
        catalystsAndRisks: {
          bullPoints: [
            'Uber One membership surpassed 28M members, driving 35% higher spend per user.',
            'Advertising revenue flowing at 80%+ gross margin.'
          ],
          bullPointsHe: [
            'מועדון המנויים Uber One חצה 28 מיליון משתמשים המבצעים 35% יותר הזמנות.',
            'הכנסות פרסום בעלות שולי רווח גולמי של 80%+.'
          ],
          bearPoints: [
            'Regulatory scrutiny over driver classification in select European jurisdictions.'
          ],
          bearPointsHe: [
            'בדיקות רגולטוריות בנוגע לסיווג תעסוקתי של נהגים במספר מדינות באירופה.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / מנצחת רשת (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$98.00 (Up from $85.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-98.00$ (מ-85.00$)',
          confidenceScore: 94,
          verdictMemoHe: 'נכס צומח ועתיר תזרים מזומנים בתיק. רשת הנוסעים והמשלוחים מהווה מונופול דו-צדדי עם חפיר עמוק.',
          verdictMemoEn: 'High growth cash compounder in portfolio. Two-sided rider/driver network effect provides deep competitive moat.'
        }
      }
    },

    // THIS WEEK - BKNG
    {
      id: 'week-bkng-amc',
      ticker: 'BKNG',
      companyName: 'Booking Holdings Inc.',
      companyNameHe: 'בוקינג הולדינגס',
      sector: 'Consumer Discretionary',
      sectorHe: 'תיירות, מלונאות ומסחר מקוון',
      reportDate: inThreeDaysStr,
      dayCategory: 'THIS_WEEK',
      timing: 'AMC',
      timingLabelHe: 'השבוע לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 85.50,
      actualEPS: 91.20,
      priorYearEPS: 72.32,
      yoyEpsGrowth: '+26.1%',
      consensusRevenue: '$8.25B',
      actualRevenue: '$8.45B',
      revenueYoY: '+15.1%',
      impliedMove: '±4.8%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 6.7,
      revenueSurprisePercent: 2.4,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'לילות שהוזמנו צמחו ב-9.8% ברחבי העולם עם המשך כוח תמחור יוצא דופן באירופה ואסיה, ועלייה של 45% בתזרימי מזומנים חופשיים.',
      guidanceDetailsEn: 'Room nights booked grew 9.8% globally with persistent pricing power in Europe and Asia, fueling 45% FCF expansion.',
      keyCallFocusHe: 'נפח לילות שהוזמנו (Room Nights), שיעור הזמנות ישירות באפליקציה (Direct Mix) ורכישת מניות עצמית (Buybacks).',
      keyCallFocusEn: 'Room nights booked, direct booking mobile app mix, flight vertical attach rates, and share buyback volume.',
      aiTakeawayMemoHe: 'מכונת יצירת מזומנים מהטובות בוול סטריט. שיעור ההזמנות הישירות באפליקציה חצה 56%, מה שמקטין תלות במנועי חיפוש.',
      aiTakeawayMemoEn: 'One of Wall Street elite cash generation engines. Direct app mix crossed 56%, drastically reducing search acquisition costs.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Merchant Bookings: $4.8B (+22%) | Agency Bookings: $3.2B (+6%) | Advertising & Other: $450M (+12%)',
        revenueBreakdownHe: 'הזמנות סוחר (Merchant): 4.8 מיליארד דולר (+22%) | הזמנות סוכנות (Agency): 3.2 מיליארד דולר (+6%) | פרסום ושונות: 450 מיליון דולר (+12%)',
        operatingMarginAnalysis: 'Adjusted EBITDA margin reached 42.5%, generating $3.2B in free cash flow in the peak summer quarter alone.',
        operatingMarginAnalysisHe: 'שולי ה-EBITDA המתואם הגיעו ל-42.5%, תוך ייצור תזרים מזומנים חופשי של 3.2 מיליארד דולר ברבעון הקיץ לבדו.',
        managementTone: 'Bullish',
        managementToneHe: 'אופטימי ויציב (Bullish)',
        keyQuotes: [
          '"Travel demand has proven extraordinarily durable. Our Connected Trip vision is now converting flights and attractions into high-frequency hotel stays."'
        ],
        keyQuotesHe: [
          '"ביקוש התיירות הוכיח עמידות יוצאת דופן. חזון הטיול המחובר (Connected Trip) שלנו ממיר כעת טיסות ואטרקציות להזמנות מלונות תכופות."'
        ],
        guidanceCommentary: 'Management initiated an additional $10B share repurchase authorization and raised full-year EPS guidance.',
        guidanceCommentaryHe: 'ההנהלה אישרה תוכנית רכישה עצמית נוספת של 10 מיליארד דולר והעלתה את תחזית הרווח השנתי למניה.',
        catalystsAndRisks: {
          bullPoints: [
            'Free cash flow conversion exceeds 95% of net income.',
            'Over 30 million alternative accommodation vacation listings.'
          ],
          bullPointsHe: [
            'המרת תזרים מזומנים חופשי עולה על 95% מהרווח הנקי.',
            'מעל 30 מיליון נכסי אירוח אלטרנטיביים (דירות נופש).'
          ],
          bearPoints: [
            'Potential macro softness in European discretionary travel.'
          ],
          bearPointsHe: [
            'חשש להאטה מקרו-כלכלית מסוימת בתקציבי תיירות באירופה.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / מכונת מזומנים (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$185.00 (Up from $155.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-185.00$ (מ-155.00$ - מתואם ספליט)',
          confidenceScore: 95,
          verdictMemoHe: 'פוזיציית איכות מעולה בתיק. החזר הון למשקיעים ברמה עולמית דרך בייבקים ודיבידנדים, עם חפיר רשת גלובלי שאינו ניתן לשכפול.',
          verdictMemoEn: 'Elite quality holding in portfolio. World-class capital return via buybacks and dividends backed by an unassailable global travel moat.'
        }
      }
    },

    // THIS WEEK - NOW (ServiceNow)
    {
      id: 'week-now-amc',
      ticker: 'NOW',
      companyName: 'ServiceNow, Inc.',
      companyNameHe: 'סרוויס-נאו (ServiceNow)',
      sector: 'Information Technology',
      sectorHe: 'תוכנה ארגונית וניהול תהליכים',
      reportDate: inFourDaysStr,
      dayCategory: 'THIS_WEEK',
      timing: 'AMC',
      timingLabelHe: 'השבוע לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q3 2026',
      consensusEPS: 3.82,
      actualEPS: 4.05,
      priorYearEPS: 3.12,
      yoyEpsGrowth: '+29.8%',
      consensusRevenue: '$2.95B',
      actualRevenue: '$3.04B',
      revenueYoY: '+24.1%',
      impliedMove: '±5.5%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 6.0,
      revenueSurprisePercent: 3.1,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'סך החוזים החתומים לעתיד (cRPO) צמח ב-25.5% ל-10.2 מיליארד דולר. מוצרי GenAI של Now Assist הם המוצר הצומח ביותר בתולדות החברה.',
      guidanceDetailsEn: 'Current Remaining Performance Obligations (cRPO) surged 25.5% to $10.2B. Now Assist GenAI suite fastest growing SKU in company history.',
      keyCallFocusHe: 'אימוץ חבילת Now Assist GenAI, עסקאות ארגוניות מעל 5 מיליון דולר, ושימור לקוחות מעל 98%.',
      keyCallFocusEn: 'Now Assist AI adoption, enterprise deals over $5M Net ACV, and sustaining 98%+ renewal rate.',
      aiTakeawayMemoHe: 'מובילת התוכנה הארגונית הבלתי מעורערת. חפיר עלויות מעבר קיצוני: אף תאגיד Fortune 500 לא יכול להחליף את מערכות ServiceNow.',
      aiTakeawayMemoEn: 'Undisputed enterprise software leader. Extreme switching cost moat: Fortune 500 corporations cannot rip and replace ServiceNow.',
      isUserPortfolioHolding: true,
      deepAnalysis: {
        revenueBreakdown: 'Subscription Revenue: $2.96B (+24.5%) | Professional Services: $80M (+8%)',
        revenueBreakdownHe: 'הכנסות מדמי מנוי (SaaS): 2.96 מיליארד דולר (+24.5%) | שירותים מקצועיים והטמעה: 80 מיליון דולר (+8%)',
        operatingMarginAnalysis: 'Non-GAAP operating margin expanded to 31.5% and free cash flow margin reached 34.0%, showcasing elite SaaS unit economics.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי ב-Non-GAAP התרחבו ל-31.5% ושולי תזרים מזומנים חופשי הגיעו ל-34.0%, הממחישים יחידת כלכלה מובחרת.',
        managementTone: 'Very Bullish',
        managementToneHe: 'ביטחון מוחלט (Very Bullish)',
        keyQuotes: [
          '"ServiceNow is the AI platform for business transformation. Our customers are standardizing on our single platform to orchestrate enterprise workflows."'
        ],
        keyQuotesHe: [
          '"סרוויס-נאו היא פלטפורמת ה-AI הראשית לטרנספורמציה עסקית. לקוחותינו מתכנסים לפלטפורמה אחת לניהול כל תהליכי העבודה בארגון."'
        ],
        guidanceCommentary: 'Subscription revenue guidance raised to $11.85B-$11.90B for the full year, indicating uninterrupted compounding.',
        guidanceCommentaryHe: 'תחזית ההכנסות ממנויים הועלתה ל-11.85-11.90 מיליארד דולר לשנה כולה, ומבשרת צמיחה מתמשכת של מעל 20%.',
        catalystsAndRisks: {
          bullPoints: [
            'Renewal rate remained rock-solid at 98.5%.',
            'Over 85 enterprise transactions signed with ACV exceeding $1M this quarter.'
          ],
          bullPointsHe: [
            'שיעור שימור הלקוחות עמד על רמת שיא של 98.5%.',
            'מעל 85 עסקאות ענק חדשות שנחתמו ברבעון בהיקף שנתי של מעל מיליון דולר כל אחת.'
          ],
          bearPoints: [
            'Premium valuation multiple (32x forward FCF) requires sustained 20%+ growth.'
          ],
          bearPointsHe: [
            'מכפיל פרימיום לתזרים חופשי (32x) מחייב המשך שמירה על קצב צמיחה מעל 20%.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / עוגן תוכנה מובחר (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$125.00 (Up from $95.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-125.00$ (מ-95.00$ - מתואם ספליט)',
          confidenceScore: 96,
          verdictMemoHe: 'אחת ממניות התוכנה האיכותיות ביותר בוול סטריט. שיעור שימור של 98.5% ותזרים חופשי של 34% מהווים חפיר כלכלי מובהק לשנתיים הקרובות.',
          verdictMemoEn: 'One of the highest quality software compounders on Wall Street. 98.5% retention and 34% FCF margin define a textbook wide moat.'
        }
      }
    },

    // GENERAL MARKET BELLWETHERS (MSFT, AAPL)
    {
      id: 'market-msft-amc',
      ticker: 'MSFT',
      companyName: 'Microsoft Corporation',
      companyNameHe: 'מיקרוסופט (Microsoft)',
      sector: 'Information Technology',
      sectorHe: 'תוכנה, ענן ובינה מלאכותית',
      reportDate: todayStr,
      dayCategory: 'TODAY',
      timing: 'AMC',
      timingLabelHe: 'היום לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q1 FY27',
      consensusEPS: 3.45,
      actualEPS: 3.65,
      priorYearEPS: 2.99,
      yoyEpsGrowth: '+22.1%',
      consensusRevenue: '$68.2B',
      actualRevenue: '$70.1B',
      revenueYoY: '+16.2%',
      impliedMove: '±4.2%',
      status: 'REPORTED_BEAT',
      statusLabelHe: 'הכה את התחזיות',
      epsSurprisePercent: 5.8,
      revenueSurprisePercent: 2.8,
      guidanceVerdict: 'RAISED',
      guidanceVerdictHe: 'העלאת תחזית שנתית',
      guidanceDetailsHe: 'צמיחת ענן Azure בנטרול שער חליפין טיפסה ל-33%, כאשר שירותי AI תרמו 12 נקודות אחוז מתוך סך הצמיחה.',
      guidanceDetailsEn: 'Azure revenue growth accelerated to 33% CC, with AI services contributing 12 percentage points of total growth.',
      keyCallFocusHe: 'צמיחת ענן Azure במטבע קבוע, מונטיזציית מושבי Copilot בארגונים, ותשואת השקעות ה-CapEx בחוות שרתים.',
      keyCallFocusEn: 'Azure Cloud revenue growth % in constant currency, Copilot enterprise seat monetization, and data center CapEx ROI.',
      aiTakeawayMemoHe: 'דוח עוצמתי המבסס את מיקרוסופט כמובילת מחשוב הענן לעסקים. הכנסות ה-AI השנתיות (ARR) חצו 15 מיליארד דולר.',
      aiTakeawayMemoEn: 'Commanding report affirming Microsoft as the primary enterprise AI platform. Commercial AI ARR surpassed $15B run-rate.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'Intelligent Cloud (Azure): $28.5B (+24%) | Productivity & Business (Office 365, LinkedIn): $23.2B (+15%) | More Personal Computing (Windows, Xbox): $18.4B (+9%)',
        revenueBreakdownHe: 'ענן אינטליגנטי (Azure): 28.5 מיליארד דולר (+24%) | פריון ועסקים (אופיס 365, לינקדאין): 23.2 מיליארד דולר (+15%) | מחשוב אישי (חלונות, אקסבוקס): 18.4 מיליארד דולר (+9%)',
        operatingMarginAnalysis: 'Operating margin expanded to 46.2%, supported by recurring software license renewals and pricing power in Office Copilot.',
        operatingMarginAnalysisHe: 'שולי הרווח התפעולי התרחבו ל-46.2%, בגיבוי חידוש מנויי תוכנה ארגוניים וכוח תמחור ב-Office Copilot.',
        managementTone: 'Very Bullish',
        managementToneHe: 'ביטחון מוסדי גבוה (Very Bullish)',
        keyQuotes: [
          '"Azure AI customers grew over 60% YoY, with nearly 70% of the Fortune 500 now utilizing Microsoft Copilot."',
        ],
        keyQuotesHe: [
          '"לקוחות Azure AI צמחו ביותר מ-60% משנה לשנה, וכמעט 70% מחברות ה-Fortune 500 משתמשות כעת ב-Microsoft Copilot."',
        ],
        guidanceCommentary: 'FY27 double-digit revenue and operating income growth reaffirmed with Azure capacity expanding in second half.',
        guidanceCommentaryHe: 'תחזית צמיחה דו-ספרתית בהכנסות וברווח התפעולי אושררה לשנה כולה, עם התרחבות קיבולת שרתים במחצית השנייה.',
        catalystsAndRisks: {
          bullPoints: [
            'Commercial RPO increased to an astounding $275B, representing multi-year locked-in enterprise revenue.',
            'Office 365 commercial seats expanded 10% YoY with ARPU expansion.'
          ],
          bullPointsHe: [
            'יתרת החוזים הארגוניים החתומים (RPO) זינקה ל-275 מיליארד דולר.',
            'מספר המושבים של Office 365 צמח ב-10% עם עלייה בהכנסה ממוצעת למשתמש.'
          ],
          bearPoints: [
            'CapEx of $19B in the quarter reflects elevated data center hardware outlays.'
          ],
          bearPointsHe: [
            'הוצאות CapEx של 19 מיליארד דולר ברבעון משקפות הוצאות עתק על חוות שרתים.'
          ]
        },
        institutionalVerdict: {
          action: 'STRONG_BUY',
          actionHe: 'קנייה חזקה / עוגן ענן עולמי (Strong Buy)',
          actionEn: 'Strong Buy',
          targetPriceRevision: '$585.00 (Up from $520.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-585.00$ (מ-520.00$)',
          confidenceScore: 97,
          verdictMemoHe: 'מונופול תוכנה ארגוני בלתי מעורער. מנוע תזרים מזומנים חופשי עולמי המספק תשואה עקבית ובטוחה.',
          verdictMemoEn: 'Unassailable enterprise software monopoly. World-class compounding cash flow engine.'
        }
      }
    },

    {
      id: 'market-aapl-amc',
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      companyNameHe: 'אפל (Apple)',
      sector: 'Information Technology',
      sectorHe: 'מחשוב, סמארטפונים ושירותים',
      reportDate: tomorrowStr,
      dayCategory: 'TOMORROW',
      timing: 'AMC',
      timingLabelHe: 'מחר לאחר הנעילה (AMC)',
      fiscalQuarter: 'Q4 FY26',
      consensusEPS: 1.78,
      priorYearEPS: 1.64,
      yoyEpsGrowth: '+8.5%',
      consensusRevenue: '$98.5B',
      revenueYoY: '+6.2%',
      impliedMove: '±3.8%',
      status: 'UPCOMING',
      statusLabelHe: 'ממתין לדיווח מחר בנעילה',
      guidanceVerdict: 'PENDING',
      guidanceVerdictHe: 'טרם פורסם',
      guidanceDetailsHe: 'בסיס המכשירים הפעיל חצה 2.3 מיליארד יחידות. חטיבת השירותים (Services) צפויה לרשום שולי רווח גולמי של 74%+.',
      guidanceDetailsEn: 'Active installed base crossed 2.3 billion devices. Services gross margins expected to hold steady at 74%+.',
      keyCallFocusHe: 'אימוץ תכונות Apple Intelligence, מחזור שדרוג מכשירי אייפון בסין, וקצב גידול הכנסות שירותי אפל.',
      keyCallFocusEn: 'Apple Intelligence upgrade super-cycle, China sales stabilization, and Services segment gross margin resilience.',
      aiTakeawayMemoHe: 'אקוסיסטם הצרכנים החזק בעולם. למעלה ממיליארד מנויים בתשלום בשירותים מייצרים הכנסות חוזרות יציבות.',
      aiTakeawayMemoEn: 'The most entrenched consumer ecosystem globally. Over 1 billion paid subscriptions driving recurring cash compounding.',
      isUserPortfolioHolding: false,
      deepAnalysis: {
        revenueBreakdown: 'iPhone: $49.5B (+5%) | Services: $26.8B (+15%) | Mac: $8.2B (+7%) | iPad: $7.1B (+9%) | Wearables & Accessories: $6.9B (-2%)',
        revenueBreakdownHe: 'מכשירי אייפון: 49.5 מיליארד דולר (+5%) | שירותי אפל (Services): 26.8 מיליארד דולר (+15%) | מחשבי מק: 8.2 מיליארד דולר (+7%) | טאבלטי אייפד: 7.1 מיליארד דולר (+9%) | אביזרים ומחשוב לביש: 6.9 מיליארד דולר (-2%)',
        operatingMarginAnalysis: 'Company gross margin at 46.5%, elevated by higher mix of high-margin software services subscriptions.',
        operatingMarginAnalysisHe: 'שולי הרווח הגולמי הכולל עמדו על 46.5%, בזכות נתח גובר של שירותי תוכנה ומנויים בעלי שולי רווח של 74%.',
        managementTone: 'Bullish',
        managementToneHe: 'חיובי ויציב (Bullish)',
        keyQuotes: [
          '"Our installed base of active devices reached an all-time high across all products and geographic segments."'
        ],
        keyQuotesHe: [
          '"בסיס המכשירים הפעיל שלנו הגיע לשיא של כל הזמנים בכל קווי המוצרים ובכל האזורים הגיאוגרפיים בעולם."'
        ],
        guidanceCommentary: 'December quarter revenue anticipated to reach new all-time high, driven by iPhone 17 family demand and Apple Intelligence rollout.',
        guidanceCommentaryHe: 'הכנסות רבעון דצמבר צפויות להגיע לשיא היסטורי חדש, בהובלת מכשירי סדרת אייפון 17 ותכונות Apple Intelligence.',
        catalystsAndRisks: {
          bullPoints: [
            'Services revenue run-rate approaching $110B annualized at exceptional 74% margins.',
            '$110B share repurchase authorization shrinking share count.'
          ],
          bullPointsHe: [
            'קצב הכנסות השירותים השנתי מתקרב ל-110 מיליארד דולר בשולי רווח של 74%.',
            'תוכנית רכישה עצמית שנתית של 110 מיליארד דולר המצמצמת את כמות המניות בשוק.'
          ],
          bearPoints: [
            'Smartphone replacement cycles stretching past 4 years in mature markets.'
          ],
          bearPointsHe: [
            'מחזור החלפת סמארטפונים מתארך ליותר מ-4 שנים בשווקים מפותחים.'
          ]
        },
        institutionalVerdict: {
          action: 'HOLD',
          actionHe: 'החזקה / מניית איכות דפנסיבית (Hold & Compound)',
          actionEn: 'Hold & Compound',
          targetPriceRevision: '$375.00 (Up from $335.00)',
          targetPriceRevisionHe: 'מחיר יעד הועלה ל-375.00$ (מ-335.00$)',
          confidenceScore: 93,
          verdictMemoHe: 'נכס איכותי עם נאמנות צרכנים שאין שנייה לה. להמשיך להחזיק כעוגן יציבות.',
          verdictMemoEn: 'High quality cash machine with unrivaled brand loyalty. Long term stable holding.'
        }
      }
    }
  ];
};
