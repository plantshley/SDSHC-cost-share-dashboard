import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber } from '../utils/dataProcessor';

const ImpactChart = ({ data }) => {
  // Aggregate environmental impact by BMP
  const impactByBMP = data.reduce((acc, row) => {
    // Only include if has meaningful environmental data (not missing and not zero)
    if (!row.hasMissingData && row.bmp && (row.redN > 0 || row.redP > 0 || row.redS > 0)) {
      const bmp = row.bmp;
      if (!acc[bmp]) {
        acc[bmp] = { name: bmp, nitrogen: 0, phosphorus: 0, sediment: 0, acres: 0 };
      }
      acc[bmp].nitrogen += row.redN;
      acc[bmp].phosphorus += row.redP;
      acc[bmp].sediment += row.redS;
      acc[bmp].acres += row.acres || 0;
    }
    return acc;
  }, {});

  const chartData = Object.values(impactByBMP)
    .sort((a, b) => b.nitrogen - a.nitrogen)
    .slice(0, 8)
    .map(d => ({
      name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
      fullName: d.name,
      Nitrogen: Math.round(d.nitrogen),
      Phosphorus: Math.round(d.phosphorus),
      Sediment: Math.round(d.sediment),
      Acres: Math.round(d.acres),
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.fullName}</strong></p>
          <p style={{ color: '#42A5F5' }}>Nitrogen: {formatNumber(data.Nitrogen)} lbs/yr</p>
          <p style={{ color: '#AB47BC' }}>Phosphorus: {formatNumber(data.Phosphorus)} lbs/yr</p>
          <p style={{ color: '#EC407A' }}>Sediment: {formatNumber(data.Sediment)} lbs/yr</p>
          <p style={{ color: '#5C6BC0' }}>Acres: {formatNumber(data.Acres)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 70, bottom: 40 }}>
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
            label={{ value: 'Reduction (lbs/yr)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            style={{ fontSize: '11px' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }} />
          <Bar dataKey="Nitrogen" fill="#90CAF9" name="Nitrogen (lbs/yr)" />
          <Bar dataKey="Phosphorus" fill="#BA68C8" name="Phosphorus (lbs/yr)" />
          <Bar dataKey="Sediment" fill="#F48FB1" name="Sediment (lbs/yr)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactChart;
