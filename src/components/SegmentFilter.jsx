import './SegmentFilter.css';

const SegmentFilter = ({ selectedSegment, onSegmentChange }) => {
  return (
    <div className="segment-filter">
      <label className="filter-label">Project Segment:</label>
      <div className="filter-buttons">
        <button
          className={`filter-btn ${selectedSegment === 'all' ? 'active' : ''}`}
          onClick={() => onSegmentChange('all')}
        >
          <div className="filter-btn-inner">
            All Segments
            <div className="filter-btn-shine" />
          </div>
        </button>
        <button
          className={`filter-btn ${selectedSegment === '1' ? 'active' : ''}`}
          onClick={() => onSegmentChange('1')}
        >
          <div className="filter-btn-inner">
            Segment 1 (2017-2020)
            <div className="filter-btn-shine" />
          </div>
        </button>
        <button
          className={`filter-btn ${selectedSegment === '2' ? 'active' : ''}`}
          onClick={() => onSegmentChange('2')}
        >
          <div className="filter-btn-inner">
            Segment 2 (2020-2023)
            <div className="filter-btn-shine" />
          </div>
        </button>
        <button
          className={`filter-btn ${selectedSegment === '3' ? 'active' : ''}`}
          onClick={() => onSegmentChange('3')}
        >
          <div className="filter-btn-inner">
            Segment 3 (2023-2026)
            <div className="filter-btn-shine" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default SegmentFilter;
