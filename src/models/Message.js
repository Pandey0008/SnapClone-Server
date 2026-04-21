import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  roomId:      { type: String, required: true, index: true },
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:        { type: String },
  mediaUrl:    { type: String },
  messageType: { type: String, enum: ['text', 'snap', 'media'], default: 'text' },
  snapId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Snap' }, // only for snap messages
  snapViewed:  { type: Boolean, default: false }, // true once recipient opens it
  readAt:      { type: Date },
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);