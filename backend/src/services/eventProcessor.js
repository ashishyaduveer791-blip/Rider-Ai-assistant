const { createEvent, EVENT_TYPES } = require('../models/event');

/**
 * Shared event processing logic used by both Socket.IO and REST handlers.
 *
 * Receives raw event data, creates a validated event, adds it to the queue,
 * evaluates it via AAS, updates queue state, and returns the decided event.
 *
 * This eliminates the duplicated event processing that was previously split
 * between server.js (Socket.IO handler) and eventRoutes.js (REST handler).
 */
function processEvent({ eventData, eventQueue, aas, getCurrentlySpeaking, setCurrentlySpeaking }) {
  const { type, source = 'system', content, id } = eventData;

  // Validation
  if (!type || !content) {
    const err = new Error('type and content are required');
    err.status = 400;
    throw err;
  }

  if (!Object.values(EVENT_TYPES).includes(type)) {
    const err = new Error(`Invalid event type. Must be one of: ${Object.values(EVENT_TYPES).join(', ')}`);
    err.status = 400;
    throw err;
  }

  // Create event
  const eventId = id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newEvent = createEvent({
    id: eventId,
    type,
    source,
    content,
  });

  eventQueue.add(newEvent);

  // AAS evaluation
  const currentlySpeaking = getCurrentlySpeaking();
  const decided = aas.evaluate(newEvent, {
    currentlySpeakingEvent: currentlySpeaking,
    eventQueue,
    attentionMode: 'NORMAL',
  });

  eventQueue.update(newEvent.id, {
    decision: decided.decision,
    reasonCode: decided.reasonCode,
    status: decided.status,
  });

  if (decided.decision === 'SPEAK') {
    setCurrentlySpeaking(decided);
  }

  return decided;
}

module.exports = { processEvent };
