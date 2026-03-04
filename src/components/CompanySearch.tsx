'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface CompanySearchProps {
  onSearch: (ticker: string) => void;
  currentTicker: string;
  centered?: boolean;
}

export default function CompanySearch({ onSearch, currentTicker, centered }: CompanySearchProps) {
  const [ticker, setTicker] = useState(currentTicker);

  useEffect(() => {
    setTicker(currentTicker);
  }, [currentTicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(ticker);
  };

  const handlePopularClick = (t: string) => {
    onSearch(t);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-[8px] border border-border-gray p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${centered ? 'w-full max-w-md' : 'w-full'}`}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Search ASX Ticker
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
                ASX:
              </span>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g., CBA"
                className="w-full pl-16 pr-4 py-2 border border-border-gray rounded-[6px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-[6px] hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-text-secondary mb-2">Popular stocks:</p>
          <div className="flex flex-wrap gap-2">
            {['CBA', 'NAB', 'BHP'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handlePopularClick(t)}
                className="px-4 py-1.5 border border-border-gray rounded-[6px] text-sm font-medium text-text-primary hover:bg-bg-gray transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
