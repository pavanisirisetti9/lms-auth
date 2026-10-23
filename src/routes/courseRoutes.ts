
import { Router, Request, Response } from "express";
import { pool } from "../config/db.js";

const router = Router();

// GET /api/courses
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, course_name FROM courses ORDER BY id",
    );

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Courses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
    });
  }
});

export default router;
