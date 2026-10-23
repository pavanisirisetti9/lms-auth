import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const router = Router();

router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: "Name, email and password are required",
        });
        return;
      }

      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE email = ?",
        [email],
      );

      if ((existingUsers as unknown[]).length > 0) {
        res.status(409).json({
          success: false,
          message: "Email already registered",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const allowedRoles = ["student", "instructor", "admin"];
      const userRole = allowedRoles.includes(role) ? role : "student";

      await pool.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, userRole],
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  },
);

router.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const [rows] = await pool.execute(
        "SELECT id, name, email, password, role FROM users WHERE email = ?",
        [email],
      );

      const users = rows as {
        id: number;
        name: string;
        email: string;
        password: string;
        role: "student" | "instructor" | "admin";
      }[];

      if (users.length === 0) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      const user = users[0];
      const passwordMatches = await bcrypt.compare(
        password,
        user.password,
      );

      if (!passwordMatches) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        res.status(500).json({
          success: false,
          message: "JWT_SECRET is not configured",
        });
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        secret,
        { expiresIn: "1h" },
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  },
);

export default router;