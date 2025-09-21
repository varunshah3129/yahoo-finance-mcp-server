import React from 'react';
import { Table, Tag, Statistic } from 'antd';
import { TrendingUpOutlined, TrendingDownOutlined } from '@ant-design/icons';

export const StockTable = ({ data }) => {
  // Ensure data is an array
  const tableData = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
  
  // If no valid data, show message
  if (!Array.isArray(tableData) || tableData.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>No data available to display in table format.</p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Data type: {typeof data}, Array: {Array.isArray(data) ? 'Yes' : 'No'}
        </p>
      </div>
    );
  }

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value) => value != null ? `$${value.toFixed(2)}` : 'N/A',
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value) => value != null ? (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      ) : 'N/A',
      sorter: (a, b) => (a.change || 0) - (b.change || 0),
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value) => value != null ? (
        <span style={{ color: value >= 0 ? '#3f8600' : '#cf1322' }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </span>
      ) : 'N/A',
      sorter: (a, b) => (a.changePercent || 0) - (b.changePercent || 0),
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (value) => value ? value.toLocaleString() : 'N/A',
      sorter: (a, b) => (a.volume || 0) - (b.volume || 0),
    },
    {
      title: 'Market Cap',
      dataIndex: 'marketCap',
      key: 'marketCap',
      render: (value) => value ? `$${(value / 1e9).toFixed(1)}B` : 'N/A',
      sorter: (a, b) => (a.marketCap || 0) - (b.marketCap || 0),
    },
    {
      title: 'P/E Ratio',
      dataIndex: 'pe',
      key: 'pe',
      render: (value) => value ? value.toFixed(1) : 'N/A',
      sorter: (a, b) => (a.pe || 0) - (b.pe || 0),
    },
    {
      title: 'Dividend Yield',
      dataIndex: 'dividendYield',
      key: 'dividendYield',
      render: (value) => value ? `${value.toFixed(2)}%` : 'N/A',
      sorter: (a, b) => (a.dividendYield || 0) - (b.dividendYield || 0),
    },
  ];

  const expandedRowRender = (record) => (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {record.volume && (
          <Statistic
            title="Volume"
            value={record.volume}
            formatter={(value) => value ? value.toLocaleString() : 'N/A'}
          />
        )}
        {record.marketCap && (
          <Statistic
            title="Market Cap"
            value={record.marketCap}
            formatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
          />
        )}
        {record.pe && (
          <Statistic
            title="P/E Ratio"
            value={record.pe}
            precision={1}
          />
        )}
        {record.dividendYield && (
          <Statistic
            title="Dividend Yield"
            value={record.dividendYield}
            suffix="%"
            precision={2}
          />
        )}
      </div>
    </div>
  );

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey="symbol"
      pagination={false}
      size="small"
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.volume || record.marketCap || record.pe || record.dividendYield,
      }}
      summary={(pageData) => {
        const totalChange = pageData.reduce((sum, item) => sum + (item.change || 0), 0);
        const avgChangePercent = pageData.reduce((sum, item) => sum + (item.changePercent || 0), 0) / pageData.length;
        
        return (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <strong>Total</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <strong>Avg: ${pageData.length > 0 ? (pageData.reduce((sum, item) => sum + (item.price || 0), 0) / pageData.length).toFixed(2) : 'N/A'}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2}>
              <strong style={{ color: totalChange >= 0 ? '#3f8600' : '#cf1322' }}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}
              </strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <strong style={{ color: avgChangePercent >= 0 ? '#3f8600' : '#cf1322' }}>
                {avgChangePercent >= 0 ? '+' : ''}{avgChangePercent.toFixed(2)}%
              </strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4}>
              <strong>{pageData.reduce((sum, item) => sum + (item.volume || 0), 0).toLocaleString()}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5}>
              <strong>${pageData.length > 0 ? (pageData.reduce((sum, item) => sum + (item.marketCap || 0), 0) / 1e9).toFixed(1) : '0.0'}B</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={6}>
              <strong>{pageData.length > 0 ? (pageData.reduce((sum, item) => sum + (item.pe || 0), 0) / pageData.length).toFixed(1) : 'N/A'}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={7}>
              <strong>{pageData.length > 0 ? (pageData.reduce((sum, item) => sum + (item.dividendYield || 0), 0) / pageData.length).toFixed(2) : 'N/A'}%</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        );
      }}
    />
  );
};
