import { QuoteData } from '@/types';
import { TrendingUp, Plus, Minus } from 'lucide-react';

interface KeyStatisticsProps {
  quote: QuoteData;
  onToggleCompare: (quote: QuoteData) => void;
  isCompared: boolean;
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

export default function KeyStatistics({ quote, onToggleCompare, isCompared }: KeyStatisticsProps) {
  const { cf_last, cf_netchng, pctchng, cf_volume, mkt_value, '52wk_high': high52w } = quote.quote;

  return (
    <div className="bg-white rounded-[8px] border border-border-gray p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Key Statistics</h2>
        </div>
        <button
          onClick={() => onToggleCompare(quote)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
            isCompared 
              ? 'bg-negative text-white hover:bg-negative/90' 
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {isCompared ? (
            <>
              <Minus className="size-3.5" />
              Remove
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              Compare
            </>
          )}
        </button>
      </div>
      <div className="space-y-3">
        <StatRow label="Current Price" value={formatCurrency(cf_last)} />
        <StatRow 
          label="Change" 
          value={formatChange(cf_netchng, pctchng)} 
          colorClass={getChangeColor(cf_netchng)}
        />
        <StatRow label="Volume" value={formatNumber(cf_volume)} />
        <StatRow label="Market Value" value={formatMarketValue(mkt_value)} />
        <StatRow label="52W High" value={formatCurrency(high52w)} />
      </div>
    </div>
  );
}

function StatRow({ label, value, colorClass = 'text-text-primary' }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border-gray last:border-0">
      <span className="text-text-secondary text-base">{label}</span>
      <span className={`text-base font-semibold ${colorClass}`}>
        {value}
      </span>
    </div>
  );
}
