import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import codeRoutes from "./routes/codeRoutes.js";
import editorSocket from "./sockets/editorSocket.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/code", codeRoutes);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Attach socket logic
io.on("connection", (socket) => {
  editorSocket(socket, io);
});

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
