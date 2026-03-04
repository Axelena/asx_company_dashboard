'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import CompanySearch from '@/components/CompanySearch';
import KeyStatistics from '@/components/KeyStatistics';
import CompanyInfo from '@/components/CompanyInfo';
import CompanyComparison from '@/components/CompanyComparison';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchCompanyInfo, fetchQuote, fetchPriceHistory } from '@/lib/api';
import { AppState, QuoteData } from '@/types';

export default function DashboardPage() {
  const [state, setState] = useState<AppState>({
    loading: false,
    error: null,
    companyData: null,
    quoteData: null,
    currentTicker: '',
    comparisonList: [],
    historyData: {},
  });

  const toggleComparison = async (quote: QuoteData) => {
    const exists = state.comparisonList.some(q => q.symbol === quote.symbol);
    
    if (exists) {
      setState(prev => ({
        ...prev,
        comparisonList: prev.comparisonList.filter(q => q.symbol !== quote.symbol)
      }));
      return;
    }

    if (state.comparisonList.length >= 4) {
      setState(prev => ({ ...prev, error: 'You can compare up to 4 companies' }));
      return;
    }

    // Fetch history if not already present
    if (!state.historyData[quote.symbol]) {
      try {
        const history = await fetchPriceHistory(quote.symbol, quote.quote.cf_last);
        setState(prev => ({
          ...prev,
          comparisonList: [...prev.comparisonList, quote],
          historyData: { ...prev.historyData, [quote.symbol]: history }
        }));
      } catch (err) {
        console.error('Failed to fetch history:', err);
        // Still add to comparison even if history fails
        setState(prev => ({
          ...prev,
          comparisonList: [...prev.comparisonList, quote]
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        comparisonList: [...prev.comparisonList, quote]
      }));
    }
  };

  const addTickerToComparison = async (ticker: string) => {
    try {
      const quoteData = await fetchQuote(ticker);
      if (!quoteData) throw new Error('Quote not found');
      
      const exists = state.comparisonList.some(q => q.symbol === quoteData.symbol);
      if (exists) return;

      const history = await fetchPriceHistory(quoteData.symbol, quoteData.quote.cf_last);
      
      setState(prev => ({
        ...prev,
        comparisonList: [...prev.comparisonList, quoteData],
        historyData: { ...prev.historyData, [quoteData.symbol]: history }
      }));
    } catch (err) {
      throw err;
    }
  };

  const handleSearch = async (ticker: string) => {
    const normalized = ticker.trim().toUpperCase();
    
    // Validation
    if (normalized.length < 3) {
      setState(prev => ({ ...prev, error: 'Ticker must be at least 3 characters' }));
      return;
    }
    if (!/^[A-Z0-9]+$/.test(normalized)) {
      setState(prev => ({ ...prev, error: 'Ticker must contain only letters and numbers' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, currentTicker: normalized }));

    try {
      const [companyData, quoteData] = await Promise.all([
        fetchCompanyInfo(normalized),
        fetchQuote(normalized),
      ]);

      setState(prev => ({
        ...prev,
        loading: false,
        companyData,
        quoteData,
        error: null,
      }));
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || 'Failed to fetch company information. Please try again later';
      
      // If the error message is a generic one from our fetch, make it nicer
      if (errorMessage.includes('Error 404') || errorMessage.includes('Not Found')) {
        errorMessage = `Ticker '${normalized}' not found or may be delisted`;
      } else if (errorMessage.includes('Error 400')) {
        errorMessage = 'Invalid request. Please check the ticker symbol';
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        companyData: null,
        quoteData: null,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border-gray py-8 shadow-[0_1px_3px_rgba(0,0,0,0.1)] shrink-0">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary mb-2"
          >
            ASX Company Information
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary"
          >
            Search for Australian Stock Exchange listed companies
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-screen-xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {state.companyData && state.quoteData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(350px,450px)_1fr] gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <CompanySearch onSearch={handleSearch} currentTicker={state.currentTicker} />
                    <KeyStatistics 
                      quote={state.quoteData} 
                      onToggleCompare={toggleComparison}
                      isCompared={state.comparisonList.some(q => q.symbol === state.quoteData?.symbol)}
                    />
                  </div>

                  {/* Right Column */}
                  <CompanyInfo company={state.companyData} />
                </div>

                {/* Compare Stocks Section */}
                <CompanyComparison 
                  comparisonList={state.comparisonList} 
                  historyData={state.historyData}
                  onRemove={toggleComparison} 
                  onAdd={addTickerToComparison}
                />
              </motion.div>
            ) : (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <CompanySearch onSearch={handleSearch} currentTicker={state.currentTicker} centered />
                
                {/* Show Compare Stocks even if no current search result, if there are items in comparison list */}
                {state.comparisonList.length > 0 && (
                  <div className="w-full max-w-4xl mt-12">
                    <CompanyComparison 
                      comparisonList={state.comparisonList} 
                      historyData={state.historyData}
                      onRemove={toggleComparison} 
                      onAdd={addTickerToComparison}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading State */}
        {state.loading && <LoadingSpinner />}

        {/* Error State */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-negative text-white px-6 py-4 rounded-[8px] shadow-2xl flex items-center gap-3 z-50 min-w-[300px]"
            >
              <AlertCircle className="size-5 shrink-0" />
              <p className="font-medium">{state.error}</p>
              <button 
                onClick={() => setState(prev => ({ ...prev, error: null }))}
                className="ml-auto hover:bg-white/20 rounded p-1 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
