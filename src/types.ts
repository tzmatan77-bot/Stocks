/**
 * US 5-Year Quality Moat Investment Research Engine
 * Data Types & Institutional Research Model Schemas (V1.0)
 */

export type MoatTrend = 'Strengthening' | 'Stable' | 'Deteriorating';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type ThesisRiskLevel = 'Low' | 'Medium' | 'High';
export type FinalVerdict = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'Reject';
export type ConsensusRating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';

export interface AuditDataPoint {
  value: string;
  period: string;
  source: string;
  yoyChange?: string;
  ttm?: string;
}

export interface MoatAnalysis {
  score: number; // 0-100 (30% weight)
  durability: number; // 0-100
  trend: MoatTrend;
  confidence: ConfidenceLevel;
  switchingCosts: { present: boolean; score: number; details: string };
  networkEffects: { present: boolean; score: number; details: string };
  intangibleAssets: { present: boolean; score: number; details: string; patentsOrBrand?: string };
  costAdvantage: { present: boolean; score: number; details: string; scaleMetric?: string };
  efficientScale: { present: boolean; score: number; details: string };
  pricingPower: { level: 'High' | 'Medium' | 'Low'; evidence: string };
  marketPower: { marketShare: string; industryRank: string; trend: string; topCompetitors: string[] };
  whyExists: string;
  whatCouldDestroyIt: string;
}

export interface FinancialQuality {
  score: number; // 0-100 (20% weight)
  roicCurrent: AuditDataPoint;
  roic3YAvg: AuditDataPoint;
  roic5YAvg: AuditDataPoint;
  wacc: string;
  roicSpread: string;
  grossMargin: AuditDataPoint;
  operatingMargin: AuditDataPoint;
  netMargin: AuditDataPoint;
  yearsProfitableInLast10: number;
  fcfTTM: AuditDataPoint;
  fcfMargin: AuditDataPoint;
  fcfCAGR5Y: AuditDataPoint;
  fcfConversionRate: string; // FCF / Net Income
  netDebt: AuditDataPoint;
  netDebtToEBITDA: AuditDataPoint;
  interestCoverage: AuditDataPoint;
  cashAndEquivalents: AuditDataPoint;
  balanceSheetHealth: 'Pristine' | 'Strong' | 'Adequate' | 'Leveraged' | 'Distressed';
}

export interface RevenueAndGrowth {
  score: number; // 0-100 (20% weight combined with runway)
  revenueTTM: AuditDataPoint;
  revenueYoY: AuditDataPoint;
  revenueCAGR3Y: AuditDataPoint;
  revenueCAGR5Y: AuditDataPoint;
  revenueCAGR10Y: AuditDataPoint;
  consistencyYearsGrowth: string; // e.g. "9 of 10 years"
  organicGrowthEstimate: string;
  growthQualityBreakdown: {
    volumeGrowth: string;
    pricingGrowth: string;
    newProductsTAM: string;
    mAndAContribution: string;
  };
  growthRunwayScore: number; // 0-100
  tamAndMarketPenetration: string;
  fiveYearCatalysts: string[];
}

export interface PerShareValueCreation {
  score: number; // 0-100 (10% weight)
  epsCAGR5Y: AuditDataPoint;
  fcfPerShareCAGR5Y: AuditDataPoint;
  sharesOutstandingChange5Y: string; // e.g. "-12.4% (Dilution reduced)"
  buybackYield: string;
  sbcAsPercentRevenue: string; // Stock-based compensation
  dividendYield: string;
  dividendCAGR5Y: string;
  truePerShareCreationVerdict: string;
}

export interface ValuationMetrics {
  score: number; // 0-100 (15% weight)
  peTTM: AuditDataPoint;
  forwardPE: AuditDataPoint;
  evToEBITDA: AuditDataPoint;
  evToFCF: AuditDataPoint;
  fcfYield: AuditDataPoint;
  pegRatio: AuditDataPoint;
  psRatio: AuditDataPoint;
  historicalPercentile5Y: string; // e.g. "32nd percentile (Undervalued vs history)"
  peerComparisonNotes: string;
  growthAdjustedAttractiveness: string;
  qualityAdjustedJustification: string;
}

export interface SeniorAnalystReport {
  id: string;
  analystName: string;
  firm: string;
  firmTier: 'Tier 1 Bulge Bracket' | 'Top Institutional Boutique' | 'Global Research';
  starRating: number; // e.g. 4.8 - 5.0
  rankPercentile: string; // e.g. "Top 1% on Wall St"
  rating: 'Strong Buy' | 'Overweight' | 'Outperform' | 'Buy' | 'Neutral' | 'Hold' | 'Underweight' | 'Sell';
  action: 'Upgraded' | 'Target Raised' | 'Reiterated' | 'Initiated' | 'Target Lowered' | 'Downgraded';
  priceTarget: number;
  impliedUpsidePercent: number;
  valuationMethodology: string; // e.g. "DCF 10Y (8.5% WACC) + 34x FY26 FCF"
  date: string;
  thesisHeadline: string;
  valuationRationale: string;
  bullCaseTarget?: number;
  bearCaseTarget?: number;
  epsEstimateFY1?: string;
  revenueEstimateFY1?: string;
  peTargetMultiple?: number;
}

export interface AnalystExpectations {
  score: number; // 0-100 (5% weight)
  consensus: ConsensusRating;
  analystCoverageCount: number;
  consensusForwardEPS: AuditDataPoint;
  consensusForwardRevenue: AuditDataPoint;
  epsRevisions30D: string; // e.g. "+3 Up / 0 Down"
  epsRevisions90D: string;
  averagePriceTarget: AuditDataPoint;
  impliedAnalystUpside: string;
  analystMomentum: 'Improving' | 'Stable' | 'Deteriorating';
  qualityWeightedSignal: string;
  highPriceTarget?: number;
  lowPriceTarget?: number;
  medianPriceTarget?: number;
  buyCount?: number;
  holdCount?: number;
  sellCount?: number;
  seniorAnalystReports?: SeniorAnalystReport[];
  expectationsGap: {
    consensusGrowthAssumption: string;
    fundamentalModelAssumption: string;
    gapNature: 'Positive' | 'Neutral' | 'Negative / Warning';
    explanation: string;
  };
}

export interface RedFlagItem {
  category: 'Accounting' | 'Business' | 'Financial' | 'Management';
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact: string;
}

export interface ValueTrapAnalysis {
  isValueTrap: boolean;
  trapScore: number; // 0-100 (higher = worse)
  indicators: {
    revenueDeclining: boolean;
    marginsDeclining: boolean;
    roicDeclining: boolean;
    fcfDeclining: boolean;
    moatWeakening: boolean;
    marketShareLoss: boolean;
    debtIncreasing: boolean;
    accountingDiscrepancy: boolean;
    analystsSlashingEstimates: boolean;
    structuralIndustryDisruption: boolean;
  };
  verdict: string;
}

export interface Scenario5Year {
  revenueGrowthCAGR: string;
  operatingMarginExit: string;
  exitMultiplePE: string;
  exitMultipleEV_FCF: string;
  expectedCAGR: string;
  assumptions: string;
}

export interface FiveYearExpectedReturn {
  bearCase: Scenario5Year;
  baseCase: Scenario5Year;
  bullCase: Scenario5Year;
  expected5YCAGRRange: string; // e.g. "12.5% – 17.8%"
  keyDrivers: string[];
}

export interface QuarterlyThesisCheck {
  quarter: string;
  filingDate: string;
  revenue: AuditDataPoint;
  operatingIncome: AuditDataPoint;
  fcf: AuditDataPoint;
  eps: AuditDataPoint;
  guidanceChange: 'Raised' | 'Maintained' | 'Lowered';
  consensusRevisionsAfterPrint: 'Positive' | 'Neutral' | 'Negative';
  moatStrengthened: boolean;
  revenueGrowingOrganically: boolean;
  marginsImproving: boolean;
  fcfCashConversionHealthy: boolean;
  roicAboveCostOfCapital: boolean;
  capitalAllocationDiscipline: boolean;
  analystRevisionsConstructive: boolean;
  valuationFavorable: boolean;
  quarterlyHealthScore: number; // 0-100
  thesisBreakTriggered: boolean;
  thesisBreakAlerts: string[];
}

export interface ResearchStock {
  rank?: number;
  ticker: string;
  companyName: string;
  exchange: 'NYSE' | 'NASDAQ' | 'NYSE American';
  sector: string;
  industry: string;
  marketCap: string;
  currentPrice: string;
  analysisDate: string;
  moatType?: string;
  
  // Live Pricing
  livePrice?: number;
  liveChangePercent?: number;
  liveChangeAmount?: number;
  lastLiveTime?: string;
  
  // Scores
  investmentScore: number; // 0-100
  moatScore: number; // 30%
  financialQualityScore: number; // 20%
  growthScore: number; // 20%
  perShareScore: number; // 10%
  valuationScore: number; // 15%
  analystScore: number; // 5%
  
  // Categorical
  moatTrend: MoatTrend;
  thesisRisk: ThesisRiskLevel;
  finalVerdict: FinalVerdict;
  expected5YCAGRRange: string;
  
  // Deep Breakdown
  moat: MoatAnalysis;
  financialQuality: FinancialQuality;
  growth: RevenueAndGrowth;
  perShare?: PerShareValueCreation;
  perShareValueCreation?: PerShareValueCreation;
  valuation: ValuationMetrics;
  analysts: AnalystExpectations;
  valueTrap: ValueTrapAnalysis;
  redFlags: RedFlagItem[];
  scenarios: FiveYearExpectedReturn;
  quarterlyMonitoring: {
    healthScoreHistory: Array<{ quarter: string; score: number }>;
    currentHealthScore: number;
    lastQuarterReview: QuarterlyThesisCheck;
  };
  
  // Deep Dive Thesis
  investmentThesisSummary: string;
  moatDefenseMechanism: string;
  fiveYearGrowthDrivers: string[];
  primaryFailureRisks: string[];
  whyInTopUniverse: string;
  companyProfile?: CompanyProfileInfo;
}

export interface CompanyProfileInfo {
  whatItDoesHe: string;
  whatItDoesEn: string;
  revenueModelHe?: string;
  revenueModelEn?: string;
  businessSegmentsHe: string[];
  businessSegmentsEn: string[];
  investmentAvenuesHe: string[];
  investmentAvenuesEn: string[];
  secIndustry?: string;
  source?: string;
}

export interface PortfolioPosition {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  buyPrice: number;
  actionFee?: number; // Transaction / action fee ($7.00 per action current, $7.50 historical)
  targetWeight?: number;
  purchaseDate?: string;
  buyDate?: string;
  notes?: string;
  tranches?: PortfolioTranche[];
}

export interface PortfolioTranche {
  id: string;
  shares: number;
  price: number;
  date: string;
  actionFee?: number; // $7.50 per action
  notes?: string;
}

export interface RealizedTransaction {
  id: string;
  ticker: string;
  companyName: string;
  sharesSold: number;
  sellPrice: number;
  avgBuyPrice: number;
  actionFee?: number; // $7.50 per sell action
  buyActionFee?: number; // $7.50 purchase action fee
  grossProceeds?: number; // sharesSold * sellPrice
  netProceeds?: number; // grossProceeds - actionFee
  realizedPnL: number;
  realizedPnLPct: number;
  saleDate: string;
  notes?: string;
  timestamp: number;
}

export interface WatchlistItem {
  ticker: string;
  companyName: string;
  addedAt: string;
  targetBuyPrice?: number;
  targetPE?: number;
  alertOnThesisBreak: boolean;
  notes?: string;
}

export interface NamedWatchlist {
  id: string;
  name: string;
  createdAt: string;
  items: WatchlistItem[];
}

export interface UniverseScreenResult {
  lastUpdated: string;
  totalUniverseScanned: number;
  minMarketCap: string;
  top20: ResearchStock[];
  top10: ResearchStock[];
  top5: ResearchStock[];
}

export type UniverseAnalysisResult = UniverseScreenResult;

// Pre-Market & Daily Global News Intelligence Types
export type PremarketSentiment = 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGH_VOLATILITY';
export type PremarketRecommendationAction = 'STRONG_BUY' | 'ACCUMULATE_ON_DIP' | 'HOLD_MONITOR' | 'CAUTION_ALERT' | 'TAKE_PROFIT';
export type PremarketCategory = 'MACRO_RATES' | 'EARNINGS_CATALYST' | 'TECH_AI_CHIPS' | 'HEALTHCARE_BIO' | 'CONSUMER_RETAIL' | 'ANALYST_RATINGS';
export type PremarketMovementType =
  | 'IMPENDING_JUMP' // 🟢 אפשרות לעלייה חדה
  | 'SHARP_DROP_WARNING' // 🔴 אזהרת ירידה
  | 'FORECAST_REVISION' // 🔵 שינוי תחזיות
  | 'VOLATILE_OPPORTUNITY'
  | 'RANGE_BOUND';

// 3 Standard Core User Alert Categories
export type StandardMessageCategory =
  | 'DROP_WARNING' // 🔴 אדום: אזהרת ירידה
  | 'SHARP_RISE' // 🟢 ירוק: אפשרות לעלייה חדה
  | 'FORECAST_REVISION'; // 🔵 כחול: שינוי תחזיות

export type PremarketCatalystType = 'EARNINGS_BEAT' | 'GUIDANCE_CUT' | 'ANALYST_UPGRADE' | 'ANALYST_DOWNGRADE' | 'REGULATORY_FDA' | 'PARTNERSHIP_CONTRACT' | 'MACRO_HEADWIND';
export type PremarketIndexOrigin = 'NASDAQ_100' | 'SP_500' | 'BOTH';

export interface PremarketNewsItem {
  id: string;
  ticker: string;
  companyName: string;
  headline: string;
  summary: string;
  source: string; // Bloomberg, Reuters, Wall Street Journal, Financial Times, CNBC, SEC, Barron's
  sourceUrl?: string;
  publishedTime: string; // e.g. "07:15 AM EST"
  date: string;
  isLiveRss?: boolean;
  newsDateKey?: string; // YYYY-MM-DD
  category: PremarketCategory;
  sentiment: PremarketSentiment;
  preMarketPrice?: number;
  preMarketChangePercent?: number;
  // S&P 500 & NASDAQ Pre-Market Catalyst Detection
  movementType?: PremarketMovementType;
  messageCategory?: StandardMessageCategory; // Standard 3-category classifier
  catalystType?: PremarketCatalystType;
  indexOrigin?: PremarketIndexOrigin;
  estimatedImpactPct?: string; // e.g. "+8% to +14%" or "-7% to -18%"
  catalystSeverity?: 'HIGH' | 'CRITICAL' | 'MODERATE';
  // Explicit Investor Reaction Analysis ("ניתוח תגובה")
  reactionAnalysis?: {
    expectedReaction: 'POSITIVE_UP' | 'NEGATIVE_DOWN' | 'MIXED_VOLATILE';
    expectedReactionLabelHe: string;
    expectedReactionLabelEn: string;
    expectedMoveRange?: string;
    whyReactingHe: string;
    whyReactingEn: string;
    isOverreactionOrRealHe: string;
    isOverreactionOrRealEn: string;
    howToRespondHe: string;
    howToRespondEn: string;
  };
  // Deep Institutional Recommendation & Analysis
  recommendation: {
    action: PremarketRecommendationAction;
    actionLabelHe: string;
    actionLabelEn: string;
    confidenceScore: number; // 0-100
    impactOn5YearThesis: 'STRENGTHENS_MOAT' | 'TEMPORARY_NOISE' | 'NEUTRAL' | 'THESIS_WATCH';
    impactAnalysisHe: string;
    impactAnalysisEn: string;
    openingBellGamePlanHe: string;
    openingBellGamePlanEn: string;
    targetPrice: number;
    buyZoneMax: number;
    riskFactorHe: string;
    riskFactorEn: string;
  };
}

export interface PremarketMarketPulse {
  sessionStatus: 'PRE_MARKET' | 'REGULAR_MARKET' | 'AFTER_HOURS' | 'WEEKEND_CLOSED';
  nyTimeStr: string;
  israelTimeStr: string;
  minutesToOpen: number;
  marketSentiment: 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF';
  sp500FuturesChange: string;
  nasdaqFuturesChange: string;
  tenYearTreasuryYield: string;
  vixLevel: string;
  dailyMacroBriefHe: string;
  dailyMacroBriefEn: string;
}

export type PremarketMoveVerdict = 'VERIFIED_NEWS' | 'SPECULATIVE_MOMENTUM' | 'NO_NEWS_FAKE_PUMP';

export type DetectionStage = 'EARLY_SIGNAL' | 'CONFIRMED_BREAKOUT' | 'TRAP_DETECTED';

export interface LLMCatalystEvaluation {
  score: number; // 0-100
  category: 'REGULATORY_FILING' | 'EARNINGS' | 'BIOPHARMA_CLINICAL' | 'CONTRACT' | 'ANALYST_ACTION' | 'UNSUBSTANTIATED_PUMP';
  sourceCredibility: 'SEC_EDGAR_8K' | 'NEWSWIRE_PR' | 'TIER1_RESEARCH' | 'SOCIAL_RETAIL' | 'NONE';
  credibilityWeight: number; // 0-1.0
  llmReasoningHe: string;
  shelfOfferingRisk: 'HIGH_IMMINENT' | 'MODERATE' | 'LOW_NONE';
}

export interface FiveMinVolumeBucket {
  currentBucketVolume: string; // e.g. "450K"
  historicalBucketBaseline: string; // e.g. "45K"
  bucketRvolMultiplier: number; // e.g. 10.0x
  timeBucketLabel: string; // e.g. "07:15 - 07:20 EST"
}

export interface TopPremarketGainer {
  rank: number;
  ticker: string;
  companyName: string;
  sector: string;
  preMarketPrice: number;
  previousClose: number;
  changePercent: number; // e.g. 38.4
  changeAmount: number;
  preMarketVolume: string; // e.g. "4.2M" or "14K"
  relativeVolume: number; // e.g. 18.5 (meaning 18.5x average volume)
  liquidityTier: 'HIGH_INSTITUTIONAL' | 'MODERATE' | 'THIN_DANGEROUS';
  
  // v2.0 Quant Additions
  detectionStage: DetectionStage;
  fiveMinBucket: FiveMinVolumeBucket;
  freeFloat: string; // e.g. "18.5M"
  floatTurnoverPct: number; // e.g. 23.4%
  fadeProbabilityPct: number; // e.g. 88%
  llmEvaluation: LLMCatalystEvaluation;
  
  // The crucial distinction: Is there real news or is it "סתם עולה" (no news / low volume pump)?
  verdict: PremarketMoveVerdict;
  hasRealNews: boolean;
  catalystType: 'EARNINGS_BEAT' | 'FDA_APPROVAL' | 'M_AND_A_BUYOUT' | 'TIER1_ANALYST_UPGRADE' | 'MEGA_CONTRACT' | 'SHORT_SQUEEZE' | 'SOCIAL_RETAIL_BUZZ' | 'THIN_SPREAD_TRAP';
  
  headlineHe: string;
  headlineEn: string;
  whyItMovedHe: string;
  whyItMovedEn: string;
  hasNewsExplanationHe: string; // Explicit explanation: is there real news or "סתם עולה"?
  hasNewsExplanationEn: string;
  
  authenticityScore: number; // 0-100 (e.g. 96 for genuine beat, 15 for fake pump)
  traderAdviceHe: string; // Guidance for traders
  traderAdviceEn: string;
  sourceCiting?: string; // SEC filing, PR Newswire, Bloomberg, No source / Social buzz
}


