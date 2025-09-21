import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Tag, 
  Button, 
  Dropdown, 
  Menu, 
  Table, 
  List, 
  Timeline, 
  Alert, 
  Tabs, 
  Space, 
  Tooltip, 
  Badge,
  Switch,
  Slider,
  Select
} from 'antd';
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
  ThunderboltOutlined,
  SettingOutlined,
  BulbOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Smart Dashboard Widget - Demonstrates intelligent widget selection and rendering
 */
export const SmartDashboardWidget = ({ 
  type, 
  data, 
  title, 
  onRemove, 
  smartWidgetInfo,
  userPreferences = {},
  onPreferenceChange 
}) => {
  const [widgetSize, setWidgetSize] = useState('medium');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [adaptiveMode, setAdaptiveMode] = useState(true);

  // Smart widget information from the enhanced bridge
  const smartInfo = smartWidgetInfo || {
    id: 'general',
    name: 'General Widget',
    confidence: 0.5,
    reasoning: 'Standard widget selection',
    suggestedLayout: { size: 'medium', orientation: 'vertical' }
  };

  const getSizeClass = () => {
    const suggestedSize = smartInfo.suggestedLayout?.size || widgetSize;
    return `widget-${suggestedSize}`;
  };

  const renderSmartHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          {smartInfo.confidence > 0.8 && (
            <Badge status="success" text="High Confidence" />
          )}
          {smartInfo.confidence > 0.6 && smartInfo.confidence <= 0.8 && (
            <Badge status="processing" text="Good Match" />
          )}
          {smartInfo.confidence <= 0.6 && (
            <Badge status="warning" text="Learning" />
          )}
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          <RobotOutlined /> Smart Widget: {smartInfo.name}
        </div>
      </div>
      
      <Space>
        <Tooltip title="Show AI Analysis">
          <Button 
            type="text" 
            size="small" 
            icon={<BulbOutlined />}
            onClick={() => setShowAnalysis(!showAnalysis)}
          />
        </Tooltip>
        <Tooltip title="Adaptive Mode">
          <Switch 
            size="small" 
            checked={adaptiveMode}
            onChange={setAdaptiveMode}
          />
        </Tooltip>
        <Dropdown overlay={getSizeMenu()} trigger={['click']}>
          <Button type="text" size="small" icon={<SettingOutlined />}>
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
      </Space>
    </div>
  );

  const renderAIAnalysis = () => (
    <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <RobotOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        <Text strong>AI Analysis</Text>
      </div>
      <Paragraph style={{ margin: 0, fontSize: 12 }}>
        <Text strong>Reasoning:</Text> {smartInfo.reasoning}
      </Paragraph>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic 
            title="Confidence" 
            value={Math.round(smartInfo.confidence * 100)} 
            suffix="%" 
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="Widget Type" 
            value={smartInfo.name} 
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
        <Col span={8}>
          <Statistic 
            title="Layout" 
            value={smartInfo.suggestedLayout?.size || 'medium'} 
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
      </Row>
    </Card>
  );

  const renderAdaptiveWidget = () => {
    if (!adaptiveMode) {
      return renderStandardWidget();
    }

    // Smart widget rendering based on type and data
    switch (smartInfo.id) {
      case 'quote_card':
        return renderSmartQuoteCard();
      case 'insights_dashboard':
        return renderSmartInsightsDashboard();
      case 'trending_grid':
        return renderSmartTrendingGrid();
      case 'news_timeline':
        return renderSmartNewsTimeline();
      case 'market_overview':
        return renderSmartMarketOverview();
      default:
        return renderStandardWidget();
    }
  };

  const renderSmartQuoteCard = () => {
    const quote = data.regularMarketPrice ? data : (data.data || data);
    const isPositive = quote.regularMarketChange >= 0;
    
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{quote.symbol}</Text>
          {quote.longName && (
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              {quote.longName}
            </div>
          )}
        </div>
        
        <Statistic
          title="Current Price"
          value={quote.regularMarketPrice}
          prefix="$"
          precision={2}
          valueStyle={{ 
            color: isPositive ? '#3f8600' : '#cf1322',
            fontSize: '32px',
            fontWeight: 'bold'
          }}
        />
        
        <div style={{ marginTop: 16 }}>
          <Space size="large">
            <Statistic
              title="Change"
              value={quote.regularMarketChange}
              prefix={isPositive ? '+' : ''}
              precision={2}
              valueStyle={{ color: isPositive ? '#3f8600' : '#cf1322' }}
            />
            <Statistic
              title="Change %"
              value={quote.regularMarketChangePercent * 100}
              prefix={isPositive ? '+' : ''}
              suffix="%"
              precision={2}
              valueStyle={{ color: isPositive ? '#3f8600' : '#cf1322' }}
            />
          </Space>
        </div>

        {smartInfo.dataOptimization?.isPositive !== undefined && (
          <div style={{ marginTop: 16 }}>
            <Tag color={isPositive ? 'green' : 'red'}>
              {isPositive ? 'Positive Trend' : 'Negative Trend'}
            </Tag>
          </div>
        )}
      </div>
    );
  };

  const renderSmartInsightsDashboard = () => {
    const insights = data.data || data;
    
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Alert
              message="Technical Analysis Dashboard"
              description="AI-powered insights and recommendations"
              type="info"
              showIcon
              icon={<RobotOutlined />}
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
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {insights.instrumentInfo.technicalEvents.shortTermOutlook?.scoreDescription || ''}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Medium Term" style={{ textAlign: 'center' }}>
                <Badge 
                  status={insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction === 'Bullish' ? 'success' : 'error'}
                  text={insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.direction || 'N/A'}
                />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {insights.instrumentInfo.technicalEvents.intermediateTermOutlook?.scoreDescription || ''}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Long Term" style={{ textAlign: 'center' }}>
                <Badge 
                  status={insights.instrumentInfo.technicalEvents.longTermOutlook?.direction === 'Bullish' ? 'success' : 'error'}
                  text={insights.instrumentInfo.technicalEvents.longTermOutlook?.direction || 'N/A'}
                />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {insights.instrumentInfo.technicalEvents.longTermOutlook?.scoreDescription || ''}
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {smartInfo.dataOptimization?.overallSentiment && (
          <Row gutter={16}>
            <Col span={24}>
              <Card size="small" title="AI Sentiment Analysis">
                <div style={{ textAlign: 'center' }}>
                  <Tag 
                    color={smartInfo.dataOptimization.overallSentiment === 'Bullish' ? 'green' : 
                           smartInfo.dataOptimization.overallSentiment === 'Bearish' ? 'red' : 'blue'}
                    style={{ fontSize: 16, padding: '8px 16px' }}
                  >
                    {smartInfo.dataOptimization.overallSentiment} Overall Sentiment
                  </Tag>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    );
  };

  const renderSmartTrendingGrid = () => {
    let actualData = data;
    if (Array.isArray(data)) {
      actualData = data;
    } else if (data.data && Array.isArray(data.data)) {
      actualData = data.data;
    } else {
      actualData = [];
    }

    if (!Array.isArray(actualData) || actualData.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">No trending data available</Text>
        </div>
      );
    }

    // Sort by performance if optimization is available
    const sortedData = smartInfo.dataOptimization?.topPerformers || actualData;

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Statistic
              title="Trending Stocks"
              value={actualData.length}
              suffix="stocks"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          {sortedData.slice(0, 6).map((stock, index) => (
            <Col span={8} key={stock.symbol || index}>
              <Card size="small" hoverable>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: 16 }}>{stock.symbol}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Statistic
                      title="Price"
                      value={stock.regularMarketPrice || stock.price}
                      prefix="$"
                      precision={2}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag 
                      color={stock.regularMarketChangePercent >= 0 ? 'green' : 'red'}
                    >
                      {stock.regularMarketChangePercent >= 0 ? '+' : ''}
                      {(stock.regularMarketChangePercent * 100)?.toFixed(2)}%
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderStandardWidget = () => {
    // Fallback to standard widget rendering
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <InfoCircleOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
        <Text type="secondary">Standard widget rendering</Text>
      </div>
    );
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

  return (
    <Card 
      className={`smart-dashboard-widget ${getSizeClass()}`}
      style={{ 
        marginBottom: 16,
        border: smartInfo.confidence > 0.8 ? '2px solid #52c41a' : 
                smartInfo.confidence > 0.6 ? '2px solid #1890ff' : 
                '1px solid #d9d9d9'
      }}
    >
      {renderSmartHeader()}
      
      {showAnalysis && renderAIAnalysis()}
      
      {renderAdaptiveWidget()}
    </Card>
  );
};

export default SmartDashboardWidget;



