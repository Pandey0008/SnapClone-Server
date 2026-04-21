import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
{
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    media:
    {
        url:
        {
            type: String,
            required: true
        },

        public_id:
        {
            type: String,
            required: true
        }
    },

    caption:
    {
        type: String,
        default: ""
    },

    viewers:
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    expiresAt:
    {
        type: Date,
        required: true
    },

    isArchived:
    {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});

export default mongoose.model("Story", storySchema);