import { body } from "express-validator";

export const registerValidator = [
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
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("walletAddress")
    .optional()
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage("Invalid Stellar public key format"),
];

export const registerMerchantValidator = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters"),
  body("businessEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid business email")
    .normalizeEmail(),
  body("businessPhone")
    .optional()
    .trim(),
  body("businessAddress")
    .optional()
    .trim(),
  body("city")
    .optional()
    .trim(),
  body("state")
    .optional()
    .trim(),
  body("country")
    .optional()
    .trim(),
  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Website must be a valid URL"),
  body("logo")
    .optional()
    .trim()
    .isURL()
    .withMessage("Logo must be a valid URL"),
];

export const updateMerchantValidator = [
  body("businessName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category cannot exceed 100 characters"),
  body("businessEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid business email")
    .normalizeEmail(),
  body("businessPhone")
    .optional()
    .trim(),
  body("businessAddress")
    .optional()
    .trim(),
  body("city")
    .optional()
    .trim(),
  body("state")
    .optional()
    .trim(),
  body("country")
    .optional()
    .trim(),
  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Website must be a valid URL"),
  body("logo")
    .optional()
    .trim()
    .isURL()
    .withMessage("Logo must be a valid URL"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("profileImage")
    .optional()
    .trim()
    .isURL()
    .withMessage("Profile image must be a valid URL"),
  body("walletAddress")
    .optional()
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage("Invalid Stellar public key format"),
];

export const linkWalletValidator = [
  body("walletAddress")
    .trim()
    .notEmpty()
    .withMessage("Wallet address is required")
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage("Invalid Stellar public key format"),
  body("walletProvider")
    .optional()
    .trim()
    .isIn(["Freighter"])
    .withMessage("Wallet provider must be Freighter"),
  body("network")
    .optional()
    .trim()
    .isIn(["testnet", "mainnet"])
    .withMessage("Network must be testnet or mainnet"),
];

export const createEventValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Event name is required")
    .isLength({ max: 200 })
    .withMessage("Event name cannot exceed 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("venue")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Venue cannot exceed 300 characters"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Location cannot exceed 300 characters"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date"),
  body("registrationDeadline")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("Registration deadline must be a valid date"),
  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isInt({ min: 1 })
    .withMessage("Capacity must be at least 1"),
  body("visibility")
    .optional()
    .trim()
    .isIn(["Public", "Private"])
    .withMessage("Visibility must be Public or Private"),
  body("status")
    .optional()
    .trim()
    .isIn(["Draft", "Published", "Cancelled", "Completed"])
    .withMessage("Status must be Draft, Published, Cancelled, or Completed"),
  body("allowMultipleScans")
    .optional()
    .isBoolean()
    .withMessage("Allow multiple scans must be a boolean"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

export const updateEventValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Event name cannot exceed 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("venue")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Venue cannot exceed 300 characters"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Location cannot exceed 300 characters"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
  body("registrationDeadline")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("Registration deadline must be a valid date"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be at least 1"),
  body("visibility")
    .optional()
    .trim()
    .isIn(["Public", "Private"])
    .withMessage("Visibility must be Public or Private"),
  body("status")
    .optional()
    .trim()
    .isIn(["Draft", "Published", "Cancelled", "Completed"])
    .withMessage("Status must be Draft, Published, Cancelled, or Completed"),
  body("allowMultipleScans")
    .optional()
    .isBoolean()
    .withMessage("Allow multiple scans must be a boolean"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

export const updateWalletValidator = [
  body("walletAddress")
    .optional()
    .trim()
    .matches(/^G[A-Z0-9]{55}$/)
    .withMessage("Invalid Stellar public key format"),
  body("walletProvider")
    .optional()
    .trim()
    .isIn(["Freighter"])
    .withMessage("Wallet provider must be Freighter"),
  body("network")
    .optional()
    .trim()
    .isIn(["testnet", "mainnet"])
    .withMessage("Network must be testnet or mainnet"),
];