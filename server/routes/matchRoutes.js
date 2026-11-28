import { Router } from "express";
import {
  getSlots,
  createMatch,
  getMatches,
  getMyMatches,
  getMatchById,
  joinMatch,
  leaveMatch,
  updateMatch,
  cancelMatch,
} from "../controllers/matchController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/slots", protect, getSlots);
router.get("/matches", protect, getMatches);
router.post("/matches", protect, createMatch);
router.get("/matches/mine", protect, getMyMatches);
router.get("/matches/:id", protect, getMatchById);
router.patch("/matches/:id", protect, updateMatch);
router.delete("/matches/:id", protect, cancelMatch);
router.post("/matches/:id/join", protect, joinMatch);
router.delete("/matches/:id/leave", protect, leaveMatch);

export default router;