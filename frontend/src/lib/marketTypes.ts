export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  logo?: string;
  banner?: string;
  description?: string;
  location?: Record<string, string>;
  whatsapp?: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  memberSince: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MarketProduct {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  stock: number;
  location?: Record<string, string>;
  condition: "new" | "used";
  sizes?: string[];
  colors?: string[];
  specifications?: Record<string, string>;
  status: "active" | "inactive" | "sold_out";
  rating: number;
  reviewCount: number;
  seller?: SellerProfile;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: MarketProduct;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
  paymentMethod: string;
  shippingAddress: {
    fullname: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    notes?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  seller?: SellerProfile;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: MarketProduct;
}

export interface MarketReview {
  id: string;
  reviewerId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface WishlistItem {
  id: string;
  productId: string;
  product?: MarketProduct;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participant?: {
    id: string;
    name: string;
    avatar?: string;
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
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
