import express from "express";

import { updateLocation , getFriendsLocations , updateLocationVisibility } from "../controllers/locationController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/update", verifyToken, updateLocation);
router.get("/friends", verifyToken, getFriendsLocations);
router.put(
  "/location-visibility",
  verifyToken,
  updateLocationVisibility
);

export default router;