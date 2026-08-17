import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeMerchant } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  register,
  getProfile,
  updateProfile,
  deleteProfile,
  analytics,
} from "../controllers/merchant.controller.js";
import {
  registerMerchantValidator,
  updateMerchantValidator,
} from "../utils/validators.js";

const router = express.Router();

router.post("/register", protect, registerMerchantValidator, validate, register);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateMerchantValidator, validate, updateProfile);
router.delete("/profile", protect, deleteProfile);
router.get("/analytics", protect, authorizeMerchant, analytics);

export default router;
