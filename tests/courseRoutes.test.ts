
import request from "supertest";
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

describe("Course API Tests", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/courses", () => {
    it("should return the list of courses successfully", async () => {
      mockExecute.mockResolvedValueOnce([
        [
          { id: 1, course_name: "Java Full Stack" },
          { id: 2, course_name: "Node.js" },
        ],
        [],
      ]);

      const response = await request(app).get("/api/courses");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].course_name).toBe("Java Full Stack");
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it("should return an empty list when no courses exist", async () => {
      mockExecute.mockResolvedValueOnce([[], []]);

      const response = await request(app).get("/api/courses");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it("should return 500 when the database query fails", async () => {
      mockExecute.mockRejectedValueOnce(new Error("Database error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const response = await request(app).get("/api/courses");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to retrieve courses");

      consoleSpy.mockRestore();
    });
  });
});
