import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  locationVisibility: {

  type: String,

  enum: ["everyone", "friends", "ghost"],

  default: "friends"

},

  latitude: Number,
  longitude: Number,

  updatedAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("Location", locationSchema);