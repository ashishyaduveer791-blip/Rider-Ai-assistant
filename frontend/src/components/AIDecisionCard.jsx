import {
  Zap,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Inbox,
} from 'lucide-react'

export default function AIDecisionCard({
  decision = {
    trigger: 'Traffic bottleneck detected on Outer Ring Rd',
    response: 'Switching route to Sector 14 Link via flyover to save 4 minutes.',
    action: 'Turn-by-turn route automatically updated in Rider HUD',
    timestamp: 'Just now',
    confidence: 'High Confidence',
  },
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to evaluate AI decision rules for incoming telemetry.',
  onRetry,
}) {
  return (
    <div className="ai-decision-card hero-ai-feature">
      {/* Header */}
      <div className="decision-card-head">
        <div className="decision-title-group">
          <div className="decision-icon-chip">
            <Zap size={16} />
          </div>
          <div>
            <div className="decision-badge-row">
              <span className="decision-super-heading">RIDER AI ASSISTANT</span>
              {!isLoading && !isError && decision && (
                <span className="decision-confidence-badge">
                  <ShieldCheck size={12} className="confidence-icon" />
                  <span>{decision.confidence || 'High Confidence'}</span>
                </span>
              )}
            </div>
            <h4 className="decision-card-heading">Latest AI Decision</h4>
          </div>
        </div>
        <span className="decision-timestamp">
          {isLoading ? 'Processing...' : isError ? 'Error' : decision?.timestamp || 'Just now'}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="decision-loading-state" aria-live="polite">
          <div className="decision-skeleton-pulse">
            <div className="skeleton-bar skeleton-title" />
            <div className="skeleton-bar skeleton-quote" />
            <div className="skeleton-bar skeleton-action" />
          </div>
          <p className="decision-loading-text">Analyzing telemetry & formulating optimal routing...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="decision-error-state" role="alert">
          <div className="error-state-icon">
            <AlertTriangle size={24} />
          </div>
          <h5 className="error-state-title">AI Decision Unavailable</h5>
          <p className="error-state-desc">{errorMessage}</p>
          {onRetry && (
            <button type="button" className="btn-error-retry" onClick={onRetry}>
              <RotateCcw size={13} />
              <span>Retry Decision Analysis</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!decision || !decision.trigger) && (
        <div className="decision-empty-state">
          <div className="empty-state-icon">
            <Inbox size={24} />
          </div>
          <h5 className="empty-state-title">No AI Decisions Yet</h5>
          <p className="empty-state-desc">
            The Rider AI Assistant actively evaluates incoming delivery events and route conditions to provide autonomous decisions.
          </p>
        </div>
      )}

      {/* 3-Stage Event -> AI -> Action Flow */}
      {!isLoading && !isError && decision && decision.trigger && (
        <div className="decision-workflow-container">
          {/* Stage 1: Trigger Event */}
          <div className="workflow-stage stage-trigger">
            <div className="stage-header">
              <span className="stage-step-tag">1</span>
              <span className="stage-label">Trigger Event</span>
            </div>
            <div className="stage-content">
              <p className="trigger-text">"{decision.trigger}"</p>
            </div>
          </div>

          {/* Subtle Step Divider / Connector */}
          <div className="workflow-connector">
            <div className="connector-line" />
            <ArrowDown size={12} className="connector-arrow" />
            <div className="connector-line" />
          </div>

          {/* Stage 2: AI Response Generated (Violet/Indigo Accent) */}
          <div className="workflow-stage stage-ai-response">
            <div className="stage-header">
              <span className="stage-step-tag tag-violet">
                <Sparkles size={11} />
              </span>
              <span className="stage-label violet-label">AI Response Generated</span>
            </div>
            <div className="stage-content">
              <p className="ai-response-quote">"{decision.response}"</p>
            </div>
          </div>

          {/* Subtle Step Divider / Connector */}
          <div className="workflow-connector">
            <div className="connector-line" />
            <ArrowDown size={12} className="connector-arrow" />
            <div className="connector-line" />
          </div>

          {/* Stage 3: Action Taken (Green Success Accent) */}
          <div className="workflow-stage stage-action-taken">
            <div className="stage-header">
              <span className="stage-step-tag tag-green">
                <CheckCircle2 size={12} />
              </span>
              <span className="stage-label green-label">Action Taken</span>
            </div>
            <div className="stage-content">
              <p className="action-taken-text">{decision.action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
