import { Router } from "express";
import { getSlots, createMatch } from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/slots", protect, getSlots);
router.post("/matches", protect, createMatch);

export default router