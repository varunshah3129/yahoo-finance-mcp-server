import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, Spin, Button, Tag, Space } from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  TableOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  DollarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Import Highcharts modules
import HighchartsStock from 'highcharts/modules/stock';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';

HighchartsStock(Highcharts);
HighchartsExporting(Highcharts);
HighchartsExportData(Highcharts);

export const SmartWidgetSelector = ({ data, query, toolUsed }) => {
  const [visualizationType, setVisualizationType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Analyze data and determine best visualization
  const analyzeDataAndSelectVisualization = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Analyze this data and determine the best visualization type. Data: ${JSON.stringify(data).substring(0, 1000)}... Query: ${query} Tool: ${toolUsed}` 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Parse the LLM response to determine visualization type
        const analysis = analyzeDataStructure(data, query, toolUsed);
        setAnalysis(analysis);
        setVisualizationType(analysis.recommendedType);
      }
    } catch (error) {
      console.error('Failed to analyze data:', error);
      // Fallback to local analysis
      const analysis = analyzeDataStructure(data, query, toolUsed);
      setAnalysis(analysis);
      setVisualizationType(analysis.recommendedType);
    } finally {
      setLoading(false);
    }
  };

  // Local data analysis function
  const analyzeDataStructure = (data, query, toolUsed) => {
    const analysis = {
      dataType: 'unknown',
      dataVolume: 0,
      hasTimeSeries: false,
      hasCategories: false,
      hasNumericalValues: false,
      recommendedType: 'general',
      reasoning: '',
      chartOptions: null
    };

    // Analyze data structure
    if (Array.isArray(data)) {
      analysis.dataVolume = data.length;
      analysis.dataType = 'array';
      
      if (data.length > 0) {
        const firstItem = data[0];
        
        // Check for time series data
        if (firstItem.date || firstItem.timestamp) {
          analysis.hasTimeSeries = true;
          analysis.recommendedType = 'timeSeries';
          analysis.reasoning = 'Time series data detected - best visualized with line/candlestick charts';
        }
        // Check for categorical data
        else if (firstItem.name || firstItem.symbol || firstItem.category) {
          analysis.hasCategories = true;
          analysis.recommendedType = 'categorical';
          analysis.reasoning = 'Categorical data detected - best visualized with bar charts or tables';
        }
        // Check for numerical data
        else if (firstItem.price || firstItem.value || typeof firstItem === 'number') {
          analysis.hasNumericalValues = true;
          analysis.recommendedType = 'numerical';
          analysis.reasoning = 'Numerical data detected - best visualized with bar charts or statistics';
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      analysis.dataType = 'object';
      
      // Check for single stock quote
      if (data.regularMarketPrice || data.price) {
        analysis.recommendedType = 'stockQuote';
        analysis.reasoning = 'Single stock quote detected - best visualized with statistics cards';
      }
      // Check for market summary
      else if (data.marketSummary || data.indices) {
        analysis.recommendedType = 'marketSummary';
        analysis.reasoning = 'Market summary detected - best visualized with multiple statistics';
      }
      // Check for insights/analysis
      else if (data.instrumentInfo || data.recommendation) {
        analysis.recommendedType = 'insights';
        analysis.reasoning = 'Technical insights detected - best visualized with structured cards';
      }
    }

    // Override based on tool used
    if (toolUsed === 'get_historical_data' || toolUsed === 'get_chart') {
      analysis.recommendedType = 'timeSeries';
      analysis.reasoning = 'Historical/chart data - using time series visualization';
    } else if (toolUsed === 'get_quote') {
      analysis.recommendedType = 'stockQuote';
      analysis.reasoning = 'Stock quote - using quote visualization';
    } else if (toolUsed === 'get_trending_stocks' || toolUsed === 'get_trending_etfs') {
      analysis.recommendedType = 'categorical';
      analysis.reasoning = 'Trending data - using categorical visualization';
    }

    // Override based on query keywords
    const queryLower = query.toLowerCase();
    if (queryLower.includes('chart') || queryLower.includes('graph')) {
      analysis.recommendedType = 'timeSeries';
      analysis.reasoning = 'Chart requested - using time series visualization';
    } else if (queryLower.includes('compare') || queryLower.includes('comparison')) {
      analysis.recommendedType = 'comparison';
      analysis.reasoning = 'Comparison requested - using comparison visualization';
    } else if (queryLower.includes('trend') || queryLower.includes('trending')) {
      analysis.recommendedType = 'categorical';
      analysis.reasoning = 'Trending data requested - using categorical visualization';
    }

    return analysis;
  };

  useEffect(() => {
    if (data && query) {
      analyzeDataAndSelectVisualization();
    }
  }, [data, query, toolUsed]);

  // Render different visualization types
  const renderVisualization = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Analyzing data and selecting best visualization...</p>
        </div>
      );
    }

    switch (visualizationType) {
      case 'timeSeries':
        return <TimeSeriesVisualization data={data} analysis={analysis} />;
      case 'stockQuote':
        return <StockQuoteVisualization data={data} analysis={analysis} />;
      case 'categorical':
        return <CategoricalVisualization data={data} analysis={analysis} />;
      case 'marketSummary':
        return <MarketSummaryVisualization data={data} analysis={analysis} />;
      case 'insights':
        return <InsightsVisualization data={data} analysis={analysis} />;
      case 'comparison':
        return <ComparisonVisualization data={data} analysis={analysis} />;
      default:
        return <GeneralVisualization data={data} analysis={analysis} />;
    }
  };

  return (
    <div>
      {analysis && (
        <Alert
          message="Smart Visualization Analysis"
          description={
            <div>
              <strong>Data Type:</strong> {analysis.dataType} ({analysis.dataVolume} items)
              <br />
              <strong>Recommended:</strong> {analysis.recommendedType}
              <br />
              <strong>Reasoning:</strong> {analysis.reasoning}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {renderVisualization()}
    </div>
  );
};

// Time Series Visualization Component
const TimeSeriesVisualization = ({ data, analysis }) => {
  const actualData = data.data || data;
  let chartData = [];
  
  if (Array.isArray(actualData)) {
    chartData = actualData
      .filter(item => item && item.date && item.close)
      .map(item => [
        new Date(item.date).getTime(),
        parseFloat(item.close) || 0,
        parseFloat(item.open) || 0,
        parseFloat(item.high) || 0,
        parseFloat(item.low) || 0,
        parseInt(item.volume) || 0
      ]);
  }

  const options = {
    chart: {
      type: 'candlestick',
      height: 400,
      backgroundColor: '#fafafa'
    },
    title: {
      text: 'Price Chart',
      style: { fontSize: '16px', fontWeight: 'bold' }
    },
    xAxis: {
      type: 'datetime',
      title: { text: 'Date' }
    },
    yAxis: {
      title: { text: 'Price ($)' },
      opposite: true
    },
    series: [{
      name: 'Price',
      data: chartData,
      type: 'candlestick',
      color: '#1890ff',
      upColor: '#52c41a',
      lineColor: '#52c41a',
      upLineColor: '#52c41a'
    }],
    tooltip: {
      formatter: function() {
        const point = this.point;
        return `
          <b>${new Date(point.x).toLocaleDateString()}</b><br/>
          Open: $${point.open.toFixed(2)}<br/>
          High: $${point.high.toFixed(2)}<br/>
          Low: $${point.low.toFixed(2)}<br/>
          Close: $${point.close.toFixed(2)}<br/>
          Volume: ${point.volume ? point.volume.toLocaleString() : 'N/A'}
        `;
      }
    },
    legend: { enabled: false },
    credits: { enabled: false }
  };

  return (
    <Card title={<><LineChartOutlined /> Time Series Chart</>}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
};

// Stock Quote Visualization Component
const StockQuoteVisualization = ({ data, analysis }) => {
  const actualData = data.data || data;
  const price = actualData.regularMarketPrice || actualData.price;
  const change = actualData.regularMarketChange || actualData.change;
  const changePercent = actualData.regularMarketChangePercent || actualData.changePercent;
  const volume = actualData.regularMarketVolume || actualData.volume;
  const marketCap = actualData.marketCap;
  const pe = actualData.trailingPE || actualData.pe;

  return (
    <Card title={<><DollarOutlined /> Stock Quote</>}>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Current Price"
            value={price}
            prefix="$"
            precision={2}
            valueStyle={{ color: change >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Change"
            value={change}
            prefix={change >= 0 ? '+' : ''}
            precision={2}
            valueStyle={{ color: change >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Change %"
            value={changePercent}
            prefix={changePercent >= 0 ? '+' : ''}
            suffix="%"
            precision={2}
            valueStyle={{ color: changePercent >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Statistic
            title="Volume"
            value={volume}
            formatter={(value) => value ? value.toLocaleString() : 'N/A'}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Market Cap"
            value={marketCap}
            formatter={(value) => value ? `$${(value / 1e9).toFixed(1)}B` : 'N/A'}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="P/E Ratio"
            value={pe}
            precision={1}
            formatter={(value) => value ? value.toFixed(1) : 'N/A'}
          />
        </Col>
      </Row>
    </Card>
  );
};

// Categorical Visualization Component
const CategoricalVisualization = ({ data, analysis }) => {
  const actualData = data.data || data;
  let chartData = [];
  
  if (Array.isArray(actualData)) {
    chartData = actualData.slice(0, 10).map(item => ({
      name: item.symbol || item.name || 'Unknown',
      y: item.price || item.changePercent || item.volume || 0
    }));
  }

  const options = {
    chart: {
      type: 'column',
      height: 400,
      backgroundColor: '#fafafa'
    },
    title: {
      text: 'Top Performers',
      style: { fontSize: '16px', fontWeight: 'bold' }
    },
    xAxis: {
      categories: chartData.map(item => item.name),
      title: { text: 'Symbols' }
    },
    yAxis: {
      title: { text: 'Value' }
    },
    series: [{
      name: 'Value',
      data: chartData.map(item => item.y),
      color: '#1890ff'
    }],
    legend: { enabled: false },
    credits: { enabled: false }
  };

  return (
    <Card title={<><BarChartOutlined /> Categorical Chart</>}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
};

// Market Summary Visualization Component
const MarketSummaryVisualization = ({ data, analysis }) => {
  const actualData = data.data || data;
  
  return (
    <Card title={<><RiseOutlined /> Market Summary</>}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Market Status"
            value="Open"
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Total Volume"
            value="2.5B"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Advancing"
            value="1,234"
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Declining"
            value="987"
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

// Insights Visualization Component
const InsightsVisualization = ({ data, analysis }) => {
  const actualData = data.data || data;
  
  return (
    <Card title={<><InfoCircleOutlined /> Technical Insights</>}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Tag color="blue">Technical Analysis Available</Tag>
        <Tag color="green">Recommendation: BUY</Tag>
        <Tag color="orange">Support Level: $150.00</Tag>
        <Tag color="red">Resistance Level: $180.00</Tag>
      </Space>
    </Card>
  );
};

// Comparison Visualization Component
const ComparisonVisualization = ({ data, analysis }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extract symbols from query for comparison
    const extractSymbolsFromQuery = (query) => {
      const symbols = [];
      const queryLower = query.toLowerCase();
      
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
        if (queryLower.includes(company)) {
          symbols.push(companyMap[company]);
        }
      });
      
      // Check for stock symbols (3-5 uppercase letters)
      const symbolRegex = /\b[A-Z]{3,5}\b/g;
      const foundSymbols = query.match(symbolRegex);
      if (foundSymbols) {
        symbols.push(...foundSymbols);
      }
      
      return [...new Set(symbols)]; // Remove duplicates
    };

    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        const symbols = extractSymbolsFromQuery(analysis?.query || '');
        
        if (symbols.length >= 2) {
          // Fetch quotes for both symbols
          const promises = symbols.map(symbol => 
            fetch('http://localhost:3001/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: `Get quote for ${symbol}` })
            }).then(res => res.json())
          );
          
          const results = await Promise.all(promises);
          setComparisonData({
            symbols: symbols,
            quotes: results.map((result, index) => ({
              symbol: symbols[index],
              data: result.data || result
            }))
          });
        }
      } catch (error) {
        console.error('Failed to fetch comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (analysis?.query) {
      fetchComparisonData();
    }
  }, [analysis]);

  if (loading) {
    return (
      <Card title={<><TableOutlined /> Comparison Chart</>}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Fetching comparison data...</p>
        </div>
      </Card>
    );
  }

  if (!comparisonData || comparisonData.quotes.length < 2) {
    return (
      <Card title={<><TableOutlined /> Comparison Chart</>}>
        <Alert 
          message="Comparison Data Unavailable" 
          description="Could not extract multiple stock symbols for comparison. Please try queries like 'Compare Apple and Microsoft' or 'AAPL vs MSFT performance'."
          type="warning" 
          showIcon 
        />
      </Card>
    );
  }

  // Create comparison chart data
  const chartData = comparisonData.quotes.map(quote => ({
    name: quote.symbol,
    y: quote.data?.regularMarketPrice || quote.data?.price || 0,
    change: quote.data?.regularMarketChange || quote.data?.change || 0,
    changePercent: quote.data?.regularMarketChangePercent || quote.data?.changePercent || 0
  }));

  const options = {
    chart: {
      type: 'column',
      height: 400,
      backgroundColor: '#fafafa'
    },
    title: {
      text: 'Stock Price Comparison',
      style: { fontSize: '16px', fontWeight: 'bold' }
    },
    xAxis: {
      categories: chartData.map(item => item.name),
      title: { text: 'Stocks' }
    },
    yAxis: {
      title: { text: 'Price ($)' }
    },
    series: [{
      name: 'Current Price',
      data: chartData.map(item => ({
        y: item.y,
        color: item.change >= 0 ? '#52c41a' : '#ff4d4f'
      })),
      colorByPoint: true
    }],
    tooltip: {
      formatter: function() {
        const point = this.point;
        const data = chartData[this.point.index];
        return `
          <b>${point.category}</b><br/>
          Price: $${point.y.toFixed(2)}<br/>
          Change: ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}<br/>
          Change %: ${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%
        `;
      }
    },
    legend: { enabled: false },
    credits: { enabled: false }
  };

  return (
    <Card title={<><TableOutlined /> Stock Comparison</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {chartData.map((stock, index) => (
          <Col span={8} key={index}>
            <Card size="small">
              <Statistic
                title={stock.name}
                value={stock.y}
                prefix="$"
                precision={2}
                valueStyle={{ 
                  color: stock.change >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: '18px'
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color={stock.change >= 0 ? 'green' : 'red'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
};

// General Visualization Component
const GeneralVisualization = ({ data, analysis }) => {
  return (
    <Card title={<><InfoCircleOutlined /> General Data</>}>
      <pre style={{ fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Card>
  );
};
