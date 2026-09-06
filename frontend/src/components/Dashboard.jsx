import { useState, useEffect, useRef, useCallback } from 'react'
import DashboardHeader from './DashboardHeader'
import OverviewStats from './OverviewStats'
import CurrentDeliveryCard from './CurrentDeliveryCard'
import AssistantStatus from './AssistantStatus'
import AIDecisionCard from './AIDecisionCard'
import LiveEventFeed from './LiveEventFeed'
import TestEventPanel from './TestEventPanel'
import { getRecentTimeString } from '../utils/time'
import { socket, API_BASE_URL } from '../libs/socket'
import ttsService from '../libs/tts'
import './Dashboard.css'

// Initial seed events with chronologically sequential, recent timestamps
const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    type: 'nav-event',
    rawType: 'NAVIGATION',
    title: 'Navigation Event',
    description: 'Route recalculated • Avoiding Nanda Ki Chowki congestion towards UPES',
    timestamp: getRecentTimeString(3),
    tagColor: 'teal',
    decision: 'SPEAK',
    reasonCode: 'CRITICAL_SAFETY',
    basePriority: 75,
    status: 'DELIVERED',
  },
  {
    id: 'evt-2',
    type: 'customer-msg',
    rawType: 'CUSTOMER_MESSAGE',
    title: 'Customer Message',
    description: 'Customer: "Please leave package at the front door"',
    timestamp: getRecentTimeString(8),
    tagColor: 'indigo',
    decision: 'WAIT',
    reasonCode: 'USER_BUSY',
    basePriority: 70,
    status: 'QUEUED',
  },
  {
    id: 'evt-3',
    type: 'otp-event',
    rawType: 'OTP',
    title: 'OTP Event',
    description: 'OTP verification required upon arrival',
    timestamp: getRecentTimeString(16),
    tagColor: 'amber',
    decision: 'SPEAK',
    reasonCode: 'HIGH_URGENCY',
    basePriority: 90,
    status: 'DELIVERED',
  },
  {
    id: 'evt-4',
    type: 'manager-msg',
    rawType: 'MANAGER_MESSAGE',
    title: 'Manager Message',
    description: 'New delivery instruction received from Prem Nagar Hub 03',
    timestamp: getRecentTimeString(25),
    tagColor: 'rose',
    decision: 'MERGE',
    reasonCode: 'CONTEXT_MERGE',
    basePriority: 60,
    status: 'MERGED',
  },
]

const TYPE_CONFIG = {
  SAFETY_ALERT: { title: 'Safety Alert', tagColor: 'rose', iconType: 'safety-alert' },
  NAVIGATION: { title: 'Navigation Event', tagColor: 'teal', iconType: 'nav-event' },
  CUSTOMER_MESSAGE: { title: 'Customer Message', tagColor: 'indigo', iconType: 'customer-msg' },
  CUSTOMER_CALL: { title: 'Customer Call', tagColor: 'blue', iconType: 'customer-call' },
  OTP: { title: 'OTP Event', tagColor: 'amber', iconType: 'otp-event' },
  MANAGER_MESSAGE: { title: 'Manager Message', tagColor: 'rose', iconType: 'manager-msg' },
  RIDER_VOICE: { title: 'Rider Voice', tagColor: 'blue', iconType: 'rider-voice' },
}

function transformBackendEvent(beEvent) {
  if (!beEvent) return null
  const typeKey = String(beEvent.type || '').toUpperCase()
  const cfg = TYPE_CONFIG[typeKey] || {
    title: beEvent.type ? beEvent.type.replace(/_/g, ' ') : 'Event',
    tagColor: 'blue',
    iconType: 'customer-msg',
  }

  return {
    id: beEvent.id,
    type: cfg.iconType,
    rawType: beEvent.type,
    title: cfg.title,
    description: beEvent.content || `Telemetry event logged for ${cfg.title}`,
    timestamp: beEvent.timestamp
      ? getRecentTimeString(Math.max(0, Math.floor((Date.now() - beEvent.timestamp) / 60000)))
      : getRecentTimeString(0),
    tagColor: cfg.tagColor,
    decision: beEvent.decision,
    reasonCode: beEvent.reasonCode,
    basePriority: beEvent.basePriority,
    status: beEvent.status,
    isNew: true,
  }
}

export default function Dashboard({
  assistantState: sharedAssistantState,
  onAssistantStateChange: setSharedAssistantState,
  events: sharedEvents,
  onEventsChange: setSharedEvents,
  latestDecision: sharedDecision,
  onDecisionChange: setSharedDecision,
  feedUiState = 'normal',
  decisionUiState = 'normal',
  onNavigateToDev,
}) {
  // 1. Assistant State: Single source of truth driving globe, badge, and voice activity in lockstep
  const [localAssistantState, setLocalAssistantState] = useState('listening')
  const assistantState = sharedAssistantState !== undefined ? sharedAssistantState : localAssistantState
  const setAssistantState = setSharedAssistantState || setLocalAssistantState

  // 2. Metrics & Telemetry
  const [aiInteractions, setAiInteractions] = useState(27)
  const [activeDeliveries] = useState(3)

  // 3. Live Events List
  const [localEvents, setLocalEvents] = useState(INITIAL_EVENTS)
  const events = sharedEvents !== undefined ? sharedEvents : localEvents
  const setEvents = setSharedEvents || setLocalEvents

  // 4. Latest AI Decision
  const [localDecision, setLocalDecision] = useState({
    trigger: 'Traffic bottleneck detected near Nanda Ki Chowki',
    response: 'Switching route to Bidholi Road via Sudhowala bypass to save 5 minutes.',
    action: 'Turn-by-turn route automatically updated in Rider HUD',
    decision: 'SPEAK',
    reasonCode: 'CRITICAL_SAFETY',
    basePriority: 75,
    timestamp: 'Just now',
    confidence: 'AAS Priority 75',
  })
  const latestDecision = sharedDecision !== undefined ? sharedDecision : localDecision
  const setLatestDecision = setSharedDecision || setLocalDecision

  // 5. Connection and Voice Speaking State
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected)
  const [voiceTranscript, setVoiceTranscript] = useState(null)
  const [voiceDuration, setVoiceDuration] = useState(null)

  // Timers to handle multi-step state transitions without overlap
  const transitionTimers = useRef([])
  const speakingTimeoutRef = useRef(null)

  const clearTimers = useCallback(() => {
    transitionTimers.current.forEach((t) => clearTimeout(t))
    transitionTimers.current = []
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current)
      speakingTimeoutRef.current = null
    }
  }, [])

  // Fetch initial queue from backend REST API
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/queue`)
      if (!res.ok) return
      const data = await res.json()
      if (data && Array.isArray(data.events) && data.events.length > 0) {
        const transformed = data.events.map(transformBackendEvent).filter(Boolean)
        setEvents((prev) => {
          // Merge unique events preserving existing
          const existingIds = new Set(transformed.map((e) => e.id))
          const remainingPrev = prev.filter((p) => !existingIds.has(p.id))
          return [...transformed, ...remainingPrev]
        })
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch initial queue from backend:', err.message)
    }
  }, [setEvents])

  // Setup Socket.IO listeners
  useEffect(() => {
    // Check initial connection
    setIsSocketConnected(socket.connected)

    const onConnect = () => {
      console.log('[Socket.IO] Connected to backend cockpit server')
      setIsSocketConnected(true)
      fetchQueue()
    }

    const onDisconnect = () => {
      console.log('[Socket.IO] Disconnected from backend')
      setIsSocketConnected(false)
    }

    const onEventEvaluated = (data) => {
      console.log('[Socket.IO] event-evaluated received:', data)
      if (!data || !data.event) return

      const beEvent = data.event
      const uiEvent = transformBackendEvent(beEvent)
      if (!uiEvent) return

      // Prepend or update in events list
      setEvents((prev) => {
        const index = prev.findIndex((e) => e.id === uiEvent.id)
        if (index !== -1) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...uiEvent }
          return updated
        }
        return [uiEvent, ...prev]
      })

      // Update Latest AI Decision Card
      const decisionType = beEvent.decision || 'SPEAK'
      const responseText =
        decisionType === 'SPEAK'
          ? `Spoken alert relayed to rider: "${beEvent.content}"`
          : decisionType === 'WAIT'
          ? `Queued in EventQueue until rider channel is clear.`
          : decisionType === 'MERGE'
          ? `Consolidated with existing active route update.`
          : `Suppressed per attention rules (${beEvent.reasonCode}).`

      const actionText =
        decisionType === 'SPEAK'
          ? `Active Audio Bridge (${beEvent.reasonCode || 'DELIVERED'})`
          : decisionType === 'WAIT'
          ? `Status: WAITING in queue (Base Priority: ${beEvent.basePriority})`
          : decisionType === 'MERGE'
          ? `Status: MERGED with active dispatch context`
          : `Status: DROPPED (${beEvent.reasonCode})`

      setLatestDecision({
        trigger: beEvent.content || uiEvent.title,
        response: responseText,
        action: actionText,
        decision: beEvent.decision,
        reasonCode: beEvent.reasonCode,
        basePriority: beEvent.basePriority,
        status: beEvent.status,
        timestamp: 'Just now',
        confidence: `AAS Priority ${beEvent.basePriority || 75}`,
      })

      setAiInteractions((count) => count + 1)
    }

    const onQueueUpdated = (data) => {
      console.log('[Socket.IO] queue-updated received:', data)
      if (data && Array.isArray(data.events)) {
        if (data.events.length === 0) {
          // Backend queue was cleared or reset
          setEvents(INITIAL_EVENTS)
          return
        }
        const transformed = data.events.map(transformBackendEvent).filter(Boolean)
        const backendIds = new Set(transformed.map((e) => e.id))
        const seedEvents = INITIAL_EVENTS.filter((e) => !backendIds.has(e.id))
        setEvents([...transformed, ...seedEvents])
      }
    }

    const onCurrentlySpeaking = (data) => {
      console.log('[Socket.IO] currently-speaking received:', data)
      if (data && data.event) {
        const beEvent = data.event
        // Formulate spoken prompt for rider headset
        let speechPrompt = beEvent.content || 'Priority alert received.'
        const typeUpper = String(beEvent.type || '').toUpperCase()

        if (typeUpper === 'SAFETY_ALERT') {
          speechPrompt = `Caution! Safety Alert. ${beEvent.content}`
        } else if (typeUpper === 'OTP') {
          speechPrompt = `Delivery verification. ${beEvent.content}`
        } else if (typeUpper === 'CUSTOMER_MESSAGE') {
          speechPrompt = `Customer message: ${beEvent.content}`
        } else if (typeUpper === 'CUSTOMER_CALL') {
          speechPrompt = `Incoming voice call from customer.`
        } else if (typeUpper === 'MANAGER_MESSAGE') {
          speechPrompt = `Dispatch notice: ${beEvent.content}`
        }

        setAssistantState('speaking')
        setVoiceTranscript(speechPrompt)
        setVoiceDuration('00:04')

        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current)
          speakingTimeoutRef.current = null
        }

        // Safety fallback timer in case browser speech gets stalled
        const safetyTimer = setTimeout(() => {
          console.log('[TTS] Safety timer expired, releasing speaker.')
          ttsService.cancel()
          socket.emit('speaking-complete')
          setAssistantState('listening')
          setVoiceTranscript(null)
          setVoiceDuration(null)
        }, 8500)
        speakingTimeoutRef.current = safetyTimer

        // Trigger real Web Speech API voice synthesis
        ttsService.speak(speechPrompt, {
          onStart: () => {
            setAssistantState('speaking')
            setVoiceTranscript(speechPrompt)
          },
          onEnd: () => {
            if (speakingTimeoutRef.current) {
              clearTimeout(speakingTimeoutRef.current)
              speakingTimeoutRef.current = null
            }
            console.log('[TTS] Speech finished. Emitting speaking-complete.')
            socket.emit('speaking-complete')
            setAssistantState('listening')
            setVoiceTranscript(null)
            setVoiceDuration(null)
          },
          onError: () => {
            if (speakingTimeoutRef.current) {
              clearTimeout(speakingTimeoutRef.current)
              speakingTimeoutRef.current = null
            }
            socket.emit('speaking-complete')
            setAssistantState('listening')
            setVoiceTranscript(null)
            setVoiceDuration(null)
          },
        })
      } else {
        ttsService.cancel()
        setAssistantState('listening')
        setVoiceTranscript(null)
        setVoiceDuration(null)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('event-evaluated', onEventEvaluated)
    socket.on('queue-updated', onQueueUpdated)
    socket.on('currently-speaking', onCurrentlySpeaking)

    // Initial fetch
    fetchQueue()

    return () => {
      ttsService.cancel()
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('event-evaluated', onEventEvaluated)
      socket.off('queue-updated', onQueueUpdated)
      socket.off('currently-speaking', onCurrentlySpeaking)
    }
  }, [fetchQueue, setAssistantState, setEvents, setLatestDecision])

  // Core handler when an event is triggered (from test panel or operational cards)
  const handleTriggerEvent = (opt) => {
    clearTimers()

    // Map UI types to Backend AAS Event Types
    const typeMap = {
      'safety-alert': 'SAFETY_ALERT',
      'nav-event': 'NAVIGATION',
      'customer-msg': 'CUSTOMER_MESSAGE',
      'customer-call': 'CUSTOMER_CALL',
      'otp-event': 'OTP',
      'manager-msg': 'MANAGER_MESSAGE',
      'rider-voice': 'RIDER_VOICE',
    }

    const resolvedType = typeMap[opt.type] || opt.type.toUpperCase()
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const content = opt.sampleDesc || opt.label || 'Rider cockpit event'

    // 1. Instantly show assistant thinking state
    setAssistantState('thinking')

    // Clean payload matching backend event contract (no label/tagColor — those are UI-only)
    const eventPayload = {
      id: eventId,
      type: resolvedType,
      source: 'rider-cockpit',
      content,
    }

    // 2. Transmit through Socket.IO (preferred) or REST fallback
    if (socket.connected) {
      console.log('[Dashboard] Emitting event via Socket.IO:', eventPayload)
      socket.emit('event', eventPayload)
    } else {
      console.warn('[Dashboard] Socket not connected, submitting via REST POST /api/events')
      fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((data) => {
          if (data && data.id) {
            const transformed = transformBackendEvent(data)
            if (transformed) {
              setEvents((prev) => [transformed, ...prev])
            }
          }
        })
        .catch((err) => {
          console.error('[Dashboard] REST fallback error:', err)
          setAssistantState('listening')
        })
    }
  }

  const handleResetEvents = () => {
    clearTimers()
    ttsService.cancel()

    // 1. Notify backend via Socket.IO and REST API to reset queue & speaker
    if (socket.connected) {
      socket.emit('reset-events')
    }
    fetch(`${API_BASE_URL}/api/events/reset`, { method: 'POST' }).catch((err) => {
      console.warn('[Dashboard] REST reset warning:', err.message)
    })

    // 2. Reset frontend state
    setEvents(INITIAL_EVENTS)
    setAssistantState('listening')
    setVoiceTranscript(null)
    setVoiceDuration(null)
    setAiInteractions(27)
    setLatestDecision({
      trigger: 'Traffic bottleneck detected near Nanda Ki Chowki',
      response: 'Switching route to Bidholi Road via Sudhowala bypass to save 5 minutes.',
      action: 'Turn-by-turn route automatically updated in Rider HUD',
      decision: 'SPEAK',
      reasonCode: 'CRITICAL_SAFETY',
      basePriority: 75,
      timestamp: 'Just now',
      confidence: 'AAS Priority 75',
    })
  }

  return (
    <div className="dashboard-container">
      {/* 1. Header with greeting, online pip, live clock, notifications & socket status */}
      <DashboardHeader
        assistantState={assistantState}
        isSocketConnected={isSocketConnected}
      />

      {/* 2. Today's Overview SaaS metrics cards */}
      <OverviewStats
        aiInteractions={aiInteractions}
        activeDeliveries={activeDeliveries}
      />

      {/* 3. Main Operational & AI Grid */}
      <main className="dashboard-content-grid">
        {/* Left Column: Operations & Delivery */}
        <section className="dashboard-col-left" aria-label="Current Delivery & Telemetry">
          {/* Primary Operational Star: Current Delivery Card */}
          <CurrentDeliveryCard
            onSimulateNav={() =>
              handleTriggerEvent({
                type: 'nav-event',
                label: 'Navigation Event',
                tagColor: 'teal',
                sampleDesc: 'Route recalculated • Avoiding Nanda Ki Chowki congestion towards UPES',
              })
            }
            onCallEvent={(detail) =>
              handleTriggerEvent({
                type: 'customer-call',
                label: 'Customer Call',
                tagColor: 'blue',
                sampleDesc: detail,
              })
            }
            onDeliveryEvent={(detail) =>
              handleTriggerEvent({
                type: 'otp-event',
                label: 'Order Delivered',
                tagColor: 'amber',
                sampleDesc: detail,
              })
            }
          />

          {/* Live Events Timeline Feed with Empty, Loading, and Error state support */}
          <LiveEventFeed
            events={feedUiState === 'empty' ? [] : events}
            isLoading={feedUiState === 'loading'}
            isError={feedUiState === 'error'}
            onRetry={fetchQueue}
          />
        </section>

        {/* Right Column: AI Assistant, Hero Decision & Event Simulation stuck in empty space */}
        <section className="dashboard-col-right" aria-label="AI Assistant & Controls">
          {/* 1. Unified Assistant Widget (Includes AI Globe & Synchronized Voice Activity) */}
          <AssistantStatus
            currentState={assistantState}
            onStateChange={(newState) => {
              clearTimers()
              setAssistantState(newState)
            }}
            voiceTranscript={voiceTranscript}
            voiceDuration={voiceDuration}
          />

          {/* 2. Hero Feature: Latest AI Decision (with Empty, Loading, and Error states) */}
          <AIDecisionCard
            decision={decisionUiState === 'empty' ? null : latestDecision}
            isLoading={decisionUiState === 'loading'}
            isError={decisionUiState === 'error'}
            onRetry={() => {
              setAssistantState('thinking')
              setTimeout(() => setAssistantState('listening'), 1200)
            }}
          />

          {/* 3. Dispatch Event Simulation Card (Stuck in the right space, matching Image 1) */}
          <TestEventPanel
            onTriggerEvent={handleTriggerEvent}
            onResetEvents={handleResetEvents}
          />
        </section>
      </main>
    </div>
  )
}
