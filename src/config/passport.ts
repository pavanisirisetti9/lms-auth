import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        const [rows] = await pool.execute(
          "SELECT id, name, email, password, role FROM users WHERE email = ?",
          [email]
        );

        const users = rows as {
          id: number;
          name: string;
          email: string;
          password: string;
          role: "student" | "instructor" | "admin";
        }[];

        if (users.length === 0) {
          return done(null, false, {
            message: "Invalid email or password"
          });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        );

        if (!isPasswordValid) {
          return done(null, false, {
            message: "Invalid email or password"
          });
        }

        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [id]
    );

    const users = rows as {
      id: number;
      name: string;
      email: string;
      role: "student" | "instructor" | "admin";
    }[];

    if (users.length === 0) {
      return done(null, false);
    }

    return done(null, users[0]);
  } catch (error) {
    return done(error);
  }
});

export default passport;