# Yahoo Finance MCP Server

A Model Context Protocol (MCP) server that provides Yahoo Finance data integration for LibreChat and other MCP-compatible applications.

## Features

- **Real-time Quotes**: Get current stock prices, changes, and market data
- **Historical Data**: Retrieve historical price data with customizable time periods
- **Symbol Search**: Search for stocks by company name or symbol
- **Market Summary**: Get overview of major market indices
- **Financial News**: Access financial news, optionally filtered by symbol
- **Analyst Recommendations**: Get analyst ratings and price targets
- **Financial Statements**: Retrieve income statements, balance sheets, and cash flow statements
- **Options Data**: Get options chain data for stocks

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Installation

1. Clone or download this repository:
```bash
git clone <repository-url>
cd yahoo-finance-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

You can run the server in several ways:

1. **Production mode** (after building):
```bash
npm start
```

2. **Development mode** (with auto-reload):
```bash
npm run dev
```

3. **Watch mode** (for development):
```bash
npm run watch
```

### Integration with LibreChat

1. **Add to LibreChat configuration**:
   - Copy the `librechat-config.json` content to your LibreChat MCP configuration
   - Update the `cwd` path to match your server location
   - Restart LibreChat

2. **Manual configuration**:
   Add this to your LibreChat MCP servers configuration:
   ```json
   {
     "mcpServers": {
       "yahoo-finance": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/path/to/yahoo-finance-mcp-server",
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

## Available Tools

### 1. get_quote
Get real-time quote data for a stock symbol.

**Parameters:**
- `symbol` (string, required): Stock symbol (e.g., AAPL, MSFT, GOOGL)

**Example:**
```json
{
  "name": "get_quote",
  "arguments": {
    "symbol": "AAPL"
  }
}
```

### 2. get_historical_data
Get historical price data for a stock symbol.

**Parameters:**
- `symbol` (string, required): Stock symbol
- `period1` (string, optional): Start date in YYYY-MM-DD format
- `period2` (string, optional): End date in YYYY-MM-DD format
- `interval` (string, optional): Data interval (1d, 5d, 1wk, 1mo, 3mo)

**Example:**
```json
{
  "name": "get_historical_data",
  "arguments": {
    "symbol": "AAPL",
    "period1": "2024-01-01",
    "period2": "2024-12-31",
    "interval": "1d"
  }
}
```

### 3. search_symbols
Search for stock symbols by company name or symbol.

**Parameters:**
- `query` (string, required): Search query

**Example:**
```json
{
  "name": "search_symbols",
  "arguments": {
    "query": "Apple"
  }
}
```

### 4. get_market_summary
Get market summary data including major indices.

**Parameters:** None

**Example:**
```json
{
  "name": "get_market_summary",
  "arguments": {}
}
```

### 5. get_news
Get financial news, optionally filtered by symbol.

**Parameters:**
- `symbol` (string, optional): Stock symbol for specific news
- `count` (number, optional): Number of news items to return (default: 10)

**Example:**
```json
{
  "name": "get_news",
  "arguments": {
    "symbol": "AAPL",
    "count": 5
  }
}
```

### 6. get_recommendations
Get analyst recommendations for a stock symbol.

**Parameters:**
- `symbol` (string, required): Stock symbol

**Example:**
```json
{
  "name": "get_recommendations",
  "arguments": {
    "symbol": "AAPL"
  }
}
```

### 7. get_financials
Get financial statements for a stock symbol.

**Parameters:**
- `symbol` (string, required): Stock symbol
- `type` (string, required): Type of financial statement (income, balance, cashflow)

**Example:**
```json
{
  "name": "get_financials",
  "arguments": {
    "symbol": "AAPL",
    "type": "income"
  }
}
```

### 8. get_options
Get options data for a stock symbol.

**Parameters:**
- `symbol` (string, required): Stock symbol
- `expiration` (string, optional): Options expiration date in YYYY-MM-DD format

**Example:**
```json
{
  "name": "get_options",
  "arguments": {
    "symbol": "AAPL",
    "expiration": "2024-12-20"
  }
}
```

## Development

### Project Structure

```
yahoo-finance-mcp-server/
├── src/
│   ├── index.ts              # Main MCP server implementation
│   └── yahoo-finance-api.ts  # Yahoo Finance API integration
├── dist/                     # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
├── librechat-config.json     # LibreChat integration config
└── README.md
```

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the compiled server
- `npm run dev`: Run in development mode with tsx
- `npm run watch`: Run in watch mode for development

### Error Handling

The server includes comprehensive error handling:
- Input validation using Zod schemas
- Yahoo Finance API error handling
- Graceful error responses with descriptive messages

## Troubleshooting

### Common Issues

1. **"Command not found" errors**: Make sure Node.js is installed and in your PATH
2. **Build errors**: Run `npm install` to ensure all dependencies are installed
3. **Yahoo Finance API errors**: Check your internet connection and try again
4. **LibreChat integration issues**: Verify the path in your LibreChat configuration

### Debug Mode

To run in debug mode, set the environment variable:
```bash
DEBUG=yahoo-finance-mcp-server npm run dev
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

