
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "./authMiddleware.js";

declare module "socket.io" {
  interface Socket {
    user?: AuthenticatedUser;
  }
}

const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
): void => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  if (typeof token !== "string" || !token) {
    return next(new Error("Authentication token is required"));
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "number" ||
      typeof decoded.email !== "string" ||
      !["student", "instructor", "admin"].includes(decoded.role)
    ) {
      return next(new Error("Invalid token payload"));
    }

    socket.user = decoded as AuthenticatedUser;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};

export default socketAuthMiddleware;
