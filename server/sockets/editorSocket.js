import {
  createRoom,
  roomExists,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  updateRoomCode,
  getRoomUsers,
  createRoomWithId
} from '../utils/roomManager.js';

export default (socket, io) => {
  console.log("🟢 New client connected:", socket.id);

  /**
   * Create a new room
   */
  socket.on("create-room", ({ userName }) => {
    const roomId = createRoom();
    const name = userName || 'Anonymous';
    
    // Join the socket to the room
    socket.join(roomId);
    
    // Track user info on socket
    socket.roomId = roomId;
    socket.userName = name;
    
    // Add user to room
    addUserToRoom(roomId, socket.id, name);
    
    console.log(`✨ Room created: ${roomId} by ${name} (${socket.id})`);
    
    // Send room ID back to creator
    socket.emit("room-created", { roomId, userName: name });
    
    // Send updated user list
    const users = getRoomUsers(roomId);
    io.to(roomId).emit("users-update", users);
  });

  /**
   * Join an existing room
   */
  socket.on("join-room", ({ roomId, userName }) => {
    const name = userName || 'Anonymous';
    
    // Check if room exists, if not create it (handles race condition)
    if (!roomExists(roomId)) {
      console.log(`🔧 Creating room ${roomId} on first join by ${name}`);
      createRoomWithId(roomId);
    }
    
    // Join the socket to the room
    socket.join(roomId);
    
    // Track user info on socket
    socket.roomId = roomId;
    socket.userName = name;
    
    // Add user to room
    addUserToRoom(roomId, socket.id, name);
    
    console.log(`👤 User ${name} (${socket.id}) joined room ${roomId}`);
    
    // Get current room data
    const room = getRoom(roomId);
    const users = getRoomUsers(roomId);
    
    // Send current code to the new user
    if (room.code) {
      socket.emit("code-update", room.code);
    }
    
    // Broadcast to all users in room
    io.to(roomId).emit("users-update", users);
    socket.to(roomId).emit("user-joined", { id: socket.id, name });
    
    // Request current code from existing users (fallback)
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients && clients.size > 1) {
      socket.to(roomId).emit("request-code", socket.id);
    }
  });

  /**
   * Leave a room
   */
  socket.on("leave-room", () => {
    if (!socket.roomId) return;
    
    const roomId = socket.roomId;
    const userName = socket.userName;
    
    console.log(`👋 User ${userName} (${socket.id}) leaving room ${roomId}`);
    
    // Remove user from room
    const result = removeUserFromRoom(roomId, socket.id);
    
    if (result) {
      // Leave the socket room
      socket.leave(roomId);
      
      if (result.deleted) {
        console.log(`🗑️  Room ${roomId} deleted (no users remaining)`);
      } else {
        // Broadcast updated user list
        io.to(roomId).emit("users-update", result.users);
        socket.to(roomId).emit("user-left", { id: socket.id, name: userName });
      }
    }
    
    // Clear socket tracking
    socket.roomId = null;
    socket.userName = null;
  });

  /**
   * Handle local code edits
   */
  socket.on("local-edit", ({ roomId, code }) => {
    if (!roomExists(roomId)) return;
    
    // Update stored code
    updateRoomCode(roomId, code);
    
    // Broadcast to all other users in the room
    socket.to(roomId).emit("remote-edit", code);
  });

  /**
   * Handle code changes (legacy support)
   */
  socket.on("code-change", ({ roomId, code }) => {
    if (!roomExists(roomId)) return;
    
    // Update stored code
    updateRoomCode(roomId, code);
    
    // Broadcast to all other users
    socket.to(roomId).emit("code-update", code);
  });
  
  /**
   * Send current code to a specific user
   */
  socket.on("send-current-code", ({ targetSocketId, code }) => {
    io.to(targetSocketId).emit("code-update", code);
  });

  /**
   * Handle disconnect
   */
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    
    // Clean up like leave-room
    if (socket.roomId) {
      const roomId = socket.roomId;
      const userName = socket.userName;
      
      const result = removeUserFromRoom(roomId, socket.id);
      
      if (result) {
        if (result.deleted) {
          console.log(`🗑️  Room ${roomId} deleted after disconnect`);
        } else {
          // Broadcast updated user list
          io.to(roomId).emit("users-update", result.users);
          socket.to(roomId).emit("user-left", { id: socket.id, name: userName });
        }
      }
    }
  });
};
