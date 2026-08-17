import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createEventValidator, updateEventValidator } from "../utils/validators.js";
import { create, list, get, update, remove } from "../controllers/event.controller.js";

const router = Router();

router.post("/", protect, createEventValidator, validate, create);
router.get("/", protect, list);
router.get("/:id", protect, get);
router.put("/:id", protect, updateEventValidator, validate, update);
router.delete("/:id", protect, remove);

export default router;
