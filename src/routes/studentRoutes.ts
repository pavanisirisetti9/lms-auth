import { Router, Request, Response } from "express";
import authenticate, {
  AuthenticatedRequest
} from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = Router();

// GET /api/student/dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize("student", "instructor", "admin"),
  (req: Request, res: Response) => {
    const authenticatedRequest = req as AuthenticatedRequest;

    res.status(200).json({
      success: true,
      message: "Welcome to the Student Dashboard",
      data: {
        user: authenticatedRequest.user
      }
    });
  }
);

export default router;
