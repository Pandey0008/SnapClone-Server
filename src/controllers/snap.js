import Snap from '../models/Snap.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// Build consistent roomId from two userIds (same logic as chat)
const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

// POST /api/v1/snaps/send
export const sendSnap = async (req, res) => {
  try {
    const senderId = req.user.userId;
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const recipientIds = JSON.parse(req.body.recipientIds || '[]');
    if (!recipientIds.length) return res.status(400).json({ error: 'At least one recipient required' });

    const caption = req.body.caption || '';
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const sender = await User.findById(senderId).select('displayName avatarUrl');
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, 'snapclone/snaps');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const snap = await Snap.create({
      senderId,
      recipientIds,
      mediaUrl: result.secure_url,
      mediaPublicId: result.public_id,
      mediaType,
      caption,
      viewedBy: [],
      expiresAt,
    });

    const io = req.app.get('io');

    // For each recipient — create a chat message + notify via socket
    for (const recipientId of recipientIds) {
      const roomId = getRoomId(senderId, recipientId);

      // Save snap message in chat room
      const message = await Message.create({
        roomId,
        senderId,
        messageType: 'snap',
        snapId: snap._id,
        snapViewed: false,
        text: caption || null,
      });

      await message.populate('senderId', 'displayName avatarUrl');

      // Push message into chat room so it appears in ChatThread
      io.to(roomId).emit('new-message', {
        roomId,
        message: {
          _id: message._id,
          senderId: message.senderId,
          messageType: 'snap',
          snapId: snap._id,
          snapViewed: false,
          text: message.text,
          createdAt: message.createdAt,
        }
      });

      // Also notify recipient directly (for badge / sound)
      io.to(`user_${recipientId}`).emit('snap-received', {
        snapId: snap._id,
        senderId,
        senderName: sender?.displayName || 'Someone',
        senderAvatar: sender?.avatarUrl || '',
        mediaType,
        caption,
        roomId,
      });
    }

    res.status(201).json({ message: 'Snap sent!', snapId: snap._id });
  } catch (err) {
    console.error('sendSnap error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/snaps/inbox
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.userId;
    const snaps = await Snap.find({
      recipientIds: userId,
      viewedBy: { $ne: userId },
      expiresAt: { $gt: new Date() },
    }).populate('senderId', 'displayName avatarUrl').sort({ createdAt: -1 });

    res.json({
      snaps: snaps.map(snap => ({
        _id: snap._id,
        sender: snap.senderId,
        mediaType: snap.mediaType,
        caption: snap.caption,
        createdAt: snap.createdAt,
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/snaps/:snapId — view once then delete
export const viewSnap = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { snapId } = req.params;

    const snap = await Snap.findById(snapId).populate('senderId', 'displayName avatarUrl');
    if (!snap) return res.status(404).json({ error: 'Snap not found or already expired' });

    if (!snap.recipientIds.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (snap.viewedBy.map(id => id.toString()).includes(userId)) {
      return res.status(410).json({ error: 'Snap already viewed' });
    }

    // Respond first
    res.json({
      _id: snap._id,
      sender: snap.senderId,
      mediaUrl: snap.mediaUrl,
      mediaType: snap.mediaType,
      caption: snap.caption,
      createdAt: snap.createdAt,
    });

    // Mark viewed
    snap.viewedBy.push(userId);
    await snap.save();

    // Mark the chat message as viewed too
    await Message.updateOne(
      { snapId: snap._id, roomId: getRoomId(snap.senderId._id.toString(), userId) },
      { snapViewed: true }
    );

    const io = req.app.get('io');

    // Notify sender
    io.to(`user_${snap.senderId._id}`).emit('snap-viewed', { snapId: snap._id, viewedBy: userId });

    // Update the message bubble in the chat room for both users
    const roomId = getRoomId(snap.senderId._id.toString(), userId);
    io.to(roomId).emit('snap-message-viewed', { snapId: snap._id.toString() });

    // Delete if all recipients viewed
    const allViewed = snap.recipientIds.every(id =>
      snap.viewedBy.map(v => v.toString()).includes(id.toString())
    );

    if (allViewed) {
      if (snap.mediaPublicId) await deleteFromCloudinary(snap.mediaPublicId).catch(console.error);
      await Snap.findByIdAndDelete(snapId);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};