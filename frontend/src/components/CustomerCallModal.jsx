import { useState, useEffect, useRef } from 'react'
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  Shield,
  MessageSquare,
  Sparkles,
  Smartphone,
} from 'lucide-react'

export default function CustomerCallModal({
  isOpen,
  onClose,
  customerName = 'Rahul Sharma',
  customerPhone = '+91 98765 43210',
  destinationAddress = 'Hostel Block B, UPES Bidholi Campus, Dehradun',
  onCallCompleted,
}) {
  const [callState, setCallState] = useState('ringing') // 'ringing' | 'connected' | 'ended'
  const [callSeconds, setCallSeconds] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(true)

  const timerRef = useRef(null)

  // Call connection lifecycle
  useEffect(() => {
    if (!isOpen) {
      setCallState('ringing')
      setCallSeconds(0)
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    // Auto-connect after 2.2 seconds of ringing
    const connectTimer = setTimeout(() => {
      setCallState('connected')
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1)
      }, 1000)
    }, 2200)

    return () => {
      clearTimeout(connectTimer)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatCallTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = () => {
    setCallState('ended')
    if (timerRef.current) clearInterval(timerRef.current)

    if (onCallCompleted) {
      onCallCompleted(
        `Call with ${customerName} (${formatCallTime(callSeconds)}) • Customer confirmed waiting at Hostel B entrance`
      )
    }

    setTimeout(() => {
      onClose()
    }, 1200)
  }

  return (
    <div className="call-modal-backdrop" onClick={handleEndCall} role="dialog" aria-modal="true">
      <div className="call-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Call Header */}
        <div className="call-card-top">
          <div className="call-avatar-ring">
            <div className={`avatar-pulse-circle ${callState === 'ringing' ? 'is-ringing' : ''}`} />
            <div className="avatar-core-icon">
              <User size={36} />
            </div>
          </div>

          <h3 className="call-customer-name">{customerName}</h3>
          <p className="call-customer-phone">{customerPhone}</p>
          <span className="call-customer-loc">{destinationAddress}</span>

          <div className={`call-status-pill ${callState}`}>
            {callState === 'ringing' && <span className="calling-dot" />}
            <span>
              {callState === 'ringing'
                ? 'Ringing...'
                : callState === 'connected'
                ? `Connected • ${formatCallTime(callSeconds)}`
                : 'Call Ended'}
            </span>
          </div>
        </div>

        {/* Live Conversation & AI Transcribing Bubble */}
        {callState === 'connected' && (
          <div className="call-live-dialogue-pane">
            <div className="customer-speech-bubble">
              <div className="speech-sender-tag">
                <MessageSquare size={12} />
                <span>Rahul Sharma</span>
              </div>
              <p className="speech-text">
                "Hey! I'm waiting outside Hostel Block B near the cafeteria. You can just hand the package to me or tell the guard you're for Rahul!"
              </p>
            </div>

            <div className="ai-call-copilot-tag">
              <Sparkles size={13} className="ai-spark-icon" />
              <span>AI Summary: Hand delivery at Hostel B cafeteria entrance.</span>
            </div>
          </div>
        )}

        {/* Call In-Progress Animated Waveform */}
        {callState === 'connected' && (
          <div className="call-audio-visualizer">
            <span className="call-bar bar-1" />
            <span className="call-bar bar-2" />
            <span className="call-bar bar-3" />
            <span className="call-bar bar-4" />
            <span className="call-bar bar-5" />
            <span className="call-bar bar-6" />
            <span className="call-bar bar-7" />
          </div>
        )}

        {/* Call Control Action Buttons */}
        <div className="call-action-grid">
          {/* Mute Button */}
          <button
            type="button"
            className={`call-circle-btn ${isMuted ? 'is-active-red' : ''}`}
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            className="call-circle-btn end-call-btn"
            onClick={handleEndCall}
            title="End Call"
          >
            <PhoneOff size={24} />
            <span>End Call</span>
          </button>

          {/* Speaker Button */}
          <button
            type="button"
            className={`call-circle-btn ${isSpeaker ? 'is-active-blue' : ''}`}
            onClick={() => setIsSpeaker((prev) => !prev)}
            title={isSpeaker ? 'Turn off speaker' : 'Turn on speaker'}
          >
            {isSpeaker ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span>{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
          </button>
        </div>

        {/* Quick Native Phone Link for Real Mobile Devices */}
        <div className="call-native-dial-footer">
          <a
            href={`tel:${customerPhone.replace(/\s+/g, '')}`}
            className="native-dial-link"
          >
            <Smartphone size={13} />
            <span>Launch Device Phone App ({customerPhone})</span>
          </a>
        </div>
      </div>
    </div>
  )
}
