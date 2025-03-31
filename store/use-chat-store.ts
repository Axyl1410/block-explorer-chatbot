import { Conversation, Message } from "@/types";
import { create } from "zustand";

interface ChatState {
  // User and session info
  userId: string | null;
  sessionId: string | null;

  // Application data
  messages: Message[];
  conversations: Conversation[];
  input: string;
  isLoading: boolean;
  isFetching: boolean;
  isChat: boolean;

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
  setIsFetchingConversations: (isFetching: boolean) => void;
  setIsChat: (isChat: boolean) => void;

  // Reset store
  reset: () => void;
  resetContext: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  userId: null,
  sessionId: null,
  messages: [],
  conversations: [],
  input: "",
  isLoading: false,
  chainId: null,
  contractAddress: null,
  isFetching: false,
  isChat: false,

  // Actions
  setUserId: (userId) => set({ userId }),
  setSessionId: (sessionId) => set({ sessionId }),
  setMessages: (messages) => set({ messages }),
  setConversations: (conversations) => set({ conversations }),
  setInput: (input) => set({ input }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setChainId: (chainId) => set({ chainId }),
  setContractAddress: (contractAddress) => set({ contractAddress }),
  setIsFetchingConversations: (isFetching) => set({ isFetching }),
  setIsChat: (isChat) => set({ isChat }),

  reset: () =>
    set(() => ({
      sessionId: null,
      messages: [],
      conversations: [],
      input: "",
      isLoading: false,
      chainId: null,
      contractAddress: null,
      userId: "", // Preserve userId
    })),

  resetContext: () =>
    set(() => ({
      chainId: null,
      contractAddress: null,
    })),
}));
