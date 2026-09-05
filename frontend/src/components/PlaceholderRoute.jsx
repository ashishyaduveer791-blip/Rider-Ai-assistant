import { ArrowLeft, Sparkles, Clock } from 'lucide-react'

export default function PlaceholderRoute({
  title = 'Module Coming Soon',
  description = 'This feature is currently in active development for Rider AI Assistant v2.5.',
  icon,
  onBackToDashboard,
}) {
  return (
    <div className="placeholder-route-container">
      <div className="placeholder-card">
        <div className="placeholder-icon-wrap">
          {icon || <Sparkles size={28} />}
        </div>

        <div className="placeholder-badge-row">
          <span className="placeholder-tag">ROADMAP v2.5</span>
          <span className="placeholder-status-pill">
            <Clock size={12} />
            <span>In Development</span>
          </span>
        </div>

        <h2 className="placeholder-title">{title}</h2>
        <p className="placeholder-desc">{description}</p>

        <div className="placeholder-action-row">
          <button
            type="button"
            className="btn-placeholder-back"
            onClick={onBackToDashboard}
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}
