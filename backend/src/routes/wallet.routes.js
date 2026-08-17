import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  link,
  get,
  update,
  remove,
  verify,
} from "../controllers/wallet.controller.js";
import {
  linkWalletValidator,
  updateWalletValidator,
} from "../utils/validators.js";

const router = express.Router();

router.post("/link", protect, linkWalletValidator, validate, link);
router.get("/", protect, get);
router.put("/", protect, updateWalletValidator, validate, update);
router.delete("/", protect, remove);
router.post("/verify", protect, verify);

export default router;
