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
  const currentPrice = livePrice && livePrice > 0 
    ? livePrice 
    : (!isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 100);

  const parseToBillions = (raw: string, fallback: number): number => {
    const m = (raw || '').match(/([0-9]+(?:\.[0-9]+)?)\s*([TBMK])?/i);
    if (!m) return fallback;
    const val = parseFloat(m[1]);
    if (isNaN(val)) return fallback;
    const unit = (m[2] || 'B').toUpperCase();
    if (unit === 'T') return val * 1000;
    if (unit === 'M') return val / 1000;
    if (unit === 'K') return val / 1_000_000;
    return val;
  };

  // 2. Shares Outstanding (Billions)
  const parsedCap = parseToBillions(stock.marketCap || '', 250);
  const autoShares = Math.max(0.01, parsedCap / currentPrice);
  const sharesBillion = overrides?.sharesBillion !== undefined && overrides.sharesBillion > 0 
    ? overrides.sharesBillion 
    : autoShares;

  // 3. FCF TTM (Billions)
  const fcfStr = stock.financialQuality?.fcfTTM?.value || '';
  const parsedFcf = parseToBillions(fcfStr, sharesBillion * currentPrice * 0.042);
  const baseFcfBillion = overrides?.customBaseFcfBillion !== undefined && overrides.customBaseFcfBillion > 0
    ? overrides.customBaseFcfBillion
    : Math.max(0.05, parsedFcf);

  // 4. Cash and Equivalents (Billions)
  const cashStr = stock.financialQuality?.cashAndEquivalents?.value || '';
  const autoCash = parseToBillions(cashStr, sharesBillion * currentPrice * 0.06);
  const cashBillion = overrides?.cashBillion !== undefined ? overrides.cashBillion : autoCash;

  // 5. Total Debt (Billions)
  let autoDebt = sharesBillion * currentPrice * 0.08;
  const debtStr = stock.financialQuality?.netDebt?.value || '';
  const hasExplicitDebtNum = /([0-9]+(?:\.[0-9]+)?)\s*([TBMK])?/i.test(debtStr);
  if (debtStr.includes('Net Cash') || debtStr.startsWith('-$')) {
    // Net cash company: debt is lower than cash
    const netCashAmount = hasExplicitDebtNum ? parseToBillions(debtStr, autoCash * 0.5) : autoCash * 0.5;
    autoDebt = Math.max(0, autoCash - netCashAmount);
  } else if (hasExplicitDebtNum) {
    autoDebt = parseToBillions(debtStr, 0) + autoCash; // Net Debt + Cash = Total Debt
  }
  const debtBillion = overrides?.debtBillion !== undefined ? overrides.debtBillion : autoDebt;

  // 6. Growth & ROIC
  const cagrMatch = (stock.expected5YCAGRRange || stock.growth?.revenueCAGR5Y?.value || '').match(/([0-9.]+)/);
  const baseCagr = cagrMatch ? parseFloat(cagrMatch[1]) : 12.0;
  const roicMatch = (stock.financialQuality?.roicCurrent?.value || '').match(/([0-9.]+)/);
  const roic = roicMatch ? parseFloat(roicMatch[1]) : 18.0;

  // 7. Valuation Multiples (P/E, Forward P/E)
  const peStr = stock.valuation?.peTTM?.value || '';
  const peMatch = peStr.match(/([0-9.]+)/);
  const peTTM = peMatch ? parseFloat(peMatch[1]) : 24.0;
  const fwdPeStr = stock.valuation?.forwardPE?.value || '';
  const fwdPeMatch = fwdPeStr.match(/([0-9.]+)/);
  const forwardPE = fwdPeMatch ? parseFloat(fwdPeMatch[1]) : peTTM * 0.88;

  // 8. Sector / Model Category
  const sector = stock.sector || '';
  const isFinancialInstitution = sector.includes('Financial') || stock.ticker === 'JPM' || stock.ticker === 'GS' || stock.ticker === 'BRK.B' || stock.ticker === 'BAC' || stock.ticker === 'MS';

  let businessModelCategory: MultiModelValuationResult['businessModelCategory'] = 'Secular Tech / Asset-Light';
  if (isFinancialInstitution) {
    businessModelCategory = 'Financial & Banking';
  } else if (sector.includes('Healthcare')) {
    businessModelCategory = 'Defensive Quality / Healthcare';
  } else if (sector.includes('Consumer')) {
    businessModelCategory = 'Consumer & Retail';
  } else if (sector.includes('Industrial') || sector.includes('Materials') || sector.includes('Energy')) {
    businessModelCategory = 'Industrial & Cyclical';
  }

  return {
    currentPrice,
    sharesBillion,
    baseFcfBillion,
    cashBillion,
    debtBillion,
    baseCagr,
    roic,
    peTTM,
    forwardPE,
    isFinancialInstitution,
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
  
  // Terminal multiple: calibrated to moat & sector
  const defaultTerminalMultiple = inputs.roic >= 30 ? 28 : inputs.roic >= 20 ? 22 : 17;
  const baseTerminalMultiple = overrides?.terminalMultiple !== undefined ? overrides.terminalMultiple : defaultTerminalMultiple;

  // Helper: Run DCF for a specific growth, multiple and WACC
  const runDcfEngine = (growth: number, terminalMult: number, wacc: number) => {
    let projectedFcf = inputs.baseFcfBillion;
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

    // EV TO EQUITY BRIDGE (Add Net Cash / Subtract Net Debt)
    const netCash = inputs.cashBillion - inputs.debtBillion;
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
  const normalizedP_FCF = inputs.roic >= 28 ? 26 : inputs.roic >= 18 ? 21 : 16;
  const targetPE = inputs.roic >= 28 ? 25 : inputs.roic >= 18 ? 20 : 15;
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

  const notesHe = `שווי הוגן משוקלל (Multi-Model): ${(weights.dcf * 100).toFixed(0)}% מודל DCF תזרימי ($${baseDcf.perShare}), ${(weights.multiples * 100).toFixed(0)}% מכפילים היסטוריים מנורמלים ($${multiplesPerShare}), ו-${(weights.reinvestment * 100).toFixed(0)}% מודל החזר הון ו-ROIC ($${reinvestmentPerShare}). שווי הון עצמי כולל התאמת מאזן של ${evBridge.netCashPerShare >= 0 ? 'עודף מזומנים של +' : 'חוב נטו של -'}$${Math.abs(evBridge.netCashPerShare)} למניה.`;
  const notesEn = `Blended Fair Value: ${(weights.dcf * 100).toFixed(0)}% DCF ($${baseDcf.perShare}), ${(weights.multiples * 100).toFixed(0)}% Normalized Multiples ($${multiplesPerShare}), and ${(weights.reinvestment * 100).toFixed(0)}% Capital Allocation/ROIC ($${reinvestmentPerShare}). Equity bridge adds ${evBridge.netCashPerShare >= 0 ? 'net cash of +' : 'net debt of -'}$${Math.abs(evBridge.netCashPerShare)} per share.`;

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
