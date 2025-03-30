export interface Message {
  _id: string;
  userMessage: string | null;
  botMessage: string | null;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  sessionId: string;
  title: string;
  lastChatTime: string;
  createdAt: string;
  updatedAt: string;
}
