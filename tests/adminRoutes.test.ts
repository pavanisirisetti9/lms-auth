
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

describe("Admin API Tests", () => {
  let adminToken: string;
  let studentToken: string;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";

    adminToken = jwt.sign(
      { id: 1, email: "admin@example.com", role: "admin" },
      "test-secret",
    );

    studentToken = jwt.sign(
      { id: 2, email: "student@example.com", role: "student" },
      "test-secret",
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("DELETE /api/admin/users/:id", () => {
    it("should reject requests without a token", async () => {
      const response = await request(app).delete("/api/admin/users/2");

      expect(response.status).toBe(401);
    });

    it("should reject a student token", async () => {
      const response = await request(app)
        .delete("/api/admin/users/2")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });

    it("should reject an invalid user ID", async () => {
      const response = await request(app)
        .delete("/api/admin/users/abc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid user ID");
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it("should return 404 when the user does not exist", async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

      const response = await request(app)
        .delete("/api/admin/users/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should delete a user successfully", async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const response = await request(app)
        .delete("/api/admin/users/2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(2);
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when the database query fails", async () => {
      mockExecute.mockRejectedValueOnce(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const response = await request(app)
        .delete("/api/admin/users/2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");

      consoleSpy.mockRestore();
    });
  });
});
