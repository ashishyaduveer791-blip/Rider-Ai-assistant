require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createEvent, EVENT_TYPES } = require('./models/event');
const EventQueue = require('./services/eventQueue');
const eventQueue = new EventQueue();
const AAS = require('./services/aas');
const aas = new AAS();
const createEventRouter = require('./routes/eventRoutes');
const { processEvent } = require('./services/eventProcessor');
const { createRateLimiter } = require('./middleware/rateLimit');
const { validateEnv } = require('./config/env');

// Validate environment on startup
const env = validateEnv();

let currentlySpeakingEvent = null;

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS (no wildcard fallback)
const allowedOrigin = env.CLIENT_ORIGIN;
const io = new Server(server, {
  cors: {
    origin: allowedOrigin || false,
    methods: ['GET', 'POST'],
  },
});

// Picks the next WAITING/QUEUED event and speaks it, if nothing is currently speaking
function reevaluateNext() {
  if (currentlySpeakingEvent) return;

  const next = eventQueue.getAll().find(
    (e) => e.status === 'WAITING' || e.status === 'QUEUED'
  );
  if (!next) {
    io.emit('currently-speaking', { message: 'Nothing currently speaking' });
    return;
  }

  const decided = aas.evaluate(next, {
    currentlySpeakingEvent,
    eventQueue,
    attentionMode: 'NORMAL',
  });

  eventQueue.update(next.id, {
    decision: decided.decision,
    reasonCode: decided.reasonCode,
    status: decided.status,
  });

  if (decided.decision === 'SPEAK') {
    currentlySpeakingEvent = decided;
    console.log(`[AAS] Now speaking: ${decided.id} (${decided.type})`);
    io.emit('currently-speaking', { event: decided });
  }

  io.emit('event-evaluated', { event: decided });
  io.emit('queue-updated', { events: eventQueue.getAll(), size: eventQueue.size() });
}

// ---- Middleware ----
app.use(cors({
  origin: allowedOrigin || false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Rate limiting — 100 requests/minute per IP for API routes
const apiLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 100 });
app.use('/api', apiLimiter);

// ---- Health Route ----
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    queueSize: eventQueue.size(),
  });
});

// ---- Mount REST API Routes ----
app.use('/api/events', createEventRouter({
  eventQueue,
  aas,
  io,
  getCurrentlySpeaking: () => currentlySpeakingEvent,
  setCurrentlySpeaking: (evt) => { currentlySpeakingEvent = evt; },
  reevaluateNext,
}));

// ---- 404 Handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---- Error Handling Middleware ----
app.use((err, req, res, next) => {
  console.error('[server error]', err.stack);

  // In production, don't leak internal error details to clients
  const isProduction = env.isProduction;
  const statusCode = err.status || 500;
  const message = isProduction && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR',
      message,
    },
  });
});

// ---- Socket.IO Event Handlers ----
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial state snapshot on connection
  socket.emit('queue-updated', {
    events: eventQueue.getAll(),
    size: eventQueue.size(),
  });
  socket.emit('currently-speaking', currentlySpeakingEvent ? { event: currentlySpeakingEvent } : { message: 'Nothing currently speaking' });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });

  // Client triggers a new event
  socket.on('event', (data = {}) => {
    console.log('[Socket.IO] Event received:', data);
    try {
      // Map legacy UI type names to canonical event types
      const typeMap = {
        'nav-event': 'NAVIGATION',
        'customer-msg': 'CUSTOMER_MESSAGE',
        'customer-call': 'CUSTOMER_CALL',
        'otp-event': 'OTP',
        'manager-msg': 'MANAGER_MESSAGE',
        'safety-alert': 'SAFETY_ALERT',
        'rider-voice': 'RIDER_VOICE',
      };
      const rawType = data.type || 'NAVIGATION';
      const resolvedType = typeMap[rawType] || rawType.toUpperCase();

      const decided = processEvent({
        eventData: {
          id: data.id,
          type: resolvedType,
          source: data.source || 'frontend',
          content: data.content || data.sampleDesc || data.label || '',
        },
        eventQueue,
        aas,
        getCurrentlySpeaking: () => currentlySpeakingEvent,
        setCurrentlySpeaking: (evt) => { currentlySpeakingEvent = evt; },
      });

      // Broadcast to all connected clients
      if (decided.decision === 'SPEAK') {
        io.emit('currently-speaking', { event: decided });
      }
      io.emit('event-evaluated', { event: decided });
      io.emit('queue-updated', {
        events: eventQueue.getAll(),
        size: eventQueue.size(),
      });

      console.log(`[AAS] Event ${decided.id} evaluated: ${decided.decision} (${decided.reasonCode})`);
    } catch (error) {
      console.error('[Socket.IO] Error processing event:', error.message);
      socket.emit('event-error', { error: error.message });
    }
  });

  // Frontend/voice service signals speaking is complete
  socket.on('speaking-complete', () => {
    console.log('[Socket.IO] Speaking complete for:', currentlySpeakingEvent?.id);
    currentlySpeakingEvent = null;
    io.emit('currently-speaking', { message: 'Nothing currently speaking' });
    reevaluateNext();
  });

  // Client requests reset of all events and queue
  socket.on('reset-events', () => {
    console.log('[Socket.IO] Resetting event queue requested by client');
    eventQueue.clear();
    currentlySpeakingEvent = null;
    io.emit('currently-speaking', { message: 'Nothing currently speaking' });
    io.emit('queue-updated', {
      events: [],
      size: 0,
    });
  });
});

const PORT = env.PORT;

server.listen(PORT, () => {
  console.log(`Rider AI Backend Server running on http://localhost:${PORT}`);
  console.log(`CORS origin: ${allowedOrigin || '(same-origin only)'}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

module.exports = { app, server, io, eventQueue, aas };