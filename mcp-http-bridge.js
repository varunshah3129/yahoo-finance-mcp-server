import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import LLMQueryProcessor from './llm-query-processor.js';

// Helper function to extract stock symbol from message using dynamic search
async function extractSymbol(message) {
  const lowerMessage = message.toLowerCase();
  let symbol = null;
  
  // First try to find uppercase stock symbols (1-5 letters)
  const symbolMatch = message.match(/\b([A-Z]{1,5})\b/);
  if (symbolMatch) {
    symbol = symbolMatch[1];
  } else {
    // Extract potential company names from the message
    const companyNames = extractCompanyNames(message);
    
    if (companyNames.length > 0) {
      // First try hardcoded mapping for common companies
      const companyMap = {
        'microsoft': 'MSFT',
        'apple': 'AAPL',
        'google': 'GOOGL',
        'amazon': 'AMZN',
        'tesla': 'TSLA',
        'meta': 'META',
        'nvidia': 'NVDA',
        'netflix': 'NFLX',
        'amd': 'AMD',
        'intel': 'INTC',
        'ford': 'F',
        'berkshire': 'BRK.B',
        'jpmorgan': 'JPM',
        'walmart': 'WMT',
        'disney': 'DIS',
        'nike': 'NKE',
        'boeing': 'BA',
        'general electric': 'GE',
        'general motors': 'GM'
      };
      
      const companyName = companyNames[0].toLowerCase();
      if (companyMap[companyName]) {
        symbol = companyMap[companyName];
        console.log(`Found symbol ${symbol} for company "${companyName}" from hardcoded mapping`);
      } else {
        // Use the search_symbols tool to find the symbol dynamically
        try {
          const searchQuery = companyNames[0]; // Use the first company name found
          const searchRequest = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: 'search_symbols',
              arguments: { query: searchQuery }
            }
          };
          
          const response = await sendToMCP(searchRequest);
          
          if (response.result && response.result.content && response.result.content[0]) {
            const searchResults = JSON.parse(response.result.content[0].text);
            
            if (searchResults && searchResults.length > 0) {
              // Find the best match (prefer stocks over other instruments)
              const stockResult = searchResults.find(r => 
                r.quoteType === 'EQUITY' || r.quoteType === 'STOCK'
              ) || searchResults[0];
              
              symbol = stockResult.symbol;
              console.log(`Found symbol ${symbol} for company "${searchQuery}" from search`);
            }
          }
        } catch (error) {
          console.warn(`Failed to search for symbol: ${error.message}`);
        }
      }
    }
  }
  
  return symbol;
}

// Extract company names from message
function extractCompanyNames(message) {
  const lowerMessage = message.toLowerCase();
  const companies = [];
  
  // Common company name patterns
  const patterns = [
    // Direct company names (case insensitive)
    /\b(apple|microsoft|google|amazon|tesla|meta|nvidia|netflix|amd|intel|palantir|coinbase|berkshire|jpmorgan|walmart|coca cola|pepsi|disney|nike|home depot|lowes|target|costco|mcdonalds|starbucks|boeing|general electric|general motors|ford motor|ford)\b/gi,
    // Generic patterns
    /\b([a-z]+(?:\s+[a-z]+)*)\s+(inc|corp|corporation|company|co|llc|ltd|limited)\b/gi,
    /\b([a-z]+(?:\s+[a-z]+)*)\s+(technologies|tech|systems|solutions|group|holdings|industries)\b/gi
  ];
  
  for (const pattern of patterns) {
    const matches = [...message.matchAll(pattern)];
    for (const match of matches) {
      const company = match[1] || match[0];
      if (company && company.length > 2) {
        companies.push(company.trim());
      }
    }
  }
  
  return [...new Set(companies)]; // Remove duplicates
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store MCP server process
let mcpProcess = null;

// Cache for available tools and their capabilities
let availableTools = new Map();
let toolCapabilities = new Map();

// Initialize LLM Query Processor
const llmProcessor = new LLMQueryProcessor();

// Start MCP server
function startMCPServer() {
  console.log('Starting MCP server...');
  
  mcpProcess = spawn('node', ['dist/index.js'], {
    cwd: path.join(process.cwd(), 'yahoo-finance-mcp'),
    stdio: ['pipe', 'pipe', 'pipe']
  });

  mcpProcess.stdout.on('data', (data) => {
    console.log('MCP Server:', data.toString());
  });

  mcpProcess.stderr.on('data', (data) => {
    console.error('MCP Server Error:', data.toString());
  });

  mcpProcess.on('close', (code) => {
    console.log(`MCP server process exited with code ${code}`);
  });

  mcpProcess.on('error', (err) => {
    console.error('Failed to start MCP server:', err);
  });

  // Discover available tools after a short delay
  setTimeout(async () => {
    try {
      await discoverAvailableTools();
    } catch (error) {
      console.error('Failed to discover tools on startup:', error);
    }
  }, 2000);
}

// Discover available tools from MCP server
async function discoverAvailableTools() {
  try {
    const toolsRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list',
      params: {}
    };

    const response = await sendToMCP(toolsRequest);
    const tools = response.result?.tools || [];

    // Cache tools and their capabilities
    availableTools.clear();
    toolCapabilities.clear();

    for (const tool of tools) {
      availableTools.set(tool.name, tool);
      
      // Extract capabilities from tool description and name
      const capabilities = extractToolCapabilities(tool);
      toolCapabilities.set(tool.name, capabilities);
    }

    console.log(`Discovered ${tools.length} available tools:`, Array.from(availableTools.keys()));
    
    // Initialize LLM processor with available tools
    await llmProcessor.initialize(availableTools, toolCapabilities);
    
    return tools;
  } catch (error) {
    console.error('Failed to discover tools:', error);
    return [];
  }
}

// Extract capabilities from tool metadata
function extractToolCapabilities(tool) {
  const name = tool.name.toLowerCase();
  const description = (tool.description || '').toLowerCase();
  
  const capabilities = {
    keywords: [],
    requiresSymbol: false,
    requiresCount: false,
    requiresQuery: false,
    category: 'general'
  };

  // Extract keywords from name and description
  const keywords = [...name.split('_'), ...description.split(' ')];
  capabilities.keywords = keywords.filter(k => k.length > 2);

  // Determine requirements
  if (name.includes('quote') || name.includes('historical') || name.includes('chart') || name.includes('insights')) {
    capabilities.requiresSymbol = true;
  }
  if (name.includes('trending') || name.includes('gainers') || name.includes('screener')) {
    capabilities.requiresCount = true;
  }
  if (name.includes('search') || name.includes('symbols')) {
    capabilities.requiresQuery = true;
  }

  // Determine category
  if (name.includes('trending')) capabilities.category = 'trending';
  else if (name.includes('quote') || name.includes('price')) capabilities.category = 'quotes';
  else if (name.includes('historical')) capabilities.category = 'historical_chart';
  else if (name.includes('chart')) capabilities.category = 'chart_data';
  else if (name.includes('insights')) capabilities.category = 'insights';
  else if (name.includes('search')) capabilities.category = 'search';
  else if (name.includes('etf')) capabilities.category = 'etfs';
  else if (name.includes('gainer')) capabilities.category = 'gainers';

  return capabilities;
}

// Send message to MCP server
function sendToMCP(message) {
  return new Promise((resolve, reject) => {
    if (!mcpProcess) {
      reject(new Error('MCP server not running'));
      return;
    }

    let responseData = '';
    let errorData = '';
    let responseReceived = false;

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        reject(new Error('MCP server timeout'));
      }
    }, 30000);

    const onData = (data) => {
      const dataStr = data.toString();
      responseData += dataStr;
      
      // Look for complete JSON responses
      const lines = dataStr.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('{') && trimmedLine.includes('"result"')) {
          try {
            const response = JSON.parse(trimmedLine);
            if (response.result) {
              responseReceived = true;
              clearTimeout(timeout);
              mcpProcess.stdout.removeListener('data', onData);
              mcpProcess.stderr.removeListener('data', onError);
              resolve(response);
              return;
            }
          } catch (err) {
            // Continue looking for valid JSON
          }
        }
      }
    };

    const onError = (data) => {
      errorData += data.toString();
    };

    mcpProcess.stdout.on('data', onData);
    mcpProcess.stderr.on('data', onError);

    // Send message to MCP server
    mcpProcess.stdin.write(JSON.stringify(message) + '\n');
  });
}

// Routes
app.post('/prompt', async (req, res) => {
  try {
    const { name, args, message } = req.body;
    
    console.log(`Executing prompt: ${name} with args:`, args);
    
    // Create MCP request for prompt
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'prompts/get',
      params: {
        name: name,
        arguments: args
      }
    };

    const response = await sendToMCP(mcpRequest);
    
    // Parse the response and format for the client
    const result = response.result || response;
    
    res.json({
      content: result.content || result.message || 'Prompt executed successfully',
      data: result.data || {},
      widgetType: determineWidgetType(name)
    });
    
  } catch (error) {
    console.error('Error executing prompt:', error);
    res.status(500).json({
      error: error.message,
      content: 'Failed to execute prompt',
      data: {},
      widgetType: 'error'
    });
  }
});

app.post('/tool', async (req, res) => {
  try {
    const { name, args, message } = req.body;
    
    console.log(`Executing tool: ${name} with args:`, args);
    
    // Create MCP request for tool
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: name,
        arguments: args
      }
    };

    const response = await sendToMCP(mcpRequest);
    
    // Parse the response and format for the client
    const result = response.result || response;
    
    // Extract financial data from the MCP response
    let financialData = {};
    let content = 'Tool executed successfully';
    
    if (result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === 'text' && item.text) {
          try {
            const parsedData = JSON.parse(item.text);
            financialData = parsedData;
            content = `Current ${name} data for ${parsedData.symbol || 'stock'}`;
            break;
          } catch (err) {
            content = item.text;
          }
        }
      }
    }
    
    res.json({
      content: content,
      data: financialData,
      widgetType: determineWidgetType(name)
    });
    
  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({
      error: error.message,
      content: 'Failed to execute tool',
      data: {},
      widgetType: 'error'
    });
  }
});

// Dynamic tool routing with fallbacks
async function findBestTool(message) {
  const lowerMessage = message.toLowerCase();
  
  // Define tool preferences with fallbacks
  const toolPreferences = [
    // Trending Stocks (more specific, higher priority)
    {
      keywords: ['trending', 'top', 'stock', 'stocks', 'top 5 stocks', 'top 10 stocks'],
      primary: 'get_trending_stocks',
      fallbacks: ['search_symbols'],
      requiresCount: true,
      priority: 1
    },
    // Trending ETFs (more specific keywords)
    {
      keywords: ['etf', 'etfs', 'trending etf', 'top etf'],
      primary: 'get_trending_etfs',
      fallbacks: ['get_trending_stocks', 'search_symbols'],
      requiresCount: true,
      priority: 2
    },
    // Historical Data
    {
      keywords: ['historical', 'chart', 'price history'],
      primary: 'get_historical_data',
      fallbacks: ['get_quote', 'search_symbols'],
      requiresSymbol: true,
      priority: 2
    },
    // Stock Quotes (higher priority)
    {
      keywords: ['quote', 'price', 'stock price', 'current price'],
      primary: 'get_quote',
      fallbacks: ['search_symbols'],
      requiresSymbol: true,
      priority: 1
    },
    // Symbol Search
    {
      keywords: ['search', 'symbol', 'ticker', 'find'],
      primary: 'search_symbols',
      fallbacks: [],
      requiresQuery: true
    },
    // Quote Summary
    {
      keywords: ['summary', 'comprehensive', 'detailed'],
      primary: 'get_quote_summary',
      fallbacks: ['get_quote', 'search_symbols'],
      requiresSymbol: true
    },
    // Chart Analysis
    {
      keywords: ['chart', 'analysis'],
      primary: 'get_chart',
      fallbacks: ['get_historical_data', 'get_quote'],
      requiresSymbol: true
    },
    // Technical Insights
    {
      keywords: ['insights', 'technical', 'analysis'],
      primary: 'get_insights',
      fallbacks: ['get_quote', 'search_symbols'],
      requiresSymbol: true
    },
    // Dividend/Screening
    {
      keywords: ['dividend', 'yield', 'high yield', 'screener', 'filter', 'screen'],
      primary: 'get_screener',
      fallbacks: ['get_trending_stocks', 'search_symbols'],
      requiresCount: true,
      priority: 3
    }
  ];

  // Sort by priority (lower number = higher priority)
  const sortedPreferences = toolPreferences.sort((a, b) => (a.priority || 10) - (b.priority || 10));
  
  // Find the best matching tool
  for (const preference of sortedPreferences) {
    const keywordMatch = preference.keywords.some(keyword => lowerMessage.includes(keyword));
    
    if (keywordMatch) {
      // Check if primary tool is available
      if (availableTools.has(preference.primary)) {
        return {
          tool: preference.primary,
          fallbacks: preference.fallbacks.filter(fb => availableTools.has(fb)),
          requiresSymbol: preference.requiresSymbol,
          requiresCount: preference.requiresCount,
          requiresQuery: preference.requiresQuery
        };
      }
      
      // Try fallbacks
      for (const fallback of preference.fallbacks) {
        if (availableTools.has(fallback)) {
          return {
            tool: fallback,
            fallbacks: [],
            requiresSymbol: preference.requiresSymbol,
            requiresCount: preference.requiresCount,
            requiresQuery: preference.requiresQuery
          };
        }
      }
    }
  }

  // Default to search if no specific tool matches
  return {
    tool: 'search_symbols',
    fallbacks: [],
    requiresSymbol: false,
    requiresCount: false,
    requiresQuery: true
  };
}

// Analyze endpoint with dynamic routing and fallbacks
app.post('/analyze', async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log(`Analyzing message: ${message}`);
    
    // Discover tools if not already cached
    if (availableTools.size === 0) {
      await discoverAvailableTools();
    }
    
    // Use LLM to intelligently process the query
    const llmResult = await llmProcessor.processQuery(message);
    const { tool, parameters, reasoning, confidence, source } = llmResult;
    
    console.log(`LLM selected tool: ${tool} (confidence: ${confidence}, source: ${source})`);
    console.log(`Reasoning: ${reasoning}`);
    
    // Define fallbacks based on tool type
    let fallbacks = [];
    if (tool === 'get_screener') {
      fallbacks = ['get_trending_stocks', 'search_symbols'];
    } else if (tool === 'get_trending_stocks') {
      fallbacks = ['search_symbols'];
    } else if (tool === 'get_quote') {
      fallbacks = ['search_symbols'];
    } else if (tool === 'search_symbols') {
      fallbacks = ['get_trending_stocks'];
    }
    
    // Get tool requirements for validation
    const toolInfo = availableTools.get(tool);
    if (!toolInfo) {
      return res.json({
        content: `Tool "${tool}" not found. Available tools: ${Array.from(availableTools.keys()).join(', ')}`,
        data: { error: 'Tool not found' },
        widgetType: 'error'
      });
    }
    
    // Use LLM parameters, with fallback validation
    let toolArgs = { ...parameters };
    
    // Validate and add missing required parameters
    const requiredParams = toolInfo.inputSchema?.required || [];
    for (const param of requiredParams) {
      if (!toolArgs[param]) {
        if (param === 'symbol') {
          const symbol = await extractSymbol(message);
          if (!symbol) {
            return res.json({
              content: `I couldn't identify a stock symbol in your message: "${message}". Please specify a stock symbol (like AAPL, MSFT) or company name (like Apple, Microsoft).`,
              data: { error: 'No symbol found' },
              widgetType: 'error'
            });
          }
          toolArgs.symbol = symbol;
        } else if (param === 'count') {
          const countMatch = message.match(/(\d+)/);
          toolArgs.count = countMatch ? parseInt(countMatch[1]) : 5;
        } else if (param === 'query') {
          if (tool === 'search_symbols') {
            const searchQuery = message.replace(/search.*?(?:for|symbol|ticker|find)/i, '').trim();
            toolArgs.query = searchQuery || message.trim();
          } else {
            toolArgs.query = message;
          }
        }
      }
    }
    
    // Try the primary tool with fallbacks
    let mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: tool,
        arguments: toolArgs
      }
    };
    
    let response;
    let lastError;
    
    // Try primary tool first
    try {
      response = await sendToMCP(mcpRequest);
      
      // Check if response indicates an error
      if (response.result?.content?.[0]?.text?.includes('Error:')) {
        throw new Error('Tool returned error');
      }
      
    } catch (error) {
      console.warn(`Primary tool ${tool} failed:`, error.message);
      lastError = error;
      
      // Try fallback tools
      for (const fallbackTool of fallbacks) {
        try {
          console.log(`Trying fallback tool: ${fallbackTool}`);
          
          mcpRequest.params.name = fallbackTool;
          // Adjust arguments for fallback tool
          if (fallbackTool === 'search_symbols') {
            mcpRequest.params.arguments = { query: message.trim() };
          }
          
          response = await sendToMCP(mcpRequest);
          
          if (!response.result?.content?.[0]?.text?.includes('Error:')) {
            console.log(`Fallback tool ${fallbackTool} succeeded`);
            break;
          }
        } catch (fallbackError) {
          console.warn(`Fallback tool ${fallbackTool} failed:`, fallbackError.message);
          lastError = fallbackError;
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('All tools failed');
    }
    
    // Parse the response and format for the client
    const result = response.result || response;
    
    // Extract financial data from the MCP response
    let financialData = {};
    let widgetType = 'general';
    
    // Determine widget type based on the tool name from the request
    if (mcpRequest && mcpRequest.params && mcpRequest.params.name) {
      const toolName = mcpRequest.params.name;
      const capabilities = toolCapabilities.get(toolName);
      
      if (capabilities) {
        // Use category from capabilities
        widgetType = capabilities.category;
      } else {
        // Fallback to static mapping for unknown tools
        const toolToWidgetMap = {
          'get_insights': 'insights',
          'get_chart': 'chart_data',
          'get_quote_summary': 'quote_summary',
          'get_fundamentals_timeseries': 'fundamentals',
          'fundamentals_analysis': 'fundamentals',
          'get_trending_symbols': 'trending_symbols',
          'get_daily_gainers': 'gainers',
          'get_screener': 'screener',
          'get_autoc': 'autoc',
          'get_trending_etfs': 'etfs',
          'get_trending_stocks': 'trending',
          'get_quote': 'quotes',
          'get_historical_data': 'historical_chart',
          'search_symbols': 'search'
        };
        widgetType = toolToWidgetMap[toolName] || 'general';
      }
    }
    
    if (result.content && Array.isArray(result.content)) {
      const textContent = result.content.find(c => c.type === 'text');
      if (textContent && textContent.text) {
        try {
          financialData = JSON.parse(textContent.text);
        } catch (e) {
          financialData = { message: textContent.text };
        }
      }
    }
    
    res.json({
      content: `Analysis completed for: ${message}`,
      data: financialData,
      widgetType: widgetType,
      query: message,
      toolUsed: tool
    });
    
  } catch (error) {
    console.error('Error analyzing message:', error);
    res.status(500).json({
      error: error.message,
      content: 'Failed to analyze message',
      data: {},
      widgetType: 'error'
    });
  }
});

// Helper function to determine widget type
function determineWidgetType(name) {
  const widgetMap = {
    'analyze_stock': 'stock_analysis',
    'compare_stocks': 'stock_comparison',
    'market_overview': 'market_overview',
    'portfolio_analysis': 'portfolio_analysis',
    'stock_news': 'news',
    'find_stocks': 'search_results',
    'get_quote': 'stock_quote',
    'get_historical_data': 'historical_chart',
    'search_symbols': 'search_results',
    'get_market_summary': 'market_overview',
    'get_news': 'news',
    'get_recommendations': 'recommendations',
    'get_financials': 'financials',
    'get_options': 'options',
    'get_trending_stocks': 'trending_stocks',
    'get_trending_etfs': 'trending_etfs'
  };
  
  return widgetMap[name] || 'general';
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mcpServer: mcpProcess ? 'running' : 'stopped',
    timestamp: new Date().toISOString()
  });
});

// Get available tools
app.get('/tools', (req, res) => {
  const tools = Array.from(availableTools.values()).map(tool => ({
    name: tool.name,
    description: tool.description,
    capabilities: toolCapabilities.get(tool.name) || {}
  }));
  
  res.json({
    tools: tools,
    count: tools.length,
    timestamp: new Date().toISOString()
  });
});

// LLM-powered query suggestions endpoint
app.post('/suggestions', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = await llmProcessor.generateWidgetSuggestions(query);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.json({ suggestions: llmProcessor.getDefaultSuggestions() });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP HTTP Bridge running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Start MCP server
  startMCPServer();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (mcpProcess) {
    mcpProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  if (mcpProcess) {
    mcpProcess.kill();
  }
  process.exit(0);
});
