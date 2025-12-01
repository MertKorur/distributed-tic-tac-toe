import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface WSClientOptions {
  retry?: boolean;
  maxRetries?: number;
  backoffMs?: number;
}

export class WSClient extends EventEmitter {
  private ws!: WebSocket;
  private retry: boolean;
  private maxRetries: number;
  private backoffMs: number;
  private retryCount = 0;

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
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      this.retryCount = 0;
      this.emit('connected');
      this.send({ action: 'joinRoom', roomId: this.roomId, player: this.username });
    });

    this.ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      this.emit('message', msg);
    });

    this.ws.on('close', () => {
      if (this.retry && this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.connect(), this.backoffMs * this.retryCount);
      } else if (this.retry) {
        this.emit('error', new Error('Max retries reached'));
      }
    });

    this.ws.on('error', (err) => this.emit('error', err));
  }

  send(msg: any) {
    this.ws.send(JSON.stringify(msg));
  }

  disconnect() {
    this.retry = false;
    this.ws.close();
  }
}
