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
} from "lucide-react";
import useChatStore from "@/store/chatStore";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
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
              <span>
                {message.status === "read" ? (
                  <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                ) : message.status === "delivered" ? (
                  <CheckCheck className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
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
  const [sending, setSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleSend = async () => {
    if (!inputText.trim() || !activeConversation) return;
    const content = inputText.trim();
    setInputText("");
    setSending(true);

    const extra: Record<string, any> = {};
    if (replyTo) {
      extra.replyToId = replyTo.id;
    }
    setReplyTo(null);

    try {
      await sendMessage(activeConversation.id, content, "text", extra);
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
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
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
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </p>
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

            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
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
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="h-20 w-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a conversation</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              Choose a conversation from the left to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
