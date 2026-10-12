import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import {
  createUser,
  findUserByEmail
} from "../models/User.js";
import { UserRole } from "../models/User.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET as string;

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    };

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required"
      });
    }

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST /api/auth/login
router.post("/login", (req: Request, res: Response, next) => {
  passport.authenticate(
    "local",
    { session: true },
    (error: Error | null, user: Express.User | false, info?: { message?: string }) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Invalid email or password"
        });
      }

      const authenticatedUser = user as {
        id: number;
        name: string;
        email: string;
        role: UserRole;
      };

      if (!JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: "JWT_SECRET is not configured"
        });
      }

      const token = jwt.sign(
        {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          role: authenticatedUser.role
        },
        JWT_SECRET,
        {
          expiresIn: "1h"
        }
      );

      req.logIn(user, (loginError) => {
        if (loginError) {
          return next(loginError);
        }

        return res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            token,
            user: {
              id: authenticatedUser.id,
              name: authenticatedUser.name,
              email: authenticatedUser.email,
              role: authenticatedUser.role
            }
          }
        });
      });
    }
  )(req, res, next);
});

export default router;
