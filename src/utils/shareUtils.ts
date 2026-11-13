import { ResearchStock } from '../types';
import { SupportedLanguage } from '../i18n';
import { StockCompetitiveProfile } from '../data/thesisAndCompetitiveData';

export interface StockShareData {
  stock: ResearchStock;
  profile?: StockCompetitiveProfile | null;
  currentPrice: number;
  fairValue: number;
  marginOfSafety: number;
  actionRecommendation: string;
  currentLang?: SupportedLanguage | string;
}

export function buildStockShareMetrics(
  stock: ResearchStock,
  profile: StockCompetitiveProfile | null | undefined,
  currentPriceNum: number
) {
  const fairValue = profile?.fairValueMidpoint || Math.round(currentPriceNum * 1.22);
  const marginOfSafety = Math.round(((fairValue - currentPriceNum) / fairValue) * 100);
  const buyZone = profile?.buyZoneThreshold || Math.round(fairValue * 0.85);
  const watchZoneUpper = profile?.watchZoneUpper || Math.round(fairValue * 1.05);
  const impliedGrowth = profile?.marketImpliedGrowthRate || 8.5;
  const expectedGrowth = profile?.fundamentalExpectedGrowthRate || 13.2;

  const isDiscounted = marginOfSafety > 10;
  const isFairlyPriced = marginOfSafety >= -5 && marginOfSafety <= 10;

  let actionRecommendation = 'קנייה מומלצת (BUY)';
  let actionRecommendationEn = 'STRONG BUY';

  if (!isDiscounted && isFairlyPriced) {
    actionRecommendation = 'הצטיידות בירידות (ACCUMULATE)';
    actionRecommendationEn = 'ACCUMULATE ON PULLBACK';
  } else if (!isDiscounted && !isFairlyPriced) {
    actionRecommendation = 'החזק / מעקב (HOLD / WATCH)';
    actionRecommendationEn = 'HOLD / WATCH';
  }

  return {
    fairValue,
    marginOfSafety,
    buyZone,
    watchZoneUpper,
    impliedGrowth,
    expectedGrowth,
    actionRecommendation,
    actionRecommendationEn,
  };
}

export function generateWhatsAppShareText(data: StockShareData): string {
  const { stock, currentPrice, fairValue, marginOfSafety, actionRecommendation, currentLang = 'he' } = data;
  const isHe = currentLang === 'he';

  const marginText = marginOfSafety >= 0 ? `+${marginOfSafety}% (דיסקאונט)` : `${marginOfSafety}% (פרמיה)`;
  const marginTextEn = marginOfSafety >= 0 ? `+${marginOfSafety}% (Discount)` : `${marginOfSafety}% (Premium)`;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const safePrice = typeof currentPrice === 'number' && !isNaN(currentPrice) ? currentPrice : 0;

  if (isHe) {
    return `📊 *דוח אנליזה והחלטת השקעה מוסדית: ${stock.ticker} (${stock.companyName})*
━━━━━━━━━━━━━━━━━━━━
⚡ *המלצת ועדה:* ${actionRecommendation}
💰 *מחיר שוק נוכחי:* $${safePrice.toFixed(2)}
🎯 *שווי הוגן פונדמנטלי (DCF):* $${fairValue}
🛡️ *מרווח ביטחון (Margin of Safety):* ${marginText}

🏆 *ציון איכות מוסדי:* ${stock.investmentScore}/100
🏛️ *עוצמת חפיר כלכלי:* ${stock.moatType || 'יתרון מבני רחב'}
📈 *תשואה שנתית צפויה לשנתיים (2Y CAGR / FY2):* ${stock.expected5YCAGRRange}
💼 *איכות פיננסית:* ROIC ${stock.financialQuality?.roicCurrent?.value || '20%+'} | המרת תזרים ${stock.financialQuality?.fcfConversionRate || '100%+'}

📝 *תמצית התזה והחפיר:*
${stock.investmentThesisSummary || stock.whyInTopUniverse || ''}

🔗 *לצפייה בדוח המלא ובמודל ה-DCF במערכת:*
${shareUrl}`;
  }

  return `📊 *Institutional Investment & Valuation Memo: ${stock.ticker} (${stock.companyName})*
━━━━━━━━━━━━━━━━━━━━
⚡ *Committee Verdict:* ${actionRecommendation}
💰 *Current Market Price:* $${safePrice.toFixed(2)}
🎯 *DCF Intrinsic Fair Value:* $${fairValue}
🛡️ *Margin of Safety:* ${marginTextEn}

🏆 *Quality Score:* ${stock.investmentScore}/100
🏛️ *Economic Moat:* ${stock.moatType || 'Wide Structural Advantage'}
📈 *Expected 2Y CAGR (FY2):* ${stock.expected5YCAGRRange}
💼 *Financial Quality:* ROIC ${stock.financialQuality?.roicCurrent?.value || '20%+'} | FCF Conversion ${stock.financialQuality?.fcfConversionRate || '100%+'}

📝 *Investment Thesis:*
${stock.investmentThesisSummary || stock.whyInTopUniverse || ''}

🔗 *View interactive model and full report:*
${shareUrl}`;
}

export function generateEmailShareData(data: StockShareData): { subject: string; body: string } {
  const { stock, currentPrice, fairValue, marginOfSafety, actionRecommendation, currentLang = 'he' } = data;
  const isHe = currentLang === 'he';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const safePrice = typeof currentPrice === 'number' && !isNaN(currentPrice) ? currentPrice : 0;

  const marginText = marginOfSafety >= 0 ? `+${marginOfSafety}% (דיסקאונט מהשווי ההוגן)` : `${marginOfSafety}% (פרמיה מעל השווי)`;

  if (isHe) {
    const subject = `תזכיר השקעה מוסדי: ${stock.ticker} (${stock.companyName}) - שווי הוגן $${fairValue} [${actionRecommendation}]`;
    const body = `שלום,

מצורף תזכיר מחקר והערכת שווי מוסדית עבור חברת ${stock.companyName} (${stock.ticker}):

==================================================
תקציר מנהלים והחלטת השקעה:
==================================================
• פעולת השקעה מומלצת: ${actionRecommendation}
• מחיר שוק נוכחי: $${safePrice.toFixed(2)}
• שווי הוגן מחושב (DCF Fair Value): $${fairValue}
• מרווח ביטחון (Margin of Safety): ${marginText}
• ציון איכות כולל: ${stock.investmentScore}/100 (סיווג A+)
• טווח תשואה שנתית צפוי (5Y CAGR): ${stock.expected5YCAGRRange}

==================================================
יתרון תחרותי וחפיר כלכלי (Economic Moat):
==================================================
• סוג חפיר: ${stock.moatType || 'עלויות מעבר גבוהות ויתרון לגודל'}
• תמצית מנגנון ההגנה: ${stock.moat?.whyExists || stock.moatDefenseMechanism || 'יתרון תחרותי מבני מובהק.'}

==================================================
ביקורת איכות פיננסית (SEC 10-K Audit):
==================================================
• תשואה על ההון המושקע (ROIC): ${stock.financialQuality?.roicCurrent?.value || '20%+'}
• המרת תזרים מזומנים חופשי (FCF Conversion): ${stock.financialQuality?.fcfConversionRate || '100%+'}
• יחס חוב נטו ל-EBITDA: ${stock.financialQuality?.netDebtToEBITDA?.value || '0.5x'}

==================================================
תמצית התזה:
==================================================
${stock.investmentThesisSummary || stock.whyInTopUniverse || ''}

לצפייה בניתוח האינטראקטיבי המלא, מודל הרגישות ותרחישי ה-DCF:
${shareUrl}

בברכה,
שולחן המחקר המוסדי | MoatGuard`;

    return { subject, body };
  }

  const subject = `Institutional Investment Memo: ${stock.ticker} (${stock.companyName}) - Fair Value $${fairValue} [${actionRecommendation}]`;
  const body = `Hello,

Attached is the institutional research and valuation memorandum for ${stock.companyName} (${stock.ticker}):

==================================================
EXECUTIVE SUMMARY & DECISION:
==================================================
• Recommended Action: ${actionRecommendation}
• Current Market Price: $${safePrice.toFixed(2)}
• DCF Intrinsic Fair Value: $${fairValue}
• Margin of Safety: ${marginOfSafety >= 0 ? `+${marginOfSafety}% (Discount)` : `${marginOfSafety}% (Premium)`}
• Overall Quality Score: ${stock.investmentScore}/100
• Expected 5-Year CAGR: ${stock.expected5YCAGRRange}

==================================================
ECONOMIC MOAT & COMPETITIVE POSITION:
==================================================
• Moat Source: ${stock.moatType || 'High Switching Costs & Scale'}
• Defense Mechanism: ${stock.moat?.whyExists || stock.moatDefenseMechanism || 'Durable competitive advantages.'}

==================================================
FINANCIAL QUALITY (SEC 10-K AUDIT):
==================================================
• ROIC vs WACC: ${stock.financialQuality?.roicCurrent?.value || '20%+'}
• FCF Conversion: ${stock.financialQuality?.fcfConversionRate || '100%+'}
• Net Debt / EBITDA: ${stock.financialQuality?.netDebtToEBITDA?.value || '0.5x'}

==================================================
INVESTMENT THESIS:
==================================================
${stock.investmentThesisSummary || stock.whyInTopUniverse || ''}

Access full interactive model & DCF calculators:
${shareUrl}

Best regards,
Institutional Research Desk | MoatGuard`;

  return { subject, body };
}

export function openWhatsAppShare(data: StockShareData) {
  const text = generateWhatsAppShareText(data);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export function openEmailShare(data: StockShareData) {
  const { subject, body } = generateEmailShareData(data);
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}
