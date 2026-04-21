import express from 'express';
import { upload } from '../middleware/multer.js';
import { verifyToken } from '../middleware/auth.js';
import { sendSnap, getInbox, viewSnap } from '../controllers/snap.js';

const router = express.Router();

router.use(verifyToken);

router.post('/send', upload.single('file'), sendSnap);   // send a snap
router.get('/inbox', getInbox);                           // get unviewed snaps
router.get('/:snapId', viewSnap);                         // view + mark viewed

export default router;