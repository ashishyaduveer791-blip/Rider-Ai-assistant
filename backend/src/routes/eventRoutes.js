const express = require('express');
const { createEvent, EVENT_TYPES } = require('../models/event');
const { processEvent } = require('../services/eventProcessor');

// Try loading ai/eventClassifier if available
let classifyEvent = null;
try {
  const classifier = require('../../../ai/eventClassifier');
  classifyEvent = classifier.classifyEvent;
} catch (e) {
  console.warn('[eventRoutes] AI event classifier not loaded:', e.message);
}

module.exports = function createEventRouter(context) {
  const router = express.Router();
  const {
    eventQueue,
    aas,
    io,
    getCurrentlySpeaking,
    setCurrentlySpeaking,
  } = context;

  // GET /api/events/queue - Get all queued events sorted by priority
  router.get('/queue', (req, res) => {
    res.json({
      events: eventQueue.getAll(),
      size: eventQueue.size(),
    });
  });

  // GET /api/events/current-speaking - Get currently active speaking event
  router.get('/current-speaking', (req, res) => {
    const current = getCurrentlySpeaking();
    res.json(current || { message: 'Nothing currently speaking' });
  });

  // POST /api/events - Create, queue, evaluate with AAS, and broadcast
  router.post('/', (req, res) => {
    try {
      const decided = processEvent({
        eventData: req.body,
        eventQueue,
        aas,
        getCurrentlySpeaking,
        setCurrentlySpeaking,
      });

      // Broadcast to all connected Socket.IO clients
      if (io) {
        io.emit('event-evaluated', { event: decided });
        io.emit('queue-updated', { events: eventQueue.getAll(), size: eventQueue.size() });
        if (decided.decision === 'SPEAK') {
          io.emit('currently-speaking', { event: decided });
        }
      }

      console.log(`[REST] Event ${decided.id} created: ${decided.decision} (${decided.reasonCode})`);
      return res.status(201).json(decided);
    } catch (err) {
      const statusCode = err.status || 500;
      console.error('[REST] Error creating event:', err.message);
      return res.status(statusCode).json({
        success: false,
        error: { code: statusCode === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR', message: err.message },
      });
    }
  });

  // POST /api/events/classify - Classify content via AI Service
  router.post('/classify', async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    if (classifyEvent) {
      try {
        const result = await classifyEvent(content);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.json({
      category: 'LOW_VALUE_MESSAGE',
      confidence: 0,
      reasonCode: 'AI_SERVICE_UNAVAILABLE',
    });
  });

  // POST /api/events/reset - Clear all events and reset queue state
  router.post('/reset', (req, res) => {
    eventQueue.clear();
    setCurrentlySpeaking(null);
    if (io) {
      io.emit('currently-speaking', { message: 'Nothing currently speaking' });
      io.emit('queue-updated', { events: [], size: 0 });
    }
    console.log('[REST] Event queue and speaker state cleared');
    return res.json({ success: true, message: 'Event queue cleared successfully' });
  });

  return router;
};
