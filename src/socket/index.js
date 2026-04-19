import { handleChatEvents } from './chat.js';
import { handleWebRTCEvents } from './webrtc.js';

// Track online users
const onlineUsers = new Map(); // userId -> socketId

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Authenticate socket
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user_${userId}`);
      
      // Add to online users
      onlineUsers.set(userId, socket.id);
      
      // Broadcast user is online
      io.emit('user-online', userId);
      
      // Send current online users list to this client
      io.emit('online-users', Array.from(onlineUsers.keys()));
    }

    handleChatEvents(io, socket);
    handleWebRTCEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove from online users
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        
        // Broadcast user went offline
        io.emit('user-offline', userId);
      }
    });
  });
};

export default initializeSocket;