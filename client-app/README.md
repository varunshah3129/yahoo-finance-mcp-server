# Yahoo Finance Chatbot Dashboard

A React.js application that provides an interactive chatbot interface for Yahoo Finance data analysis. The app dynamically creates dashboard widgets based on your chat interactions with the Yahoo Finance MCP server.

## 🚀 Features

### **Dynamic Widget Creation**
- **On-the-fly Widgets**: Widgets are created automatically based on your chat messages
- **Real-time Data**: Live financial data from Yahoo Finance MCP server
- **Interactive Charts**: Highcharts integration for beautiful data visualization
- **Responsive Design**: Works on desktop and mobile devices

### **Available Widget Types**
1. **Stock Analysis Widget** - Comprehensive stock metrics and statistics
2. **Stock Comparison Widget** - Side-by-side comparison tables
3. **Market Overview Widget** - Major indices performance with charts
4. **Stock Chart Widget** - Historical price charts (candlestick, line, volume)
5. **Portfolio Analysis Widget** - Portfolio performance and allocation
6. **Stock Quote Widget** - Real-time price quotes

### **Chat Commands**
- *"Analyze Apple stock"* → Creates stock analysis widget
- *"Compare AAPL, MSFT, GOOGL"* → Creates comparison table
- *"Show me market overview"* → Creates market indices widget
- *"Get historical data for Tesla"* → Creates price chart widget
- *"Analyze my portfolio: AAPL, MSFT, GOOGL"* → Creates portfolio analysis

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- Your Yahoo Finance MCP server running

### Setup
```bash
cd client-app
npm install
npm start
```

The app will open at `http://localhost:3000`

## 🔧 Configuration

### MCP Server Integration
The app connects to your Yahoo Finance MCP server. Update the connection settings in `src/services/MCPClient.js`:

```javascript
this.baseURL = 'http://localhost:3001'; // Your MCP server endpoint
```

### Widget Types
Widgets are automatically created based on message analysis:

| Message Pattern | Widget Type | Description |
|----------------|-------------|-------------|
| "analyze [symbol] stock" | Stock Analysis | Price, metrics, statistics |
| "compare [symbols]" | Stock Comparison | Side-by-side comparison table |
| "market overview" | Market Overview | Major indices with charts |
| "historical data" | Stock Chart | Price charts and volume |
| "portfolio analysis" | Portfolio Analysis | Portfolio performance metrics |
| "quote [symbol]" | Stock Quote | Real-time price quote |

## 📊 Widget Examples

### Stock Analysis Widget
```
Current Price: $150.25 (+2.15, +1.45%)
Volume: 45,000,000
Market Cap: $2.5T
P/E Ratio: 25.5
Dividend Yield: 0.65%
```

### Market Overview Widget
```
S&P 500: $4,500.25 (+15.50, +0.35%)
Dow Jones: $35,000.80 (-25.30, -0.07%)
NASDAQ: $14,000.50 (+45.75, +0.33%)
```

### Portfolio Analysis Widget
```
Total Value: $15,000.00
Total Change: +$250.00 (+1.67%)
Best Performer: GOOGL (+5.2%)
Worst Performer: AAPL (-1.1%)
```

## 🎨 Technologies Used

- **React 18** - Frontend framework
- **Ant Design 5** - UI component library
- **Highcharts** - Interactive charts
- **Axios** - HTTP client
- **Styled Components** - CSS-in-JS styling

## 🔄 How It Works

1. **Message Analysis**: Chat messages are analyzed to determine intent
2. **MCP Server Call**: Appropriate tool or prompt is called on MCP server
3. **Data Processing**: Response data is structured for widget rendering
4. **Widget Creation**: Dynamic widgets are created based on data type
5. **Dashboard Update**: Widgets are added to the dashboard in real-time

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Getting Started

1. **Start your MCP server**:
   ```bash
   cd /path/to/yahoo-finance-mcp-server
   npm start
   ```

2. **Start the React app**:
   ```bash
   cd client-app
   npm start
   ```

3. **Open your browser** to `http://localhost:3000`

4. **Start chatting** with the financial data!

## 💡 Example Conversations

**User**: "What's the current price of Apple stock?"
**Bot**: Creates a stock quote widget with real-time AAPL data

**User**: "Compare Microsoft, Google, and Amazon stocks"
**Bot**: Creates a comparison table with all three stocks

**User**: "Show me a market overview"
**Bot**: Creates market indices widget with charts

**User**: "Analyze my portfolio: AAPL, MSFT, GOOGL, TSLA"
**Bot**: Creates portfolio analysis with performance metrics

## 🔧 Customization

### Adding New Widget Types
1. Create component in `src/components/`
2. Add widget type to `DashboardWidget.js`
3. Update message analysis in `MCPClient.js`

### Styling
- Modify `src/App.css` for custom styles
- Use Ant Design theme customization
- Add custom Highcharts themes

## 📈 Future Enhancements

- Real-time data updates
- Custom dashboard layouts
- Export functionality
- Advanced charting options
- Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details




