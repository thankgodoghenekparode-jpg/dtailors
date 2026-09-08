"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { MessageSquare, ArrowRight, Store } from "lucide-react";

interface SellerConversation {
  id: string;
  participants?: { id: string; name: string; avatar?: string }[];
  product?: { id: string; name: string; images: string[] };
  lastMessage?: { content: string; createdAt: string; isDeleted?: boolean };
  unreadCount?: number;
  updatedAt: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SellerMessagesPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<SellerConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await api.get("/chat/conversations");
        const all = res.data.conversations || res.data || [];
        setConversations(all);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Inbox</h1>
        <p className="text-gray-500 mt-1">Your conversations with buyers</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No conversations yet</h3>
          <p className="text-sm text-gray-500 mb-4">Messages from buyers will appear here</p>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
          >
            <Store className="h-4 w-4" />
            View Your Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {conversations.map((conv) => {
            const other = conv.participants?.find((p) => p.id !== user?.id);
            const buyerName = other?.name || "Buyer";
            const unread = conv.unreadCount || 0;
            return (
              <Link
                key={conv.id}
                href={`/chat?conversation=${conv.id}`}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden">
                    {other?.avatar ? (
                      <img src={other.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      buyerName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">{buyerName}</span>
                    <span className="text-[11px] text-gray-400">
                      {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
                    </span>
                  </div>
                  {conv.product && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-5 w-5 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {conv.product.images?.[0] ? (
                          <img src={conv.product.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span className="text-[11px] text-primary-500 truncate">{conv.product.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage?.isDeleted
                        ? "Message deleted"
                        : conv.lastMessage?.content || "Start a conversation"}
                    </p>
                  </div>
                </div>
                {unread > 0 && (
                  <span className="bg-primary-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/chat" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
          <MessageSquare className="h-4 w-4" />
          Open Full Chat
        </Link>
      </div>
    </div>
  );
}
