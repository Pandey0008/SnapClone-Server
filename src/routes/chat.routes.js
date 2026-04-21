import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/chat.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to pass io to routes
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// verifyTokened routes (require authentication)
router.get('/conversations', verifyToken, getConversations);
router.get('/messages/:roomId', verifyToken, getMessages);
router.post('/messages', verifyToken, (req, res) => {
  sendMessage(req, res, req.io);
});

export default router;
