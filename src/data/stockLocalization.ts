import { ResearchStock } from '../types';
import { SupportedLanguage } from '../i18n';
import { MARKET_UNIVERSE_CATALOG } from './marketUniverseData';

// Sector Translations
export const SECTOR_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  he: {
    'Health Care': 'שירותי בריאות ורפואה',
    'Information Technology': 'טכנולוגיית מידע ותוכנה',
    'Technology': 'טכנולוגיית מידע ותוכנה',
    'Communication Services': 'שירותי תקשורת ומדיה',
    'Financials': 'פיננסים ושירותי הון',
    'Consumer Staples': 'מוצרי צריכה בסיסיים',
    'Consumer Discretionary': 'מוצרי צריכה ומסחר',
    'Industrials': 'תעשייה ולוגיסטיקה',
    'Materials': 'חומרי גלם וגזים תעשייתיים',
    'Broad Market Quality': 'איכות שוק כוללת',
  },
  en: {
    'Health Care': 'Health Care',
    'Information Technology': 'Information Technology',
    'Technology': 'Technology',
    'Communication Services': 'Communication Services',
    'Financials': 'Financials',
    'Consumer Staples': 'Consumer Staples',
    'Consumer Discretionary': 'Consumer Discretionary',
    'Industrials': 'Industrials',
    'Materials': 'Materials',
    'Broad Market Quality': 'Broad Market Quality',
  },
  de: {
    'Health Care': 'Gesundheitswesen',
    'Information Technology': 'Informationstechnologie',
    'Technology': 'Informationstechnologie',
    'Communication Services': 'Kommunikationsdienste',
    'Financials': 'Finanzdienstleistungen',
    'Consumer Staples': 'Basiskonsumgüter',
    'Consumer Discretionary': 'Nicht-Basiskonsumgüter',
    'Industrials': 'Industriegüter',
    'Materials': 'Grundstoffe',
    'Broad Market Quality': 'Breiter Markt Qualitätsführer',
  },
  fr: {
    'Health Care': 'Santé & Pharmacie',
    'Information Technology': 'Technologies de l\'information',
    'Technology': 'Technologies de l\'information',
    'Communication Services': 'Services de communication',
    'Financials': 'Finance & Marchés',
    'Consumer Staples': 'Consommation de base',
    'Consumer Discretionary': 'Consommation discrétionnaire',
    'Industrials': 'Industrie & Transport',
    'Materials': 'Matériaux',
    'Broad Market Quality': 'Qualité de marché large',
  },
  es: {
    'Health Care': 'Salud y Farmacia',
    'Information Technology': 'Tecnología de la Información',
    'Technology': 'Tecnología de la Información',
    'Communication Services': 'Servicios de Comunicación',
    'Financials': 'Finanzas y Banca',
    'Consumer Staples': 'Consumo Básico',
    'Consumer Discretionary': 'Consumo Discrecional',
    'Industrials': 'Industria y Transporte',
    'Materials': 'Materiales',
    'Broad Market Quality': 'Calidad de Mercado Amplio',
  },
};

export interface StockTranslationData {
  companyNameHe?: string;
  industryHe?: string;
  investmentThesisSummary?: string;
  moatDefenseMechanism?: string;
  whyInTopUniverse?: string;
  fiveYearGrowthDrivers?: string[];
  primaryFailureRisks?: string[];
  moatWhyExists?: string;
  moatWhatCouldDestroyIt?: string;
  tamAndMarketPenetration?: string;
  truePerShareCreationVerdict?: string;
  peerComparisonNotes?: string;
  expectationsGapExplanation?: string;
  bearCaseAssumptions?: string;
  baseCaseAssumptions?: string;
  bullCaseAssumptions?: string;
}

// Stock Specific Institutional Translations for Core Universe
export const STOCK_TRANSLATIONS: Record<
  string,
  Record<SupportedLanguage, StockTranslationData>
> = {
  UNH: {
    he: {
      companyNameHe: 'יונייטד-הלת\' גרופ',
      industryHe: 'ניהול שירותי בריאות וביטוח רפואי',
      investmentThesisSummary:
        'יונייטד-הלת\' גרופ (UnitedHealth) היא עמוד השדרה של מערכת הבריאות האמריקאית. החברה משלבת את חברת הביטוח הרפואי הגדולה ביותר (UnitedHealthcare) יחד עם זרוע השירותים הרפואיים והטכנולוגיה הצומחת במהירות (Optum). מודל זה מייצר תזרים מזומנים חופשי עקבי ביותר ויעילות הון יוצאת דופן עם ROIC יציב של כ-27%.',
      moatDefenseMechanism:
        'אפקט רשת עצום עם מעל 150 מיליון מטופלים ורופאים, יתרון גודל חסר תחרות ברכש תרופות וציוד, ועלויות מעבר גבוהות במיוחד עבור מעסיקים ומערכות בריאות.',
      whyInTopUniverse:
        'דורגה במקום #1 בשל עמידות תזרימית מוכחת, חפיר רחב ביותר (Optum) ותשואת דיבידנד וצמיחה המניבה תשואה צפויה של 14%-18% לשנה.',
      fiveYearGrowthDrivers: [
        'מעבר מתמשך לרפואה מבוססת תוצאות (Value-Based Care) דרך זרוע OptumCare',
        'התרחבות שירותי Optum Insight ו-Optum Rx עם מרווחי רווח גבוהים',
        'הזדקנות האוכלוסייה בארה"ב ועלייה עקבית במספר המבוטחים ב-Medicare Advantage',
        'רכישות חוזרות של מניות וחלוקת דיבידנד הצומח ברציפות מעל 15 שנה',
      ],
      primaryFailureRisks: [
        'שינויים רגולטוריים או קיצוץ תעריפי Medicare מצד הממשל הפדרלי',
        'אינפלציה בעלויות רפואיות ויחס תביעות רפואי (MLR) גבוה מהצפוי',
      ],
      moatWhyExists: 'שילוב אינטגרטיבי של מבטח בריאות מוביל (53M מבוטחים) עם ספק שירותים קליניים (Optum) המנהל 90,000 רופאים.',
      moatWhatCouldDestroyIt: 'חקיקת ביטוח בריאות ממשלתי יחיד (Single-Payer) או פירוק אנטי-טראסט כפוי בין UnitedHealthcare ל-Optum.',
      baseCaseAssumptions: 'צמיחת הכנסות שנתית של 8.5%-10%, יציבות במרווח התפעולי של Optum ורכישה עצמית שנתית של 1.5% מהמניות.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  MSFT: {
    he: {
      companyNameHe: 'מיקרוסופט',
      industryHe: 'תוכנה תשתיתית, שירותי ענן ו-AI',
      investmentThesisSummary:
        'מיקרוסופט (Microsoft) היא תשתית התוכנה והענן המרכזית של הארגונים הגלובליים. השילוב בין מערכת ההפעלה Windows, חבילת הפרודוקטיביות Microsoft 365, פלטפורמת הענן Azure וההובלה באינטליגנציה מלאכותית (AI) ארגונית מעניקים לה יתרון תחרותי שאין שני לו ומאזן מושלם עם דירוג אשראי AAA.',
      moatDefenseMechanism:
        'עלויות מעבר קיצוניות בארגונים (Enterprise Lock-in), תאימות מלאה של מאות מיליוני תחנות עבודה, והטמעה עמוקה של כלי ענן ו-AI בליבת הפעילות העסקית.',
      whyInTopUniverse:
        'חפיר טכנולוגי עמוק, יעילות הון גבוהה (ROIC מעל 31%), יצירת מזומנים חופשית ומאזן איתן המבטיח חוסן בכל סביבת מאקרו.',
      fiveYearGrowthDrivers: [
        'התרחבות מואצת של תשתיות הענן Azure ואירוח עומסי עבודה של AI',
        'מוניטיזציה של כלי Microsoft Copilot לרוחב מאות מיליוני מנויי Office 365',
        'צמיחת מגזר אבטחת המידע (Cybersecurity) מעל 25 מיליארד דולר בשנה',
        'הכנסות חוזרות מתחום הגיימינג (Game Pass ו-Activision Blizzard)',
      ],
      primaryFailureRisks: [
        'האטה בהוצאות ה-IT של תאגידים או תחרות עזה מצד AWS ו-Google Cloud',
        'הוצאות הון (Capex) גבוהות במיוחד על מרכזי נתונים ואימון מודלי AI',
      ],
      moatWhyExists: 'סטנדרט תוכנה עולמי בארגונים עם מעל 400 מיליון משתמשי Office 365 מסחריים ונעילת מערכות IT ארגוניות.',
      moatWhatCouldDestroyIt: 'מעבר מערכתי של ארגונים לכלי קוד פתוח עצמאיים או פיגור טכנולוגי מתמשך מול מתחרות ענן.',
      baseCaseAssumptions: 'צמיחה דו-ספרתית בהכנסות Azure ו-Copilot עם המשך שמירה על מרווח תפעולי של 43%+ ודיבידנד צומח.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  GOOGL: {
    he: {
      companyNameHe: 'אלפבית / גוגל',
      industryHe: 'מנועי חיפוש, פרסום דיגיטלי וענן',
      investmentThesisSummary:
        'אלפבית (Alphabet / Google) מחזיקה במונופול החיפוש והפרסום הדיגיטלי המוביל בעולם (Google Search, YouTube), המממן צמיחה אדירה בפלטפורמת הענן Google Cloud וברכבים האוטונומיים Waymo. החברה מחזיקה ביתרת מזומנים נטו של מעל 100 מיליארד דולר ו-ROIC של כ-33%.',
      moatDefenseMechanism:
        'אפקט רשת גלובלי עם מעל 2 מיליארד משתמשים יומיים בכל אחד ממוצריה (Search, Android, YouTube, Maps), לצד מאגרי מידע ייחודיים שאינם ניתנים לשכפול.',
      whyInTopUniverse:
        'מכונת מזומנים עצומה, מכפיל רווח אטרקטיבי ביחס לקצב הצמיחה, ודומיננטיות טכנולוגית חסרת תחליף.',
      fiveYearGrowthDrivers: [
        'שילוב מודלי Gemini ישירות במנוע החיפוש ופרודוקטיביות הפרסום',
        'רווחיות מתרחבת בפלטפורמת Google Cloud',
        'מוניטיזציה עולה של YouTube Premium ו-YouTube Shorts',
        'מסחור צי הרכבים האוטונומיים של Waymo בערים מרכזיות',
      ],
      primaryFailureRisks: [
        'לחצים רגולטוריים והגבלים עסקיים (Antitrust) של משרד המשפטים בארה"ב',
        'תחרות מנועי חיפוש מבוססי AI על נתח השוק המסורתי',
      ],
      moatWhyExists: 'מעל 90% נתח שוק בחיפוש עולמי, מעל 2.5 מיליארד מכשירי Android פעילים ומאגר נתוני כוונת קנייה שאין שני לו.',
      moatWhatCouldDestroyIt: 'הפסד מהותי של נפח שאילתות חיפוש לטובת עוזרי AI מתחרים או פירוק כפוי של עסקי הפרסום בבית משפט.',
      baseCaseAssumptions: 'המשך צמיחה שנתית של 11%-14% בפרסום ובענן, התרחבות מרווחי Cloud ורכישה עצמית מסיבית של מניות.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  AAPL: {
    he: {
      companyNameHe: 'אפל',
      industryHe: 'חומרה יוקרתית, תוכנה ואקוסיסטם שירותים',
      investmentThesisSummary:
        'אפל (Apple) מחזיקה באקוסיסטם החומרה והשירותים החזק והיוקרתי ביותר בעולם עם בסיס מכשירים פעיל של מעל 2.2 מיליארד יחידות. מגזר השירותים בעל שולי הרווח הגבוהים מייצר צמיחה עקבית ותזרים מזומנים חופשי מעל 100 מיליארד דולר בשנה.',
      moatDefenseMechanism:
        'עלויות מעבר גבוהות במיוחד (iOS Lock-in), מותג עולמי עליון ונאמנות לקוחות שאין דומה לה.',
      whyInTopUniverse:
        'יעילות הון שיא (ROIC מעל 54%), תוכנית רכישת מניות חוזרת אגרסיבית ויציבות מונופוליסטית בפרמיום הצרכני.',
      fiveYearGrowthDrivers: [
        'צמיחה דו-ספרתית בהכנסות משירותים (App Store, iCloud, Apple Pay, AppleCare)',
        'שדרוג מכשירים מונע פיצ\'רי Apple Intelligence (AI במכשיר)',
        'חדירה מואצת לשווקים מתעוררים כמו הודו ודרום-מזרח אסיה',
        'רכישה עצמית שנתית של מניות בהיקף העולה על 80 מיליארד דולר',
      ],
      primaryFailureRisks: [
        'רגולציה אירופית ואמריקאית לפתיחת ה-App Store לעמלות חיצוניות',
        'הארכת מחזורי החלפת הסמארטפונים עקב היעדר חידושים דרמטיים',
      ],
      moatWhyExists: 'נעילת משתמשים באקוסיסטם שלם (iMessage, Photos, Apple Watch, AirPods) ושיעור שימור לקוחות של 98%.',
      moatWhatCouldDestroyIt: 'חדירת מערכת הפעלה מתחרה שתייתר את היתרונות של iOS או כשל מוחלט בשילוב כלי בינה מלאכותית.',
      baseCaseAssumptions: 'צמיחה חד-ספרתית גבוהה בהכנסות, צמיחה דו-ספרתית ברווח למניה עקב רכישה עצמית ו-ROIC מעל 50%.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  NVDA: {
    he: {
      companyNameHe: 'אנבידיה',
      industryHe: 'מוליכים למחצה ומחשוב מואץ לבינה מלאכותית',
      investmentThesisSummary:
        'אנבידיה (NVIDIA) היא מונופול החומרה ותוכנת התשתית של מהפכת הבינה המלאכותית העולמית. השילוב בין מעבדי ה-GPU המובילים, מערכת התוכנה CUDA וטכנולוגיית התקשורת NVLink יוצר מחסום כניסה בלתי חדיר.',
      moatDefenseMechanism:
        'סביבת הפיתוח CUDA הפכה לסטנדרט התעשייתי העולמי של מפתחי AI עם מעל 5 מיליון מפתחים ועלויות מעבר כבדות ביותר.',
      whyInTopUniverse:
        'ROIC שיא של מעל 58%, צמיחה תלת-ספרתית בתזרים חופשי והובלה טכנולוגית מוחלטת במרכזי נתונים.',
      fiveYearGrowthDrivers: [
        'מעבר עולמי של דאטה סנטרס ממחשוב כללי למחשוב מואץ מבוסס GPU',
        'השקת פלטפורמות הדור הבא (Blackwell ו-Rubin) עם ביצועים עדיפים פי כמה',
        'אימוץ מודלי AI ארגוניים ורובוטיקה פיזית (Omniverse ו-Physical AI)',
        'רווחיות מתמשכת מתחום התקשורת המהירה (Quantum Infiniband ו-Spectrum-X)',
      ],
      primaryFailureRisks: [
        'התמתנות זמנית בקצב ההשקעות של ענקיות הענן (Capex digestion)',
        'פיתוח שבבים מותאמים אישית (ASICs) על ידי גוגל, אמזון ומיקרוסופט',
      ],
      moatWhyExists: 'שילוב מערכתי של סיליקון, תוכנת CUDA, ספריות אופטימיזציה ורשתות תקשורת שאין למתחרות יכולת להעתיק במלואו.',
      moatWhatCouldDestroyIt: 'יצירת סטנדרט תוכנה פתוח (כגון Triton/ROCm) שיאפשר ריצה חלקה על מעבדי מתחרים ללא פגיעה בביצועים.',
      baseCaseAssumptions: 'הכנסות יציבות בשיא עם צמיחה מתונה של 15%-25% לאחר קפיצת ה-AI, שמירה על מרווח גולמי של 70%+ ותזרים חופשי אדיר.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  V: {
    he: {
      companyNameHe: 'ויזה',
      industryHe: 'רשתות תשלום אלקטרוניות וסליקה גלובלית',
      investmentThesisSummary:
        'ויזה (Visa) מפעילה את רשת התשלומים האלקטרוניים הגדולה ביותר בעולם. כעסק במודל "עמלת מעבר" (Tollbooth) שאינו נוטל סיכוני אשראי, ויזה מייצרת מרווחי תזרים מזומנים של מעל 58% ו-ROIC יוצא דופן של מעל 50%.',
      moatDefenseMechanism:
        'אפקט רשת דו-צדדי עצום בין מעל 4 מיליארד כרטיסים פעילים לעשרות מיליוני בתי עסק, המייצר חסם כניסה בלתי עביר לשחקנים חדשים.',
      whyInTopUniverse:
        'אחד המודלים העסקיים הרווחיים ביותר בעולם, הדורש כמעט אפס השקעות הון ומייצר תשואה מובטחת לאורך עשורים.',
      fiveYearGrowthDrivers: [
        'מעבר עולמי מתמשך ממזומן לתשלומים דיגיטליים בשווקים מתעוררים',
        'התרחבות פתרונות תשלום B2B והעברות כספים מהירות (Visa Direct)',
        'צמיחת שירותי ערך מוסף (Value-Added Services) כמו מניעת הונאות ואבטחה',
      ],
      primaryFailureRisks: [
        'חקיקה רגולטורית להגבלת עמלות סליקה (Credit Card Competition Act)',
        'אימוץ מוגבר של רשתות תשלום מיידיות ממשלתיות (כגון FedNow, Pix)',
      ],
      moatWhyExists: 'אפקט רשת דו-צדדי מושלם: צרכנים מחזיקים ויזה כי כל בית עסק מקבל אותה, ובתי עסק חייבים לקבלה כי לכולם יש ויזה.',
      moatWhatCouldDestroyIt: 'התערבות רגולטורית דרסטית המגבילה תקרת עמלות או פריצת דרך בטכנולוגיית תשלומים עוקפת-רשתות.',
      baseCaseAssumptions: 'צמיחה שנתית של 9%-11% בנפח התשלומים, מרווח תפעולי של 66%+ והמשך החזר הון למשקיעים בדיבידנד ורכישה עצמית.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  COST: {
    he: {
      companyNameHe: 'קוסטקו',
      industryHe: 'קמעונאות מועדוני חברים סיטונאית',
      investmentThesisSummary:
        'קוסטקו (Costco Wholesale) היא קמעונאית המועדונים המובילה בעולם, המבוססת על מודל חברות מנוי (Subscription Moat) עם שיעור חידוש מנויים פנומנלי של 93%. דמי המנוי מהווים את מרבית הרווח התפעולי, מה שמאפשר לה למכור מוצרים כמעט ללא רווח ולספק מחירים ששום מתחרה אינו יכול להשתוות אליהם.',
      moatDefenseMechanism:
        'יתרון גודל בעלויות (Scale Advantage Shared) היוצר מעגל קסמים: ככל שהגודל צומח המחירים יורדים, מושכים עוד חברים ומחזקים את נאמנות הלקוחות.',
      whyInTopUniverse:
        'נאמנות לקוחות ללא תחרות, חסינות מוחלטת למיתון, והחזר יציב על ההון לאורך כל מחזור כלכלי.',
      fiveYearGrowthDrivers: [
        'פתיחת 25-30 מחסנים חדשים מדי שנה ברחבי ארה"ב, אירופה ואסיה',
        'העלאות מחיר תקופתיות בדמי המנוי המניבות רווח נקי ישיר',
        'התרחבות מכירות האונליין ושירותי משלוחים מהירים',
        'צמיחת המותג הפרטי Kirkland Signature המניב מרווחים גבוהים יותר',
      ],
      primaryFailureRisks: [
        'מכפיל הערכה גבוה הדורש עמידה מתמדת בציפיות צמיחה גבוהות',
        'תחרות מצד מועדוני קמעונאות אחרים או פלטפורמות דיגיטליות',
      ],
      moatWhyExists: 'מודל חברות מנוי עם 130 מיליון חברים נאמנים וכוח מיקוח אדיר שמאפשר למכור במרווח גולמי של 11% בלבד.',
      moatWhatCouldDestroyIt: 'שחיקה ביעילות הלוגיסטית, פגיעה באיכות מוצרי Kirkland או מעבר מאסיבי לרכישות משלוחים מקוונות.',
      baseCaseAssumptions: 'פתיחה עקבית של סניפים, חידוש מנויים מעל 92% וצמיחת רווח למניה של 10%-13% בשנה.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  SPGI: {
    he: {
      companyNameHe: 'אס אנד פי גלובל',
      industryHe: 'דירוגי אשראי, מדדים ונתונים פיננסיים',
      investmentThesisSummary:
        'אס אנד פי גלובל (S&P Global) היא שומרת הסף החיונית של שוקי ההון העולמיים. דואופול דירוגי האשראי שלה יחד עם מודיס, מדדי S&P 500 העולמיים ומסוף הנתונים Capital IQ מייצרים מרווחי רווח תפעולי של 47% ורצף של 51 שנות העלאת דיבידנד.',
      moatDefenseMechanism:
        'חסמי כניסה רגולטוריים כבדים כסוכנות דירוג מוכרת (NRSRO) ומעמד של תקן זהב במדדי מניות עולמיים.',
      whyInTopUniverse:
        'עסק חסין מחזורים בעל כוח תמחור מוחלט ומרווחי תזרים מזומנים יוצאי דופן.',
      fiveYearGrowthDrivers: [
        'התרחבות הנפקות אג"ח תאגידיות גלובליות ומימון מחדש של חובות',
        'אימוץ מוגבר של נתוני קיימות (ESG) ופתרונות סיכון אנרגטי של Platts',
        'צמיחת מדדי מניות פאסיביים וקרנות מחקות ETF המשלמות עמלות נכסים מנוהלים',
      ],
      primaryFailureRisks: [
        'האטה חריפה בהנפקות אג"ח בשל סביבת ריבית גבוהה ממושכת',
        'לחץ רגולטורי על שוק דירוגי האשראי.',
      ],
      moatWhyExists: 'דואופול מוסדי חוקי בלתי שביר בדירוגי אשראי גלובליים שבלעדיהם גופים מוסדיים אינם מורשים להשקיע באג"ח.',
      moatWhatCouldDestroyIt: 'שינוי תקנות ה-SEC המבטל את הצורך בדירוג מוסדי רשמי או פגיעה קריטית במוניטין הדירוג.',
      baseCaseAssumptions: 'התאוששות מחזורית בהנפקות חוב, צמיחת הכנסות מנויים ב-Capital IQ ו-ROIC יציב של 30%+.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  ISRG: {
    he: {
      companyNameHe: 'אינטואיטיב סרג\'יקל',
      industryHe: 'מכשור רפואי ורובוטיקה כירורגית מתקדמת',
      investmentThesisSummary:
        'אינטואיטיב סרג\'יקל (Intuitive Surgical) היא החלוצה והמובילה הבלתי מעורערת בניתוחים רובוטיים באמצעות מערכת da Vinci. המודל העסקי המבוסס על "תער וסכינים" (מכירת מכשירים מתכלים בכל ניתוח) מייצר הכנסות חוזרות יציבות עם ROIC מעל 19%.',
      moatDefenseMechanism:
        'עלויות מעבר קיצוניות למנתחים שעברו הכשרה מעמיקה, מעל 75,000 מנתחים מוסמכים והגנת פטנטים מסיבית.',
      whyInTopUniverse:
        'דומיננטיות כמעט מוחלטת בניתוחים רובוטיים זעיר-פולשניים עם עשרות שנות צמיחה קדימה.',
      fiveYearGrowthDrivers: [
        'השקת מערכת הדור החדש da Vinci 5 בעלת כוח חישה ועיבוד משופרים',
        'התרחבות הליכים כירורגיים לאינדיקציות חדשות בחזה, מעיים וקיבה',
        'חדירה לבתי חולים באירופה, אסיה והודו',
      ],
      primaryFailureRisks: [
        'כניסת מתחרות ענק עם מערכות רובוטיות חדשות (כגון מדטרוניק וג\'ונסון אנד ג\'ונסון)',
        'האטה ברכש ציוד קפיטלי כבד בבתי חולים עקב מגבלות תקציב.',
      ],
      moatWhyExists: 'בסיס מותקן של מעל 9,000 מערכות da Vinci ומאות אלפי מנתחים שהוכשרו אך ורק על הממשק שלה.',
      moatWhatCouldDestroyIt: 'מערכת רובוטית מתחרה זולה וטובה משמעותית שתצליח להעביר מנתחים מנוסים להכשרה מחדש.',
      baseCaseAssumptions: 'צמיחה שנתית של 13%-16% במספר הניתוחים הרובוטיים העולמיים, תזרים מזומנים חופשי גדל ו-0 חוב.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  LLY: {
    he: {
      companyNameHe: 'אלי לילי',
      industryHe: 'פארמצבטיקה, תרופות סוכרת והשמנת יתר',
      investmentThesisSummary:
        'אלי לילי (Eli Lilly) היא מובילת הדואופול העולמי בתרופות GLP-1 להרזיה וסוכרת (Mounjaro ו-Zepbound), המהוות את אחד משווקי התרופות הגדולים בהיסטוריה. לחברה צנרת מחקר ופיתוח רחבה במיוחד גם באלצהיימר (Donanemab), אונקולוגיה ומחלות אוטואימוניות.',
      moatDefenseMechanism:
        'פורטפוליו פטנטים עמוק, הגנה רגולטורית של ה-FDA וכושר ייצור ביולוגי ענק שמתחרות אינן מסוגלות לשכפל.',
      whyInTopUniverse:
        'צמיחה חסרת תקדים בהכנסות וברווח למניה המונעת על ידי שוק יעד של מעל 100 מיליארד דולר בתרופות הרזיה ומטבוליזם.',
      fiveYearGrowthDrivers: [
        'התרחבות כושר הייצור העולמי של מזרקי Mounjaro ו-Zepbound',
        'אישור אינדיקציות קליניות נוספות (דום נשימה בשינה, מחלות לב, כבד שומני MASH)',
        'השקת תרופות מולקולריות דרך הפה (Orforglipron) ללא צורך בהזרקה',
      ],
      primaryFailureRisks: [
        'תחרות עזה מצד נובו נורדיסק ופיתוח תרופות דור הבא של מתחרות',
        'לחצי מחירי תרופות ומשא ומתן ממשלתי מול תוכניות Medicare בארה"ב.',
      ],
      moatWhyExists: 'עליונות קלינית מוכחת במחקרים ראש-בראש של מולקולת Tirzepatide והשקעות עתק של עשרות מיליארדים בכושר ייצור ביולוגי.',
      moatWhatCouldDestroyIt: 'תופעות לוואי חמורות ובלתי צפויות לטווח ארוך או פסיקת פטנטים עוינת.',
      baseCaseAssumptions: 'צמיחה שנתית של 20%+ בהכנסות ב-5 השנים הקרובות, התרחבות שולי הרווח התפעולי מעל 40% ותזרים מזומנים חופשי ענק.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  AMZN: {
    he: {
      companyNameHe: 'אמזון',
      industryHe: 'מסחר אלקטרוני, שירותי ענן AWS ופרסום דיגיטלי',
      investmentThesisSummary:
        'אמזון (Amazon) היא השליטה הבלתי מעורערת של המסחר האלקטרוני במערב ומפעילת תשתית הענן המובילה בעולם (AWS). מודל הרשת הלוגיסטית האדירה שלה יחד עם זרוע הפרסום הצומחת במהירות מייצרים התרחבות שולי רווח תפעולי ורווחיות חסרת תקדים.',
      moatDefenseMechanism:
        'אפקט רשת דו-צדדי עם 200+ מיליון מנויי Prime, יתרון גודל לוגיסטי שאינו ניתן לשכפול ונעילת לקוחות ארגוניים ב-AWS.',
      whyInTopUniverse:
        'שילוב נדיר של מונופול קמעונאי, הובלת ענן וצמיחה מואצת בתזרים מזומנים חופשי לאחר סיום מחזור השקעות הלוגיסטיקה.',
      fiveYearGrowthDrivers: [
        'התאוששות וצמיחה מואצת ב-AWS המונעת מאירוח מודלי בינה מלאכותית ארגוניים',
        'התרחבות עסקי הפרסום הדיגיטלי בעלי שולי הרווח הגבוהים (מעל 50 מיליארד דולר)',
        'אופטימיזציה של הרשת הלוגיסטית האזורית והורדת עלות שילוח לכל יחידה',
      ],
      primaryFailureRisks: [
        'תחרות עזה ב-Cloud מצד Microsoft Azure ו-Google Cloud',
        'בדיקות רגולטוריות והגבלים עסקיים של רשות הסחר הפדרלית (FTC).',
      ],
      moatWhyExists: 'רשת לוגיסטית של מאות מחסנים ומערך שילוח עצמאי שעלות הקמתו חסומה בפני כל מתחרה חדש.',
      moatWhatCouldDestroyIt: 'האטה דרמטית בנתח השוק של AWS לטובת מתחרות או שחיקה בעלויות העבודה הלוגיסטיות.',
      baseCaseAssumptions: 'צמיחה שנתית של 10%-13% בהכנסות, עלייה במרווח התפעולי לכיוון 12%-14% ותזרים חופשי מעל 80 מיליארד דולר.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  META: {
    he: {
      companyNameHe: 'מטא פלטפורמס',
      industryHe: 'מדיה חברתית, פרסום מקוון ואינטליגנציה מלאכותית',
      investmentThesisSummary:
        'מטא פלטפורמס (Meta) מחזיקה ברשת החברתית והתקשורתית הגדולה בעולם עם מעל 3.3 מיליארד משתמשים יומיים פעילים (Facebook, Instagram, WhatsApp, Messenger). מנועי המלצות ה-AI החזקים שלה מאפשרים מיקוד פרסומי מדויק ויעילות הון יוצאת דופן עם ROIC מעל 28%.',
      moatDefenseMechanism:
        'אפקט רשת חברתי גלובלי שאינו ניתן להחלפה, מאגרי נתונים ייחודיים ויכולת מיקוד פרסום המניבה החזר השקעה (ROAS) גבוה למפרסמים.',
      whyInTopUniverse:
        'מכונת מזומנים עם צמיחה דו-ספרתית, מרווח תפעולי של 40%+ והובלה טכנולוגית בקוד פתוח של AI (Llama).',
      fiveYearGrowthDrivers: [
        'מוניטיזציה עולה של סרטוני וידאו קצרים (Reels) וכלי בינה מלאכותית למפרסמים',
        'מסחור שירותי הודעות עסקיות (Click-to-Message) ב-WhatsApp ו-Messenger',
        'שילוב כלי Meta AI כעוזר אישי מובנה בכל האפליקציות ומשקפי Ray-Ban Meta',
      ],
      primaryFailureRisks: [
        'הוצאות עתק על מעבדות ה-Reality Labs והמטאוורס שטרם הניבו רווח',
        'הגבלות רגולטוריות על פרטיות ואיסוף מידע של משתמשים קטינים.',
      ],
      moatWhyExists: 'חצי מאוכלוסיית כדור הארץ מחוברת לפחות לאחת מהאפליקציות של מטא מדי יום.',
      moatWhatCouldDestroyIt: 'נטישה המונית של הדור הצעיר לפלטפורמות מתחרות חדשות או שינוי מערכתי במודל הפרסום.',
      baseCaseAssumptions: 'צמיחה שנתית של 12%-15% בפרסום, רכישה חוזרת עקבית של מניות ו-ROIC מעל 25%.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  BRK_B: {
    he: {
      companyNameHe: 'ברקשייר האת\'אוויי',
      industryHe: 'ביטוח, אנרגיה, רכבות והשקעות הון מוסדיות',
      investmentThesisSummary:
        'ברקשייר האת\'אוויי (Berkshire Hathaway) היא קונגלומרט האיכות האולטימטיבי המנוהל על פי עקרונות השקעות הערך והקצאת ההון הקפדנית ביותר. החברה מחזיקה בצי ביטוחי ענק (GEICO וביטוח משנה) המייצר ציפה (Float) של מעל 170 מיליארד דולר בריבית אפסית, יחד עם נכסי תשתית מונופוליסטיים (BNSF ו-BHE).',
      moatDefenseMechanism:
        'מאזן עם למעלה מ-300 מיליארד דולר במזומן ובאג"ח ממשלתי, עמידות חסרת תקדים למשברים פיננסיים ויכולת ניצול הזדמנויות בעתות פאניקה בשווקים.',
      whyInTopUniverse:
        'הנכס הבטוח והחזק ביותר בתיק להגנה מפני זעזועי מאקרו, עם צמיחה עקבית של ההון העצמי למניה לאורך 60 שנה.',
      fiveYearGrowthDrivers: [
        'הכנסות ריבית גבוהות על קופת המזומנים העצומה',
        'רווחי חיתום ביטוחי משופרים ב-GEICO עקב שדרוג מערכות הטלמטריה',
        'הקצאת הון אופורטוניסטית ברכישת חברות שלמות ומניות בעת ירידות שערים',
      ],
      primaryFailureRisks: [
        'אתגר גודל ההון שמקשה על מציאת עסקאות ענק המזיזות את המחט',
        'מעבר הנהגה לאחר פרישתו של וורן באפט (אם כי תוכנית הירושה של גרג אבל מוכנה).',
      ],
      moatWhyExists: 'שילוב של הון עצמי הגדול בעולם התאגידי, דירוג אשראי אולטימטיבי ותרבות ארגונית של עצמאות ניהולית.',
      moatWhatCouldDestroyIt: 'הקצאת הון כושלת ברכישות ענק עתידיות או קטסטרופה ביטוחית חסרת תקדים.',
      baseCaseAssumptions: 'צמיחה שנתית של 8%-11% בערך הפנקסני והרווח התפעולי, רכישות מניות עצמיות במחיר הוגן וחסינות מוחלטת.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  TSM: {
    he: {
      companyNameHe: 'טאיוואן סמיקונדקטור (TSMC)',
      industryHe: 'ייצור שבבים מתקדמים ופאונדרי עולמי',
      investmentThesisSummary:
        'טאיוואן סמיקונדקטור (TSMC) היא בית היציקה (Foundry) המייצר למעלה מ-90% מכלל השבבים המתקדמים בעולם (כולל עבור אפל, אנבידיה, AMD, קוואלקום וברודקום). ללא מפעלי TSMC לא ניתן לייצר סמארטפונים מודרניים, מעבדי AI או מחשבי-על.',
      moatDefenseMechanism:
        'יתרון הנדסי וכושר ייצור בלתי נתפס במזעור שבבים (3nm, 2nm) הדורש השקעות הון שנתיות של 30-40 מיליארד דולר ששום מתחרה אינה יכולה להשתוות להן.',
      whyInTopUniverse:
        'מונופול הייצור החיוני ביותר בכלכלה המודרנית עם מרווח גולמי של 53%+ ו-ROIC של כ-30%.',
      fiveYearGrowthDrivers: [
        'ביקוש מתפוצץ למעבדי בינה מלאכותית הדורשים טכנולוגיית אריזה מתקדמת (CoWoS)',
        'מעבר לייצור מסחרי של תהליך 2 ננומטר (N2) בעל שולי רווח פרימיום',
        'הקמת מפעלים גלובליים בארה"ב, יפן וגרמניה לגיוון גיאופוליטי',
      ],
      primaryFailureRisks: [
        'סיכון גיאופוליטי מול סין במצר טאיוואן',
        'רגישות למחזורי ביקושים בשוק האלקטרוניקה הצרכנית.',
      ],
      moatWhyExists: 'פער טכנולוגי של שנים במזעור וניצולת ייצור (Yield) מעל אינטל וסמסונג.',
      moatWhatCouldDestroyIt: 'הסלמה צבאית בטאיוואן או פריצת דרך טכנולוגית חריגה של מתחרה ישיר.',
      baseCaseAssumptions: 'צמיחה שנתית של 15%-20% בהכנסות דולריות, שמירה על מרווח גולמי מעל 53% ותשואה גבוהה על ההון המושקע.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  MA: {
    he: {
      companyNameHe: 'מאסטרקארד',
      industryHe: 'רשתות תשלום דיגיטליות וסליקה גלובלית',
      investmentThesisSummary:
        'מאסטרקארד (Mastercard) מפעילה את הרשת השנייה בגודלה בעולם לתשלומים אלקטרוניים, הפועלת כדואופול מוגן יחד עם ויזה. החברה מתאפיינת במודל עמלת מעבר ללא סיכון אשראי ישיר, מרווחי רווח תפעולי של מעל 57% ו-ROIC פנומנלי של מעל 55%.',
      moatDefenseMechanism:
        'אפקט רשת דו-צדדי עצום של מיליארדי כרטיסים ועשרות מיליוני סוחרים בעולם, המונע כניסת מתחרים חדשים.',
      whyInTopUniverse:
        'אחת ממכונות ייצור התזרים החופשי הרווחיות בעולם, עם מנוע צמיחה חזק בשירותי סייבר וטכנולוגיות תשלום B2B.',
      fiveYearGrowthDrivers: [
        'צמיחה מתמשכת בנפח תשלומים חוצי-גבולות (Cross-Border)',
        'התרחבות שירותי ערך מוסף (סייבר, ניתוח דאטה ואבטחה) הצומחים בקצב מהיר מהסליקה',
        'חדירה לתשלומי B2B וחשבוניות תאגידיות',
      ],
      primaryFailureRisks: [
        'רגולציה להגבלת עמלות סליקה בארה"ב ובאירופה',
        'פיתוח רשתות סליקה מיידיות ממשלתיות.',
      ],
      moatWhyExists: 'אפקט רשת דו-צדדי גלובלי המאפשר לכל מחזיק כרטיס לשלם באופן מיידי בכל מקום בעולם.',
      moatWhatCouldDestroyIt: 'חקיקה המבטלת את בלעדיות הרשתות או פתרון תשלום דיגיטלי ללא עמלות שיתפוס נתח שוק מהותי.',
      baseCaseAssumptions: 'צמיחה שנתית של 10%-12% בהכנסות, צמיחת רווח למניה של 14%-16% עקב רכישה עצמית ומרווח תפעולי של 58%.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  BLK: {
    he: {
      companyNameHe: 'בלאקרוק',
      industryHe: 'ניהול השקעות, נכסים מוסדיים וקרנות iShares',
      investmentThesisSummary:
        'בלאקרוק (BlackRock) היא מנהלת הנכסים הגדולה בעולם עם מעל 11 טריליון דולר בנכסים מנוהלים (AUM). החברה מחזיקה במובילת קרנות הסל העולמית (iShares) ובמערכת ניהול הסיכונים הטכנולוגית המוסדית המובילה (Aladdin).',
      moatDefenseMechanism:
        'יתרון גודל ללא תחרות המאפשר עמלות נמוכות ביותר, נזילות עליונה בקרנות iShares ותוכנת Aladdin הנעולה באלפי מוסדות פיננסיים.',
      whyInTopUniverse:
        'הנהנה המרכזי ממעבר ההון העולמי להשקעות פאסיביות ושווקים פרטיים עם מרווח תפעולי יציב של 40%+.',
      fiveYearGrowthDrivers: [
        'התרחבות מואצת לשווקים פרטיים ותשתיות (רכישת GIP ו-Preqin)',
        'המשך זרימת הון לקרנות מחקות iShares ולקרנות מחקות אג"ח',
        'הכנסות חוזרות מדמי מנוי למערכת Aladdin',
      ],
      primaryFailureRisks: [
        'ירידות שערים חדות בשווקים הפיננסיים המכווצות את היקף הנכסים המנוהלים',
        'שחיקת עמלות (Fee compression) במוצרים מסורתיים.',
      ],
      moatWhyExists: 'נזילות שיא וגודל שמייצרים חסם כניסה ששום קרן קטנה אינה יכולה להתחרות בו.',
      moatWhatCouldDestroyIt: 'משבר אמון פיננסי עולמי או פגיעה טכנולוגית מהותית בליבת Aladdin.',
      baseCaseAssumptions: 'צמיחה שנתית של 8%-12% ברווח למניה, הגדלת דיבידנד רציפה ו-ROIC של 15%+.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
  MNST: {
    he: {
      companyNameHe: 'מונסטר משקאות',
      industryHe: 'משקאות אנרגיה, מותגי צריכה והפצה עולמית',
      investmentThesisSummary:
        'מונסטר בברג׳ (Monster Beverage - MNST) היא אחת ממכונות הצמיחה והתשואה הטובות בתולדות וול-סטריט. החברה פועלת במודל Asset-Light כמעט ללא חובות, שומרת על שולי רווח גולמי של מעל 53%, ונהנית מברית הפצה בלעדית גלובלית דרך מערך הבקבוק של קוקה קולה (Coca-Cola Bottling System).',
      moatDefenseMechanism:
        'עוצמת מותג אנרגיה מוביל עולמי, נאמנות צרכנים קיצונית, ורשת הפצה בלעדית אדירה של קוקה-קולה בכל נקודת מכירה בעולם.',
      whyInTopUniverse:
        'רווחיות פנומנלית (ROIC של 26%+), יצירת מזומנים חופשית עקבית, מאזן נטול חובות נטו עם רכישה עצמית מסיבית של מניות.',
      fiveYearGrowthDrivers: [
        'התרחבות בינלאומית מואצת בשווקים מתעוררים (אסיה, אמריקה הלטינית והמזרח התיכון)',
        'חדשנות מוצרית וצמיחה בסדרות Monster Ultra (ללא סוכר), Reign ו-Predator',
        'חדירה לקטגוריית המשקאות האלכוהוליים והחליטות (CANarchy / The Beast Unleashed)',
        'ייעול שרשראות האספקה והוזלת עלויות האלומיניום והשילוח',
      ],
      primaryFailureRisks: [
        'התגברות התחרות בקטגוריית האנרגיה הפונקציונלית מצד מותגים כמו Celsius',
        'הטלת מסים על משקאות ממותקים או רגולציה מחמירה על רמות קפאין.',
      ],
      moatWhyExists: 'הסכם הפצה אסטרטגי ובלעדי עם קוקה-קולה המחזיקה בכ-19.5% ממניות החברה, לצד מותג Monster Energy האייקוני.',
      moatWhatCouldDestroyIt: 'פגיעה במערך היחסים וההפצה עם זכייניות קוקה קולה או שינוי טעמי צרכנים גורף נגד משקאות אנרגיה.',
      baseCaseAssumptions: 'צמיחה שנתית של 10%-13% בהכנסות, שמירה על מרווח תפעולי של 28%+, רכישה עצמית של 2%-3% מהמניות בשנה ו-ROIC מעל 25%.',
    },
    en: {},
    de: {},
    fr: {},
    es: {},
  },
};

// Heuristic Hebrew Translator for Common Financial Analysis Sentences
export function translateFinancialTextToHebrew(text: string): string {
  if (!text) return text;
  
  const replacements: [RegExp, string][] = [
    [/is an elite market leader in/gi, 'היא מובילת שוק עליונה בתחום'],
    [/With an established competitive moat/gi, 'עם חפיר תחרותי מבוסס ומוכח'],
    [/and disciplined capital allocation/gi, 'והקצאת הון קפדנית'],
    [/it is a prime candidate for 5-year compounding/gi, 'היא מועמדת מובילה לצמיחה מורכבת של ערך לשנתיים קדימה (FY2)'],
    [/Organic expansion across/gi, 'צמיחה אורגנית עקבית בסקטור'],
    [/High cash conversion and margin accretion/gi, 'יחס המרת תזרים מזומנים גבוה והתרחבות מרווחים'],
    [/Systematic share buybacks and high return on reinvested capital/gi, 'רכישות עצמיות של מניות והחזר גבוה על הון מושקע מחדש'],
    [/Macroeconomic deceleration/gi, 'האטה מקרו-כלכלית מתונה'],
    [/Intensified competitive pricing pressure/gi, 'לחצי תחרות ותמחור מוגברים'],
    [/High quality compounder with/gi, 'חברת איכות מובילה עם'],
    [/projected 5Y CAGR/gi, 'תשואת CAGR שנתית צפויה לשנתיים (FY2)'],
    [/Clear Non-Trap/gi, 'עסק איכותי בטוח (אינו מלכודת ערך)'],
    [/High ROIC/gi, 'תשואת ROIC גבוהה'],
    [/and positive FCF conversion/gi, 'ויחס המרת תזרים מזומנים חיובי ואיתן'],
    [/Strong per-share compounding/gi, 'יצירת ערך והחזר מעולה למניה'],
    [/Solid per-share compounding engine driven by organic earnings growth and share count retirement/gi, 'מנוע צמיחה למניה המונע מעלייה ברווחים ורכישה עצמית עקבית של מניות'],
    [/Demonstrated ability to pass input cost inflation to customers while expanding gross margins/gi, 'יכולת מוכחת לגלגל אינפלציית עלויות ללקוחות תוך שמירה על מרווח גולמי'],
    [/Macro Sensitivity & Cycle Risk/gi, 'רגישות למחזורי מאקרו כלכליים'],
    [/Temporary macro slowdowns can moderate customer expansion velocity/gi, 'האטה כלכלית זמנית עשויה למתן את קצב גידול הלקוחות'],
    [/Easily absorbed by strong net cash position and industry pricing power/gi, 'נספג בקלות הודות לקופת מזומנים איתנה וכוח תמחור ענפי'],
    [/Macro slowdown and multiple compression/gi, 'האטה כלכלית וכיווץ מכפילים בשוק'],
    [/Steady market share defense/gi, 'שמירה יציבה על נתח שוק'],
    [/New product cycles accelerate revenue and expand valuation multiple/gi, 'מחזורי מוצרים חדשים מאיצים הכנסות ומרחיבים מכפילים'],
    [/Pristine balance sheet supporting ongoing shareholder returns/gi, 'מאזן מושלם התומך בהחזר הון מתמשך למשקיעים'],
    [/Substantial runway across global/gi, 'מרחב צמיחה משמעותי בשוק היעד העולמי של'],
    [/total addressable market/gi, 'שוק היעד הכולל (TAM)'],
    [/Expansion of core/gi, 'התרחבות פעילות הליבה של'],
    [/high-margin product offerings/gi, 'הצעת מוצרים בעלי שולי רווח גבוהים'],
    [/International geographic penetration and enterprise adoption/gi, 'חדירה גיאוגרפית בינלאומית ואימוץ ארגוני רחב'],
    [/Systematic operating leverage and free cash flow reinvestment/gi, 'מינוף תפעולי שיטתי והשקעה מחדש של תזרים מזומנים חופשי'],
    [/Trades at reasonable multiple relative to high ROIC/gi, 'נסחרת במכפיל סביר ביחס ל-ROIC הגבוה שלה'],
    [/and durable moat/gi, 'והחפיר הכלכלי העמיד'],
    [/Favorable risk\/reward balance over a 5-year investment horizon/gi, 'יחס סיכוי/סיכון אטרקטיבי באופק השקעה לשנתיים (FY2)'],
    [/Market leadership and pricing power justify current premium multiple/gi, 'מובילות שוק וכוח תמחור מצדיקים את פרמיית התמחור הנוכחית'],
    [/Consensus under-models operating leverage and recurring revenue expansion/gi, 'הקונצנזוס ממעיט בהערכת המינוף התפעולי והתרחבות ההכנסות החוזרות'],
  ];

  let result = text;
  for (const [regex, replacement] of replacements) {
    result = result.replace(regex, replacement);
  }
  return result;
}

/**
 * Returns a fully localized copy of ResearchStock based on current language
 */
export function localizeStock(stock: ResearchStock, lang: SupportedLanguage | string = 'he'): ResearchStock {
  if (!stock) return stock;
  const safeLang = (['he', 'en', 'de', 'fr', 'es'].includes(lang) ? lang : 'he') as SupportedLanguage;
  if (safeLang === 'en') return stock;

  const localizedStock = JSON.parse(JSON.stringify(stock)) as ResearchStock;
  const ticker = (stock.ticker || '').toUpperCase().trim();
  const tickerKey = ticker.replace('.', '_');

  // 1. Localize sector and industry
  if (localizedStock.sector && SECTOR_TRANSLATIONS[safeLang]?.[localizedStock.sector]) {
    localizedStock.sector = SECTOR_TRANSLATIONS[safeLang][localizedStock.sector];
  }

  // 2. Check catalog metadata for Hebrew fallback
  const catalogItem = MARKET_UNIVERSE_CATALOG.find((c) => c.ticker === ticker);
  if (catalogItem && safeLang === 'he') {
    if (catalogItem.nameHe) localizedStock.companyName = catalogItem.nameHe;
    if (catalogItem.sectorHe) localizedStock.industry = catalogItem.sectorHe;
    if (catalogItem.moatHe && !localizedStock.moatDefenseMechanism) {
      localizedStock.moatDefenseMechanism = catalogItem.moatHe;
    }
    if (catalogItem.descriptionHe && !localizedStock.investmentThesisSummary) {
      localizedStock.investmentThesisSummary = catalogItem.descriptionHe;
    }
  }

  // 3. Look for explicit hand-curated translations
  const tData = STOCK_TRANSLATIONS[ticker]?.[safeLang] || STOCK_TRANSLATIONS[tickerKey]?.[safeLang];
  if (tData) {
    if (tData.companyNameHe && safeLang === 'he') localizedStock.companyName = tData.companyNameHe;
    if (tData.industryHe && safeLang === 'he') localizedStock.industry = tData.industryHe;
    if (tData.investmentThesisSummary) localizedStock.investmentThesisSummary = tData.investmentThesisSummary;
    if (tData.moatDefenseMechanism) localizedStock.moatDefenseMechanism = tData.moatDefenseMechanism;
    if (tData.whyInTopUniverse) localizedStock.whyInTopUniverse = tData.whyInTopUniverse;
    if (tData.fiveYearGrowthDrivers && tData.fiveYearGrowthDrivers.length > 0) {
      localizedStock.fiveYearGrowthDrivers = tData.fiveYearGrowthDrivers;
    }
    if (tData.primaryFailureRisks && tData.primaryFailureRisks.length > 0) {
      localizedStock.primaryFailureRisks = tData.primaryFailureRisks;
    }
    if (tData.moatWhyExists && localizedStock.moat) {
      localizedStock.moat.whyExists = tData.moatWhyExists;
    }
    if (tData.moatWhatCouldDestroyIt && localizedStock.moat) {
      localizedStock.moat.whatCouldDestroyIt = tData.moatWhatCouldDestroyIt;
    }
    if (tData.tamAndMarketPenetration && localizedStock.growth) {
      localizedStock.growth.tamAndMarketPenetration = tData.tamAndMarketPenetration;
    }
    if (tData.truePerShareCreationVerdict && localizedStock.perShareValueCreation) {
      localizedStock.perShareValueCreation.truePerShareCreationVerdict = tData.truePerShareCreationVerdict;
    }
    if (tData.peerComparisonNotes && localizedStock.valuation) {
      localizedStock.valuation.peerComparisonNotes = tData.peerComparisonNotes;
    }
    if (tData.expectationsGapExplanation && localizedStock.analysts?.expectationsGap) {
      localizedStock.analysts.expectationsGap.explanation = tData.expectationsGapExplanation;
    }
    if (tData.bearCaseAssumptions && localizedStock.scenarios?.bearCase) {
      localizedStock.scenarios.bearCase.assumptions = tData.bearCaseAssumptions;
    }
    if (tData.baseCaseAssumptions && localizedStock.scenarios?.baseCase) {
      localizedStock.scenarios.baseCase.assumptions = tData.baseCaseAssumptions;
    }
    if (tData.bullCaseAssumptions && localizedStock.scenarios?.bullCase) {
      localizedStock.scenarios.bullCase.assumptions = tData.bullCaseAssumptions;
    }
  }

  // 4. Translate core narrative strings if in Hebrew
  if (safeLang === 'he') {
    if (localizedStock.investmentThesisSummary) {
      localizedStock.investmentThesisSummary = translateFinancialTextToHebrew(localizedStock.investmentThesisSummary);
    }
    if (localizedStock.moatDefenseMechanism) {
      localizedStock.moatDefenseMechanism = translateFinancialTextToHebrew(localizedStock.moatDefenseMechanism);
    }
    if (localizedStock.whyInTopUniverse) {
      localizedStock.whyInTopUniverse = translateFinancialTextToHebrew(localizedStock.whyInTopUniverse);
    }
    if (localizedStock.moat?.whyExists) {
      localizedStock.moat.whyExists = translateFinancialTextToHebrew(localizedStock.moat.whyExists);
    }
    if (localizedStock.moat?.whatCouldDestroyIt) {
      localizedStock.moat.whatCouldDestroyIt = translateFinancialTextToHebrew(localizedStock.moat.whatCouldDestroyIt);
    }
    if (localizedStock.growth?.tamAndMarketPenetration) {
      localizedStock.growth.tamAndMarketPenetration = translateFinancialTextToHebrew(localizedStock.growth.tamAndMarketPenetration);
    }
    if (localizedStock.perShareValueCreation?.truePerShareCreationVerdict) {
      localizedStock.perShareValueCreation.truePerShareCreationVerdict = translateFinancialTextToHebrew(localizedStock.perShareValueCreation.truePerShareCreationVerdict);
    }
    if (localizedStock.valuation?.peerComparisonNotes) {
      localizedStock.valuation.peerComparisonNotes = translateFinancialTextToHebrew(localizedStock.valuation.peerComparisonNotes);
    }
    if (localizedStock.valuation?.growthAdjustedAttractiveness) {
      localizedStock.valuation.growthAdjustedAttractiveness = translateFinancialTextToHebrew(localizedStock.valuation.growthAdjustedAttractiveness);
    }
    if (localizedStock.valuation?.qualityAdjustedJustification) {
      localizedStock.valuation.qualityAdjustedJustification = translateFinancialTextToHebrew(localizedStock.valuation.qualityAdjustedJustification);
    }
    if (localizedStock.analysts?.expectationsGap?.explanation) {
      localizedStock.analysts.expectationsGap.explanation = translateFinancialTextToHebrew(localizedStock.analysts.expectationsGap.explanation);
    }
    if (localizedStock.valueTrap?.verdict) {
      localizedStock.valueTrap.verdict = translateFinancialTextToHebrew(localizedStock.valueTrap.verdict);
    }
    if (localizedStock.scenarios) {
      if (localizedStock.scenarios.bearCase?.assumptions) {
        localizedStock.scenarios.bearCase.assumptions = translateFinancialTextToHebrew(localizedStock.scenarios.bearCase.assumptions);
      }
      if (localizedStock.scenarios.baseCase?.assumptions) {
        localizedStock.scenarios.baseCase.assumptions = translateFinancialTextToHebrew(localizedStock.scenarios.baseCase.assumptions);
      }
      if (localizedStock.scenarios.bullCase?.assumptions) {
        localizedStock.scenarios.bullCase.assumptions = translateFinancialTextToHebrew(localizedStock.scenarios.bullCase.assumptions);
      }
      if (localizedStock.scenarios.keyDrivers) {
        localizedStock.scenarios.keyDrivers = localizedStock.scenarios.keyDrivers.map(translateFinancialTextToHebrew);
      }
    }
    if (localizedStock.fiveYearGrowthDrivers) {
      localizedStock.fiveYearGrowthDrivers = localizedStock.fiveYearGrowthDrivers.map(translateFinancialTextToHebrew);
    }
    if (localizedStock.primaryFailureRisks) {
      localizedStock.primaryFailureRisks = localizedStock.primaryFailureRisks.map(translateFinancialTextToHebrew);
    }
    if (localizedStock.redFlags) {
      localizedStock.redFlags = localizedStock.redFlags.map((rf) => ({
        ...rf,
        title: translateFinancialTextToHebrew(rf.title),
        description: translateFinancialTextToHebrew(rf.description),
        impact: translateFinancialTextToHebrew(rf.impact),
      }));
    }
  }

  return localizedStock;
}

export function localizeSectorName(sector: string, lang: SupportedLanguage | string = 'he'): string {
  const safeLang = (['he', 'en', 'de', 'fr', 'es'].includes(lang) ? lang : 'he') as SupportedLanguage;
  return SECTOR_TRANSLATIONS[safeLang]?.[sector] || sector;
}
