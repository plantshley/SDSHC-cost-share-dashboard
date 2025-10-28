import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/dataProcessor';

const TimelineChart = ({ data }) => {
  const chartData = Object.keys(data)
    .sort()
    .map(year => ({
      year: year,
      contracts: data[year].contracts,
      funding: data[year].funding,
      acres: Math.round(data[year].acres),
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>Year {data.year}</strong></p>
          <p style={{ color: '#42A5F5' }}>Contracts: {data.contracts}</p>
          <p style={{ color: '#EC407A' }}>Acres: {data.acres.toLocaleString()}</p>
          <p style={{ color: '#AB47BC' }}>Funding: {formatCurrency(data.funding)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
            style={{ fontSize: '11px' }}
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Number of Contracts', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            style={{ fontSize: '11px' }}
            width={70}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Acres', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
            style={{ fontSize: '11px' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="contracts"
            stroke="#90CAF9"
            strokeWidth={2}
            name="Contracts"
            dot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="acres"
            stroke="#F48FB1"
            strokeWidth={2}
            name="Acres"
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;
