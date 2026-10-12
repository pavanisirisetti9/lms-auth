import { Router, Request, Response } from "express";
import authenticate, {
  AuthenticatedRequest
} from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = Router();

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
        courses: []
      }
    });
  }
);

export default router;
