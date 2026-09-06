
// Shared Event Model — must match docs/EVENT_CONTRACT.md exactly

const EVENT_TYPES = {
  NAVIGATION: 'NAVIGATION',
  CUSTOMER_MESSAGE: 'CUSTOMER_MESSAGE',
  CUSTOMER_CALL: 'CUSTOMER_CALL',
  OTP: 'OTP',
  MANAGER_MESSAGE: 'MANAGER_MESSAGE',
  RIDER_VOICE: 'RIDER_VOICE',
  SAFETY_ALERT: 'SAFETY_ALERT',
};

const EVENT_STATUS = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  EVALUATED: 'EVALUATED',
  DELIVERED: 'DELIVERED',
  WAITING: 'WAITING',
  MERGED: 'MERGED',
  DROPPED: 'DROPPED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
};

const AAS_DECISION = {
  SPEAK: 'SPEAK',
  WAIT: 'WAIT',
  MERGE: 'MERGE',
  DROP: 'DROP',
};

const REASON_CODE = {
  CRITICAL_SAFETY: 'CRITICAL_SAFETY',
  HIGH_URGENCY: 'HIGH_URGENCY',
  USER_BUSY: 'USER_BUSY',
  LOW_PRIORITY: 'LOW_PRIORITY',
  DUPLICATE_CONTENT: 'DUPLICATE_CONTENT',
  CONTEXT_MERGE: 'CONTEXT_MERGE',
  RATE_LIMIT: 'RATE_LIMIT',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE',
  EXPIRED_TTL: 'EXPIRED_TTL',
  DEFAULT: 'DEFAULT',
};

const DEFAULT_BASE_PRIORITY = {
  [EVENT_TYPES.SAFETY_ALERT]: 100,
  [EVENT_TYPES.OTP]: 90,
  [EVENT_TYPES.CUSTOMER_CALL]: 85,
  [EVENT_TYPES.RIDER_VOICE]: 80,
  [EVENT_TYPES.NAVIGATION]: 75,
  [EVENT_TYPES.CUSTOMER_MESSAGE]: 70,
  [EVENT_TYPES.MANAGER_MESSAGE]: 60,
};

// Creates a valid, correctly-shaped event object.
// Only id, type, source, and content need to be passed in manually.
function createEvent({ id, type, source, content }) {
  if (!Object.values(EVENT_TYPES).includes(type)) {
    throw new Error(`Invalid event type: ${type}`);
  }

  return {
    id,
    type,
    source,
    content,
    basePriority: DEFAULT_BASE_PRIORITY[type],
    semanticPriority: null,
    timestamp: Date.now(),
    status: EVENT_STATUS.PENDING,
    decision: null,
    reasonCode: null,
  };
}

module.exports = {
  EVENT_TYPES,
  EVENT_STATUS,
  AAS_DECISION,
  REASON_CODE,
  DEFAULT_BASE_PRIORITY,
  createEvent,
};