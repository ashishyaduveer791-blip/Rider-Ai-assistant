import { Navigation, MapPin } from 'lucide-react'

/**
 * RouteMap Component
 * Abstracted delivery route visualization with a structured props data model.
 * Drop-in replaceable with Mapbox GL, Leaflet, or Google Maps later.
 *
 * @param {Object} origin - { label, lat, lng, address }
 * @param {Object} destination - { label, lat, lng, address }
 * @param {Array} waypoints - Array of { id, label, lat, lng, note }
 * @param {Object} currentPosition - { lat, lng, speed, heading }
 * @param {number} progress - 0 to 100 percentage along the route
 * @param {string} status - 'pickup' | 'in-transit' | 'approaching' | 'delivered'
 */
export default function RouteMap({
  origin = {
    label: 'Hub 04 (Depot)',
    address: 'Sector 12 Logistics Yard',
    lat: 28.4595,
    lng: 77.0266,
  },
  destination = {
    label: 'Rahul Sharma',
    address: 'Apt 4B, Hillcrest Heights, Sector 14',
    lat: 28.4715,
    lng: 77.0421,
  },
  waypoints = [
    {
      id: 'wp-1',
      label: 'Sector 14 Flyover Link',
      lat: 28.4650,
      lng: 77.0340,
      note: 'Fastest corridor',
    },
  ],
  currentPosition = {
    lat: 28.4635,
    lng: 77.0315,
    speed: '32 km/h',
    heading: 'NE',
  },
  progress = 70,
  status = 'in-transit',
}) {
  return (
    <div className="route-map-canvas" aria-label={`Delivery Route: ${origin.label} to ${destination.label}`}>
      <svg viewBox="0 0 320 170" fill="none" className="route-svg" aria-hidden="true">
        {/* Abstract road grid background lines */}
        <path d="M10 30h300M10 85h300M10 140h300" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M60 10v150M160 10v150M260 10v150" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Gray underlying street route */}
        <path
          d="M10 110 C 90 110, 100 45, 180 45 S 250 120, 300 120"
          stroke="#CBD5E1"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Active Route Path */}
        <path
          id="activeRoutePath"
          d="M40 120 C 100 120, 110 55, 180 55 S 240 105, 280 85"
          stroke="#2563EB"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Origin / Starting Point */}
        <circle cx="40" cy="120" r="5" fill="#64748B" />
        <circle cx="40" cy="120" r="2" fill="#FFFFFF" />

        {/* Visual Connector: Dashed line linking Rider GPS position to the telemetry chip */}
        <line
          x1="180"
          y1="62"
          x2="180"
          y2="135"
          stroke="#2563EB"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.5"
        />
        <line
          x1="180"
          y1="135"
          x2="110"
          y2="135"
          stroke="#2563EB"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.5"
        />

        {/* Rider Current Position Pin with animated radar ping */}
        <circle cx="180" cy="55" r="14" fill="rgba(37, 99, 235, 0.15)" className="rider-radar-ring" />
        <circle cx="180" cy="55" r="7" fill="#2563EB" />
        <circle cx="180" cy="55" r="3" fill="#FFFFFF" />

        {/* Destination Pin */}
        <g transform="translate(270, 68)">
          <circle cx="10" cy="17" r="4" fill="#059669" />
          <path d="M10 2a7 7 0 0 0-7 7c0 5 7 12 7 12s7-7 7-12a7 7 0 0 0-7-7z" fill="#059669" />
          <circle cx="10" cy="9" r="2.5" fill="#FFFFFF" />
        </g>

        {/* Road Labels from Waypoint / Route Metadata */}
        <text x="75" y="115" fill="#94A3B8" fontSize="9" fontWeight="500">
          Outer Ring Rd
        </text>
        <text x="195" y="45" fill="#2563EB" fontSize="9" fontWeight="600">
          {waypoints[0]?.label || 'Sector 14 Link'}
        </text>
      </svg>

      {/* Floating Telemetry Chip with visual connector anchor */}
      <div className="map-floating-chip has-connector">
        <span className="live-dot" />
        <span className="telemetry-speed-text">Rider on track • {currentPosition.speed}</span>
      </div>
    </div>
  )
}
