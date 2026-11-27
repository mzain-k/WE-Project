import { Router } from "express";
import {
  getSlots,
  createMatch,
  getMatches,
  getMatchById,
  joinMatch,
} from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/slots", protect, getSlots);
router.get("/matches", protect, getMatches);
router.post("/matches", protect, createMatch);
router.get("/matches/:id", protect, getMatchById);
router.post("/matches/:id/join", protect, joinMatch);

export default router;