# Yahoo Finance MCP Server & Client

A complete Yahoo Finance data solution with Model Context Protocol (MCP) server and React client application.

## 📁 Project Structure

```
yahoo-finance-mcp-server/
├── yahoo-finance-mcp/          # MCP Server (separate folder)
│   ├── src/                    # TypeScript source code
│   ├── dist/                   # Compiled JavaScript
│   ├── package.json            # MCP server dependencies
│   └── tsconfig.json           # TypeScript configuration
├── client-app/                 # React Client Application
│   ├── src/                    # React source code
│   ├── public/                 # Static assets
│   └── package.json            # Client dependencies
├── mcp-http-bridge.js          # HTTP bridge between client and MCP
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Start the MCP Server
```bash
cd yahoo-finance-mcp
npm install
npm run build
```

### 2. Start the HTTP Bridge
```bash
node mcp-http-bridge.js
```

### 3. Start the React Client
```bash
cd client-app
npm install
npm start
```

## 🛠️ Features

### MCP Server (`yahoo-finance-mcp/`)
- **18 Yahoo Finance Tools**: Complete API coverage
- **8 Intelligent Prompts**: Natural language access
- **Real-time Data**: Live market data
- **TypeScript**: Type-safe implementation

### React Client (`client-app/`)
- **Dynamic Widgets**: 17 different widget types
- **Real-time Chat**: Interactive financial queries
- **Responsive Design**: Mobile-friendly interface
- **Ant Design**: Modern UI components

### HTTP Bridge (`mcp-http-bridge.js`)
- **Protocol Translation**: HTTP ↔ MCP stdio
- **Smart Routing**: Intelligent query analysis
- **Symbol Extraction**: Company name → ticker mapping
- **Error Handling**: Graceful fallbacks

## 📊 Supported Queries

- **Stock Quotes**: "Get quote for AAPL", "Ford stock price"
- **Technical Analysis**: "Get insights for TSLA"
- **Historical Data**: "Show chart for MSFT"
- **Market Data**: "Top 5 trending stocks"
- **Company Analysis**: "Comprehensive summary for NVDA"
- **ETF Data**: "Top 5 trending ETFs"

## 🔧 Configuration

### Cursor Integration
Add to your `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "yahoo-finance": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/yahoo-finance-mcp"
    }
  }
}
```

### Standalone Usage
The MCP server can be used independently with any MCP-compatible client.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions, please open a GitHub issue.