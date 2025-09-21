import { Card, Typography, Row, Col, Statistic, Progress, Tag, Button, Dropdown, Menu, Table, List, Timeline, Alert, Tabs, Space, Tooltip, Badge } from 'antd';
import { 
  TrendingUpOutlined, 
  TrendingDownOutlined, 
  DollarOutlined, 
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Smart Widget Selector - Intelligently chooses the best widget type and representation
 * based on query intent, data structure, and user context
 */
class SmartWidgetSelector {
  constructor() {
    this.widgetRegistry = new Map();
    this.registerDefaultWidgets();
  }

  /**
   * Register all available widget types with their capabilities
   */
  registerDefaultWidgets() {
    // Quote/Price Widgets
    this.widgetRegistry.set('quote_card', {
      name: 'Quote Card',
      description: 'Single stock quote with key metrics',
      icon: <DollarOutlined />,
      dataTypes: ['single_quote'],
      queryPatterns: ['price', 'quote', 'current', 'latest'],
      render: this.renderQuoteCard.bind(this)
    });

    this.widgetRegistry.set('quote_table', {
      name: 'Quote Table',
      description: 'Multiple stock quotes in table format',
      icon: <Table />,
      dataTypes: ['multiple_quotes'],
      queryPatterns: ['compare', 'multiple', 'list'],
      render: this.renderQuoteTable.bind(this)
    });

    // Chart Widgets
    this.widgetRegistry.set('line_chart', {
      name: 'Line Chart',
      description: 'Historical price data as line chart',
      icon: <LineChartOutlined />,
      dataTypes: ['historical_data', 'time_series'],
      queryPatterns: ['chart', 'history', 'performance', 'trend'],
      render: this.renderLineChart.bind(this)
    });

    this.widgetRegistry.set('candlestick_chart', {
      name: 'Candlestick Chart',
      description: 'OHLC data as candlestick chart',
      icon: <BarChartOutlined />,
      dataTypes: ['ohlc_data'],
      queryPatterns: ['candlestick', 'ohlc', 'detailed chart'],
      render: this.renderCandlestickChart.bind(this)
    });

    // Analysis Widgets
    this.widgetRegistry.set('insights_dashboard', {
      name: 'Insights Dashboard',
      description: 'Technical analysis and recommendations',
      icon: <InfoCircleOutlined />,
      dataTypes: ['insights', 'technical_analysis'],
      queryPatterns: ['insights', 'analysis', 'technical', 'recommendations'],
      render: this.renderInsightsDashboard.bind(this)
    });

    this.widgetRegistry.set('fundamentals_panel', {
      name: 'Fundamentals Panel',
      description: 'Financial ratios and fundamental metrics',
      icon: <PieChartOutlined />,
      dataTypes: ['fundamentals', 'financial_ratios'],
      queryPatterns: ['fundamentals', 'ratios', 'financials', 'metrics'],
      render: this.renderFundamentalsPanel.bind(this)
    });

    // Market Widgets
    this.widgetRegistry.set('market_overview', {
      name: 'Market Overview',
      description: 'Market summary and key indicators',
      icon: <GlobalOutlined />,
      dataTypes: ['market_summary'],
      queryPatterns: ['market', 'overview', 'summary', 'indices'],
      render: this.renderMarketOverview.bind(this)
    });

    this.widgetRegistry.set('trending_grid', {
      name: 'Trending Grid',
      description: 'Trending stocks in grid layout',
      icon: <TrendingUpOutlined />,
      dataTypes: ['trending_stocks'],
      queryPatterns: ['trending', 'popular', 'hot', 'active'],
      render: this.renderTrendingGrid.bind(this)
    });

    // News Widgets
    this.widgetRegistry.set('news_timeline', {
      name: 'News Timeline',
      description: 'Recent news in timeline format',
      icon: <ClockCircleOutlined />,
      dataTypes: ['news'],
      queryPatterns: ['news', 'headlines', 'recent'],
      render: this.renderNewsTimeline.bind(this)
    });

    // Search Widgets
    this.widgetRegistry.set('search_results', {
      name: 'Search Results',
      description: 'Search results with filters',
      icon: <UserOutlined />,
      dataTypes: ['search_results'],
      queryPatterns: ['search', 'find', 'lookup'],
      render: this.renderSearchResults.bind(this)
    });

    // Alert Widgets
    this.widgetRegistry.set('alert_panel', {
      name: 'Alert Panel',
      description: 'Important alerts and warnings',
      icon: <WarningOutlined />,
      dataTypes: ['alerts', 'warnings'],
      queryPatterns: ['alert', 'warning', 'important'],
      render: this.renderAlertPanel.bind(this)
    });
  }

  /**
   * Analyze query and data to select the best widget
   */
  selectOptimalWidget(query, data, toolUsed) {
    const analysis = this.analyzeQueryAndData(query, data, toolUsed);
    return this.findBestMatch(analysis);
  }

  /**
   * Analyze the query intent and data structure
   */
  analyzeQueryAndData(query, data, toolUsed) {
    const analysis = {
      queryIntent: this.extractQueryIntent(query),
      dataStructure: this.analyzeDataStructure(data),
      dataVolume: this.calculateDataVolume(data),
      userContext: this.inferUserContext(query),
      toolContext: this.getToolContext(toolUsed)
    };

    return analysis;
  }

  /**
   * Extract intent from user query
   */
  extractQueryIntent(query) {
    const lowerQuery = query.toLowerCase();
    const intents = [];

    // Price/Quote intents
    if (lowerQuery.includes('price') || lowerQuery.includes('quote') || lowerQuery.includes('current')) {
      intents.push('price_inquiry');
    }

    // Chart/Visual intents
    if (lowerQuery.includes('chart') || lowerQuery.includes('graph') || lowerQuery.includes('visualize')) {
      intents.push('visualization');
    }

    // Analysis intents
    if (lowerQuery.includes('analyze') || lowerQuery.includes('insights') || lowerQuery.includes('technical')) {
      intents.push('analysis');
    }

    // Comparison intents
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      intents.push('comparison');
    }

    // Trend intents
    if (lowerQuery.includes('trend') || lowerQuery.includes('trending') || lowerQuery.includes('popular')) {
      intents.push('trending');
    }

    // News intents
    if (lowerQuery.includes('news') || lowerQuery.includes('headlines') || lowerQuery.includes('recent')) {
      intents.push('news');
    }

    return intents;
  }

  /**
   * Analyze the structure of returned data
   */
  analyzeDataStructure(data) {
    if (!data) return 'empty';

    if (Array.isArray(data)) {
      if (data.length === 0) return 'empty_array';
      if (data.length === 1) return 'single_item';
      if (data.length <= 5) return 'small_array';
      return 'large_array';
    }

    if (typeof data === 'object') {
      // Check for specific data patterns
      if (data.regularMarketPrice) return 'single_quote';
      if (data.companySnapshot) return 'insights';
      if (data.summaryProfile) return 'fundamentals';
      if (data.quotes && Array.isArray(data.quotes)) return 'multiple_quotes';
      if (data.date && data.open && data.close) return 'ohlc_data';
      if (data.message || data.text) return 'text_content';
      
      return 'object';
    }

    return 'unknown';
  }

  /**
   * Calculate data volume for layout decisions
   */
  calculateDataVolume(data) {
    if (!data) return 'none';
    
    if (Array.isArray(data)) {
      if (data.length === 0) return 'none';
      if (data.length <= 3) return 'small';
      if (data.length <= 10) return 'medium';
      return 'large';
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length <= 5) return 'small';
      if (keys.length <= 15) return 'medium';
      return 'large';
    }

    return 'small';
  }

  /**
   * Infer user context from query
   */
  inferUserContext(query) {
    const context = {
      isProfessional: false,
      isCasual: false,
      isComparative: false,
      isDetailed: false
    };

    const lowerQuery = query.toLowerCase();

    // Professional indicators
    if (lowerQuery.includes('analysis') || lowerQuery.includes('fundamentals') || 
        lowerQuery.includes('technical') || lowerQuery.includes('ratios')) {
      context.isProfessional = true;
    }

    // Casual indicators
    if (lowerQuery.includes('show me') || lowerQuery.includes('what is') || 
        lowerQuery.includes('tell me')) {
      context.isCasual = true;
    }

    // Comparative indicators
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || 
        lowerQuery.includes('versus') || lowerQuery.includes('against')) {
      context.isComparative = true;
    }

    // Detailed indicators
    if (lowerQuery.includes('detailed') || lowerQuery.includes('comprehensive') || 
        lowerQuery.includes('full') || lowerQuery.includes('complete')) {
      context.isDetailed = true;
    }

    return context;
  }

  /**
   * Get context from the tool used
   */
  getToolContext(toolUsed) {
    const toolContexts = {
      'get_quote': { type: 'price', complexity: 'simple' },
      'get_historical_data': { type: 'chart', complexity: 'medium' },
      'get_insights': { type: 'analysis', complexity: 'high' },
      'get_trending_stocks': { type: 'list', complexity: 'medium' },
      'search_symbols': { type: 'search', complexity: 'simple' },
      'get_news': { type: 'news', complexity: 'medium' },
      'get_financials': { type: 'fundamentals', complexity: 'high' }
    };

    return toolContexts[toolUsed] || { type: 'general', complexity: 'medium' };
  }

  /**
   * Find the best widget match based on analysis
   */
  findBestMatch(analysis) {
    let bestWidget = null;
    let bestScore = 0;

    for (const [widgetId, widget] of this.widgetRegistry) {
      const score = this.calculateWidgetScore(widget, analysis);
      if (score > bestScore) {
        bestScore = score;
        bestWidget = { id: widgetId, ...widget };
      }
    }

    return bestWidget || { id: 'general', name: 'General Widget', render: this.renderGeneralWidget.bind(this) };
  }

  /**
   * Calculate how well a widget matches the analysis
   */
  calculateWidgetScore(widget, analysis) {
    let score = 0;

    // Data type matching
    if (widget.dataTypes.includes(analysis.dataStructure)) {
      score += 10;
    }

    // Query pattern matching
    for (const intent of analysis.queryIntent) {
      if (widget.queryPatterns.some(pattern => intent.includes(pattern))) {
        score += 5;
      }
    }

    // Data volume matching
    if (analysis.dataVolume === 'small' && widget.name.includes('Card')) score += 3;
    if (analysis.dataVolume === 'large' && widget.name.includes('Table')) score += 3;

    // User context matching
    if (analysis.userContext.isProfessional && widget.name.includes('Dashboard')) score += 2;
    if (analysis.userContext.isCasual && widget.name.includes('Card')) score += 2;

    return score;
  }

  // Widget Render Methods
  renderQuoteCard(data) {
    const quote = data.regularMarketPrice ? data : (data.data || data);
    return (
      <Card size="small" style={{ textAlign: 'center' }}>
        <Statistic
          title={quote.symbol || 'Stock'}
          value={quote.regularMarketPrice}
          prefix="$"
          precision={2}
          valueStyle={{ 
            color: quote.regularMarketChange >= 0 ? '#3f8600' : '#cf1322',
            fontSize: '24px'
          }}
        />
        <div style={{ marginTop: '8px' }}>
          <Text style={{ 
            color: quote.regularMarketChange >= 0 ? '#3f8600' : '#cf1322' 
          }}>
            {quote.regularMarketChange >= 0 ? '+' : ''}{quote.regularMarketChange?.toFixed(2)} 
            ({quote.regularMarketChangePercent >= 0 ? '+' : ''}{(quote.regularMarketChangePercent * 100)?.toFixed(2)}%)
          </Text>
        </div>
      </Card>
    );
  }

  renderInsightsDashboard(data) {
    const insights = data.data || data;
    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message="Technical Analysis Dashboard"
              description="Comprehensive insights and recommendations"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
        
        {insights.instrumentInfo?.technicalEvents && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small" title="Short Term" style={{ textAlign: 'center' }}>
                <Badge 
                  status={insights.instrumentInfo.technicalEvents.shortTermOutlook?.direction === 'Bullish' ? 'success' : 'error'}
                  text={insights.instrumentInfo.technicalEvents.shortTermOutlook?.direction || 'N/A'}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Medium Term" style={{ textAlign: 'center' }}>
                <Badge 
                  status={insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction === 'Bullish' ? 'success' : 'error'}
                  text={insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction || 'N/A'}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Long Term" style={{ textAlign: 'center' }}>
                <Badge 
                  status={insights.instrumentInfo.technicalEvents.longTermOutlook?.direction === 'Bullish' ? 'success' : 'error'}
                  text={insights.instrumentInfo.technicalEvents.longTermOutlook?.direction || 'N/A'}
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>
    );
  }

  renderGeneralWidget(data) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <InfoCircleOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
        <Text type="secondary">Smart widget selection in progress...</Text>
      </div>
    );
  }

  // Additional render methods would be implemented here...
}

export default SmartWidgetSelector;



