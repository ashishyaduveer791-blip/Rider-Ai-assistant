const { EVENT_STATUS, AAS_DECISION, REASON_CODE, EVENT_TYPES } = require('../models/event');

const DROP_PRIORITY_THRESHOLD = 20;
const STALE_TTL_MS = 60000; // events older than 60 seconds are considered stale

// Same priority logic used by the EventQueue: prefer semanticPriority if set
function getEffectivePriority(event) {
  return event.semanticPriority !== null && event.semanticPriority !== undefined
    ? event.semanticPriority
    : event.basePriority;
}

class AAS {
  // Main entry point: given an event + context, returns the event
  // with decision, reasonCode, and status filled in.
  evaluate(event, context = {}) {
    const {
      currentlySpeakingEvent = null,
      eventQueue = null,
      attentionMode = 'NORMAL',
    } = context;

    const priority = getEffectivePriority(event);
    const now = Date.now();

    // Rule 1: Safety alerts always interrupt everything
    if (event.type === EVENT_TYPES.SAFETY_ALERT) {
      return this._decide(event, AAS_DECISION.SPEAK, REASON_CODE.CRITICAL_SAFETY);
    }

    // Rule 2: Do Not Disturb blocks everything except safety
    if (attentionMode === 'DO_NOT_DISTURB') {
      return this._decide(event, AAS_DECISION.WAIT, REASON_CODE.USER_BUSY);
    }

    // Rule 3: Expired events are dropped
    if (typeof event.timestamp === 'number' && now - event.timestamp > STALE_TTL_MS) {
      return this._decide(event, AAS_DECISION.DROP, REASON_CODE.EXPIRED_TTL);
    }

    // Rule 4: Merge with an existing related event already in the queue
    if (eventQueue && typeof eventQueue.getAll === 'function') {
      const existing = eventQueue.getAll().find(
        (e) =>
          e.id !== event.id &&
          e.type === event.type &&
          e.source === event.source &&
          (e.status === EVENT_STATUS.QUEUED || e.status === EVENT_STATUS.WAITING)
      );
      if (existing) {
        return this._decide(event, AAS_DECISION.MERGE, REASON_CODE.CONTEXT_MERGE);
      }
    }

    // Rule 5: Very low priority events are dropped
    if (priority < DROP_PRIORITY_THRESHOLD) {
      return this._decide(event, AAS_DECISION.DROP, REASON_CODE.LOW_PRIORITY);
    }

    // Rule 6: Nothing currently speaking -> speak now
    if (!currentlySpeakingEvent) {
      const reason = priority >= 90 ? REASON_CODE.HIGH_URGENCY : REASON_CODE.DEFAULT;
      return this._decide(event, AAS_DECISION.SPEAK, reason);
    }

    // Rule 7: Something is speaking -> only interrupt if strictly higher priority
    const speakingPriority = getEffectivePriority(currentlySpeakingEvent);
    if (priority > speakingPriority) {
      return this._decide(event, AAS_DECISION.SPEAK, REASON_CODE.HIGH_URGENCY);
    }

    return this._decide(event, AAS_DECISION.WAIT, REASON_CODE.USER_BUSY);
  }

  // Applies the decision onto a copy of the event (records decision + reasonCode + status)
  _decide(event, decision, reasonCode) {
    const statusMap = {
      [AAS_DECISION.SPEAK]: EVENT_STATUS.DELIVERED,
      [AAS_DECISION.WAIT]: EVENT_STATUS.WAITING,
      [AAS_DECISION.MERGE]: EVENT_STATUS.MERGED,
      [AAS_DECISION.DROP]: EVENT_STATUS.DROPPED,
    };

    return {
      ...event,
      decision,
      reasonCode,
      status: statusMap[decision] || EVENT_STATUS.EVALUATED,
    };
  }
}

module.exports = AAS;