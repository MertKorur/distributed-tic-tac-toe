import { EventEmitter } from "events";
import WebSocket from "ws";

import { ServerMessage, ClientMessage } from "./types";

export class TicTacToeWS extends EventEmitter {
  private ws: WebSocket;

  constructor(private url: string) {
    super();
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event: any) => {
      const msg: ServerMessage = JSON.parse(event.data);
      this.emit(msg.action, msg);
    };

    this.ws.onclose = () => this.emit("disconnected");
    this.ws.onerror = (err) => this.emit("error", err);
  }

  send(msg: ClientMessage) {
    this.ws.send(JSON.stringify(msg));
  }

  joinRoom(roomId: string, player: string) {
    this.send({ action: "joinRoom", roomId, player });
  }

  makeMove(roomId: string, player: string, position: number) {
    this.send({ action: "makeMove", roomId, player, position });
  }

  close() {
    this.ws.close();
  }
}
