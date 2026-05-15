/**
 * websocket.ts — WebSocket client wrapper
 * Connects to ws://localhost:8000/ws/stream
 * Emits typed events the dashboard components subscribe to.
 */

export type WSEvent = {
  ts: string;
  kind: "deploy" | "log" | "metric" | "trace" | "topology" | "incident_signal" | "remediation" | "ghost" | "dna_update";
  service?: string;
  level?: string;
  msg?: string;
  name?: string;
  value?: number;
  version?: string;
  incident_id?: string;
  trigger?: string;
  similarity?: number;
  from?: string;
  to?: string;
  [key: string]: unknown;
};

type Listener = (event: WSEvent) => void;

class SentinelWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  public connected: boolean = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (typeof window === "undefined") return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connected = true;
        console.log("[WS] Connected to engine stream");
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as WSEvent;
          this.listeners.forEach((fn) => fn(data));
        } catch {}
      };

      this.ws.onclose = () => {
        this.connected = false;
        console.log("[WS] Disconnected — reconnecting in 3s");
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      // Reconnect on failure
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/stream";
export const sentinelWS = new SentinelWebSocket(WS_URL);
