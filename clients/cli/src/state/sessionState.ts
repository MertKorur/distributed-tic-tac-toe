import { WSClient } from "../sdk/wsClient";

class SessionState {
  username: string | null = null;
  roomId: string | null = null;
  ws: WSClient | null = null;
  symbol: "X" | "O" | null = null;

  resetWS() {
    try {
      this.ws?.disconnect();
    } catch {}
    this.ws = null;
  }
}

export const session = new SessionState();

export const resetSession = () => {
  session.username = null;
  session.roomId = null;
  session.ws = null;
  session.symbol = null;
};
