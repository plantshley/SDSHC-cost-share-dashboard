import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/dataProcessor';

const FundingChart = ({ data }) => {
  // Group by year and funding source
  const yearlyFunding = data.reduce((acc, row) => {
    if (row.date) {
      const year = row.date.getFullYear();
      if (!acc[year]) {
        acc[year] = { year, amount319: 0, amountCWSRF: 0, amountLocal: 0 };
      }
      acc[year].amount319 += row.amount319;
      acc[year].amountCWSRF += row.amountCWSRF;
      acc[year].amountLocal += row.amountLocal;
    }
    return acc;
  }, {});

  const chartData = Object.values(yearlyFunding).sort((a, b) => a.year - b.year);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.amount319 + data.amountCWSRF + data.amountLocal;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>Year {data.year}</strong></p>
          <p style={{ color: '#42A5F5' }}>319 Funds: {formatCurrency(data.amount319)}</p>
          <p style={{ color: '#AB47BC' }}>CWSRF-WQ: {formatCurrency(data.amountCWSRF)}</p>
          <p style={{ color: '#EC407A' }}>Local: {formatCurrency(data.amountLocal)}</p>
          <p><strong>Total: {formatCurrency(total)}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={450}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 80, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
            style={{ fontSize: '11px' }}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Funding Amount ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            style={{ fontSize: '11px' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }} />
          <Area
            type="monotone"
            dataKey="amount319"
            stackId="1"
            stroke="#90CAF9"
            fill="#90CAF9"
            name="319 Funds"
          />
          <Area
            type="monotone"
            dataKey="amountCWSRF"
            stackId="1"
            stroke="#BA68C8"
            fill="#BA68C8"
            name="CWSRF-WQ"
          />
          <Area
            type="monotone"
            dataKey="amountLocal"
            stackId="1"
            stroke="#F48FB1"
            fill="#F48FB1"
            name="Local Funds"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FundingChart;
