import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { io } from 'socket.io-client'
import L from 'leaflet'
import { Navigation, Maximize, Phone, Circle as CircleIcon } from 'lucide-react'
import API from '../../api'

// Custom marker icon
const createWorkerIcon = (isActive) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="marker-pin ${isActive ? 'marker-pulse' : ''}"></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
})

// Syncs map center when selected worker changes
const MapUpdater = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

const DEFAULT_CENTER = [51.505, -0.09]

const LiveTracking = () => {
  const [workers, setWorkers] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const mapRef = useRef()

  useEffect(() => {
    // Connect to socket server
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')

    // Join admin room for live updates
    socket.emit('join', 'admin-room')

    // Update worker position on incoming location event
    socket.on('worker-location', (data) => {
      setWorkers(prev => {
        const exists = prev.find(w => w.id === data.workerId)
        if (exists) {
          return prev.map(w => w.id === data.workerId ? { ...w, ...data } : w)
        }
        return [...prev, data]
      })
    })

    fetchWorkers()

    return () => socket.close()
  }, [])

  const fetchWorkers = async () => {
    try {
      const res = await API.get('/locations/workers')
      setWorkers(
        res.data.data.map(w => ({
          id: w._id,
          name: w.name,
          position: [
            w.currentLocation.coordinates[1],
            w.currentLocation.coordinates[0]
          ],
          isOnline: w.isOnline,
          lastActive: w.lastActive
        }))
      )
    } catch (err) {
      console.error('Failed to fetch worker locations:', err)
    }
  }

  const center = selectedWorker?.position || DEFAULT_CENTER

  return (
    <div className="map-container">
      {/* Map */}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} />

        {workers.map(worker => (
          <div key={worker.id}>
            <Marker
              position={worker.position}
              icon={createWorkerIcon(worker.isOnline)}
              eventHandlers={{ click: () => setSelectedWorker(worker) }}
            >
              <Popup>
                <div className="worker-popup">
                  <div className="popup-header">
                    <div className="popup-avatar">
                      {worker.name?.charAt(0)}
                    </div>
                    <div className="popup-info">
                      <h4>{worker.name}</h4>
                      <div className="popup-status">
                        <span className="status-dot" />
                        {worker.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                  <div className="popup-details">
                    <div className="popup-detail">
                      <Navigation size={16} />
                      <span>
                        Last updated: {new Date(worker.lastActive).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="popup-detail">
                      <Phone size={16} />
                      <span>Contact Worker</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Geofence radius indicator */}
            <Circle
              center={worker.position}
              radius={100}
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
          </div>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <div className="map-controls">
        <button className="map-control-btn" title="Refresh locations" onClick={fetchWorkers}>
          <Navigation size={20} />
        </button>
        <button className="map-control-btn" title="Maximize map">
          <Maximize size={20} />
        </button>
      </div>

      {/* Workers Sidebar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '300px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        maxHeight: 'calc(100% - 40px)',
        overflow: 'auto'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontWeight: 600 }}>
            Active Workers ({workers.length})
          </h3>
        </div>

        {/* Worker List */}
        <div style={{ padding: '8px' }}>
          {workers.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No workers currently tracked.
            </div>
          ) : (
            workers.map(worker => (
              <div
                key={worker.id}
                onClick={() => setSelectedWorker(worker)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: selectedWorker?.id === worker.id ? '#eff6ff' : 'transparent'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {worker.name?.charAt(0)}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{worker.name}</div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CircleIcon
                      size={8}
                      fill={worker.isOnline ? '#10b981' : '#ef4444'}
                      color={worker.isOnline ? '#10b981' : '#ef4444'}
                    />
                    {worker.isOnline ? 'Active now' : 'Offline'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveTracking