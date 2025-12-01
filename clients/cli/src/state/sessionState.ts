import { WSClient } from "../sdk/wsClient";

export type PlayerSymbol = "X" | "O" | null;

export class SessionState {
  username: string | null = null;
  roomId: string | null = null;
  ws: WSClient | null = null;
  symbol: PlayerSymbol = null;

  resetWS() {
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
  resetSession = () => {
    this.resetWS();
    this.username = null;
    this.roomId = null;
    this.symbol = null;
  }

  // Check if user is ready to connect / play
  isReady(): boolean {
    return !!this.username && !!this.roomId && !!this.symbol;
  }
}

export const session = new SessionState();

