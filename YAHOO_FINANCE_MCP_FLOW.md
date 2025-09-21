# Yahoo Finance MCP Server - Complete Flow Diagram

## 🏗️ **System Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           YAHOO FINANCE MCP ECOSYSTEM                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  HTTP Bridge    │    │   MCP Server    │    │ Yahoo Finance   │
│   (Port 3000)   │◄──►│  (Port 3001)    │◄──►│ (stdio/stdout)  │◄──►│     API         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 **Complete Data Flow**

### **1. User Interaction Flow**
```
User Types Query → React Chat → HTTP Bridge → MCP Server → Yahoo Finance API
     ↓              ↓           ↓            ↓              ↓
"Apple stock" → POST /analyze → Tool Call → get_quote → Real-time Data
     ↓              ↓           ↓            ↓              ↓
Widget Created ← JSON Response ← MCP Response ← API Data ← Yahoo Finance
```

### **2. Component Interaction Flow**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                USER QUERY FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

1. USER INPUT
   └── "Apple stock price"
       ↓

2. REACT CLIENT (client-app/src/services/RealMCPClient.js)
   └── determineRequestType() → "analyze"
       ↓

3. HTTP BRIDGE (mcp-http-bridge.js)
   └── POST /analyze
       ├── extractSymbol("Apple stock price") → "AAPL"
       ├── determineAction() → "get_quote"
       └── mcpRequest = { tool: "get_quote", args: { symbol: "AAPL" } }
           ↓

4. MCP SERVER (yahoo-finance-mcp/src/index.ts)
   └── Tool Handler: get_quote
       ├── Parse args with Zod schema
       ├── Call yahooFinanceApi.getQuote("AAPL")
       └── Return JSON response
           ↓

5. YAHOO FINANCE API (yahoo-finance-mcp/src/yahoo-finance-api.ts)
   └── yahooFinance.quote("AAPL")
       ├── Fetch real-time data
       └── Return stock quote object
           ↓

6. RESPONSE CHAIN
   └── MCP Server → HTTP Bridge → React Client → Widget Creation
       ↓

7. WIDGET RENDERING (client-app/src/components/DashboardWidget.js)
   └── StockQuoteWidget with real-time data
```

## 🛠️ **Available Tools & Prompts**

### **Tools (8 Total)**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   TOOLS                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

1. get_quote(symbol)           → Real-time stock quotes
2. get_historical_data()      → Historical price data
3. get_insights(symbol)       → Technical insights
4. get_chart(symbol)          → Chart data
5. get_quote_summary(symbol)  → Comprehensive summary
6. get_fundamentals_timeseries() → Financial fundamentals
7. get_trending_symbols()     → Trending stocks
8. get_daily_gainers()        → Top gainers
9. get_screener()             → Stock screening
10. get_autoc()               → Search suggestions
```

### **Prompts (8 Total)**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  PROMPTS                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

1. stock_quote           → "Get current stock price for {symbol}"
2. historical_analysis   → "Analyze historical data for {symbol}"
3. technical_insights     → "Get technical analysis for {symbol}"
4. chart_analysis        → "Create chart analysis for {symbol}"
5. comprehensive_summary → "Provide comprehensive analysis for {symbol}"
6. fundamentals_analysis → "Analyze fundamentals for {symbol}"
7. trending_analysis      → "Show trending stocks analysis"
8. daily_winners         → "Show daily market winners"
9. stock_screener        → "Screen stocks based on criteria"
10. search_suggestions   → "Get search suggestions"
```

## 🎨 **Widget Types & Rendering**

### **Widget Creation Flow**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              WIDGET CREATION                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

MCP Response → Widget Type Detection → Component Selection → UI Rendering

1. DATA RECEIVED
   └── { tool: "get_quote", data: {...}, widgetType: "stock_quote" }
       ↓

2. WIDGET TYPE MAPPING (mcp-http-bridge.js)
   └── toolName → widgetType mapping
       ├── "get_quote" → "stock_quote"
       ├── "get_historical_data" → "stock_chart"
       ├── "get_trending_symbols" → "trending_stocks"
       └── etc...
           ↓

3. COMPONENT RENDERING (DashboardWidget.js)
   └── renderWidget() switch statement
       ├── case 'stock_quote' → StockQuoteWidget
       ├── case 'stock_chart' → StockChartWidget
       ├── case 'trending_stocks' → TrendingStocksWidget
       └── etc...
           ↓

4. UI COMPONENTS
   └── Ant Design + Highcharts
       ├── Cards, Tables, Charts
       ├── Responsive sizing (Small/Medium/Large/Full)
       └── Interactive features
```

## 🔧 **File Structure & Responsibilities**

### **Core Files**
```
yahoo-finance-mcp-server/
├── yahoo-finance-mcp/                    # MCP Server Package
│   ├── src/
│   │   ├── index.ts                      # Main MCP server, tools & prompts
│   │   └── yahoo-finance-api.ts          # Yahoo Finance API wrapper
│   ├── package.json                      # MCP server dependencies
│   └── dist/                            # Compiled TypeScript
│
├── client-app/                          # React Frontend
│   ├── src/
│   │   ├── App.js                       # Main React component
│   │   ├── services/
│   │   │   └── RealMCPClient.js        # MCP client integration
│   │   └── components/
│   │       ├── DashboardWidget.js       # Widget rendering logic
│   │       └── StockChart.js           # Chart components
│   └── package.json                     # React dependencies
│
├── mcp-http-bridge.js                  # HTTP ↔ MCP Bridge
├── package.json                        # Root dependencies
└── README.md                           # Project documentation
```

## 🚀 **Deployment & Usage**

### **Local Development**
```bash
# Terminal 1: Start MCP Server
cd yahoo-finance-mcp
npm run build
cd ..

# Terminal 2: Start HTTP Bridge
node mcp-http-bridge.js

# Terminal 3: Start React Client
cd client-app
npm start
```

### **Access Points**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                ACCESS POINTS                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

🌐 React Client:     http://localhost:3000
🔗 HTTP Bridge:      http://localhost:3001
📊 Health Check:     http://localhost:3001/health
🛠️  MCP Tools:      http://localhost:3001/tool
📝 MCP Prompts:     http://localhost:3001/prompt
```

## 🔍 **Query Processing Examples**

### **Example 1: Stock Quote**
```
Input:  "Apple stock price"
Flow:   User → React → Bridge → MCP → Yahoo API
Output: StockQuoteWidget with real-time AAPL data
```

### **Example 2: Historical Chart**
```
Input:  "Historical chart for AAPL last 6 months"
Flow:   User → React → Bridge → MCP → Yahoo API
Output: StockChartWidget with interactive Highcharts
```

### **Example 3: Trending Stocks**
```
Input:  "Top 5 trending stocks"
Flow:   User → React → Bridge → MCP → Yahoo API
Output: TrendingStocksWidget with table of popular stocks
```

## 🎯 **Key Features**

### **Dynamic Widget System**
- ✅ Real-time data fetching
- ✅ Automatic widget type detection
- ✅ Responsive sizing (Small/Medium/Large/Full)
- ✅ Interactive charts and tables
- ✅ Error handling and loading states

### **MCP Protocol Benefits**
- ✅ Standardized tool interface
- ✅ Type-safe schemas with Zod
- ✅ Extensible architecture
- ✅ Integration with Claude, Windsurf, LibreChat

### **Yahoo Finance Integration**
- ✅ Real-time stock quotes
- ✅ Historical data
- ✅ Technical analysis
- ✅ Market trends
- ✅ Comprehensive financial data

## 🔧 **Troubleshooting**

### **Common Issues**
```
❌ "Cannot find module" → Run npm install in all directories
❌ "MCP server timeout" → Check if MCP server is built and running
❌ "Widget not rendering" → Check browser console for errors
❌ "Empty data" → Verify Yahoo Finance API responses
```

### **Debug Steps**
```
1. Check HTTP Bridge logs: node mcp-http-bridge.js
2. Check React console: F12 → Console tab
3. Test MCP directly: curl -X POST http://localhost:3001/tool
4. Verify Yahoo API: Check network tab in browser
```

---

## 📊 **Visual Flow Summary**

```
USER QUERY → REACT CLIENT → HTTP BRIDGE → MCP SERVER → YAHOO API
     ↓            ↓             ↓            ↓           ↓
"Apple stock" → POST /analyze → Tool Call → get_quote → Real Data
     ↓            ↓             ↓            ↓           ↓
WIDGET UI ← JSON Response ← MCP Response ← API Data ← Yahoo Finance
```

This diagram shows the complete flow from user input to widget rendering in your Yahoo Finance MCP system!




