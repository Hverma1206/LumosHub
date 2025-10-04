 // Store room users: { roomId: [{ id, name }] }
const roomUsers = new Map();

export default (socket, io) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    
    // Store user info
    socket.roomId = roomId;
    socket.userName = userName || 'Anonymous';
    
    // Add user to room users list
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, []);
    }
    const users = roomUsers.get(roomId);
    users.push({ id: socket.id, name: socket.userName });
    
    console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);
    
    // Broadcast updated user list to all clients in the room
    io.to(roomId).emit("users-update", users);
    
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
    
    // Remove user from room users list
    if (socket.roomId && roomUsers.has(socket.roomId)) {
      const users = roomUsers.get(socket.roomId);
      const index = users.findIndex(u => u.id === socket.id);
      if (index !== -1) {
        users.splice(index, 1);
        
        // Broadcast updated user list
        io.to(socket.roomId).emit("users-update", users);
        
        // Clean up empty rooms
        if (users.length === 0) {
          roomUsers.delete(socket.roomId);
        }
      }
    }
  });
};
