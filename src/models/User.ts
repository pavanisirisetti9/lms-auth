import { pool } from "../config/db.js";

export type UserRole = "student" | "instructor" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  googleId?: string | null;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  googleId?: string | null;
}

export const createUser = async (
  userData: CreateUserData
): Promise<User> => {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, role, googleId)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userData.name,
      userData.email,
      userData.password,
      userData.role,
      userData.googleId ?? null
    ]
  );

  const insertResult = result as { insertId: number };

  const [rows] = await pool.execute(
    `SELECT id, name, email, password, role, googleId
     FROM users
     WHERE id = ?`,
    [insertResult.insertId]
  );

  const users = rows as User[];

  return users[0];
};

export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password, role, googleId
     FROM users
     WHERE email = ?`,
    [email]
  );

  const users = rows as User[];

  return users.length > 0 ? users[0] : null;
};

export const findUserById = async (
  id: number
): Promise<User | null> => {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password, role, googleId
     FROM users
     WHERE id = ?`,
    [id]
  );

  const users = rows as User[];

  return users.length > 0 ? users[0] : null;
};