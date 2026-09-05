import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import AIGlobe from './AIGlobe'
import VoiceActivity from './VoiceActivity'

const CYCLE_SEQUENCE = [
  { state: 'listening', duration: 4500, label: 'Listening', subtext: 'Ready to help • Headset active' },
  { state: 'thinking',  duration: 3500, label: 'Thinking',  subtext: 'Processing event & routing rules...' },
  { state: 'speaking',  duration: 4500, label: 'Speaking',  subtext: 'Relaying audio response to rider...' },
  { state: 'idle',      duration: 3500, label: 'Idle',      subtext: 'Standing by • Passive route monitoring' },
]

export default function AssistantStatus({
  currentState: externalState,
  onStateChange,
  voiceTranscript,
  voiceDuration,
}) {
  const [internalState, setInternalState] = useState(externalState || 'listening')
  const cycleIndexRef = useRef(0)
  const timerRef = useRef(null)

  // Sync if external state changes from simulation controls
  useEffect(() => {
    if (externalState && externalState !== internalState) {
      setInternalState(externalState)
      const matchedIdx = CYCLE_SEQUENCE.findIndex((item) => item.state === externalState)
      if (matchedIdx !== -1) {
        cycleIndexRef.current = matchedIdx
      }
    }
  }, [externalState])

  // Automatic state progression: Listening → Thinking → Speaking → Idle → repeat
  useEffect(() => {
    const currentStep = CYCLE_SEQUENCE.find((item) => item.state === internalState) || CYCLE_SEQUENCE[0]

    timerRef.current = setTimeout(() => {
      const nextIdx = (cycleIndexRef.current + 1) % CYCLE_SEQUENCE.length
      cycleIndexRef.current = nextIdx
      const nextStep = CYCLE_SEQUENCE[nextIdx]
      setInternalState(nextStep.state)

      if (onStateChange) {
        onStateChange(nextStep.state)
      }
    }, currentStep.duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [internalState, onStateChange])

  // State presentation metadata
  const stateMeta = {
    listening: {
      label: 'Listening',
      subtext: 'Ready to help • Headset active',
      badgeClass: 'badge-blue',
      colorClass: 'state-listening',
    },
    thinking: {
      label: 'Thinking',
      subtext: 'Processing event & routing rules...',
      badgeClass: 'badge-indigo',
      colorClass: 'state-thinking',
    },
    speaking: {
      label: 'Speaking',
      subtext: 'Relaying audio response to rider...',
      badgeClass: 'badge-green',
      colorClass: 'state-speaking',
    },
    idle: {
      label: 'Idle',
      subtext: 'Standing by • Passive route monitoring',
      badgeClass: 'badge-gray',
      colorClass: 'state-idle',
    },
  }

  const current = stateMeta[internalState] || stateMeta.listening

  return (
    <div className={`assistant-status-card unified-assistant-widget ${current.colorClass}`}>
      <div className="assistant-card-head">
        <div className="head-brand">
          <div className="ai-sparkle-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="ai-card-title">Rider AI Assistant</h3>
            <span className="ai-model-tag">Assistant v2.4 Active</span>
          </div>
        </div>

        {/* State Pill - Single Source of Truth */}
        <div className={`state-badge-pill ${current.badgeClass}`}>
          <span className="state-pulse-pip" />
          <span className="state-pill-text">{current.label}</span>
        </div>
      </div>

      {/* Central Visualizer: Futuristic Glowing AI Globe */}
      <div className="ai-orb-container" aria-label={`AI visualizer (${current.label})`}>
        <AIGlobe state={internalState} />

        {/* State Description */}
        <div className="ai-state-caption-wrap">
          <span className="ai-current-label">● {current.label}</span>
          <p className="ai-current-subtext">{current.subtext}</p>
        </div>
      </div>

      {/* Unified Voice Activity Channel (Driven strictly by the exact same assistant state) */}
      <div className="unified-voice-wrapper">
        <VoiceActivity
          state={internalState}
          transcript={voiceTranscript}
          duration={voiceDuration}
        />
      </div>
    </div>
  )
}
