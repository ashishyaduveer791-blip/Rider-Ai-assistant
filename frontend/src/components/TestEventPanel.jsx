import {
  MapPin,
  MessageSquare,
  Phone,
  Key,
  Megaphone,
  Sliders,
  RotateCcw,
} from 'lucide-react'

export default function TestEventPanel({ onTriggerEvent, onResetEvents }) {
  const simulationOptions = [
    {
      type: 'nav-event',
      label: 'Navigation Event',
      icon: <MapPin size={16} />,
      tagColor: 'teal',
      sampleDesc: 'Route recalculated • Avoiding Sector 14 congestion',
    },
    {
      type: 'customer-msg',
      label: 'Customer Message',
      icon: <MessageSquare size={16} />,
      tagColor: 'indigo',
      sampleDesc: 'Customer: "Please leave package at the front door"',
    },
    {
      type: 'customer-call',
      label: 'Customer Call',
      icon: <Phone size={16} />,
      tagColor: 'blue',
      sampleDesc: 'Incoming call from Rahul Sharma (Order #RID-2048)',
    },
    {
      type: 'otp-event',
      label: 'OTP Event',
      icon: <Key size={16} />,
      tagColor: 'amber',
      sampleDesc: 'OTP verification required upon arrival',
    },
    {
      type: 'manager-msg',
      label: 'Manager Message',
      icon: <Megaphone size={16} />,
      tagColor: 'rose',
      sampleDesc: 'New delivery instruction received from Hub 04',
    },
  ]

  return (
    <div className="dispatch-simulation-card" aria-label="Dispatch Event Simulation">
      <div className="dispatch-sim-head">
        <div className="sim-title-group">
          <div className="sim-icon-box">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="sim-heading">Dispatch Event Simulation</h3>
            <p className="sim-subtitle">Inject simulated rider events into the real-time event pipeline</p>
          </div>
        </div>

        {onResetEvents && (
          <button
            type="button"
            className="btn-sim-reset"
            onClick={onResetEvents}
            title="Reset telemetry feed"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="sim-event-list">
        {simulationOptions.map((opt) => (
          <button
            key={opt.type}
            type="button"
            className={`sim-event-row tint-${opt.tagColor}`}
            onClick={() => onTriggerEvent(opt)}
            title={`Inject ${opt.label}`}
          >
            <div className="sim-row-icon-wrap">
              {opt.icon}
            </div>

            <div className="sim-row-content">
              <span className="sim-row-title">{opt.label}</span>
              <span className="sim-row-desc">{opt.sampleDesc}</span>
            </div>

            <span className="sim-inject-pill">
              Inject →
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
