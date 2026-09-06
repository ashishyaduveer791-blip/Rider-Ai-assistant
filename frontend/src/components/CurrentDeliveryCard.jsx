import { useState } from 'react'
import { Clock, User, Navigation, ShieldCheck, ArrowUpRight, Compass, PhoneCall } from 'lucide-react'
import RouteMap from './RouteMap'
import { useRiderTracking } from '../hooks/useRiderTracking'
import DeliveryDetailsModal from './DeliveryDetailsModal'
import CustomerCallModal from './CustomerCallModal'

export default function CurrentDeliveryCard({ onSimulateNav, onCallEvent, onDeliveryEvent }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)

  const {
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
  } = useRiderTracking()

  const handleToggleTrackingMode = () => {
    setMode((prev) => (prev === 'simulated' ? 'gps' : 'simulated'))
  }

  const handleDeliveryConfirmed = (detail) => {
    if (onDeliveryEvent) onDeliveryEvent(detail)
  }

  const handleCallCompleted = (detail) => {
    if (onCallEvent) onCallEvent(detail)
  }

  return (
    <div className="current-delivery-card">
      {/* Header */}
      <div className="card-head-row">
        <div className="card-title-group">
          <div className="card-badge-pill">
            <span className="badge-pulse-dot" />
            <span>Out for Delivery</span>
          </div>
          <span className="order-number-tag">#RID-2048</span>
        </div>
        <div className="card-priority-tag">
          <Clock size={14} />
          <span>Priority Express</span>
        </div>
      </div>

      {/* Main Delivery Info Grid */}
      <div className="delivery-main-info">
        <div className="customer-info-col">
          <div className="customer-header">
            <div className="customer-avatar-badge">
              <User size={18} />
            </div>
            <div>
              <h2 className="customer-name">{destination.label}</h2>
              <p className="delivery-address">{destination.address}</p>
            </div>
          </div>

          {/* Quick Metrics Bar with Live Telemetry */}
          <div className="delivery-metrics-row">
            <div className="delivery-metric-box">
              <span className="metric-caption">Estimated Arrival</span>
              <div className="metric-val-wrap">
                <Clock size={16} className="metric-icon blue" />
                <span className="metric-bold">{metrics.etaMinutes} min</span>
              </div>
            </div>

            <div className="delivery-metric-box">
              <span className="metric-caption">Remaining Distance</span>
              <div className="metric-val-wrap">
                <Navigation size={16} className="metric-icon teal" />
                <span className="metric-bold">{metrics.remainingDistance}</span>
              </div>
            </div>

            <div className="delivery-metric-box">
              <span className="metric-caption">OTP Verification</span>
              <div className="metric-val-wrap">
                <ShieldCheck size={16} className="metric-icon amber" />
                <span className="metric-bold">Required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Leaflet Delivery Route Map */}
        <div className="delivery-route-preview">
          <RouteMap
            origin={origin}
            destination={destination}
            route={route}
            currentPosition={currentPosition}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onResetSimulation={resetToStart}
            trackingMode={mode}
            onToggleMode={handleToggleTrackingMode}
            gpsError={gpsError}
          />
        </div>
      </div>

      {/* Delivery Progress Stepper */}
      <div className="delivery-progress-section">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${metrics.progress}%` }} />
        </div>
        <div className="progress-steps-row">
          <div className="progress-step is-complete">
            <span className="step-bullet" />
            <span className="step-label">Order Picked</span>
          </div>
          <div className="progress-step is-complete">
            <span className="step-bullet" />
            <span className="step-label">In Transit</span>
          </div>
          <div className={`progress-step ${metrics.status === 'delivered' ? 'is-complete' : 'is-active'}`}>
            <span className="step-bullet" />
            <span className="step-label">Approaching ({metrics.remainingDistance})</span>
          </div>
          <div className={`progress-step ${metrics.status === 'delivered' ? 'is-complete' : 'is-pending'}`}>
            <span className="step-bullet" />
            <span className="step-label">Delivered</span>
          </div>
        </div>
      </div>

      {/* Action Buttons with Real Interactive Modals */}
      <div className="delivery-actions-footer">
        <div className="actions-left">
          <button
            type="button"
            className="btn-primary-delivery"
            onClick={() => setShowDeliveryModal(true)}
            title="View full delivery breakdown & order items"
          >
            <span>View Delivery</span>
            <ArrowUpRight size={16} />
          </button>
          <button
            type="button"
            className="btn-secondary-delivery"
            onClick={onSimulateNav}
            title="Open turn-by-turn navigation"
          >
            <Compass size={16} />
            <span>Navigation</span>
          </button>
        </div>

        <div className="actions-right">
          <button
            type="button"
            className="btn-quick-call"
            onClick={() => setShowCallModal(true)}
            title="Call customer Rahul Sharma (+91 98765 43210)"
          >
            <PhoneCall size={15} />
            <span>Call Customer</span>
          </button>
        </div>
      </div>

      {/* View Delivery Details Modal */}
      <DeliveryDetailsModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        destination={destination}
        origin={origin}
        metrics={metrics}
        onConfirmDelivered={handleDeliveryConfirmed}
      />

      {/* Real Customer Calling Modal HUD */}
      <CustomerCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        customerName={destination.label}
        customerPhone="+91 98765 43210"
        destinationAddress={destination.address}
        onCallCompleted={handleCallCompleted}
      />
    </div>
  )
}
