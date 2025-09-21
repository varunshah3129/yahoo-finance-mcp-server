import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card, Row, Col, Statistic, Select, DatePicker, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined } from '@ant-design/icons';

// Import required Highcharts modules
import HighchartsStock from 'highcharts/modules/stock';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';

// Initialize the modules
HighchartsStock(Highcharts);
HighchartsExporting(Highcharts);
HighchartsExportData(Highcharts);

const { Option } = Select;
const { RangePicker } = DatePicker;

export const StockChart = ({ data }) => {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Handle both old and new data structures
  const actualData = data.data || data;
  
  // Convert object with numeric keys to array if needed
  let historicalData;
  if (Array.isArray(actualData)) {
    historicalData = actualData;
  } else if (actualData?.data && Array.isArray(actualData.data)) {
    // New structure: { symbol: "AMZN", data: [...], count: 250, period: {...} }
    historicalData = actualData.data;
  } else if (actualData?.historicalData && Array.isArray(actualData.historicalData)) {
    historicalData = actualData.historicalData;
  } else if (actualData && typeof actualData === 'object') {
    // Convert object with numeric keys to array
    historicalData = Object.values(actualData).filter(item => 
      item && typeof item === 'object' && item.date
    );
  } else {
    historicalData = [];
  }
  
  // Extract symbol from various possible locations
  let symbol = 'Stock';
  if (actualData?.symbol) {
    symbol = actualData.symbol;
  } else if (historicalData && historicalData.length > 0 && historicalData[0]?.symbol) {
    symbol = historicalData[0].symbol;
  } else if (data?.symbol) {
    symbol = data.symbol;
  } else if (data?.data?.symbol) {
    symbol = data.data.symbol;
  }
  
  console.log('StockChart - Symbol extraction:', {
    actualDataSymbol: actualData?.symbol,
    historicalDataSymbol: historicalData?.[0]?.symbol,
    dataSymbol: data?.symbol,
    dataDataSymbol: data?.data?.symbol,
    finalSymbol: symbol
  });
  
  // Get company name from symbol mapping
  const getCompanyName = (symbol) => {
    const symbolToName = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc. (Google)',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'NFLX': 'Netflix Inc.',
      'F': 'Ford Motor Company',
      'GM': 'General Motors Company',
      'BRK.A': 'Berkshire Hathaway Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'BAC': 'Bank of America Corporation',
      'WMT': 'Walmart Inc.',
      'KO': 'The Coca-Cola Company',
      'PEP': 'PepsiCo Inc.',
      'MCD': 'McDonald\'s Corporation',
      'DIS': 'The Walt Disney Company',
      'ADBE': 'Adobe Inc.',
      'CRM': 'Salesforce Inc.'
    };
    return symbolToName[symbol] || symbol;
  };
  
  const companyName = getCompanyName(symbol);

  // Smart functionality: Fetch current real-time data
  const fetchCurrentQuote = async () => {
    if (!symbol || symbol === 'Stock') return;
    
    setLoadingCurrent(true);
    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Get current quote for ${symbol}` })
      });
      
      const result = await response.json();
      if (result.success && result.data) {
        setCurrentQuote(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch current quote:', error);
    } finally {
      setLoadingCurrent(false);
    }
  };

  // Auto-fetch current data when component mounts or symbol changes
  useEffect(() => {
    fetchCurrentQuote();
  }, [symbol]);

  if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No historical data available</p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Data type: {typeof data}, Array: {Array.isArray(data) ? 'Yes' : 'No'}
        </p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Actual data type: {typeof actualData}, Array: {Array.isArray(actualData) ? 'Yes' : 'No'}
        </p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Historical data type: {typeof historicalData}, Array: {Array.isArray(historicalData) ? 'Yes' : 'No'}, Length: {historicalData?.length || 0}
        </p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Sample data: {JSON.stringify(actualData, null, 2).substring(0, 200)}...
        </p>
      </div>
    );
  }

  // Prepare data for Highcharts with proper validation
  const chartData = historicalData
    .filter(item => item && item.date && item.close && item.open && item.high && item.low)
    .map(item => [
      new Date(item.date).getTime(),
      parseFloat(item.close) || 0,
      parseFloat(item.open) || 0,
      parseFloat(item.high) || 0,
      parseFloat(item.low) || 0,
      parseInt(item.volume) || 0
    ]);

  console.log('StockChart - Raw data:', data);
  console.log('StockChart - Actual data:', actualData);
  console.log('StockChart - Historical data (converted):', historicalData.length, 'items');
  console.log('StockChart - Chart data:', chartData.length, 'items');
  console.log('StockChart - Sample historical data:', historicalData.slice(0, 3));
  console.log('StockChart - Sample chart data:', chartData.slice(0, 3));

  const priceData = historicalData
    .filter(item => item && item.date && item.close)
    .map(item => [
      new Date(item.date).getTime(),
      parseFloat(item.close) || 0
    ]);

  const volumeData = historicalData
    .filter(item => item && item.date && item.volume)
    .map(item => [
      new Date(item.date).getTime(),
      parseInt(item.volume) || 0
    ]);

  // Calculate statistics with proper validation
  const prices = historicalData
    .filter(item => item && item.close)
    .map(item => parseFloat(item.close) || 0);
  const currentPrice = prices[prices.length - 1] || 0;
  const previousPrice = prices[prices.length - 2] || 0;
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice ? (change / previousPrice) * 100 : 0;
  const high = prices.length > 0 ? Math.max(...prices) : 0;
  const low = prices.length > 0 ? Math.min(...prices) : 0;
  const avgVolume = historicalData.length > 0 
    ? historicalData.reduce((sum, item) => sum + (parseInt(item.volume) || 0), 0) / historicalData.length 
    : 0;

  const options = {
    chart: {
      type: 'candlestick',
      height: 400,
      backgroundColor: '#fafafa',
      animation: true
    },
    title: {
      text: `${symbol} - ${companyName} - Price Chart`,
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Price ($)'
      },
      opposite: true
    },
    series: [{
      name: symbol,
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
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  };

  const lineOptions = {
    chart: {
      type: 'line',
      height: 300,
      backgroundColor: '#fafafa'
    },
    title: {
      text: `${symbol} - ${companyName} - Price Trend`,
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Price ($)'
      }
    },
    series: [{
      name: symbol,
      data: priceData,
      color: change >= 0 ? '#52c41a' : '#ff4d4f',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }],
    tooltip: {
      formatter: function() {
        return `
          <b>${new Date(this.x).toLocaleDateString()}</b><br/>
          Price: $${this.y.toFixed(2)}
        `;
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  };

  const volumeOptions = {
    chart: {
      type: 'column',
      height: 200,
      backgroundColor: '#fafafa'
    },
    title: {
      text: `${symbol} - ${companyName} - Volume`,
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Volume'
      }
    },
    series: [{
      name: 'Volume',
      data: volumeData,
      color: '#1890ff'
    }],
    tooltip: {
      formatter: function() {
        return `
          <b>${new Date(this.x).toLocaleDateString()}</b><br/>
          Volume: ${this.y ? this.y.toLocaleString() : 'N/A'}
        `;
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 20, 
        padding: '16px', 
        backgroundColor: '#f0f2f5', 
        borderRadius: '8px',
        border: '1px solid #d9d9d9'
      }}>
        <h2 style={{ margin: 0, color: '#1890ff', fontSize: '20px' }}>
          {symbol} - {companyName}
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
          Historical Price Data ({historicalData.length} days)
        </p>
      </div>

      {/* Smart Statistics Row - Current vs Historical */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>CURRENT PRICE</div>
            {loadingCurrent ? (
              <Spin size="small" />
            ) : currentQuote ? (
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                  ${currentQuote.regularMarketPrice?.toFixed(2) || 'N/A'}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {currentQuote.regularMarketChange >= 0 ? '+' : ''}{currentQuote.regularMarketChange?.toFixed(2)} 
                  ({currentQuote.regularMarketChangePercent >= 0 ? '+' : ''}{(currentQuote.regularMarketChangePercent * 100)?.toFixed(2)}%)
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#999' }}>Loading...</div>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>HISTORICAL END</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
              ${currentPrice.toFixed(2)}
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>PERIOD HIGH</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
              ${high.toFixed(2)}
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              {historicalData.length} days
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', backgroundColor: '#fff1f0', border: '1px solid #ffccc7' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>PERIOD LOW</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
              ${low.toFixed(2)}
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              Range: ${(high - low).toFixed(2)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Smart Analysis Section */}
      {currentQuote && (
        <Alert
          message="Smart Analysis"
          description={
            <div>
              <strong>Price Comparison:</strong> Current price (${currentQuote.regularMarketPrice?.toFixed(2)}) vs Historical end (${currentPrice.toFixed(2)})
              <br />
              <strong>Performance:</strong> {currentQuote.regularMarketPrice > currentPrice ? 
                `Stock has gained $${(currentQuote.regularMarketPrice - currentPrice).toFixed(2)} since historical period end` :
                `Stock has declined $${(currentPrice - currentQuote.regularMarketPrice).toFixed(2)} since historical period end`
              }
              <br />
              <strong>Market Status:</strong> {currentQuote.marketState === 'REGULAR' ? 'Market Open' : 'Market Closed'}
              {lastUpdated && (
                <span style={{ fontSize: '11px', color: '#666', marginLeft: '10px' }}>
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <button 
              onClick={fetchCurrentQuote} 
              disabled={loadingCurrent}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: '#1890ff',
                fontSize: '12px'
              }}
            >
              <ReloadOutlined spin={loadingCurrent} /> Refresh
            </button>
          }
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic
            title="Avg Volume"
            value={avgVolume}
            formatter={(value) => value ? value.toLocaleString() : 'N/A'}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Data Points"
            value={historicalData.length}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Period"
            value={`${historicalData.length} days`}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Price Range"
            value={`$${(high - low).toFixed(2)}`}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>

      {/* Debug Info */}
      <Card title="Debug Info" style={{ marginBottom: 16, fontSize: 12 }}>
        <p><strong>Data Type:</strong> {Array.isArray(data) ? 'Array' : 'Object'}</p>
        <p><strong>Historical Data Length:</strong> {historicalData.length}</p>
        <p><strong>Chart Data Length:</strong> {chartData.length}</p>
        <p><strong>Price Data Length:</strong> {priceData.length}</p>
        <p><strong>Sample Data:</strong> {JSON.stringify(historicalData.slice(0, 2), null, 2)}</p>
      </Card>

      {/* Charts */}
      <Card title={`${symbol} - ${companyName} - Price Chart`} style={{ marginBottom: 16 }}>
        {chartData.length > 0 ? (
          <div>
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
            />
          </div>
        ) : priceData.length > 0 ? (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>Candlestick data unavailable, showing line chart:</p>
            <HighchartsReact
              highcharts={Highcharts}
              options={lineOptions}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No valid chart data available</p>
            <p style={{ fontSize: 12, color: '#666' }}>
              Data points: {historicalData.length}, Valid points: {chartData.length}
            </p>
          </div>
        )}
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Price Trend">
            <HighchartsReact
              highcharts={Highcharts}
              options={lineOptions}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Volume">
            <HighchartsReact
              highcharts={Highcharts}
              options={volumeOptions}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
