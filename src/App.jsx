import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { processData, calculateStats, groupByBMP, formatCurrency, formatNumber } from './utils/dataProcessor';
import StatsCard from './components/StatsCard';
import BMPChart from './components/BMPChart';
import TimelineChart from './components/TimelineChart';
import FundingChart from './components/FundingChart';
import MapView from './components/MapView';
import ImpactChart from './components/ImpactChart';
import SegmentFilter from './components/SegmentFilter';
import FundingAnalysis from './components/FundingAnalysis';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('all');

  useEffect(() => {
    // Load and process CSV data
    Papa.parse('./data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        try {
          const processed = processData(results.data);
          setAllData(processed);
          setData(processed);
          const statistics = calculateStats(processed);
          setStats(statistics);
          setLoading(false);
        } catch (err) {
          setError('Error processing data: ' + err.message);
          setLoading(false);
        }
      },
      error: (err) => {
        setError('Error loading data: ' + err.message);
        setLoading(false);
      },
    });
  }, []);

  // Filter data by segment
  useEffect(() => {
    if (allData.length > 0) {
      let filtered = allData;
      if (selectedSegment !== 'all') {
        filtered = allData.filter(row => row.segment === selectedSegment);
      }
      setData(filtered);
      const statistics = calculateStats(filtered);
      setStats(statistics);
    }
  }, [selectedSegment, allData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading conservation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="./sdshc-logo.png" alt="SDSHC Logo" className="header-logo" />
          <div className="header-text">
            <h1>Conservation Practices Cost-Share Program Dashboard</h1>
            <p className="subtitle">
              <a href="https://www.sdsoilhealthcoalition.org/" target="_blank" rel="noopener noreferrer" className="coalition-link">
                <span className="conservation-hover-group">
                  South Dakota Soil Health Coalition
                  <span className="conservation-emoji conservation-emoji-1">🌾</span>
                  <span className="conservation-emoji conservation-emoji-2">🌱</span>
                  <span className="conservation-emoji conservation-emoji-3">🚜</span>
                  <span className="conservation-emoji conservation-emoji-4">💧</span>
                </span>
              </a>
            </p>
          </div>
          <img src="./sdshc-logo.png" alt="SDSHC Logo" className="header-logo" />
        </div>
      </header>

      <main className="dashboard-content">
        {/* Segment Filter */}
        <SegmentFilter
          selectedSegment={selectedSegment}
          onSegmentChange={setSelectedSegment}
        />

        {/* Key Metrics Section */}
        <section className="metrics-section">
          <h2>Program Overview</h2>
          <div className="stats-grid">
            <StatsCard
              title="Total Farms"
              value={stats.totalFarms}
              icon="🌾"
              subtitle={`${stats.totalProducers} producers`}
            />
            <StatsCard
              title="Total Funding"
              value={formatCurrency(stats.totalAllFunding)}
              icon="💰"
              subtitle={`${stats.totalContracts} contracts`}
            />
            <StatsCard
              title="Acres Impacted"
              value={formatNumber(stats.totalAcres)}
              icon="🌱"
              subtitle="Conservation practices applied"
            />
          </div>
          <div className="stats-grid environmental-stats">
            <StatsCard
              title="Nitrogen Reduction"
              value={`${formatNumber(stats.totalNReduction)} lbs/yr`}
              icon="🌍"
              subtitle="Nitrogen pollution reduced"
            />
            <StatsCard
              title="Phosphorus Reduction"
              value={`${formatNumber(stats.totalPReduction)} lbs/yr`}
              icon="💧"
              subtitle="Phosphorus pollution reduced"
            />
            <StatsCard
              title="Sediment Reduction"
              value={`${formatNumber(stats.totalSReduction)} lbs/yr`}
              icon="🏔️"
              subtitle="Sediment pollution reduced"
            />
          </div>
        </section>

        {/* Funding Breakdown */}
        <section className="funding-section">
          <h2>Funding Sources</h2>
          <div className="funding-cards">
            <div className="funding-card">
              <h3>319 Funds</h3>
              <p className="funding-amount">{formatCurrency(stats.total319Funding)}</p>
              <p className="funding-percent">
                {Math.round((stats.total319Funding / stats.totalAllFunding) * 100)}%
              </p>
            </div>
            <div className="funding-card">
              <h3>CWSRF-WQ Funds</h3>
              <p className="funding-amount">{formatCurrency(stats.totalCWSRFFunding)}</p>
              <p className="funding-percent">
                {Math.round((stats.totalCWSRFFunding / stats.totalAllFunding) * 100)}%
              </p>
            </div>
            <div className="funding-card">
              <h3>Local Funds</h3>
              <p className="funding-amount">{formatCurrency(stats.totalLocalFunding)}</p>
              <p className="funding-percent">
                {Math.round((stats.totalLocalFunding / stats.totalAllFunding) * 100)}%
              </p>
            </div>
          </div>
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 600 }}>Funding Allocation by Year</h3>
            <FundingChart data={data} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              className="view-details-btn"
              onClick={() => document.getElementById('funding-analysis').scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="view-details-btn-inner">
                View Detailed Funding Analysis
                <div className="view-details-btn-shine" />
              </div>
            </button>
          </div>
        </section>

        {/* BMP Distribution */}
        <section className="chart-section">
          <h2>Best Management Practices (BMPs)</h2>
          <BMPChart data={groupByBMP(data)} />
        </section>

        {/* Environmental Impact */}
        <section className="chart-section">
          <h2>Environmental Impact</h2>
          <ImpactChart data={data} />
        </section>

        {/* Timeline and Map in same row */}
        <div className="two-column-section">
          <section className="chart-section">
            <h2>Program Timeline</h2>
            <TimelineChart data={stats.yearData} />
          </section>

          <section className="chart-section map-section">
            <div className="map-header">
              <h2>Farm Locations</h2>
              <div className="map-legend-horizontal">
                <span className="legend-title">Funding Levels:</span>
                <div className="legend-item-horizontal">
                  <span className="legend-color" style={{ backgroundColor: '#EC407A' }}></span>
                  <span>&gt; $50k</span>
                </div>
                <div className="legend-item-horizontal">
                  <span className="legend-color" style={{ backgroundColor: '#BA68C8' }}></span>
                  <span>$20k - $50k</span>
                </div>
                <div className="legend-item-horizontal">
                  <span className="legend-color" style={{ backgroundColor: '#7986CB' }}></span>
                  <span>$10k - $20k</span>
                </div>
                <div className="legend-item-horizontal">
                  <span className="legend-color" style={{ backgroundColor: '#42A5F5' }}></span>
                  <span>&lt; $10k</span>
                </div>
              </div>
            </div>
            <MapView data={data.filter(d => d.lat !== 0 && d.long !== 0)} />
          </section>
        </div>

        {/* Funding Analysis */}
        <section id="funding-analysis" className="chart-section">
          <h2>Funding Analysis & Budget Tracking</h2>
          <FundingAnalysis selectedSegment={selectedSegment} />
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>
          Data represents conservation cost-share program activities from 2018-2025.
          Environmental reductions are measured in pounds per year.
        </p>
      </footer>
    </div>
  );
}

export default App;
