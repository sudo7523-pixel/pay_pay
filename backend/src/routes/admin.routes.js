import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeAdmin } from "../middleware/role.middleware.js";
import {
  adminGetAllMerchants,
  adminGetMerchantById,
  adminVerifyMerchant,
  adminRejectMerchant,
  adminSuspendMerchant,
} from "../controllers/merchant.controller.js";

const router = express.Router();

router.get("/merchants", protect, authorizeAdmin, adminGetAllMerchants);
router.get("/merchant/:id", protect, authorizeAdmin, adminGetMerchantById);
router.patch("/merchant/:id/verify", protect, authorizeAdmin, adminVerifyMerchant);
router.patch("/merchant/:id/reject", protect, authorizeAdmin, adminRejectMerchant);
router.patch("/merchant/:id/suspend", protect, authorizeAdmin, adminSuspendMerchant);

export default router;
