import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag, Button, Spin } from 'antd';
import { 
  BarChartOutlined, 
  TableOutlined, 
  LineChartOutlined, 
  SearchOutlined,
  RiseOutlined,
  DollarOutlined,
  FundOutlined,
  PieChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const QuerySuggestions = ({ onSuggestionClick, currentQuery = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [llmSuggestions, setLlmSuggestions] = useState([]);
  const [llmLoading, setLlmLoading] = useState(false);

  useEffect(() => {
    fetchAvailableTools();
  }, []);

  useEffect(() => {
    if (currentQuery && currentQuery.length > 3) {
      fetchLlmSuggestions(currentQuery);
    } else {
      setLlmSuggestions([]);
    }
  }, [currentQuery]);

  const fetchAvailableTools = async () => {
    try {
      const response = await fetch('http://localhost:3001/tools');
      const data = await response.json();
      
      if (data.tools) {
        const dynamicSuggestions = generateSuggestionsFromTools(data.tools);
        setSuggestions(dynamicSuggestions);
      } else {
        // Fallback to static suggestions if API fails
        setSuggestions(getStaticSuggestions());
      }
    } catch (error) {
      console.warn('Failed to fetch available tools, using static suggestions:', error);
      setSuggestions(getStaticSuggestions());
    } finally {
      setLoading(false);
    }
  };

  const fetchLlmSuggestions = async (query) => {
    setLlmLoading(true);
    try {
      const response = await fetch('http://localhost:3001/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      
      if (data.suggestions && data.suggestions.length > 0) {
        setLlmSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching LLM suggestions:', error);
      setLlmSuggestions([]);
    } finally {
      setLlmLoading(false);
    }
  };

  const generateSuggestionsFromTools = (tools) => {
    const suggestions = [];
    
    // Group tools by category
    const categories = {
      quotes: { icon: <DollarOutlined />, color: '#52c41a', name: 'Stock Quotes' },
      charts: { icon: <LineChartOutlined />, color: '#1890ff', name: 'Historical Charts' },
      trending: { icon: <RiseOutlined />, color: '#722ed1', name: 'Trending Stocks' },
      search: { icon: <SearchOutlined />, color: '#fa8c16', name: 'Symbol Search' },
      etfs: { icon: <PieChartOutlined />, color: '#2f54eb', name: 'Trending ETFs' },
      insights: { icon: <BarChartOutlined />, color: '#eb2f96', name: 'Technical Analysis' }
    };

    // Generate suggestions based on available tools
    for (const [category, config] of Object.entries(categories)) {
      const categoryTools = tools.filter(tool => 
        tool.capabilities.category === category || 
        tool.name.includes(category) ||
        (category === 'quotes' && tool.name.includes('quote')) ||
        (category === 'charts' && tool.name.includes('historical'))
      );

      if (categoryTools.length > 0) {
        const queries = generateQueriesForCategory(category, categoryTools);
        if (queries.length > 0) {
          suggestions.push({
            category: config.name,
            icon: config.icon,
            color: config.color,
            queries: queries
          });
        }
      }
    }

    return suggestions;
  };

  const generateQueriesForCategory = (category, tools) => {
    const queries = [];
    
    switch (category) {
      case 'quotes':
        queries.push(
          'Show me Apple Inc. current stock price and market data',
          'What is Microsoft Corporation stock quote with key metrics',
          'Get Tesla Inc. real-time stock price and trading volume',
          'Display Google Alphabet stock price with 52-week range',
          'Show me Amazon stock quote with P/E ratio and market cap',
          'What is NVIDIA current stock price and analyst rating',
          'Get Meta Platforms stock quote with dividend yield',
          'Display Netflix stock price with earnings data',
          'Show me Berkshire Hathaway stock quote and book value',
          'What is JPMorgan Chase current stock price and sector info'
        );
        break;
      case 'charts':
        queries.push(
          'Show me Apple stock historical chart for the past 6 months',
          'Display Microsoft price history with volume analysis',
          'Get Tesla historical data chart with moving averages',
          'Show Google stock chart with technical indicators',
          'Display Amazon historical price chart for 1 year',
          'Show me NVIDIA stock chart with support and resistance levels',
          'Get Meta Platforms historical data with trend analysis',
          'Display Netflix stock chart with earnings announcements',
          'Show me Berkshire Hathaway historical price movement',
          'Get JPMorgan Chase stock chart with sector comparison'
        );
        break;
      case 'trending':
        queries.push(
          'Show me top 5 trending stocks by volume and price movement',
          'Display top 10 most active stocks in today\'s market',
          'Get trending stocks with highest percentage gains',
          'Show me top performing stocks in technology sector',
          'Display trending stocks with highest trading volume',
          'Get top 5 high dividend yield stocks for income investors',
          'Show me trending growth stocks with strong fundamentals',
          'Display most volatile stocks with high beta values',
          'Get trending small-cap stocks with growth potential',
          'Show me top trending stocks in healthcare sector'
        );
        break;
      case 'search':
        queries.push(
          'Search for Ford Motor Company stock symbol and ticker',
          'Find Tesla Inc. stock symbol and company information',
          'Search Apple Inc. ticker symbol and exchange details',
          'Find Microsoft Corporation stock code and market data',
          'Search for Amazon stock symbol and business information',
          'Find NVIDIA Corporation ticker and company profile',
          'Search Meta Platforms stock symbol and social media info',
          'Find Netflix stock ticker and streaming service details',
          'Search Berkshire Hathaway stock symbol and investment info',
          'Find JPMorgan Chase stock code and banking sector data'
        );
        break;
      case 'etfs':
        queries.push(
          'Show me top 5 trending ETFs by volume and performance',
          'Display most popular ETFs for diversified investing',
          'Get trending technology sector ETFs with holdings',
          'Show me top performing bond ETFs with yield data',
          'Display trending international ETFs with country exposure',
          'Get top dividend-focused ETFs for income generation',
          'Show me trending ESG ETFs with sustainability metrics',
          'Display most active commodity ETFs with price data',
          'Get trending sector rotation ETFs with allocation info',
          'Show me top trending REIT ETFs with real estate exposure'
        );
        break;
      case 'insights':
        queries.push(
          'Show me Apple technical analysis with buy/sell signals',
          'Get Microsoft chart insights with support and resistance',
          'Display Tesla technical analysis with momentum indicators',
          'Show Google stock insights with trend analysis',
          'Get Amazon technical summary with volume analysis',
          'Show me NVIDIA chart analysis with volatility metrics',
          'Display Meta Platforms technical insights with RSI data',
          'Get Netflix stock analysis with moving average signals',
          'Show me Berkshire Hathaway technical summary with fundamentals',
          'Display JPMorgan Chase chart analysis with sector trends'
        );
        break;
    }
    
    return queries;
  };

  const getStaticSuggestions = () => {
    return [
      {
        category: 'Stock Quotes',
        icon: <DollarOutlined />,
        color: '#52c41a',
        queries: [
          'Show me Apple Inc. current stock price and market data',
          'What is Microsoft Corporation stock quote with key metrics',
          'Get Tesla Inc. real-time stock price and trading volume',
          'Display Google Alphabet stock price with 52-week range',
          'Show me Amazon stock quote with P/E ratio and market cap',
          'What is NVIDIA current stock price and analyst rating'
        ]
      },
      {
        category: 'Historical Charts',
        icon: <LineChartOutlined />,
        color: '#1890ff',
        queries: [
          'Show me Apple stock historical chart for the past 6 months',
          'Display Microsoft price history with volume analysis',
          'Get Tesla historical data chart with moving averages',
          'Show Google stock chart with technical indicators',
          'Display Amazon historical price chart for 1 year',
          'Show me NVIDIA stock chart with support and resistance levels'
        ]
      },
      {
        category: 'Trending Stocks',
        icon: <RiseOutlined />,
        color: '#722ed1',
        queries: [
          'Show me top 5 trending stocks by volume and price movement',
          'Display top 10 most active stocks in today\'s market',
          'Get trending stocks with highest percentage gains',
          'Show me top performing stocks in technology sector',
          'Get top 5 high dividend yield stocks for income investors',
          'Show me trending growth stocks with strong fundamentals'
        ]
      },
      {
        category: 'Symbol Search',
        icon: <SearchOutlined />,
        color: '#fa8c16',
        queries: [
          'Search for Ford Motor Company stock symbol and ticker',
          'Find Tesla Inc. stock symbol and company information',
          'Search Apple Inc. ticker symbol and exchange details',
          'Find Microsoft Corporation stock code and market data',
          'Search for Amazon stock symbol and business information',
          'Find NVIDIA Corporation ticker and company profile'
        ]
      },
      {
        category: 'Technical Analysis',
        icon: <BarChartOutlined />,
        color: '#eb2f96',
        queries: [
          'Show me Apple technical analysis with buy/sell signals',
          'Get Microsoft chart insights with support and resistance',
          'Display Tesla technical analysis with momentum indicators',
          'Show Google stock insights with trend analysis',
          'Get Amazon technical summary with volume analysis',
          'Show me NVIDIA chart analysis with volatility metrics'
        ]
      },
      {
        category: 'Market Research',
        icon: <FundOutlined />,
        color: '#2f54eb',
        queries: [
          'Show me market summary with major indices performance',
          'Get financial news headlines for technology sector',
          'Display analyst recommendations for top tech stocks',
          'Show me earnings calendar for upcoming quarterly reports',
          'Get market volatility index and fear gauge data',
          'Display sector performance comparison and rotation trends'
        ]
      }
    ];
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="default" />
        <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 15 }}>
          Loading available tools...
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '400px' }}>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16, fontSize: 15 }}>
        Click any suggestion to try different widget types
      </Text>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px',
        width: '100%',
        minHeight: '350px'
      }}>
        {suggestions.map((category, index) => (
          <Card 
            key={index}
            size="default" 
            style={{ 
              border: `1px solid ${category.color}20`,
              borderRadius: 8,
              minHeight: '120px'
            }}
            bodyStyle={{ padding: '12px', minHeight: '100px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: category.color, marginRight: 8, fontSize: 18 }}>
                {category.icon}
              </span>
              <Text strong style={{ fontSize: 16, color: category.color }}>
                {category.category}
              </Text>
            </div>
            
            <Space wrap size={[8, 6]}>
              {category.queries.map((query, queryIndex) => (
                <Tag
                  key={queryIndex}
                  style={{ 
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: '8px 16px',
                    borderRadius: 16,
                    border: `1px solid ${category.color}40`,
                    backgroundColor: `${category.color}10`,
                    color: category.color,
                    marginBottom: 4,
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                    lineHeight: '1.3',
                    height: 'auto',
                    minHeight: '36px',
                    display: 'inline-block',
                    fontWeight: '500'
                  }}
                  onClick={() => onSuggestionClick(query)}
                >
                  {query}
                </Tag>
              ))}
            </Space>
          </Card>
        ))}
        
        {/* LLM-powered suggestions */}
        {llmSuggestions.length > 0 && (
          <Card 
            size="default" 
            style={{ 
              border: '1px solid #1890ff20',
              borderRadius: 8,
              minHeight: '120px',
              gridColumn: '1 / -1' // Span full width
            }}
            bodyStyle={{ padding: '12px', minHeight: '100px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ 
                color: '#1890ff', 
                marginRight: 8, 
                fontSize: 16,
                fontWeight: 500
              }}>
                🤖 AI Suggestions
              </span>
              {llmLoading && <Spin size="default" />}
            </div>
            <Space wrap size={[8, 6]}>
              {llmSuggestions.map((suggestion, index) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: '8px 16px',
                    marginBottom: 4,
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                    lineHeight: '1.3',
                    height: 'auto',
                    minHeight: '36px',
                    display: 'inline-block',
                    borderRadius: 16,
                    fontWeight: '500'
                  }}
                  onClick={() => onSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Tag>
              ))}
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuerySuggestions;
