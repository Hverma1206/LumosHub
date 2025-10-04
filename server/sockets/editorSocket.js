export default (socket, io) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Get number of clients in the room
    const clients = io.sockets.adapter.rooms.get(roomId);
    const numClients = clients ? clients.size : 0;
    
    // If there are other clients in the room, request current code
    if (numClients > 1) {
      socket.to(roomId).emit("request-code", socket.id);
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });
  
  socket.on("send-current-code", ({ targetSocketId, code }) => {
    io.to(targetSocketId).emit("code-update", code);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
};
