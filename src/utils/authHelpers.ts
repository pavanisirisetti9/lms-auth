import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const generateToken = (
  payload: { id: number; email: string; role: string },
  secret: string = process.env.JWT_SECRET || "",
): string => {
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, secret, { expiresIn: "1h" });
};
