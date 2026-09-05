import { Clock, User, Navigation, ShieldCheck, ArrowUpRight, Compass, PhoneCall } from 'lucide-react'
import RouteMap from './RouteMap'

export default function CurrentDeliveryCard({ onSimulateNav }) {
  // Structured Route Data Model
  const routeData = {
    origin: {
      label: 'Hub 04 (Depot)',
      address: 'Sector 12 Logistics Yard',
      lat: 28.4595,
      lng: 77.0266,
    },
    destination: {
      label: 'Rahul Sharma',
      address: 'Apt 4B, Hillcrest Heights, Sector 14',
      lat: 28.4715,
      lng: 77.0421,
    },
    waypoints: [
      {
        id: 'wp-1',
        label: 'Sector 14 Link',
        lat: 28.4650,
        lng: 77.0340,
        note: 'Fastest corridor',
      },
    ],
    currentPosition: {
      lat: 28.4635,
      lng: 77.0315,
      speed: '32 km/h',
      heading: 'NE',
    },
    progress: 70,
    status: 'in-transit',
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
              <h2 className="customer-name">Rahul Sharma</h2>
              <p className="delivery-address">Apt 4B, Hillcrest Heights, Sector 14</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="delivery-metrics-row">
            <div className="delivery-metric-box">
              <span className="metric-caption">Estimated Arrival</span>
              <div className="metric-val-wrap">
                <Clock size={16} className="metric-icon blue" />
                <span className="metric-bold">12 min</span>
              </div>
            </div>

            <div className="delivery-metric-box">
              <span className="metric-caption">Remaining Distance</span>
              <div className="metric-val-wrap">
                <Navigation size={16} className="metric-icon teal" />
                <span className="metric-bold">2.4 km</span>
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

        {/* Abstracted Delivery Route Map */}
        <div className="delivery-route-preview">
          <RouteMap
            origin={routeData.origin}
            destination={routeData.destination}
            waypoints={routeData.waypoints}
            currentPosition={routeData.currentPosition}
            progress={routeData.progress}
            status={routeData.status}
          />
        </div>
      </div>

      {/* Delivery Progress Stepper */}
      <div className="delivery-progress-section">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '70%' }} />
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
          <div className="progress-step is-active">
            <span className="step-bullet" />
            <span className="step-label">Approaching (2.4 km)</span>
          </div>
          <div className="progress-step is-pending">
            <span className="step-bullet" />
            <span className="step-label">Delivered</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="delivery-actions-footer">
        <div className="actions-left">
          <button
            type="button"
            className="btn-primary-delivery"
            title="View full delivery breakdown"
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
            title="Quick contact customer"
          >
            <PhoneCall size={15} />
            <span>Call Customer</span>
          </button>
        </div>
      </div>
    </div>
  )
}
