import Story from "../models/Story.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";


// =======================
// CREATE STORY
// =======================

export const createStory = async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        message: "Media file required"
      });

    }


    // Upload using helper
    console.log("FILE BUFFER EXISTS:", !!req.file?.buffer);
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      "stories"
    );


    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );


    const story = await Story.create({

      user: req.user.userId,

      media: {

        url: result.secure_url,
        public_id: result.public_id

      },

      caption: req.body.caption || "",

      expiresAt

    });


    res.status(201).json(story);

  }

  catch (error) {

    console.error("CREATE STORY ERROR:", error.stack);

    res.status(500).json({
      message: error.message
    });

  }

};



// =======================
// GET ACTIVE STORIES
// =======================

export const getActiveStories = async (req, res) => {

  try {

    const stories = await Story.find({

      expiresAt: { $gt: new Date() },
      isArchived: false

    })

      .populate("user", "displayName avatarUrl")

      .sort({ createdAt: -1 });


    res.status(200).json(stories);

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// =======================
// GET ARCHIVED STORIES
// =======================

export const getArchivedStories = async (req, res) => {

  try {

    const stories = await Story.find({

      user: req.user.userId,
      isArchived: true

    })

      .sort({ createdAt: -1 });


    res.status(200).json(stories);

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// =======================
// VIEW STORY
// =======================

export const viewStory = async (req, res) => {

  try {

    const story = await Story.findById(req.params.id);


    if (!story) {

      return res.status(404).json({
        message: "Story not found"
      });

    }


    if (!story.viewers.includes(req.user.userId)) {

      story.viewers.push(req.user.userId);

      await story.save();

    }


    res.status(200).json({
      message: "Story viewed"
    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// =======================
// DELETE STORY
// =======================

export const deleteStory = async (req, res) => {

  try {

    const story = await Story.findById(req.params.id);


    if (!story) {

      return res.status(404).json({
        message: "Story not found"
      });

    }


    if (story.user.toString() !== req.user.userId.toString()) {

      return res.status(403).json({
        message: "Unauthorized"
      });

    }


    await deleteFromCloudinary(story.media.public_id);

    await story.deleteOne();


    res.status(200).json({
      message: "Story deleted successfully"
    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};