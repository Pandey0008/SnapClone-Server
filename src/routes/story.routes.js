import express from "express";

import {
    createStory,
    getActiveStories,
    getArchivedStories,
    viewStory,
    deleteStory
}
from "../controllers/storyController.js";

import { verifyToken } from "../middleware/auth.js";

import upload from "../middleware/multer.js";

const router = express.Router();


router.post(
    "/create",
    verifyToken,
    upload.single("media"),
    createStory
);


router.get(
    "/feed",
    verifyToken,
    getActiveStories
);


router.get(
    "/archive",
    verifyToken,
    getArchivedStories
);


router.post(
    "/view/:id",
    verifyToken,
    viewStory
);


router.delete(
    "/delete/:id",
    verifyToken,
    deleteStory
);


export default router;