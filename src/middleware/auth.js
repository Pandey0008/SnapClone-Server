import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: Handle both token formats:
    // - Regular login/register uses { userId, role }
    // - Old Google login tokens used { id } (before the auth.js fix was deployed)
    // Normalize to always have req.user.userId
    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
