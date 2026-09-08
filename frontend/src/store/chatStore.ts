import { create } from "zustand";
import api from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { Conversation, Message } from "@/lib/chatTypes";

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  unreadCount: number;
  isTyping: boolean;
  typingUsers: Record<string, string[]>;
  onlineUsers: string[];
  socket: Socket | null;
  connectSocket: () => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string, extra?: Record<string, any>) => Promise<void>;
  startConversation: (participantId: string, productId?: string) => Promise<Conversation>;
  markRead: (conversationId: string) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  disconnect: () => void;
}

const SOCKET_URL = "https://dtailors.onrender.com";

const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  unreadCount: 0,
  isTyping: false,
  typingUsers: {},
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dt_token") : null;
    if (!token) return;

    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("newMessage", (message: any) => {
      const { activeConversation, messages } = get();
      const convId = message.conversationId;

      set((state) => {
        const existing = state.messages[convId] || [];
        const alreadyExists = existing.some((m) => m.id === message.id);
        if (alreadyExists) return state;

        const newMessages = { ...state.messages, [convId]: [...existing, message] };

        const updatedConversations = state.conversations.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount:
                activeConversation?.id === convId
                  ? 0
                  : message.senderId !== localStorage.getItem("dt_user_id")
                  ? c.unreadCount + 1
                  : c.unreadCount,
            };
          }
          return c;
        });

        const totalUnread = updatedConversations.reduce(
          (sum, c) => sum + (c.id === activeConversation?.id ? 0 : c.unreadCount),
          0
        );

        return {
          messages: newMessages,
          conversations: updatedConversations.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
          unreadCount: totalUnread,
        };
      });
    });

    socket.on("typing", (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
      set((state) => {
        const current = state.typingUsers[payload.conversationId] || [];
        let updated: string[];
        if (payload.isTyping) {
          updated = current.includes(payload.userId) ? current : [...current, payload.userId];
        } else {
          updated = current.filter((id) => id !== payload.userId);
        }
        return { typingUsers: { ...state.typingUsers, [payload.conversationId]: updated } };
      });
    });

    socket.on("userOnline", (userId: string) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.includes(userId)
          ? state.onlineUsers
          : [...state.onlineUsers, userId],
      }));
    });

    socket.on("userOffline", (userId: string) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== userId),
      }));
    });

    socket.on("messageRead", (payload: { messageId: string; conversationId: string; userId: string }) => {
      set((state) => {
        const convMessages = state.messages[payload.conversationId] || [];
        const updated = convMessages.map((m) =>
          m.id === payload.messageId ? { ...m, status: "read" as const } : m
        );
        return { messages: { ...state.messages, [payload.conversationId]: updated } };
      });
    });

    socket.on("messageDeleted", (payload: { messageId: string; conversationId: string }) => {
      set((state) => {
        const convMessages = state.messages[payload.conversationId] || [];
        const updated = convMessages.map((m) =>
          m.id === payload.messageId ? { ...m, isDeleted: true, content: "Message deleted" } : m
        );
        return { messages: { ...state.messages, [payload.conversationId]: updated } };
      });
    });

    set({ socket });
  },

  loadConversations: async () => {
    try {
      const res = await api.get("/chat/conversations");
      const conversations = res.data.conversations || res.data || [];
      const totalUnread = conversations.reduce(
        (sum: number, c: Conversation) => sum + (c.unreadCount || 0),
        0
      );
      set({ conversations, unreadCount: totalUnread });
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  },

  loadMessages: async (conversationId: string) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`);
      const msgs = res.data.messages || res.data || [];
      set((state) => ({
        messages: { ...state.messages, [conversationId]: msgs },
      }));
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  },

  sendMessage: async (conversationId, content, type = "text", extra = {}) => {
    const tempId = `temp-${Date.now()}`;
    const userId = (() => {
      try {
        return JSON.parse(localStorage.getItem("dt_user") || "{}").id;
      } catch {
        return "";
      }
    })();

    const optimistic: Message = {
      id: tempId,
      conversationId,
      senderId: userId,
      content,
      type: type as "text" | "image" | "file",
      status: "sent",
      createdAt: new Date().toISOString(),
      isDeleted: false,
      sender: JSON.parse(localStorage.getItem("dt_user") || "{}"),
      ...extra,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), optimistic],
      },
    }));

    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        type,
        ...extra,
      });

      const real = res.data.message || res.data;

      set((state) => {
        const msgs = state.messages[conversationId] || [];
        const updated = msgs.map((m) => (m.id === tempId ? { ...m, ...real } : m));
        return {
          messages: { ...state.messages, [conversationId]: updated },
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: real, updatedAt: real.createdAt }
              : c
          ),
        };
      });

      const { socket } = get();
      if (socket?.connected) {
        socket.emit("sendMessage", real);
      }
    } catch (err) {
      set((state) => {
        const msgs = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: msgs.filter((m) => m.id !== tempId),
          },
        };
      });
      throw err;
    }
  },

  startConversation: async (participantId, productId) => {
    const res = await api.post("/chat/conversations", { participantId, productId });
    const conversation = res.data.conversation || res.data;

    set((state) => {
      const exists = state.conversations.find((c) => c.id === conversation.id);
      if (exists) return state;
      return { conversations: [conversation, ...state.conversations] };
    });

    return conversation;
  },

  markRead: async (conversationId) => {
    const { messages, socket } = get();
    const userId = (() => {
      try {
        return JSON.parse(localStorage.getItem("dt_user") || "{}").id;
      } catch {
        return "";
      }
    })();
    const unread = (messages[conversationId] || []).filter(
      (m) => m.senderId !== userId && m.status !== "read" && !m.isDeleted
    );

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
      unreadCount: state.conversations.reduce(
        (sum, c) => sum + (c.id === conversationId ? 0 : c.unreadCount),
        0
      ),
    }));

    if (unread.length === 0) return;

    try {
      for (const msg of unread) {
        await api.post(`/chat/messages/${msg.id}/read`);
        if (socket?.connected) {
          socket.emit("markRead", { messageId: msg.id, conversationId });
        }
      }

      set((state) => {
        const msgs = state.messages[conversationId] || [];
        const unreadIds = unread.map((m) => m.id);
        const updated = msgs.map((m) =>
          unreadIds.includes(m.id) ? { ...m, status: "read" as const } : m
        );
        return { messages: { ...state.messages, [conversationId]: updated } };
      });
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  },

  setTyping: (conversationId, isTyping) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("typing", { conversationId, isTyping });
    }
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

export default useChatStore;
