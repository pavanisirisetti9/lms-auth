
import "dotenv/config";

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";

import "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_session_secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Serve the LMS frontend
app.get("/", (_req, res) => {
  res.sendFile(path.resolve("public/client.html"));
});

// API health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Authentication API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);

export default app;
