import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import { pool } from "../src/config/db";

jest.mock("../src/config/db", () => ({
  __esModule: true,
  default: jest.fn(),
  pool: {
    execute: jest.fn(),
    getConnection: jest.fn(),
  },
}));

const mockExecute = pool.execute as jest.Mock;

describe("LMS Authentication API Integration Tests", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should reject registration when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "student@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should register a new user", async () => {
      mockExecute
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([{ insertId: 1 }, []]);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Student",
          email: "student@example.com",
          password: "Test@123",
          role: "student",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should reject an already registered email", async () => {
      mockExecute.mockResolvedValueOnce([[{ id: 1 }], []]);

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Student",
          email: "student@example.com",
          password: "Test@123",
        });

      expect(response.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should reject login when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "student@example.com" });

      expect(response.status).toBe(400);
    });

    it("should reject an unknown email", async () => {
      mockExecute.mockResolvedValueOnce([[], []]);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "Test@123",
        });

      expect(response.status).toBe(401);
    });

    it("should reject an incorrect password", async () => {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("Correct@123", 10);

      mockExecute.mockResolvedValueOnce([[
        {
          id: 1,
          name: "Test Student",
          email: "student@example.com",
          password: hashedPassword,
          role: "student",
        },
      ], []]);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "student@example.com",
          password: "Wrong@123",
        });

      expect(response.status).toBe(401);
    });

    it("should log in with correct credentials", async () => {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("Test@123", 10);

      mockExecute.mockResolvedValueOnce([[
        {
          id: 1,
          name: "Test Student",
          email: "student@example.com",
          password: hashedPassword,
          role: "student",
        },
      ], []]);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "student@example.com",
          password: "Test@123",
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe("student@example.com");
    });
  });

  describe("GET /api/student/dashboard", () => {
    const validToken = () =>
      jwt.sign(
        { id: 1, email: "student@example.com", role: "student" },
        process.env.JWT_SECRET!,
      );

    it("should reject a request without a token", async () => {
      const response = await request(app).get("/api/student/dashboard");

      expect(response.status).toBe(401);
    });

    it("should reject an invalid token", async () => {
      const response = await request(app)
        .get("/api/student/dashboard")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should return dashboard for a valid student token", async () => {
      const response = await request(app)
        .get("/api/student/dashboard")
        .set("Authorization", `Bearer ${validToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("student@example.com");
    });
  });
});
