import { TicTacToeAPI } from "./api";
import { TicTacToeWS } from "./ws";

export class TicTacToeClient {
  api: TicTacToeAPI;
  ws: TicTacToeWS | null = null;
  private wsUrl: string;

  constructor(
    userServiceUrl: string,
    roomServiceUrl: string,
    gameServiceUrl: string,
    wsUrl: string
  ) {
    this.api = new TicTacToeAPI(userServiceUrl, roomServiceUrl, gameServiceUrl);
    this.wsUrl = wsUrl;
  }

  connectWS() {
    if (this.ws) return this.ws;
    this.ws = new TicTacToeWS(this.wsUrl);
    return this.ws;
  }

  disconnectWS() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
