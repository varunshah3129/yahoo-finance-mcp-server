import axios from 'axios';

export class MCPClient {
  constructor() {
    this.baseURL = 'http://localhost:3001'; // MCP server endpoint
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(message) {
    try {
      // Parse the message to determine the type of request
      const requestType = this.determineRequestType(message);
      
      if (requestType.type === 'prompt') {
        return await this.executePrompt(requestType.name, requestType.args, message);
      } else if (requestType.type === 'tool') {
        return await this.executeTool(requestType.name, requestType.args, message);
      } else {
        // Default to general analysis
        return await this.executePrompt('analyze_stock', { symbol: 'AAPL' }, message);
      }
    } catch (error) {
      console.error('MCP Client Error:', error);
      throw new Error(`Failed to communicate with MCP server: ${error.message}`);
    }
  }

  determineRequestType(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific prompts
    if (lowerMessage.includes('analyze') && lowerMessage.includes('stock')) {
      const symbol = this.extractSymbol(message);
      return { type: 'prompt', name: 'analyze_stock', args: { symbol } };
    }
    
    if (lowerMessage.includes('compare') && lowerMessage.includes('stock')) {
      const symbols = this.extractSymbols(message);
      return { type: 'prompt', name: 'compare_stocks', args: { symbols } };
    }
    
    if (lowerMessage.includes('market overview') || lowerMessage.includes('market summary')) {
      return { type: 'prompt', name: 'market_overview', args: {} };
    }
    
    if (lowerMessage.includes('find stock') || lowerMessage.includes('search stock')) {
      const query = this.extractSearchQuery(message);
      return { type: 'prompt', name: 'find_stocks', args: { query } };
    }
    
    if (lowerMessage.includes('portfolio') && lowerMessage.includes('analysis')) {
      const symbols = this.extractSymbols(message);
      return { type: 'prompt', name: 'portfolio_analysis', args: { symbols } };
    }
    
    if (lowerMessage.includes('news') && lowerMessage.includes('stock')) {
      const symbol = this.extractSymbol(message);
      return { type: 'prompt', name: 'stock_news', args: { symbol } };
    }
    
    // Check for tool requests
    if (lowerMessage.includes('quote') || lowerMessage.includes('price')) {
      const symbol = this.extractSymbol(message);
      return { type: 'tool', name: 'get_quote', args: { symbol } };
    }
    
    if (lowerMessage.includes('historical') || lowerMessage.includes('chart')) {
      const symbol = this.extractSymbol(message);
      return { type: 'tool', name: 'get_historical_data', args: { symbol } };
    }
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      const query = this.extractSearchQuery(message);
      return { type: 'tool', name: 'search_symbols', args: { query } };
    }
    
    // Default fallback
    return { type: 'prompt', name: 'analyze_stock', args: { symbol: 'AAPL' } };
  }

  extractSymbol(message) {
    // Common stock symbols to look for
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
    
    for (const symbol of commonSymbols) {
      if (message.toUpperCase().includes(symbol)) {
        return symbol;
      }
    }
    
    // Try to extract symbol from patterns like "Apple stock", "Microsoft", etc.
    const companyMap = {
      'apple': 'AAPL',
      'microsoft': 'MSFT',
      'google': 'GOOGL',
      'amazon': 'AMZN',
      'tesla': 'TSLA',
      'meta': 'META',
      'nvidia': 'NVDA',
      'netflix': 'NFLX',
      'amd': 'AMD',
      'intel': 'INTC'
    };
    
    for (const [company, symbol] of Object.entries(companyMap)) {
      if (message.toLowerCase().includes(company)) {
        return symbol;
      }
    }
    
    return 'AAPL'; // Default fallback
  }

  extractSymbols(message) {
    const symbols = [];
    const commonSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
    
    for (const symbol of commonSymbols) {
      if (message.toUpperCase().includes(symbol)) {
        symbols.push(symbol);
      }
    }
    
    return symbols.length > 0 ? symbols.join(',') : 'AAPL,MSFT,GOOGL';
  }

  extractSearchQuery(message) {
    // Extract search terms after keywords like "find", "search", "look for"
    const keywords = ['find', 'search', 'look for', 'show me'];
    
    for (const keyword of keywords) {
      const index = message.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        return message.substring(index + keyword.length).trim();
      }
    }
    
    return message;
  }

  async executePrompt(promptName, args, originalMessage) {
    try {
      // Simulate MCP server call - in real implementation, this would call your MCP server
      const mockResponse = await this.getMockPromptResponse(promptName, args, originalMessage);
      
      return {
        content: mockResponse.content,
        data: mockResponse.data,
        widgetType: mockResponse.widgetType
      };
    } catch (error) {
      throw new Error(`Failed to execute prompt ${promptName}: ${error.message}`);
    }
  }

  async executeTool(toolName, args, originalMessage) {
    try {
      // Simulate MCP server call - in real implementation, this would call your MCP server
      const mockResponse = await this.getMockToolResponse(toolName, args, originalMessage);
      
      return {
        content: mockResponse.content,
        data: mockResponse.data,
        widgetType: mockResponse.widgetType
      };
    } catch (error) {
      throw new Error(`Failed to execute tool ${toolName}: ${error.message}`);
    }
  }

  async getMockPromptResponse(promptName, args, originalMessage) {
    // This is a mock response - replace with actual MCP server calls
    switch (promptName) {
      case 'analyze_stock':
        return {
          content: `Comprehensive analysis of ${args.symbol} stock with real-time data and insights.`,
          data: {
            symbol: args.symbol,
            price: 150.25,
            change: 2.15,
            changePercent: 1.45,
            volume: 45000000,
            marketCap: 2500000000000,
            pe: 25.5,
            dividendYield: 0.65
          },
          widgetType: 'stock_analysis'
        };
      
      case 'compare_stocks':
        return {
          content: `Comparison analysis of ${args.symbols} stocks with performance metrics.`,
          data: {
            symbols: args.symbols.split(','),
            comparison: [
              { symbol: 'AAPL', price: 150.25, change: 2.15, changePercent: 1.45 },
              { symbol: 'MSFT', price: 350.80, change: -1.20, changePercent: -0.34 },
              { symbol: 'GOOGL', price: 2800.50, change: 15.75, changePercent: 0.57 }
            ]
          },
          widgetType: 'stock_comparison'
        };
      
      case 'market_overview':
        return {
          content: 'Current market overview with major indices performance.',
          data: {
            indices: [
              { name: 'S&P 500', value: 4500.25, change: 15.50, changePercent: 0.35 },
              { name: 'Dow Jones', value: 35000.80, change: -25.30, changePercent: -0.07 },
              { name: 'NASDAQ', value: 14000.50, change: 45.75, changePercent: 0.33 }
            ]
          },
          widgetType: 'market_overview'
        };
      
      default:
        return {
          content: `Analysis completed for: ${originalMessage}`,
          data: { message: originalMessage },
          widgetType: 'general'
        };
    }
  }

  async getMockToolResponse(toolName, args, originalMessage) {
    // This is a mock response - replace with actual MCP server calls
    switch (toolName) {
      case 'get_quote':
        return {
          content: `Current quote for ${args.symbol}: $150.25 (+2.15, +1.45%)`,
          data: {
            symbol: args.symbol,
            price: 150.25,
            change: 2.15,
            changePercent: 1.45,
            volume: 45000000
          },
          widgetType: 'stock_quote'
        };
      
      case 'get_historical_data':
        return {
          content: `Historical data for ${args.symbol} over the specified period.`,
          data: {
            symbol: args.symbol,
            historicalData: this.generateMockHistoricalData()
          },
          widgetType: 'historical_chart'
        };
      
      default:
        return {
          content: `Tool ${toolName} executed successfully.`,
          data: { tool: toolName, args },
          widgetType: 'general'
        };
    }
  }

  generateMockHistoricalData() {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: 145 + Math.random() * 10,
        high: 150 + Math.random() * 10,
        low: 140 + Math.random() * 10,
        close: 145 + Math.random() * 10,
        volume: 40000000 + Math.random() * 10000000
      });
    }
    
    return data;
  }
}




