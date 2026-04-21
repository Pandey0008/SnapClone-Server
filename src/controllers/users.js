import User from '../models/User.js';

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    // Search by displayName or username
    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { displayName: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } },
          ]
        }
      ]
    })
      .select('_id displayName username avatarUrl friends friendRequests sentRequests')
      .limit(20);

    // Calculate mutual friends and friendship status
    const currentUser = await User.findById(userId).select('friends');
    const currentUserFriends = currentUser.friends.map(id => id.toString());

    const enrichedUsers = users.map(user => {
      const userObj = user.toObject();
      const userFriends = (user.friends || []).map(id => id.toString());
      
      // Count mutual friends
      const mutual = userFriends.filter(id => 
        currentUserFriends.includes(id)
      ).length;

      // Determine friendship status
      let status = 'none'; // none, pending, requesting, friends
      if (currentUserFriends.includes(user._id.toString())) {
        status = 'friends';
      } else if (user.friendRequests?.some(id => id.toString() === userId)) {
        status = 'pending';
      } else if (user.sentRequests?.some(id => id.toString() === userId)) {
        status = 'requesting';
      }

      return {
        ...userObj,
        mutual,
        status
      };
    });

    res.json({ users: enrichedUsers });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate('friendRequests', 'displayName username avatarUrl friends');

    const requests = user.friendRequests || [];

    res.json({ requests, count: requests.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.userId;

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Cannot add yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    if (recipient.friends.includes(userId)) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already sent
    if (recipient.friendRequests.includes(userId)) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    // Add to recipient's friendRequests and sender's sentRequests
    recipient.friendRequests.push(userId);
    await recipient.save();

    const sender = await User.findById(userId);
    if (!sender.sentRequests) sender.sentRequests = [];
    sender.sentRequests.push(recipientId);
    await sender.save();

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add each other as friends
    if (!user.friends.includes(senderId)) {
      user.friends.push(senderId);
    }
    if (!sender.friends.includes(userId)) {
      sender.friends.push(userId);
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== userId);

    await user.save();
    await sender.save();

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== userId);

    await user.save();
    await sender.save();

    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await User.find({
      _id: { $ne: userId }
    })
      .select('_id displayName username avatarUrl friends friendRequests sentRequests')
      .limit(50);

    const currentUser = await User.findById(userId).select('friends');
    const currentUserFriends = currentUser.friends.map(id => id.toString());

    const enrichedUsers = users.map(user => {
      const userObj = user.toObject();
      const userFriends = (user.friends || []).map(id => id.toString());
      
      const mutual = userFriends.filter(id => 
        currentUserFriends.includes(id)
      ).length;

      let status = 'none';
      if (currentUserFriends.includes(user._id.toString())) {
        status = 'friends';
      } else if (user.friendRequests?.some(id => id.toString() === userId)) {
        status = 'pending';
      } else if (user.sentRequests?.some(id => id.toString() === userId)) {
        status = 'requesting';
      }

      return {
        ...userObj,
        mutual,
        status
      };
    });

    res.json({ users: enrichedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId)
      .populate('friends', '_id displayName avatarUrl username');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ friends: user.friends || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};