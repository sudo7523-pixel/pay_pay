import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { body } from "express-validator";
import {
  register,
  getProfile,
  updateProfile,
  getTransactions,
  getReceipt,
} from "../controllers/customer.controller.js";

const router = express.Router();

const registerCustomerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("walletAddress")
    .optional()
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage("Invalid Stellar public key format"),
];

const updateCustomerValidator = [
  body("walletAddress")
    .optional()
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage("Invalid Stellar public key format"),
];

router.post("/register", registerCustomerValidator, validate, register);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateCustomerValidator, validate, updateProfile);
router.get("/transactions", protect, getTransactions);
router.get("/receipt/:transactionId", protect, getReceipt);

export default router;
