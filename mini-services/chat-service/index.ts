import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server } from "socket.io";

// In-memory message store (per session) for the live chat widget.
// Owner (Yaseen) messages are echoed to all visitors in the same room so
// we can demonstrate real-time back-and-forth. Messages also persist to
// the Next.js Prisma DB via an internal HTTP call so history survives restarts.

interface LiveMessage {
  id: string;
  sessionId: string;
  sender: "visitor" | "owner";
  name?: string;
  content: string;
  timestamp: string;
}

const PORT = 3003;

// Simple in-memory recent message buffer (last 50 per session)
const sessionMessages = new Map<string, LiveMessage[]>();
const MAX_HISTORY = 50;

const httpServer = createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    // Health-check endpoint
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "chat-service",
          port: PORT,
          uptime: process.uptime(),
          connections: io.engine.clientsCount,
        })
      );
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Yaseen Ahmad Chat Service — running. Connect via Socket.io.");
  }
);

const io = new Server(httpServer, {
  // DO NOT change the path — Caddy uses it to forward requests.
  path: "/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function persistMessage(msg: LiveMessage) {
  try {
    const body = JSON.stringify({
      sessionId: msg.sessionId,
      sender: msg.sender,
      name: msg.name,
      content: msg.content,
    });
    fetch("http://localhost:3000/api/chat-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => {});
  } catch {
    // persistence is best-effort
  }
}

io.on("connection", (socket) => {
  console.log(`[chat] connected: ${socket.id}`);

  // Visitor joins their own session room
  socket.on("join", (data: { sessionId: string; name?: string }) => {
    const sessionId = data?.sessionId || socket.id;
    socket.join(`session:${sessionId}`);
    socket.data.sessionId = sessionId;
    socket.data.name = data?.name || "Visitor";

    // Send recent history
    const history = sessionMessages.get(sessionId) || [];
    socket.emit("history", { messages: history });

    // Owner presence announcement
    socket.emit("system", {
      content:
        "👋 Hi! I'm Yaseen Ahmad. I'm currently online — ask me anything about your project. I typically reply within a few minutes.",
      timestamp: new Date().toISOString(),
    });

    console.log(`[chat] ${socket.data.name} joined session ${sessionId}`);
  });

  // Owner joins as the developer (opens owner dashboard)
  socket.on("join-owner", (data: { key?: string }) => {
    // Simple shared-secret. In real life, hook this to auth.
    if (data?.key !== "yaseen-owner-2026") {
      socket.emit("error-msg", { content: "Invalid owner key" });
      return;
    }
    socket.join("owner-room");
    socket.data.isOwner = true;
    socket.emit("owner-ready", {
      sessions: Array.from(sessionMessages.keys()),
    });
    console.log(`[chat] owner joined: ${socket.id}`);
  });

  // Visitor sends a message
  socket.on(
    "visitor-message",
    (data: { sessionId: string; content: string; name?: string }) => {
      const sessionId = data?.sessionId || socket.data.sessionId || socket.id;
      const content = String(data?.content || "").slice(0, 4000);
      if (!content.trim()) return;

      const msg: LiveMessage = {
        id: genId(),
        sessionId,
        sender: "visitor",
        name: data?.name || socket.data.name || "Visitor",
        content,
        timestamp: new Date().toISOString(),
      };

      // buffer
      const list = sessionMessages.get(sessionId) || [];
      list.push(msg);
      if (list.length > MAX_HISTORY) list.shift();
      sessionMessages.set(sessionId, list);

      // persist
      persistMessage(msg);

      // echo to visitor
      socket.emit("message", msg);
      // notify owner dashboard
      io.to("owner-room").emit("visitor-message", msg);
      console.log(`[chat] visitor@${sessionId}: ${content.slice(0, 80)}`);

      // Auto-acknowledge (so the visitor sees an immediate reply)
      setTimeout(() => {
        const ack: LiveMessage = {
          id: genId(),
          sessionId,
          sender: "owner",
          name: "Yaseen Ahmad",
          content:
            "Thanks for your message! I've received it and will reply shortly. Meanwhile, feel free to browse my projects above. 🚀",
          timestamp: new Date().toISOString(),
        };
        const l = sessionMessages.get(sessionId) || [];
        l.push(ack);
        if (l.length > MAX_HISTORY) l.shift();
        sessionMessages.set(sessionId, l);
        persistMessage(ack);
        io.to(`session:${sessionId}`).emit("message", ack);
      }, 1200);
    }
  );

  // Owner sends a message to a visitor session
  socket.on(
    "owner-message",
    (data: { sessionId: string; content: string }) => {
      if (!socket.data.isOwner) {
        socket.emit("error-msg", { content: "Not authorized" });
        return;
      }
      const sessionId = data?.sessionId;
      const content = String(data?.content || "").slice(0, 4000);
      if (!sessionId || !content.trim()) return;

      const msg: LiveMessage = {
        id: genId(),
        sessionId,
        sender: "owner",
        name: "Yaseen Ahmad",
        content,
        timestamp: new Date().toISOString(),
      };

      const list = sessionMessages.get(sessionId) || [];
      list.push(msg);
      if (list.length > MAX_HISTORY) list.shift();
      sessionMessages.set(sessionId, list);
      persistMessage(msg);

      io.to(`session:${sessionId}`).emit("message", msg);
      io.to("owner-room").emit("message", msg);
      console.log(`[chat] owner@${sessionId}: ${content.slice(0, 80)}`);
    }
  );

  // Typing indicator
  socket.on("typing", (data: { sessionId: string; isTyping: boolean }) => {
    const sessionId = data?.sessionId || socket.data.sessionId;
    if (!sessionId) return;
    socket.to(`session:${sessionId}`).emit("typing", {
      sessionId,
      isTyping: data.isTyping,
      name: socket.data.name,
    });
  });

  socket.on("disconnect", () => {
    console.log(`[chat] disconnected: ${socket.id}`);
  });

  socket.on("error", (err: Error) => {
    console.error(`[chat] socket error (${socket.id}):`, err.message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Yaseen Ahmad chat service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

process.on("SIGTERM", () => {
  console.log("[chat] SIGTERM — shutting down");
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.log("[chat] SIGINT — shutting down");
  httpServer.close(() => process.exit(0));
});
