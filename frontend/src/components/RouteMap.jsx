import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, Play, Pause, RotateCcw, Crosshair, Radio } from 'lucide-react'

// Fix default marker icon asset paths if ever used by Leaflet internals
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom HTML Pin for Origin (Depot)
const createOriginIcon = () =>
  L.divIcon({
    className: 'custom-map-pin origin-pin',
    html: `
      <div class="pin-marker-wrap depot-wrap">
        <div class="pin-core depot-core"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

// Custom HTML Pin for Destination (Customer)
const createDestinationIcon = () =>
  L.divIcon({
    className: 'custom-map-pin destination-pin',
    html: `
      <div class="pin-marker-wrap destination-wrap">
        <div class="dest-pulse"></div>
        <div class="dest-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 26],
  })

// Custom HTML Pin for Live Rider with Radar Pulse and Directional Heading Arrow
const createRiderIcon = (heading = 0) =>
  L.divIcon({
    className: 'custom-map-pin rider-pin',
    html: `
      <div class="rider-marker-container">
        <div class="rider-radar-pulse"></div>
        <div class="rider-dot-center">
          <div class="rider-heading-arrow" style="transform: rotate(${heading}deg);">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <polygon points="12 2 19 21 12 17 5 21 12 2"/>
            </svg>
          </div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

export default function RouteMap({
  origin,
  destination,
  route = [],
  currentPosition,
  waypoints = [],
  isPaused,
  onTogglePause,
  onResetSimulation,
  trackingMode = 'simulated',
  onToggleMode,
  gpsError,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const tileLayerRef = useRef(null)
  const riderMarkerRef = useRef(null)
  const originMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const polylineRef = useRef(null)
  const polylineGlowRef = useRef(null)

  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  )

  // Listen to theme changes to dynamically swap map tile styling
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      setIsDarkMode(isDark)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    return () => observer.disconnect()
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialCenter = currentPosition
      ? [currentPosition.lat, currentPosition.lng]
      : [origin.lat, origin.lng]

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
    })

    // 100% Free OpenStreetMap tiles (zero API key required, zero watermarks in both light & dark mode)
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abc',
    }).addTo(map)

    tileLayerRef.current = tiles

    // Draw route polylines
    if (route && route.length > 0) {
      polylineGlowRef.current = L.polyline(route, {
        color: '#3B82F6',
        weight: 6,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      polylineRef.current = L.polyline(route, {
        color: '#2563EB',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      const bounds = L.latLngBounds(route)
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 })
    }

    // Origin Depot Marker
    if (origin) {
      originMarkerRef.current = L.marker([origin.lat, origin.lng], {
        icon: createOriginIcon(),
        interactive: true,
      })
        .addTo(map)
        .bindTooltip(`<b>Origin</b><br>${origin.label}`, {
          direction: 'top',
          offset: [0, -10],
          className: 'map-custom-tooltip',
        })
    }

    // Destination Marker
    if (destination) {
      destMarkerRef.current = L.marker([destination.lat, destination.lng], {
        icon: createDestinationIcon(),
        interactive: true,
      })
        .addTo(map)
        .bindTooltip(`<b>Drop-off</b><br>${destination.label}`, {
          direction: 'top',
          offset: [0, -22],
          className: 'map-custom-tooltip',
        })
    }

    // Rider Live Position Marker
    if (currentPosition) {
      riderMarkerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: createRiderIcon(currentPosition.heading || 0),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip(`<b>Rider Live</b><br>Speed: ${currentPosition.speed} km/h`, {
          direction: 'top',
          offset: [0, -16],
          className: 'map-custom-tooltip',
        })
    }

    mapInstanceRef.current = map

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Rider Marker position and heading dynamically
  useEffect(() => {
    if (!currentPosition || !mapInstanceRef.current) return

    const { lat, lng, speed, heading } = currentPosition
    const newLatLng = L.latLng(lat, lng)

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(newLatLng)
      riderMarkerRef.current.setIcon(createRiderIcon(heading || 0))
      riderMarkerRef.current.setTooltipContent(`<b>Rider Live</b><br>Speed: ${speed} km/h`)
    } else {
      riderMarkerRef.current = L.marker(newLatLng, {
        icon: createRiderIcon(heading || 0),
        zIndexOffset: 1000,
      }).addTo(mapInstanceRef.current)
    }

    // Smoothly pan along as rider progresses
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(newLatLng, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      })
    }
  }, [currentPosition])

  // Manual recenter handler
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current || !currentPosition) return
    mapInstanceRef.current.setView([currentPosition.lat, currentPosition.lng], 15, {
      animate: true,
    })
  }, [currentPosition])

  // Fit all route view handler
  const handleFitRoute = useCallback(() => {
    if (!mapInstanceRef.current || !route || route.length === 0) return
    const bounds = L.latLngBounds(route)
    mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 15, animate: true })
  }, [route])

  return (
    <div className="route-map-canvas live-map-wrapper" aria-label="Real-time live delivery map">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="leaflet-map-host" />

      {/* Floating Telemetry & Controls Overlay */}
      <div className="map-overlay-layer">
        {/* Top-Right Map Actions */}
        <div className="map-action-buttons">
          <button
            type="button"
            className="map-control-btn"
            onClick={handleRecenter}
            title="Recenter on Rider"
            aria-label="Recenter on Rider"
          >
            <Crosshair size={13} />
          </button>
          <button
            type="button"
            className="map-control-btn"
            onClick={handleFitRoute}
            title="View Full Route"
            aria-label="View Full Route"
          >
            <Navigation size={13} />
          </button>
          {trackingMode === 'simulated' && (
            <>
              <button
                type="button"
                className="map-control-btn"
                onClick={onTogglePause}
                title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
                aria-label={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
              </button>
              <button
                type="button"
                className="map-control-btn"
                onClick={onResetSimulation}
                title="Restart Route"
                aria-label="Restart Route"
              >
                <RotateCcw size={12} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Floating Telemetry & Mode Chip */}
        <div className="map-bottom-bar">
          <div className="map-floating-chip live-telemetry-chip">
            <span className={`live-dot ${isPaused ? 'paused' : ''}`} />
            <span className="telemetry-speed-text">
              {trackingMode === 'gps' ? 'Live GPS' : 'Rider on track'} • {currentPosition?.speed || 32} km/h
            </span>
          </div>

          {/* Mode Switcher Pill: Simulated vs Real GPS */}
          <button
            type="button"
            className={`map-mode-pill ${trackingMode === 'gps' ? 'is-gps' : 'is-sim'}`}
            onClick={onToggleMode}
            title={`Current: ${trackingMode === 'gps' ? 'Device GPS' : 'Live Simulation'}. Click to toggle`}
          >
            <Radio size={11} className={trackingMode === 'gps' ? 'pulse-radio' : ''} />
            <span>{trackingMode === 'gps' ? 'GPS Active' : 'Simulated'}</span>
          </button>
        </div>

        {/* GPS Error Notification if device denies location */}
        {gpsError && (
          <div className="map-gps-error-banner" role="alert">
            <span>GPS error: {gpsError}</span>
          </div>
        )}
      </div>
    </div>
  )
}
