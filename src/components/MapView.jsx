import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCurrency } from '../utils/dataProcessor';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ data }) => {
  // Calculate center of South Dakota
  const center = [44.5, -100.0];
  const zoom = 6;

  // Group farms by location to handle overlapping markers
  const farmsByLocation = data.reduce((acc, row) => {
    const key = `${row.lat.toFixed(4)},${row.long.toFixed(4)}`;
    if (!acc[key]) {
      acc[key] = {
        lat: row.lat,
        lng: row.long,
        farms: [],
        totalFunding: 0,
        totalAcres: 0,
      };
    }
    acc[key].farms.push(row);
    acc[key].totalFunding += row.totalAmount;
    acc[key].totalAcres += row.acres;
    return acc;
  }, {});

  const locations = Object.values(farmsByLocation);

  // Color based on funding level
  const getColor = (funding) => {
    if (funding > 50000) return '#EC407A';
    if (funding > 20000) return '#BA68C8';
    if (funding > 10000) return '#7986CB';
    return '#42A5F5';
  };

  // Size based on acres
  const getRadius = (acres) => {
    return Math.min(Math.max(acres / 20, 5), 20);
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '380px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, idx) => (
          <CircleMarker
            key={idx}
            center={[location.lat, location.lng]}
            radius={getRadius(location.totalAcres)}
            fillColor={getColor(location.totalFunding)}
            color="#fff"
            weight={2}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="popup-content">
                <h4>{location.farms[0].farm}</h4>
                <p><strong>City:</strong> {location.farms[0].city}</p>
                <p><strong>Contracts:</strong> {location.farms.length}</p>
                <p><strong>Contract Years:</strong> {[...new Set(location.farms.map(f => f.date ? f.date.getFullYear() : 'N/A'))].sort().join(', ')}</p>
                <p><strong>Total Funding:</strong> {formatCurrency(location.totalFunding)}</p>
                <p><strong>Total Acres:</strong> {Math.round(location.totalAcres).toLocaleString()}</p>
                <hr />
                <p><strong>Practices:</strong></p>
                <ul>
                  {[...new Set(location.farms.map(f => f.bmp))].map((bmp, i) => (
                    <li key={i}>{bmp}</li>
                  ))}
                </ul>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
