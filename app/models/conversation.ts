import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true, // Mỗi sessionId là duy nhất
  },
  lastChatTime: {
    type: Date,
    default: Date.now,
    index: true, // Tăng tốc sắp xếp theo thời gian
  },
});

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
