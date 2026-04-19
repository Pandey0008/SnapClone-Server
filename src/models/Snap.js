import mongoose from 'mongoose';

const SnapSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  mediaUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  caption: { type: String, maxlength: 150 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// TTL Index (auto delete after expiresAt)
SnapSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Snap', SnapSchema);