import "dotenv/config";

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { createServer } from "node:http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import { setInstructorSocket } from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import socketHandler from "./socket/socketHandler.js";
import socketAuthMiddleware from "./middleware/socketAuthMiddleware.js";

const app = express();
app.use(express.static("public"));
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_session_secret",
    resave: false,
    saveUninitialized: false
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Authentication API is running"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/student", studentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);

// Socket.io authentication and event handlers
io.use(socketAuthMiddleware);
socketHandler(io);
setInstructorSocket(io);

// Start server
const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

export default app;
