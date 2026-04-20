// Track active call information
const activeCallsMap = new Map(); // userId -> { callerId, callerName, callerAvatar, callType }

export const handleWebRTCEvents = (io, socket) => {
  // Handle video call initiation
  socket.on('video-call-initiate', ({ to, from, fromName, fromAvatar }) => {
    console.log(`Video call initiated from ${from} to ${to}`);
    activeCallsMap.set(to, {
      callerId: from,
      callerName: fromName,
      callerAvatar: fromAvatar,
      callType: 'video',
      timestamp: Date.now()
    });
    io.to(`user_${to}`).emit('video-call-incoming', { from, fromName, fromAvatar, callType: 'video' });
  });

  // Handle voice call initiation
  socket.on('voice-call-initiate', ({ to, from, fromName, fromAvatar }) => {
    console.log(`Voice call initiated from ${from} to ${to}`);
    activeCallsMap.set(to, {
      callerId: from,
      callerName: fromName,
      callerAvatar: fromAvatar,
      callType: 'voice',
      timestamp: Date.now()
    });
    io.to(`user_${to}`).emit('voice-call-incoming', { from, fromName, fromAvatar, callType: 'voice' });
  });

  // Handle call acceptance — notify caller so they can navigate to call screen
  socket.on('call-accept', ({ to, from }) => {
    console.log(`Call accepted by ${from}, notifying caller ${to}`);
    io.to(`user_${to}`).emit('call-accepted', { acceptedBy: from });
    activeCallsMap.delete(from);
  });

  // Handle call rejection
  socket.on('call-reject', ({ to, from }) => {
    console.log(`Call rejected by ${from}, notifying ${to}`);
    io.to(`user_${to}`).emit('call-rejected', { rejectedBy: from });
    activeCallsMap.delete(from);
  });

  // Handle call end
  socket.on('call-end', ({ to }) => {
    console.log(`Call ended, notifying ${to}`);
    io.to(`user_${to}`).emit('call-ended', {});
  });

  // FIX: Route offer/answer/ice-candidate via user_ rooms (userId), NOT socket.id
  // The client sends `to: userId`, so we must use `user_${userId}` room to deliver it
  socket.on('offer', ({ to, sdp }) => {
    console.log(`Relaying offer to user_${to}`);
    io.to(`user_${to}`).emit('offer', { sdp });
  });

  socket.on('answer', ({ to, sdp }) => {
    console.log(`Relaying answer to user_${to}`);
    io.to(`user_${to}`).emit('answer', { sdp });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    io.to(`user_${to}`).emit('ice-candidate', { candidate });
  });
};