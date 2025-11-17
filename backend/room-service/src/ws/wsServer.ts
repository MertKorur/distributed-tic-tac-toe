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
            const response = await axios.get<GameState>(
              `${CONFIG.GAME_RULES_SERVICE_URL}/game/status/${roomId}`
            );
            game = response.data;
          } catch {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Room does not exist."
            }));
            return;
          }

          // Allow playerO to claim slot if unassigned
          if (player !== game.playerO && !game.playerO) {
            try {
              await axios.post(`${CONFIG.GAME_RULES_SERVICE_URL}/game/join`, { 
                roomId, 
                playerO: player 
              });
              game.playerO = player; // update local game state
              console.log(`Player ${player} claimed O game in room ${roomId}`);
            } catch {
              ws.send(JSON.stringify({ 
                action: "error", 
                message: "Failed to join as Player O."
              }));
              return;
            }
          }

          // Check that the player belongs to game
          const allowedPlayers = [game.playerX, game.playerO].filter(Boolean);
          if (!allowedPlayers.includes(player)) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: `Player ${player} is not a part of this game.`
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
          userConnections[player] = ws;

          // Add the WS client to the room
          if (!rooms[roomId]) rooms[roomId] = new Set();
          rooms[roomId].add(ws);

          ws.send(JSON.stringify({ 
            action: "joinedRoom", 
            roomId
          }));
          console.log(`Player ${player} joined WS room ${roomId}`);
        } 
        
        //
        // MAKE MOVE
        //
        else if (msg.action === "makeMove") {
          const { roomId, player, position } = msg;

          // Get current game state
          const gameResponse = await axios.get<GameState>(
            `${CONFIG.GAME_RULES_SERVICE_URL}/game/status/${roomId}`
          );
          const game = gameResponse.data;

          // Map X or O to usernames
          const actualPlayer = 
          player === "X" ? game.playerX : 
          player === "O" ? game.playerO : null;

          if (!actualPlayer) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Invalid player" 
            }));
            return;
          }

          // Validate turn
          if (game.currentPlayer !== actualPlayer) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Not your turn" 
            }));
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
            console.log(`Game in room ${roomId} finished: Winner = ${moveResponse.data.winner}`);
            
            // Clear activeRooms
            [game.playerX, game.playerO].forEach(p => {
              if (p) delete userConnections[p];
            });

            delete rooms[roomId]; // remove ws room
          }
        }

      } catch (error: any) {
        ws.send(JSON.stringify({ 
          action: "error", message : error.message || "WS error."
        }));
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
      Object.keys(userConnections).forEach((username) => {
        if (userConnections[username] === ws) delete userConnections[username];
      });
    });
  });
}
