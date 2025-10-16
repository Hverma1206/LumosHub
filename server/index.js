import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./config/passport.js";
import codeRoutes from "./routes/codeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import editorSocket from "./sockets/editorSocket.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8001;

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/code", codeRoutes);
app.use("/api/auth", authRoutes);

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
  console.log(`Server running on port ${PORT}`);
});
