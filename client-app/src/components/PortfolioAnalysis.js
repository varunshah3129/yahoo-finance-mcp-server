import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, PieChartOutlined } from '@ant-design/icons';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Import required Highcharts modules
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';

// Initialize the modules
HighchartsExporting(Highcharts);
HighchartsExportData(Highcharts);

export const PortfolioAnalysis = ({ data }) => {
  // Handle both old and new data structures
  const actualData = data.data || data;
  const { symbols, comparison, totalValue, totalChange, totalChangePercent } = actualData || {};

  if (!comparison || !Array.isArray(comparison)) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No portfolio data available</p>
        <p style={{ fontSize: 12, color: '#666' }}>
          Data type: {typeof data}, Comparison type: {typeof comparison}, Array: {Array.isArray(comparison) ? 'Yes' : 'No'}
        </p>
      </div>
    );
  }

  // Calculate portfolio metrics
  const totalPortfolioValue = comparison.reduce((sum, stock) => sum + (stock.price || 0), 0);
  const totalPortfolioChange = comparison.reduce((sum, stock) => sum + (stock.change || 0), 0);
  const avgChangePercent = comparison.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / comparison.length;
  
  // Find best and worst performers
  const bestPerformer = comparison.reduce((best, current) => 
    (current.changePercent || 0) > (best.changePercent || 0) ? current : best
  );
  const worstPerformer = comparison.reduce((worst, current) => 
    (current.changePercent || 0) < (worst.changePercent || 0) ? current : worst
  );

  // Prepare data for charts
  const pieData = comparison.map(stock => ({
    name: stock.symbol,
    y: stock.price || 0,
    change: stock.changePercent || 0
  }));

  const barData = comparison.map(stock => ({
    name: stock.symbol,
    y: stock.changePercent || 0,
    price: stock.price || 0
  }));

  const pieOptions = {
    chart: {
      type: 'pie',
      height: 300
    },
    title: {
      text: 'Portfolio Allocation by Price'
    },
    series: [{
      name: 'Price',
      data: pieData,
      dataLabels: {
        enabled: true,
        format: '{point.name}: ${point.y:.0f}'
      }
    }],
    tooltip: {
      formatter: function() {
        return `
          <b>${this.point.name}</b><br/>
          Price: $${this.point.y.toFixed(2)}<br/>
          Change: ${this.point.change.toFixed(2)}%
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
      text: 'Stock Performance Comparison'
    },
    xAxis: {
      categories: comparison.map(stock => stock.symbol)
    },
    yAxis: {
      title: {
        text: 'Change %'
      }
    },
    series: [{
      name: 'Change %',
      data: barData.map(item => item.y),
      color: '#1890ff'
    }],
    tooltip: {
      formatter: function() {
        const stock = comparison[this.point.index];
        return `
          <b>${stock.symbol}</b><br/>
          Price: $${stock.price.toFixed(2)}<br/>
          Change: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}<br/>
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
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.price - b.price
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
    },
    {
      title: 'Weight',
      key: 'weight',
      render: (_, record) => {
        const weight = ((record.price || 0) / totalPortfolioValue * 100).toFixed(1);
        return `${weight}%`;
      },
      sorter: (a, b) => (a.price / totalPortfolioValue) - (b.price / totalPortfolioValue)
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record) => {
        const change = record.changePercent || 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {change >= 0 ? <ArrowUpOutlined style={{ color: '#3f8600' }} /> : <ArrowDownOutlined style={{ color: '#cf1322' }} />}
            <span style={{ marginLeft: 4, color: change >= 0 ? '#3f8600' : '#cf1322' }}>
              {change >= 0 ? '🟢' : '🔴'}
            </span>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Portfolio Summary */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={totalPortfolioValue}
              prefix="$"
              precision={2}
              valueStyle={{ fontSize: 20, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Change"
              value={totalPortfolioChange}
              prefix={totalPortfolioChange >= 0 ? '+' : ''}
              precision={2}
              valueStyle={{ 
                color: totalPortfolioChange >= 0 ? '#3f8600' : '#cf1322',
                fontSize: 20,
                fontWeight: 'bold'
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Change %"
              value={avgChangePercent}
              prefix={avgChangePercent >= 0 ? '+' : ''}
              suffix="%"
              precision={2}
              valueStyle={{ 
                color: avgChangePercent >= 0 ? '#3f8600' : '#cf1322',
                fontSize: 20,
                fontWeight: 'bold'
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Stocks"
              value={comparison.length}
              valueStyle={{ fontSize: 20, fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Highlights */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Best Performer" size="small">
            <div style={{ textAlign: 'center' }}>
              <Tag color="green" style={{ fontSize: 16, padding: '8px 16px' }}>
                {bestPerformer.symbol}
              </Tag>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#3f8600' }}>
                +{bestPerformer.changePercent.toFixed(2)}%
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                ${bestPerformer.price.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Worst Performer" size="small">
            <div style={{ textAlign: 'center' }}>
              <Tag color="red" style={{ fontSize: 16, padding: '8px 16px' }}>
                {worstPerformer.symbol}
              </Tag>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#cf1322' }}>
                {worstPerformer.changePercent.toFixed(2)}%
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                ${worstPerformer.price.toFixed(2)}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Portfolio Allocation">
            <HighchartsReact
              highcharts={Highcharts}
              options={pieOptions}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Performance Comparison">
            <HighchartsReact
              highcharts={Highcharts}
              options={barOptions}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Card title="Portfolio Details">
        <Table
          columns={columns}
          dataSource={comparison}
          rowKey="symbol"
          pagination={false}
          size="small"
          summary={(pageData) => {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>${totalPortfolioValue.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <strong style={{ color: totalPortfolioChange >= 0 ? '#3f8600' : '#cf1322' }}>
                    {totalPortfolioChange >= 0 ? '+' : ''}{totalPortfolioChange.toFixed(2)}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <strong style={{ color: avgChangePercent >= 0 ? '#3f8600' : '#cf1322' }}>
                    {avgChangePercent >= 0 ? '+' : ''}{avgChangePercent.toFixed(2)}%
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <strong>100%</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <strong>Portfolio</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};
