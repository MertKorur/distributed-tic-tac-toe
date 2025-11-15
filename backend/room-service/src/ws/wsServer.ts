import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage, ServerMessage, GameMoveResponse, UpdateBoardMessage } from "shared/types";
import { CONFIG } from "../config";
import axios from "axios";

interface RoomClients {
  [roomId: string]: Set<WebSocket>;
}

// Connected Clients per room
const rooms: RoomClients = {};

export function initWebSocket(serverPort: number) {
  const wss = new WebSocketServer({ port: serverPort });
  console.log(`WebSocket server running on port ${serverPort}`);

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected to WSS");

    ws.on("message", async (data) => {
      try {
        const msg: ClientMessage = JSON.parse(data.toString());

        if (msg.action === "joinRoom") {
          if (!rooms[msg.roomId]) rooms[msg.roomId] = new Set();
          rooms[msg.roomId].add(ws);

          const response: ServerMessage = { action: "joinedRoom", roomId: msg.roomId };
          ws.send(JSON.stringify(response));
          console.log(`Client joined room ${msg.roomId}`);

        } else if (msg.action === "makeMove") {
          const { roomId, player, position } = msg;

          const gameResponse = await axios.post<GameMoveResponse>(
            `${CONFIG.GAME_RULES_SERVICE_URL}/game/move`,
            { roomId, player, position }
          );

          const updateMsg: UpdateBoardMessage = {
            action: "updateBoard",
            board: gameResponse.data.board,
            currentPlayer: gameResponse.data.currentPlayer,
            winner: gameResponse.data.winner,
          };

          // Broadcast to all clients in the room
          const clients = rooms[roomId];
          if (!clients) return;
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(updateMsg));
            }
          });
        }

      } catch (error: any) {
        const message =
          error.response?.data?.error || error.message || "An error occurred";
        ws.send(JSON.stringify({ action: "error", message }));
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");

      // Remove client from all rooms
      Object.keys(rooms).forEach((roomId) => {
        rooms[roomId].delete(ws);
        if (rooms[roomId].size === 0) {
          delete rooms[roomId]; // Clean up empty rooms
        }
      });
    });
  });
}
