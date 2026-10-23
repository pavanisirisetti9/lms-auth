
import { Router, Request, Response } from "express";
import authenticate, {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { Server } from "socket.io";
import { pool } from "../config/db.js";

const router = Router();

let io: Server | undefined;

export const setInstructorSocket = (socketServer: Server): void => {
  io = socketServer;
};

// GET /api/instructor/courses
router.get(
  "/courses",
  authenticate,
  authorize("instructor", "admin"),
  (req: Request, res: Response) => {
    const authenticatedRequest = req as AuthenticatedRequest;

    res.status(200).json({
      success: true,
      message: "Instructor courses accessed successfully",
      data: {
        user: authenticatedRequest.user,
        courses: [],
      },
    });
  },
);

// POST /api/instructor/assignments
router.post(
  "/assignments",
  authenticate,
  authorize("instructor", "admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { courseId, title, description } = req.body;

      const parsedCourseId = Number(courseId);

      if (
        !Number.isInteger(parsedCourseId) ||
        parsedCourseId <= 0 ||
        typeof title !== "string" ||
        !title.trim()
      ) {
        res.status(400).json({
          success: false,
          message: "A valid courseId and title are required",
        });
        return;
      }

      const assignmentDescription =
        typeof description === "string" ? description : "";

      const [result] = await pool.execute(
        `INSERT INTO assignments (course_id, title, description)
         VALUES (?, ?, ?)`,
        [parsedCourseId, title.trim(), assignmentDescription],
      );

      const insertResult = result as { insertId: number };

      const assignment = {
        id: insertResult.insertId,
        courseId: parsedCourseId,
        title: title.trim(),
        description: assignmentDescription,
        createdAt: new Date().toISOString(),
      };

      io?.to(`course_${parsedCourseId}`).emit(
        "newAssignment",
        assignment,
      );

      res.status(201).json({
        success: true,
        message: "Assignment saved and notification sent",
        data: assignment,
      });
    } catch (error) {
      console.error("Assignment error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to save assignment",
      });
    }
  },
);

export default router;
