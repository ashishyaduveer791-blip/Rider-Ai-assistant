import { useState, useRef } from 'react'
import DashboardHeader from './DashboardHeader'
import OverviewStats from './OverviewStats'
import CurrentDeliveryCard from './CurrentDeliveryCard'
import AssistantStatus from './AssistantStatus'
import AIDecisionCard from './AIDecisionCard'
import LiveEventFeed from './LiveEventFeed'
import TestEventPanel from './TestEventPanel'
import { getRecentTimeString } from '../utils/time'
import './Dashboard.css'

// Initial seed events with chronologically sequential, recent timestamps
const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    type: 'nav-event',
    title: 'Navigation Event',
    description: 'Route recalculated • Avoiding Nanda Ki Chowki congestion towards UPES',
    timestamp: getRecentTimeString(3),
    tagColor: 'teal',
  },
  {
    id: 'evt-2',
    type: 'customer-msg',
    title: 'Customer Message',
    description: 'Customer: "Please leave package at the front door"',
    timestamp: getRecentTimeString(8),
    tagColor: 'indigo',
  },
  {
    id: 'evt-3',
    type: 'otp-event',
    title: 'OTP Event',
    description: 'OTP verification required upon arrival',
    timestamp: getRecentTimeString(16),
    tagColor: 'amber',
  },
  {
    id: 'evt-4',
    type: 'manager-msg',
    title: 'Manager Message',
    description: 'New delivery instruction received from Prem Nagar Hub 03',
    timestamp: getRecentTimeString(25),
    tagColor: 'rose',
  },
]

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
    timestamp: 'Just now',
    confidence: 'High Confidence',
  })
  const latestDecision = sharedDecision !== undefined ? sharedDecision : localDecision
  const setLatestDecision = setSharedDecision || setLocalDecision

  // 5. Right Rail Tab State: 'assistant' | 'decisions'
  const [rightTab, setRightTab] = useState('assistant')

  // Timers to handle multi-step state transitions without overlap
  const transitionTimers = useRef([])

  const clearTimers = () => {
    transitionTimers.current.forEach((t) => clearTimeout(t))
    transitionTimers.current = []
  }

  // Core handler when a simulation event is triggered
  const handleTriggerEvent = (opt) => {
    clearTimers()

    const timeFormatted = getRecentTimeString(0)

    // 1. Build and prepend event to timeline
    const newEvent = {
      id: `evt-${Date.now()}`,
      type: opt.type,
      title: opt.label,
      description: opt.sampleDesc || `Simulation telemetry recorded for ${opt.label}`,
      timestamp: timeFormatted,
      tagColor: opt.tagColor || 'blue',
      isNew: true,
    }

    setEvents((prev) => [newEvent, ...prev])
    setAiInteractions((count) => count + 1)

    // 2. Formulate realistic AI Decision data based on event type
    let decisionPayload = {
      trigger: opt.label,
      response: 'Analyzing incoming telemetry and routing parameter changes.',
      action: 'Telemetry acknowledged by Rider AI assistant',
      timestamp: 'Just now',
      confidence: 'High Confidence',
    }

    if (opt.type === 'nav-event') {
      decisionPayload = {
        trigger: 'Traffic bottleneck detected near Nanda Ki Chowki',
        response: 'Switching route to Bidholi Road via Sudhowala bypass to save 5 minutes.',
        action: 'Turn-by-turn route automatically updated in Rider HUD',
        timestamp: 'Just now',
        confidence: 'High Confidence',
      }
    } else if (opt.type === 'customer-msg') {
      decisionPayload = {
        trigger: 'Customer message received: "Please leave package at front door"',
        response: 'Acknowledged. Marked drop-off location as contactless door delivery.',
        action: 'Order notes updated & customer auto-messaged confirmation',
        timestamp: 'Just now',
        confidence: 'High Confidence',
      }
    } else if (opt.type === 'customer-call') {
      decisionPayload = {
        trigger: 'Incoming voice call from customer Rahul Sharma',
        response: 'Noise cancellation enabled. Routing call directly to rider headset.',
        action: 'Hands-free voice bridge opened',
        timestamp: 'Just now',
        confidence: 'High Confidence',
      }
    } else if (opt.type === 'otp-event') {
      decisionPayload = {
        trigger: 'OTP verification protocol initiated for Order #RID-2048',
        response: 'Customer entered PIN 6821. Matching against cloud dispatch security hash.',
        action: 'Handshake approved • Delivery marked as eligible for completion',
        timestamp: 'Just now',
        confidence: 'High Confidence',
      }
    } else if (opt.type === 'manager-msg') {
      decisionPayload = {
        trigger: 'Dispatch manager broadcast: Peak surge incentive active',
        response: '+₹40 surge bonus added per order for the next 2 hours.',
        action: 'Earnings incentive ledger updated for current active shift',
        timestamp: 'Just now',
        confidence: 'High Confidence',
      }
    }

    setLatestDecision(decisionPayload)

    // 3. Multi-step Assistant State Simulation:
    // Step A: Assistant enters "Thinking"
    setAssistantState('thinking')

    // Step B: Transition to "Speaking" after 1.2 seconds
    const timer1 = setTimeout(() => {
      setAssistantState('speaking')
    }, 1200)

    // Step C: Transition to "Listening" after another 2.2 seconds
    const timer2 = setTimeout(() => {
      setAssistantState('listening')
    }, 3400)

    transitionTimers.current = [timer1, timer2]
  }

  const handleResetEvents = () => {
    clearTimers()
    setEvents(INITIAL_EVENTS)
    setAssistantState('listening')
    setAiInteractions(27)
    setLatestDecision({
      trigger: 'Traffic bottleneck detected near Nanda Ki Chowki',
      response: 'Switching route to Bidholi Road via Sudhowala bypass to save 5 minutes.',
      action: 'Turn-by-turn route automatically updated in Rider HUD',
      timestamp: 'Just now',
      confidence: 'High Confidence',
    })
  }

  return (
    <div className="dashboard-container">
      {/* 1. Header with greeting, online pip, live clock, notifications */}
      <DashboardHeader assistantState={assistantState} />

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
          />

          {/* 2. Hero Feature: Latest AI Decision (with Empty, Loading, and Error states) */}
          <AIDecisionCard
            decision={decisionUiState === 'empty' ? null : latestDecision}
            isLoading={decisionUiState === 'loading'}
            isError={decisionUiState === 'error'}
            onRetry={() => {
              setAssistantState('thinking')
              setTimeout(() => setAssistantState('listening'), 1500)
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
