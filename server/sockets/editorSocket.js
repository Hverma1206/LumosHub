export default (socket, io) => {
  console.log("🟢 New client connected:", socket.id);

  // Join a room for collaborative editing
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Broadcast code changes
  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("disconnect", () => {
    console.log(" Client disconnected:", socket.id);
  });
};
