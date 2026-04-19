import Message from '../models/Message.js';
import User from '../models/User.js';

export const handleChatEvents = (io, socket) => {
  socket.on('join-room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('leave-room', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });

  socket.on('send-message', async ({ roomId, text, mediaUrl }) => {
    try {
      const userId = socket.handshake.auth.userId;

      // Save message to database
      const message = await Message.create({
        roomId,
        senderId: userId,
        text,
        mediaUrl,
        createdAt: new Date()
      });

      // Populate sender info
      await message.populate('senderId', 'displayName avatarUrl');

      // Broadcast to all users in the room
      io.to(roomId).emit('new-message', {
        roomId,
        message: {
          _id: message._id,
          senderId: message.senderId,
          text: message.text,
          mediaUrl: message.mediaUrl,
          createdAt: message.createdAt
        }
      });

      console.log(`Message sent in room ${roomId}`);
    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('typing-indicator', {
      userId: socket.handshake.auth.userId,
      isTyping
    });
  });
};