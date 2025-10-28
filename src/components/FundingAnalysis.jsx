import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../utils/dataProcessor';

const COLORS = ['#90CAF9', '#9FA8DA', '#BA68C8', '#CE93D8', '#F48FB1', '#FF80AB', '#81D4FA', '#B39DDB'];

const FundingAnalysis = ({ selectedSegment = 'all' }) => {
  const [allFundingData, setAllFundingData] = useState([]);
  const [fundingData, setFundingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse('./funding.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const processed = results.data
          .filter(row => row.BMP && row['Fund Name'] && row.Segment)
          .map(row => ({
            bmp: row.BMP,
            bmpType: row['BMP Type'],
            fundName: row['Fund Name'],
            allocated: parseCurrency(row['Amount Allocated']),
            used: parseCurrency(row['Amount Used']),
            available: parseCurrency(row['Amount Available']),
            segment: row.Segment,
          }));
        setAllFundingData(processed);
        setFundingData(processed);
        setLoading(false);
      },
    });
  }, []);

  // Filter funding data by segment
  useEffect(() => {
    if (allFundingData.length > 0) {
      let filtered = allFundingData;
      if (selectedSegment !== 'all') {
        filtered = allFundingData.filter(row => row.segment === selectedSegment);
      }
      setFundingData(filtered);
    }
  }, [selectedSegment, allFundingData]);

  const parseCurrency = (value) => {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[$,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  if (loading) {
    return <div>Loading funding data...</div>;
  }

  // Calculate totals by segment
  const segmentTotals = fundingData.reduce((acc, row) => {
    const seg = row.segment;
    if (!acc[seg]) {
      acc[seg] = { allocated: 0, used: 0, available: 0 };
    }
    acc[seg].allocated += row.allocated;
    acc[seg].used += row.used;
    acc[seg].available += row.available;
    return acc;
  }, {});

  const segmentChart = Object.keys(segmentTotals).map(seg => ({
    name: `Segment ${seg}`,
    Allocated: segmentTotals[seg].allocated,
    Used: segmentTotals[seg].used,
    Available: segmentTotals[seg].available,
    utilization: segmentTotals[seg].allocated > 0
      ? (segmentTotals[seg].used / segmentTotals[seg].allocated) * 100
      : 0,
  }));

  // Calculate totals by funding source
  const fundSourceTotals = fundingData.reduce((acc, row) => {
    const source = row.fundName;
    if (!acc[source]) {
      acc[source] = { allocated: 0, used: 0 };
    }
    acc[source].allocated += row.allocated;
    acc[source].used += row.used;
    return acc;
  }, {});

  const fundSourceChart = Object.keys(fundSourceTotals)
    .map(source => ({
      name: source,
      allocated: fundSourceTotals[source].allocated,
      used: fundSourceTotals[source].used,
      utilization: fundSourceTotals[source].allocated > 0
        ? (fundSourceTotals[source].used / fundSourceTotals[source].allocated) * 100
        : 0,
    }))
    .sort((a, b) => b.allocated - a.allocated);

  // Calculate budget utilization by BMP type
  const bmpUtilization = fundingData.reduce((acc, row) => {
    const type = row.bmpType || 'Other';
    if (!acc[type]) {
      acc[type] = { allocated: 0, used: 0 };
    }
    acc[type].allocated += row.allocated;
    acc[type].used += row.used;
    return acc;
  }, {});

  const bmpChart = Object.keys(bmpUtilization)
    .map(type => ({
      name: type,
      allocated: bmpUtilization[type].allocated,
      used: bmpUtilization[type].used,
      utilization: bmpUtilization[type].allocated > 0
        ? (bmpUtilization[type].used / bmpUtilization[type].allocated) * 100
        : 0,
    }))
    .sort((a, b) => b.allocated - a.allocated);

  const getColorDarker = (color) => {
    const colorMap = {
      '#90CAF9': '#42A5F5',
      '#BA68C8': '#AB47BC',
      '#F48FB1': '#EC407A',
    };
    return colorMap[color] || color;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.name}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: getColorDarker(entry.color), fontWeight: 500 }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const UtilizationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.name}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: getColorDarker(entry.color), fontWeight: 500 }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p style={{ color: '#7B1FA2', fontWeight: 500 }}>Utilization: {data.utilization.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="funding-summary">
        <h3>Budget Overview by Segment</h3>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={segmentChart} margin={{ top: 5, right: 30, left: 80, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Funding Amount ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={70}
            />
            <Tooltip content={<UtilizationTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }} />
            <Bar dataKey="Allocated" fill="#90CAF9" name="Allocated" />
            <Bar dataKey="Available" fill="#F48FB1" name="Available" />
            <Bar dataKey="Used" fill="#BA68C8" name="Used" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="funding-by-source">
        <h3>Funding by Source</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={fundSourceChart} margin={{ top: 5, right: 30, left: 70, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: '11px' }}
              tick={{ dy: 5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Funding Amount ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={70}
            />
            <Tooltip content={<UtilizationTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }} />
            <Bar dataKey="allocated" fill="#90CAF9" name="Allocated" />
            <Bar dataKey="used" fill="#BA68C8" name="Used" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bmp-utilization">
        <h3>Budget Utilization by Practice Type</h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={bmpChart} margin={{ top: 5, right: 30, left: 70, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              height={100}
              interval={0}
              style={{ fontSize: '11px' }}
              tick={{ dy: 5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Funding Amount ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={70}
            />
            <Tooltip content={<UtilizationTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }} />
            <Bar dataKey="allocated" fill="#90CAF9" name="Allocated" />
            <Bar dataKey="used" fill="#BA68C8" name="Used" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FundingAnalysis;
