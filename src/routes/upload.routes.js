import express from 'express';
import { upload } from '../middleware/multer.js';
import { verifyToken } from '../middleware/auth.js';
import {
  uploadAvatar,
  uploadChatAttachment,
  uploadSnap,
  uploadStory,
  deleteFile
} from '../controllers/upload.js';

const router = express.Router();

// Protect all upload routes
router.use(verifyToken);

// Upload avatar
router.post('/avatar', upload.single('file'), uploadAvatar);

// Upload chat attachment
router.post('/chat-attachment', upload.single('file'), uploadChatAttachment);

// Upload snap
router.post('/snap', upload.single('file'), uploadSnap);

// Upload story
router.post('/story', upload.single('file'), uploadStory);

// Delete file
router.delete('/file', deleteFile);

export default router;
