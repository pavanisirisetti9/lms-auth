import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware.js";

type UserRole = "student" | "instructor" | "admin";

const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const authenticatedRequest = req as AuthenticatedRequest;
    const user = authenticatedRequest.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions"
      });
      return;
    }

    next();
  };
};

export default authorize;
