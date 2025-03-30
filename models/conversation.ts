import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(), // Generate UUID automatically
    },
    title: {
      type: String,
      default: () => `Conversation ${new Date().toLocaleString()}`,
    },
    lastChatTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Create a compound index for faster queries
conversationSchema.index({ userId: 1, lastChatTime: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
