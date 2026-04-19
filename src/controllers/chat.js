import Message from '../models/Message.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT middleware

    // Find all conversations for the current user
    const messages = await Message.find({ 
      roomId: { $regex: userId } 
    }).populate('senderId', 'displayName avatarUrl email');

    // Group by roomId and get the latest message
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      if (!conversationsMap.has(msg.roomId)) {
        conversationsMap.set(msg.roomId, {
          roomId: msg.roomId,
          messages: []
        });
      }
      conversationsMap.get(msg.roomId).messages.push(msg);
    });

    // Build response with peer info and last message
    const conversations = [];

    for (const [roomId, conv] of conversationsMap) {
      const [user1Id, user2Id] = roomId.split('_');
      const peerId = user1Id === userId ? user2Id : user1Id;

      const peer = await User.findById(peerId).select('displayName avatarUrl email');
      if (!peer) continue;

      const sortedMessages = conv.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const lastMessage = sortedMessages[0];
      
      const unreadCount = conv.messages.filter(
        msg => msg.senderId._id.toString() !== userId && !msg.readAt
      ).length;

      conversations.push({
        roomId,
        peer: {
          _id: peer._id,
          displayName: peer.displayName,
          avatarUrl: peer.avatarUrl,
          email: peer.email
        },
        lastMessage: {
          text: lastMessage.text || '[Media]',
          senderId: lastMessage.senderId._id
        },
        lastMessageAt: lastMessage.createdAt,
        unreadCount
      });
    }

    // Get all friends and add those without existing conversations
    const currentUser = await User.findById(userId).populate('friends', 'displayName avatarUrl email');
    const conversationPeerIds = conversations.map(c => c.peer._id.toString());

    if (currentUser.friends) {
      for (const friend of currentUser.friends) {
        if (!conversationPeerIds.includes(friend._id.toString())) {
          conversations.push({
            roomId: [userId, friend._id.toString()].sort().join('_'),
            peer: {
              _id: friend._id,
              displayName: friend.displayName,
              avatarUrl: friend.avatarUrl,
              email: friend.email
            },
            lastMessage: null,
            lastMessageAt: friend.createdAt || new Date(),
            unreadCount: 0
          });
        }
      }
    }

    // Sort by last message date (newest first)
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    if (!roomId.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const messages = await Message.find({ roomId })
      .populate('senderId', 'displayName avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendMessage = async (req, res, io) => {
  try {
    const { roomId, text, mediaUrl } = req.body;
    const userId = req.user.userId;

    // Verify user is part of this conversation
    if (!roomId.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const message = await Message.create({
      roomId,
      senderId: userId,
      text,
      mediaUrl
    });

    await message.populate('senderId', 'displayName avatarUrl');

    // Emit message to all users in the room via Socket.IO
    if (io) {
      io.to(roomId).emit('new-message', {
        roomId,
        message: {
          _id: message._id,
          senderId: message.senderId,
          text: message.text,
          mediaUrl: message.mediaUrl,
          createdAt: message.createdAt
        }
      });
    }

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
