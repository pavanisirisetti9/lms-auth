import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: "student" | "instructor" | "admin";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access token is required"
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured"
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default authenticate;
