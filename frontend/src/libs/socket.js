import { io } from 'socket.io-client';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Connect to backend Socket.IO server
export const socket = io(API_BASE_URL, {
  autoConnect: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export default socket;
