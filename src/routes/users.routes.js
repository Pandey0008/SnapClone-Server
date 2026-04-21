import express from 'express';
import {
  searchUsers,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getAllUsers
} from '../controllers/users.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// verifyTokened routes
router.get('/search', verifyToken, searchUsers);
router.get('/all', verifyToken, getAllUsers);
router.get('/requests', verifyToken, getPendingRequests);
router.post('/request/send', verifyToken, sendFriendRequest);
router.post('/request/accept', verifyToken, acceptFriendRequest);
router.post('/request/reject', verifyToken, rejectFriendRequest);

export default router;
