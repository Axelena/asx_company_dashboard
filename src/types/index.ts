export interface CompanyData {
  ticker: string;
  company_info: string;
}

export interface QuoteData {
  symbol: string;
  quote: {
    cf_last: number;           // Current price
    cf_netchng: number;        // Price change
    pctchng: number;           // Percentage change
    cf_volume: number;         // Volume
    mkt_value: number;         // Market value
    '52wk_high': number;       // 52 week high
  };
}

export interface HistoryPoint {
  date: string;
  price: number;
}

export interface PriceHistory {
  symbol: string;
  history: HistoryPoint[];
}

export interface AppState {
  loading: boolean;
  error: string | null;
  companyData: CompanyData | null;
  quoteData: QuoteData | null;
  currentTicker: string;
  comparisonList: QuoteData[];
  historyData: Record<string, HistoryPoint[]>;
}
