import express from "express";
import { suggestReplies } from "../controllers/ai.js";
import { verifyToken  } from "../middleware/auth.js";

const router = express.Router();

router.post("/suggest-reply", verifyToken , suggestReplies);

export default router;