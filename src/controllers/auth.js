import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  console.log("Received Google login request");
  try {

    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        displayName: name,
        email,
        avatarUrl: picture,
        oauthId: sub,
        oauthProvider: "google",
      });
    }

    // FIX: Use same payload shape as regular login ({ userId } not { id })
    // FIX: Return key as `accessToken` to match what the frontend expects
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login success",
      accessToken,   // ← was `token`, frontend reads `data.accessToken`
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });

    console.log("Google login successful for user:", email);

  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

export const register = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      displayName,
      email,
      passwordHash
    });

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(201).json({
      user: { _id: user._id, displayName: user.displayName, email: user.email },
      accessToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      user: { _id: user._id, displayName: user.displayName, email: user.email },
      accessToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};