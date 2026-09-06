import {
  Zap,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Inbox,
  Clock,
  Radio,
  PauseCircle,
  GitMerge,
  XCircle,
} from 'lucide-react'

// Decision configuration helper for AAS outputs
const getDecisionMeta = (decisionType) => {
  switch (decisionType) {
    case 'SPEAK':
      return {
        label: 'SPEAK',
        className: 'decision-tag-speak',
        icon: <Radio size={12} className="tag-icon-pulse" />,
        color: '#10b981',
      }
    case 'WAIT':
      return {
        label: 'WAIT',
        className: 'decision-tag-wait',
        icon: <PauseCircle size={12} />,
        color: '#f59e0b',
      }
    case 'MERGE':
      return {
        label: 'MERGE',
        className: 'decision-tag-merge',
        icon: <GitMerge size={12} />,
        color: '#6366f1',
      }
    case 'DROP':
      return {
        label: 'DROP',
        className: 'decision-tag-drop',
        icon: <XCircle size={12} />,
        color: '#f43f5e',
      }
    default:
      return null
  }
}

export default function AIDecisionCard({
  decision = {
    trigger: 'Traffic bottleneck detected near Nanda Ki Chowki',
    response: 'Switching route to Bidholi Road via Sudhowala bypass to save 5 minutes.',
    action: 'Turn-by-turn route automatically updated in Rider HUD',
    decision: 'SPEAK',
    reasonCode: 'CRITICAL_SAFETY',
    timestamp: 'Just now',
    confidence: 'High Confidence',
  },
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to evaluate AI decision rules for incoming telemetry.',
  onRetry,
}) {
  const decisionType = decision?.decision?.toUpperCase()
  const decisionMeta = decisionType ? getDecisionMeta(decisionType) : null
  const triggerText = decision?.trigger || decision?.content || decision?.label
  const reasonCode = decision?.reasonCode

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
              <span className="decision-super-heading">RIDER AI ARBITRATION</span>
              
              {/* AAS Decision Tag (SPEAK / WAIT / MERGE / DROP) */}
              {decisionMeta && (
                <span className={`decision-aas-pill ${decisionMeta.className}`}>
                  {decisionMeta.icon}
                  <span>{decisionMeta.label}</span>
                </span>
              )}

              {/* Reason Code Pill */}
              {reasonCode && (
                <span className="decision-reason-pill" title={`Reason code: ${reasonCode}`}>
                  {reasonCode.replace(/_/g, ' ')}
                </span>
              )}

              {!isLoading && !isError && decision && !decisionMeta && (
                <span className="decision-confidence-badge">
                  <ShieldCheck size={12} className="confidence-icon" />
                  <span>{decision.confidence || 'High Confidence'}</span>
                </span>
              )}
            </div>
            <h4 className="decision-card-heading">
              {decisionType ? `AAS Decision: ${decisionType}` : 'Latest AI Decision'}
            </h4>
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
          <p className="decision-loading-text">AAS evaluating safety, DND, and event priority...</p>
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
      {!isLoading && !isError && (!decision || !triggerText) && (
        <div className="decision-empty-state">
          <div className="empty-state-icon">
            <Inbox size={24} />
          </div>
          <h5 className="empty-state-title">No AI Decisions Yet</h5>
          <p className="empty-state-desc">
            The Rider AI Arbitration System (AAS) actively scores incoming events to deliver optimal, safety-first decisions.
          </p>
        </div>
      )}

      {/* 3-Stage Event -> AI -> Action Flow */}
      {!isLoading && !isError && decision && triggerText && (
        <div className="decision-workflow-container">
          {/* Stage 1: Trigger Event */}
          <div className="workflow-stage stage-trigger">
            <div className="stage-header">
              <span className="stage-step-tag">1</span>
              <span className="stage-label">Trigger Event</span>
              {decision.type && (
                <span className="stage-type-subtag">{decision.type}</span>
              )}
            </div>
            <div className="stage-content">
              <p className="trigger-text">"{triggerText}"</p>
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
              <span className="stage-label violet-label">AAS Arbitration & AI Response</span>
              {decision.basePriority && (
                <span className="stage-priority-subtag">
                  Priority: {decision.basePriority}
                </span>
              )}
            </div>
            <div className="stage-content">
              <p className="ai-response-quote">
                "{decision.response || (
                  decision.decision === 'SPEAK'
                    ? 'AAS evaluated CRITICAL_SAFETY / HIGH_URGENCY. Speaking alert to rider immediately.'
                    : decision.decision === 'WAIT'
                    ? 'Another event is currently playing or higher priority is active. Placed in EventQueue.'
                    : decision.decision === 'MERGE'
                    ? 'Merged into current route navigation message to minimize rider distractions.'
                    : 'Suppressed per AAS attention management rules.'
                )}"
              </p>
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
              <p className="action-taken-text">
                {decision.action || (
                  decision.decision === 'SPEAK'
                    ? `Audio bridge active • Spoken alert relayed to rider headset (${reasonCode || 'SPEAK'})`
                    : decision.decision === 'WAIT'
                    ? `Buffered in dispatch queue (${reasonCode || 'WAIT'})`
                    : decision.decision === 'MERGE'
                    ? `Combined with existing telemetry instructions (${reasonCode || 'MERGE'})`
                    : `Event discarded (${reasonCode || 'DROP'})`
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
