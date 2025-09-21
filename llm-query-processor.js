import axios from 'axios';

class LLMQueryProcessor {
  constructor() {
    this.ollamaUrl = 'http://localhost:11434';
    this.model = 'phi3:mini';
    this.availableTools = new Set();
    this.toolCapabilities = new Map();
  }

  /**
   * Initialize the LLM query processor with available tools
   */
  async initialize(availableTools, toolCapabilities) {
    // Convert Map to Set for tool names
    this.availableTools = new Set(availableTools.keys());
    this.toolCapabilities = toolCapabilities;
    console.log('LLM Query Processor initialized with', this.availableTools.size, 'tools');
  }

  /**
   * Check if Ollama is running and model is available
   */
  async checkOllamaStatus() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 3000 });
      const models = response.data.models || [];
      const hasModel = models.some(model => model.name.includes(this.model.split(':')[0]));
      
      if (!hasModel) {
        console.log(`${this.model} model not found. Available models:`, models.map(m => m.name));
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('Ollama not running or not accessible (corporate firewall may be blocking):', error.message);
      return false;
    }
  }

  /**
   * Process user query using LLM to determine the best tool and parameters
   */
  async processQuery(userQuery) {
    try {
      // Check if Ollama is available
      const isOllamaReady = await this.checkOllamaStatus();
      if (!isOllamaReady) {
        console.log('Ollama not ready, falling back to rule-based processing');
        return this.fallbackProcessing(userQuery);
      }

      // Create context about available tools
      const toolsContext = this.createToolsContext();
      
      const prompt = `Select tool for: "${userQuery}"

Tools: get_quote, get_trending_stocks, get_trending_etfs, search_symbols, get_historical_data

Respond with JSON only:
{"tool": "tool_name", "parameters": {"symbol": "AAPL"}, "reasoning": "reason", "confidence": 0.95}

Examples:
"Apple stock" → {"tool": "get_quote", "parameters": {"symbol": "AAPL"}, "reasoning": "Single stock", "confidence": 0.95}
"Compare Apple Microsoft" → {"tool": "get_quote", "parameters": {"symbol": "AAPL"}, "reasoning": "Comparison", "confidence": 0.9}
"Trending stocks" → {"tool": "get_trending_stocks", "parameters": {"count": 10}, "reasoning": "Multiple stocks", "confidence": 0.9}`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
        temperature: 0.01,
        top_p: 0.7,
        max_tokens: 600
        }
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        }
      });

      const responseText = response.data.response;
      console.log('LLM Response:', responseText);

      // Parse the JSON response with better error handling
      try {
        // Clean up the response text first
        let cleanedResponse = responseText.trim();
        
        // Remove any markdown code blocks
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Find JSON object
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonStr = jsonMatch[0];
          
          // Fix common JSON issues
          jsonStr = jsonStr.replace(/00\.(\d+)/g, '0.$1'); // Fix double zero decimals
          jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          const result = JSON.parse(jsonStr);
          
          // Validate the tool exists
          if (this.availableTools.has(result.tool)) {
            console.log(`LLM selected valid tool: ${result.tool} with parameters:`, result.parameters);
            return {
              tool: result.tool,
              parameters: result.parameters || {},
              reasoning: result.reasoning,
              confidence: Math.min(Math.max(result.confidence || 0.8, 0), 1), // Clamp confidence between 0-1
              source: 'llm'
            };
          } else {
            console.log(`LLM selected invalid tool: ${result.tool}`);
            console.log(`Available tools:`, Array.from(this.availableTools));
          }
        }
      } catch (parseError) {
        console.log('Failed to parse LLM response as JSON:', parseError.message);
        console.log('Raw response:', responseText);
      }

      // Fallback if LLM response is invalid
      return this.fallbackProcessing(userQuery);

    } catch (error) {
      console.log('LLM processing failed:', error.message);
      return this.fallbackProcessing(userQuery);
    }
  }

  /**
   * Create a context string describing available tools
   */
  createToolsContext() {
    let context = '';
    for (const toolName of this.availableTools) {
      const capabilities = this.toolCapabilities.get(toolName) || {};
      context += `- ${toolName}: ${capabilities.description || 'No description available'}\n`;
      if (capabilities.keywords) {
        context += `  Keywords: ${capabilities.keywords.join(', ')}\n`;
      }
      if (capabilities.inputSchema && capabilities.inputSchema.properties) {
        const params = Object.keys(capabilities.inputSchema.properties);
        if (params.length > 0) {
          context += `  Parameters: ${params.join(', ')}\n`;
        }
      }
      context += '\n';
    }
    return context;
  }

  /**
   * Enhanced fallback processing when LLM is not available
   */
  fallbackProcessing(userQuery) {
    const query = userQuery.toLowerCase();
    
    // Extract count if mentioned
    const countMatch = query.match(/(\d+)/);
    const count = countMatch ? parseInt(countMatch[1]) : 5;
    
    // Comparison queries - handle these first
    if (query.includes('compare') || query.includes('vs') || query.includes('versus') || 
        query.includes('comparison') || query.includes('side by side')) {
      
      // Extract company names/symbols for comparison
      const symbols = [];
      
      // Common company name mappings
      const companyMap = {
        'apple': 'AAPL',
        'microsoft': 'MSFT', 
        'google': 'GOOGL',
        'amazon': 'AMZN',
        'tesla': 'TSLA',
        'meta': 'META',
        'nvidia': 'NVDA',
        'netflix': 'NFLX',
        'uber': 'UBER',
        'spotify': 'SPOT'
      };
      
      // Check for company names
      Object.keys(companyMap).forEach(company => {
        if (query.includes(company)) {
          symbols.push(companyMap[company]);
        }
      });
      
      // Check for stock symbols (3-5 uppercase letters)
      const symbolRegex = /\b[A-Z]{3,5}\b/g;
      const foundSymbols = userQuery.match(symbolRegex);
      if (foundSymbols) {
        symbols.push(...foundSymbols);
      }
      
      // Remove duplicates and get first symbol for fallback
      const uniqueSymbols = [...new Set(symbols)];
      const firstSymbol = uniqueSymbols[0] || 'AAPL';
      
      return {
        tool: 'get_quote',
        parameters: { symbol: firstSymbol },
        reasoning: `Comparison query detected with symbols: ${uniqueSymbols.join(', ')}. Using first symbol for fallback.`,
        confidence: 0.85,
        source: 'enhanced_fallback'
      };
    }
    
    // Check for multi-stock queries first (before single stock queries)
    if (query.includes('top') || query.includes('best') || query.includes('highest') || 
        query.includes('most') || query.includes('list') || query.includes('show me')) {
      
      // Dividend-specific queries
      if (query.includes('dividend')) {
        return {
          tool: 'get_screener',
          parameters: { 
            criteria: 'dividend_yield',
            count: count,
            sort: 'dividend_yield_desc'
          },
          reasoning: 'Query appears to be asking for high dividend stocks',
          confidence: 0.9,
          source: 'enhanced_fallback'
        };
      }
      
      // Market cap queries
      if (query.includes('market cap') || query.includes('marketcap') || query.includes('largest')) {
        return {
          tool: 'get_trending_stocks',
          parameters: { count: count },
          reasoning: 'Query appears to be asking for top stocks by market cap',
          confidence: 0.8,
          source: 'enhanced_fallback'
        };
      }
      
      // Performance queries
      if (query.includes('performing') || query.includes('gaining') || query.includes('winning')) {
        return {
          tool: 'get_trending_stocks',
          parameters: { count: count },
          reasoning: 'Query appears to be asking for top performing stocks',
          confidence: 0.8,
          source: 'enhanced_fallback'
        };
      }
      
      // Generic top stocks
      return {
        tool: 'get_trending_stocks',
        parameters: { count: count },
        reasoning: 'Query appears to be asking for top/trending stocks',
        confidence: 0.7,
        source: 'enhanced_fallback'
      };
    }
    
    // Single stock queries (only if not multi-stock)
    if (query.includes('quote') || query.includes('price') || query.includes('stock') || 
        query.includes('current') || query.includes('latest')) {
      return {
        tool: 'get_quote',
        parameters: { symbol: this.extractSymbol(userQuery) },
        reasoning: 'Query appears to be asking for current stock quote/price',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('historical') || query.includes('chart') || query.includes('history') ||
        query.includes('past') || query.includes('performance')) {
      return {
        tool: 'get_historical_data',
        parameters: { symbol: this.extractSymbol(userQuery) },
        reasoning: 'Query appears to be asking for historical data or charts',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('trending') || query.includes('top') || query.includes('popular') ||
        query.includes('most active') || query.includes('hot')) {
      return {
        tool: 'get_trending_stocks',
        parameters: { count: count },
        reasoning: 'Query appears to be asking for trending or popular stocks',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    // Specific ETF types - use search for targeted searches
    if (query.includes('reit etf') || query.includes('real estate etf') || 
        query.includes('real estate investment trust') || query.includes('reit fund')) {
      return {
        tool: 'search_symbols',
        parameters: { 
          query: 'REIT ETF real estate'
        },
        reasoning: 'Query specifically mentions REIT ETFs - using search to find real estate ETFs',
        confidence: 0.95,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('bond etf') || query.includes('bond fund') || 
        query.includes('fixed income etf') || query.includes('treasury etf')) {
      return {
        tool: 'search_symbols',
        parameters: { 
          query: 'bond ETF treasury fixed income'
        },
        reasoning: 'Query specifically mentions bond ETFs - using search to find fixed income ETFs',
        confidence: 0.95,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('tech etf') || query.includes('technology etf') || 
        query.includes('sector etf') || query.includes('sector fund')) {
      return {
        tool: 'search_symbols',
        parameters: { 
          query: 'technology ETF sector'
        },
        reasoning: 'Query specifically mentions sector ETFs - using search to find sector-specific ETFs',
        confidence: 0.95,
        source: 'enhanced_fallback'
      };
    }
    
    // Generic ETF queries - use trending ETFs
    if (query.includes('etf') || query.includes('exchange traded fund') || 
        query.includes('diversified investing') || query.includes('popular etf')) {
      return {
        tool: 'get_trending_etfs',
        parameters: { count: count },
        reasoning: 'Query appears to be asking for general/popular ETFs',
        confidence: 0.9,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('search') || query.includes('find') || query.includes('company') ||
        query.includes('symbol') || query.includes('ticker')) {
      return {
        tool: 'search_symbols',
        parameters: { query: userQuery },
        reasoning: 'Query appears to be a search request for symbols or companies',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('news') || query.includes('headlines')) {
      return {
        tool: 'get_news',
        parameters: { symbol: this.extractSymbol(userQuery), count: count },
        reasoning: 'Query appears to be asking for news',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('insights') || query.includes('analysis') || query.includes('technical')) {
      return {
        tool: 'get_insights',
        parameters: { symbol: this.extractSymbol(userQuery) },
        reasoning: 'Query appears to be asking for technical analysis or insights',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('market') || query.includes('summary') || query.includes('overview')) {
      return {
        tool: 'get_market_summary',
        parameters: {},
        reasoning: 'Query appears to be asking for market summary or overview',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    if (query.includes('recommendations') || query.includes('analyst')) {
      return {
        tool: 'get_recommendations',
        parameters: { symbol: this.extractSymbol(userQuery) },
        reasoning: 'Query appears to be asking for analyst recommendations',
        confidence: 0.8,
        source: 'enhanced_fallback'
      };
    }
    
    // Default to trending stocks
    return {
      tool: 'get_trending_stocks',
      parameters: { count: count },
      reasoning: 'Default fallback to trending stocks',
      confidence: 0.6,
      source: 'enhanced_fallback'
    };
  }

  /**
   * Extract stock symbol from query (simplified version)
   */
  extractSymbol(query) {
    // Look for uppercase symbols
    const symbolMatch = query.match(/\b[A-Z]{1,5}\b/);
    if (symbolMatch) {
      return symbolMatch[0];
    }
    
    // Company name mapping
    const companyMap = {
      'apple': 'AAPL',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'amazon': 'AMZN',
      'tesla': 'TSLA',
      'meta': 'META',
      'nvidia': 'NVDA',
      'netflix': 'NFLX',
      'ford': 'F',
      'general motors': 'GM',
      'berkshire': 'BRK.A',
      'jpmorgan': 'JPM',
      'bank of america': 'BAC',
      'walmart': 'WMT',
      'coca cola': 'KO',
      'pepsi': 'PEP',
      'mcdonalds': 'MCD',
      'disney': 'DIS',
      'adobe': 'ADBE',
      'salesforce': 'CRM'
    };
    
    for (const [company, symbol] of Object.entries(companyMap)) {
      if (query.toLowerCase().includes(company)) {
        return symbol;
      }
    }
    
    return 'AAPL'; // Default fallback
  }

  /**
   * Generate intelligent widget suggestions based on query
   */
  async generateWidgetSuggestions(userQuery) {
    try {
      const isOllamaReady = await this.checkOllamaStatus();
      if (!isOllamaReady) {
        return this.getDefaultSuggestions();
      }

      const prompt = `Based on this financial query: "${userQuery}"

Generate 3-5 detailed, comprehensive financial queries that would be valuable for a professional financial dashboard. Each query should be:
- 15-30 words long with specific details
- Include company names, sectors, or specific metrics
- Cover different aspects: quotes, charts, analysis, news, comparisons
- Use professional financial terminology
- Include time periods, sectors, or specific data requirements

Examples of good detailed queries:
- "Show me Apple Inc. current stock price with P/E ratio, market cap, and 52-week range"
- "Display Microsoft Corporation historical chart for past 6 months with volume analysis"
- "Get top 5 high dividend yield stocks in technology sector with yield percentages"
- "Show me Tesla technical analysis with RSI, moving averages, and support levels"

Respond with a JSON array of detailed query strings.`;

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500
        }
      }, {
        timeout: 8000, // 8 second timeout for suggestions
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        }
      });

      const responseText = response.data.response;
      console.log('LLM Suggestions Response:', responseText);

      try {
        // Clean up the response text first
        let cleanedResponse = responseText.trim();
        
        // Remove any markdown code blocks
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Remove any invalid text that might be outside JSON
        const lines = cleanedResponse.split('\n');
        const jsonLines = [];
        let inJson = false;
        
        for (const line of lines) {
          if (line.trim().startsWith('[')) {
            inJson = true;
          }
          if (inJson) {
            jsonLines.push(line);
            if (line.trim().endsWith(']')) {
              break;
            }
          }
        }
        
        const jsonStr = jsonLines.join('\n');
        const suggestions = JSON.parse(jsonStr);
        return suggestions.filter(s => typeof s === 'string' && s.length > 0);
      } catch (parseError) {
        console.log('Failed to parse suggestions:', parseError.message);
        console.log('Raw suggestions response:', responseText);
      }

      return this.getDefaultSuggestions();

    } catch (error) {
      console.log('LLM suggestions failed:', error.message);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * Get default suggestions when LLM is not available
   */
  getDefaultSuggestions() {
    return [
      'Show me top 10 trending stocks by volume and price movement',
      'Get Apple Inc. current stock price with P/E ratio and market cap',
      'Display Microsoft Corporation historical chart for past 6 months',
      'Show me comprehensive market summary with major indices performance',
      'Get Tesla Inc. latest financial news and analyst recommendations',
      'Display top 5 high dividend yield stocks for income investors',
      'Show me NVIDIA technical analysis with RSI and moving averages',
      'Get Amazon stock quote with 52-week range and trading volume',
      'Display trending technology sector ETFs with holdings breakdown',
      'Show me Google Alphabet chart analysis with support and resistance levels'
    ];
  }
}

export default LLMQueryProcessor;
