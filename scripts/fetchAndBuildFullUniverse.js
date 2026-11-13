import https from 'https';
import fs from 'fs';
import path from 'path';

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Sector translations
const SECTOR_TRANSLATIONS = {
  'Information Technology': { en: 'Technology', he: 'טכנולוגיה ותוכנה', exchange: 'NASDAQ' },
  'Technology': { en: 'Technology', he: 'טכנולוגיה ותוכנה', exchange: 'NASDAQ' },
  'Health Care': { en: 'Healthcare', he: 'בריאות, פארמה ומכשור רפואי', exchange: 'NYSE' },
  'Healthcare': { en: 'Healthcare', he: 'בריאות, פארמה ומכשור רפואי', exchange: 'NYSE' },
  'Financials': { en: 'Financials', he: 'פיננסים, בנקאות וביטוח', exchange: 'NYSE' },
  'Consumer Discretionary': { en: 'Consumer Discretionary', he: 'צריכה מחזורית ומסחר', exchange: 'NYSE' },
  'Communication Services': { en: 'Communication Services', he: 'שירותי תקשורת ומדיה', exchange: 'NASDAQ' },
  'Industrials': { en: 'Industrials', he: 'תעשייה, תעופה ותשתיות', exchange: 'NYSE' },
  'Consumer Staples': { en: 'Consumer Staples', he: 'צריכה בסיסית ומזון', exchange: 'NYSE' },
  'Energy': { en: 'Energy', he: 'אנרגיה, נפט וגז', exchange: 'NYSE' },
  'Utilities': { en: 'Utilities', he: 'תשתיות אנרגיה וחשמל', exchange: 'NYSE' },
  'Materials': { en: 'Materials', he: 'חומרי גלם וכימיקלים', exchange: 'NYSE' },
  'Real Estate': { en: 'Real Estate', he: 'נדל"ן וקרנות ריט (REIT)', exchange: 'NYSE' }
};

const NASDAQ_100_TICKERS = new Set([
  'AAPL', 'ABNB', 'ADBE', 'ADI', 'ADP', 'ADSK', 'AEP', 'AMAT', 'AMD', 'AMGN', 'AMZN', 'ANSS', 
  'ARM', 'ASML', 'AVGO', 'AZN', 'BIIB', 'BKNG', 'BKR', 'CCEP', 'CDNS', 'CDW', 'CEG', 'CHTR', 
  'CPRT', 'CRWD', 'CSCO', 'CSGP', 'CSX', 'CTAS', 'CTSH', 'DASH', 'DDOG', 'DLTR', 'DXCM', 'EA', 
  'EXC', 'FANG', 'FAST', 'FTNT', 'GEHC', 'GFS', 'GILD', 'GOOG', 'GOOGL', 'HON', 'IDXX', 'ILMN', 
  'INTC', 'INTU', 'ISRG', 'KDP', 'KHC', 'KLAC', 'LIN', 'LRCX', 'LULU', 'MAR', 'MCHP', 'MDB', 
  'MDLZ', 'MELI', 'META', 'MNST', 'MRNA', 'MRVL', 'MSFT', 'MU', 'NFLX', 'NVDA', 'NXPI', 'ODFL', 
  'ON', 'ORLY', 'PANW', 'PAYX', 'PCAR', 'PDD', 'PEP', 'PYPL', 'QCOM', 'REGN', 'ROP', 'ROST', 
  'SBUX', 'SHOP', 'SMCI', 'SNPS', 'SNOW', 'SPLK', 'SPOT', 'TEAM', 'TMUS', 'TSLA', 'TTD', 'TTWO', 
  'TXN', 'VRSK', 'VRTX', 'WBD', 'WDAY', 'XEL', 'ZS'
]);

const MEGA_CAP_TICKERS = new Set([
  'NVDA', 'MSFT', 'AAPL', 'AMZN', 'GOOGL', 'GOOG', 'META', 'AVGO', 'TSLA', 'BRK.B', 'BRK.A', 'LLY', 'JPM', 'V', 'WMT', 'MA', 'XOM', 'TSM', 'ASML'
]);

const DIVIDEND_COMPOUNDER_TICKERS = new Set([
  'PG', 'KO', 'PEP', 'JNJ', 'ABBV', 'MCD', 'SPGI', 'CAT', 'LMT', 'NEE', 'LIN', 'O', 'LOW', 'CL', 'TXN', 'CSCO', 'IBM', 'CB', 'CME', 'GWW', 'CVX', 'DUK', 'SO', 'APD', 'ECL', 'SHW', 'ABT'
]);

async function run() {
  console.log('Fetching S&P 500 list from Wikipedia...');
  const html = await getUrl('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies');
  
  const idx = html.indexOf('id="constituents"');
  const endIdx = html.indexOf('</tbody>', idx);
  const tbody = html.substring(idx, endIdx);
  const rows = tbody.split('<tr').slice(2);
  
  const sp500Parsed = [];
  for (const r of rows) {
    const tds = r.split('<td').slice(1).map(td => {
      // Remove any tags, trim, replace HTML entities
      return td.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
    });
    if (tds.length >= 3) {
      let rawTicker = tds[0];
      // strip any mw attributes if present
      if (rawTicker.includes('>')) {
        rawTicker = rawTicker.split('>').pop().trim();
      }
      let rawName = tds[1];
      if (rawName.includes('>')) {
        rawName = rawName.split('>').pop().trim();
      }
      let rawSector = tds[2];
      if (rawSector.includes('>')) {
        rawSector = rawSector.split('>').pop().trim();
      }
      let subIndustry = tds[3] || '';
      if (subIndustry.includes('>')) {
        subIndustry = subIndustry.split('>').pop().trim();
      }

      if (rawTicker && rawName && rawSector) {
        sp500Parsed.push({
          ticker: rawTicker,
          name: rawName,
          sector: rawSector,
          subIndustry
        });
      }
    }
  }

  console.log(`Parsed ${sp500Parsed.length} S&P 500 stocks from Wikipedia.`);

  // Read existing 76 catalog items from marketUniverseData.ts to preserve handcrafted moats and details
  const existingPath = path.resolve('src/data/marketUniverseData.ts');
  let existingContent = fs.readFileSync(existingPath, 'utf8');
  
  // Extract array between export const MARKET_UNIVERSE_CATALOG: MarketScreenerStock[] = [ ... ];
  const match = existingContent.match(/export const MARKET_UNIVERSE_CATALOG: MarketScreenerStock\[\] = (\[[\s\S]*?\]);/);
  let existingItems = [];
  if (match) {
    try {
      existingItems = eval(match[1]);
      console.log(`Preserved ${existingItems.length} handcrafted catalog items.`);
    } catch (e) {
      console.warn('Could not eval existing items:', e);
    }
  }

  const existingMap = new Map();
  existingItems.forEach(item => {
    existingMap.set(item.ticker, item);
  });

  const fullCatalog = [];
  const processedTickers = new Set();

  // 1. Add/merge all S&P 500 stocks
  for (const s of sp500Parsed) {
    processedTickers.add(s.ticker);
    if (existingMap.has(s.ticker)) {
      const ex = existingMap.get(s.ticker);
      // Ensure indexCategory is set
      if (!ex.indexCategory) {
        if (MEGA_CAP_TICKERS.has(s.ticker)) ex.indexCategory = 'MEGA_CAP';
        else if (NASDAQ_100_TICKERS.has(s.ticker)) ex.indexCategory = 'NASDAQ100';
        else if (DIVIDEND_COMPOUNDER_TICKERS.has(s.ticker)) ex.indexCategory = 'DIVIDEND_COMPOUNDER';
        else ex.indexCategory = 'SP500';
      }
      fullCatalog.push(ex);
    } else {
      // Create fresh structured record
      const secInfo = SECTOR_TRANSLATIONS[s.sector] || { en: s.sector, he: s.sector, exchange: 'NYSE' };
      const isNasdaq = NASDAQ_100_TICKERS.has(s.ticker) || secInfo.en === 'Technology';
      const exchange = isNasdaq ? 'NASDAQ' : 'NYSE';
      
      let indexCategory = 'SP500';
      if (MEGA_CAP_TICKERS.has(s.ticker)) indexCategory = 'MEGA_CAP';
      else if (NASDAQ_100_TICKERS.has(s.ticker)) indexCategory = 'NASDAQ100';
      else if (DIVIDEND_COMPOUNDER_TICKERS.has(s.ticker)) indexCategory = 'DIVIDEND_COMPOUNDER';

      // Estimate baseline metrics based on sector
      let basePe = 21.0;
      let baseRoic = 16.5;
      let baseFcfYield = 4.2;
      let baseDivYield = 1.6;
      let baseCagr = '9.5%';
      let baseScore = 86;

      if (secInfo.en === 'Technology') {
        basePe = 28.5;
        baseRoic = 24.0;
        baseFcfYield = 3.6;
        baseDivYield = 0.5;
        baseCagr = '14.0%';
        baseScore = 89;
      } else if (secInfo.en === 'Healthcare') {
        basePe = 22.0;
        baseRoic = 17.5;
        baseFcfYield = 4.8;
        baseDivYield = 1.8;
        baseCagr = '9.8%';
        baseScore = 88;
      } else if (secInfo.en === 'Financials') {
        basePe = 13.8;
        baseRoic = 14.0;
        baseFcfYield = 6.2;
        baseDivYield = 2.4;
        baseCagr = '8.5%';
        baseScore = 87;
      } else if (secInfo.en === 'Utilities') {
        basePe = 18.5;
        baseRoic = 8.8;
        baseFcfYield = 4.2;
        baseDivYield = 3.4;
        baseCagr = '6.2%';
        baseScore = 85;
      } else if (secInfo.en === 'Energy') {
        basePe = 13.0;
        baseRoic = 17.5;
        baseFcfYield = 7.0;
        baseDivYield = 3.2;
        baseCagr = '9.0%';
        baseScore = 85;
      } else if (secInfo.en === 'Consumer Staples') {
        basePe = 22.5;
        baseRoic = 22.0;
        baseFcfYield = 4.6;
        baseDivYield = 2.6;
        baseCagr = '7.0%';
        baseScore = 89;
      }

      const item = {
        ticker: s.ticker,
        name: s.name,
        nameHe: s.name, // Will fallback gracefully
        exchange: exchange,
        sector: secInfo.en,
        sectorHe: secInfo.he,
        marketCap: '$35B+',
        pe: basePe,
        roic: baseRoic,
        fcfYield: baseFcfYield,
        divYield: baseDivYield,
        cagr5y: baseCagr,
        score: baseScore,
        moat: `${s.subIndustry || s.sector} Market Leadership & Brand Scale`,
        moatHe: `מובילות שוק ומותג בתחום ${s.subIndustry || secInfo.he}`,
        descriptionHe: `חברה בולטת במדד S&P 500 הפועלת בתחום ${s.subIndustry || secInfo.he} עם נתח שוק מבוסס.`,
        indexCategory
      };
      fullCatalog.push(item);
    }
  }

  // 2. Add any existing items that were not in Wikipedia S&P 500 (e.g. TSM, ASML, ARM, CELH, NVMI, etc.)
  for (const [ticker, item] of existingMap.entries()) {
    if (!processedTickers.has(ticker)) {
      fullCatalog.push(item);
      processedTickers.add(ticker);
    }
  }

  // 3. Add any top Nasdaq 100 components not yet processed
  const extraNasdaq = [
    { ticker: 'ARM', name: 'Arm Holdings plc', nameHe: 'ארם הולדינגס', sector: 'Technology', sectorHe: 'טכנולוגיה ותוכנה', exchange: 'NASDAQ', marketCap: '$140B', pe: 65.0, roic: 26.0, fcfYield: 2.1, divYield: 0.0, cagr5y: '22.0%', score: 93, moat: '99% Mobile Architecture Monopoly', moatHe: 'מונופול ארכיטקטורת מעבדי מובייל בעולם', descriptionHe: 'ספקית ארכיטקטורת המעבדים לכלל הסמארטפונים והשרתים המובילים.', indexCategory: 'NASDAQ100' },
    { ticker: 'PDD', name: 'PDD Holdings Inc.', nameHe: 'פינדואודואו (Temu)', sector: 'Consumer Discretionary', sectorHe: 'צריכה מחזורית ומסחר', exchange: 'NASDAQ', marketCap: '$160B', pe: 11.5, roic: 32.0, fcfYield: 8.5, divYield: 0.0, cagr5y: '26.0%', score: 89, moat: 'Direct Manufacturer Supply Chain & Temu', moatHe: 'אספקה ישירה מיצרנים ומודל Temu עולמי', descriptionHe: 'קמעונאית מקוונת ענקית המפעילה את Pinduoduo ו-Temu.', indexCategory: 'NASDAQ100' },
    { ticker: 'MELI', name: 'MercadoLibre, Inc.', nameHe: 'מרקדו ליברה', sector: 'Consumer Discretionary', sectorHe: 'צריכה מחזורית ומסחר', exchange: 'NASDAQ', marketCap: '$102B', pe: 46.0, roic: 34.0, fcfYield: 4.8, divYield: 0.0, cagr5y: '25.0%', score: 94, moat: 'Latin America E-Commerce & Mercado Pago Rails', moatHe: 'מונופול המסחר המקוון והתשלומים באמריקה הלטינית', descriptionHe: 'אמזון ו-PayPal של אמריקה הלטינית עם צמיחה מהירה.', indexCategory: 'NASDAQ100' },
    { ticker: 'SHOP', name: 'Shopify Inc.', nameHe: 'שופיפיי', sector: 'Technology', sectorHe: 'טכנולוגיה ותוכנה', exchange: 'NASDAQ', marketCap: '$110B', pe: 52.0, roic: 16.0, fcfYield: 3.0, divYield: 0.0, cagr5y: '21.0%', score: 91, moat: 'Independent Merchant OS & Shop Pay Network', moatHe: 'מערכת הפעלה למסחר עצמאי ורשת Shop Pay', descriptionHe: 'הפלטפורמה המובילה בעולם לחנויות מקוונות עצמאיות.', indexCategory: 'NASDAQ100' },
    { ticker: 'SNOW', name: 'Snowflake Inc.', nameHe: 'סנואו-פלייק', sector: 'Technology', sectorHe: 'טכנולוגיה ותוכנה', exchange: 'NASDAQ', marketCap: '$48B', pe: 58.0, roic: 12.0, fcfYield: 3.1, divYield: 0.0, cagr5y: '22.0%', score: 88, moat: 'Multi-Cloud Data Sharing Platform', moatHe: 'פלטפורמת נתונים ושיתוף מידע חוצה עננים', descriptionHe: 'מחסן נתונים ענני מוביל המאפשר שיתוף דאטה ארגוני.', indexCategory: 'NASDAQ100' },
    { ticker: 'DDOG', name: 'Datadog, Inc.', nameHe: 'דטה-דוג', sector: 'Technology', sectorHe: 'טכנולוגיה ותוכנה', exchange: 'NASDAQ', marketCap: '$42B', pe: 52.0, roic: 17.0, fcfYield: 3.6, divYield: 0.0, cagr5y: '21.0%', score: 90, moat: 'Cloud Observability Platform', moatHe: 'ניטור תשתיות ענן וביצועי אפליקציות', descriptionHe: 'מובילה בניטור ענן, אבטחת מידע וניתוח ביצועים.', indexCategory: 'NASDAQ100' },
    { ticker: 'COIN', name: 'Coinbase Global, Inc.', nameHe: 'קוינבייס', sector: 'Financials', sectorHe: 'פיננסים, בנקאות וביטוח', exchange: 'NASDAQ', marketCap: '$58B', pe: 28.0, roic: 18.0, fcfYield: 4.5, divYield: 0.0, cagr5y: '22.0%', score: 86, moat: 'US Regulated Crypto Custody & Base L2', moatHe: 'משמורת קריפטו מוסדרת בארה"ב ורשת Base L2', descriptionHe: 'בורסת הקריפטו המוסדרת והמובילה בארה"ב.', indexCategory: 'NASDAQ100' },
    { ticker: 'SOFI', name: 'SoFi Technologies', nameHe: 'סופיי טכנולוגיות', sector: 'Financials', sectorHe: 'פיננסים, בנקאות וביטוח', exchange: 'NASDAQ', marketCap: '$14B', pe: 24.0, roic: 12.5, fcfYield: 5.2, divYield: 0.0, cagr5y: '24.0%', score: 84, moat: 'Digital Banking Flywheel & Galileo Galileo API', moatHe: 'אפליקציית בנקאות דיגיטלית ותשתית טכנולוגית Galileo', descriptionHe: 'חברת פינטק ובנק דיגיטלי בצמיחה מהירה בארה"ב.', indexCategory: 'NASDAQ100' },
    { ticker: 'DASH', name: 'DoorDash, Inc.', nameHe: 'דור-דאש', sector: 'Consumer Discretionary', sectorHe: 'צריכה מחזורית ומסחר', exchange: 'NASDAQ', marketCap: '$65B', pe: 38.0, roic: 16.5, fcfYield: 3.8, divYield: 0.0, cagr5y: '19.0%', score: 88, moat: '67% US Food Delivery Logistics Market Share', moatHe: 'שליטה של 67% במשלוחי מזון ומסחר מקומי בארה"ב', descriptionHe: 'פלטפורמת המשלוחים המקומיים הגדולה בארה"ב.', indexCategory: 'NASDAQ100' }
  ];

  for (const item of extraNasdaq) {
    if (!processedTickers.has(item.ticker)) {
      fullCatalog.push(item);
      processedTickers.add(item.ticker);
    }
  }

  console.log(`Generated complete catalog with ${fullCatalog.length} stocks!`);

  const fileOutput = `export interface MarketScreenerStock {
  ticker: string;
  name: string;
  nameHe: string;
  exchange: 'NASDAQ' | 'NYSE';
  sector: string;
  sectorHe: string;
  marketCap: string;
  pe: number;
  roic: number;
  fcfYield: number;
  divYield: number;
  cagr5y: string;
  score: number;
  moat: string;
  moatHe: string;
  descriptionHe: string;
  indexCategory?: 'SP500' | 'NASDAQ100' | 'MEGA_CAP' | 'DIVIDEND_COMPOUNDER';
}

export const MARKET_UNIVERSE_CATALOG: MarketScreenerStock[] = ${JSON.stringify(fullCatalog, null, 2)};
`;

  fs.writeFileSync(existingPath, fileOutput, 'utf8');
  console.log(`Wrote ${fullCatalog.length} stocks successfully to ${existingPath}`);
}

run().catch(console.error);
