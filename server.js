import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing anything else
dotenv.config();

import connectDB from './src/config/database.js';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

// Create HTTP Server
const server = http.createServer(app);

// Socket.io Setup
const allowedOrigins = [
  "http://localhost:5173",  // Development
  "http://localhost:3000",  // Local testing
  process.env.CLIENT_URL    // Production
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Import Socket Handler
import initializeSocket from './src/socket/index.js';
initializeSocket(io);

// Connect Database
await connectDB();

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 SnapClone Backend running on http://localhost:${PORT}`);
});