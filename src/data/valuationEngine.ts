import { ResearchStock } from '../types';

export interface ValuationOverrides {
  fcfGrowthRate?: number; // %
  discountRateWACC?: number; // %
  terminalMultiple?: number; // x
  terminalMethod?: 'multiple' | 'gordon';
  perpetualGrowthRate?: number; // %
  marginOfSafetyPct?: number; // %
  cashBillion?: number; // $B
  debtBillion?: number; // $B
  sharesBillion?: number; // B shares
  customBaseFcfBillion?: number; // $B
}

export interface EvToEquityBridge {
  presentValueOfFcf5Y: number; // $B
  presentValueOfTerminalValue: number; // $B
  enterpriseValue: number; // $B
  cashAndShortTermInvestments: number; // $B
  totalDebt: number; // $B
  netCash: number; // $B (cash - debt)
  equityValue: number; // $B (EV + net cash)
  sharesOutstanding: number; // Billion shares
  netCashPerShare: number; // $ per share
}

export interface ScenarioResult {
  scenario: 'bear' | 'base' | 'bull';
  nameHe: string;
  nameEn: string;
  fairValue: number;
  fcfGrowthRate: number; // %
  terminalMultiple: number; // x
  discountRateWACC: number; // %
  impliedMultiple: number;
  descriptionHe: string;
  descriptionEn: string;
}

export interface MultiModelValuationResult {
  ticker: string;
  currentPrice: number;
  
  // 3 Distinct Valuation Models (Bottom-Up)
  dcfPerShare: number;
  multiplesPerShare: number;
  reinvestmentPerShare: number;
  
  // Model Weights Applied
  weights: {
    dcf: number; // e.g. 0.50 (50%)
    multiples: number; // e.g. 0.30 (30%)
    reinvestment: number; // e.g. 0.20 (20%)
  };
  
  // Blended Intrinsic Value
  blendedFairValue: number; // Base case midpoint
  
  // 3 Explicit Scenarios
  bearScenario: ScenarioResult;
  baseScenario: ScenarioResult;
  bullScenario: ScenarioResult;
  
  // Pricing Zones
  buyZoneThreshold: number; // < $X (Margin of safety entry)
  watchZoneUpper: number; // $X - $Y
  expensiveZoneThreshold: number; // > $Y
  
  // Asymmetry & Valuation Status
  upsideToBasePercent: number; // %
  upsideToBullPercent: number; // %
  downsideToBearPercent: number; // %
  asymmetryRatio: number; // Upside to Bull / Downside to Bear
  marginOfSafetyPercent: number; // %
  valuationZone: 'Deep Value (Strong Buy)' | 'Buy Zone' | 'Fair Value Range' | 'Fully Valued' | 'Overvalued';
  valuationZoneHe: 'ערך עמוק (קנייה חזקה)' | 'אזור קנייה מוסדי' | 'טווח שווי הוגן' | 'מתומחר במלואו' | 'תמחור יתר / יקר';
  
  // Balance Sheet Bridge
  evBridge: EvToEquityBridge;
  
  // Qualitative Metadata
  businessModelCategory: 'Secular Tech / Asset-Light' | 'Financial & Banking' | 'Defensive Quality / Healthcare' | 'Consumer & Retail' | 'Industrial & Cyclical';
  isFinancialInstitution: boolean;
  notesHe: string;
  notesEn: string;
}

/**
 * Balance sheet & financial parameter extractor
 */
export function extractFinancialInputs(stock: ResearchStock, livePrice?: number, overrides?: ValuationOverrides) {
  // 1. Current Price
  const rawPriceStr = (stock.currentPrice || '').replace(/[^0-9.]/g, '');
  const parsedPrice = parseFloat(rawPriceStr);
  const snapshotPrice = !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 100;
  const currentPrice = livePrice && livePrice > 0 ? livePrice : snapshotPrice;

  const parseToBillions = (raw: string, fallback: number): number => {
    const cleaned = (raw || '').replace(/,/g, '').trim();
    const isNegative = /^\s*-/.test(cleaned) || /\$\s*-/.test(cleaned);
    const m = cleaned.match(/([0-9]+(?:\.[0-9]+)?)\s*([TBMK])?/i);
    if (!m) return fallback;
    const val = parseFloat(m[1]);
    if (isNaN(val)) return fallback;
    const unit = (m[2] || 'B').toUpperCase();
    let inB = val;
    if (unit === 'T') inB = val * 1000;
    else if (unit === 'M') inB = val / 1000;
    else if (unit === 'K') inB = val / 1_000_000;
    return isNegative ? -inB : inB;
  };

  // 2. Shares Outstanding (Billions) — anchored to marketCap / snapshotPrice
  const parsedCap = parseToBillions(stock.marketCap || '', 250);
  const autoShares = Math.max(0.005, parsedCap / snapshotPrice);
  const sharesBillion = overrides?.sharesBillion !== undefined && overrides.sharesBillion > 0 
    ? overrides.sharesBillion 
    : autoShares;

  // 3. Growth & ROIC
  const cagrMatch = (stock.expected5YCAGRRange || stock.growth?.revenueCAGR5Y?.value || '').match(/([0-9.]+)/);
  const baseCagr = cagrMatch ? parseFloat(cagrMatch[1]) : 12.0;
  const roicMatch = (stock.financialQuality?.roicCurrent?.value || '').match(/([0-9.]+)/);
  const roic = roicMatch ? parseFloat(roicMatch[1]) : 18.0;

  // 4. Valuation Multiples (P/E, Forward P/E) — computed early to anchor Owner Earnings normalization
  const peStr = stock.valuation?.peTTM?.value || '';
  const peMatch = peStr.match(/([0-9.]+)/);
  const peTTM = peMatch ? parseFloat(peMatch[1]) : 24.0;
  const fwdPeStr = stock.valuation?.forwardPE?.value || '';
  const fwdPeMatch = fwdPeStr.match(/([0-9.]+)/);
  const forwardPE = fwdPeMatch ? parseFloat(fwdPeMatch[1]) : peTTM * 0.88;

  // 5. Sector / Model Category
  const sector = stock.sector || '';
  const assetLightFinancials = new Set(['V', 'MA', 'SPGI', 'MCO', 'BLK', 'MSCI', 'CME', 'NDAQ', 'ICE']);
  const knownBanks = new Set(['JPM', 'GS', 'BAC', 'MS', 'SOFI', 'C', 'WFC', 'USB', 'PNC', 'AXP', 'ALLY', 'PYPL']);
  const isConglomerateInsurer = stock.ticker === 'BRK.B';
  const knownReits = new Set(['O', 'AMT', 'PLD', 'SPG', 'EQIX', 'VICI', 'DLR', 'PSA', 'WELL']);
  const knownUtilities = new Set(['NEE', 'DUK', 'SO', 'AEP', 'EXC', 'XEL', 'D', 'CEG', 'VST']);
  const isReit = sector.includes('Real Estate') || knownReits.has(stock.ticker);
  const isUtility = sector.includes('Utilities') || knownUtilities.has(stock.ticker);
  const isBankOnly =
    knownBanks.has(stock.ticker) ||
    ((sector.includes('Financial') || sector.includes('Bank')) && !assetLightFinancials.has(stock.ticker) && !isConglomerateInsurer);
  const isBankOrInsurer = isBankOnly || isConglomerateInsurer;
  const isCapitalIntensiveInfra = isReit || isUtility;
  const isFinancialInstitution = isBankOrInsurer || isReit;

  // 6. Cash and Equivalents (Billions)
  const cashStr = stock.financialQuality?.cashAndEquivalents?.value || '';
  const autoCash = Math.max(0, parseToBillions(cashStr, sharesBillion * currentPrice * 0.06));
  const cashBillion = overrides?.cashBillion !== undefined ? overrides.cashBillion : autoCash;

  // 7. Total Debt (Billions)
  let autoDebt = sharesBillion * currentPrice * 0.08;
  const debtStr = stock.financialQuality?.netDebt?.value || '';
  const parsedRawNetDebt = parseToBillions(debtStr, NaN);
  const hasExplicitDebtNum = !isNaN(parsedRawNetDebt);
  if (debtStr.includes('Net Cash') || debtStr.trim().startsWith('-') || (hasExplicitDebtNum && parsedRawNetDebt < 0)) {
    // Net cash company: debt is lower than cash
    const netCashAmount = hasExplicitDebtNum ? Math.abs(parsedRawNetDebt) : autoCash * 0.5;
    autoDebt = Math.max(0, autoCash - netCashAmount);
  } else if (hasExplicitDebtNum) {
    autoDebt = Math.max(0, parsedRawNetDebt) + autoCash; // Net Debt + Cash = Total Debt
  }
  const debtBillion = overrides?.debtBillion !== undefined ? overrides.debtBillion : autoDebt;

  // 8. FCF TTM (Billions) — preserve negative sign and normalize negative/CapEx-distorted or bank-distorted FCF
  const fcfStr = stock.financialQuality?.fcfTTM?.value || '';
  const impliedEarningsB = Math.max(0.05, parsedCap / Math.max(6, Math.min(85, peTTM || forwardPE || 22)));
  const parsedFcf = parseToBillions(fcfStr, impliedEarningsB * 0.9);
  let fcfNormalizedReason: 'none' | 'bank_ocf' | 'capex_cycle' | 'capex_compression' = 'none';
  let baseFcfBillion: number;

  if (overrides?.customBaseFcfBillion !== undefined && overrides.customBaseFcfBillion > 0) {
    baseFcfBillion = overrides.customBaseFcfBillion;
  } else if (isBankOnly) {
    // Pure banks have operating cash flow dominated by loan originations & Fed reserve/deposit swings
    fcfNormalizedReason = parsedFcf <= 0 || parsedFcf > impliedEarningsB * 1.25 ? 'bank_ocf' : 'none';
    baseFcfBillion = Math.max(0.05, Number((impliedEarningsB * 0.90).toFixed(2)));
  } else if (parsedFcf <= 0) {
    // Negative FCF (e.g., AI CapEx surge): normalize to recurring owner earnings proxy
    fcfNormalizedReason = 'capex_cycle';
    baseFcfBillion = Math.max(0.05, Number((impliedEarningsB * 0.85).toFixed(2)));
  } else if (
    (parsedFcf < impliedEarningsB * 0.42 && peTTM > 4 && peTTM < 50) ||
    (isCapitalIntensiveInfra && parsedFcf < impliedEarningsB * 0.65 && peTTM > 5 && peTTM < 40)
  ) {
    // Temporary heavy CapEx or regulated grid buildout suppressing FCF below normalized earnings power
    fcfNormalizedReason = 'capex_compression';
    baseFcfBillion = Number(Math.max(parsedFcf, impliedEarningsB * 0.78).toFixed(2));
  } else {
    baseFcfBillion = parsedFcf;
  }

  // Unlevered FCF adjustment for EV-based DCF so interest-paying leveraged balance sheets (REITs, utilities, industrials)
  // are not double-penalized by deducting both interest expense and full Net Debt in the EV-to-Equity bridge
  const interestAddBackB =
    overrides?.customBaseFcfBillion !== undefined
      ? 0
      : isBankOnly
      ? 0
      : debtBillion * (isCapitalIntensiveInfra ? 0.052 : 0.032);
  const unleveredDcfFcfBillion = Number((baseFcfBillion + interestAddBackB).toFixed(2));

  let businessModelCategory: MultiModelValuationResult['businessModelCategory'] = 'Secular Tech / Asset-Light';
  if (isFinancialInstitution) {
    businessModelCategory = 'Financial & Banking';
  } else if (sector.includes('Healthcare') || sector.includes('Health Care')) {
    businessModelCategory = 'Defensive Quality / Healthcare';
  } else if (sector.includes('Consumer')) {
    businessModelCategory = 'Consumer & Retail';
  } else if (sector.includes('Industrial') || sector.includes('Materials') || sector.includes('Energy') || sector.includes('Utilities')) {
    businessModelCategory = 'Industrial & Cyclical';
  }

  return {
    currentPrice,
    parsedCap,
    sharesBillion,
    rawFcfBillion: parsedFcf,
    baseFcfBillion,
    unleveredDcfFcfBillion,
    fcfNormalizedReason,
    cashBillion,
    debtBillion,
    baseCagr,
    roic,
    peTTM,
    forwardPE,
    isBankOnly,
    isFinancialInstitution,
    isCapitalIntensiveInfra,
    isReit,
    businessModelCategory,
  };
}

/**
 * Calculates bottom-up multi-model valuation with 3 scenarios and EV-to-Equity balance sheet bridge.
 */
export function calculateMultiModelValuation(
  stock: ResearchStock,
  livePrice?: number,
  overrides?: ValuationOverrides
): MultiModelValuationResult {
  const inputs = extractFinancialInputs(stock, livePrice, overrides);

  // WACC & Model Tuning
  const baseWacc = overrides?.discountRateWACC !== undefined ? overrides.discountRateWACC : 8.5;
  const baseGrowth = overrides?.fcfGrowthRate !== undefined ? overrides.fcfGrowthRate : inputs.baseCagr;
  
  // Terminal multiple: calibrated to MOAT/ROIC & growth, anchored against extreme re-rating inflation on low-multiple value stocks
  const roicBaseMult = inputs.roic >= 30 ? 28 : inputs.roic >= 20 ? 22 : 17;
  const growthCapMult = baseGrowth >= 16 ? 30 : baseGrowth >= 12 ? 24 : baseGrowth >= 9 ? 19 : 15;
  const unanchoredTerminalMultiple = Math.round(roicBaseMult * 0.45 + growthCapMult * 0.55);
  const currentEvB = inputs.isBankOnly
    ? inputs.parsedCap
    : Math.max(0.5, inputs.parsedCap + (inputs.debtBillion - inputs.cashBillion));
  const currentEvCashMult = inputs.unleveredDcfFcfBillion > 0 ? currentEvB / inputs.unleveredDcfFcfBillion : unanchoredTerminalMultiple;
  const defaultTerminalMultiple = inputs.isCapitalIntensiveInfra
    ? Math.max(19, Math.round(currentEvCashMult * 0.96))
    : Math.min(unanchoredTerminalMultiple, Math.max(18, Math.round(currentEvCashMult * 1.38)));
  const baseTerminalMultiple = overrides?.terminalMultiple !== undefined ? overrides.terminalMultiple : defaultTerminalMultiple;

  // Helper: Run DCF for a specific growth, multiple and WACC
  const runDcfEngine = (growth: number, terminalMult: number, wacc: number) => {
    let projectedFcf = inputs.unleveredDcfFcfBillion;
    let sumPvFcf = 0;

    for (let yr = 1; yr <= 5; yr++) {
      // Fade growth slightly in outer years
      const annualGrowth = yr > 3 ? growth * 0.9 : growth;
      projectedFcf = projectedFcf * (1 + annualGrowth / 100);
      const pv = projectedFcf / Math.pow(1 + wacc / 100, yr);
      sumPvFcf += pv;
    }

    // Terminal Value
    let terminalValue = projectedFcf * terminalMult;
    if (overrides?.terminalMethod === 'gordon') {
      const g = overrides.perpetualGrowthRate || 2.5;
      const safeSpread = Math.max(0.008, (wacc - g) / 100);
      terminalValue = (projectedFcf * (1 + g / 100)) / safeSpread;
    }

    const pvTerminalValue = terminalValue / Math.pow(1 + wacc / 100, 5);
    const enterpriseValue = sumPvFcf + pvTerminalValue;

    // EV TO EQUITY BRIDGE (Exclude non-distributable bank Fed reserve cash / deposit liabilities on pure banks)
    const netCash = inputs.isBankOnly && overrides?.cashBillion === undefined && overrides?.debtBillion === undefined
      ? 0
      : inputs.cashBillion - inputs.debtBillion;
    const equityValue = enterpriseValue + netCash;
    const perShare = Math.max(1, equityValue / inputs.sharesBillion);

    return {
      enterpriseValue,
      sumPvFcf,
      pvTerminalValue,
      netCash,
      equityValue,
      perShare: Number(perShare.toFixed(2)),
    };
  };

  // 1. BASE DCF
  const baseDcf = runDcfEngine(baseGrowth, baseTerminalMultiple, baseWacc);

  // 2. MODEL 2: Normalized Historical Multiples Model
  // Evaluates intrinsic value based on normalized FCF per share and forward earnings power
  const fcfPerShare = inputs.baseFcfBillion / inputs.sharesBillion;
  const epsEst = inputs.currentPrice / Math.max(5, inputs.forwardPE);
  const rawNormPFcf = Math.round(((inputs.roic >= 28 ? 26 : inputs.roic >= 18 ? 21 : 16) * 0.45) + (growthCapMult * 0.55));
  const rawTargetPe = Math.round(((inputs.roic >= 28 ? 25 : inputs.roic >= 18 ? 20 : 15) * 0.45) + ((growthCapMult - 1) * 0.55));
  const normalizedP_FCF = Math.min(rawNormPFcf, Math.max(17, Math.round(inputs.peTTM * 1.38)));
  const targetPE = Math.min(rawTargetPe, Math.max(16, Math.round(inputs.peTTM * 1.35)));
  const multiplesPerShare = Number(((fcfPerShare * normalizedP_FCF * 0.55) + (epsEst * targetPE * 0.45)).toFixed(2));

  // 3. MODEL 3: Fundamental ROIC Reinvestment & Economic Value Added (EVA) Model
  // Intrinsic Value based on economic spread (ROIC - WACC) & sustainable reinvestment runway
  const reinvestmentRate = Math.min(0.85, Math.max(0.20, (baseGrowth / Math.max(1, inputs.roic))));
  const sustainableGrowth = reinvestmentRate * inputs.roic;
  const spread = Math.max(1, inputs.roic - baseWacc);
  const evaMultiplier = 1 + (spread / baseWacc) * reinvestmentRate * 2.2;
  const investedCapitalPerShare = (inputs.currentPrice * 0.45);
  const reinvestmentPerShare = Number((investedCapitalPerShare * Math.max(1.2, evaMultiplier)).toFixed(2));

  // MODEL WEIGHTS
  let weights = { dcf: 0.50, multiples: 0.30, reinvestment: 0.20 };
  if (inputs.isFinancialInstitution) {
    // Financials have banking balance sheets, DCF is weighted lower
    weights = { dcf: 0.25, multiples: 0.45, reinvestment: 0.30 };
  } else if (inputs.roic >= 30) {
    // Secular moat compounders
    weights = { dcf: 0.55, multiples: 0.25, reinvestment: 0.20 };
  }

  // BLENDED FAIR VALUE (BASE CASE)
  const blendedFairValue = Number(
    (baseDcf.perShare * weights.dcf + multiplesPerShare * weights.multiples + reinvestmentPerShare * weights.reinvestment).toFixed(2)
  );

  // SCENARIO 1: BEAR CASE (Conservative / Recessionary / Multiple Compression)
  const bearGrowth = Math.max(2, baseGrowth * 0.65);
  const bearTerminalMultiple = Math.max(10, baseTerminalMultiple * 0.78);
  const bearWacc = baseWacc + 1.25;
  const bearDcf = runDcfEngine(bearGrowth, bearTerminalMultiple, bearWacc);
  const bearMultiples = multiplesPerShare * 0.80;
  const bearReinvestment = reinvestmentPerShare * 0.82;
  const bearFairValue = Number(
    (bearDcf.perShare * weights.dcf + bearMultiples * weights.multiples + bearReinvestment * weights.reinvestment).toFixed(2)
  );

  // SCENARIO 3: BULL CASE (Secular Moat Expansion / Reinvestment Acceleration)
  const bullGrowth = baseGrowth * 1.25;
  const bullTerminalMultiple = baseTerminalMultiple * 1.18;
  const bullWacc = Math.max(6.5, baseWacc - 0.75);
  const bullDcf = runDcfEngine(bullGrowth, bullTerminalMultiple, bullWacc);
  const bullMultiples = multiplesPerShare * 1.20;
  const bullReinvestment = reinvestmentPerShare * 1.22;
  const bullFairValue = Number(
    (bullDcf.perShare * weights.dcf + bullMultiples * weights.multiples + bullReinvestment * weights.reinvestment).toFixed(2)
  );

  // MARGIN OF SAFETY & BUY ZONES
  // Institutional rule: Buy zone enters at or below the Bear case (or Base * 0.85, whichever is safer)
  const mosPct = overrides?.marginOfSafetyPct !== undefined ? overrides.marginOfSafetyPct : 15;
  const buyZoneThreshold = Math.round(Math.min(bearFairValue * 1.05, blendedFairValue * (1 - mosPct / 100)));
  const watchZoneUpper = Math.round(blendedFairValue * 1.08);
  const expensiveZoneThreshold = Math.round(Math.max(bullFairValue * 0.95, blendedFairValue * 1.22));

  // Upside / Downside metrics
  const upsideToBasePercent = Number((((blendedFairValue - inputs.currentPrice) / inputs.currentPrice) * 100).toFixed(1));
  const upsideToBullPercent = Number((((bullFairValue - inputs.currentPrice) / inputs.currentPrice) * 100).toFixed(1));
  const downsideToBearPercent = Number((((bearFairValue - inputs.currentPrice) / inputs.currentPrice) * 100).toFixed(1));
  
  const potentialGain = Math.max(0.1, bullFairValue - inputs.currentPrice);
  const potentialLoss = Math.max(0.1, inputs.currentPrice - bearFairValue);
  const asymmetryRatio = Number((potentialGain / potentialLoss).toFixed(2));

  // Valuation Status Determination
  let valuationZone: MultiModelValuationResult['valuationZone'] = 'Fair Value Range';
  let valuationZoneHe: MultiModelValuationResult['valuationZoneHe'] = 'טווח שווי הוגן';

  if (inputs.currentPrice <= buyZoneThreshold * 0.90) {
    valuationZone = 'Deep Value (Strong Buy)';
    valuationZoneHe = 'ערך עמוק (קנייה חזקה)';
  } else if (inputs.currentPrice <= buyZoneThreshold) {
    valuationZone = 'Buy Zone';
    valuationZoneHe = 'אזור קנייה מוסדי';
  } else if (inputs.currentPrice <= watchZoneUpper) {
    valuationZone = 'Fair Value Range';
    valuationZoneHe = 'טווח שווי הוגן';
  } else if (inputs.currentPrice <= expensiveZoneThreshold) {
    valuationZone = 'Fully Valued';
    valuationZoneHe = 'מתומחר במלואו';
  } else {
    valuationZone = 'Overvalued';
    valuationZoneHe = 'תמחור יתר / יקר';
  }

  // EV-to-Equity Bridge Object
  const evBridge: EvToEquityBridge = {
    presentValueOfFcf5Y: Number(baseDcf.sumPvFcf.toFixed(2)),
    presentValueOfTerminalValue: Number(baseDcf.pvTerminalValue.toFixed(2)),
    enterpriseValue: Number(baseDcf.enterpriseValue.toFixed(2)),
    cashAndShortTermInvestments: Number(inputs.cashBillion.toFixed(2)),
    totalDebt: Number(inputs.debtBillion.toFixed(2)),
    netCash: Number(baseDcf.netCash.toFixed(2)),
    equityValue: Number(baseDcf.equityValue.toFixed(2)),
    sharesOutstanding: Number(inputs.sharesBillion.toFixed(3)),
    netCashPerShare: Number((baseDcf.netCash / inputs.sharesBillion).toFixed(2)),
  };

  const bearScenario: ScenarioResult = {
    scenario: 'bear',
    nameHe: 'תרחיש שמרני (Bear / Margin of Safety)',
    nameEn: 'Conservative / Recessionary Bear Case',
    fairValue: bearFairValue,
    fcfGrowthRate: Number(bearGrowth.toFixed(1)),
    terminalMultiple: Number(bearTerminalMultiple.toFixed(1)),
    discountRateWACC: Number(bearWacc.toFixed(2)),
    impliedMultiple: Number((bearFairValue / (fcfPerShare || 1)).toFixed(1)),
    descriptionHe: `האטת קצב צמיחה ל-${bearGrowth.toFixed(1)}%, כיווץ מכפילים ל-${bearTerminalMultiple.toFixed(1)}x, ופרמיית סיכון מוגברת (${bearWacc.toFixed(2)}% WACC). מייצג מרווח ביטחון קשיח להגנה על ההון.`,
    descriptionEn: `Growth deceleration to ${bearGrowth.toFixed(1)}%, terminal compression to ${bearTerminalMultiple.toFixed(1)}x, and higher risk premium (${bearWacc.toFixed(2)}% WACC). Sets hard margin-of-safety capital preservation floor.`,
  };

  const baseScenario: ScenarioResult = {
    scenario: 'base',
    nameHe: 'תרחיש בסיס (Base / Midpoint)',
    nameEn: 'Disciplined Base Case Midpoint',
    fairValue: blendedFairValue,
    fcfGrowthRate: Number(baseGrowth.toFixed(1)),
    terminalMultiple: Number(baseTerminalMultiple.toFixed(1)),
    discountRateWACC: Number(baseWacc.toFixed(2)),
    impliedMultiple: Number((blendedFairValue / (fcfPerShare || 1)).toFixed(1)),
    descriptionHe: `צמיחה אורגנית עקבית של ${baseGrowth.toFixed(1)}% בהתאם ל-ROIC של ${inputs.roic.toFixed(1)}%, שימור מכפיל יציאה של ${baseTerminalMultiple.toFixed(1)}x, והתאמה מדויקת של מזומנים נטו (${evBridge.netCashPerShare >= 0 ? '+' : ''}$${evBridge.netCashPerShare} למניה).`,
    descriptionEn: `Fundamental organic growth of ${baseGrowth.toFixed(1)}% backed by ${inputs.roic.toFixed(1)}% ROIC, median exit multiple of ${baseTerminalMultiple.toFixed(1)}x, and precise net cash adjustment (${evBridge.netCashPerShare >= 0 ? '+' : ''}$${evBridge.netCashPerShare}/share).`,
  };

  const bullScenario: ScenarioResult = {
    scenario: 'bull',
    nameHe: 'תרחיש אופטימי (Bull / Moat Expansion)',
    nameEn: 'Optimistic / Moat Expansion Bull Case',
    fairValue: bullFairValue,
    fcfGrowthRate: Number(bullGrowth.toFixed(1)),
    terminalMultiple: Number(bullTerminalMultiple.toFixed(1)),
    discountRateWACC: Number(bullWacc.toFixed(2)),
    impliedMultiple: Number((bullFairValue / (fcfPerShare || 1)).toFixed(1)),
    descriptionHe: `האצת נתחי שוק, מינוף תפעולי המעלה את הצמיחה ל-${bullGrowth.toFixed(1)}%, התרחבות מכפיל ל-${bullTerminalMultiple.toFixed(1)}x, ועלות הון מופחתת (${bullWacc.toFixed(2)}%).`,
    descriptionEn: `Market share acceleration, operating leverage expanding growth to ${bullGrowth.toFixed(1)}%, multiple re-rating to ${bullTerminalMultiple.toFixed(1)}x, and optimal cost of capital (${bullWacc.toFixed(2)}%).`,
  };

  const fcfNormNoteHe =
    inputs.fcfNormalizedReason === 'bank_ocf'
      ? ` (הערה: במערכת הבנקאית/פיננסית תזרים ההפעלה מושפע משינויי הלוואות ופיקדונות ולכן המודל מנרמל לרווח תזרימי מייצג של $${inputs.baseFcfBillion}B במקום ${inputs.rawFcfBillion}B).`
      : inputs.fcfNormalizedReason === 'capex_cycle' || inputs.fcfNormalizedReason === 'capex_compression'
      ? ` (הערה: השקעות הון חריגות CapEx מקטינות זמנית את ה-FCF המדווח ל-${inputs.rawFcfBillion}B — המודל משתמש ב-Owner Earnings מנורמל של $${inputs.baseFcfBillion}B).`
      : '';
  const fcfNormNoteEn =
    inputs.fcfNormalizedReason === 'bank_ocf'
      ? ` (Note: Banking OCF reflects loan/deposit swings; normalized to recurring earnings proxy of $${inputs.baseFcfBillion}B vs raw $${inputs.rawFcfBillion}B).`
      : inputs.fcfNormalizedReason === 'capex_cycle' || inputs.fcfNormalizedReason === 'capex_compression'
      ? ` (Note: Elevated CapEx temporarily compresses reported FCF to $${inputs.rawFcfBillion}B; model normalizes to Owner Earnings of $${inputs.baseFcfBillion}B).`
      : '';

  const notesHe = `שווי הוגן משוקלל (Multi-Model): ${(weights.dcf * 100).toFixed(0)}% מודל DCF תזרימי ($${baseDcf.perShare}), ${(weights.multiples * 100).toFixed(0)}% מכפילים היסטוריים מנורמלים ($${multiplesPerShare}), ו-${(weights.reinvestment * 100).toFixed(0)}% מודל החזר הון ו-ROIC ($${reinvestmentPerShare}). שווי הון עצמי כולל התאמת מאזן של ${evBridge.netCashPerShare >= 0 ? 'עודף מזומנים של +' : 'חוב נטו של -'}$${Math.abs(evBridge.netCashPerShare)} למניה.${fcfNormNoteHe}`;
  const notesEn = `Blended Fair Value: ${(weights.dcf * 100).toFixed(0)}% DCF ($${baseDcf.perShare}), ${(weights.multiples * 100).toFixed(0)}% Normalized Multiples ($${multiplesPerShare}), and ${(weights.reinvestment * 100).toFixed(0)}% Capital Allocation/ROIC ($${reinvestmentPerShare}). Equity bridge adds ${evBridge.netCashPerShare >= 0 ? 'net cash of +' : 'net debt of -'}$${Math.abs(evBridge.netCashPerShare)} per share.${fcfNormNoteEn}`;

  return {
    ticker: stock.ticker,
    currentPrice: inputs.currentPrice,
    dcfPerShare: baseDcf.perShare,
    multiplesPerShare,
    reinvestmentPerShare,
    weights,
    blendedFairValue,
    bearScenario,
    baseScenario,
    bullScenario,
    buyZoneThreshold,
    watchZoneUpper,
    expensiveZoneThreshold,
    upsideToBasePercent,
    upsideToBullPercent,
    downsideToBearPercent,
    asymmetryRatio,
    marginOfSafetyPercent: mosPct,
    valuationZone,
    valuationZoneHe,
    evBridge,
    businessModelCategory: inputs.businessModelCategory,
    isFinancialInstitution: inputs.isFinancialInstitution,
    notesHe,
    notesEn,
  };
}
