import { CompanyData, QuoteData } from '@/types';

export async function fetchCompanyInfo(ticker: string): Promise<CompanyData> {
  const response = await fetch(`/api/proxy/api/market_data/company_information?ticker=${ticker}`, { cache: 'no-store' });
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: Failed to fetch company info`;
    try {
      const error = await response.json();
      if (error.details) {
        try {
          const details = JSON.parse(error.details);
          errorMessage = details.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = error.error || errorMessage;
        }
      } else {
        errorMessage = error.error || errorMessage;
      }
    } catch (e) {
      // Fallback to status text
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchQuote(ticker: string): Promise<QuoteData> {
  const response = await fetch(`/api/proxy/api/market_data/quotes?market_key=asx&listing_key=${ticker}`, { cache: 'no-store' });
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: Failed to fetch quote`;
    try {
      const error = await response.json();
      if (error.details) {
        try {
          const details = JSON.parse(error.details);
          errorMessage = details.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = error.error || errorMessage;
        }
      } else {
        errorMessage = error.error || errorMessage;
      }
    } catch (e) {
      // Fallback to status text
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchPriceHistory(ticker: string, currentPrice: number): Promise<import('@/types').HistoryPoint[]> {
  // In a real scenario, we would fetch from an endpoint like:
  // `/api/proxy/api/market_data/price_history?ticker=${ticker}`
  // Since we don't have a confirmed historical endpoint, we generate realistic mock data
  // based on the current price to demonstrate the comparison chart functionality.
  
  const history: import('@/types').HistoryPoint[] = [];
  const now = new Date();
  let lastPrice = currentPrice;

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    
    // Generate a random walk
    const volatility = 0.02; // 2% max daily change
    const change = 1 + (Math.random() * volatility * 2 - volatility);
    lastPrice = lastPrice * change;
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number(lastPrice.toFixed(2))
    });
  }

  // Adjust history so the last point matches currentPrice
  const lastPoint = history[history.length - 1];
  const ratio = currentPrice / lastPoint.price;
  
  return history.map(p => ({
    ...p,
    price: Number((p.price * ratio).toFixed(2))
  }));
}
