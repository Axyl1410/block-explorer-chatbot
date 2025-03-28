import { create } from "zustand";
import { Conversation, Message } from "@/types";

interface ChatState {
  // User and session info
  userId: string;
  sessionId: string | null;

  // Application data
  messages: Message[];
  conversations: Conversation[];
  input: string;
  isLoading: boolean;

  // Contract/Chain data
  chainId: string | null;
  contractAddress: string | null;

  // Actions
  setUserId: (userId: string) => void;
  setSessionId: (sessionId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setInput: (input: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setChainId: (chainId: string | null) => void;
  setContractAddress: (address: string | null) => void;

  // Reset store
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  userId: "user123", // This should come from authentication
  sessionId: null,
  messages: [],
  conversations: [],
  input: "",
  isLoading: false,
  chainId: null,
  contractAddress: null,

  // Actions
  setUserId: (userId) => set({ userId }),
  setSessionId: (sessionId) => set({ sessionId }),
  setMessages: (messages) => set({ messages }),
  setConversations: (conversations) => set({ conversations }),
  setInput: (input) => set({ input }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setChainId: (chainId) => set({ chainId }),
  setContractAddress: (contractAddress) => set({ contractAddress }),

  // Reset store to initial state except userId
  reset: () =>
    set((state) => ({
      sessionId: null,
      messages: [],
      conversations: [],
      input: "",
      isLoading: false,
      chainId: null,
      contractAddress: null,
      userId: state.userId, // Preserve userId
    })),
}));
