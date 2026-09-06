import {
  MapPin,
  MessageSquare,
  Phone,
  Key,
  Megaphone,
  AlertTriangle,
  Clock,
  Inbox,
  RotateCcw,
} from 'lucide-react'

// Icon resolver matching sidebar aesthetic exactly
const getEventIcon = (type) => {
  const normType = String(type || '').toLowerCase()
  if (normType.includes('safety')) return <AlertTriangle size={15} />
  if (normType.includes('nav')) return <MapPin size={15} />
  if (normType.includes('call')) return <Phone size={15} />
  if (normType.includes('otp')) return <Key size={15} />
  if (normType.includes('manager')) return <Megaphone size={15} />
  return <MessageSquare size={15} />
}

export default function LiveEventFeed({
  events = [],
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to connect to real-time dispatch telemetry stream.',
  onRetry,
}) {
  return (
    <div className="live-event-card">
      <div className="live-event-head">
        <div className="feed-title-col">
          <div className="feed-header-left">
            <h3 className="feed-title">Live Events & Queue</h3>
            <span className="feed-count-pill">
              {isLoading ? 'Syncing...' : isError ? 'Offline' : `${events.length} Events`}
            </span>
          </div>
          <p className="feed-subtitle">Real-time delivery telemetry evaluated by AAS Engine</p>
        </div>
      </div>

      {/* Events Timeline Container */}
      <div className="events-timeline-container">
        {/* Loading State */}
        {isLoading && (
          <div className="events-loading-state" aria-live="polite">
            <div className="events-skeleton-list">
              {[1, 2, 3].map((n) => (
                <div key={n} className="event-skeleton-item">
                  <div className="skeleton-icon-circle" />
                  <div className="skeleton-lines-wrap">
                    <div className="skeleton-line-top" />
                    <div className="skeleton-line-sub" />
                  </div>
                </div>
              ))}
            </div>
            <p className="events-loading-text">Listening for incoming delivery telemetry...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="events-error-state" role="alert">
            <div className="error-state-icon">
              <AlertTriangle size={26} />
            </div>
            <h4 className="error-state-title">Telemetry Stream Error</h4>
            <p className="error-state-desc">{errorMessage}</p>
            {onRetry && (
              <button type="button" className="btn-error-retry" onClick={onRetry}>
                <RotateCcw size={13} />
                <span>Reconnect Feed</span>
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && events.length === 0 && (
          <div className="events-empty-state">
            <div className="empty-state-icon">
              <Inbox size={28} />
            </div>
            <h4 className="empty-state-title">No events yet</h4>
            <p className="empty-state-desc">
              Events from the rider system will appear here as orders progress.
            </p>
          </div>
        )}

        {/* Chronological List */}
        {!isLoading && !isError && events.length > 0 && (
          <ul className="events-timeline-list" aria-label="Chronological events">
            {events.map((evt, idx) => {
              const decisionClass = evt.decision ? `feed-decision-${evt.decision.toLowerCase()}` : ''
              return (
                <li key={evt.id || idx} className={`event-timeline-item ${evt.isNew ? 'is-new-anim' : ''}`}>
                  <div className="timeline-connector-col">
                    <div className={`event-badge-icon tint-${evt.tagColor || 'blue'}`}>
                      {getEventIcon(evt.type)}
                    </div>
                    {idx < events.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="event-content-bubble">
                    <div className="event-content-top">
                      <div className="event-title-badge-group">
                        <span className="event-category-name">{evt.title}</span>
                        {evt.decision && (
                          <span className={`feed-decision-pill ${decisionClass}`} title={`AAS Decision: ${evt.decision}`}>
                            {evt.decision}
                          </span>
                        )}
                        {evt.basePriority !== undefined && (
                          <span className="feed-priority-pill" title={`Base priority score: ${evt.basePriority}`}>
                            P:{evt.basePriority}
                          </span>
                        )}
                      </div>
                      <span className="event-time-badge">
                        <Clock size={12} />
                        <span>{evt.timestamp}</span>
                      </span>
                    </div>
                    <p className="event-description">{evt.description}</p>
                    {evt.reasonCode && (
                      <div className="event-meta-footer">
                        <span className="event-reason-tag">Rule: {evt.reasonCode}</span>
                        {evt.status && <span className="event-status-tag">Status: {evt.status}</span>}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
