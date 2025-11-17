import { WebSocketServer, WebSocket } from "ws";
import { 
  ClientMessage, 
  ServerMessage, 
  GameMoveResponse, 
  UpdateBoardMessage, 
  GameState 
} from "shared/types";
import { CONFIG } from "../config";
import axios from "axios";

interface RoomClients {
  [roomId: string]: Set<WebSocket>;
}

interface UserConnections {
  [username: string]: WebSocket;
}

// Connected Clients per room
const rooms: RoomClients = {};
const userConnections: UserConnections = {};

export function initWebSocket(serverPort: number) {
  const wss = new WebSocketServer({ port: serverPort });
  console.log(`WebSocket server running on port ${serverPort}`);

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected to WSS");

    ws.on("message", async (data) => {
      try {
        const msg: ClientMessage = JSON.parse(data.toString());

        //
        // JOIN ROOM
        //
        if (msg.action === "joinRoom") {
          const { roomId, player } = msg;

          let game: GameState;
          try {
            const response = await axios.get<GameState>(`${CONFIG.GAME_RULES_SERVICE_URL}/game/status/${roomId}`);
            game = response.data;
          } catch {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Room does not exist."
            }));
            return;
          }

          // Prevent multiple connections for same player
          if (userConnections[player]) {
            ws.send(JSON.stringify({ 
              action: "error",
              message: `Player ${player} is already connected.`
            }));
            return;
          }

          // Check that the player allowed to join game
          // If slot O is empty, claim it
          if (player !== game.playerX) {
            if (!game.playerO) {
              try {
                await axios.post(`${CONFIG.GAME_RULES_SERVICE_URL}/game/join`, { roomId, playerO: player });
                game.playerO = player;
                console.log(`Player ${player} claimed O slot in room ${roomId}`);
              } catch (err: any) {
                ws.send(JSON.stringify({ action: "error", message: err.response?.data?.error || "Failed to join as Player O." }));
                return;
              }
            } else if (player !== game.playerO) {
              ws.send(JSON.stringify({ 
                action: "error", 
                message: `Player ${player} is not a part of this game.` 
              }));
              return;
            }
          }
          
          // Register connection with username
          userConnections[player] = ws;

          // Add the WS client to the room
          if (!rooms[roomId]) rooms[roomId] = new Set();
          rooms[roomId].add(ws);

          ws.send(JSON.stringify({ action: "joinedRoom", roomId }));
          console.log(`Player ${player} joined WS room ${roomId}`);
        } 
        
        //
        // MAKE MOVE
        //
        else if (msg.action === "makeMove") {
          const { roomId, player: symbol, position } = msg;

          // Get current game state
          let game: GameState;
          try {
            const gameResponse = await axios.get<GameState>(`${CONFIG.GAME_RULES_SERVICE_URL}/game/status/${roomId}`);
            game = gameResponse.data;
          } catch {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Game does not exist."
            }));
            return;
          }

          // Map X or O to usernames
          const actualPlayer = symbol === "X" ? game.playerX : game.playerO;
          if (!actualPlayer) {
            ws.send(JSON.stringify({ action: "error", message: "Invalid player" }));
            return;
          }

          // Check that WS is connected as the actual player
          if (!userConnections[actualPlayer] || userConnections[actualPlayer] !== ws) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "You are not connected as this player." 
            }));
            return;
          }

          // Validate turn
          if (game.currentPlayer !== actualPlayer) {
            ws.send(JSON.stringify({ action: "error", message: "Not your turn." }));
            return;
          }

          // Send move to Game Rules service
          const moveResponse = await axios.post<GameMoveResponse>(
            `${CONFIG.GAME_RULES_SERVICE_URL}/game/move`,
            { roomId, player: actualPlayer, position }
          );

          const updateMsg: UpdateBoardMessage = {
            action: "updateBoard",
            board: moveResponse.data.board,
            currentPlayer: moveResponse.data.currentPlayer,
            winner: moveResponse.data.winner || null,
          };

          // Broadcast to all clients in the room
          const clients = rooms[roomId];
          if (clients) {
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(updateMsg));
              }
            });
          }

          // Remove rooms that have a resolution
          if (moveResponse.data.winner) {
            console.log(`Game in room ${roomId} finished: Winner = ${moveResponse.data.winner}.`);
            
            // Clear activeRooms
            [game.playerX, game.playerO].forEach(p => {
              if (p) delete userConnections[p];
            });

            delete rooms[roomId]; // remove ws room
          }
        }

      } catch (error: any) {
        const message = error.response?.data?.error || error.message || "Invalid message format";
        ws.send(JSON.stringify({ action: "error", message }));
      }
    });

    //
    // CLIENT DISCONNECT
    //
    ws.on("close", () => {
      console.log("Client disconnected.");

      // Remove client from all rooms
      Object.keys(rooms).forEach((roomId) => {
        rooms[roomId].delete(ws);
        if (rooms[roomId].size === 0) delete rooms[roomId]; // Clean up empty rooms
      });

      // Remove from userConnections
      Object.keys(userConnections).forEach(username => {
        if (userConnections[username] === ws) delete userConnections[username];
      });
    });
  });
}
