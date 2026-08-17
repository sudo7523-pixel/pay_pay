import express from "express";
import { pay } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/:merchantCode", pay);

export default router;
