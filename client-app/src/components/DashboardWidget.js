import React, { useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Tag, Button, Dropdown, Menu } from 'antd';
import { TrendingUpOutlined, TrendingDownOutlined, DollarOutlined, ExpandOutlined, ShrinkOutlined, SettingOutlined, CloseOutlined } from '@ant-design/icons';
import { StockTable } from './StockTable';
import { StockChart } from './StockChart';
import { MarketOverview } from './MarketOverview';
import { PortfolioAnalysis } from './PortfolioAnalysis';
import { SmartWidgetSelector } from './SmartWidgetSelector';

const { Title, Text } = Typography;

export const DashboardWidget = ({ type, data, title, onRemove, query, toolUsed }) => {
  const [widgetSize, setWidgetSize] = useState('medium'); // small, medium, large, full

  const getSizeClass = () => {
    switch (widgetSize) {
      case 'small': return 'widget-small';
      case 'medium': return 'widget-medium';
      case 'large': return 'widget-large';
      case 'full': return 'widget-full';
      default: return 'widget-medium';
    }
  };

  const getStockSymbol = () => {
    if (!data) return '';
    
    // Handle different data structures
    const actualData = data.regularMarketPrice ? data : (data.data || data);
    
    // Try to get symbol from various possible fields
    const symbol = actualData.symbol || 
                  actualData.shortName || 
                  actualData.longName || 
                  (Array.isArray(data) && data.length > 0 ? data[0].symbol : '');
    
    return symbol;
  };

  const getStockName = () => {
    if (!data) return '';
    
    const actualData = data.regularMarketPrice ? data : (data.data || data);
    
    // Try to get company name from various possible fields
    let name = actualData.longName || 
               actualData.shortName || 
               (Array.isArray(data) && data.length > 0 ? data[0].longName || data[0].shortName : '');
    
    // If no name found, try to map symbol to company name
    if (!name && actualData.symbol) {
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
      name = symbolToName[actualData.symbol] || actualData.symbol;
    }
    
    return name;
  };

  const getSizeMenu = () => (
    <Menu onClick={({ key }) => setWidgetSize(key)}>
      <Menu.Item key="small" icon={<ShrinkOutlined />}>
        Small (1/4 width)
      </Menu.Item>
      <Menu.Item key="medium" icon={<SettingOutlined />}>
        Medium (1/2 width)
      </Menu.Item>
      <Menu.Item key="large" icon={<ExpandOutlined />}>
        Large (3/4 width)
      </Menu.Item>
      <Menu.Item key="full" icon={<ExpandOutlined />}>
        Full Width
      </Menu.Item>
    </Menu>
  );

  const renderWidget = () => {
    switch (type) {
      case 'stock_analysis':
        return <StockAnalysisWidget data={data} />;
      
      case 'stock_comparison':
        return <StockComparisonWidget data={data} />;
      
      case 'market_overview':
        return <MarketOverview data={data} />;
      
      case 'stock_quote':
        return <StockQuoteWidget data={data} />;
      
      case 'historical_chart':
        return <SmartWidgetSelector data={data} query={query} toolUsed={toolUsed} />;
      
      case 'portfolio_analysis':
        return <PortfolioAnalysis data={data} />;
      
      case 'trending_stocks':
        return <TrendingStocksWidget data={data} />;
      
      case 'trending_etfs':
        return <TrendingETFsWidget data={data} />;
      
      case 'search_results':
        return <SearchResultsWidget data={data} />;
      
      case 'insights':
        return <InsightsWidget data={data} />;
      
      case 'chart_data':
        return <ChartDataWidget data={data} />;
      
      case 'quote_summary':
        return <QuoteSummaryWidget data={data} />;
      
      case 'fundamentals':
        return <FundamentalsWidget data={data} />;
      
      case 'trending_symbols':
        return <TrendingSymbolsWidget data={data} />;
      
      case 'daily_gainers':
        return <DailyGainersWidget data={data} />;
      
      case 'screener':
        return <ScreenerWidget data={data} />;
      
      case 'autoc':
        return <AutocWidget data={data} />;
      
      case 'trending':
        return <StockTable data={data} />;
      
      case 'quotes':
        return <SmartWidgetSelector data={data} query={query} toolUsed={toolUsed} />;
      
      case 'error':
        return <ErrorWidget data={data} title={title} />;
      
      case 'search':
        return <SearchResultsWidget data={data} />;
      
      default:
        return <GeneralWidget data={data} title={title} />;
    }
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
            {(getStockSymbol() || getStockName()) && (
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                {getStockSymbol() && getStockName() && getStockSymbol() !== getStockName() 
                  ? `${getStockSymbol()} - ${getStockName()}`
                  : getStockSymbol() || getStockName()
                }
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dropdown overlay={getSizeMenu()} trigger={['click']}>
              <Button 
                type="text" 
                size="small" 
                icon={<SettingOutlined />}
              >
                Size
              </Button>
            </Dropdown>
            {onRemove && (
              <Button 
                type="text" 
                size="small" 
                icon={<CloseOutlined />} 
                onClick={onRemove}
                style={{ color: '#ff4d4f' }}
                title="Remove widget"
              />
            )}
          </div>
        </div>
      }
      className={`dashboard-widget ${getSizeClass()}`}
      extra={null}
    >
      {renderWidget()}
    </Card>
  );
};

const StockAnalysisWidget = ({ data }) => {
  // Handle both old and new data structures
  const actualData = data.regularMarketPrice ? data : (data.data || data);
  
  // Map Yahoo Finance API field names to widget field names
  const price = actualData.regularMarketPrice || actualData.price;
  const change = actualData.regularMarketChange || actualData.change;
  const changePercent = actualData.regularMarketChangePercent || actualData.changePercent;
  const volume = actualData.regularMarketVolume || actualData.volume;
  const marketCap = actualData.marketCap;
  const pe = actualData.trailingPE || actualData.pe;
  const dividendYield = actualData.dividendYield;

  return (
    <div>
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
      
      {dividendYield && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Statistic
              title="Dividend Yield"
              value={dividendYield}
              suffix="%"
              precision={2}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

const StockComparisonWidget = ({ data }) => {
  // Handle both old and new data structures
  const actualData = data.data || data;
  const comparisonData = actualData.comparison || actualData;
  
  return (
    <div>
      <StockTable data={comparisonData} />
    </div>
  );
};

const StockQuoteWidget = ({ data }) => {
  // Handle both old and new data structures
  const actualData = data.regularMarketPrice ? data : (data.data || data);
  
  // Map Yahoo Finance API field names to widget field names
  const price = actualData.regularMarketPrice || actualData.price;
  const change = actualData.regularMarketChange || actualData.change;
  const changePercent = actualData.regularMarketChangePercent || actualData.changePercent;
  const volume = actualData.regularMarketVolume || actualData.volume;
  const marketCap = actualData.marketCap;
  const pe = actualData.trailingPE || actualData.pe;
  const dividendYield = actualData.dividendYield;

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Symbol"
            value={data.symbol}
            valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Price"
            value={price}
            prefix="$"
            precision={2}
            valueStyle={{ 
              color: change >= 0 ? '#3f8600' : '#cf1322',
              fontSize: 24,
              fontWeight: 'bold'
            }}
          />
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Statistic
            title="Change"
            value={change}
            prefix={change >= 0 ? '+' : ''}
            precision={2}
            valueStyle={{ color: change >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={12}>
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
      
      {dividendYield && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Statistic
              title="Dividend Yield"
              value={dividendYield}
              suffix="%"
              precision={2}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

const TrendingStocksWidget = ({ data }) => {
  // Handle both old and new data structures
  let actualData;
  if (Array.isArray(data)) {
    actualData = data;
  } else if (data.data && Array.isArray(data.data)) {
    actualData = data.data;
  } else if (data && typeof data === 'object') {
    // Convert object with numeric keys to array (same as StockChart)
    actualData = Object.values(data).filter(item => 
      item && typeof item === 'object' && item.symbol
    );
  } else {
    actualData = [];
  }
  
  if (!Array.isArray(actualData) || actualData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No trending stocks data available</p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Data type: {typeof data}, Array: {Array.isArray(data) ? 'Yes' : 'No'}
        </p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Actual data type: {typeof actualData}, Array: {Array.isArray(actualData) ? 'Yes' : 'No'}, Length: {actualData?.length || 0}
        </p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Sample data: {JSON.stringify(data, null, 2).substring(0, 200)}...
        </p>
      </div>
    );
  }

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Text strong style={{ fontSize: 14 }}>{text}</Text>
    },
    {
      title: 'Company',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text strong>${price != null ? price.toFixed(2) : 'N/A'}</Text>
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change != null ? (change >= 0 ? '+' : '') + change.toFixed(2) : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (changePercent) => (
        <Text style={{ color: changePercent >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {changePercent != null ? (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%' : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => <Text>{volume ? volume.toLocaleString() : 'N/A'}</Text>
    },
    {
      title: 'Market Cap',
      dataIndex: 'marketCap',
      key: 'marketCap',
      render: (marketCap) => (
        <Text>{marketCap ? `$${(marketCap / 1e9).toFixed(1)}B` : 'N/A'}</Text>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic
            title="Total Trending Stocks"
            value={actualData.length}
            suffix="stocks"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
      
      <StockTable 
        data={actualData} 
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        size="small"
      />
    </div>
  );
};

const TrendingETFsWidget = ({ data }) => {
  let actualData;
  if (Array.isArray(data)) {
    actualData = data;
  } else if (data.data && Array.isArray(data.data)) {
    actualData = data.data;
  } else if (data && typeof data === 'object') {
    // Convert object with numeric keys to array
    actualData = Object.values(data).filter(item => 
      item && typeof item === 'object' && item.symbol
    );
  } else {
    actualData = [];
  }

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol) => <Text strong>{symbol}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text>{name || 'N/A'}</Text>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text>${price ? price.toFixed(2) : 'N/A'}</Text>
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change ? (change >= 0 ? '+' : '') + change.toFixed(2) : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (changePercent) => (
        <Text style={{ color: changePercent >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {changePercent ? (changePercent >= 0 ? '+' : '') + (changePercent * 100).toFixed(2) + '%' : 'N/A'}
        </Text>
      )
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume) => <Text>{volume ? volume.toLocaleString() : 'N/A'}</Text>
    },
    {
      title: 'Market Cap',
      dataIndex: 'marketCap',
      key: 'marketCap',
      render: (marketCap) => (
        <Text>{marketCap ? `$${(marketCap / 1e9).toFixed(1)}B` : 'N/A'}</Text>
      )
    },
    {
      title: 'Dividend Yield',
      dataIndex: 'dividendYield',
      key: 'dividendYield',
      render: (dividendYield) => <Text>{dividendYield ? `${(dividendYield * 100).toFixed(2)}%` : 'N/A'}</Text>
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic
            title="Total Trending ETFs"
            value={actualData.length}
            suffix="ETFs"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
      
      <StockTable 
        data={actualData} 
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        size="small"
      />
    </div>
  );
};

const SearchResultsWidget = ({ data }) => {
  let actualData;
  if (Array.isArray(data)) {
    actualData = data;
  } else if (data.data && Array.isArray(data.data)) {
    actualData = data.data;
  } else if (data && typeof data === 'object') {
    // Convert object with numeric keys to array
    actualData = Object.values(data).filter(item => 
      item && typeof item === 'object' && item.symbol
    );
  } else {
    actualData = [];
  }

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol) => <Text strong>{symbol}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'longName',
      key: 'longName',
      render: (name) => <Text>{name || 'N/A'}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'quoteType',
      key: 'quoteType',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Exchange',
      dataIndex: 'exchange',
      key: 'exchange',
      render: (exchange) => <Text>{exchange || 'N/A'}</Text>
    },
    {
      title: 'Price',
      dataIndex: 'regularMarketPrice',
      key: 'price',
      render: (price) => <Text>{price ? `$${price.toFixed(2)}` : 'N/A'}</Text>
    },
    {
      title: 'Change %',
      dataIndex: 'regularMarketChangePercent',
      key: 'changePercent',
      render: (change) => (
        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change ? `${(change * 100).toFixed(2)}%` : 'N/A'}
        </Text>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic
            title="Search Results"
            value={actualData.length}
            suffix="instruments found"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
      
      <StockTable 
        data={actualData} 
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        size="small"
      />
    </div>
  );
};

const ErrorWidget = ({ data, title }) => {
  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <Text type="danger" style={{ fontSize: '16px' }}>
        ⚠️ Error: {data.message || 'Something went wrong'}
      </Text>
      <br />
      <Text type="secondary" style={{ fontSize: '12px' }}>
        Please try a different query or check your input.
      </Text>
    </div>
  );
};

const GeneralWidget = ({ data, title }) => {
  // Handle both old and new data structures
  const actualData = data.data || data;
  
  // If it's a string, render as HTML
  if (typeof actualData === 'string') {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: actualData }}
        style={{ 
          padding: '16px',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }}
      />
    );
  }
  
  // If it's an object, try to render as formatted content
  if (typeof actualData === 'object' && actualData !== null) {
    return (
      <div style={{ padding: '16px' }}>
        <h4 style={{ marginBottom: '12px', color: '#1890ff' }}>{title}</h4>
        {Object.entries(actualData).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '8px', display: 'flex' }}>
            <strong style={{ minWidth: '120px', color: '#666' }}>{key}:</strong>
            <span style={{ marginLeft: '8px' }}>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback to JSON for other types
  return (
    <div>
      <Text type="secondary">
        {title}: {JSON.stringify(actualData, null, 2)}
      </Text>
    </div>
  );
};

// New Widget Components for Additional Tools

const InsightsWidget = ({ data }) => {
  const actualData = data.data || data;
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic title="Technical Analysis" value="Insights" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>
      
      {/* Technical Outlook */}
      {actualData.instrumentInfo?.technicalEvents && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Technical Outlook</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="Short Term" style={{ textAlign: 'center' }}>
                <div style={{ color: actualData.instrumentInfo.technicalEvents.shortTermOutlook?.direction === 'Bullish' ? '#52c41a' : '#ff4d4f' }}>
                  {actualData.instrumentInfo.technicalEvents.shortTermOutlook?.direction || 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {actualData.instrumentInfo.technicalEvents.shortTermOutlook?.scoreDescription || ''}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Intermediate Term" style={{ textAlign: 'center' }}>
                <div style={{ color: actualData.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction === 'Bullish' ? '#52c41a' : '#ff4d4f' }}>
                  {actualData.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction || 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {actualData.instrumentInfo.technicalEvents.intermediateTermOutlook?.scoreDescription || ''}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Long Term" style={{ textAlign: 'center' }}>
                <div style={{ color: actualData.instrumentInfo.technicalEvents.longTermOutlook?.direction === 'Bullish' ? '#52c41a' : '#ff4d4f' }}>
                  {actualData.instrumentInfo.technicalEvents.longTermOutlook?.direction || 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {actualData.instrumentInfo.technicalEvents.longTermOutlook?.scoreDescription || ''}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}
      
      {/* Key Technical Levels */}
      {actualData.instrumentInfo?.keyTechnicals && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Key Technical Levels</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title="Support" 
                value={actualData.instrumentInfo.keyTechnicals.support ? `$${actualData.instrumentInfo.keyTechnicals.support}` : 'N/A'} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Resistance" 
                value={actualData.instrumentInfo.keyTechnicals.resistance ? `$${actualData.instrumentInfo.keyTechnicals.resistance}` : 'N/A'} 
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Stop Loss" 
                value={actualData.instrumentInfo.keyTechnicals.stopLoss ? `$${actualData.instrumentInfo.keyTechnicals.stopLoss}` : 'N/A'} 
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>
        </div>
      )}
      
      {/* Valuation */}
      {actualData.instrumentInfo?.valuation && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Valuation</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title="Assessment" 
                value={actualData.instrumentInfo.valuation.description || 'N/A'} 
                valueStyle={{ 
                  color: actualData.instrumentInfo.valuation.description === 'Overvalued' ? '#ff4d4f' : 
                         actualData.instrumentInfo.valuation.description === 'Undervalued' ? '#52c41a' : '#faad14'
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Discount/Premium" 
                value={actualData.instrumentInfo.valuation.discount || 'N/A'} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Relative Value" 
                value={actualData.instrumentInfo.valuation.relativeValue || 'N/A'} 
                valueStyle={{ color: '#666' }}
              />
            </Col>
          </Row>
        </div>
      )}
      
      {/* Investment Recommendation */}
      {actualData.recommendation && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Investment Recommendation</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic 
                title="Rating" 
                value={actualData.recommendation.rating || 'N/A'} 
                valueStyle={{ 
                  color: actualData.recommendation.rating === 'BUY' ? '#52c41a' : 
                         actualData.recommendation.rating === 'SELL' ? '#ff4d4f' : '#faad14'
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Target Price" 
                value={actualData.recommendation.targetPrice ? `$${actualData.recommendation.targetPrice}` : 'N/A'} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Provider" 
                value={actualData.recommendation.provider || 'N/A'} 
                valueStyle={{ color: '#666' }}
              />
            </Col>
          </Row>
        </div>
      )}
      
      {/* Recent Reports */}
      {actualData.reports && actualData.reports.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Recent Analysis Reports</Title>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {actualData.reports.slice(0, 3).map((report, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                  {report.provider} • {new Date(report.reportDate).toLocaleDateString()}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {report.reportTitle}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {report.reportType} • {report.investmentRating || 'N/A'}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          Technical analysis insights and recommendations based on market data and technical indicators.
        </Text>
      </div>
    </div>
  );
};

const ChartDataWidget = ({ data }) => {
  const actualData = data.data || data;
  
  if (Array.isArray(actualData) && actualData.length > 0) {
    const latest = actualData[actualData.length - 1];
    const first = actualData[0];
    const high = Math.max(...actualData.map(d => d.high || 0));
    const low = Math.min(...actualData.map(d => d.low || 0));
    const avgVolume = actualData.reduce((sum, d) => sum + (d.volume || 0), 0) / actualData.length;
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Statistic title="Chart Data Points" value={actualData.length} valueStyle={{ color: '#1890ff' }} />
          </Col>
        </Row>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic 
              title="Current Price" 
              value={latest.close != null ? `$${latest.close.toFixed(2)}` : 'N/A'} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Period High" 
              value={high != null ? `$${high.toFixed(2)}` : 'N/A'} 
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Period Low" 
              value={low != null ? `$${low.toFixed(2)}` : 'N/A'} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Price Range" 
              value={high != null && low != null ? `$${(high - low).toFixed(2)}` : 'N/A'} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Statistic 
              title="Price Change" 
              value={first && latest && first.close != null && latest.close != null ? `$${(latest.close - first.close).toFixed(2)}` : 'N/A'} 
              valueStyle={{ 
                color: first && latest && latest.close > first.close ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Col>
          <Col span={12}>
            <Statistic 
              title="Avg Volume" 
              value={avgVolume.toLocaleString()} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </div>
    );
  }
  
  return (
    <div>
      <Text type="secondary">Chart data not available</Text>
    </div>
  );
};

const QuoteSummaryWidget = ({ data }) => {
  const actualData = data.data || data;
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic title="Comprehensive Summary" value="Financial Data" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>
      
      {actualData.summaryProfile && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Company Overview</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Company: </Text>
              <Text>{actualData.summaryProfile.longName || 'N/A'}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Sector: </Text>
              <Text>{actualData.summaryProfile.sector || 'N/A'}</Text>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text strong>Industry: </Text>
              <Text>{actualData.summaryProfile.industry || 'N/A'}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Employees: </Text>
              <Text>{actualData.summaryProfile.fullTimeEmployees?.toLocaleString() || 'N/A'}</Text>
            </Col>
          </Row>
        </div>
      )}
      
      {actualData.defaultKeyStatistics && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>Key Metrics</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="Market Cap" 
                value={actualData.defaultKeyStatistics.marketCap ? `$${(actualData.defaultKeyStatistics.marketCap / 1e9).toFixed(2)}B` : 'N/A'} 
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="P/E Ratio" 
                value={actualData.defaultKeyStatistics.trailingPE || 'N/A'} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Dividend Yield" 
                value={actualData.defaultKeyStatistics.dividendYield ? `${(actualData.defaultKeyStatistics.dividendYield * 100).toFixed(2)}%` : 'N/A'} 
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Beta" 
                value={actualData.defaultKeyStatistics.beta || 'N/A'} 
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

const FundamentalsWidget = ({ data }) => {
  const actualData = data.data || data;
  
  // Check if we have a text message (from fundamentals_analysis tool)
  const textContent = actualData?.message || actualData?.text || actualData?.content;
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic title="Fundamentals Analysis" value="Financial Ratios & Metrics" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>
      
      {textContent ? (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fafafa', 
          borderRadius: '6px',
          maxHeight: '400px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.4'
        }}>
          <div dangerouslySetInnerHTML={{ 
            __html: textContent
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/^### (.*$)/gm, '<h3 style="color: #1890ff; margin: 16px 0 8px 0;">$1</h3>')
              .replace(/^## (.*$)/gm, '<h2 style="color: #1890ff; margin: 20px 0 12px 0;">$1</h2>')
              .replace(/^# (.*$)/gm, '<h1 style="color: #1890ff; margin: 24px 0 16px 0;">$1</h1>')
              .replace(/^- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
              .replace(/\n/g, '<br>')
          }} />
        </div>
      ) : (
        <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
          <Text strong>Data Available: </Text>
          <Text>{actualData ? 'Yes' : 'No'}</Text>
          <br />
          <Text type="secondary">
            {actualData ? 'Fundamentals data loaded successfully' : 'No fundamentals data available'}
          </Text>
        </div>
      )}
    </div>
  );
};

const TrendingSymbolsWidget = ({ data }) => {
  const actualData = data.data || data;
  const quotes = actualData.quotes || actualData;
  
  if (Array.isArray(quotes) && quotes.length > 0) {
    const columns = [
      { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', render: (symbol) => <Text strong>{symbol}</Text> },
      { title: 'Name', dataIndex: 'longName', key: 'longName', render: (name) => <Text>{name || 'N/A'}</Text> },
      { title: 'Price', dataIndex: 'regularMarketPrice', key: 'price', render: (price) => <Text>${price ? price.toFixed(2) : 'N/A'}</Text> },
      { title: 'Change', dataIndex: 'regularMarketChange', key: 'change', render: (change) => (
        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change ? (change >= 0 ? '+' : '') + change.toFixed(2) : 'N/A'}
        </Text>
      )},
      { title: 'Change %', dataIndex: 'regularMarketChangePercent', key: 'changePercent', render: (changePercent) => (
        <Text style={{ color: changePercent >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {changePercent ? (changePercent >= 0 ? '+' : '') + (changePercent * 100).toFixed(2) + '%' : 'N/A'}
        </Text>
      )},
      { title: 'Volume', dataIndex: 'regularMarketVolume', key: 'volume', render: (volume) => <Text>{volume ? volume.toLocaleString() : 'N/A'}</Text> }
    ];
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Statistic title="Trending Symbols" value={quotes.length} suffix="symbols" valueStyle={{ color: '#1890ff' }} />
          </Col>
        </Row>
        <StockTable data={quotes} columns={columns} pagination={{ pageSize: 10, showSizeChanger: true }} size="small" />
      </div>
    );
  }
  
  return (
    <div>
      <Text type="secondary">No trending symbols data available</Text>
    </div>
  );
};

const DailyGainersWidget = ({ data }) => {
  const actualData = data.data || data;
  const quotes = actualData.quotes || actualData;
  
  if (Array.isArray(quotes) && quotes.length > 0) {
    const columns = [
      { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', render: (symbol) => <Text strong>{symbol}</Text> },
      { title: 'Name', dataIndex: 'longName', key: 'longName', render: (name) => <Text>{name || 'N/A'}</Text> },
      { title: 'Price', dataIndex: 'regularMarketPrice', key: 'price', render: (price) => <Text>${price ? price.toFixed(2) : 'N/A'}</Text> },
      { title: 'Gain', dataIndex: 'regularMarketChange', key: 'change', render: (change) => (
        <Text style={{ color: '#52c41a' }}>
          +{change ? change.toFixed(2) : 'N/A'}
        </Text>
      )},
      { title: 'Gain %', dataIndex: 'regularMarketChangePercent', key: 'changePercent', render: (changePercent) => (
        <Text style={{ color: '#52c41a' }}>
          +{changePercent ? (changePercent * 100).toFixed(2) + '%' : 'N/A'}
        </Text>
      )},
      { title: 'Volume', dataIndex: 'regularMarketVolume', key: 'volume', render: (volume) => <Text>{volume ? volume.toLocaleString() : 'N/A'}</Text> },
      { title: '52W High', dataIndex: 'fiftyTwoWeekHigh', key: 'high', render: (high) => <Text>${high ? high.toFixed(2) : 'N/A'}</Text> }
    ];
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Statistic title="Daily Gainers" value={quotes.length} suffix="stocks" valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>
        <StockTable data={quotes} columns={columns} pagination={{ pageSize: 10, showSizeChanger: true }} size="small" />
      </div>
    );
  }
  
  return (
    <div>
      <Text type="secondary">No daily gainers data available</Text>
    </div>
  );
};

const ScreenerWidget = ({ data }) => {
  const actualData = data.data || data;
  const quotes = actualData.quotes || actualData;
  
  if (Array.isArray(quotes) && quotes.length > 0) {
    const columns = [
      { title: 'Symbol', dataIndex: 'symbol', key: 'symbol', render: (symbol) => <Text strong>{symbol}</Text> },
      { title: 'Name', dataIndex: 'longName', key: 'longName', render: (name) => <Text>{name || 'N/A'}</Text> },
      { title: 'Price', dataIndex: 'regularMarketPrice', key: 'price', render: (price) => <Text>${price ? price.toFixed(2) : 'N/A'}</Text> },
      { title: 'Change', dataIndex: 'regularMarketChange', key: 'change', render: (change) => (
        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {change ? (change >= 0 ? '+' : '') + change.toFixed(2) : 'N/A'}
        </Text>
      )},
      { title: 'Change %', dataIndex: 'regularMarketChangePercent', key: 'changePercent', render: (changePercent) => (
        <Text style={{ color: changePercent >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {changePercent ? (changePercent >= 0 ? '+' : '') + (changePercent * 100).toFixed(2) + '%' : 'N/A'}
        </Text>
      )},
      { title: 'P/E Ratio', dataIndex: 'trailingPE', key: 'pe', render: (pe) => <Text>{pe || 'N/A'}</Text> },
      { title: 'Dividend Yield', dataIndex: 'dividendYield', key: 'dividend', render: (dividendYield) => (
        <Text>{dividendYield ? (dividendYield * 100).toFixed(2) + '%' : 'N/A'}</Text>
      )}
    ];
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Statistic title="Screener Results" value={quotes.length} suffix="stocks" valueStyle={{ color: '#1890ff' }} />
          </Col>
        </Row>
        <StockTable data={quotes} columns={columns} pagination={{ pageSize: 10, showSizeChanger: true }} size="small" />
      </div>
    );
  }
  
  return (
    <div>
      <Text type="secondary">No screener results available</Text>
    </div>
  );
};

const AutocWidget = ({ data }) => {
  const actualData = data.data || data;
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic title="Search Suggestions" value="Auto-Complete" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>
      
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Auto-complete suggestions for stock symbol searches. Start typing a company name or symbol to get suggestions.
        </Text>
      </div>
      
      <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
        <Text strong>Suggestions Available: </Text>
        <Text>{actualData ? 'Yes' : 'No'}</Text>
        <br />
        <Text type="secondary">
          {actualData ? 'Auto-complete suggestions loaded successfully' : 'No suggestions available'}
        </Text>
      </div>
    </div>
  );
};
