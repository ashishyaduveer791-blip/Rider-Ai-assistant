const AAS = require('./aas');
const EventQueue = require('./eventQueue');

function makeEvent(id, type, basePriority, timestamp, overrides = {}) {
  return {
    id,
    type,
    source: overrides.source || 'test',
    content: `Test content for ${id}`,
    basePriority,
    semanticPriority: overrides.semanticPriority ?? null,
    timestamp,
    status: 'PENDING',
    decision: null,
    reasonCode: null,
  };
}

describe('AAS (Adaptive Attention Scheduler)', () => {
  test('every event receives a decision', () => {
    const aas = new AAS();
    const event = makeEvent('e1', 'NAVIGATION', 95, Date.now());
    const result = aas.evaluate(event, {});
    expect(result.decision).not.toBeNull();
    expect(result.reasonCode).not.toBeNull();
  });

  test('high-priority navigation speaks when nothing else is speaking', () => {
    const aas = new AAS();
    const nav = makeEvent('nav-1', 'NAVIGATION', 95, Date.now());
    const result = aas.evaluate(nav, { currentlySpeakingEvent: null });
    expect(result.decision).toBe('SPEAK');
  });

  test('lower-priority event waits while a higher-priority event is speaking', () => {
    const aas = new AAS();
    const nav = makeEvent('nav-1', 'NAVIGATION', 95, Date.now());
    const msg = makeEvent('msg-1', 'CUSTOMER_MESSAGE', 70, Date.now());

    const result = aas.evaluate(msg, { currentlySpeakingEvent: nav });
    expect(result.decision).toBe('WAIT');
    expect(result.reasonCode).toBe('USER_BUSY');
  });

  test('waiting event speaks once nothing is speaking anymore (navigation completed)', () => {
    const aas = new AAS();
    const msg = makeEvent('msg-1', 'CUSTOMER_MESSAGE', 70, Date.now());

    // Navigation has finished -> currentlySpeakingEvent is now null
    const result = aas.evaluate(msg, { currentlySpeakingEvent: null });
    expect(result.decision).toBe('SPEAK');
  });

  test('safety alert always speaks, even interrupting something else', () => {
    const aas = new AAS();
    const nav = makeEvent('nav-1', 'NAVIGATION', 95, Date.now());
    const safety = makeEvent('safety-1', 'SAFETY_ALERT', 100, Date.now());

    const result = aas.evaluate(safety, { currentlySpeakingEvent: nav });
    expect(result.decision).toBe('SPEAK');
    expect(result.reasonCode).toBe('CRITICAL_SAFETY');
  });

  test('Do Not Disturb mode forces WAIT, except for safety alerts', () => {
    const aas = new AAS();
    const msg = makeEvent('msg-1', 'CUSTOMER_MESSAGE', 90, Date.now());
    const safety = makeEvent('safety-1', 'SAFETY_ALERT', 100, Date.now());

    const msgResult = aas.evaluate(msg, { attentionMode: 'DO_NOT_DISTURB' });
    const safetyResult = aas.evaluate(safety, { attentionMode: 'DO_NOT_DISTURB' });

    expect(msgResult.decision).toBe('WAIT');
    expect(safetyResult.decision).toBe('SPEAK');
  });

  test('very low priority events are dropped', () => {
    const aas = new AAS();
    const trivial = makeEvent('trivial-1', 'MANAGER_MESSAGE', 10, Date.now());

    const result = aas.evaluate(trivial, {});
    expect(result.decision).toBe('DROP');
    expect(result.reasonCode).toBe('LOW_PRIORITY');
  });

  test('expired (stale) events are dropped', () => {
    const aas = new AAS();
    const oldTimestamp = Date.now() - 120000; // 2 minutes ago
    const stale = makeEvent('stale-1', 'CUSTOMER_MESSAGE', 70, oldTimestamp);

    const result = aas.evaluate(stale, {});
    expect(result.decision).toBe('DROP');
    expect(result.reasonCode).toBe('EXPIRED_TTL');
  });

  test('related events already queued get merged instead of duplicated', () => {
    const aas = new AAS();
    const queue = new EventQueue();

    const first = makeEvent('msg-1', 'CUSTOMER_MESSAGE', 70, Date.now(), { source: 'customer' });
    queue.add({ ...first, status: 'QUEUED' });

    const second = makeEvent('msg-2', 'CUSTOMER_MESSAGE', 70, Date.now(), { source: 'customer' });
    const result = aas.evaluate(second, { eventQueue: queue });

    expect(result.decision).toBe('MERGE');
    expect(result.reasonCode).toBe('CONTEXT_MERGE');
  });

  test('decision and reasonCode are always recorded on the returned event', () => {
    const aas = new AAS();
    const event = makeEvent('e1', 'RIDER_VOICE', 80, Date.now());
    const result = aas.evaluate(event, {});

    expect(result).toHaveProperty('decision');
    expect(result).toHaveProperty('reasonCode');
    expect(result).toHaveProperty('status');
  });
});