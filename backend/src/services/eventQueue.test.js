const EventQueue = require('./eventQueue');

// Helper to quickly build a test event
function makeEvent(id, basePriority, timestamp, semanticPriority = null) {
  return {
    id,
    type: 'CUSTOMER_MESSAGE',
    source: 'test',
    content: `Test content for ${id}`,
    basePriority,
    semanticPriority,
    timestamp,
    status: 'PENDING',
    decision: null,
    reasonCode: null,
  };
}

describe('EventQueue', () => {
  test('can add multiple events', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('e1', 70, 1000));
    queue.add(makeEvent('e2', 80, 2000));
    queue.add(makeEvent('e3', 90, 3000));

    expect(queue.size()).toBe(3);
  });

  test('maintains correct priority ordering (highest first)', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('nav', 95, 1000));
    queue.add(makeEvent('call', 88, 1001));
    queue.add(makeEvent('otp', 80, 1002));
    queue.add(makeEvent('msg', 70, 1003));
    queue.add(makeEvent('manager', 40, 1004));

    const ordered = queue.getAll().map(e => e.id);
    expect(ordered).toEqual(['nav', 'call', 'otp', 'msg', 'manager']);
  });

  test('peek returns the highest-priority event without removing it', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('low', 30, 1000));
    queue.add(makeEvent('high', 90, 1001));

    const top = queue.peek();
    expect(top.id).toBe('high');
    expect(queue.size()).toBe(2); // still 2, nothing removed
  });

  test('equal priorities are broken by earliest timestamp first', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('later', 50, 2000));
    queue.add(makeEvent('earlier', 50, 1000));

    const ordered = queue.getAll().map(e => e.id);
    expect(ordered).toEqual(['earlier', 'later']);
  });

  test('semanticPriority overrides basePriority for ordering when present', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('a', 60, 1000, 95)); // semantic overrides to 95
    queue.add(makeEvent('b', 90, 1001, null)); // no semantic, uses base 90

    const ordered = queue.getAll().map(e => e.id);
    expect(ordered).toEqual(['a', 'b']); // 95 beats 90
  });

  test('events can be removed', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('e1', 70, 1000));
    queue.add(makeEvent('e2', 80, 2000));

    const removed = queue.remove('e1');
    expect(removed).toBe(true);
    expect(queue.size()).toBe(1);
    expect(queue.getAll().map(e => e.id)).toEqual(['e2']);
  });

  test('removing a non-existent event returns false and does not crash', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('e1', 70, 1000));

    const removed = queue.remove('does-not-exist');
    expect(removed).toBe(false);
    expect(queue.size()).toBe(1);
  });

  test('events can be updated', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('e1', 70, 1000));

    const updated = queue.update('e1', { semanticPriority: 99, decision: 'SPEAK' });
    expect(updated.semanticPriority).toBe(99);
    expect(updated.decision).toBe('SPEAK');
  });

  test('updating a non-existent event throws an error', () => {
    const queue = new EventQueue();
    expect(() => queue.update('nope', { status: 'DROPPED' })).toThrow();
  });

  test('queue does not lose events under multiple operations', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('e1', 70, 1000));
    queue.add(makeEvent('e2', 80, 1001));
    queue.add(makeEvent('e3', 90, 1002));

    queue.update('e2', { semanticPriority: 85 });
    queue.remove('e1');
    queue.add(makeEvent('e4', 60, 1003));

    expect(queue.size()).toBe(3); // e2, e3, e4 remain
    const ids = queue.getAll().map(e => e.id).sort();
    expect(ids).toEqual(['e2', 'e3', 'e4']);
  });

  test('adding a duplicate id throws an error', () => {
    const queue = new EventQueue();
    queue.add(makeEvent('e1', 70, 1000));
    expect(() => queue.add(makeEvent('e1', 80, 1001))).toThrow();
  });
});