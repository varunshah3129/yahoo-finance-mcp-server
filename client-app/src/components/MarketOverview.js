import React from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Table } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Import required Highcharts modules
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';

// Initialize the modules
HighchartsExporting(Highcharts);
HighchartsExportData(Highcharts);

export const MarketOverview = ({ data }) => {
  // Handle both old and new data structures
  const actualData = data.data || data;
  const indices = actualData?.indices || actualData;

  if (!indices || !Array.isArray(indices)) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No market data available</p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Data type: {typeof data}, Indices type: {typeof indices}, Array: {Array.isArray(indices) ? 'Yes' : 'No'}
        </p>
      </div>
    );
  }

  // Calculate market sentiment
  const positiveIndices = indices.filter(index => index.changePercent > 0).length;
  const totalIndices = indices.length;
  const marketSentiment = positiveIndices > totalIndices / 2 ? 'positive' : 'negative';

  // Prepare data for charts
  const chartData = indices.map(index => ({
    name: index.name || index.symbol,
    y: index.changePercent || 0,
    value: index.value || 0
  }));

  const pieOptions = {
    chart: {
      type: 'pie',
      height: 300
    },
    title: {
      text: 'Market Performance Distribution'
    },
    series: [{
      name: 'Change %',
      data: chartData,
      dataLabels: {
        enabled: true,
        format: '{point.name}: {point.y:.1f}%'
      }
    }],
    tooltip: {
      formatter: function() {
        return `
          <b>${this.point.name}</b><br/>
          Change: ${this.point.y.toFixed(2)}%<br/>
          Value: $${this.point.value.toFixed(2)}
        `;
      }
    },
    credits: {
      enabled: false
    }
  };

  const barOptions = {
    chart: {
      type: 'column',
      height: 300
    },
    title: {
      text: 'Index Performance Comparison'
    },
    xAxis: {
      categories: indices.map(index => index.name || index.symbol)
    },
    yAxis: {
      title: {
        text: 'Change %'
      }
    },
    series: [{
      name: 'Change %',
      data: indices.map(index => index.changePercent || 0),
      color: '#1890ff'
    }],
    tooltip: {
      formatter: function() {
        const index = indices[this.point.index];
        return `
          <b>${index.name || index.symbol}</b><br/>
          Value: $${index.value.toFixed(2)}<br/>
          Change: ${index.change.toFixed(2)}<br/>
          Change %: ${this.point.y.toFixed(2)}%
        `;
      }
    },
    credits: {
      enabled: false
    }
  };

  const columns = [
    {
      title: 'Index',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color="blue">{text || record.symbol}</Tag>
      )
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.value - b.value
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.change - b.change
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value) => (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => a.changePercent - b.changePercent
    }
  ];

  return (
    <div>
      {/* Market Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Market Sentiment"
              value={marketSentiment}
              valueStyle={{ 
                color: marketSentiment === 'positive' ? '#3f8600' : '#cf1322',
                textTransform: 'capitalize'
              }}
              prefix={marketSentiment === 'positive' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Positive Indices"
              value={positiveIndices}
              suffix={`/ ${totalIndices}`}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Market Strength"
              value={Math.round((positiveIndices / totalIndices) * 100)}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Individual Index Performance */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {indices.map((index, idx) => (
          <Col span={8} key={idx} style={{ marginBottom: 16 }}>
            <Card size="small">
              <Statistic
                title={index.name || index.symbol}
                value={index.value}
                prefix="$"
                precision={2}
                valueStyle={{ 
                  color: index.changePercent >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: 18
                }}
              />
              <div style={{ marginTop: 8 }}>
                <span style={{ 
                  color: index.changePercent >= 0 ? '#3f8600' : '#cf1322',
                  fontSize: 14
                }}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </span>
              </div>
              <Progress
                percent={Math.abs(index.changePercent)}
                strokeColor={index.changePercent >= 0 ? '#52c41a' : '#ff4d4f'}
                showInfo={false}
                size="small"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Performance Distribution">
            <HighchartsReact
              highcharts={Highcharts}
              options={pieOptions}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Index Comparison">
            <HighchartsReact
              highcharts={Highcharts}
              options={barOptions}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Card title="Detailed Index Data">
        <Table
          columns={columns}
          dataSource={indices}
          rowKey="symbol"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};
