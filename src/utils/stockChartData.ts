export type TimeframeOption = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

export interface ChartDataPoint {
  timestamp: string;
  timeLabel: string;
  fullDate: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changeFromStart: number;
  changePctFromStart: number;
}

export interface ChartSeriesResult {
  timeframe: TimeframeOption;
  data: ChartDataPoint[];
  startPrice: number;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  totalChangeAmount: number;
  totalChangePercent: number;
  isPositive: boolean;
  volumeTotal: number;
  averageVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

// Pseudo-random deterministic seed generator based on ticker string
function seedRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Generates Google Finance-like realistic historical & live price series for any stock ticker & timeframe.
 */
export function generateStockChartSeries(
  ticker: string,
  baseCurrentPrice: number,
  timeframe: TimeframeOption,
  cagrEstimate: number = 15.0,
  liveTickPrice?: number
): ChartSeriesResult {
  const finalCurrentPrice = liveTickPrice !== undefined && liveTickPrice > 0 ? liveTickPrice : baseCurrentPrice;
  const rand = seedRandom(`${ticker}-${timeframe}-v2`);
  const data: ChartDataPoint[] = [];

  const now = new Date(2026, 7, 29, 15, 30, 0); // 2026-08-29
  let count = 60;
  let annualizedReturn = (cagrEstimate || 15) / 100;
  let volatility = 0.22; // annual volatility

  // Adjust annualized return and volatility based on ticker archetype
  const tUpper = ticker.toUpperCase();
  if (['NVDA', 'TSLA', 'PLTR', 'ARM', 'SMCI'].includes(tUpper)) {
    volatility = 0.38;
  } else if (['UNH', 'JNJ', 'PG', 'KO', 'PEP', 'BRK.B', 'MCD'].includes(tUpper)) {
    volatility = 0.14;
  } else if (['MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'TSM', 'V', 'MA'].includes(tUpper)) {
    volatility = 0.24;
  }

  // Calculate start price backwards based on timeframe return
  let durationYears = 1;
  switch (timeframe) {
    case '1D':
      count = 78; // 5-minute bars from 9:30 AM to 4:00 PM
      durationYears = 1 / 252;
      break;
    case '5D':
      count = 40; // ~8 points per day
      durationYears = 5 / 252;
      break;
    case '1M':
      count = 30; // daily
      durationYears = 1 / 12;
      break;
    case '6M':
      count = 50;
      durationYears = 0.5;
      break;
    case 'YTD':
      count = 45; // ~8 months of 2026
      durationYears = 8 / 12;
      break;
    case '1Y':
      count = 52; // weekly
      durationYears = 1.0;
      break;
    case '5Y':
      count = 60; // monthly
      durationYears = 5.0;
      break;
    case 'MAX':
      count = 100;
      durationYears = 10.0;
      break;
  }

  // Calculate realistic cumulative return for this period
  // For 1D, daily noise between -2.5% and +3.5%
  let expectedTotalDrift = 0;
  if (timeframe === '1D') {
    const dailyDrift = (rand() * 4.2 - 1.8) / 100; // -1.8% to +2.4%
    expectedTotalDrift = dailyDrift;
  } else if (timeframe === '5D') {
    expectedTotalDrift = (rand() * 6.0 - 2.5) / 100;
  } else if (timeframe === '1M') {
    expectedTotalDrift = (rand() * 9.0 - 3.0) / 100;
  } else {
    // Multi-month/year geometric growth
    expectedTotalDrift = Math.pow(1 + annualizedReturn, durationYears) - 1 + (rand() * 0.15 - 0.07);
  }

  // Start price before the period
  const startPriceEstimated = finalCurrentPrice / (1 + expectedTotalDrift);
  const startPrice = Math.max(1, startPriceEstimated);

  // Generate intermediate random walk matching start and end price
  const rawPrices: number[] = [startPrice];
  const stepVol = volatility * Math.sqrt(durationYears / count);

  for (let i = 1; i < count - 1; i++) {
    const progress = i / count;
    // Geometric Brownian Motion with bridge constraint to target final price
    const deterministicTarget = startPrice + (finalCurrentPrice - startPrice) * progress;
    const randomShock = (rand() + rand() + rand() - 1.5) * stepVol * startPrice;
    const price = Math.max(1, deterministicTarget + randomShock);
    rawPrices.push(price);
  }
  rawPrices.push(finalCurrentPrice);

  // Format labels and dates
  let highPrice = -Infinity;
  let lowPrice = Infinity;
  let totalVolume = 0;

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const p = rawPrices[i];
    if (p > highPrice) highPrice = p;
    if (p < lowPrice) lowPrice = p;

    let timeLabel = '';
    let fullDate = '';
    let pointTime = new Date(now.getTime());

    if (timeframe === '1D') {
      // 9:30 AM to 4:00 PM
      const totalMinutes = 390; // 6.5 hours
      const minuteOffset = Math.round(progress * totalMinutes);
      pointTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30 + minuteOffset, 0);
      const hours = pointTime.getHours().toString().padStart(2, '0');
      const mins = pointTime.getMinutes().toString().padStart(2, '0');
      timeLabel = `${hours}:${mins}`;
      fullDate = `${pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${timeLabel} EDT`;
    } else if (timeframe === '5D') {
      const dayOffset = Math.floor(progress * 5);
      pointTime = new Date(now.getTime() - (4 - dayOffset) * 24 * 60 * 60 * 1000);
      timeLabel = pointTime.toLocaleDateString('en-US', { weekday: 'short' });
      fullDate = pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (timeframe === '1M' || timeframe === '6M' || timeframe === 'YTD') {
      const daysTotal = durationYears * 365;
      const dayOffset = Math.round((1 - progress) * daysTotal);
      pointTime = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      timeLabel = pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      fullDate = pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      // 1Y, 5Y, MAX
      const daysTotal = durationYears * 365;
      const dayOffset = Math.round((1 - progress) * daysTotal);
      pointTime = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      timeLabel = pointTime.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      fullDate = pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const changeFromStart = p - startPrice;
    const changePctFromStart = (changeFromStart / startPrice) * 100;
    const vol = Math.floor(150000 + rand() * 850000);
    totalVolume += vol;

    data.push({
      timestamp: pointTime.toISOString(),
      timeLabel,
      fullDate,
      price: Number(p.toFixed(2)),
      open: Number((p * (1 - (rand() * 0.004 - 0.002))).toFixed(2)),
      high: Number((p * (1 + rand() * 0.005)).toFixed(2)),
      low: Number((p * (1 - rand() * 0.005)).toFixed(2)),
      close: Number(p.toFixed(2)),
      volume: vol,
      changeFromStart: Number(changeFromStart.toFixed(2)),
      changePctFromStart: Number(changePctFromStart.toFixed(2)),
    });
  }

  const totalChangeAmount = finalCurrentPrice - startPrice;
  const totalChangePercent = (totalChangeAmount / startPrice) * 100;
  const isPositive = totalChangeAmount >= 0;

  // 52-week statistics calculation
  const fiftyTwoWeekHigh = Number(Math.max(highPrice, finalCurrentPrice * 1.14).toFixed(2));
  const fiftyTwoWeekLow = Number(Math.min(lowPrice, finalCurrentPrice * 0.76).toFixed(2));

  return {
    timeframe,
    data,
    startPrice: Number(startPrice.toFixed(2)),
    currentPrice: Number(finalCurrentPrice.toFixed(2)),
    highPrice: Number(highPrice.toFixed(2)),
    lowPrice: Number(lowPrice.toFixed(2)),
    totalChangeAmount: Number(totalChangeAmount.toFixed(2)),
    totalChangePercent: Number(totalChangePercent.toFixed(2)),
    isPositive,
    volumeTotal: totalVolume,
    averageVolume: Math.floor(totalVolume / count),
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  };
}
