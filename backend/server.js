// Canonical backend entry point delegating to src/server.js
// This ensures running `node server.js` or `npm start` executes the complete Express + Socket.IO server.
require('./src/server.js');