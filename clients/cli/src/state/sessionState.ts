import { WSClient } from "../sdk/wsClient";

export type PlayerSymbol = "X" | "O" | null;

export class SessionState {
  username: string | null = null;
  roomId: string | null = null;
  ws: WSClient | null = null;
  symbol: PlayerSymbol = null;
  
  resetWS(): void {
    if (this.ws) {
      try {
        this.ws.disconnect();
      } catch (err){
        console.error('Error disconnecting WS:', err)
      } finally {
        this.ws = null;
      }
    }
  }

  // fully reset session
  resetSession(): void {
    this.resetWS();
    this.username = null;
    this.roomId = null;
    this.symbol = null;
  }

  // Check if user is ready to connect / play
  isReady(): boolean {
    return !!this.username && !!this.roomId && !!this.symbol;
  }

  setUser(username: string): void {
    this.username = username;
  }

  setRoom(roomId: string | null): void {
    this.roomId = roomId;
  }

  setSymbol(symbol: PlayerSymbol): void {
    this.symbol = symbol;
  }

  setWS(ws: WSClient | null): void {
    this.ws = ws;
  }
}

export const session = new SessionState();

