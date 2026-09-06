import { useMemo, useState } from 'react'
import { CirclePlus, GripVertical, MapPin, Navigation, RotateCcw } from 'lucide-react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { initialStops } from './data/stops'
import { optimizeRoute, reverseGeocode } from './api/routeApi'

const center = [19.071, 72.897]

function markerIcon(label, isDepot) {
  return L.divIcon({
    className: 'delivery-marker-wrapper',
    html: `<span class="delivery-marker ${isDepot ? 'depot-marker' : ''}">${label}</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export default function App() {
  const [stops, setStops] = useState(initialStops)
  const [stopCount, setStopCount] = useState(10)
  const [routeGeometry, setRouteGeometry] = useState([])
  const [isValidating, setIsValidating] = useState(false)
  const [apiMessage, setApiMessage] = useState('')

  const routePoints = useMemo(
    () => routeGeometry.length > 0
      ? routeGeometry
      : stops.map(({ latitude, longitude }) => [latitude, longitude]),
    [routeGeometry, stops],
  )

  async function moveStop(stopId, position) {
    setStops((currentStops) => currentStops.map((stop) => (
      stop.id === stopId
        ? { ...stop, latitude: position.lat, longitude: position.lng }
        : stop
    )))
    setRouteGeometry([])
    setApiMessage('Updating the address for this pin…')

    try {
      const result = await reverseGeocode(position.lat, position.lng)
      setStops((currentStops) => currentStops.map((stop) => (
        stop.id === stopId
          ? { ...stop, address: result.display_name }
          : stop
      )))
      setApiMessage('Stop location updated.')
    } catch (error) {
      setApiMessage(error.message)
    }
  }

  function resetStops() {
    setStops(initialStops)
    setStopCount(10)
    setRouteGeometry([])
    setApiMessage('')
  }

  function updateStopCount(event) {
    const requestedCount = Number(event.target.value)
    const nextCount = Math.min(10, Math.max(3, Number.isFinite(requestedCount) ? requestedCount : 3))

    setStopCount(nextCount)
    setStops((currentStops) => initialStops
      .slice(0, nextCount + 1) // +1 keeps the depot alongside the deliveries.
      .map((defaultStop) => currentStops.find((stop) => stop.id === defaultStop.id) ?? defaultStop))
    setRouteGeometry([])
    setApiMessage('')
  }

  async function optimizeAndPreviewRoute() {
    setIsValidating(true)
    setApiMessage('Finding the quickest road route…')

    try {
      const result = await optimizeRoute({ depot: stops[0], stops: stops.slice(1) })
      setStops(result.ordered_stops)
      setRouteGeometry(result.geometry)
      const distance = (result.distance_meters / 1000).toFixed(1)
      const duration = Math.ceil(result.duration_seconds / 60)
      setApiMessage(`Route ready: ${distance} km, about ${duration} min.`)
    } catch (error) {
      setRouteGeometry([])
      setApiMessage(error.message)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Navigation size={20} fill="currentColor" /></div>
          <span>RouteWise</span>
        </div>

        <section className="sidebar-heading">
          <p className="eyebrow">Today&apos;s route</p>
          <h1>Plan your deliveries</h1>
          <p>Drag a pin on the map to update a stop location.</p>
        </section>

        <div className="stop-count-control">
          <label htmlFor="stop-count">Number of delivery stops</label>
          <div className="stop-count-input">
            <CirclePlus size={18} aria-hidden="true" />
            <input
              id="stop-count"
              type="number"
              min="3"
              max="10"
              value={stopCount}
              onChange={updateStopCount}
            />
            <span>3–10</span>
          </div>
        </div>

        <div className="stops" aria-label="Delivery stops">
          {stops.map((stop, index) => (
            <article className="stop-card" key={stop.id}>
              <GripVertical className="drag-handle" size={17} aria-hidden="true" />
              <span className={`stop-number ${stop.type === 'depot' ? 'depot-number' : ''}`}>
                {stop.type === 'depot' ? 'D' : index}
              </span>
              <div>
                <strong>{stop.name}</strong>
                <small>{stop.address}</small>
              </div>
            </article>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="secondary-button" type="button" onClick={resetStops}>
            <RotateCcw size={16} /> Reset demo
          </button>
          <button className="primary-button" type="button" onClick={optimizeAndPreviewRoute} disabled={isValidating}>
            <Navigation size={17} /> {isValidating ? 'Optimizing…' : 'Optimize route'}
          </button>
        </div>
        {apiMessage && <p className="api-message" role="status">{apiMessage}</p>}
      </aside>

      {/* aside */}

      <section className="map-panel" aria-label="Map of delivery stops">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="map">
          <TileLayer
            attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {routeGeometry.length > 0 && <Polyline positions={routePoints} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }} />}
          {stops.map((stop, index) => (
            <Marker
              draggable
              eventHandlers={{ dragend: (event) => moveStop(stop.id, event.target.getLatLng()) }}
              icon={markerIcon(stop.type === 'depot' ? 'D' : index, stop.type === 'depot')}
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
            >
              <Popup>
                <strong>{stop.name}</strong><br />
                {stop.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="map-status">
          <MapPin size={17} />
          <span><strong>{stops.length - 1} stops</strong> + depot</span>
          {routeGeometry.length > 0 && <span className="preview-pill">Optimized route</span>}
        </div>
        <p className="map-hint">Optimize route uses live road geometry from OSRM and keeps the depot as the starting point.</p>
      </section>
    </main>
  )
}
