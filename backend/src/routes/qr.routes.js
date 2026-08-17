import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeMerchant } from "../middleware/role.middleware.js";
import {
  generate,
  get,
  regenerate,
  remove,
} from "../controllers/qr.controller.js";

const router = express.Router();

router.post("/generate", protect, authorizeMerchant, generate);
router.get("/:merchantCode", protect, authorizeMerchant, get);
router.put("/regenerate", protect, authorizeMerchant, regenerate);
router.delete("/", protect, authorizeMerchant, remove);

export default router;
