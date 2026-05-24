import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer, IncomingMessage } from "http";
import { verifyToken } from "./auth";
import { logger } from "./logger";

/* ─── Event shapes ────────────────────────────────────────────────────────────── */
export type RealtimeEventType =
  | "connected"
  | "booking_update"
  | "provider_arrived"
  | "service_started"
  | "service_completed"
  | "new_message"
  | "new_notification"
  | "wallet_update"
  | "ping"
  | "pong";

export interface RealtimeEvent {
  type: RealtimeEventType;
  data?: unknown;
}

/* ─── Extended WS type ───────────────────────────────────────────────────────── */
interface AppSocket extends WebSocket {
  userId: string;
  isAlive: boolean;
}

/* ─── Service ────────────────────────────────────────────────────────────────── */
class RealtimeService {
  /** userId → active sockets for that user */
  private readonly connections = new Map<string, Set<AppSocket>>();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private wss: WebSocketServer | null = null;

  /* ── Bootstrap ─────────────────────────────────────────────────────────────── */
  attach(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: "/api/ws" });
    this.wss.on("connection", (ws, req) =>
      this.handleConnection(ws as AppSocket, req)
    );
    this.wss.on("error", (err) => logger.error({ err }, "WSS error"));
    this.startHeartbeat();
    logger.info("WebSocket server attached at /api/ws");
  }

  /* ── Connection lifecycle ──────────────────────────────────────────────────── */
  private handleConnection(ws: AppSocket, req: IncomingMessage): void {
    /* Auth: token in query-string (?token=xxx) */
    let userId: string;
    try {
      const raw = req.url ?? "";
      /* req.url is path-only, so prepend a dummy base for URL parsing */
      const url = new URL(raw, "http://localhost");
      const token = url.searchParams.get("token") ?? "";
      const payload = verifyToken(token);
      userId = payload.sub;
    } catch {
      ws.close(1008, "Authentication required");
      return;
    }

    ws.userId = userId;
    ws.isAlive = true;

    /* Register */
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(ws);
    logger.info({ userId }, "WS client connected");

    /* Keepalive */
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    /* Inbound messages: only handle client ping */
    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type?: string };
        if (msg.type === "ping") this.send(ws, { type: "pong" });
      } catch {
        /* ignore malformed */
      }
    });

    ws.on("close", () => this.removeSocket(ws));
    ws.on("error", (err) => {
      logger.warn({ err, userId }, "WS socket error");
      this.removeSocket(ws);
    });

    /* Welcome frame */
    this.send(ws, { type: "connected", data: { userId } });
  }

  private removeSocket(ws: AppSocket): void {
    const bucket = this.connections.get(ws.userId);
    if (!bucket) return;
    bucket.delete(ws);
    if (bucket.size === 0) this.connections.delete(ws.userId);
    logger.info({ userId: ws.userId }, "WS client disconnected");
  }

  /* ── Heartbeat — drops dead connections ────────────────────────────────────── */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (!this.wss) return;
      for (const [, sockets] of this.connections) {
        for (const ws of sockets) {
          if (!ws.isAlive) {
            ws.terminate();
            this.removeSocket(ws);
            continue;
          }
          ws.isAlive = false;
          ws.ping();
        }
      }
    }, 30_000);
    /* Don't block the event loop on clean exit */
    this.heartbeatTimer.unref?.();
  }

  /* ── Emit helpers ─────────────────────────────────────────────────────────── */
  private send(ws: WebSocket, event: RealtimeEvent): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(event));
      } catch {
        /* socket already gone */
      }
    }
  }

  /**
   * Emit an event to ALL sockets belonging to a given user.
   * Safe to call even if the user has no active connections.
   */
  emitToUser(userId: string, event: RealtimeEvent): void {
    const sockets = this.connections.get(userId);
    if (!sockets || sockets.size === 0) return;
    const payload = JSON.stringify(event);
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(payload);
        } catch {
          /* ignore */
        }
      }
    }
  }

  /** Emit to multiple users at once (e.g. customer + provider). */
  emitToUsers(userIds: string[], event: RealtimeEvent): void {
    const payload = JSON.stringify(event);
    for (const uid of userIds) {
      const sockets = this.connections.get(uid);
      if (!sockets) continue;
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(payload);
          } catch {
            /* ignore */
          }
        }
      }
    }
  }

  /** Total number of live connections (for metrics / healthcheck). */
  get connectionCount(): number {
    let n = 0;
    for (const [, s] of this.connections) n += s.size;
    return n;
  }

  /** Graceful shutdown. */
  close(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.wss?.close();
  }
}

/* Singleton — imported by index.ts and routes */
export const realtime = new RealtimeService();
