import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/dataProcessor';

const COLORS = ['#90CAF9', '#9FA8DA', '#BA68C8', '#CE93D8', '#F48FB1', '#FF80AB', '#81D4FA'];

const BMPChart = ({ data }) => {
  const chartData = data.map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name,
    fullName: d.name,
    contracts: d.count,
    funding: d.totalFunding,
    acres: Math.round(d.totalAcres),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.fullName}</strong></p>
          <p>Contracts: {data.contracts}</p>
          <p>Funding: {formatCurrency(data.funding)}</p>
          <p>Acres: {data.acres.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 70, bottom: 40 }}>
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
            label={{ value: 'Number of Contracts', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            style={{ fontSize: '11px' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ display: 'none' }} />
          <Bar dataKey="contracts" fill="#42A5F5" name="Number of Contracts">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BMPChart;
