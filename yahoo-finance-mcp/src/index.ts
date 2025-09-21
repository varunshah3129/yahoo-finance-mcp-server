#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Tool,
  Prompt,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import {
  getQuote,
  getHistoricalData,
  searchSymbols,
  getMarketSummary,
  getNews,
  getRecommendations,
  getFinancials,
  getOptions,
  getTrendingStocks,
  getTrendingETFs,
  getInsights,
  getChart,
  getQuoteSummary,
  getFundamentalsTimeSeries,
  getTrendingSymbols,
  getScreener,
  getAutoc,
} from './yahoo-finance-api.js';

// Tool schemas for validation
const GetQuoteSchema = z.object({
  symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT, GOOGL)'),
});

const GetHistoricalDataSchema = z.object({
  symbol: z.string().describe('Stock symbol (e.g., AAPL, MSFT, GOOGL)'),
  period1: z.string().optional().describe('Start date in YYYY-MM-DD format'),
  period2: z.string().optional().describe('End date in YYYY-MM-DD format'),
  interval: z.enum(['1d', '5d', '1wk', '1mo', '3mo']).optional().describe('Data interval'),
});

const SearchSymbolsSchema = z.object({
  query: z.string().describe('Search query for symbols'),
});

const GetNewsSchema = z.object({
  symbol: z.string().optional().describe('Stock symbol for specific news'),
  count: z.number().optional().describe('Number of news items to return (default: 10)'),
});

const GetRecommendationsSchema = z.object({
  symbol: z.string().describe('Stock symbol to get recommendations for'),
});

const GetFinancialsSchema = z.object({
  symbol: z.string().describe('Stock symbol to get financials for'),
  type: z.enum(['income', 'balance', 'cashflow']).describe('Type of financial statement'),
});

const GetOptionsSchema = z.object({
  symbol: z.string().describe('Stock symbol to get options for'),
  expiration: z.string().optional().describe('Options expiration date in YYYY-MM-DD format'),
});

const GetTrendingStocksSchema = z.object({
  count: z.number().optional().describe('Number of trending stocks to return (default: 5)'),
});

const GetTrendingETFsSchema = z.object({
  count: z.number().optional().describe('Number of trending ETFs to return (default: 5)'),
});

const GetInsightsSchema = z.object({
  symbol: z.string().describe('Stock symbol to get insights for'),
});

const GetChartSchema = z.object({
  symbol: z.string().describe('Stock symbol for chart data'),
  period1: z.string().optional().describe('Start date in YYYY-MM-DD format'),
  period2: z.string().optional().describe('End date in YYYY-MM-DD format'),
  interval: z.enum(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo']).optional().describe('Chart interval'),
});

const GetQuoteSummarySchema = z.object({
  symbol: z.string().describe('Stock symbol to get comprehensive summary for'),
  modules: z.array(z.string()).optional().describe('Specific modules to include'),
});

const GetFundamentalsTimeSeriesSchema = z.object({
  symbol: z.string().describe('Stock symbol for fundamentals time series'),
  period1: z.string().optional().describe('Start date in YYYY-MM-DD format'),
  period2: z.string().optional().describe('End date in YYYY-MM-DD format'),
});

const GetTrendingSymbolsSchema = z.object({
  count: z.number().optional().describe('Number of trending symbols to return (default: 10)'),
});

const GetScreenerSchema = z.object({
  criteria: z.string().optional().describe('Screener criteria'),
  count: z.number().optional().describe('Number of results to return (default: 10)'),
});

const GetAutocSchema = z.object({});

// Define available tools
const tools: Tool[] = [
  {
    name: 'get_quote',
    description: 'Get real-time quote data for a stock symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL, MSFT, GOOGL)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_historical_data',
    description: 'Get historical price data for a stock symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL, MSFT, GOOGL)',
        },
        period1: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        period2: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        interval: {
          type: 'string',
          enum: ['1d', '5d', '1wk', '1mo', '3mo'],
          description: 'Data interval',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'search_symbols',
    description: 'Search for stock symbols by company name or symbol',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for symbols',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_market_summary',
    description: 'Get market summary data including major indices',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_news',
    description: 'Get financial news, optionally filtered by symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol for specific news',
        },
        count: {
          type: 'number',
          description: 'Number of news items to return (default: 10)',
        },
      },
    },
  },
  {
    name: 'get_recommendations',
    description: 'Get analyst recommendations for a stock symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to get recommendations for',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_financials',
    description: 'Get financial statements for a stock symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to get financials for',
        },
        type: {
          type: 'string',
          enum: ['income', 'balance', 'cashflow'],
          description: 'Type of financial statement',
        },
      },
      required: ['symbol', 'type'],
    },
  },
  {
    name: 'get_options',
    description: 'Get options data for a stock symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to get options for',
        },
        expiration: {
          type: 'string',
          description: 'Options expiration date in YYYY-MM-DD format',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_trending_stocks',
    description: 'Get top trending stocks based on volume and price movement',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of trending stocks to return (default: 5)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_trending_etfs',
    description: 'Get top trending ETFs based on volume and price movement',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of trending ETFs to return (default: 5)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_insights',
    description: 'Get technical analysis insights and recommendations for a stock',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to get insights for',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_chart',
    description: 'Get chart data for a stock symbol with various intervals',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol for chart data',
        },
        period1: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        period2: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        interval: {
          type: 'string',
          enum: ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'],
          description: 'Chart interval',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_quote_summary',
    description: 'Get comprehensive quote summary with all available data',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to get comprehensive summary for',
        },
        modules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific modules to include',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_fundamentals_timeseries',
    description: 'Get fundamentals time series data for a stock',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol for fundamentals time series',
        },
        period1: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        period2: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_trending_symbols',
    description: 'Get general trending symbols across all markets',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of trending symbols to return (default: 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_screener',
    description: 'Use stock screener to find stocks based on criteria',
    inputSchema: {
      type: 'object',
      properties: {
        criteria: {
          type: 'string',
          description: 'Screener criteria',
        },
        count: {
          type: 'number',
          description: 'Number of results to return (default: 10)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_autoc',
    description: 'Get auto-complete suggestions for search queries',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Define available prompts
const prompts: Prompt[] = [
  {
    name: 'analyze_stock',
    description: 'Analyze a stock symbol with comprehensive financial data',
    arguments: [
      {
        name: 'symbol',
        description: 'Stock symbol to analyze (e.g., AAPL, MSFT, GOOGL)',
        required: true,
      },
    ],
  },
  {
    name: 'compare_stocks',
    description: 'Compare multiple stocks side by side',
    arguments: [
      {
        name: 'symbols',
        description: 'Comma-separated list of stock symbols to compare',
        required: true,
      },
    ],
  },
  {
    name: 'market_overview',
    description: 'Get a comprehensive overview of the current market conditions',
    arguments: [],
  },
  {
    name: 'find_stocks',
    description: 'Find stocks based on company name or industry',
    arguments: [
      {
        name: 'query',
        description: 'Search query for finding stocks',
        required: true,
      },
    ],
  },
  {
    name: 'stock_news',
    description: 'Get the latest news and analysis for a specific stock',
    arguments: [
      {
        name: 'symbol',
        description: 'Stock symbol to get news for',
        required: true,
      },
    ],
  },
  {
    name: 'technical_insights',
    description: 'Get technical analysis insights and recommendations for a stock',
    arguments: [
      {
        name: 'symbol',
        description: 'Stock symbol to get technical insights for',
        required: true,
      },
    ],
  },
  {
    name: 'chart_analysis',
    description: 'Get detailed chart data and analysis for a stock',
    arguments: [
      {
        name: 'symbol',
        description: 'Stock symbol for chart analysis',
        required: true,
      },
      {
        name: 'period',
        description: 'Time period for chart (e.g., 1d, 5d, 1mo, 3mo, 1y)',
        required: false,
      },
    ],
  },
  {
    name: 'comprehensive_summary',
    description: 'Get a comprehensive financial summary for a stock',
    arguments: [
      {
        name: 'symbol',
        description: 'Stock symbol to get comprehensive summary for',
        required: true,
      },
    ],
  },
  {
    name: 'fundamentals_analysis',
    description: 'Get fundamentals time series data and analysis',
    arguments: [
      {
        name: 'symbol',
        description: 'Stock symbol for fundamentals analysis',
        required: true,
      },
      {
        name: 'period',
        description: 'Time period for analysis (e.g., 1y, 2y, 5y)',
        required: false,
      },
    ],
  },
  {
    name: 'trending_analysis',
    description: 'Get trending symbols and market movers',
    arguments: [
      {
        name: 'count',
        description: 'Number of trending symbols to return (default: 10)',
        required: false,
      },
    ],
  },
  {
    name: 'daily_winners',
    description: 'Get today\'s biggest gainers and winners',
    arguments: [
      {
        name: 'count',
        description: 'Number of daily gainers to return (default: 10)',
        required: false,
      },
    ],
  },
  {
    name: 'stock_screener',
    description: 'Use advanced stock screener to find stocks based on criteria',
    arguments: [
      {
        name: 'criteria',
        description: 'Screening criteria (e.g., "dividend yield > 3%", "market cap > 1B")',
        required: false,
      },
      {
        name: 'count',
        description: 'Number of results to return (default: 10)',
        required: false,
      },
    ],
  },
  {
    name: 'search_suggestions',
    description: 'Get auto-complete suggestions for stock searches',
    arguments: [],
  },
  {
    name: 'portfolio_analysis',
    description: 'Analyze a portfolio of stocks with performance metrics',
    arguments: [
      {
        name: 'symbols',
        description: 'Comma-separated list of stock symbols in the portfolio',
        required: true,
      },
    ],
  },
];

// Create MCP server
const server = new Server({
  name: 'yahoo-finance-mcp-server',
  version: '1.0.0',
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle prompt listing
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts,
  };
});

// Handle prompt execution
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'analyze_stock': {
        const symbol = args?.symbol as string;
        if (!symbol) {
          throw new Error('Symbol is required for stock analysis');
        }

        const [quote, historicalData, recommendations] = await Promise.all([
          getQuote(symbol),
          getHistoricalData(symbol, undefined, undefined, '1d'),
          getRecommendations(symbol),
        ]);

        const prompt = `# Stock Analysis: ${symbol}

## Current Quote
- **Price**: $${quote.regularMarketPrice?.toFixed(2) || 'N/A'}
- **Change**: ${quote.regularMarketChange?.toFixed(2) || 'N/A'} (${quote.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)
- **Market State**: ${quote.marketState || 'N/A'}
- **Volume**: ${quote.regularMarketVolume?.toLocaleString() || 'N/A'}
- **52-Week Range**: $${quote.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - $${quote.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}

## Company Information
- **Name**: ${quote.longName || quote.shortName || 'N/A'}
- **Exchange**: ${quote.exchange || 'N/A'}
- **Currency**: ${quote.currency || 'N/A'}

## Key Metrics
- **Market Cap**: $${quote.marketCap?.toLocaleString() || 'N/A'}
- **P/E Ratio**: ${quote.trailingPE?.toFixed(2) || 'N/A'}
- **Dividend Yield**: ${quote.dividendYield?.toFixed(2) || 'N/A'}%
- **EPS**: $${quote.epsTrailingTwelveMonths?.toFixed(2) || 'N/A'}

## Recent Performance
- **50-Day Average**: $${quote.fiftyDayAverage?.toFixed(2) || 'N/A'}
- **200-Day Average**: $${quote.twoHundredDayAverage?.toFixed(2) || 'N/A'}

## Analysis
Based on the current data, ${symbol} is trading at $${quote.regularMarketPrice?.toFixed(2) || 'N/A'}. The stock has ${quote.regularMarketChangePercent && quote.regularMarketChangePercent > 0 ? 'gained' : 'lost'} ${Math.abs(quote.regularMarketChangePercent || 0).toFixed(2)}% today.

${quote.regularMarketChangePercent && quote.regularMarketChangePercent > 0 ? 'The positive movement suggests' : 'The negative movement suggests'} ${quote.regularMarketChangePercent && quote.regularMarketChangePercent > 0 ? 'positive market sentiment' : 'negative market sentiment'} for this stock.

**Note**: This analysis is based on real-time data and should not be considered as financial advice. Always do your own research before making investment decisions.`;

        return {
          description: `Comprehensive analysis of ${symbol} stock`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'compare_stocks': {
        const symbols = (args?.symbols as string)?.split(',').map(s => s.trim()) || [];
        if (symbols.length === 0) {
          throw new Error('At least one symbol is required for comparison');
        }

        const quotes = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await getQuote(symbol);
              return { symbol, quote, success: true };
            } catch (error) {
              return { symbol, error: error instanceof Error ? error.message : 'Unknown error', success: false };
            }
          })
        );

        const successfulQuotes = quotes.filter(q => q.success && q.quote);
        const failedQuotes = quotes.filter(q => !q.success);

        let prompt = `# Stock Comparison Analysis

## Comparison Results

| Symbol | Price | Change | Change % | Volume | Market Cap |
|--------|-------|--------|----------|--------|------------|`;

        successfulQuotes.forEach(({ symbol, quote }) => {
          if (quote) {
            prompt += `\n| ${symbol} | $${quote.regularMarketPrice?.toFixed(2) || 'N/A'} | $${quote.regularMarketChange?.toFixed(2) || 'N/A'} | ${quote.regularMarketChangePercent?.toFixed(2) || 'N/A'}% | ${quote.regularMarketVolume?.toLocaleString() || 'N/A'} | $${quote.marketCap?.toLocaleString() || 'N/A'} |`;
          }
        });

        if (failedQuotes.length > 0) {
          prompt += `\n\n## Failed to fetch data for:
${failedQuotes.map(q => `- ${q.symbol}: ${q.error}`).join('\n')}`;
        }

        prompt += `\n\n## Analysis
${successfulQuotes.length > 0 ? `Comparing ${successfulQuotes.length} stocks, here are the key insights:

- **Best Performer**: ${successfulQuotes.reduce((best, current) => 
  (current.quote?.regularMarketChangePercent || 0) > (best.quote?.regularMarketChangePercent || 0) ? current : best
).symbol}

- **Worst Performer**: ${successfulQuotes.reduce((worst, current) => 
  (current.quote?.regularMarketChangePercent || 0) < (worst.quote?.regularMarketChangePercent || 0) ? current : worst
).symbol}

- **Highest Volume**: ${successfulQuotes.reduce((highest, current) => 
  (current.quote?.regularMarketVolume || 0) > (highest.quote?.regularMarketVolume || 0) ? current : highest
).symbol}` : 'No successful quotes to analyze.'}

**Note**: This comparison is based on real-time data and should not be considered as financial advice.`;

        return {
          description: `Comparison of ${symbols.length} stocks`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'market_overview': {
        const marketSummary = await getMarketSummary();
        
        const prompt = `# Market Overview - ${new Date().toLocaleDateString()}

## Major Indices Performance

${marketSummary.indices.map((index: any) => {
  if (index.error) {
    return `- **${index.symbol}**: Error - ${index.error}`;
  }
  return `- **${index.name || index.symbol}**: $${index.price?.toFixed(2) || 'N/A'} (${index.change?.toFixed(2) || 'N/A'}, ${index.changePercent?.toFixed(2) || 'N/A'}%)`;
}).join('\n')}

## Market Analysis
${marketSummary.indices.filter((index: any) => !index.error).length > 0 ? 
  `Based on the current market data, the major indices are showing ${marketSummary.indices.filter((index: any) => !index.error && index.changePercent && index.changePercent > 0).length > marketSummary.indices.filter((index: any) => !index.error && index.changePercent && index.changePercent < 0).length ? 'positive' : 'negative'} sentiment overall.

**Key Observations:**
- Market volatility can be assessed by comparing the performance across different indices
- The VIX (Volatility Index) indicates ${marketSummary.indices.find((index: any) => index.symbol === '^VIX')?.price > 20 ? 'high' : 'low'} market volatility
- Overall market direction appears to be ${marketSummary.indices.filter((index: any) => !index.error && index.changePercent && index.changePercent > 0).length > marketSummary.indices.filter((index: any) => !index.error && index.changePercent && index.changePercent < 0).length ? 'bullish' : 'bearish'}` : 
  'Unable to retrieve market data at this time.'}

## Investment Considerations
- Monitor key economic indicators and news events
- Consider diversification across different sectors
- Review your portfolio allocation based on current market conditions
- Stay informed about upcoming earnings reports and economic data releases

**Disclaimer**: This market overview is for informational purposes only and should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.`;

        return {
          description: 'Current market conditions and analysis',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'find_stocks': {
        const query = args?.query as string;
        if (!query) {
          throw new Error('Search query is required');
        }

        const searchResults = await searchSymbols(query);
        
        const prompt = `# Stock Search Results for "${query}"

## Found ${searchResults.length} matching stocks:

${searchResults.slice(0, 10).map((result, index) => `
${index + 1}. **${result.symbol}** - ${result.longName || result.shortName || 'Unknown Company'}
   - Exchange: ${result.exchange || 'N/A'}
   - Type: ${result.quoteType || 'N/A'}
`).join('')}

${searchResults.length > 10 ? `\n*Showing first 10 results out of ${searchResults.length} total matches*` : ''}

## Next Steps
To get detailed information about any of these stocks, you can:
1. Use the "analyze_stock" prompt with a specific symbol
2. Use the "compare_stocks" prompt to compare multiple symbols
3. Get real-time quotes for individual stocks

**Note**: Search results are based on symbol and company name matching. Always verify the correct symbol before making investment decisions.`;

        return {
          description: `Search results for "${query}"`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'stock_news': {
        const symbol = args?.symbol as string;
        if (!symbol) {
          throw new Error('Symbol is required for stock news');
        }

        const [quote, news] = await Promise.all([
          getQuote(symbol),
          getNews(symbol, 5),
        ]);

        const prompt = `# Latest News & Analysis: ${symbol}

## Current Stock Information
- **Price**: $${quote.regularMarketPrice?.toFixed(2) || 'N/A'}
- **Change**: ${quote.regularMarketChange?.toFixed(2) || 'N/A'} (${quote.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)
- **Company**: ${quote.longName || quote.shortName || 'N/A'}

## Recent News
${news.length > 0 ? news.map((item, index) => `
${index + 1}. **${item.title}**
   - Publisher: ${item.publisher}
   - Published: ${item.providerPublishTime ? new Date(item.providerPublishTime).toLocaleDateString() : 'N/A'}
   - [Read More](${item.link})
`).join('') : 'No recent news available for this stock.'}

## Market Context
${quote.regularMarketChangePercent && quote.regularMarketChangePercent > 0 ? 
  `The stock is up ${quote.regularMarketChangePercent.toFixed(2)}% today, which may be reflected in recent news coverage.` :
  quote.regularMarketChangePercent && quote.regularMarketChangePercent < 0 ?
  `The stock is down ${Math.abs(quote.regularMarketChangePercent).toFixed(2)}% today, which may be reflected in recent news coverage.` :
  'The stock price has remained relatively stable today.'}

## Analysis
${news.length > 0 ? 
  'Recent news coverage can provide insights into market sentiment and potential catalysts affecting the stock price. Consider the following factors when analyzing the news:' :
  'While no recent news is available, consider checking other sources for the latest developments affecting this stock.'}

- **Sentiment Analysis**: Look for positive or negative language in headlines
- **Catalyst Events**: Identify specific events or announcements that may impact the stock
- **Market Reaction**: Consider how the market has responded to recent news
- **Long-term Trends**: Look for patterns in news coverage over time

**Disclaimer**: News analysis is for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Latest news and analysis for ${symbol}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'portfolio_analysis': {
        const symbols = (args?.symbols as string)?.split(',').map(s => s.trim()) || [];
        if (symbols.length === 0) {
          throw new Error('At least one symbol is required for portfolio analysis');
        }

        const quotes = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await getQuote(symbol);
              return { symbol, quote, success: true };
            } catch (error) {
              return { symbol, error: error instanceof Error ? error.message : 'Unknown error', success: false };
            }
          })
        );

        const successfulQuotes = quotes.filter(q => q.success && q.quote);
        const totalValue = successfulQuotes.reduce((sum, q) => sum + (q.quote?.regularMarketPrice || 0), 0);
        const totalChange = successfulQuotes.reduce((sum, q) => sum + (q.quote?.regularMarketChange || 0), 0);
        const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

        let prompt = `# Portfolio Analysis

## Portfolio Summary
- **Total Stocks**: ${successfulQuotes.length}
- **Total Value**: $${totalValue.toFixed(2)}
- **Total Change**: $${totalChange.toFixed(2)} (${totalChangePercent.toFixed(2)}%)

## Individual Holdings

| Symbol | Price | Change | Change % | Weight | Performance |
|--------|-------|--------|----------|--------|-------------|`;

        successfulQuotes.forEach(({ symbol, quote }) => {
          if (quote) {
            const weight = totalValue > 0 ? ((quote.regularMarketPrice || 0) / totalValue * 100).toFixed(1) : '0.0';
            const performance = quote.regularMarketChangePercent && quote.regularMarketChangePercent > 0 ? '🟢' : 
                              quote.regularMarketChangePercent && quote.regularMarketChangePercent < 0 ? '🔴' : '⚪';
            prompt += `\n| ${symbol} | $${quote.regularMarketPrice?.toFixed(2) || 'N/A'} | $${quote.regularMarketChange?.toFixed(2) || 'N/A'} | ${quote.regularMarketChangePercent?.toFixed(2) || 'N/A'}% | ${weight}% | ${performance} |`;
          }
        });

        if (quotes.filter(q => !q.success).length > 0) {
          prompt += `\n\n## Failed to fetch data for:
${quotes.filter(q => !q.success).map(q => `- ${q.symbol}: ${q.error}`).join('\n')}`;
        }

        prompt += `\n\n## Portfolio Analysis

### Performance Metrics
- **Best Performer**: ${successfulQuotes.reduce((best, current) => 
  (current.quote?.regularMarketChangePercent || 0) > (best.quote?.regularMarketChangePercent || 0) ? current : best
).symbol} (${successfulQuotes.reduce((best, current) => 
  (current.quote?.regularMarketChangePercent || 0) > (best.quote?.regularMarketChangePercent || 0) ? current : best
).quote?.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)

- **Worst Performer**: ${successfulQuotes.reduce((worst, current) => 
  (current.quote?.regularMarketChangePercent || 0) < (worst.quote?.regularMarketChangePercent || 0) ? current : worst
).symbol} (${successfulQuotes.reduce((worst, current) => 
  (current.quote?.regularMarketChangePercent || 0) < (worst.quote?.regularMarketChangePercent || 0) ? current : worst
).quote?.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)

### Diversification Analysis
${successfulQuotes.length > 1 ? 
  `Your portfolio consists of ${successfulQuotes.length} different stocks. Consider the following for better diversification:

- **Sector Diversification**: Ensure you're not over-concentrated in one sector
- **Market Cap Diversification**: Balance between large-cap, mid-cap, and small-cap stocks
- **Geographic Diversification**: Consider international exposure
- **Risk Management**: Monitor correlation between holdings` : 
  'Consider adding more stocks to your portfolio for better diversification.'}

### Recommendations
1. **Regular Monitoring**: Check your portfolio performance regularly
2. **Rebalancing**: Consider rebalancing if any single stock becomes too large a percentage
3. **Risk Assessment**: Evaluate your risk tolerance and adjust accordingly
4. **Tax Considerations**: Consider tax implications of any changes

**Disclaimer**: This portfolio analysis is for informational purposes only and should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.`;

        return {
          description: `Portfolio analysis for ${symbols.length} stocks`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'technical_insights': {
        const symbol = args?.symbol as string;
        if (!symbol) {
          throw new Error('Symbol is required for technical insights');
        }

        const insights = await getInsights(symbol);

        const prompt = `# Technical Analysis Insights: ${symbol}

## Key Technical Indicators
${insights.instrumentInfo?.keyTechnicals ? `
- **Support Level**: ${insights.instrumentInfo.keyTechnicals.support ? `$${insights.instrumentInfo.keyTechnicals.support}` : 'N/A'}
- **Resistance Level**: ${insights.instrumentInfo.keyTechnicals.resistance ? `$${insights.instrumentInfo.keyTechnicals.resistance}` : 'N/A'}
- **Stop Loss**: ${insights.instrumentInfo.keyTechnicals.stopLoss ? `$${insights.instrumentInfo.keyTechnicals.stopLoss}` : 'N/A'}
` : 'Technical indicators not available'}

## Market Outlook
${insights.instrumentInfo?.technicalEvents ? `
### Short Term (1-3 months)
- **Direction**: ${insights.instrumentInfo.technicalEvents.shortTermOutlook?.direction || 'N/A'}
- **Score**: ${insights.instrumentInfo.technicalEvents.shortTermOutlook?.score || 'N/A'}
- **Description**: ${insights.instrumentInfo.technicalEvents.shortTermOutlook?.scoreDescription || 'N/A'}

### Intermediate Term (3-6 months)
- **Direction**: ${insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction || 'N/A'}
- **Score**: ${insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.score || 'N/A'}
- **Description**: ${insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.scoreDescription || 'N/A'}

### Long Term (6+ months)
- **Direction**: ${insights.instrumentInfo.technicalEvents.longTermOutlook?.direction || 'N/A'}
- **Score**: ${insights.instrumentInfo.technicalEvents.longTermOutlook?.score || 'N/A'}
- **Description**: ${insights.instrumentInfo.technicalEvents.longTermOutlook?.scoreDescription || 'N/A'}
` : 'Market outlook not available'}

## Valuation Analysis
${insights.instrumentInfo?.valuation ? `
- **Provider**: ${insights.instrumentInfo.valuation.provider || 'N/A'}
- **Description**: ${insights.instrumentInfo.valuation.description || 'N/A'}
- **Relative Value**: ${insights.instrumentInfo.valuation.relativeValue || 'N/A'}
- **Discount**: ${insights.instrumentInfo.valuation.discount || 'N/A'}
` : 'Valuation analysis not available'}

## Company Snapshot
${insights.companySnapshot ? `
### Company Metrics
- **Innovativeness**: ${insights.companySnapshot.company?.innovativeness || 'N/A'}
- **Hiring**: ${insights.companySnapshot.company?.hiring || 'N/A'}
- **Sustainability**: ${insights.companySnapshot.company?.sustainability || 'N/A'}
- **Insider Sentiments**: ${insights.companySnapshot.company?.insiderSentiments || 'N/A'}
- **Earnings Reports**: ${insights.companySnapshot.company?.earningsReports || 'N/A'}
- **Dividends**: ${insights.companySnapshot.company?.dividends || 'N/A'}

### Sector Comparison
- **Sector**: ${insights.companySnapshot.sectorInfo || 'N/A'}
- **Sector Innovativeness**: ${insights.companySnapshot.sector?.innovativeness || 'N/A'}
- **Sector Hiring**: ${insights.companySnapshot.sector?.hiring || 'N/A'}
- **Sector Sustainability**: ${insights.companySnapshot.sector?.sustainability || 'N/A'}
- **Sector Insider Sentiments**: ${insights.companySnapshot.sector?.insiderSentiments || 'N/A'}
- **Sector Earnings Reports**: ${insights.companySnapshot.sector?.earningsReports || 'N/A'}
- **Sector Dividends**: ${insights.companySnapshot.sector?.dividends || 'N/A'}
` : 'Company snapshot not available'}

## Investment Recommendation
${insights.recommendation ? `
- **Rating**: ${insights.recommendation.rating || 'N/A'}
- **Target Price**: ${insights.recommendation.targetPrice ? `$${insights.recommendation.targetPrice}` : 'N/A'}
- **Provider**: ${insights.recommendation.provider || 'N/A'}
` : 'Investment recommendation not available'}

**Disclaimer**: Technical analysis is for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Technical insights for ${symbol}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'chart_analysis': {
        const symbol = args?.symbol as string;
        if (!symbol) {
          throw new Error('Symbol is required for chart analysis');
        }

        const period = args?.period as string || '1mo';
        const chartData = await getChart(symbol, undefined, undefined, period);

        const prompt = `# Chart Analysis: ${symbol}

## Chart Data Summary
- **Symbol**: ${symbol}
- **Period**: ${period}
- **Data Points**: ${Array.isArray(chartData) ? chartData.length : 'N/A'}

## Technical Analysis
${Array.isArray(chartData) && chartData.length > 0 ? `
### Price Movement
- **Current Price**: $${chartData[chartData.length - 1]?.close || 'N/A'}
- **Period High**: $${Math.max(...chartData.map(d => d.high || 0))}
- **Period Low**: $${Math.min(...chartData.map(d => d.low || 0))}
- **Price Range**: $${(Math.max(...chartData.map(d => d.high || 0)) - Math.min(...chartData.map(d => d.low || 0))).toFixed(2)}

### Volume Analysis
- **Average Volume**: ${(chartData.reduce((sum, d) => sum + (d.volume || 0), 0) / chartData.length).toFixed(0)}
- **Highest Volume**: ${Math.max(...chartData.map(d => d.volume || 0))}
- **Lowest Volume**: ${Math.min(...chartData.map(d => d.volume || 0))}

### Trend Analysis
${chartData.length > 1 ? `
- **Price Change**: $${(chartData[chartData.length - 1]?.close - chartData[0]?.close).toFixed(2)}
- **Percentage Change**: ${(((chartData[chartData.length - 1]?.close - chartData[0]?.close) / chartData[0]?.close) * 100).toFixed(2)}%
- **Trend Direction**: ${chartData[chartData.length - 1]?.close > chartData[0]?.close ? 'Upward' : 'Downward'}
` : 'Insufficient data for trend analysis'}
` : 'Chart data not available'}

## Key Observations
${Array.isArray(chartData) && chartData.length > 0 ? `
1. **Price Action**: ${chartData[chartData.length - 1]?.close > chartData[0]?.close ? 'The stock has gained value over the selected period.' : 'The stock has lost value over the selected period.'}
2. **Volatility**: ${chartData.length > 1 ? (Math.max(...chartData.map(d => d.high || 0)) - Math.min(...chartData.map(d => d.low || 0))) > (chartData[0]?.close * 0.1) ? 'High volatility observed' : 'Moderate volatility' : 'Cannot determine volatility'}
3. **Volume Pattern**: ${chartData.reduce((sum, d) => sum + (d.volume || 0), 0) / chartData.length > 1000000 ? 'High volume activity' : 'Normal volume activity'}
` : 'No observations available'}

**Disclaimer**: Chart analysis is for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Chart analysis for ${symbol} (${period})`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'comprehensive_summary': {
        const symbol = args?.symbol as string;
        if (!symbol) {
          throw new Error('Symbol is required for comprehensive summary');
        }

        const summary = await getQuoteSummary(symbol);

        const prompt = `# Comprehensive Financial Summary: ${symbol}

## Company Overview
${summary.summaryProfile ? `
- **Company Name**: ${summary.summaryProfile.longName || 'N/A'}
- **Industry**: ${summary.summaryProfile.industry || 'N/A'}
- **Sector**: ${summary.summaryProfile.sector || 'N/A'}
- **Website**: ${summary.summaryProfile.website || 'N/A'}
- **Employees**: ${summary.summaryProfile.fullTimeEmployees || 'N/A'}
- **Description**: ${summary.summaryProfile.longBusinessSummary || 'N/A'}
` : 'Company overview not available'}

## Financial Highlights
${summary.financialData ? `
- **Total Cash**: $${summary.financialData.totalCash ? (summary.financialData.totalCash / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Total Debt**: $${summary.financialData.totalDebt ? (summary.financialData.totalDebt / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Free Cash Flow**: $${summary.financialData.freeCashflow ? (summary.financialData.freeCashflow / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Operating Cash Flow**: $${summary.financialData.operatingCashflow ? (summary.financialData.operatingCashflow / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Revenue Growth**: ${summary.financialData.revenueGrowth ? (summary.financialData.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
- **Profit Margins**: ${summary.financialData.profitMargins ? (summary.financialData.profitMargins * 100).toFixed(2) + '%' : 'N/A'}
` : 'Financial highlights not available'}

## Key Metrics
${summary.defaultKeyStatistics ? `
- **Market Cap**: $${summary.defaultKeyStatistics.marketCap ? (summary.defaultKeyStatistics.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Enterprise Value**: $${summary.defaultKeyStatistics.enterpriseValue ? (summary.defaultKeyStatistics.enterpriseValue / 1e9).toFixed(2) + 'B' : 'N/A'}
- **P/E Ratio**: ${summary.defaultKeyStatistics.trailingPE || 'N/A'}
- **Forward P/E**: ${summary.defaultKeyStatistics.forwardPE || 'N/A'}
- **PEG Ratio**: ${summary.defaultKeyStatistics.pegRatio || 'N/A'}
- **Price to Book**: ${summary.defaultKeyStatistics.priceToBook || 'N/A'}
- **Price to Sales**: ${summary.defaultKeyStatistics.priceToSalesTrailing12Months || 'N/A'}
- **Dividend Yield**: ${summary.defaultKeyStatistics.dividendYield ? (summary.defaultKeyStatistics.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
- **Beta**: ${summary.defaultKeyStatistics.beta || 'N/A'}
` : 'Key metrics not available'}

## Analyst Recommendations
${summary.recommendationTrend ? `
- **Overall Recommendation**: ${summary.recommendationTrend.trend || 'N/A'}
- **Strong Buy**: ${summary.recommendationTrend.strongBuy || 0}
- **Buy**: ${summary.recommendationTrend.buy || 0}
- **Hold**: ${summary.recommendationTrend.hold || 0}
- **Sell**: ${summary.recommendationTrend.sell || 0}
- **Strong Sell**: ${summary.recommendationTrend.strongSell || 0}
- **Target Mean Price**: $${summary.recommendationTrend.targetMeanPrice || 'N/A'}
- **Target High Price**: $${summary.recommendationTrend.targetHighPrice || 'N/A'}
- **Target Low Price**: $${summary.recommendationTrend.targetLowPrice || 'N/A'}
` : 'Analyst recommendations not available'}

## Earnings Information
${summary.calendarEvents ? `
- **Next Earnings Date**: ${summary.calendarEvents.earnings?.earningsDate ? new Date(summary.calendarEvents.earnings.earningsDate[0] * 1000).toLocaleDateString() : 'N/A'}
- **Ex-Dividend Date**: ${summary.calendarEvents.exDividendDate ? new Date(summary.calendarEvents.exDividendDate * 1000).toLocaleDateString() : 'N/A'}
- **Dividend Date**: ${summary.calendarEvents.dividendDate ? new Date(summary.calendarEvents.dividendDate * 1000).toLocaleDateString() : 'N/A'}
` : 'Earnings information not available'}

**Disclaimer**: This comprehensive summary is for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Comprehensive summary for ${symbol}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'fundamentals_analysis': {
        const symbol = args?.symbol as string;
        if (!symbol) {
          throw new Error('Symbol is required for fundamentals analysis');
        }

        const period = args?.period as string || '1y';
        const fundamentals = await getFundamentalsTimeSeries(symbol);

        const prompt = `# Fundamentals Analysis: ${symbol}

## Time Series Data
- **Symbol**: ${symbol}
- **Analysis Period**: ${period}
- **Data Available**: ${fundamentals ? 'Yes' : 'No'}

## Key Financial Metrics
${fundamentals ? `
### Revenue Trends
${fundamentals.revenue ? `
- **Current Revenue**: $${fundamentals.revenue[fundamentals.revenue.length - 1]?.revenue ? (fundamentals.revenue[fundamentals.revenue.length - 1].revenue / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Revenue Growth**: ${fundamentals.revenue.length > 1 ? (((fundamentals.revenue[fundamentals.revenue.length - 1]?.revenue || 0) - (fundamentals.revenue[fundamentals.revenue.length - 2]?.revenue || 0)) / (fundamentals.revenue[fundamentals.revenue.length - 2]?.revenue || 1) * 100).toFixed(2) + '%' : 'N/A'}
` : 'Revenue data not available'}

### Profitability Metrics
${fundamentals.netIncome ? `
- **Current Net Income**: $${fundamentals.netIncome[fundamentals.netIncome.length - 1]?.netIncome ? (fundamentals.netIncome[fundamentals.netIncome.length - 1].netIncome / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Net Income Growth**: ${fundamentals.netIncome.length > 1 ? (((fundamentals.netIncome[fundamentals.netIncome.length - 1]?.netIncome || 0) - (fundamentals.netIncome[fundamentals.netIncome.length - 2]?.netIncome || 0)) / (fundamentals.netIncome[fundamentals.netIncome.length - 2]?.netIncome || 1) * 100).toFixed(2) + '%' : 'N/A'}
` : 'Net income data not available'}

### Cash Flow Analysis
${fundamentals.operatingCashflow ? `
- **Operating Cash Flow**: $${fundamentals.operatingCashflow[fundamentals.operatingCashflow.length - 1]?.operatingCashflow ? (fundamentals.operatingCashflow[fundamentals.operatingCashflow.length - 1].operatingCashflow / 1e9).toFixed(2) + 'B' : 'N/A'}
- **Free Cash Flow**: $${fundamentals.freeCashflow ? (fundamentals.freeCashflow[fundamentals.freeCashflow.length - 1]?.freeCashflow ? (fundamentals.freeCashflow[fundamentals.freeCashflow.length - 1].freeCashflow / 1e9).toFixed(2) + 'B' : 'N/A') : 'N/A'}
` : 'Cash flow data not available'}
` : 'Fundamentals data not available'}

## Analysis Summary
${fundamentals ? `
1. **Financial Health**: ${fundamentals.netIncome && fundamentals.netIncome[fundamentals.netIncome.length - 1]?.netIncome > 0 ? 'Positive net income indicates profitability' : 'Negative or zero net income raises concerns'}
2. **Growth Trajectory**: ${fundamentals.revenue && fundamentals.revenue.length > 1 ? (fundamentals.revenue[fundamentals.revenue.length - 1]?.revenue > fundamentals.revenue[fundamentals.revenue.length - 2]?.revenue ? 'Revenue growth observed' : 'Revenue decline observed') : 'Insufficient data for growth analysis'}
3. **Cash Management**: ${fundamentals.operatingCashflow && fundamentals.operatingCashflow[fundamentals.operatingCashflow.length - 1]?.operatingCashflow > 0 ? 'Positive operating cash flow indicates good cash management' : 'Negative operating cash flow raises concerns'}
` : 'Analysis summary not available'}

**Disclaimer**: Fundamentals analysis is for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Fundamentals analysis for ${symbol} (${period})`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'trending_analysis': {
        const count = Number(args?.count) || 10;
        const trending = await getTrendingSymbols(count);

        const prompt = `# Trending Market Analysis

## Top Trending Symbols
${trending && trending.quotes ? `
${trending.quotes.slice(0, count).map((quote, index) => `
${index + 1}. **${quote.symbol}** - ${quote.longName || quote.shortName || 'N/A'}
   - **Price**: $${quote.regularMarketPrice?.toFixed(2) || 'N/A'}
   - **Change**: ${quote.regularMarketChange?.toFixed(2) || 'N/A'} (${quote.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)
   - **Volume**: ${quote.regularMarketVolume?.toLocaleString() || 'N/A'}
   - **Market Cap**: $${quote.marketCap ? (quote.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
`).join('')}
` : 'No trending data available'}

## Market Insights
${trending && trending.quotes ? `
- **Total Symbols Analyzed**: ${trending.quotes.length}
- **Average Change**: ${trending.quotes.reduce((sum, q) => sum + (q.regularMarketChangePercent || 0), 0) / trending.quotes.length}%
- **Top Gainer**: ${trending.quotes.reduce((max, q) => (q.regularMarketChangePercent || 0) > (max.regularMarketChangePercent || 0) ? q : max, trending.quotes[0])?.symbol || 'N/A'}
- **Top Loser**: ${trending.quotes.reduce((min, q) => (q.regularMarketChangePercent || 0) < (min.regularMarketChangePercent || 0) ? q : min, trending.quotes[0])?.symbol || 'N/A'}
` : 'Market insights not available'}

## Sector Analysis
${trending && trending.quotes ? `
${trending.quotes.reduce((acc, quote) => {
  const sector = quote.sector || 'Unknown';
  acc[sector] = (acc[sector] || 0) + 1;
  return acc;
}, {} as Record<string, number>)}` : 'Sector analysis not available'}

**Disclaimer**: Trending analysis is for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Trending analysis (${count} symbols)`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }


      case 'stock_screener': {
        const criteria = args?.criteria as string || 'market cap > 1B';
        const count = Number(args?.count) || 10;
        const screener = await getScreener(criteria, count);

        const prompt = `# Stock Screener Results

## Screening Criteria
- **Criteria**: ${criteria}
- **Results Requested**: ${count}
- **Results Found**: ${screener && screener.quotes ? screener.quotes.length : 0}

## Screened Stocks
${screener && screener.quotes ? `
${screener.quotes.slice(0, count).map((quote, index) => `
${index + 1}. **${quote.symbol}** - ${quote.longName || quote.shortName || 'N/A'}
   - **Price**: $${quote.regularMarketPrice?.toFixed(2) || 'N/A'}
   - **Change**: ${quote.regularMarketChange?.toFixed(2) || 'N/A'} (${quote.regularMarketChangePercent?.toFixed(2) || 'N/A'}%)
   - **Volume**: ${quote.regularMarketVolume?.toLocaleString() || 'N/A'}
   - **Market Cap**: $${quote.marketCap ? (quote.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
   - **P/E Ratio**: ${quote.trailingPE || 'N/A'}
   - **Dividend Yield**: ${quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
`).join('')}
` : 'No screener results available'}

## Screening Analysis
${screener && screener.quotes ? `
- **Average Price**: $${(screener.quotes.reduce((sum, q) => sum + (q.regularMarketPrice || 0), 0) / screener.quotes.length).toFixed(2)}
- **Average Change**: ${(screener.quotes.reduce((sum, q) => sum + (q.regularMarketChangePercent || 0), 0) / screener.quotes.length).toFixed(2)}%
- **Average Volume**: ${(screener.quotes.reduce((sum, q) => sum + (q.regularMarketVolume || 0), 0) / screener.quotes.length).toLocaleString()}
- **Average Market Cap**: $${(screener.quotes.reduce((sum, q) => sum + (q.marketCap || 0), 0) / screener.quotes.length / 1e9).toFixed(2)}B
` : 'Screening analysis not available'}

## Sector Distribution
${screener && screener.quotes ? `
${screener.quotes.reduce((acc, quote) => {
  const sector = quote.sector || 'Unknown';
  acc[sector] = (acc[sector] || 0) + 1;
  return acc;
}, {} as Record<string, number>)}` : 'Sector distribution not available'}

**Disclaimer**: Stock screener results are for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: `Stock screener results (${criteria})`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      case 'search_suggestions': {
        const suggestions = await getAutoc();

        const prompt = `# Stock Search Suggestions

## Auto-Complete Suggestions
${suggestions ? `
${Array.isArray(suggestions) ? suggestions.map((suggestion, index) => `
${index + 1}. **${suggestion.symbol || suggestion}** - ${suggestion.name || suggestion.longName || 'N/A'}
`).join('') : 'No suggestions available'}
` : 'Search suggestions not available'}

## How to Use
1. **Start Typing**: Begin typing a company name or symbol
2. **Browse Suggestions**: Review the auto-complete suggestions
3. **Select Symbol**: Choose the correct symbol for your analysis
4. **Get Data**: Use the selected symbol to get quotes, charts, and analysis

## Popular Searches
- **Technology**: AAPL, MSFT, GOOGL, AMZN, TSLA
- **Finance**: JPM, BAC, WFC, GS, MS
- **Healthcare**: JNJ, PFE, UNH, ABBV, MRK
- **Energy**: XOM, CVX, COP, EOG, SLB
- **Consumer**: PG, KO, PEP, WMT, HD

**Disclaimer**: Search suggestions are for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a qualified financial advisor.`;

        return {
          description: 'Stock search suggestions',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: prompt,
              },
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      description: `Error: ${errorMessage}`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Error executing prompt "${name}": ${errorMessage}`,
          },
        },
      ],
    };
  }
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_quote': {
        const { symbol } = GetQuoteSchema.parse(args);
        const result = await getQuote(symbol);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_historical_data': {
        const { symbol, period1, period2, interval } = GetHistoricalDataSchema.parse(args);
        const result = await getHistoricalData(symbol, period1, period2, interval);
        
        // Add symbol to the response for frontend consumption
        const responseWithSymbol = {
          symbol: symbol,
          data: result,
          count: result.length,
          period: {
            start: period1,
            end: period2,
            interval: interval || '1d'
          }
        };
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(responseWithSymbol, null, 2),
            },
          ],
        };
      }

      case 'search_symbols': {
        const { query } = SearchSymbolsSchema.parse(args);
        const result = await searchSymbols(query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_market_summary': {
        const result = await getMarketSummary();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_news': {
        const { symbol, count } = GetNewsSchema.parse(args);
        const result = await getNews(symbol, count);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_recommendations': {
        const { symbol } = GetRecommendationsSchema.parse(args);
        const result = await getRecommendations(symbol);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_financials': {
        const { symbol, type } = GetFinancialsSchema.parse(args);
        const result = await getFinancials(symbol, type);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_options': {
        const { symbol, expiration } = GetOptionsSchema.parse(args);
        const result = await getOptions(symbol, expiration);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_trending_stocks': {
        const { count = 5 } = GetTrendingStocksSchema.parse(args);
        const result = await getTrendingStocks(count);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_trending_etfs': {
        const { count = 5 } = GetTrendingETFsSchema.parse(args);
        const result = await getTrendingETFs(count);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_insights': {
        const { symbol } = GetInsightsSchema.parse(args);
        const result = await getInsights(symbol);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_chart': {
        const { symbol, period1, period2, interval } = GetChartSchema.parse(args);
        const result = await getChart(symbol, period1, period2, interval);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_quote_summary': {
        const { symbol, modules } = GetQuoteSummarySchema.parse(args);
        const result = await getQuoteSummary(symbol, modules);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_fundamentals_timeseries': {
        const { symbol, period1, period2 } = GetFundamentalsTimeSeriesSchema.parse(args);
        const result = await getFundamentalsTimeSeries(symbol, period1, period2);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_trending_symbols': {
        const { count = 10 } = GetTrendingSymbolsSchema.parse(args);
        const result = await getTrendingSymbols(count);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }


      case 'get_screener': {
        const { criteria, count = 10 } = GetScreenerSchema.parse(args);
        const result = await getScreener(criteria, count);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_autoc': {
        const result = await getAutoc();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Yahoo Finance MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
