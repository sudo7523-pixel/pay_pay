import express from "express";
import {
  intent,
  submit,
  verify,
  status,
  receipt,
  recent,
  transactions,
} from "../controllers/transaction.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/intent", protect, intent);
router.post("/submit", submit);
router.get("/status/:transactionId", status);
router.get("/verify/:transactionId", verify);
router.get("/receipt/:transactionId", receipt);
router.get("/recent", protect, recent);
router.get("/transactions", protect, transactions);

export default router;
