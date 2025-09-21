import yahooFinance from 'yahoo-finance2';

// Suppress Yahoo Finance notices
yahooFinance.suppressNotices(['yahooSurvey']);

// Types for better type safety
interface QuoteData {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: Date;
  marketState?: string;
  currency?: string;
  exchange?: string;
  quoteType?: string;
  [key: string]: any;
}

interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

interface SearchResult {
  symbol: string;
  shortName?: string;
  longName?: string;
  quoteType?: string;
  exchange?: string;
  [key: string]: any;
}

interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: Date;
  type: string;
  [key: string]: any;
}

interface Recommendation {
  symbol: string;
  targetHighPrice?: number;
  targetLowPrice?: number;
  targetMeanPrice?: number;
  targetMedianPrice?: number;
  recommendationMean?: number;
  recommendationKey?: string;
  numberOfAnalystOpinions?: number;
  [key: string]: any;
}

interface FinancialData {
  symbol: string;
  [key: string]: any;
}

interface OptionsData {
  symbol: string;
  expirationDates: number[];
  strikes: number[];
  calls?: any[];
  puts?: any[];
  [key: string]: any;
}

/**
 * Get real-time quote data for a stock symbol
 */
export async function getQuote(symbol: string): Promise<QuoteData> {
  try {
    const result = await yahooFinance.quote(symbol);
    return result as QuoteData;
  } catch (error) {
    throw new Error(`Failed to get quote for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get historical price data for a stock symbol
 */
export async function getHistoricalData(
  symbol: string,
  period1?: string,
  period2?: string,
  interval: string = '1d'
): Promise<HistoricalData[]> {
  try {
    console.log(`DEBUG: getHistoricalData called with symbol: ${symbol}`);
    const options: any = {
      interval: interval as any,
    };

    // Set default date range if not provided
    if (!period1) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Default to 30 days
      options.period1 = startDate;
      options.period2 = endDate;
    } else {
      options.period1 = new Date(period1);
    }
    
    if (period2) {
      options.period2 = new Date(period2);
    }

    // Suppress the deprecation warning
    yahooFinance.suppressNotices(['ripHistorical']);
    
    const result = await yahooFinance.historical(symbol, options);
    return result.map(item => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      adjClose: item.adjClose,
    }));
  } catch (error) {
    // Return empty array instead of throwing error for historical data
    console.error(`Warning: Failed to get historical data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

/**
 * Search for stock symbols by company name or symbol
 */
export async function searchSymbols(query: string): Promise<SearchResult[]> {
  try {
    const result = await yahooFinance.search(query);
    return result.quotes.map((quote: any) => ({
      symbol: quote.symbol || '',
      shortName: quote.shortName,
      longName: quote.longName,
      quoteType: quote.quoteType,
      exchange: quote.exchange,
    }));
  } catch (error) {
    throw new Error(`Failed to search symbols for "${query}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get market summary data including major indices
 */
export async function getMarketSummary(): Promise<any> {
  try {
    // Get major indices
    const indices = ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'];
    const quotes = await Promise.all(
      indices.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return {
            symbol,
            name: quote.longName || quote.shortName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            marketState: quote.marketState,
          };
        } catch (error) {
          return {
            symbol,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return {
      timestamp: new Date().toISOString(),
      indices: quotes,
    };
  } catch (error) {
    throw new Error(`Failed to get market summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get financial news, optionally filtered by symbol
 */
export async function getNews(symbol?: string, count: number = 10): Promise<NewsItem[]> {
  try {
    const options: any = {
      count,
    };

    if (symbol) {
      options.symbol = symbol;
    }

    // Note: yahoo-finance2 doesn't have a direct news method, so we'll use a workaround
    // For now, return empty array as news functionality needs to be implemented differently
    return [];
  } catch (error) {
    throw new Error(`Failed to get news${symbol ? ` for ${symbol}` : ''}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get analyst recommendations for a stock symbol
 */
export async function getRecommendations(symbol: string): Promise<Recommendation> {
  try {
    const result = await yahooFinance.quote(symbol);

    // For now, return basic recommendation data since modules parameter is not supported
    return {
      symbol,
      targetHighPrice: undefined,
      targetLowPrice: undefined,
      targetMeanPrice: undefined,
      targetMedianPrice: undefined,
      recommendationMean: undefined,
      recommendationKey: undefined,
      numberOfAnalystOpinions: undefined,
    };
  } catch (error) {
    throw new Error(`Failed to get recommendations for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get financial statements for a stock symbol
 */
export async function getFinancials(symbol: string, type: 'income' | 'balance' | 'cashflow'): Promise<FinancialData> {
  try {
    // For now, return basic financial data since modules parameter is not supported
    return {
      symbol,
      type,
      data: {
        note: `Financial statement data for ${type} is not available in the current implementation`,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get ${type} statement for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get options data for a stock symbol
 */
export async function getOptions(symbol: string, expiration?: string): Promise<OptionsData> {
  try {
    const options: any = {};
    if (expiration) {
      options.date = new Date(expiration);
    }

    const result = await yahooFinance.options(symbol, options);
    
    return {
      symbol,
      expirationDates: (result.expirationDates || []).map((date: any) => 
        typeof date === 'number' ? date : new Date(date).getTime()
      ),
      strikes: result.strikes || [],
      calls: result.options?.[0]?.calls || [],
      puts: result.options?.[0]?.puts || [],
    };
  } catch (error) {
    throw new Error(`Failed to get options for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get trending stocks based on volume and price movement
 */
export async function getTrendingStocks(count: number = 5): Promise<any[]> {
  try {
    // Popular stock symbols to check for trending activity
    const popularSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
      'ORCL', 'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT', 'SQ', 'ROKU', 'ZM', 'PTON',
      'SPOT', 'TWTR', 'SNAP', 'PINS', 'SHOP', 'OKTA', 'CRWD', 'ZS', 'NET', 'DDOG'
    ];

    // Get quotes for each symbol individually (yahoo-finance2 doesn't handle arrays well)
    const quotes: any[] = [];
    for (const symbol of popularSymbols.slice(0, 10)) { // Limit to first 10 for performance
      try {
        const quote = await yahooFinance.quote(symbol);
        if (quote && quote.regularMarketPrice) {
          quotes.push({
            symbol,
            name: quote.longName || quote.shortName || symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            pe: quote.trailingPE || 0,
            dividendYield: (quote as any).dividendYield || 0,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
            averageVolume: quote.averageDailyVolume3Month || 0
          });
        }
      } catch (err) {
        console.warn(`Failed to get quote for ${symbol}:`, err);
        // Continue with other symbols
      }
    }

    // Sort by volume and price change to find trending stocks
    const trendingStocks = quotes
      .sort((a, b) => {
        // Primary sort: by volume (higher volume = more trending)
        const volumeScoreA = a.volume / Math.max(a.averageVolume, 1);
        const volumeScoreB = b.volume / Math.max(b.averageVolume, 1);
        
        if (Math.abs(volumeScoreB - volumeScoreA) > 0.1) {
          return volumeScoreB - volumeScoreA;
        }
        
        // Secondary sort: by absolute price change percentage
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      })
      .slice(0, count);

    return trendingStocks;
  } catch (error) {
    throw new Error(`Failed to get trending stocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getTrendingETFs(count: number = 5): Promise<any[]> {
  try {
    const popularETFs = [
      'SPY', 'QQQ', 'IWM', 'VTI', 'VEA', 'VWO', 'BND', 'AGG', 'TLT', 'GLD',
      'SLV', 'USO', 'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU',
      'SMH', 'SOXX', 'IBB', 'XBI', 'ARKK', 'ARKQ', 'ARKW', 'ARKG', 'ARKF', 'TAN'
    ];
    
    const quotes: any[] = [];
    for (const symbol of popularETFs.slice(0, 15)) { // Limit to first 15 for performance
      try {
        const quote = await yahooFinance.quote(symbol);
        if (quote && quote.regularMarketPrice) {
          quotes.push({
            symbol,
            name: quote.longName || quote.shortName || symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            pe: quote.trailingPE || 0,
            dividendYield: (quote as any).dividendYield || 0,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
            averageVolume: quote.averageDailyVolume3Month || 0,
            quoteType: quote.quoteType || 'ETF'
          });
        }
      } catch (err) {
        console.warn(`Failed to get quote for ${symbol}:`, err);
      }
    }
    
    const trendingETFs = quotes
      .sort((a, b) => {
        // Primary sort: by volume (higher volume = more trending)
        const volumeScoreA = a.volume / Math.max(a.averageVolume, 1);
        const volumeScoreB = b.volume / Math.max(b.averageVolume, 1);
        
        if (Math.abs(volumeScoreB - volumeScoreA) > 0.1) {
          return volumeScoreB - volumeScoreA;
        }
        
        // Secondary sort: by absolute price change percentage
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      })
      .slice(0, count);

    return trendingETFs;
  } catch (error) {
    throw new Error(`Failed to get trending ETFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getInsights(symbol: string): Promise<any> {
  try {
    const result = await yahooFinance.insights(symbol);
    return result;
  } catch (error) {
    throw new Error(`Failed to get insights for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getChart(symbol: string, period1?: string, period2?: string, interval?: string): Promise<any> {
  try {
    // Use historical data as chart data since chart() might not be available
    const options: any = {
      interval: interval || '1d',
    };
    
    if (period1) {
      options.period1 = new Date(period1);
    } else {
      // Default to last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      options.period1 = startDate;
    }
    
    if (period2) {
      options.period2 = new Date(period2);
    } else {
      options.period2 = new Date();
    }
    
    const result = await yahooFinance.historical(symbol, options);
    return result;
  } catch (error) {
    throw new Error(`Failed to get chart data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getQuoteSummary(symbol: string, modules?: string[]): Promise<any> {
  try {
    const options: any = {};
    if (modules) options.modules = modules;
    
    const result = await yahooFinance.quoteSummary(symbol, options);
    return result;
  } catch (error) {
    throw new Error(`Failed to get quote summary for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getFundamentalsTimeSeries(symbol: string, period1?: string, period2?: string): Promise<any> {
  try {
    const options: any = {};
    if (period1) options.period1 = new Date(period1);
    if (period2) options.period2 = new Date(period2);
    
    const result = await yahooFinance.fundamentalsTimeSeries(symbol, options);
    return result;
  } catch (error) {
    throw new Error(`Failed to get fundamentals time series for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getTrendingSymbols(count: number = 10): Promise<any> {
  try {
    const result = await yahooFinance.trendingSymbols('trending', { count });
    return result;
  } catch (error) {
    throw new Error(`Failed to get trending symbols: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


export async function getScreener(criteria?: string, count: number = 10): Promise<any> {
  try {
    const options: any = { count };
    if (criteria) options.criteria = criteria;
    
    const result = await yahooFinance.screener(options);
    return result;
  } catch (error) {
    throw new Error(`Failed to get screener results: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAutoc(): Promise<any> {
  try {
    const result = await yahooFinance.autoc();
    return result;
  } catch (error) {
    throw new Error(`Failed to get auto-complete suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
