import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, Card, Typography, Space, Divider, message, Drawer, Badge, Modal } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, DashboardOutlined, MessageOutlined, CloseOutlined, BulbOutlined } from '@ant-design/icons';
import { RealMCPClient } from './services/RealMCPClient';
import { DashboardWidget } from './components/DashboardWidget';
import { StockTable } from './components/StockTable';
import { StockChart } from './components/StockChart';
import { MarketOverview } from './components/MarketOverview';
import { PortfolioAnalysis } from './components/PortfolioAnalysis';
import QuerySuggestions from './components/QuerySuggestions';
import './App.css';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;
const { Title, Text } = Typography;

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [suggestionPopupOpen, setSuggestionPopupOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const mcpClient = useRef(new RealMCPClient());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setSuggestionPopupOpen(false);
    setChatOpen(true); // Automatically open chat when suggestion is selected
  };

  const handleInputClick = () => {
    setSuggestionPopupOpen(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setLoadingMessage('Connecting to MCP server...');
    setLoadingStartTime(Date.now());

    try {
      // Simulate different loading stages
      setTimeout(() => setLoadingMessage('Fetching financial data...'), 500);
      setTimeout(() => setLoadingMessage('Processing request...'), 1000);
      setTimeout(() => setLoadingMessage('Rendering widget...'), 1500);

      const response = await mcpClient.current.sendMessage(inputValue);
      
      const loadingTime = Date.now() - loadingStartTime;
      const loadingTimeSeconds = (loadingTime / 1000).toFixed(1);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.content || response.message || 'No response received',
        timestamp: new Date(),
        data: response.data,
        widgetType: response.widgetType,
        loadingTime: loadingTimeSeconds
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update dashboard data if response contains structured data
      if (response.data) {
        // Check if data is empty or contains only error messages
        const isEmpty = !response.data || 
                       (typeof response.data === 'object' && 
                        Object.keys(response.data).length === 0) ||
                       (response.data.message && response.data.message.includes('Error:')) ||
                       (Array.isArray(response.data) && response.data.length === 0);
        
        if (isEmpty) {
          // Show message in chat instead of creating empty widget
          const emptyDataMessage = {
            id: Date.now() + 2,
            type: 'assistant',
            content: `No data available for this query. The API returned empty results.`,
            timestamp: new Date(),
            isEmpty: true
          };
          setMessages(prev => [...prev, emptyDataMessage]);
        } else {
          const widgetKey = `${response.widgetType || 'general'}_${Date.now()}`;
          setDashboardData(prev => ({
            ...prev,
            [widgetKey]: {
              data: response.data, // Keep array data as-is
              widgetType: response.widgetType || 'general',
              timestamp: new Date(),
              title: response.widgetType ? response.widgetType.replace('_', ' ').toUpperCase() : 'GENERAL'
            }
          }));
        }
      }

      message.success(`Response received in ${loadingTimeSeconds}s!`);
    } catch (error) {
      console.error('Error sending message:', error);
      const loadingTime = Date.now() - loadingStartTime;
      const loadingTimeSeconds = (loadingTime / 1000).toFixed(1);
      
      message.error(`Failed after ${loadingTimeSeconds}s`);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        isError: true,
        loadingTime: loadingTimeSeconds
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setLoadingMessage('');
      setLoadingStartTime(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (msg) => {
    return (
      <div key={msg.id} className={`message ${msg.type}`} style={{ marginBottom: 16 }}>
        <div className="message-content">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
            <Text style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
              {msg.timestamp.toLocaleTimeString()}
              {msg.loadingTime && (
                <span style={{ marginLeft: 8, color: '#52c41a' }}>
                  ({msg.loadingTime}s)
                </span>
              )}
            </Text>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.4 }}>{msg.content}</div>
          {msg.data && (
            <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4, fontSize: 11 }}>
              <Text type="secondary">Widget created: {msg.widgetType}</Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const widgets = Object.entries(dashboardData);
    if (widgets.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Divider orientation="left">
          <DashboardOutlined /> Dashboard ({widgets.length} widgets)
        </Divider>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
          {widgets.map(([key, widgetData]) => (
            <DashboardWidget
              key={key}
              type={widgetData.widgetType || 'general'}
              data={widgetData}
              title={widgetData.title || key.replace('_', ' ').toUpperCase()}
              query={widgetData.query || ''}
              toolUsed={widgetData.toolUsed || ''}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout className="app-container">
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ fontSize: 24, marginRight: 12 }} />
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              Yahoo Finance Dashboard
            </Title>
          </div>
          {Object.keys(dashboardData).length > 0 && (
            <Button 
              type="text" 
              style={{ color: 'white' }}
              onClick={() => setDashboardData({})}
            >
              Clear All Widgets
            </Button>
          )}
        </div>
      </Header>
      
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        {/* Welcome Card - Always Centered */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <Card style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
            <Title level={4}>Welcome to Yahoo Finance Dashboard!</Title>
            <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
              Ask about stocks, market data, or financial analysis. Get instant insights with AI-powered suggestions.
              <br />
              Try: "What's the current price of Apple stock?" or "Show me top 5 trending stocks"
            </Text>
            <Button 
              type="primary" 
              size="large"
              icon={<BulbOutlined />}
              onClick={() => setSuggestionPopupOpen(true)}
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                padding: '0 32px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
              }}
            >
              Get Smart Query Suggestions
            </Button>
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                💡 Click above for AI-powered financial queries
              </Text>
            </div>
          </Card>
        </div>

        {/* Widget Container - Below Welcome Card */}
        {Object.keys(dashboardData).length > 0 && (
          <div className="widget-container">
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Text type="secondary">
                Showing {Object.keys(dashboardData).length} widget{Object.keys(dashboardData).length !== 1 ? 's' : ''} • 
                Each query creates a new widget
              </Text>
            </div>
            <div>
              {Object.entries(dashboardData).map(([key, widgetData]) => (
                <DashboardWidget
                  key={key}
                  type={widgetData.widgetType || 'general'}
                  data={widgetData.data}
                  title={widgetData.title || key.replace('_', ' ').toUpperCase()}
                  query={widgetData.query || ''}
                  toolUsed={widgetData.toolUsed || ''}
                  onRemove={() => {
                    const newData = { ...dashboardData };
                    delete newData[key];
                    setDashboardData(newData);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </Content>

      {/* Floating Chat Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {messages.length > 0 && (
          <Badge count={messages.length} size="small" />
        )}
      </Button>

      {/* Chat Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            Finance Chatbot
            {messages.length > 0 && (
              <Badge count={messages.length} style={{ marginLeft: 8 }} />
            )}
          </div>
        }
        placement="right"
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        width={400}
        styles={{
          body: { padding: 0 },
          header: { padding: '16px 24px' }
        }}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setChatOpen(false)}
          />
        }
      >
        <div className="chat-drawer">
          
          {/* Chat Messages */}
          <div className="chat-messages" style={{ height: 'calc(100vh - 140px)', overflowY: 'auto', padding: '16px' }}>
            {messages.map(renderMessage)}
            {loading && (
              <div className="loading-spinner" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ marginBottom: 8 }}>
                  <Button loading size="small">{loadingMessage}</Button>
                </div>
                {loadingStartTime && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Loading time: {((Date.now() - loadingStartTime) / 1000).toFixed(1)}s
                  </Text>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="chat-input" style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onClick={handleInputClick}
                placeholder="Ask about stocks... (Click for suggestions)"
                autoSize={{ minRows: 1, maxRows: 3 }}
                disabled={loading}
                style={{ fontSize: 12 }}
              />
              <Button
                type="default"
                icon={<BulbOutlined />}
                onClick={() => setSuggestionPopupOpen(true)}
                disabled={loading}
                size="small"
                title="Show suggestions"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={loading}
                disabled={!inputValue.trim()}
                size="small"
              >
                Send
              </Button>
            </Space.Compact>
          </div>
        </div>
      </Drawer>

      {/* Query Suggestions Popup Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BulbOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>Query Suggestions</span>
          </div>
        }
        open={suggestionPopupOpen}
        onCancel={() => setSuggestionPopupOpen(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ 
          padding: '20px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
        destroyOnClose={true}
      >
        <QuerySuggestions 
          onSuggestionClick={handleSuggestionClick} 
          currentQuery={inputValue}
        />
      </Modal>
    </Layout>
  );
}

export default App;
