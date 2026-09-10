"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Trash2,
  Reply,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  Check,
  CheckCheck,
  X,
  Image as ImageIcon,
  Plus,
  UserPlus,
  Loader2,
  Scissors,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useChatStore from "@/store/chatStore";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Conversation, Message } from "@/lib/chatTypes";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday =
    d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getOtherUser(conversation: Conversation, currentUserId: string) {
  return conversation.participants?.find((p) => p.id !== currentUserId) || {
    id: "",
    name: "Unknown",
    avatar: undefined,
  };
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="flex gap-1 bg-gray-200 rounded-2xl px-4 py-2.5">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function StartChatModal({
  isOpen,
  onClose,
  onSelectContact,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (targetId: string, name: string) => Promise<void>;
}) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const [tailorsRes, vendorsRes] = await Promise.allSettled([
          api.get("/tailors?limit=30"),
          api.get("/vendors?limit=30"),
        ]);

        const list: any[] = [];

        if (tailorsRes.status === "fulfilled") {
          const tailorsData = tailorsRes.value.data?.data || tailorsRes.value.data || [];
          tailorsData.forEach((t: any) => {
            list.push({
              id: t.id,
              targetId: t.userId || t.id,
              name: t.user?.name || "Tailor & Designer",
              avatar: t.user?.avatar || t.photo,
              role: "Tailor",
              detail: t.specializations?.slice(0, 3).join(", ") || t.skills?.slice(0, 3).join(", ") || "Fashion Tailor",
            });
          });
        }

        if (vendorsRes.status === "fulfilled") {
          const vendorsData = vendorsRes.value.data?.data || vendorsRes.value.data || [];
          vendorsData.forEach((v: any) => {
            list.push({
              id: v.id,
              targetId: v.userId || v.id,
              name: v.businessName || v.user?.name || "Textile Vendor",
              avatar: v.logo || v.user?.avatar,
              role: "Vendor",
              detail: v.categories?.slice(0, 3).join(", ") || "Fabrics & Accessories",
            });
          });
        }

        if (isMounted) setContacts(list);
      } catch (err) {
        console.error("Failed to load contacts", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchContacts();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.detail && c.detail.toLowerCase().includes(q)) ||
      c.role.toLowerCase().includes(q)
    );
  });

  const handleSelect = async (c: any) => {
    setStartingId(c.targetId);
    try {
      await onSelectContact(c.targetId, c.name);
      onClose();
    } finally {
      setStartingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary-500" />
                Start a New Chat
              </h2>
              <p className="text-xs text-gray-500">Select a tailor or vendor to message</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, fabrics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[260px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
                <p className="text-xs font-medium">Finding available contacts...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No contacts found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search query</p>
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = startingId === c.targetId;
                return (
                  <button
                    key={`${c.role}-${c.id}`}
                    onClick={() => handleSelect(c)}
                    disabled={startingId !== null}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-primary-50/60 transition-all border border-transparent hover:border-primary-100 group text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden shadow-inner">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="h-full w-full object-cover" />
                          ) : (
                            c.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 p-1 rounded-full border-2 border-white text-white text-[9px] font-bold ${
                            c.role === "Tailor" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        >
                          {c.role === "Tailor" ? (
                            <Scissors className="h-2.5 w-2.5" />
                          ) : (
                            <Store className="h-2.5 w-2.5" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-700">
                            {c.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              c.role === "Tailor"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {c.role}
                          </span>
                        </div>
                        {c.detail && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{c.detail}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-3">
                      {isSelected ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                      ) : (
                        <span className="text-xs font-semibold text-primary-600 bg-primary-100/70 group-hover:bg-primary-500 group-hover:text-white px-3.5 py-1.5 rounded-xl transition-all">
                          Chat
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  senderName,
  senderAvatar,
  replyTo,
  onReply,
  onDelete,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  senderName: string;
  senderAvatar?: string;
  replyTo?: Message;
  onReply: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
        {!isOwn && <div className="w-8" />}
        <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isOwn ? "bg-primary-500/20 text-gray-500 italic" : "bg-gray-100 text-gray-500 italic"}`}>
          <p className="text-sm">Message deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1 group`}>
      {!isOwn && (
        <div className="w-8 mr-2 flex-shrink-0">
          {showAvatar && (
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold overflow-hidden">
              {senderAvatar ? (
                <img src={senderAvatar} alt="" className="h-full w-full object-cover" />
              ) : (
                senderName.charAt(0).toUpperCase()
              )}
            </div>
          )}
        </div>
      )}
      <div className={`relative max-w-[75%] ${isOwn ? "order-1" : ""}`}>
        {message.replyToId && replyTo && (
          <div className={`mb-1 px-3 py-1.5 rounded-t-2xl text-xs border-l-2 ${isOwn ? "bg-primary-600/90 border-white/50 text-white/80" : "bg-gray-100 border-gray-400 text-gray-500"}`}>
            <p className="font-medium truncate">{replyTo.sender?.name || "User"}</p>
            <p className="truncate opacity-75">{replyTo.content}</p>
          </div>
        )}

        <div className={`relative px-4 py-2.5 ${
          isOwn
            ? `bg-primary-500 text-white ${message.replyToId ? "rounded-t-none rounded-2xl" : "rounded-2xl"}`
            : `bg-white text-gray-900 border border-gray-200 ${message.replyToId ? "rounded-t-none rounded-2xl" : "rounded-2xl"}`
        }`}>
          {message.type === "image" && message.imageUrl && (
            <img src={message.imageUrl} alt="" className="rounded-xl mb-2 max-w-full max-h-60 object-cover" />
          )}
          {message.type === "file" && message.fileUrl && (
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mb-2 underline text-sm opacity-90">
              <Paperclip className="h-4 w-4" />
              {message.fileName || "Attachment"}
            </a>
          )}
          {(message.type === "text" || message.type === undefined) && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          <div className={`flex items-center justify-end gap-1.5 mt-1 ${isOwn ? "text-white/70" : "text-gray-400"}`}>
            <span className="text-[10px]">{formatMessageTime(message.createdAt)}</span>
            {isOwn && (
              <span className="flex items-center gap-1">
                {message.status === "read" ? (
                  <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                ) : message.status === "delivered" ? (
                  <CheckCheck className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span className="text-[10px] uppercase tracking-wide">
                  {message.status === "read" ? "Read" : message.status === "delivered" ? "Delivered" : "Sent"}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full bg-white shadow border border-gray-100 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[120px]">
                <button
                  onClick={() => { onReply(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Reply className="h-3.5 w-3.5" /> Reply
                </button>
                {isOwn && (
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    typingUsers,
    onlineUsers,
    socket,
    connectSocket,
    loadConversations,
    loadMessages,
    sendMessage,
    startConversation,
    markRead,
    setTyping,
    setActiveConversation,
    disconnect,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [attachment, setAttachment] = useState<{ type: "image" | "file"; url: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = user?.id || "";

  useEffect(() => {
    connectSocket();
    loadConversations();
    return () => {};
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      markRead(activeConversation.id);
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[activeConversation?.id || ""]?.length, activeConversation?.id]);

  const handleSelectConversation = useCallback((conv: Conversation) => {
    setActiveConversation(conv);
    setMobileShowChat(true);
    setReplyTo(null);
  }, [setActiveConversation]);

  const handleStartChatWithContact = async (targetId: string, name: string) => {
    try {
      const conv = await startConversation(targetId);
      setActiveConversation(conv);
      setMobileShowChat(true);
      toast.success(`Chat started with ${name}`);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || "Failed to start conversation";
      toast.error(errorMsg);
    }
  };

  const handleSend = async () => {
    if (!activeConversation || (!inputText.trim() && !attachment)) return;
    const content = inputText.trim();
    setInputText("");
    setSending(true);

    const extra: Record<string, any> = {};
    if (replyTo) {
      extra.replyToId = replyTo.id;
    }
    if (attachment) {
      if (attachment.type === "image") {
        extra.imageUrl = attachment.url;
      } else {
        extra.fileUrl = attachment.url;
        extra.fileName = attachment.name;
      }
    }
    setReplyTo(null);
    setAttachment(null);

    try {
      await sendMessage(activeConversation.id, content || attachment?.name || "Attachment", attachment?.type || "text", extra);
    } catch {
      toast.error("Failed to send message");
      setInputText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (activeConversation) {
      setTyping(activeConversation.id, true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        setTyping(activeConversation.id, false);
      }, 2000);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Use files under 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      const isImage = file.type.startsWith("image/");
      setAttachment({
        type: isImage ? "image" : "file",
        url,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversation) return;
    try {
      const { socket: s } = useChatStore.getState();
      if (s?.connected) {
        s.emit("deleteMessage", { messageId, conversationId: activeConversation.id });
      }
      useChatStore.setState((state) => {
        const msgs = state.messages[activeConversation.id] || [];
        const updated = msgs.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, content: "Message deleted" } : m
        );
        return { messages: { ...state.messages, [activeConversation.id]: updated } };
      });
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const other = getOtherUser(conv, currentUserId);
    const productName = conv.product?.name || "";
    return (
      other.name.toLowerCase().includes(q) ||
      productName.toLowerCase().includes(q) ||
      conv.lastMessage?.content?.toLowerCase().includes(q)
    );
  });

  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];
  const activeOther = activeConversation ? getOtherUser(activeConversation, currentUserId) : null;
  const isOtherOnline = activeOther ? onlineUsers.includes(activeOther.id) : false;
  const activeTypingUsers = activeConversation
    ? (typingUsers[activeConversation.id] || []).filter((id) => id !== currentUserId)
    : [];

  const shouldShowDateSeparator = (msg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const d1 = new Date(msg.createdAt).toDateString();
    const d2 = new Date(prevMsg.createdAt).toDateString();
    return d1 !== d2;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <div className={`w-full md:w-96 lg:w-[400px] bg-white border-r border-gray-200 flex flex-col ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              {unreadCount > 0 && (
                <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all shadow-md shadow-primary-500/20 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Start Chat</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="h-16 w-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 mb-3">
                <MessageSquare className="h-8 w-8" />
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </p>
              <p className="text-gray-500 text-xs max-w-xs mb-4">
                {searchQuery ? "Try searching with a different name" : "Start a new conversation with a tailor or vendor"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-all shadow-md shadow-primary-500/20 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Start New Chat</span>
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = getOtherUser(conv, currentUserId);
              const isActive = activeConversation?.id === conv.id;
              const isOnline = onlineUsers.includes(other.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-gray-50 ${
                    isActive ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden">
                      {other.avatar ? (
                        <img src={other.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        other.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm truncate">{other.name}</span>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
                        {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
                      </span>
                    </div>
                    {conv.product && (
                      <p className="text-[11px] text-primary-500 truncate mt-0.5">{conv.product.name}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessage?.isDeleted
                          ? "Message deleted"
                          : conv.lastMessage?.content || "Start a conversation"}
                      </p>
                      {conv.unreadCount > 0 && !isActive && (
                        <span className="ml-2 bg-primary-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 flex-shrink-0">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
        {activeConversation && activeOther ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden">
                  {activeOther.avatar ? (
                    <img src={activeOther.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    activeOther.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isOtherOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{activeOther.name}</h3>
                <p className="text-xs text-gray-500">
                  {isOtherOnline ? "Online" : "Offline"}
                </p>
              </div>
              {activeConversation.product && (
                <Link
                  href={`/market/${activeConversation.product.id}`}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <div className="h-6 w-6 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                    {activeConversation.product.images?.[0] ? (
                      <img src={activeConversation.product.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <span className="truncate max-w-[120px]">{activeConversation.product.name}</span>
                </Link>
              )}
              {activeOther.phone && (
                <a
                  href={`tel:${activeOther.phone}`}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50"
                >
                  <Phone className="h-5 w-5" />
                </a>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {activeMessages.map((msg, idx) => {
                    const prevMsg = idx > 0 ? activeMessages[idx - 1] : undefined;
                    const isOwn = msg.senderId === currentUserId;
                    const showSeparator = shouldShowDateSeparator(msg, prevMsg);
                    const showAvatar = !isOwn && (
                      !prevMsg ||
                      prevMsg.senderId !== msg.senderId ||
                      shouldShowDateSeparator(msg, prevMsg)
                    );
                    const replyMsg = msg.replyToId
                      ? activeMessages.find((m) => m.id === msg.replyToId)
                      : undefined;

                    return (
                      <div key={msg.id}>
                        {showSeparator && (
                          <div className="flex items-center justify-center my-3">
                            <span className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                              {new Date(msg.createdAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        <MessageBubble
                          message={msg}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          senderName={msg.sender?.name || activeOther.name}
                          senderAvatar={msg.sender?.avatar}
                          replyTo={replyMsg}
                          onReply={() => setReplyTo(msg)}
                          onDelete={() => handleDeleteMessage(msg.id)}
                        />
                      </div>
                    );
                  })}
                  {activeTypingUsers.length > 0 && <TypingDots />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {replyTo && (
              <div className="px-4 py-2 bg-white border-t border-gray-100">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border-l-2 border-primary-500">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-primary-600">{replyTo.sender?.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{replyTo.content}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {attachment && (
              <div className="px-4 pb-2 bg-white">
                <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {attachment.type === "image" ? (
                        <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
                      ) : (
                        <Paperclip className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{attachment.name}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{attachment.type}</p>
                    </div>
                  </div>
                  <button onClick={() => setAttachment(null)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                  className="hidden"
                  onChange={handleAttachmentChange}
                />
                <button
                  onClick={handleAttachClick}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={(!inputText.trim() && !attachment) || sending}
                  className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="h-20 w-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 text-primary-500 shadow-inner">
              <MessageSquare className="h-10 w-10 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a conversation</h2>
            <p className="text-sm text-gray-500 max-w-xs mb-5">
              Choose an existing conversation from the list or start a new conversation with a contact
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Start New Chat</span>
            </button>
          </div>
        )}
      </div>

      <StartChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectContact={handleStartChatWithContact}
      />
    </div>
  );
}

