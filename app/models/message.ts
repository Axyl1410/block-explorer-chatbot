import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true, // Tăng tốc truy vấn theo userId
  },
  sessionId: {
    type: String,
    required: true,
    index: true, // Tăng tốc truy vấn theo sessionId
  },
  userMessage: {
    type: String,
    default: null, // Tin nhắn của người dùng, có thể null nếu là bot
  },
  botMessage: {
    type: String,
    default: null, // Tin nhắn của bot, có thể null nếu là người dùng
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // Tăng tốc sắp xếp theo thời gian
  },
});

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
