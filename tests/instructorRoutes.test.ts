
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

describe("Instructor API Tests", () => {
  let instructorToken: string;
  let studentToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";

    instructorToken = jwt.sign(
      { id: 2, email: "instructor@example.com", role: "instructor" },
      "test-secret",
    );

    studentToken = jwt.sign(
      { id: 1, email: "student@example.com", role: "student" },
      "test-secret",
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/instructor/courses", () => {
    it("should reject a request without a token", async () => {
      const response = await request(app).get("/api/instructor/courses");
      expect(response.status).toBe(401);
    });

    it("should reject a student token", async () => {
      const response = await request(app)
        .get("/api/instructor/courses")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });

    it("should return courses for an instructor", async () => {
      const response = await request(app)
        .get("/api/instructor/courses")
        .set("Authorization", `Bearer ${instructorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toEqual([]);
    });
  });

  describe("POST /api/instructor/assignments", () => {
    it("should reject a request without a token", async () => {
      const response = await request(app)
        .post("/api/instructor/assignments")
        .send({ courseId: 1, title: "Test Assignment" });

      expect(response.status).toBe(401);
    });

    it("should reject invalid assignment details", async () => {
      const response = await request(app)
        .post("/api/instructor/assignments")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({ courseId: 0, title: "" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it("should save an assignment successfully", async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 10 }, []]);

      const response = await request(app)
        .post("/api/instructor/assignments")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({
          courseId: 1,
          title: "Java Assignment",
          description: "Complete Java exercises",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(10);
      expect(response.body.data.title).toBe("Java Assignment");
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when database insertion fails", async () => {
      mockExecute.mockRejectedValueOnce(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const response = await request(app)
        .post("/api/instructor/assignments")
        .set("Authorization", `Bearer ${instructorToken}`)
        .send({
          courseId: 1,
          title: "Java Assignment",
          description: "Test description",
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to save assignment");

      consoleSpy.mockRestore();
    });
  });
});
