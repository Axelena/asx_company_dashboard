'use client';

import { useState, useMemo } from 'react';
import { QuoteData, HistoryPoint } from '@/types';
import { X, BarChart3, Search, Plus, Loader2, LineChart as ChartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface CompanyComparisonProps {
  comparisonList: QuoteData[];
  historyData: Record<string, HistoryPoint[]>;
  onRemove: (quote: QuoteData) => void;
  onAdd: (ticker: string) => Promise<void>;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-AU').format(value);
};

const formatMarketValue = (value: number) => {
  const billions = value / 1_000_000_000;
  return `$${billions.toFixed(2)}B`;
};

const formatChange = (change: number, pct: number) => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}$${Math.abs(change).toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
};

const getChangeColor = (change: number) => {
  if (change === 0) return 'text-text-primary';
  return change > 0 ? 'text-positive' : 'text-negative';
};

export default function CompanyComparison({ comparisonList, historyData, onRemove, onAdd }: CompanyComparisonProps) {
  const [searchTicker, setSearchTicker] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularTickers = ['CBA', 'NAB', 'BHP', 'TLS', 'WBC', 'ANZ', 'MQG', 'CSL'];

  // Transform history data for recharts
  const chartData = useMemo(() => {
    if (comparisonList.length === 0) return [];
    
    // Get all unique dates
    const allDates = new Set<string>();
    comparisonList.forEach(q => {
      const history = historyData[q.symbol];
      if (history) {
        history.forEach(p => allDates.add(p.date));
      }
    });

    const sortedDates = Array.from(allDates).sort();
    
    return sortedDates.map(date => {
      const point: any = { date };
      comparisonList.forEach(q => {
        const history = historyData[q.symbol];
        if (history) {
          const match = history.find(p => p.date === date);
          if (match) {
            point[q.symbol] = match.price;
          }
        }
      });
      return point;
    });
  }, [comparisonList, historyData]);

  const colors = ['#20705c', '#F27D26', '#198754', '#dc3545', '#6366f1'];

  const handleAdd = async (tickerToAdd: string) => {
    const ticker = tickerToAdd.trim().toUpperCase();
    if (!ticker) {
      setError('Please enter a ticker symbol');
      return;
    }

    if (comparisonList.some(q => q.symbol === ticker)) {
      setError(`${ticker} is already in the list`);
      return;
    }

    if (comparisonList.length >= 4) {
      setError('You can compare up to 4 stocks');
      return;
    }

    setIsAdding(true);
    setError(null);
    setShowSuggestions(false);
    try {
      await onAdd(ticker);
      setSearchTicker('');
    } catch (err: any) {
      // Use the error message from the API if it's descriptive
      const msg = err.message || '';
      if (msg.includes('delisted') || msg.includes('not found') || msg.includes('404')) {
        setError(`Ticker '${ticker}' not found or delisted`);
      } else {
        setError(`Failed to add ${ticker}. Please try again.`);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd(searchTicker);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 bg-bg-gray/30 p-4 rounded-xl border border-border-gray/50">
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BarChart3 className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Compare Stocks</h2>
            <p className="text-xs text-text-secondary font-medium">
              {comparisonList.length} of 4 selected
            </p>
          </div>
        </div>

        {/* Search & Add Input - More Outstanding */}
        <div className="relative w-full md:max-w-md flex-1">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1 group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className="size-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                <span className="text-text-secondary font-bold text-xs border-r border-border-gray pr-2">
                  ASX
                </span>
              </div>
              <input
                type="text"
                value={searchTicker}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={(e) => {
                  setSearchTicker(e.target.value.toUpperCase());
                  setError(null);
                  setShowSuggestions(true);
                }}
                placeholder={comparisonList.length >= 4 ? "Limit reached (max 4 stocks)" : "Search other stocks to compare..."}
                className="w-full pl-20 pr-4 py-3 text-sm bg-white border-2 border-border-gray rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary uppercase transition-all shadow-sm hover:border-text-secondary/30 disabled:bg-bg-gray/50 disabled:cursor-not-allowed"
                disabled={isAdding || comparisonList.length >= 4}
              />
              
              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-border-gray rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 bg-bg-gray border-b border-border-gray">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Quick Add Popular</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {popularTickers
                        .filter(t => t.includes(searchTicker) || !searchTicker)
                        .map(ticker => (
                          <button
                            key={ticker}
                            type="button"
                            onClick={() => handleAdd(ticker)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-bg-gray flex items-center justify-center font-bold text-xs text-text-primary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {ticker}
                              </div>
                              <span className="font-medium text-text-primary">ASX:{ticker}</span>
                            </div>
                            <Plus className="size-4 text-text-secondary group-hover:text-primary" />
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="submit"
              disabled={isAdding || comparisonList.length >= 4}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg active:scale-95"
              title={comparisonList.length >= 4 ? "Maximum comparison limit reached" : "Add Stock"}
            >
              {isAdding ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Plus className="size-5" />
                  <span className="hidden sm:inline">Add Stock</span>
                </>
              )}
            </button>
          </form>
          
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 mt-2 text-xs text-negative font-bold bg-negative/5 px-3 py-1 rounded-full border border-negative/10"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {comparisonList.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-dashed border-border-gray p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Search className="size-8 text-text-secondary opacity-20" />
            <p className="text-text-secondary font-medium">Add up to 4 stocks to compare their performance side-by-side.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Performance Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[8px] border border-border-gray p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center gap-2 mb-6">
              <ChartIcon className="size-5 text-primary" />
              <h3 className="text-lg font-bold text-text-primary">Price Performance (30 Days)</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6c757d' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6c757d' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e9ecef',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  {comparisonList.map((quote, index) => (
                    <Line
                      key={quote.symbol}
                      type="monotone"
                      dataKey={quote.symbol}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonList.map((quote) => (
              <motion.div
                key={quote.symbol}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[8px] border border-border-gray p-5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-gray">
                  <span className="text-lg font-bold text-text-primary">{quote.symbol}</span>
                  <button
                    onClick={() => onRemove(quote)}
                    className="p-1.5 hover:bg-bg-gray rounded-full transition-colors text-text-secondary hover:text-negative"
                    title="Remove from Compare Stocks"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  <MetricRow 
                    label="Price" 
                    value={formatCurrency(quote.quote.cf_last)} 
                  />
                  <MetricRow 
                    label="Change" 
                    value={formatChange(quote.quote.cf_netchng, quote.quote.pctchng)} 
                    colorClass={getChangeColor(quote.quote.cf_netchng)}
                  />
                  <MetricRow 
                    label="Volume" 
                    value={formatNumber(quote.quote.cf_volume)} 
                  />
                  <MetricRow 
                    label="Market Value" 
                    value={formatMarketValue(quote.quote.mkt_value)} 
                  />
                  <MetricRow 
                    label="52W High" 
                    value={formatCurrency(quote.quote['52wk_high'])} 
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MetricRow({ label, value, colorClass = 'text-text-primary' }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-text-secondary font-medium">{label}</span>
      <span className={`font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}
