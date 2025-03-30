import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
      ref: "Conversation", // Reference to Conversation model
    },
    userMessage: {
      type: String,
      default: null,
    },
    botMessage: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create compound indexes for faster queries
messageSchema.index({ sessionId: 1, timestamp: 1 });
messageSchema.index({ userId: 1, sessionId: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
