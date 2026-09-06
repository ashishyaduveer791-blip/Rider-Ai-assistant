import { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import ttsService from '../libs/tts'

export default function VoiceActivity({
  state = 'listening', // 'idle' | 'listening' | 'thinking' | 'speaking'
  transcript,
  duration,
}) {
  const isIdle = state === 'idle'
  const isSpeaking = state === 'speaking'
  const isThinking = state === 'thinking'
  const isListening = state === 'listening'

  const [isMuted, setIsMuted] = useState(ttsService.isMuted())

  useEffect(() => {
    const handleMuteChange = (e) => {
      setIsMuted(e.detail.isMuted)
    }
    window.addEventListener('rider-tts-mute-change', handleMuteChange)
    return () => window.removeEventListener('rider-tts-mute-change', handleMuteChange)
  }, [])

  const handleToggleMute = () => {
    const nextMuted = ttsService.toggleMute()
    setIsMuted(nextMuted)
  }

  // Formatted status label and display timer
  const statusLabel = isIdle
    ? 'Standby (Muted)'
    : isSpeaking
    ? 'Speaking'
    : isThinking
    ? 'Processing'
    : 'Listening'

  const displayDuration = duration || (isIdle ? '00:00' : isThinking ? '00:03' : isSpeaking ? '00:05' : '00:08')

  const displayTranscript =
    transcript ||
    (isIdle
      ? 'Assistant standing by • Passive route telemetry active'
      : isThinking
      ? 'Analyzing routing parameters & dispatch instructions...'
      : isSpeaking
      ? 'Relaying audio response to rider headset.'
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

        <div className="voice-controls-right">
          {/* Audio TTS Mute/Unmute Toggle */}
          <button
            type="button"
            className={`voice-tts-toggle-btn ${isMuted ? 'is-muted' : 'is-active'}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Speech Audio is Muted • Click to un-mute TTS' : 'Speech Audio Active • Click to mute'}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          <div className={`voice-status-badge ${statusColorClass}`}>
            <span className={`voice-pulse-dot ${isIdle ? 'is-dormant-dot' : ''}`} />
            <span className="voice-status-text">{statusLabel}</span>
            <span className="voice-timer-text">{displayDuration}</span>
          </div>
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
