export const handleWebRTCEvents = (io, socket) => {
  socket.on('offer', ({ to, sdp }) => {
    socket.to(to).emit('offer', { from: socket.id, sdp });
  });

  socket.on('answer', ({ to, sdp }) => {
    socket.to(to).emit('answer', { from: socket.id, sdp });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });
};
