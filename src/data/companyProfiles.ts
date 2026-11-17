import { CompanyProfileInfo, ResearchStock } from '../types';

export const CURATED_COMPANY_PROFILES: Record<string, CompanyProfileInfo> = {
  NVDA: {
    whatItDoesHe:
      'אנבידיה היא המובילה העולמית בפיתוח שבבי בינה מלאכותית (GPU), מאיצי מרכזי נתונים ותשתית התוכנה CUDA שמניעה את רוב מודלי ה-AI המתקדמים בעולם.',
    whatItDoesEn:
      'NVIDIA designs the world’s leading AI GPUs, data center networking fabrics, and the CUDA software stack powering modern generative AI and accelerated computing.',
    revenueModelHe:
      'מכירת שבבי AI ושרתים למרכזי נתונים של ענקיות הענן (Hyperscalers), תוכנות רישוי לתשתית AI, וכרטיסי מסך לגיימינג ולרכב אוטונומי.',
    revenueModelEn:
      'Data center AI accelerators sold to cloud hyperscalers and enterprises, recurring AI software licensing, gaming GPUs, and automotive/robotics platforms.',
    businessSegmentsHe: [
      'מרכזי נתונים ו-AI (Data Center): ליבת ההכנסות (~85%+), מאיצי Blackwell/Hopper ותקשורת מהירה (Mellanox/InfiniBand).',
      'גיימינג וגרפיקה מקצועית: כרטיסי GeForce RTX לצרכנים ותחנות עבודה.',
      'רכב אוטונומי ורובוטיקה: פלטפורמות NVIDIA DRIVE ו-Omniverse לתעשייה דיגיטלית.',
    ],
    businessSegmentsEn: [
      'Data Center & AI Compute (~85%+ of revenue): Blackwell/Hopper GPUs & high-speed InfiniBand networking.',
      'Gaming & Pro Visualization: GeForce RTX GPUs and enterprise graphics.',
      'Automotive & Robotics: NVIDIA DRIVE and Omniverse industrial digital-twin platforms.',
    ],
    investmentAvenuesHe: [
      'השקעת עתק במו"פ (R&D) לקצב שנתי של דורות שבבים חדשים (Blackwell → Rubin).',
      'פיתוח אקוסיסטם תוכנה ושירותי ענן (CUDA, NIM, AI Enterprise) להגברת עלויות מעבר.',
      'השקעות אסטרטגיות בסטארטאפים של AI, ביוטק ורובוטיקה ורכישות חוזרות של מניות.',
    ],
    investmentAvenuesEn: [
      'Heavy R&D investment sustaining an annual AI chip cadence (Blackwell → Rubin).',
      'Expanding sticky software & NIM cloud inference microservices.',
      'Strategic AI/biotech ecosystem stakes and disciplined share buybacks.',
    ],
  },
  AAPL: {
    whatItDoesHe:
      'אפל מפתחת ומוכרת מוצרי קצה מובילים (אייפון, מק, אייפד, שעונים ואוזניות) לצד מערך שירותים דיגיטליים צומח של כ-2.2 מיליארד מכשירים פעילים ברחבי העולם.',
    whatItDoesEn:
      'Apple designs iconic consumer hardware (iPhone, Mac, iPad, Wearables) integrated with a high-margin digital services ecosystem across 2.2B+ active devices.',
    revenueModelHe:
      'מכירת חומרת פרימיום בעלת נאמנות מותג אדירה, ובנוסף גביית עמלות ומנויים קבועים משירותי iCloud, App Store, Apple Pay ו-Apple Music.',
    revenueModelEn:
      'Premium hardware unit sales paired with high-margin recurring subscriptions and platform fees across iCloud, App Store, and Apple Pay.',
    businessSegmentsHe: [
      'אייפון (iPhone): מעל 50% מההכנסות ומנוע הגיוס הראשי של לקוחות לאקוסיסטם.',
      'שירותים (Services): App Store, iCloud, AppleCare, פרסום ותשלומים — מנוע הרווחיות המרכזי (~70%+ שולי רווח גולמי).',
      'מחשוב ולבישים: מחשבי Mac (מעבדי Apple Silicon), אייפדים, Apple Watch ו-AirPods.',
    ],
    businessSegmentsEn: [
      'iPhone (>50% of revenue): Flagship ecosystem entry point.',
      'Services (~70%+ gross margin): App Store, iCloud, AppleCare, Licensing & Apple Pay.',
      'Mac, iPad & Wearables: Apple Silicon Macs, Apple Watch, and AirPods.',
    ],
    investmentAvenuesHe: [
      'השקעה בפיתוח שבבים עצמאיים (Apple Silicon) וביכולות בינה מלאכותית על המכשיר (Apple Intelligence).',
      'תוכנית החזר הון הגדולה בעולם: רכישות חוזרות של מניות בעשרות מיליארדי דולרים בשנה + דיבידנד.',
      'גיוון שרשראות האספקה והייצור להודו ווייטנאם והרחבת חדירת שירותים פיננסיים.',
    ],
    investmentAvenuesEn: [
      'Custom Apple Silicon & on-device Apple Intelligence R&D.',
      'Industry-leading capital return via massive annual share buybacks & dividends.',
      'Supply-chain diversification (India/Vietnam) and financial services expansion.',
    ],
  },
  MSFT: {
    whatItDoesHe:
      'מיקרוסופט היא ענקית התוכנה הארגונית והענן הגדולה בעולם, המפעילה את פלטפורמת הענן Azure, חבילת Office 365, מערכת ההפעלה Windows, LinkedIn ופעילות גיימינג.',
    whatItDoesEn:
      'Microsoft is the dominant global enterprise software and cloud infrastructure provider powering Azure, Microsoft 365 Copilot, Windows, LinkedIn, and Gaming.',
    revenueModelHe:
      'מנויי תוכנה עסקיים חוזרים (SaaS), חיוב לפי צריכה בתשתיות ענן ובינה מלאכותית (Azure), ורישוי תוכנה לתאגידים ומפתחים.',
    revenueModelEn:
      'Recurring enterprise SaaS subscriptions (M365, Dynamics), consumption-based Azure cloud & AI compute, and enterprise licensing.',
    businessSegmentsHe: [
      'ענן חכם (Intelligent Cloud / Azure): מנוע הצמיחה הראשי, כולל תשתיות AI ואירוח מודלים של OpenAI.',
      'פריון ותהליכים עסקיים: Microsoft 365, Teams, Dynamics 365 ו-LinkedIn.',
      'מחשוב אישי: Windows, חומרת Surface וחטיבת הגיימינג (Xbox / Activision Blizzard).',
    ],
    businessSegmentsEn: [
      'Intelligent Cloud (Azure): Core growth engine powering enterprise cloud and AI workloads.',
      'Productivity & Business Processes: Microsoft 365, Copilot, Dynamics, and LinkedIn.',
      'More Personal Computing: Windows, Surface, Search, and Xbox/Activision.',
    ],
    investmentAvenuesHe: [
      'השקעות הון (CapEx) מסיביות של עשרות מיליארדים בשנה בהקמת מרכזי נתונים וחוות שרתים ל-AI.',
      'הטמעת Copilot בכל מוצרי הארגון (Office, GitHub, אבטחת סייבר).',
      'חלוקת דיבידנד צומח בעקביות, רכישות חוזרות ורכישות אסטרטגיות (כגון Activision ושותפות OpenAI).',
    ],
    investmentAvenuesEn: [
      'Massive data-center & AI infrastructure CapEx worldwide.',
      'Embedding Copilot AI monetization across M365, GitHub, and Security.',
      'Consistent dividend growth, buybacks, and strategic M&A/AI partnerships.',
    ],
  },
  GOOGL: {
    whatItDoesHe:
      'אלפאבית (גוגל) היא מובילת החיפוש והפרסום הדיגיטלי העולמית (Google Search & YouTube), מפעילת ספקית הענן הצומחת Google Cloud, ומפתחת הטכנולוגיה המובילה לרכב אוטונומי (Waymo).',
    whatItDoesEn:
      'Alphabet dominates global digital search and video advertising (Google Search & YouTube), operates rapidly scaling Google Cloud, and leads autonomous driving via Waymo.',
    revenueModelHe:
      'פרסום ממוקד בכוונת קנייה בחיפוש וביוטיוב (~75% מההכנסות), חוזי ענן ארגוניים ו-AI דרך Google Cloud, ומנויי YouTube / Google One.',
    revenueModelEn:
      'Intent-driven search and video advertising (~75% of revenue), Google Cloud enterprise & AI contracts, and consumer subscriptions.',
    businessSegmentsHe: [
      'שירותי Google (חיפוש ויוטיוב): מונופול החיפוש העולמי, מערכת אנדרואיד, Chrome ו-YouTube.',
      'Google Cloud: שירותי ענן ואירוח בינה מלאכותית (Gemini & TPUs) עם רווחיות מזנקת.',
      'הימורי עתיד (Other Bets): מוניות אוטונומיות (Waymo), מדעי החיים (Verily) ומחשוב מתקדם.',
    ],
    businessSegmentsEn: [
      'Google Services: Global Search, YouTube, Android, Chrome & Google Play.',
      'Google Cloud: Enterprise cloud infrastructure, Gemini AI & custom TPU chips.',
      'Other Bets: Waymo autonomous robotaxis and life-science ventures.',
    ],
    investmentAvenuesHe: [
      'השקעה במרכזי נתונים ושבבי AI ייעודיים (TPUs) להרצת מודלי Gemini בחיפוש ובענן.',
      'התרחבות מסחרית של מוניות אוטונומיות Waymo לערים מרכזיות בארה"ב.',
      'תוכניות רכישה חוזרת אגרסיביות של מניות והנהגת דיבידנד רבעוני לבעלי מניות.',
    ],
    investmentAvenuesEn: [
      'AI infrastructure, custom TPUs, and Gemini integration across Search & Cloud.',
      'Commercial scaling of Waymo autonomous ride-hailing fleets.',
      'Large-scale share buybacks and quarterly dividend returns.',
    ],
  },
  AMZN: {
    whatItDoesHe:
      'אמזון היא ענקית המסחר המקוון הגדולה במערב וספקית תשתיות הענן המובילה בעולם (AWS), לצד עסקי פרסום דיגיטלי ענקיים ורשת לוגיסטיקה גלובלית.',
    whatItDoesEn:
      'Amazon operates the world’s largest e-commerce marketplace and global cloud leader (AWS), complemented by a fast-growing digital advertising business.',
    revenueModelHe:
      'מכירות קמעונאיות ועמלות ממוכרי צד ג׳, מנויי Amazon Prime, שירותי מחשוב ענן (AWS — מקור הרווח התפעולי העיקרי) ופרסום בחיפוש של אמזון.',
    revenueModelEn:
      'E-commerce retail & 3P seller fees, Prime memberships, high-margin AWS cloud infrastructure (primary profit engine), and sponsored ads.',
    businessSegmentsHe: [
      'AWS (שירותי ענן): ספקית הענן #1 בעולם, מייצרת את עיקר הרווח התפעולי של הקבוצה.',
      'מסחר מקוון צפון אמריקה ובינלאומי: חנות אונליין, מרקטפלייס ולוגיסטיקה מהירה (FBA).',
      'פרסום וסטרימינג: פרסומות ממומנות בעמודי קנייה + Prime Video ו-Twitch.',
    ],
    businessSegmentsEn: [
      'Amazon Web Services (AWS): #1 global cloud platform driving operating profits.',
      'North America & International Retail: Marketplace, 3P logistics & Prime.',
      'Advertising & Media: High-margin retail search ads and Prime Video.',
    ],
    investmentAvenuesHe: [
      'השקעה אדירה בתשתיות AWS, שבבי AI עצמאיים (Trainium/Inferentia) וחוות שרתים.',
      'אוטומציה ורובוטיקה במרכזי הפצה לקיצור זמני שילוח והורדת עלות ליחידה.',
      'תשתיות לווייני אינטרנט (Project Kuiper), בריאות (One Medical) ופרסום ב-Prime Video.',
    ],
    investmentAvenuesEn: [
      'AWS data-center expansion and custom AI silicon (Trainium/Inferentia).',
      'Warehouse robotics and regionalized fulfillment lowering delivery unit costs.',
      'Project Kuiper satellite broadband and Prime Video ad monetization.',
    ],
  },
  META: {
    whatItDoesHe:
      'מטא (פייסבוק, אינסטגרם ווואטסאפ) מפעילה את רשת האפליקציות החברתיות הגדולה בעולם עם מעל 3.2 מיליארד משתמשים יומיים.',
    whatItDoesEn:
      'Meta operates the world’s largest social communications ecosystem (Facebook, Instagram, WhatsApp, Threads) serving 3.2B+ daily active users.',
    revenueModelHe:
      'כ-98% מההכנסות מגיעות מפרסום דיגיטלי מדויק מבוסס AI בפיד, בסטוריז וב-Reels, לצד פיתוח ערוצי מסחר ושירות עסקי ב-WhatsApp.',
    revenueModelEn:
      'Highly targeted AI-driven digital advertising (~98% of revenue) across Instagram/Facebook feeds & Reels, plus WhatsApp business messaging.',
    businessSegmentsHe: [
      'משפחת האפליקציות (Family of Apps): Facebook, Instagram, WhatsApp, Messenger ו-Threads.',
      'Reality Labs: פיתוח משקפי מציאות מדומה ורבודה (Quest, משקפי Ray-Ban Meta AI).',
    ],
    businessSegmentsEn: [
      'Family of Apps: Facebook, Instagram, WhatsApp, Messenger & Threads.',
      'Reality Labs: Quest VR headsets and Ray-Ban Meta AI smart glasses.',
    ],
    investmentAvenuesHe: [
      'השקעות עתק בתשתיות מחשוב GPU לפיתוח מודלי AI (Llama) ושיפור אלגוריתמי פרסום.',
      'מונטיזציה של עסקים ב-WhatsApp Business וצמיחת מודעות ב-Threads.',
      'פיתוח ארוך טווח של מחשוב לביש ומשקפי AI חכמים לצד רכישות חוזרות ודיבידנד.',
    ],
    investmentAvenuesEn: [
      'Massive AI GPU cluster buildouts powering Llama models and ad ranking.',
      'Monetizing WhatsApp Business messaging and Threads advertising.',
      'Smart AI glasses / AR hardware R&D alongside buybacks and dividends.',
    ],
  },
  TSLA: {
    whatItDoesHe:
      'טסלה מפתחת ומייצרת רכבים חשמליים (EV), מערכות אגירת אנרגיה סולאריות ותעשייתיות, תוכנת נהיגה אוטונומית (FSD) ורובוטים דמויי-אדם (Optimus).',
    whatItDoesEn:
      'Tesla designs and manufactures electric vehicles, grid-scale battery storage systems, autonomous driving AI (FSD), and humanoid robotics (Optimus).',
    revenueModelHe:
      'מכירת רכבים חשמליים ישירות לצרכן, מנויי נהיגה אוטונומית וטעינת Supercharger, ופריסת מערכות אגירת אנרגיה (Megapack) ברווחיות עולה.',
    revenueModelEn:
      'Direct EV sales, Supercharger & FSD software subscriptions, and rapidly growing utility-scale energy storage deployments.',
    businessSegmentsHe: [
      'רכב חשמלי (Automotive): דגמי Model Y, Model 3, Cybertruck ורשת טעינה מהירה.',
      'אנרגיה ואגירה (Tesla Energy): סוללות Megapack ו-Powerwall לחברות חשמל ובתים.',
      'AI, אוטונומיה ורובוטיקה: תוכנת Full Self-Driving, תכנון מונית Cybercab ורובוט Optimus.',
    ],
    businessSegmentsEn: [
      'Automotive: Model 3/Y, Cybertruck, and the global Supercharger network.',
      'Tesla Energy: Megapack utility battery storage and solar/Powerwall.',
      'AI & Robotics: FSD autonomous driving, Robotaxi network, and Optimus.',
    ],
    investmentAvenuesHe: [
      'הקמת מפעלי ענק (Gigafactories) והרחבת קווי ייצור לסוללות ולרכב חשמלי מוזל.',
      'הקמת מחשבי-על לאימון AI (Dojo / אשכולות GPU) לטובת רשת מוניות אוטונומיות ורובוטיקה.',
      'הגדלת כושר הייצור של מפעלי Megapack לאספקת אגירת אנרגיה למרכזי נתונים.',
    ],
    investmentAvenuesEn: [
      'Gigafactory manufacturing expansion and next-gen lower-cost EV platforms.',
      'AI supercomputing clusters for FSD Robotaxi and Optimus robotics.',
      'Scaling Megapack energy storage factories for grid and data center demand.',
    ],
  },
  UNH: {
    whatItDoesHe:
      'יונייטד-הלת׳ גרופ היא קבוצת הבריאות והביטוח הרפואי הגדולה בארה״ב, המשלבת ביטוח רפואי ל-50+ מיליון מבוטחים עם רשת מרפאות, ניתוח מידע ובתי מרקחת (Optum).',
    whatItDoesEn:
      'UnitedHealth Group is the largest US healthcare company, combining health insurance for 50M+ members with Optum clinical care, pharmacy, and health tech.',
    revenueModelHe:
      'גביית פרמיות ביטוח בריאות (ממעסיקים ו-Medicare) + הכנסות משירותי רפואה, ניהול תרופות (PBM) ותוכנה ודאטה רפואי ב-Optum.',
    revenueModelEn:
      'Employer & government health insurance premiums alongside high-margin Optum clinical care, pharmacy care services, and healthcare analytics.',
    businessSegmentsHe: [
      'UnitedHealthcare: זרוע הביטוח הרפואי הגדולה בארה״ב (מעסיקים, פרטיים ו-Medicare).',
      'Optum Health: רשת מרפאות וטיפול מבוסס ערך (Value-Based Care) עם כ-90,000 רופאים.',
      'Optum Rx & Optum Insight: ניהול שרשרת תרופות, מערכות מידע וטכנולוגיית AI לבתי חולים.',
    ],
    businessSegmentsEn: [
      'UnitedHealthcare: Leading US health benefits plans (Commercial, Medicare, Medicaid).',
      'Optum Health: Value-based clinical care network with ~90,000 affiliated physicians.',
      'Optum Rx & Insight: Pharmacy benefit services and healthcare software analytics.',
    ],
    investmentAvenuesHe: [
      'רכישת מרפאות ומרכזי טיפול מקומיים למעבר לרפואה מונעת בעלות נמוכה יותר.',
      'השקעה בבינה מלאכותית וטכנולוגיית אוטומציה לתביעות וניהול נתונים קליניים ב-Optum Insight.',
      'החזר הון שוטף באמצעות דיבידנד גדל בעקביות ורכישה חוזרת של מניות.',
    ],
    investmentAvenuesEn: [
      'Acquiring ambulatory clinics & home health platforms for value-based care.',
      'AI and clinical workflow automation across Optum Insight.',
      'Consistent annual dividend raises and disciplined share repurchases.',
    ],
  },
  LLY: {
    whatItDoesHe:
      'אלי לילי היא ענקית תרופות אמריקאית המובילה בעולם את מהפכת הטיפולים בהשמנה וסוכרת (Mounjaro / Zepbound), לצד תרופות מתקדמות באונקולוגיה, אימונולוגיה ואלצהיימר.',
    whatItDoesEn:
      'Eli Lilly is a global pharmaceutical leader spearheading GLP-1 obesity/diabetes therapies (Mounjaro, Zepbound) alongside oncology, immunology, and Alzheimer’s.',
    revenueModelHe:
      'פיתוח ומכירת תרופות מוגנות פטנט בעלות ביקוש שיא ורווחיות גולמית של מעל 80%.',
    revenueModelEn:
      'Patent-protected branded pharmaceuticals enjoying extraordinary demand and >80% gross margins.',
    businessSegmentsHe: [
      'קרדיו-מטבולי (GLP-1): Mounjaro לסוכרת ו-Zepbound לירידה במשקל — מנוע הצמיחה המרכזי.',
      'אונקולוגיה ואימונולוגיה: Verzenio לסרטן השד, Taltz ו-Omvoh למחלות אוטואימוניות.',
      'נוירולוגיה: Kisunla לטיפול מוקדם באלצהיימר.',
    ],
    businessSegmentsEn: [
      'Cardiometabolic GLP-1: Mounjaro (diabetes) and Zepbound (obesity).',
      'Oncology & Immunology: Verzenio, Taltz, and Omvoh.',
      'Neuroscience: Kisunla for early-stage Alzheimer’s treatment.',
    ],
    investmentAvenuesHe: [
      'השקעות הון של עשרות מיליארדי דולרים בהקמת מפעלי ייצור והזרקות חדשים בארה״ב ואירופה לסגירת פערי אספקה.',
      'מו"פ אינטנסיבי בדור הבא של תרופות השמנה בבליעה (כדורים) ומשולשות קולטנים (Retatrutide).',
      'רכישות ממוקדות של חברות ביוטק (כגון רדיו-פארמה ועריכה גנטית) להרחבת הצנרת.',
    ],
    investmentAvenuesEn: [
      'Multi-billion manufacturing CapEx building new sterile fill-finish and API facilities.',
      'Heavy R&D in oral GLP-1s (Orforglipron) and next-gen tri-agonists (Retatrutide).',
      'Bolt-on biotech M&A across radiopharmaceuticals and genetic medicine.',
    ],
  },
  V: {
    whatItDoesHe:
      'ויזה מפעילה את רשת התשלומים הדיגיטליים הגדולה בעולם, המחברת בין צרכנים, עסקים ובנקים ביותר מ-200 מדינות.',
    whatItDoesEn:
      'Visa operates the world’s largest retail electronic payment network connecting consumers, merchants, and financial institutions across 200+ countries.',
    revenueModelHe:
      'מודל "כביש אגרה" נטול סיכון אשראי (ויזה אינה מלווה כסף אלא גובה עמלה זעירה על כל סליקה והעברת נתונים), עם שולי רווח תפעולי מעל 66%.',
    revenueModelEn:
      'Asset-light tollbooth model earning small transaction fees on payment volume and cross-border flows without taking consumer credit risk.',
    businessSegmentsHe: [
      'תשלומי צרכנים וכרטיסים (VisaNet): עמלות סליקה על טריליוני דולרים בשנה.',
      'עסקאות חוצות גבולות (Cross-Border): נסיעות ורכישות בינלאומיות — מרווח הרווח הגבוה ביותר.',
      'שירותי ערך מוסף (VAS) ו-Visa Direct: אבטחת סייבר, מניעת הונאות AI והעברות מיידיות B2B/P2P.',
    ],
    businessSegmentsEn: [
      'Core Payment Network (VisaNet): Fees on global credit/debit purchase volume.',
      'Cross-Border Volumes: High-margin international travel and e-commerce flows.',
      'Value-Added Services & Visa Direct: Fraud AI, tokenization, and real-time B2B payouts.',
    ],
    investmentAvenuesHe: [
      'השקעה בטכנולוגיות מניעת הונאות AI, טוקניזציה ואבטחת תשלומים דיגיטליים.',
      'הרחבת תשתיות תשלומים בין עסקים (B2B), העברות בזמן אמת וחיבור ארנקים דיגיטליים.',
      'החזרת כמעט 100% מתזרים המזומנים החופשי לבעלי המניות ברכישות עצמיות ובדיבידנדים.',
    ],
    investmentAvenuesEn: [
      'Investing in AI fraud prevention, tokenization, and network security.',
      'Expanding B2B money movement (Visa Direct) and emerging market digital acceptance.',
      'Returning nearly 100% of free cash flow via buybacks and growing dividends.',
    ],
  },
  MA: {
    whatItDoesHe:
      'מאסטרקארד היא מפעילת רשת הסליקה והתשלומים הדיגיטליים השנייה בגודלה בעולם, המרוויחה ממעבר עולמי ממזומן לתשלומים דיגיטליים ומשירותי סייבר ואנליטיקה.',
    whatItDoesEn:
      'Mastercard is a global payments technology powerhouse processing digital card and real-time payments while selling high-growth cybersecurity and analytics services.',
    revenueModelHe:
      'עמלות על נפח עסקאות, עסקאות חו"ל ומט"ח, לצד הכנסות חוזרות צומחות משירותי סייבר, מניעת הונאות וייעוץ דאטה לבנקים.',
    revenueModelEn:
      'Transaction/cross-border network fees paired with recurring revenue from cybersecurity, data analytics, and open banking.',
    businessSegmentsHe: [
      'רשת התשלומים הגלובלית: סליקת כרטיסי אשראי ודביט ברחבי העולם.',
      'תשלומים חוצי גבולות: מנוע רווח חזק מתיירות וסחר מקוון גלובלי.',
      'שירותי סייבר ובינה (Value-Added Services): ~35%+ מההכנסות, זיהוי הונאות ובנקאות פתוחה.',
    ],
    businessSegmentsEn: [
      'Global Payment Network: Card switching and settlement worldwide.',
      'Cross-Border Settlement: High-margin global travel & commerce flows.',
      'Cyber & Intelligence Services (~35%+ of rev): Fraud detection, analytics & open banking.',
    ],
    investmentAvenuesHe: [
      'רכישת חברות סייבר ואנליטיקה פיננסית (כגון Recorded Future) לחיזוק שירותי הערך המוסף.',
      'התרחבות במדינות מתפתחות (אמריקה הלטינית, אפריקה ואסיה) ובתשלומי B2B.',
      'רכישה חוזרת רציפה של מניות והעלאות דיבידנד שנתיות דו-ספרתיות.',
    ],
    investmentAvenuesEn: [
      'Acquiring cybersecurity and threat-intelligence platforms (e.g. Recorded Future).',
      'Digital payment penetration across LatAm, Africa, and B2B flows.',
      'Consistent double-digit dividend growth and steady share buybacks.',
    ],
  },
  COST: {
    whatItDoesHe:
      'קוסטקו היא רשת מועדוני הצרכנים (Warehouse Clubs) המובילה בעולם, המוכרת מוצרים איכותיים במחירים סיטונאיים תמורת דמי מנוי שנתיים.',
    whatItDoesEn:
      'Costco is the premier global membership-only warehouse club, selling curated merchandise near cost while generating most of its profit from annual membership fees.',
    revenueModelHe:
      'מכירת מוצרים ברווח גולמי נמוך מאוד (~11%) כדי להבטיח את המחיר הזול ביותר, בעוד רוב הרווח הנקי נובע מדמי המנוי השנתיים עם שיעור חידוש של כ-93%.',
    revenueModelEn:
      'Selling merchandise at ultra-low markups while generating durable operating profit from recurring annual membership fees (~93% renewal rate).',
    businessSegmentsHe: [
      'סניפי מועדון בארה״ב, קנדה והעולם: מזון, אלקטרוניקה, דלק ומוצרי בית.',
      'דמי חברות (Membership Fees): עוגן הרווחיות היציב של החברה עם מעל 130 מיליון בעלי כרטיס.',
      'מותג פרטי Kirkland Signature: כ-30% מהמכירות, ברווחיות גבוהה יותר ואיכות פרימיום.',
    ],
    businessSegmentsEn: [
      'Global Warehouse Clubs: High-turnover food, electronics, and fuel.',
      'Membership Fees: Core profit driver backed by ~93% renewal rates.',
      'Kirkland Signature Private Label: ~30% of sales with superior brand loyalty.',
    ],
    investmentAvenuesHe: [
      'פתיחת 25–30 סניפים חדשים בשנה בארה״ב ובעיקר בשווקים בינלאומיים צומחים (סין, אירופה, אוסטרליה).',
      'שדרוג תשתית הלוגיסטיקה והסחר האלקטרוני (Costco Logistics) למשלוחי מוצרים גדולים.',
      'חלוקת דיבידנדים שוטפים ודיבידנדים מיוחדים (Special Dividends) ממזומנים עודפים.',
    ],
    investmentAvenuesEn: [
      'Opening 25–30 new warehouses annually across North America, Asia, and Europe.',
      'Scaling Costco Logistics and e-commerce big-ticket delivery.',
      'Returning excess cash through regular and periodic special dividends.',
    ],
  },
  PLTR: {
    whatItDoesHe:
      'פלנטיר מפתחת פלטפורמות תוכנה ובינה מלאכותית (AIP, Gotham, Foundry) המאפשרות לארגוני ביטחון, ממשלות ותאגידים לנתח כמויות מידע עצומות ולקבל החלטות מבצעיות.',
    whatItDoesEn:
      'Palantir builds mission-critical AI and data-operating platforms (AIP, Gotham, Foundry) used by defense agencies and global enterprises to run complex operations.',
    revenueModelHe:
      'חוזי תוכנה רב-שנתיים גבוהי מרווח עם ממשלות וצבאות המערב ועם תאגידים מסחריים בארה״ב המאמצים AI ארגוני (AIP).',
    revenueModelEn:
      'Multi-year enterprise and government software subscriptions driven by rapid US commercial AIP adoption.',
    businessSegmentsHe: [
      'ממשל וביטחון (Gotham): מערכות מודיעין וניהול שדה קרב עבור הפנטגון ובנות ברית ארה״ב.',
      'סקטור מסחרי (Foundry & AIP): תוכנת אונטולוגיה ו-AI לתעשייה, בריאות, לוגיסטיקה ופיננסים.',
    ],
    businessSegmentsEn: [
      'Government & Defense (Gotham): Intelligence and defense systems for the US and allies.',
      'Commercial Enterprise (Foundry & AIP): Operational AI and digital-twin ontology software.',
    ],
    investmentAvenuesHe: [
      'השקעה במו"פ בפלטפורמת הבינה המלאכותית AIP וסדנאות ה-Bootcamp לגיוס לקוחות מסחריים במהירות.',
      'שיתופי פעולה ביטחוניים ותעשייתיים עם ספקי ענן (AWS, Microsoft Azure) וחברות ביטחון.',
      'שמירה על מאזן נטול חוב עם מיליארדי דולרים במזומן להתרחבות מוצרית.',
    ],
    investmentAvenuesEn: [
      'Aggressive R&D in AIP and high-velocity enterprise Bootcamps.',
      'Deep cloud and defense ecosystem alliances (AWS, Azure, defense primes).',
      'Debt-free fortress balance sheet funding organic product expansion.',
    ],
  },
  AMD: {
    whatItDoesHe:
      'AMD מתכננת מעבדי מחשב ושרתים מובילים (EPYC, Ryzen) ומאיצי בינה מלאכותית למרכזי נתונים (סדרת Instinct MI) כמתחרה העיקרית מול אינטל ואנבידיה.',
    whatItDoesEn:
      'AMD designs high-performance CPUs (EPYC, Ryzen), adaptive computing FPGAs, and Instinct data center AI GPUs competing directly with Intel and NVIDIA.',
    revenueModelHe:
      'מכירת מעבדי שרתים ושבבי AI לחברות ענן (Hyperscalers), מעבדי PC וגיימינג לצרכנים ושבבים מוטמעים.',
    revenueModelEn:
      'High-margin EPYC server CPU and Instinct AI accelerator sales to cloud hyperscalers alongside Ryzen PC and gaming chips.',
    businessSegmentsHe: [
      'מרכזי נתונים (Data Center): מעבדי שרתים EPYC (נתח שוק עולה בהתמדה) ומאיצי AI Instinct MI300/MI350.',
      'לקוח וגיימינג (Client & Gaming): מעבדי Ryzen ושבבי קונסולות (PlayStation / Xbox).',
      'שבבים מוטמעים (Embedded / Xilinx): פתרונות לתקשורת, רכב ותעשייה.',
    ],
    businessSegmentsEn: [
      'Data Center: EPYC server processors and Instinct MI-series AI accelerators.',
      'Client & Gaming: Ryzen PC processors and semi-custom console chips.',
      'Embedded (Xilinx): Adaptive FPGAs for telecom, industrial, and auto.',
    ],
    investmentAvenuesHe: [
      'מו"פ מואץ בארכיטקטורת שבבי AI שנתית (MI325/MI355/MI400) ושיפור תוכנת הקוד הפתוח ROCm.',
      'רכישות אסטרטגיות של חברות תכנון שרתים ורשת (כגון ZT Systems ו-Xilinx) לאספקת מערכות AI שלמות.',
    ],
    investmentAvenuesEn: [
      'Accelerated annual Instinct AI GPU roadmap and open-source ROCm software.',
      'Strategic rack-scale AI acquisitions (ZT Systems, Xilinx) to offer full-stack systems.',
    ],
  },
  AVGO: {
    whatItDoesHe:
      'ברודקום היא ענקית שבבים ותוכנה ארגונית המתמחה בשבבי AI מותאמים אישית (XPUs עבור גוגל/מטא), תקשורת נתונים מהירה ותוכנות תשתית ארגוניות (VMware).',
    whatItDoesEn:
      'Broadcom is a semiconductor and infrastructure software giant supplying custom AI ASICs (XPUs), high-speed data center networking, and VMware enterprise cloud software.',
    revenueModelHe:
      'פיתוח שבבי AI ורשת בהתאמה אישית לענקיות הטק + הכנסות מנוי יציבות מאוד מתוכנות VMware וניהול שרתים.',
    revenueModelEn:
      'Custom AI silicon & Ethernet switching paired with sticky enterprise software subscriptions (VMware).',
    businessSegmentsHe: [
      'פתרונות מוליכים למחצה: שבבי AI ייעודיים (ASICs) ומתגי רשת Ethernet למהירויות גבוהות.',
      'תוכנת תשתית (VMware / CA / Symantec): וירטואליזציה של ענן פרטי ואבטחת סייבר לארגוני Fortune 500.',
    ],
    businessSegmentsEn: [
      'Semiconductor Solutions: Custom AI XPUs and high-speed Ethernet networking switches.',
      'Infrastructure Software: VMware Cloud Foundation, mainframe, and enterprise security.',
    ],
    investmentAvenuesHe: [
      'מו"פ בפרויקטי שבבי AI מותאמים אישית (Custom Silicon) ללקוחות ענק כגון גוגל, מטא ו-ByteDance.',
      'אינטגרציה והעברת לקוחות VMware למודל מנוי VCF ברווחיות תפעולית של מעל 60%.',
      'מדיניות החזר הון נדיבה: הקצאת כ-50% מתזרים המזומנים החופשי לדיבידנד צומח + הורדת חוב.',
    ],
    investmentAvenuesEn: [
      'Co-developing custom AI accelerators (XPUs) with hyperscale partners.',
      'Transitioning VMware enterprise customers to high-margin VCF subscriptions.',
      'Deleveraging and returning ~50% of free cash flow via rising dividends.',
    ],
  },
  TSM: {
    whatItDoesHe:
      'TSMC (טייוואן סמיקונדקטור) היא קבלנית ייצור השבבים המתקדמת והגדולה בעולם, המייצרת בפועל כ-90% מהשבבים המתקדמים ביותר עבור אפל, אנבידיה, AMD וקוואלקום.',
    whatItDoesEn:
      'TSMC is the world’s dominant pure-play semiconductor foundry, manufacturing ~90% of the globe’s leading-edge chips for Apple, NVIDIA, AMD, and Qualcomm.',
    revenueModelHe:
      'ייצור פרוסות סיליקון (Wafers) לפי הזמנה בליטוגרפיית 3nm / 2nm לחברות שאין להן מפעלי ייצור (Fabless), עם מרווח רווח תפעולי מעל 40%.',
    revenueModelEn:
      'Contract wafer fabrication across leading-edge 3nm/5nm/2nm nodes for fabless chip designers at >40% operating margins.',
    businessSegmentsHe: [
      'מחשוב עתיר ביצועים (HPC & AI): הייצור המרכזי של מאיצי AI ומעבדי שרתים.',
      'סמארטפונים (Mobile): מעבדי סדרת A/M של אפל ושבבי מובייל מתקדמים.',
      'אריזה מתקדמת (CoWoS): צוואר הבקבוק הקריטי להרכבת שבבי AI וזיכרונות HBM.',
    ],
    businessSegmentsEn: [
      'HPC & AI Silicon: Leading-edge AI GPU and server CPU manufacturing.',
      'Smartphone SoCs: Apple A/M-series and flagship mobile processors.',
      'Advanced Packaging (CoWoS): Critical 3D/HBM packaging for AI accelerators.',
    ],
    investmentAvenuesHe: [
      'השקעות הון (CapEx) של 30–38 מיליארד דולר בשנה בהקמת מפעלי 2nm בטייוואן והתרחבות גלובלית באריזונה (ארה״ב), יפן וגרמניה.',
      'הכפלת קיבולת האריזה המתקדמת CoWoS לעמידה בביקוש ל-AI.',
    ],
    investmentAvenuesEn: [
      '$30B–$38B annual CapEx funding 2nm fabs in Taiwan plus new fabs in Arizona, Japan, and Germany.',
      'Aggressive expansion of CoWoS advanced AI chip packaging capacity.',
    ],
  },
  ASML: {
    whatItDoesHe:
      'ASML ההולנדית מחזיקה במונופול עולמי של 100% על מכונות הליתוגרפיה האולטרה-סגולות (EUV), שבלעדיהן בלתי אפשרי לייצר שבבים מתקדמים של 3nm ו-2nm.',
    whatItDoesEn:
      'ASML holds a 100% global monopoly on Extreme Ultraviolet (EUV) lithography systems essential for manufacturing the world’s most advanced semiconductors.',
    revenueModelHe:
      'מכירת מכונות ליתוגרפיה במחיר של 200–380 מיליון דולר ליחידה ליצרניות כמו TSMC, סמסונג ואינטל + חוזי שירות ותחזוקה שוטפים.',
    revenueModelEn:
      'Selling $200M–$380M EUV lithography machines to TSMC, Intel, and Samsung plus recurring installed-base servicing.',
    businessSegmentsHe: [
      'מערכות EUV ו-High-NA EUV: הציוד הבלעדי בעולם להדפסת שבבים מתקדמים ו-AI.',
      'מערכות DUV וניהול בסיס מותקן: מכונות לשבבים בוגרים ושירותי תחזוקה ושדרוגים.',
    ],
    businessSegmentsEn: [
      'EUV & High-NA EUV Lithography: Exclusive equipment for leading-edge AI & logic chips.',
      'DUV & Installed Base Management: Mature-node lithography and recurring maintenance.',
    ],
    investmentAvenuesHe: [
      'השקעת עתק במו"פ של הדור הבא High-NA EUV לייצור שבבים מתחת ל-2 ננומטר.',
      'הרחבת כושר הייצור בהולנד ורכישות חוזרות של מניות ודיבידנד.',
    ],
    investmentAvenuesEn: [
      'Heavy R&D advancing High-NA EUV lithography below 2nm.',
      'Expanding European assembly capacity alongside dividends and buybacks.',
    ],
  },
  SOFI: {
    whatItDoesHe:
      'סופיי (SoFi Technologies) היא בנק דיגיטלי מלא (Neobank) וחברת פינטק אמריקאית המספקת הלוואות, חשבונות עו"ש, כרטיסי אשראי והשקעות באפליקציה אחת, לצד פלטפורמת תשתית בנקאית (Galileo/Technisys).',
    whatItDoesEn:
      'SoFi is a full-service US digital bank and fintech platform offering checking/savings, loans, and investing in one app, plus B2B banking infrastructure (Galileo/Technisys).',
    revenueModelHe:
      'הכנסות ריבית נטו מפיקדונות והלוואות אישיות/סטודנטים/משכנתאות + עמלות פלטפורמה פיננסית וחוזי B2B לבנקים דיגיטליים אחרים.',
    revenueModelEn:
      'Net interest income from consumer lending funded by low-cost member deposits, plus fee-based financial services and B2B tech platform contracts.',
    businessSegmentsHe: [
      'שירותי הלוואות (Lending): הלוואות אישיות, מחזור הלוואות סטודנטים ומשכנתאות.',
      'שירותים פיננסיים (SoFi Money / Invest): חשבונות ריבית גבוהה, מניות, כרטיסי אשראי.',
      'פלטפורמה טכנולוגית (Galileo & Technisys): תשתית סליקה וליבה בנקאית עבור פינטקים בארה״ב ואמריקה הלטינית.',
    ],
    businessSegmentsEn: [
      'Lending: Personal loans, student loan refinancing, and home mortgages.',
      'Financial Services: SoFi Money checking/savings, Invest brokerage & credit cards.',
      'Tech Platform (Galileo & Technisys): Core banking and card-issuing APIs for B2B clients.',
    ],
    investmentAvenuesHe: [
      'הרחבת בסיס המשתמשים והפיקדונות (מעל 20B$ בפיקדונות) להוזלת עלות ההון לעומת הלוואות קמעונאיות.',
      'מעבר להכנסות עמלות קלות-הון (Loan Platform Business) לחתימת הלוואות עבור גופים מוסדיים.',
      'הטמעת Galileo ו-Technisys בבנקים מסורתיים גדולים להגדלת הכנסות B2B חוזרות.',
    ],
    investmentAvenuesEn: [
      'Growing low-cost member deposits to lower funding costs.',
      'Scaling capital-light Loan Platform origination fees for institutional partners.',
      'Selling Galileo/Technisys banking infrastructure to legacy banks.',
    ],
  },
  'BRK.B': {
    whatItDoesHe:
      'ברקשייר האת׳וויי (בהובלת וורן באפט וגרג אייבל) היא קונגלומרט השקעות ותפעול אדיר המחזיק בבעלות מלאה בחברות ביטוח (GEICO), רכבות (BNSF), אנרגיה וכן תיק מניות ענק (אפל, אמריקן אקספרס, קוקה-קולה).',
    whatItDoesEn:
      'Berkshire Hathaway is a premier diversified conglomerate owning wholly owned insurance (GEICO), freight rail (BNSF), energy utilities, and a massive public equity portfolio.',
    revenueModelHe:
      'רווחי חיתום מביטוח (שימוש ב-"Float" בעלות אפס להשקעות), הכנסות תפעול מתעשייה, רכבות ואנרגיה, ודיבידנדים ורווחי הון מתיק המניות.',
    revenueModelEn:
      'Insurance underwriting profits and zero-cost float deployment, wholly owned rail/utility/industrial earnings, and public equity dividends.',
    businessSegmentsHe: [
      'ביטוח וביטוח משנה: GEICO, Berkshire Hathaway Reinsurance — מייצר הון פנוי להשקעה.',
      'רכבות ואנרגיה: BNSF Railway ו-Berkshire Hathaway Energy.',
      'תעשייה, קמעונאות ושירותים + תיק מניות סחיר והון נזיל של מעל 300B$ באג"ח ארה״ב.',
    ],
    businessSegmentsEn: [
      'Insurance & Reinsurance (GEICO): Generates immense zero-cost investable float.',
      'Railroad & Utilities: BNSF freight rail and Berkshire Hathaway Energy.',
      'Manufacturing/Retail & Equity Portfolio + $300B+ Treasury liquidity.',
    ],
    investmentAvenuesHe: [
      'רכישת חברות פרטיות שלמות במחירים אטרקטיביים בעת הזדמנויות שוק.',
      'השקעות הון בתשתיות אנרגיה מתחדשת, רשתות חשמל ומסילות רכבת (BNSF).',
      'אחזקת רזרבת מזומנים ואג"ח ממשלתי קצר של מעל $300B כהגנה וכוח קנייה במשברים + רכישה עצמית אופורטוניסטית.',
    ],
    investmentAvenuesEn: [
      'Whole-company acquisitions of durable cash-generative businesses during downturns.',
      'CapEx in regulated energy grids, renewables, and BNSF rail.',
      '$300B+ Treasury cash fortress & opportunistic share buybacks.',
    ],
  },
  JPM: {
    whatItDoesHe:
      'ג׳יי.פי מורגן צ׳ייס הוא הבנק הגדול והרווחי ביותר בארה״ב, המספק בנקאות פרטית, מסחרית, בנקאות השקעות, מסחר בשווקי הון וניהול נכסים גלובלי.',
    whatItDoesEn:
      'JPMorgan Chase is the largest and most profitable US bank, spanning consumer banking, commercial banking, investment banking, markets trading, and asset management.',
    revenueModelHe:
      'הכנסות ריבית נטו מפערי פיקדונות והלוואות + עמלות מבנקאות השקעות, חיתום, סליקת כרטיסים וניהול נכסים של טריליוני דולרים.',
    revenueModelEn:
      'Net interest income on deposits/loans alongside fee revenue from investment banking, credit cards, payments, and asset/wealth management.',
    businessSegmentsHe: [
      'בנקאות צרכנית וקהילתית (Chase): מיליוני חשבונות עו"ש, כרטיסי אשראי ומשכנתאות.',
      'בנקאות השקעות ומסחר (CIB): ייעוץ מיזוגים, הנפקות ומסחר במניות ואג"ח.',
      'ניהול נכסים ועושר (AWM): ניהול מעל 3.5 טריליון דולר למוסדיים ולעשירים.',
    ],
    businessSegmentsEn: [
      'Consumer & Community Banking (Chase): Checking, credit cards, and auto/home loans.',
      'Corporate & Investment Bank: M&A advisory, underwriting, and institutional trading.',
      'Asset & Wealth Management: $3.5T+ in assets under management.',
    ],
    investmentAvenuesHe: [
      'השקעה שנתית של מעל 17 מיליארד דולר בטכנולוגיה, סייבר ו-AI לייעול תפעולי ושיפור חוויית לקוח.',
      'הגדלת נתח שוק בבנקאות השקעות והרחבת סניפים בערים מרכזיות בארה״ב.',
      'רכישה חוזרת של מניות וחלוקת דיבידנד קבוע תוך שמירה על הלימות הון מובילה.',
    ],
    investmentAvenuesEn: [
      '$17B+ annual technology, cybersecurity, and AI investment.',
      'Branch expansion and market-share gains in commercial/investment banking.',
      'Consistent dividend payouts and share repurchases backed by fortress CET1 capital.',
    ],
  },
  ISRG: {
    whatItDoesHe:
      'אינטואיטיב סרג׳יקל מפתחת ומייצרת את מערכות הרובוטיקה הרפואית המובילות בעולם (רובוטי הניתוח da Vinci ו-Ion) לניתוחים זעיר-פולשניים.',
    whatItDoesEn:
      'Intuitive Surgical pioneers robotic-assisted minimally invasive surgery via its installed base of da Vinci surgical systems and Ion bronchoscopy platforms.',
    revenueModelHe:
      'מודל "סכין גילוח ולהבים": מכירת הרובוט לבתי חולים ולאחריה הכנסה חוזרת גבוהה ממכירת כלים כירורגיים חד-פעמיים וחוזי שירות אחרי כל ניתוח.',
    revenueModelEn:
      'Razor-and-blades model: capital placement of da Vinci systems followed by ~80%+ recurring revenue from single-use instruments and service.',
    businessSegmentsHe: [
      'מערכות רובוטיות (da Vinci 5 / Ion): כ-9,500+ מערכות מותקנות בבתי חולים בעולם.',
      'כלים ואביזרים כירורגיים מתכלים: המנוע החוזר המייצר מעל 80% מההכנסות השוטפות.',
    ],
    businessSegmentsEn: [
      'da Vinci 5 & Ion Systems: 9,500+ installed robotic platforms globally.',
      'Instruments, Accessories & Service: High-margin recurring revenue per procedure.',
    ],
    investmentAvenuesHe: [
      'פריסת הדור החדש da Vinci 5 הכולל משוב כוח (Force Feedback) ועוצמת מחשוב AI פי 10,000.',
      'הרחבת סוגי הניתוחים (ביופסיות ריאה ב-Ion, גסטרו, לב-חזה) וכניסה לבתי חולים באסיה ואירופה.',
    ],
    investmentAvenuesEn: [
      'Rolling out next-generation da Vinci 5 with force-feedback and AI computing.',
      'Expanding procedure indications (Ion lung biopsy, thoracic) and global hospital penetration.',
    ],
  },
  SPGI: {
    whatItDoesHe:
      'S&P גלובל היא ענקית הדירוגים הפיננסיים והדאטה העומדת מאחורי מדד ה-S&P 500 ודירוגי האשראי המוסדיים (S&P Ratings), והדאטה הכלכלית (Capital IQ / Platts).',
    whatItDoesEn:
      'S&P Global is the financial intelligence powerhouse behind S&P 500 benchmarks, global sovereign/corporate credit ratings, S&P Capital IQ, and commodity pricing.',
    revenueModelHe:
      'עמלות חובה על כל הנפקת אג"ח עולמית הזקוקה לדירוג, מנויי דאטה וטרמינלים למוסדות פיננסיים ותמלוגים מתעודות סל (ETF) העוקבות אחר מדדי S&P.',
    revenueModelEn:
      'Tollbooth fees on global debt issuance ratings, recurring institutional data/analytics subscriptions, and index ETF licensing.',
    businessSegmentsHe: [
      'דירוגי אשראי (Ratings): מונופול דואופולי בדירוג חוב תאגידי וממשלתי.',
      'מודיעין שוק (Market Intelligence) ו-Platts: דאטה פיננסית (Capital IQ) ואינדקסים לסחורות ואנרגיה.',
      'מדדים (S&P Dow Jones Indices): תמלוגים ממנהלי קרנות הסל הגדולים בעולם.',
    ],
    businessSegmentsEn: [
      'S&P Global Ratings: Essential credit ratings on corporate and sovereign bonds.',
      'Market Intelligence & Commodity Insights (Platts): Institutional financial & energy data.',
      'S&P Dow Jones Indices: Recurring licensing royalties on trillions in indexed ETFs.',
    ],
    investmentAvenuesHe: [
      'הטמעת בינה מלאכותית (Kensho AI) בפלטפורמת Capital IQ לניתוח מהיר של דוחות ומחקר.',
      'השקעה במדדי השקעות אלטרנטיביות, אשראי פרטי וקיימות (ESG) + החזרת מעל 85% מהתזרים לבעלי מניות.',
    ],
    investmentAvenuesEn: [
      'Integrating Kensho generative AI across Capital IQ and research workflows.',
      'Expanding private markets/credit benchmarks while returning 85%+ of FCF to shareholders.',
    ],
  },
  NFLX: {
    whatItDoesHe:
      'נטפליקס היא פלטפורמת הסטרימינג המובילה בעולם עם מעל 280 מיליון משקי בית משלמים הנהנים מסדרות, סרטים, ספורט חי ומשחקים.',
    whatItDoesEn:
      'Netflix is the leading global subscription streaming entertainment service reaching 280M+ paid memberships with original series, films, live events, and games.',
    revenueModelHe:
      'מנויי צפייה חודשיים קבועים ברמות מחיר שונות + חבילה מוזלת משולבת פרסומות הצומחת במהירות.',
    revenueModelEn:
      'Recurring monthly streaming subscription tiers alongside a rapidly scaling ad-supported membership tier.',
    businessSegmentsHe: [
      'סטרימינג גלובלי בתשלום: הכנסה חוזרת יציבה בצפון אמריקה, אירופה, אסיה ואמריקה הלטינית.',
      'חטיבת פרסום ושידורים חיים: פרסומות ב-Ad Tier ושידורי ספורט/בידור חיים (WWE, NFL).',
    ],
    businessSegmentsEn: [
      'Global Paid Streaming: Subscription memberships across all major regions.',
      'Advertising & Live Events: Fast-growing ad tier and live sports/entertainment broadcasts.',
    ],
    investmentAvenuesHe: [
      'השקעה של ~17 מיליארד דולר בשנה בהפקת תוכן מקורי לוקאלי וגלובלי ושידורים חיים.',
      'בניית תשתית טכנולוגיית פרסום עצמאית ומינוף עודפי התזרים לרכישה עצמית של מניות.',
    ],
    investmentAvenuesEn: [
      '~$17B annual content budget across original series, local hits, and live sports.',
      'Building in-house ad-tech capabilities and deploying excess FCF into buybacks.',
    ],
  },
  UBER: {
    whatItDoesHe:
      'אובר מפעילה את אפליקציית ההיסעים, משלוחי האוכל (Uber Eats) והמטענים הלוגיסטיים הגדולה בעולם ביותר מ-70 מדינות.',
    whatItDoesEn:
      'Uber operates the largest global ride-hailing mobility, food/grocery delivery (Uber Eats), and freight marketplace across 70+ countries.',
    revenueModelHe:
      'עמלת תיווך (Take Rate) מכל נסיעה ומשלוח, מנויי Uber One, ועסקי פרסום דיגיטלי צומחים מאוד בתוך האפליקציה.',
    revenueModelEn:
      'Platform marketplace take-rates on rides and deliveries, Uber One memberships, and high-margin in-app advertising.',
    businessSegmentsHe: [
      'ניידות (Mobility): הזמנת נסיעות ומוניות — מרכז רווחיות תפעולית חזקה.',
      'משלוחים (Uber Eats): משלוחי מסעדות, סופרמרקטים וחנויות קמעונאות.',
      'פרסום והובלה (Ads & Freight): מודעות ממומנות למסעדות ומותגים בתוך האפליקציה.',
    ],
    businessSegmentsEn: [
      'Mobility: Global ride-hailing marketplace generating strong cash flow.',
      'Delivery (Uber Eats): Restaurant, grocery, and retail delivery.',
      'Advertising & Freight: High-margin sponsored listings and digital freight brokerage.',
    ],
    investmentAvenuesHe: [
      'שותפויות אסטרטגיות עם חברות רכב אוטונומי (Waymo ואחרות) כדי להפוך לפלטפורמת ההזמנה של מוניות אוטונומיות.',
      'הרחבת מנויי Uber One ומוצרי פרסום באפליקציה + תוכנית ראשונה לרכישות חוזרות.',
    ],
    investmentAvenuesEn: [
      'Autonomous vehicle partnerships (Waymo etc.) positioning Uber as the demand aggregator.',
      'Scaling Uber One cross-platform subscriptions, ads, and share repurchases.',
    ],
  },
  CRM: {
    whatItDoesHe:
      'סיילספורס היא ספקית תוכנת ניהול קשרי הלקוחות (CRM) המובילה בעולם, המסייעת לעסקים לנהל מכירות, שירות לקוחות, שיווק ואוטומציית AI (Agentforce).',
    whatItDoesEn:
      'Salesforce is the global #1 enterprise CRM cloud software leader empowering sales, service, marketing, Slack collaboration, and autonomous Agentforce AI workflows.',
    revenueModelHe:
      'מנויי SaaS שנתיים קבועים לפי משתמש ונפח נתונים (Data Cloud / AI Agents).',
    revenueModelEn:
      'Sticky annual enterprise SaaS subscriptions alongside Data Cloud and AI agent usage pricing.',
    businessSegmentsHe: [
      'Sales & Service Cloud: ניהול לקוחות ומערכי שירות.',
      'Data Cloud & Agentforce AI: איחוד נתוני לקוחות ובניית סוכני AI אוטונומיים.',
      'Slack, Tableau & MuleSoft: תקשורת ארגונית, אנליטיקה ואינטגרציית API.',
    ],
    businessSegmentsEn: [
      'Sales & Service Cloud: Flagship enterprise CRM workflows.',
      'Data Cloud & Agentforce: Unified enterprise data layer and autonomous AI agents.',
      'Slack, Tableau & MuleSoft: Collaboration, BI analytics, and data integration.',
    ],
    investmentAvenuesHe: [
      'דחיפת פלטפורמת סוכני ה-AI האוטונומיים (Agentforce) ו-Data Cloud כמנועי צמיחה מרכזיים.',
      'מיקוד גבוה בהרחבת שולי הרווח התפעולי והחזר הון דרך רכישות חוזרות ודיבידנד.',
    ],
    investmentAvenuesEn: [
      'Deploying Agentforce autonomous AI agents and Data Cloud across enterprise accounts.',
      'Sustained operating-margin discipline alongside share buybacks and dividends.',
    ],
  },
  NOW: {
    whatItDoesHe:
      'ServiceNow מספקת את פלטפורמת הענן המובילה לאוטומציה של תהליכי IT, שירות עובדים וארגונים עבור רוב חברות ה-Fortune 500.',
    whatItDoesEn:
      'ServiceNow provides the premier enterprise workflow automation platform streamlining IT, employee service, and AI operations across Fortune 500 enterprises.',
    revenueModelHe:
      'חוזי SaaS ארוכי טווח עם שיעור שימור לקוחות של ~98%, בתוספת חבילות Pro Plus של בינה מלאכותית ארגונית.',
    revenueModelEn:
      'Multi-year enterprise workflow subscriptions with ~98% renewal rates and AI Pro Plus tier upgrades.',
    businessSegmentsHe: [
      'אוטומציית IT וניהול ארגוני (ITSM / ITOM): הליבה של תפעול מערכות המידע בחברות ענק.',
      'שירות לקוחות ומשאבי אנוש (CRM & HR Workflows) + סוכני Now Assist AI.',
    ],
    businessSegmentsEn: [
      'IT Service & Operations Management: Digital backbone for enterprise IT.',
      'Customer, HR & Creator Workflows powered by Now Assist generative AI.',
    ],
    investmentAvenuesHe: [
      'פיתוח ושדרוג לקוחות לחבילות AI בתשלום גבוה יותר (Now Assist).',
      'חדירה לסקטורים חדשים כמו ניהול שרשראות אספקה, פיננסים וממשלות.',
    ],
    investmentAvenuesEn: [
      'Expanding generative AI monetization via Now Assist Pro Plus tiers.',
      'Cross-departmental expansion into finance, supply chain, and public sector.',
    ],
  },
  ORCL: {
    whatItDoesHe:
      'אורקל היא ענקית בסיסי הנתונים והתוכנות הארגוניות, שהפכה בשנים האחרונות לספקית תשתיות ענן (OCI) מבוקשת במיוחד להרצת ואימון מודלי בינה מלאכותית.',
    whatItDoesEn:
      'Oracle is the enterprise database and ERP leader rapidly scaling Oracle Cloud Infrastructure (OCI) as a favored high-performance platform for AI training and inference.',
    revenueModelHe:
      'חוזי ענן OCI רב-שנתיים של מיליארדי דולרים, רישוי ותחזוקת בסיסי נתונים Oracle ותוכנות ERP/בריאות (Cerner).',
    revenueModelEn:
      'Multi-billion OCI cloud infrastructure commitments, database licensing/support, and Fusion ERP / Oracle Health SaaS.',
    businessSegmentsHe: [
      'Oracle Cloud Infrastructure (OCI): צמיחה מהירה מאוד בתשתיות GPU לאימון AI (לקוחות כמו OpenAI, xAI, Nvidia).',
      'תוכנות ענן ובסיסי נתונים (Fusion ERP, NetSuite, Oracle Database).',
      'Oracle Health (Cerner): מערכות מידע לבתי חולים.',
    ],
    businessSegmentsEn: [
      'Oracle Cloud Infrastructure (OCI): Rapidly growing AI data-center & GPU capacity.',
      'Cloud Applications & Database: Fusion ERP, NetSuite, and Autonomous Database.',
      'Oracle Health: Electronic health records and clinical systems.',
    ],
    investmentAvenuesHe: [
      'השקעת עתק בבניית חוות שרתים ומרכזי נתונים של מעל 100 מגה-וואט וג׳יגה-וואט עבור לקוחות AI.',
      'חיבור בסיסי הנתונים של אורקל ישירות בתוך AWS, Azure ו-Google Cloud (Multi-Cloud).',
    ],
    investmentAvenuesEn: [
      'Massive CapEx building gigawatt-scale AI data centers worldwide.',
      'Multi-cloud database partnerships embedding Oracle directly inside AWS, Azure, and GCP.',
    ],
  },
  COIN: {
    whatItDoesHe:
      'קוינבייס היא בורסת הקריפטו הציבורית הגדולה והמפוקחת בארה״ב, המספקת מסחר, משמורת מוסדית (Custody) למרבית קרנות הסל של הביטקוין, ותשתית בלוקצ׳יין (Base).',
    whatItDoesEn:
      'Coinbase is the leading regulated US crypto exchange and institutional custodian powering most spot Bitcoin/Ethereum ETFs and operating the Base Layer-2 network.',
    revenueModelHe:
      'עמלות מסחר מקמעונאיים ומוסדיים + הכנסות ריבית מ-USDC, עמלות Staking ושמירת נכסים מוסדית.',
    revenueModelEn:
      'Retail & institutional trading fees alongside recurring subscription/service revenue from USDC interest, custody, and staking.',
    businessSegmentsHe: [
      'מסחר בקריפטו: פלטפורמת המסחר לצרכנים ומוסדיים.',
      'מנויים ושירותים (USDC, Custody, Staking): הכנסות יציבות יותר התלויות פחות במחזורי המסחר.',
      'רשת הבלוקצ׳יין Base: פלטפורמה זולה ומהירה לאפליקציות ותשלומי קריפטו.',
    ],
    businessSegmentsEn: [
      'Consumer & Institutional Crypto Trading.',
      'Subscriptions & Services: USDC stablecoin revenue share, ETF custody, and staking.',
      'Base L2 Network: High-growth on-chain developer & payments ecosystem.',
    ],
    investmentAvenuesHe: [
      'הרחבת נתח השוק במשמורת נכסים מוסדית, מסחר בנגזרים והסכמים גלובליים עם קרנות סל.',
      'הטמעת תשלומי מטבע יציב (USDC) ומסחר בינלאומי מחוץ לארה״ב.',
    ],
    investmentAvenuesEn: [
      'Expanding institutional ETF custody, crypto derivatives, and international exchanges.',
      'Scaling USDC stablecoin global payments and Base L2 adoption.',
    ],
  },
  NVO: {
    whatItDoesHe:
      'נובו נורדיסק הדנית היא מחלוצות ומובילות השוק העולמי בטיפול בסוכרת והשמנה, המייצרת את התרופות הפופולריות Ozempic ו-Wegovy.',
    whatItDoesEn:
      'Novo Nordisk is the Danish pharmaceutical pioneer leading global diabetes and obesity treatments with blockbuster GLP-1 drugs Ozempic and Wegovy.',
    revenueModelHe:
      'מכירות תרופות פטנט לטיפול בהשמנה, סוכרת ומחלות כרוניות נדירות ברחבי העולם.',
    revenueModelEn:
      'Global sales of patented GLP-1 obesity and diabetes biologics with exceptional operating margins.',
    businessSegmentsHe: [
      'טיפולי השמנה (Wegovy) וסוכרת (Ozempic / Rybelsus): מרכז הכנסות הצמיחה העולמי.',
      'מחלות נדירות והמופיליה: טיפולים ביולוגיים משלימים.',
    ],
    businessSegmentsEn: [
      'Obesity & Diabetes Care: Wegovy, Ozempic, and oral Rybelsus.',
      'Rare Diseases: Hemophilia and endocrine therapies.',
    ],
    investmentAvenuesHe: [
      'הרחבת קווי ייצור ומפעלים (כולל רכישת מפעלי Catalent) להגדלת היצע המזרקים הגלובלי.',
      'מו"פ בדור הבא של תרופות לירידה במשקל (CagriSema, Amycretin בבליעה).',
    ],
    investmentAvenuesEn: [
      'Multi-billion manufacturing expansion (including Catalent sites) to meet global GLP-1 demand.',
      'Clinical R&D pipeline across CagriSema and oral weight-loss candidates.',
    ],
  },
  MNST: {
    whatItDoesHe:
      'מונסטר בוורג׳ היא מהמובילות העולמיות בשוק משקאות האנרגיה הצומח, עם מותגים מובילים והפצה עולמית דרך רשת הקירור של קוקה-קולה.',
    whatItDoesEn:
      'Monster Beverage is a global energy drink powerhouse scaling Monster Energy, Reign, and Bang via The Coca-Cola Company’s worldwide distribution network.',
    revenueModelHe:
      'מודל שיווקי קל-נכסים: פיתוח תמציות ומותגים מובילים תוך הוצאת הייצור והלוגיסטיקה לקבלנים ולשותפת ההפצה קוקה-קולה.',
    revenueModelEn:
      'Asset-light brand and concentrate model leveraging outsourced bottling and Coca-Cola’s global distribution.',
    businessSegmentsHe: [
      'Monster Energy Drinks: מותג הדגל (כולל סדרות Ultra ללא סוכר).',
      'מותגים אסטרטגיים ופיטנס (Reign, Bang, Predator): צמיחה חזקה בשווקים מתפתחים.',
    ],
    businessSegmentsEn: [
      'Monster Energy Drinks: Flagship lines including Ultra zero-sugar.',
      'Strategic Brands & Fitness: Reign, Bang, and affordable Predator lines abroad.',
    ],
    investmentAvenuesHe: [
      'חדירה אגרסיבית לשווקים בינלאומיים (אסיה, אמריקה הלטינית ואירופה) עם המותגים המוזלים Predator ו-Fury.',
      'השקת מוצרים נטולי סוכר ואלכוהול קל ורכישות חוזרות משמעותיות של מניות.',
    ],
    investmentAvenuesEn: [
      'International expansion into LatAm, Asia, and EMEA via Predator/Fury brands.',
      'Zero-sugar innovation and large-scale share buybacks.',
    ],
  },
  NVMI: {
    whatItDoesHe:
      'נובה הישראלית (נסחרת בנאסד״ק ובת״א) מפתחת מערכות מדידה ומטרולוגיה קריטיות לבקרת איכות בתוך מפעלי ייצור השבבים המתקדמים ביותר בעולם (TSMC, סמסונג, אינטל).',
    whatItDoesEn:
      'Nova Ltd. develops critical optical, X-ray, and chemical metrology systems ensuring nanoscale precision inside the world’s leading semiconductor fabs.',
    revenueModelHe:
      'מכירת מכונות מדידה מתקדמות ליצרניות שבבים בעת הקמת קווי ייצור AI וזיכרון HBM חדשים + שירות ותוכנה שוטפים.',
    revenueModelEn:
      'High-precision process control equipment sales for advanced logic, Gate-All-Around, and HBM memory fabs plus recurring service.',
    businessSegmentsHe: [
      'מטרולוגיה אופטית וקרני רנטגן (OCD / XPS): בדיקת עובי ומבנה שכבות שבב ברמת האטום.',
      'תוכנות אלגוריתמיקה ו-AI לניתוח נתוני ייצור ומדידות כימיות.',
    ],
    businessSegmentsEn: [
      'Dimensional & Materials Metrology: Optical and X-ray tools for GAA and HBM chips.',
      'AI Process-Control Software & Chemical Metrology.',
    ],
    investmentAvenuesHe: [
      'מו"פ מוגבר לדור הבא של טרנזיסטורי Gate-All-Around (GAA) ואריזות שבבים תלת-ממדיות.',
      'רכישות אסטרטגיות משלימות של חברות מדידה ובקרה אירופאיות ואמריקאיות.',
    ],
    investmentAvenuesEn: [
      'R&D targeting Gate-All-Around (GAA) and 3D advanced AI chip packaging.',
      'Tuck-in acquisitions of specialized European and US metrology technologies.',
    ],
  },
  INTC: {
    whatItDoesHe:
      'אינטל מפתחת ומייצרת מעבדים למחשבים אישיים ושרתים (x86) ופועלת להקמת חטיבת ייצור שבבים עצמאית (Intel Foundry) עבור לקוחות חיצוניים במערב.',
    whatItDoesEn:
      'Intel designs PC and server processors while investing heavily to establish Intel Foundry as a leading-edge Western contract semiconductor manufacturer.',
    revenueModelHe:
      'מכירת מעבדי Core ל-PC ומעבדי Xeon לשרתים + תוכנית חוזי ייצור שבבים (18A) ומימון ממשלתי (CHIPS Act).',
    revenueModelEn:
      'Client and Data Center x86 processor sales alongside an emerging external foundry manufacturing model.',
    businessSegmentsHe: [
      'מחשוב לקוח (CCG): מעבדי לפטופים ומחשבים נייחים.',
      'מרכזי נתונים ו-AI (DCAI): מעבדי שרתים Xeon ומאיצים.',
      'Intel Foundry & Mobileye: מפעלי ייצור שבבים וטכנולוגיית נהיגה מתקדמת.',
    ],
    businessSegmentsEn: [
      'Client Computing (CCG): Core PC processors.',
      'Data Center & AI: Xeon server CPUs.',
      'Intel Foundry & Mobileye: Semiconductor fabrication and autonomous vision.',
    ],
    investmentAvenuesHe: [
      'השקעת עתק בהשלמת תהליך הייצור 18A והפעלת מפעלים בארה״ב ובאירופה בתמיכת מענקי CHIPS Act.',
      'התייעלות עמוקה, קיצוץ הוצאות וגיוס לקוחות ייצור חיצוניים למפעלי החברה.',
    ],
    investmentAvenuesEn: [
      'Multi-billion CapEx completing the 18A process node and US/EU fab expansions.',
      'Cost restructuring and winning external foundry customers.',
    ],
  },
  PYPL: {
    whatItDoesHe:
      'פייפאל מפעילה את אחת מארנקי התשלום הדיגיטליים המוכרים בעולם (PayPal, Venmo, Braintree), ומעבדת סליקה עבור מיליוני עסקים וצרכנים.',
    whatItDoesEn:
      'PayPal operates one of the world’s largest two-sided digital payment networks across PayPal Checkout, Venmo, and Braintree enterprise processing.',
    revenueModelHe:
      'עמלות סליקה והמרת מט"ח מעסקאות אונליין, שירותי סליקה מותאמים לתאגידים (Braintree) ותשלומים באפליקציית Venmo.',
    revenueModelEn:
      'Merchant and cross-border take rates on branded checkout, Braintree unbranded processing, and Venmo monetization.',
    businessSegmentsHe: [
      'Branded Checkout & Fastlane: כפתור התשלום המהיר של פייפאל במובייל ובווב.',
      'Venmo: אפליקציית התשלומים החברתית המובילה בארה״ב.',
      'Braintree: תשתית סליקה למפתחים וארגונים גדולים.',
    ],
    businessSegmentsEn: [
      'PayPal Branded Checkout & Fastlane guest checkout.',
      'Venmo peer-to-peer & merchant payments.',
      'Braintree enterprise payment processing.',
    ],
    investmentAvenuesHe: [
      'שדרוג חוויית התשלום בלחיצה אחת (Fastlane) והוספת הצעות קניות מותאמות AI.',
      'מיקוד בשיפור רווחיות Braintree ושימוש מאסיבי בתזרים המזומנים לרכישה עצמית של מניות.',
    ],
    investmentAvenuesEn: [
      'Rolling out Fastlane one-click checkout and AI-driven personalized offers.',
      'Focusing on profitable Braintree pricing and deploying nearly 100% of FCF into share buybacks.',
    ],
  },
  BLK: {
    whatItDoesHe:
      'בלאקרוק היא מנהלת הנכסים הגדולה בתבל (מעל 11 טריליון דולר בניהול), המפעילה את ענקית קרנות הסל iShares ואת פלטפורמת ניהול הסיכונים המוסדית Aladdin.',
    whatItDoesEn:
      'BlackRock is the world’s largest asset manager ($11T+ AUM), powering the iShares ETF franchise and the institutional Aladdin risk-analytics platform.',
    revenueModelHe:
      'דמי ניהול שנתיים מאסיביים על נכסים מנוהלים (קרנות סל, אג"ח, השקעות פרטיות) + דמי מנוי לתוכנת Aladdin.',
    revenueModelEn:
      'Recurring management/advisory fees on $11T+ AUM alongside Aladdin risk software subscriptions.',
    businessSegmentsHe: [
      'iShares ETFs: מותג תעודות הסל הגדול בעולם (מניות, אג"ח וקריפטו IBIT).',
      'שווקים פרטיים ותשתיות (GIP / HPS): תשתיות אנרגיה, נתונים ואשראי פרטי.',
      'Aladdin Tech Services: פלטפורמת הניהול והסיכונים של הבנקים והפנסיות בעולם.',
    ],
    businessSegmentsEn: [
      'iShares ETFs: Global #1 ETF platform including fixed income and spot crypto.',
      'Private Markets & Infrastructure (GIP): Energy, data center, and private credit funds.',
      'Aladdin Technology: Enterprise portfolio and risk software.',
    ],
    investmentAvenuesHe: [
      'רכישות ענק בתחום התשתיות והאשראי הפרטי (GIP ב-12.5B$, Preqin, HPS) להפיכתה למעצמת שווקים פרטיים.',
      'הרחבת קרנות הסל של ביטקוין/קריפטו ושירותי טכנולוגיית Aladdin.',
    ],
    investmentAvenuesEn: [
      'Transformational acquisitions in private infrastructure and private credit (GIP, Preqin, HPS).',
      'Scaling Aladdin technology and digital asset ETFs.',
    ],
  },
};

export function getInstantCompanyProfile(stock: ResearchStock): CompanyProfileInfo {
  const ticker = stock.ticker.toUpperCase().trim();
  const normalized = ticker.replace('-', '.');

  if (stock.companyProfile?.whatItDoesHe) {
    return stock.companyProfile;
  }

  const curated =
    CURATED_COMPANY_PROFILES[ticker] ||
    CURATED_COMPANY_PROFILES[normalized];
  if (curated) {
    return curated;
  }

  // Intelligent contextual fallback grounded in stock sector/industry/moat/growth drivers
  const sectorLabel = stock.sector || 'הסקטור העסקי';
  const industryLabel = stock.industry || 'שירותים ומוצרים מוסדיים';
  const drivers = (stock.fiveYearGrowthDrivers || stock.growth?.fiveYearCatalysts || []).slice(0, 3);

  return {
    whatItDoesHe: `${stock.companyName} (${ticker}) פועלת בענף ${industryLabel} תחת סקטור ${sectorLabel}. ${
      stock.investmentThesisSummary ||
      stock.moat?.whyExists ||
      'החברה מספקת מוצרים ושירותים מובילים ללקוחות ארגוניים ופרטיים תוך שמירה על יתרון תחרותי.'
    }`,
    whatItDoesEn: `${stock.companyName} (${ticker}) operates in ${industryLabel} within the ${sectorLabel} sector. ${
      stock.moat?.whyExists || stock.investmentThesisSummary || ''
    }`,
    revenueModelHe: `יצירת הכנסות ותזרים מזומנים מפעילות ליבה בענף ${industryLabel}, עם יחס המרת מזומנים של ${
      stock.financialQuality?.fcfConversionRate || 'מעל 95%'
    } ותשואה על ההון (ROIC) של ${stock.financialQuality?.roicCurrent?.value || 'דו-ספרתית'}.`,
    revenueModelEn: `Core revenue and cash generation across ${industryLabel} supporting ${
      stock.financialQuality?.roicCurrent?.value || 'strong'
    } ROIC.`,
    businessSegmentsHe: [
      `פעילות ליבה בענף ${industryLabel} (${stock.moat?.marketPower?.industryRank || 'מעמד מוביל בשוק'}).`,
      stock.growth?.tamAndMarketPenetration || `אספקת פתרונות ומוצרים מתקדמים לקהל הלקוחות בסקטור ${sectorLabel}.`,
    ],
    businessSegmentsEn: [
      `Core operations in ${industryLabel}.`,
      stock.growth?.tamAndMarketPenetration || `Scaling market share in ${sectorLabel}.`,
    ],
    investmentAvenuesHe:
      drivers.length > 0
        ? drivers
        : [
            'השקעה במו"פ ובשיפור היצע המוצרים והשירותים לשימור היתרון התחרותי.',
            'הרחבת נתח שוק ויעילות תפעולית להגדלת תזרים המזומנים החופשי.',
            stock.perShare?.buybackYield
              ? `החזר הון לבעלי המניות (תשואת Buyback: ${stock.perShare.buybackYield}, דיבידנד: ${stock.perShare.dividendYield || '0%'}).`
              : 'הקצאת הון ממושמעת בין צמיחה אורגנית להחזר הון לבעלי מניות.',
          ],
    investmentAvenuesEn:
      drivers.length > 0
        ? drivers
        : [
            'R&D and product innovation strengthening core competitive positioning.',
            'Operating leverage and market penetration expansion.',
            'Disciplined capital allocation balancing growth CapEx and shareholder returns.',
          ],
    secIndustry: industryLabel,
    source: 'contextual_model',
  };
}
