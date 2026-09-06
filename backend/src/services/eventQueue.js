const { EVENT_STATUS } = require('../models/event');

class EventQueue {
  constructor() {
    // Stores events as id -> event, guarantees no duplicates/loss
    this.events = new Map();
  }

  // Determines the number used for ordering:
  // prefer semanticPriority (set later by AI) if available, else basePriority
  _getPriority(event) {
    return event.semanticPriority !== null && event.semanticPriority !== undefined
      ? event.semanticPriority
      : event.basePriority;
  }

  // Add a new event to the queue
  add(event) {
    if (!event || !event.id) {
      throw new Error('Event must have an id');
    }
    if (this.events.has(event.id)) {
      throw new Error(`Event with id ${event.id} already exists`);
    }

    const eventToStore = {
      ...event,
      status: event.status || EVENT_STATUS.QUEUED,
    };

    this.events.set(event.id, eventToStore);
    return eventToStore;
  }

  // Remove an event by id. Returns true if it existed, false otherwise.
  remove(eventId) {
    const existed = this.events.has(eventId);
    this.events.delete(eventId);
    return existed;
  }

  // Update fields on an existing event (e.g. semanticPriority, decision, reasonCode, status)
  update(eventId, updates) {
    const existing = this.events.get(eventId);
    if (!existing) {
      throw new Error(`Event with id ${eventId} not found`);
    }
    const updated = { ...existing, ...updates };
    this.events.set(eventId, updated);
    return updated;
  }

  // Look at the single highest-priority event WITHOUT removing it
  peek() {
    const all = this.getAll();
    return all.length > 0 ? all[0] : null;
  }

  // Get every event, sorted by priority (highest first),
  // ties broken by earliest timestamp first
  getAll() {
    const all = Array.from(this.events.values());
    return all.sort((a, b) => {
      const priorityDiff = this._getPriority(b) - this._getPriority(a);
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
  }

  // How many events are currently in the queue
  size() {
    return this.events.size;
  }

  // Clear all events in the queue
  clear() {
    this.events.clear();
  }
}

module.exports = EventQueue;