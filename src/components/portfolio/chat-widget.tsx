"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { MessageCircle, X, Send, Loader2, MinusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { developer } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface ChatMsg {
  id: string;
  sessionId: string;
  sender: "visitor" | "owner";
  name?: string;
  content: string;
  timestamp: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "init";
    const key = "ya-chat-session";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  });
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect when first opened
  useEffect(() => {
    if (!open || socketRef.current) return;
    // When NEXT_PUBLIC_CHAT_URL is set (standalone deployment), connect to it
    // directly. Otherwise keep the legacy Caddy-based path (on-prem gateway
    // proxies /?XTransformPort=3003 to the chat service) so local/FC deploys
    // keep working without changes.
    const url = process.env.NEXT_PUBLIC_CHAT_URL || "/?XTransformPort=3003";
    const s = io(url, {      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = s;
    s.on("connect", () => {
      setConnected(true);
      s.emit("join", { sessionId, name: "Visitor" });
    });
    s.on("disconnect", () => setConnected(false));
    s.on("history", (data: { messages: ChatMsg[] }) => {
      if (data.messages?.length) setMessages(data.messages);
    });
    s.on("message", (msg: ChatMsg) => {
      setMessages((m) => [...m, msg]);
      if (msg.sender === "owner" && !open) setUnread((u) => u + 1);
    });
    s.on("system", (data: { content: string; timestamp: string }) => {
      setMessages((m) => [
        ...m,
        {
          id: "sys-" + Date.now(),
          sessionId,
          sender: "owner",
          name: developer.name,
          content: data.content,
          timestamp: data.timestamp,
        },
      ]);
    });
    s.on("typing", (data: { isTyping: boolean }) => setTyping(data.isTyping));
    s.on("online-count", (data: { count: number }) => setOnlineCount(data.count));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [open, sessionId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, open]);

  // reset unread when opened — handled in toggle handler below

  const send = () => {
    const content = input.trim();
    const s = socketRef.current;
    if (!content || !s || !connected) return;
    s.emit("visitor-message", { sessionId, content, name: "Visitor" });
    setInput("");
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    s.emit("typing", { sessionId, isTyping: false });
  };

  const onType = (v: string) => {
    setInput(v);
    const s = socketRef.current;
    if (!s) return;
    s.emit("typing", { sessionId, isTyping: true });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      s.emit("typing", { sessionId, isTyping: false });
    }, 1500);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) setUnread(0);
            return next;
          });
        }}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-pink-500 text-white shadow-glow-pink transition-colors",
          open && "rotate-180"
        )}
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-pink-500/40" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-sky-500/20 bg-card shadow-card-hover"
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 bg-gradient-to-r from-sky-500 to-pink-500 p-4 text-white">
              <div className="relative">
                <img
                  src="/assets/dev-avatar.png"
                  alt={developer.name}
                  className="h-10 w-10 rounded-full border-2 border-white/50 object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  {developer.name}
                  {connected && (
                    <span className="flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-medium">
                      <Users className="h-2.5 w-2.5" />
                      {onlineCount} online
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-90">
                  {connected ? "🟢 Online · typically replies in minutes" : "Connecting..."}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 transition-colors hover:bg-white/20"
                aria-label="Minimize"
              >
                <MinusCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-gradient-to-b from-sky-50/50 to-pink-50/30 dark:from-slate-900 dark:to-slate-900" ref={scrollRef}>
              <div className="space-y-3 p-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <div className="text-4xl">👋</div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hi! Send a message to start the conversation.
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <Bubble key={m.id} msg={m} />
                ))}
                {typing && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-500 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-wood [animation-delay:300ms]" />
                    </div>
                    {developer.firstName} is typing...
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-sky-500/10 bg-card p-3">
              <Input
                value={input}
                onChange={(e) => onType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message..."
                disabled={!connected}
                className="rounded-full"
              />
              <Button
                size="icon"
                onClick={send}
                disabled={!connected || !input.trim()}
                className="shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-pink-500 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {!connected && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                  <span className="text-sm">Connecting to chat...</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg }: { msg: ChatMsg }) {
  const isOwner = msg.sender === "owner";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isOwner ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
          isOwner
            ? "rounded-tl-sm bg-white text-foreground dark:bg-slate-800"
            : "rounded-tr-sm bg-gradient-to-br from-sky-500 to-pink-500 text-white"
        )}
      >
        {isOwner && (
          <div className="mb-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
            {msg.name || developer.name}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <div
          className={cn(
            "mt-1 text-right text-[9px] opacity-60",
            isOwner ? "text-muted-foreground" : "text-white"
          )}
        >
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}
