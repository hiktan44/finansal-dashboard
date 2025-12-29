// Yahoo Finance API Client
export async function fetchYahooFinanceData(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Yahoo Finance error for ${symbol}:`, response.status);
      return null;
    }

    const data = await response.json();
    const quote = data?.chart?.result?.[0];

    if (!quote) return null;

    const meta = quote.meta;
    const currentPrice = meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || 0;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol,
      price: currentPrice,
      previous_close: previousClose,
      change_percent: changePercent,
      volume: meta.regularMarketVolume || 0,
      market_cap: meta.marketCap || 0,
      currency: meta.currency || 'USD',
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    return null;
  }
}

// TCMB XML Parser
export async function fetchTCMBRates() {
  try {
    const url = 'https://www.tcmb.gov.tr/kurlar/today.xml';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error('TCMB API error:', response.status);
      return [];
    }

    const xmlText = await response.text();
    const currencies = [];

    // USD
    const usdMatch = xmlText.match(/<Currency.*?CurrencyCode="USD".*?>(.*?)<\/Currency>/s);
    if (usdMatch) {
      const forexSellingMatch = usdMatch[1].match(/<ForexSelling>(.*?)<\/ForexSelling>/);
      if (forexSellingMatch) {
        currencies.push({
          symbol: 'USD/TRY',
          name: 'Amerikan Doları',
          price: parseFloat(forexSellingMatch[1]),
          asset_type: 'currency',
          exchange: 'TCMB',
          currency: 'TRY'
        });
      }
    }

    // EUR
    const eurMatch = xmlText.match(/<Currency.*?CurrencyCode="EUR".*?>(.*?)<\/Currency>/s);
    if (eurMatch) {
      const forexSellingMatch = eurMatch[1].match(/<ForexSelling>(.*?)<\/ForexSelling>/);
      if (forexSellingMatch) {
        currencies.push({
          symbol: 'EUR/TRY',
          name: 'Euro',
          price: parseFloat(forexSellingMatch[1]),
          asset_type: 'currency',
          exchange: 'TCMB',
          currency: 'TRY'
        });
      }
    }

    // GBP
    const gbpMatch = xmlText.match(/<Currency.*?CurrencyCode="GBP".*?>(.*?)<\/Currency>/s);
    if (gbpMatch) {
      const forexSellingMatch = gbpMatch[1].match(/<ForexSelling>(.*?)<\/ForexSelling>/);
      if (forexSellingMatch) {
        currencies.push({
          symbol: 'GBP/TRY',
          name: 'İngiliz Sterlini',
          price: parseFloat(forexSellingMatch[1]),
          asset_type: 'currency',
          exchange: 'TCMB',
          currency: 'TRY'
        });
      }
    }

    return currencies;
  } catch (error) {
    console.error('Error fetching TCMB data:', error);
    return [];
  }
}

// Retry helper
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Retry ${i + 1}/${maxRetries}:`, error);
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
