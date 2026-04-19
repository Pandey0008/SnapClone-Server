import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  caption: { type: String, maxlength: 150 },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Story', StorySchema);