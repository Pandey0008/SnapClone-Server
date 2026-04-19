import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  displayName: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  avatarUrl: { type: String, default: '' },
  snapScore: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  oauthId: { type: String, sparse: true },
  oauthProvider: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('User', UserSchema);