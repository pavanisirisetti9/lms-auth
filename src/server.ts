import "dotenv/config";

import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import { setInstructorSocket } from "./routes/instructorRoutes.js";
import socketHandler from "./socket/socketHandler.js";
import socketAuthMiddleware from "./middleware/socketAuthMiddleware.js";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST"]
  }
});

io.use(socketAuthMiddleware);
socketHandler(io);
setInstructorSocket(io);

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
