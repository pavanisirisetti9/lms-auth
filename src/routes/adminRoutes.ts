import { Router, Request, Response } from "express";
import authenticate, {
  AuthenticatedRequest
} from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { pool } from "../config/db.js";

const router = Router();

// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  authenticate,
  authorize("admin"),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID"
        });
        return;
      }

      const [result] = await pool.execute(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      const deleteResult = result as {
        affectedRows: number;
      };

      if (deleteResult.affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: {
          userId
        }
      });
    } catch (error) {
      console.error("Delete user error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

export default router;
