export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  phone?: string;
}

export interface Conversation {
  id: string;
  buyerId?: string;
  sellerId?: string;
  otherParticipant?: ChatParticipant;
  buyer?: ChatParticipant;
  seller?: {
    id: string;
    storeName?: string;
    logo?: string;
    user?: ChatParticipant;
  };
  participants?: ChatParticipant[];
  participantIds?: string[];
  productId?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  replyToId?: string;
  replyTo?: Message;
  status: "sent" | "delivered" | "read";
  createdAt: string;
  isDeleted: boolean;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  readBy?: string[];
}

export interface SocketMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  imageUrl?: string;
  fileUrl?: string;
  replyToId?: string;
  status: string;
  createdAt: string;
  isDeleted: boolean;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}
