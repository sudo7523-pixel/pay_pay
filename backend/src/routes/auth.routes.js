import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../utils/validators.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

router.get("/profile", protect, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { getUserProfile } = await import("../services/auth.service.js");
    const user = await getUserProfile(userId);
    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", protect, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { updateUserProfile } = await import("../services/auth.service.js");
    const user = await updateUserProfile(userId, req.body);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router;