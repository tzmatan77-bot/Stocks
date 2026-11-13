export type SupportedLanguage = 'en' | 'he' | 'de' | 'fr' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  he: {
    appTitle: 'MoatGuard PRO',
    appSubtitle: 'מערכת מחקר איכות, חפיר כלכלי, מניות מובילות ומעקב תיק בלייב',
    liveStream: 'פיד שוק חי',
    feedPaused: 'הפיד מושהה',
    streaming: 'זרם חי',
    play: 'הפעל',
    refresh: 'רענון שוק מיידי',
    searchPlaceholder: 'חפש סימול מניה (לדוגמה: UNH, NVDA, AAPL)...',
    analyzeBtn: 'נתח מניה',
    
    // Navigation Tabs
    tabHome: 'דף ראשי',
    tabTop10Scanner: 'גלאי מניות השוק',
    tabExplore: 'גילוי (Discover)',
    tabToolsHub: '🛠️ כלים מוסדיים (14)',
    tabPortfolio: 'התיק שלי (Portfolio)',
    tabWatchlist: 'מעקב (Watchlist)',
    tabTop5: 'מחקר מעמיק (Deep Dive)',
    tabAnalyzer: 'אנליסט AI חי',
    moreTools: 'כלים מוסדיים נוספים',
    tabCompare: 'השוואה ראש בראש',
    tabSimulator: 'סימולטור צמיחה לשנתיים (2Y)',
    tabQuarterly: 'ניטור דוחות רבעוניים',
    tabTop10: 'גלאי מניות השוק',
    tabTop20: 'מטריצת 30 המניות',
    tabRules: 'ספר 30 הכללים והמתודולוגיה',
    tabDcf: 'מחשבון שווי הוגן DCF',
    tabReverseDcf: 'ציפיות שוק ו-Reverse DCF',
    tabCompetitiveMap: 'מפת תחרות ועליונות חפיר',
    tabThesisMonitor: 'בקרת תזה ויומן השקעות',
    tabMacro: 'מבחני לחץ מאקרו (Stress Test)',
    tabShareholder: 'תשואת בעלי מניות ורכישה עצמית',
    tabEarnings: 'יומן דוחות כספיים ו-AI',
    tabTerminal: 'מסוף Pro דחוס (Bloomberg)',
    tabPrintMemo: 'הדפסת תזכיר מוסדי',

    // Hero Banner
    heroUniverseTag: 'יוניברס איכות לשנתיים בארה"ב (2Y Horizon)',
    heroTitle: 'לזהות את המניות האיכותיות ביותר בוול סטריט – ולהשקיע בביטחון',
    heroDesc: 'ניתוח פונדמנטלי חכם, דירוג איכות מעמיק וסימולטור תשואה לשנתיים קדימה (FY2) כדי לאתר חברות מובילות במחיר הנכון.',
    screenedUniverse: 'מניות ביוניברס',
    zeroTraps: 'אפס מלכודות ערך',
    avgQualityScore: 'ציון איכות ממוצע',
    topTierLabel: 'דירוג עליון (A / A+)',
    fiveYearTarget: 'יעד מחיר לשנתיים (FY2)',
    compoundingAvg: 'תשואת CAGR שנתית צפויה',

    // Section Titles
    convictionLeaders: '#1 החברות המובילות בדירוג האיכות',
    convictionSubtitle: 'חברות הקומפאונדרס המובילות להשקעה באופק ריאלי של שנתיים',
    qualityScore: 'ציון איכות',
    fullMemo: 'תזכיר מחקר מלא',
    saved: 'נשמר',
    watch: 'עקוב',
    invest: 'הוסף לתיק',
    deepDive: 'מחקר מלא',

    // Filter controls
    searchFilterPlaceholder: 'חפש חברה, סימול או מודל עסקי...',
    sortBy: 'מיין לפי:',
    sortScore: 'ציון איכות (מהגבוה לנמוך)',
    sortCagr: 'תשואת יעד לשנתיים (CAGR)',
    sortRoic: 'יעילות הון (ROIC)',
    sortPrice: 'מחיר מניה',
    sectorAll: 'הכל',
    sector: 'סקטור:',

    // Language selector
    changeLanguage: 'בחר שפה',
    footerCopyright: 'MoatGuard PRO • מנוע איכות, חפיר ותשואה לשנתיים (2-Year Horizon)',
    footerSources: 'מקורות נתוני SEC EDGAR רשמיים (10-K, 10-Q), הערכות קונצנזוס ומודלי AI רב-שכבתיים'
  },
  en: {
    appTitle: 'MoatGuard PRO',
    appSubtitle: 'US Equity Moats, Quality Scoring, High-Conviction Memos & Live Portfolio Tracking',
    liveStream: 'LIVE US MARKET STREAM',
    feedPaused: 'FEED PAUSED',
    streaming: 'Streaming',
    play: 'Play',
    refresh: 'Instant Market Refresh',
    searchPlaceholder: 'Search US Ticker (e.g. UNH, NVDA, AAPL)...',
    analyzeBtn: 'Analyze',
    
    // Navigation Tabs
    tabHome: 'Home',
    tabTop10Scanner: 'Market Stock Screener',
    tabExplore: 'Discover',
    tabToolsHub: '🛠️ Institutional Tools (14)',
    tabPortfolio: 'Portfolio',
    tabWatchlist: 'Watchlist',
    tabTop5: 'Deep Dive Research',
    tabAnalyzer: 'AI Analyst',
    moreTools: 'More Tools',
    tabCompare: 'Head-to-Head Compare',
    tabSimulator: '2Y Growth Simulator',
    tabQuarterly: 'Quarterly Health Monitor',
    tabTop10: 'Market Stock Screener',
    tabTop20: '30 Stocks Data Matrix',
    tabRules: '30-Rule Specification',
    tabDcf: 'DCF Fair Value Model',
    tabReverseDcf: 'Reverse DCF & Expectations',
    tabCompetitiveMap: 'Competitive Moat Map',
    tabThesisMonitor: 'Thesis Monitor & Diary',
    tabMacro: 'Macro Stress Testing',
    tabShareholder: 'Shareholder Yield & Buybacks',
    tabEarnings: 'Earnings Calendar & AI',
    tabTerminal: 'Bloomberg Pro Terminal',
    tabPrintMemo: 'Printable Investment Memo',

    // Hero Banner
    heroUniverseTag: 'US 2-Year High-Conviction Quality Universe',
    heroTitle: "Identify Wall Street's Highest Quality Stocks – And Invest With Confidence",
    heroDesc: 'Smart fundamental analysis, deep quality scoring, and a 2-year return simulator to pinpoint market leaders at the right price.',
    screenedUniverse: 'Screened Universe',
    zeroTraps: 'Zero Value Traps',
    avgQualityScore: 'Avg. Quality Score',
    topTierLabel: 'Top Tier (A / A+)',
    fiveYearTarget: '2Y Base Target (FY2)',
    compoundingAvg: '2Y CAGR Forecast',

    // Section Titles
    convictionLeaders: '#1 Conviction Leaders (Top Tier Picks)',
    convictionSubtitle: 'Highest ranked 2-year capital compounders',
    qualityScore: 'Quality Score',
    fullMemo: 'Full Memo',
    saved: 'Saved',
    watch: 'Watch',
    invest: 'Invest',
    deepDive: 'Deep Dive',

    // Filter controls
    searchFilterPlaceholder: 'Search companies, tickers, or business models...',
    sortBy: 'Sort by:',
    sortScore: 'Quality Score (High to Low)',
    sortCagr: '2Y Target CAGR',
    sortRoic: 'ROIC Capital Efficiency',
    sortPrice: 'Share Price',
    sectorAll: 'ALL',
    sector: 'Sector:',

    // Language selector
    changeLanguage: 'Language',
    footerCopyright: 'MoatGuard PRO • US 2-Year Quality Moat Engine V1.0',
    footerSources: 'Primary SEC EDGAR (10-K, 10-Q), Institutional Estimates & Grounded Multi-Model AI'
  },
  de: {
    appTitle: 'MoatGuard PRO',
    appSubtitle: 'US-Aktien-Moats, Qualitäts-Scoring, Investment-Memos & Live-Portfolio',
    liveStream: 'LIVE US-MARKT-STREAM',
    feedPaused: 'STREAM PAUSIERT',
    streaming: 'Streaming',
    play: 'Starten',
    refresh: 'Marktdaten aktualisieren',
    searchPlaceholder: 'US-Tickersymbol suchen (z. B. UNH, NVDA, AAPL)...',
    analyzeBtn: 'Analysieren',
    
    // Navigation Tabs
    tabExplore: 'Entdecken & Screener',
    tabPortfolio: 'Mein Portfolio',
    tabWatchlist: 'Watchlist & Alarme',
    tabTop5: 'Deep-Dive-Analysen',
    tabAnalyzer: 'Live-KI-Analyst',
    moreTools: 'Weitere Tools',
    tabCompare: 'Direktvergleich',
    tabSimulator: '5J-Wachstumssimulator',
    tabQuarterly: 'Quartals-Monitor',
    tabTop10: 'Top 10 Überzeugungen',
    tabTop20: 'Vollständige Matrix',
    tabRules: '30-Regel-Methodik',
    tabDcf: 'DCF-Fair-Value-Rechner',
    tabMacro: 'Makro-Stresstests',
    tabShareholder: 'Aktionärsrendite & Rückkäufe',
    tabEarnings: 'Ertragskalender & KI',
    tabTerminal: 'Pro Terminal Ansicht',
    tabPrintMemo: 'Druckbares Memo',

    // Hero Banner
    heroUniverseTag: 'US-Qualitätsuniversum für 5 Jahre',
    heroTitle: 'Die hochwertigsten Aktien der Wall Street erkennen – und mit Zuversicht investieren',
    heroDesc: 'Smarte Fundamentalanalyse, tiefes Qualitäts-Scoring und 5-Jahres-Renditesimulator zur Identifikation marktführender Unternehmen zum fairen Preis.',
    screenedUniverse: 'Geprüfte Aktien',
    zeroTraps: 'Keine Value-Fallen',
    avgQualityScore: 'Durchschnittlicher Score',
    topTierLabel: 'Spitzenklasse (A / A+)',
    fiveYearTarget: '5J-Basisziel',
    compoundingAvg: 'Erwarteter CAGR',

    // Section Titles
    convictionLeaders: '#1 Führende Qualitätsaktien',
    convictionSubtitle: 'Höchstbewertete 5-Jahres-Kapitalvermehrer',
    qualityScore: 'Qualitäts-Score',
    fullMemo: 'Vollständiges Memo',
    saved: 'Gespeichert',
    watch: 'Beobachten',
    invest: 'Investieren',
    deepDive: 'Detailansicht',

    // Filter controls
    searchFilterPlaceholder: 'Unternehmen, Ticker oder Geschäftsmodelle suchen...',
    sortBy: 'Sortieren nach:',
    sortScore: 'Qualitäts-Score (hoch nach niedrig)',
    sortCagr: '5J-Ziel-CAGR',
    sortRoic: 'ROIC-Kapitaleffizienz',
    sortPrice: 'Aktienkurs',
    sectorAll: 'ALLE',
    sector: 'Sektor:',

    // Language selector
    changeLanguage: 'Sprache',
    footerCopyright: 'MoatGuard PRO • US 5-Jahres-Burggraben-Engine V1.0',
    footerSources: 'Offizielle SEC EDGAR-Daten (10-K, 10-Q), Konsensschätzungen & KI-Modelle'
  },
  fr: {
    appTitle: 'MoatGuard PRO',
    appSubtitle: 'Avantages concurrentiels (Moats), Scoring qualité & Suivi de portefeuille en direct',
    liveStream: 'FLUX MARCHÉ US EN DIRECT',
    feedPaused: 'FLUX EN PAUSE',
    streaming: 'En direct',
    play: 'Activer',
    refresh: 'Actualiser le marché',
    searchPlaceholder: 'Rechercher un ticker US (ex. UNH, NVDA, AAPL)...',
    analyzeBtn: 'Analyser',
    
    // Navigation Tabs
    tabExplore: 'Explorer & Screener',
    tabPortfolio: 'Mon Portefeuille',
    tabWatchlist: 'Liste de suivi & Alertes',
    tabTop5: 'Analyses approfondies',
    tabAnalyzer: 'Analyste IA en direct',
    moreTools: 'Autres outils',
    tabCompare: 'Comparaison directe',
    tabSimulator: 'Simulateur 5 ans',
    tabQuarterly: 'Suivi trimestriel',
    tabTop10: 'Top 10 Conviction',
    tabTop20: 'Matrice complète',
    tabRules: 'Méthodologie des 30 règles',
    tabDcf: 'Modèle DCF Juste Valeur',
    tabMacro: 'Stress Tests Macro',
    tabShareholder: 'Rendement Actionnaire & Rachats',
    tabEarnings: 'Calendrier Résultats & IA',
    tabTerminal: 'Terminal Pro Bloomberg',
    tabPrintMemo: 'Mémo Imprimable',

    // Hero Banner
    heroUniverseTag: 'Univers Qualité US sur 5 Ans',
    heroTitle: 'Identifiez les meilleures actions de Wall Street – et investissez en toute confiance',
    heroDesc: 'Analyse fondamentale intelligente, notation de qualité approfondie et simulateur de rendement sur 5 ans pour cibler les leaders du marché au bon prix.',
    screenedUniverse: 'Titres analysés',
    zeroTraps: 'Zéro piège de valeur',
    avgQualityScore: 'Score Qualité Moyen',
    topTierLabel: 'Excellence (A / A+)',
    fiveYearTarget: 'Cible Base 5 Ans',
    compoundingAvg: 'CAGR moyen prévu',

    // Section Titles
    convictionLeaders: '#1 Leaders de haute conviction',
    convictionSubtitle: 'Meilleures entreprises de capitalisation sur 5 ans',
    qualityScore: 'Score Qualité',
    fullMemo: 'Mémo complet',
    saved: 'Enregistré',
    watch: 'Suivre',
    invest: 'Investir',
    deepDive: 'Analyse',

    // Filter controls
    searchFilterPlaceholder: 'Rechercher entreprises, tickers ou modèles...',
    sortBy: 'Trier par :',
    sortScore: 'Score Qualité (décroissant)',
    sortCagr: 'Objectif CAGR 5 ans',
    sortRoic: 'Efficacité du capital (ROIC)',
    sortPrice: 'Cours de l’action',
    sectorAll: 'TOUS',
    sector: 'Secteur :',

    // Language selector
    changeLanguage: 'Langue',
    footerCopyright: 'MoatGuard PRO • Moteur Moat & Qualité US 5 Ans',
    footerSources: 'Données officielles SEC EDGAR (10-K, 10-Q), Estimations de consensus et modèles IA'
  },
  es: {
    appTitle: 'MoatGuard PRO',
    appSubtitle: 'Ventajas competitivas (Moats), Puntuación de calidad y Gestión de cartera en vivo',
    liveStream: 'STREAM EN VIVO DEL MERCADO EE. UU.',
    feedPaused: 'STREAM PAUSADO',
    streaming: 'Transmitiendo',
    play: 'Iniciar',
    refresh: 'Actualizar mercado',
    searchPlaceholder: 'Buscar ticker de EE. UU. (ej. UNH, NVDA, AAPL)...',
    analyzeBtn: 'Analizar',
    
    // Navigation Tabs
    tabExplore: 'Explorar y Filtro',
    tabPortfolio: 'Mi Cartera',
    tabWatchlist: 'Lista de seguimiento y Alertas',
    tabTop5: 'Informes en profundidad',
    tabAnalyzer: 'Analista IA en vivo',
    moreTools: 'Más herramientas',
    tabCompare: 'Comparación directa',
    tabSimulator: 'Simulador 5 años',
    tabQuarterly: 'Monitor trimestral',
    tabTop10: 'Top 10 Convicción',
    tabTop20: 'Matrice completa',
    tabRules: 'Metodología de 30 reglas',
    tabDcf: 'Modelo DCF Valor Razonable',
    tabMacro: 'Pruebas de Estrés Macro',
    tabShareholder: 'Rendimiento Accionista y Recompras',
    tabEarnings: 'Calendario de Resultados e IA',
    tabTerminal: 'Terminal Pro Bloomberg',
    tabPrintMemo: 'Informe Imprimible',

    // Hero Banner
    heroUniverseTag: 'Universo de Calidad EE. UU. a 5 Años',
    heroTitle: 'Identifique las acciones de mayor calidad de Wall Street – e invierta con confianza',
    heroDesc: 'Análisis fundamental inteligente, puntuación de calidad profunda y simulador de rentabilidad a 5 años para detectar líderes del mercado al precio correcto.',
    screenedUniverse: 'Acciones analizadas',
    zeroTraps: 'Cero trampas de valor',
    avgQualityScore: 'Puntuación media',
    topTierLabel: 'Nivel Superior (A / A+)',
    fiveYearTarget: 'Objetivo Base 5 Años',
    compoundingAvg: 'CAGR esperado',

    // Section Titles
    convictionLeaders: '#1 Líderes de Alta Convicción',
    convictionSubtitle: 'Empresas líderes para interés compuesto a 5 años',
    qualityScore: 'Puntuación de Calidad',
    fullMemo: 'Informe completo',
    saved: 'Guardado',
    watch: 'Seguir',
    invest: 'Invertir',
    deepDive: 'Detalle',

    // Filter controls
    searchFilterPlaceholder: 'Buscar empresas, tickers o modelos de negocio...',
    sortBy: 'Ordenar por:',
    sortScore: 'Puntuación de Calidad (Mayor a Menor)',
    sortCagr: 'CAGR objetivo 5 años',
    sortRoic: 'Eficiencia de capital (ROIC)',
    sortPrice: 'Precio de la acción',
    sectorAll: 'TODOS',
    sector: 'Sector:',

    // Language selector
    changeLanguage: 'Idioma',
    footerCopyright: 'MoatGuard PRO • Motor de Moat y Calidad EE. UU. 5 Años',
    footerSources: 'Datos oficiales SEC EDGAR (10-K, 10-Q), Estimaciones institucionales y modelos IA'
  }
};
