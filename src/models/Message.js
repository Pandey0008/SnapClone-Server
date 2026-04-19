import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  mediaUrl: { type: String },
  readAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);