import { TokenStore } from "./api";

/* ─── Event types (must mirror server) ─────────────────────────────────────── */
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

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

type EventHandler = (data: unknown) => void;

/* ─── Backoff constants ─────────────────────────────────────────────────────── */
const INITIAL_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;
const BACKOFF_FACTOR = 2;
const PING_INTERVAL_MS = 25_000;

/* ─── Client ────────────────────────────────────────────────────────────────── */
class RealtimeClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectDelay = INITIAL_DELAY_MS;
  private shouldConnect = false;
  private _status: ConnectionStatus = "disconnected";

  /** Registered event handlers */
  private readonly handlers = new Map<RealtimeEventType | "*", Set<EventHandler>>();

  /** Status-change listeners */
  private readonly statusListeners = new Set<(s: ConnectionStatus) => void>();

  /* ── Public API ─────────────────────────────────────────────────────────────── */

  get status(): ConnectionStatus {
    return this._status;
  }

  /** Start the connection (call once after login). */
  async connect(): Promise<void> {
    this.shouldConnect = true;
    await this.openSocket();
  }

  /** Stop the connection (call on logout). */
  disconnect(): void {
    this.shouldConnect = false;
    this.clearTimers();
    if (this.ws) {
      this.ws.onclose = null; // suppress reconnect on intentional close
      this.ws.close(1000, "Logout");
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  /** Subscribe to a specific event type (or "*" for all events). */
  on(type: RealtimeEventType | "*", handler: EventHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
    /* Return an unsubscribe function */
    return () => this.off(type, handler);
  }

  /** Unsubscribe. */
  off(type: RealtimeEventType | "*", handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  /** Listen for connection-status changes. */
  onStatusChange(listener: (s: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /* ── Internal ──────────────────────────────────────────────────────────────── */

  private async openSocket(): Promise<void> {
    if (!this.shouldConnect) return;

    this.setStatus("connecting");
    this.clearTimers();

    /* Build WebSocket URL */
    const token = await TokenStore.getAccess();
    if (!token) {
      this.setStatus("disconnected");
      return;
    }

    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    const wsBase = domain
      ? `wss://${domain}/api/ws`
      : "ws://localhost:80/api/ws";
    const url = `${wsBase}?token=${encodeURIComponent(token)}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws = ws;

    ws.onopen = () => {
      this.reconnectDelay = INITIAL_DELAY_MS; // reset backoff
      this.setStatus("connected");
      this.startPing();
    };

    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(
          typeof evt.data === "string" ? evt.data : evt.data.toString()
        ) as RealtimeEvent;
        this.dispatch(event);
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onerror = () => {
      this.setStatus("error");
    };

    ws.onclose = (evt) => {
      this.ws = null;
      this.clearPing();
      if (this.shouldConnect && evt.code !== 1000) {
        this.scheduleReconnect();
      } else {
        this.setStatus("disconnected");
      }
    };
  }

  private dispatch(event: RealtimeEvent): void {
    /* Specific type handlers */
    const specific = this.handlers.get(event.type);
    if (specific) {
      for (const h of specific) {
        try {
          h(event.data);
        } catch {
          /* don't let one bad handler crash the loop */
        }
      }
    }
    /* Wildcard handlers */
    const wildcards = this.handlers.get("*");
    if (wildcards) {
      for (const h of wildcards) {
        try {
          h(event);
        } catch {
          /* ignore */
        }
      }
    }
  }

  private setStatus(s: ConnectionStatus): void {
    if (this._status === s) return;
    this._status = s;
    for (const l of this.statusListeners) {
      try {
        l(s);
      } catch {
        /* ignore */
      }
    }
  }

  private scheduleReconnect(): void {
    this.setStatus("disconnected");
    this.reconnectTimer = setTimeout(async () => {
      if (this.shouldConnect) await this.openSocket();
    }, this.reconnectDelay);
    /* Exponential backoff with cap */
    this.reconnectDelay = Math.min(
      this.reconnectDelay * BACKOFF_FACTOR,
      MAX_DELAY_MS
    );
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, PING_INTERVAL_MS);
  }

  private clearPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearPing();
  }
}

/* Singleton used throughout the app */
export const realtimeClient = new RealtimeClient();
