import express from "express";
import {
  sorobanIntent,
  sorobanSubmit,
  sorobanVerify,
  sorobanGetPayment,
  sorobanPaymentExists,
  sorobanGetConfig,
  sorobanMerchantTotal,
  sorobanCustomerTotal,
  sorobanBalance,
  sorobanHealth,
  sorobanSyncStatus,
  sorobanManualSync,
} from "../controllers/soroban.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/intent", protect, sorobanIntent);
router.post("/submit", protect, sorobanSubmit);
router.get("/verify/:transactionId", sorobanVerify);
router.get("/payment/:paymentId", sorobanGetPayment);
router.get("/payment/exists/:paymentId", sorobanPaymentExists);
router.get("/config", sorobanGetConfig);
router.get("/merchant-total/:address", sorobanMerchantTotal);
router.get("/customer-total/:address", sorobanCustomerTotal);
router.get("/balance/:address", sorobanBalance);
router.get("/health", sorobanHealth);
router.get("/sync/status", sorobanSyncStatus);
router.post("/sync/trigger", sorobanManualSync);

export default router;
