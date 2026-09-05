import { Mic, MicOff } from 'lucide-react'

export default function VoiceActivity({
  state = 'listening', // 'idle' | 'listening' | 'thinking' | 'speaking'
  transcript,
  duration,
}) {
  const isIdle = state === 'idle'
  const isSpeaking = state === 'speaking'
  const isThinking = state === 'thinking'
  const isListening = state === 'listening'

  // Formatted status label and display timer
  const statusLabel = isIdle
    ? 'Standby (Muted)'
    : isSpeaking
    ? 'Speaking'
    : isThinking
    ? 'Processing'
    : 'Listening'

  const displayDuration = duration || (isIdle ? '00:00' : isThinking ? '00:03' : isSpeaking ? '00:06' : '00:08')

  const displayTranscript =
    transcript ||
    (isIdle
      ? 'Assistant standing by • Passive route telemetry active'
      : isThinking
      ? 'Analyzing routing parameters & dispatch instructions...'
      : isSpeaking
      ? 'Relaying turn-by-turn bypass alert to rider headset.'
      : 'Customer is asking about gate access.')

  const statusColorClass = isIdle
    ? 'voice-status-idle'
    : isSpeaking
    ? 'voice-status-speaking'
    : isThinking
    ? 'voice-status-thinking'
    : 'voice-status-listening'

  return (
    <div className={`voice-activity-card compact-voice-card state-${state}`}>
      <div className="voice-card-head">
        <div className="voice-title-col">
          <div className="voice-icon-box">
            {isIdle ? <MicOff size={14} /> : <Mic size={14} />}
          </div>
          <span className="voice-heading">Voice Activity</span>
        </div>

        <div className={`voice-status-badge ${statusColorClass}`}>
          <span className={`voice-pulse-dot ${isIdle ? 'is-dormant-dot' : ''}`} />
          <span className="voice-status-text">{statusLabel}</span>
          <span className="voice-timer-text">{displayDuration}</span>
        </div>
      </div>

      {/* Synchronized Waveform */}
      <div className={`voice-waveform-compact ${isIdle ? 'is-dormant-wave' : ''}`} aria-label={`Audio waveform (${statusLabel})`}>
        <div className="waveform-bars-wrap compact-bars">
          <span className="wave-bar bar-1" />
          <span className="wave-bar bar-2" />
          <span className="wave-bar bar-3" />
          <span className="wave-bar bar-4" />
          <span className="wave-bar bar-5" />
          <span className="wave-bar bar-6" />
          <span className="wave-bar bar-7" />
          <span className="wave-bar bar-8" />
          <span className="wave-bar bar-9" />
          <span className="wave-bar bar-10" />
          <span className="wave-bar bar-11" />
          <span className="wave-bar bar-12" />
        </div>
      </div>

      {/* Transcript */}
      <div className="voice-transcript-compact">
        <p className="transcript-text">"{displayTranscript}"</p>
      </div>
    </div>
  )
}
