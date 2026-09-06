import { useState, useEffect, useRef, useCallback } from 'react'

// Realistic road coordinate path in Dehradun: Prem Nagar -> Nanda Ki Chowki -> Pondha -> UPES Bidholi Campus
const DEFAULT_ROUTE = [
  [30.3340, 77.9620], // Hub 03 (Prem Nagar Main Market, Dehradun)
  [30.3385, 77.9648], // Prem Nagar Cantonment Link
  [30.3430, 77.9672], // Mandir Chowk Approach
  [30.3482, 77.9688], // Nanda Ki Chowki Junction (Turn to Bidholi Road)
  [30.3540, 77.9675], // Sudhowala Road Corridor
  [30.3615, 77.9668], // Kolhupani Link
  [30.3685, 77.9670], // Pondha Chowk Link
  [30.3755, 77.9665], // Pondha Valley Road
  [30.3835, 77.9658], // Dunga Diversion
  [30.3925, 77.9650], // UPES Kandoli Turn
  [30.4015, 77.9655], // Forest Valley Corridor
  [30.4085, 77.9660], // Bidholi Village
  [30.4158, 77.9665], // UPES Bidholi Campus (Energy Acres)
]

// Haversine formula to compute distance in km between two lat/lng pairs
function computeDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate bearing/heading angle in degrees
function computeHeading(lat1, lon1, lat2, lon2) {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}

export function useRiderTracking(options = {}) {
  const route = options.route || DEFAULT_ROUTE
  const destination = options.destination || {
    lat: route[route.length - 1][0],
    lng: route[route.length - 1][1],
    label: 'Rahul Sharma',
    address: 'Hostel Block B, UPES Bidholi Campus, Dehradun',
  }
  const origin = options.origin || {
    lat: route[0][0],
    lng: route[0][1],
    label: 'Hub 03 (Prem Nagar Depot)',
    address: 'Chakrata Road, Prem Nagar, Dehradun',
  }

  // Tracking mode: 'simulated' | 'gps'
  const [mode, setMode] = useState('simulated')
  const [gpsError, setGpsError] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  // Start rider at waypoint index ~5 (corresponds to current ~70% progress in design)
  const [currentIndex, setCurrentIndex] = useState(5)
  const [currentPosition, setCurrentPosition] = useState({
    lat: route[5][0],
    lng: route[5][1],
    speed: 32,
    heading: 42,
  })

  const [metrics, setMetrics] = useState({
    remainingDistance: '2.4 km',
    remainingKmRaw: 2.4,
    etaMinutes: 12,
    progress: 70,
    status: 'in-transit',
  })

  const watchIdRef = useRef(null)

  // Update remaining distance, ETA, and progress along the path
  const updateDerivedMetrics = useCallback((currLat, currLng, currSpeed, pointIdx) => {
    // Total remaining distance along the rest of the route path
    let distRemaining = 0
    const startIdx = Math.min(pointIdx, route.length - 1)
    
    // Distance from current position to next waypoint
    if (startIdx < route.length - 1) {
      distRemaining += computeDistanceKm(currLat, currLng, route[startIdx + 1][0], route[startIdx + 1][1])
      // Rest of the path
      for (let i = startIdx + 1; i < route.length - 1; i++) {
        distRemaining += computeDistanceKm(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1])
      }
    } else {
      distRemaining = computeDistanceKm(currLat, currLng, destination.lat, destination.lng)
    }

    const remainingKmRaw = Math.max(0.1, Number(distRemaining.toFixed(2)))
    const remainingDistanceStr = remainingKmRaw < 1 
      ? `${Math.round(remainingKmRaw * 1000)} m` 
      : `${remainingKmRaw.toFixed(1)} km`

    // Calculate realistic ETA based on speed (fallback to 25 km/h if stopped)
    const effectiveSpeed = currSpeed > 10 ? currSpeed : 28
    const calculatedEta = Math.max(1, Math.round((remainingKmRaw / effectiveSpeed) * 60))

    // Progress percentage
    const progressPct = Math.min(
      99,
      Math.max(5, Math.round(((pointIdx + 1) / route.length) * 100))
    )

    let status = 'in-transit'
    if (remainingKmRaw <= 0.3) {
      status = 'approaching'
    }

    setMetrics({
      remainingDistance: remainingDistanceStr,
      remainingKmRaw,
      etaMinutes: calculatedEta,
      progress: progressPct,
      status,
    })
  }, [route, destination])

  // Real device GPS Tracking
  useEffect(() => {
    if (mode !== 'gps') {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser')
      setMode('simulated')
      return
    }

    setGpsError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords
        const speedKmh = speed != null ? Math.round(speed * 3.6) : 28
        const finalHeading = heading != null ? Math.round(heading) : 45

        setCurrentPosition({
          lat: latitude,
          lng: longitude,
          speed: speedKmh,
          heading: finalHeading,
        })

        const dist = computeDistanceKm(latitude, longitude, destination.lat, destination.lng)
        const remKm = Math.max(0.1, Number(dist.toFixed(2)))
        const calculatedEta = Math.max(1, Math.round((remKm / 28) * 60))

        setMetrics({
          remainingDistance: remKm < 1 ? `${Math.round(remKm * 1000)} m` : `${remKm.toFixed(1)} km`,
          remainingKmRaw: remKm,
          etaMinutes: calculatedEta,
          progress: 85,
          status: remKm < 0.4 ? 'approaching' : 'in-transit',
        })
      },
      (err) => {
        console.warn('GPS location tracking error:', err.message)
        setGpsError(err.message)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    )

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [mode, destination])

  // Simulated live route movement
  useEffect(() => {
    if (mode !== 'simulated' || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % route.length
        const currCoord = route[prevIdx]
        const nextCoord = route[nextIdx]

        // Dynamic realistic speed between 26 and 42 km/h
        const jitterSpeed = Math.floor(28 + Math.sin(nextIdx) * 8 + (Math.random() * 4))
        const heading = computeHeading(currCoord[0], currCoord[1], nextCoord[0], nextCoord[1])

        setCurrentPosition({
          lat: nextCoord[0],
          lng: nextCoord[1],
          speed: jitterSpeed,
          heading,
        })

        updateDerivedMetrics(nextCoord[0], nextCoord[1], jitterSpeed, nextIdx)
        return nextIdx
      })
    }, 2800) // Update position every 2.8 seconds for natural movement pace

    return () => clearInterval(interval)
  }, [mode, isPaused, route, updateDerivedMetrics])

  const togglePause = () => setIsPaused((prev) => !prev)

  const resetToStart = () => {
    setCurrentIndex(0)
    setCurrentPosition({
      lat: route[0][0],
      lng: route[0][1],
      speed: 30,
      heading: 42,
    })
    updateDerivedMetrics(route[0][0], route[0][1], 30, 0)
  }

  return {
    origin,
    destination,
    route,
    currentPosition,
    metrics,
    mode,
    setMode,
    isPaused,
    togglePause,
    resetToStart,
    gpsError,
  }
}
