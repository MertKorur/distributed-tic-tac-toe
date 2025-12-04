import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface WSClientOptions {
  retry?: boolean;
  maxRetries?: number;
  backoffMs?: number;
}

export interface WSMessage {
  action: string;
  [key: string]: any;
}

export class WSClient extends EventEmitter {
  private ws!: WebSocket;
  private retry: boolean;
  private maxRetries: number;
  private backoffMs: number;
  private retryCount = 0;
  private shouldReconnect = true;

  public url: string;

  constructor(
    public roomId: string,
    public username: string,
    url?: string,
    options: WSClientOptions = {}
  ) {
    super();
    this.retry = options.retry ?? true;
    this.maxRetries = options.maxRetries ?? 5;
    this.backoffMs = options.backoffMs ?? 1000;
    this.url = url ?? process.env.WS_SERVER_URL ?? 'ws://localhost:8080';
  }

  connect() {
    if (!this.shouldReconnect) return;
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      this.retryCount = 0;
      this.emit('connected');
      this.send({ action: 'joinRoom', roomId: this.roomId, player: this.username });
    });

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this.emit('message', msg);

        if (msg.action === 'gameOver') {
          this.shouldReconnect = false;
          this.disconnect();
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    });

    this.ws.on('close', () => this.handleClose());
    this.ws.on('error', (err) => this.emit('error', err));
  }

  private handleClose() {
    if (!this.shouldReconnect || !this.retry) return;

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = this.backoffMs * 2 ** (this.retryCount - 1);
      setTimeout(() => this.connect(), delay);
    } else {
      this.emit('error', new Error('Max retries reached'));
    }
  }

  send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.emit("error", new Error("WS not connected"));
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    this.retry = false;
    this.ws?.close();
  }
}
