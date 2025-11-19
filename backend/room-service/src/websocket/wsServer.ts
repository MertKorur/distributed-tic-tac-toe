import { WebSocketServer, WebSocket } from "ws";
import { 
  ClientMessage,
  UserLeftMessage,
  UserJoinedMessage,
  GameOverMessage, 
  GameMoveResponse, 
  UpdateBoardMessage, 
  GameState 
} from "shared/types";
import {
  removeConnectionByUsername,
  handleSocketDisconnect,
  broadcast,
  cleanupRoomAfterFinish
} from "./wsUtils";
import { CONFIG } from "../config/config";
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
          } catch (err: any) {
            const m = err.response?.data?.error || err.message || "Room does not exist"
            ws.send(JSON.stringify({ 
              action: "error", 
              message: m}));
            return;
          }

          // Prevent joining finished games
          if (game.winner !== undefined && game.winner !== null) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Game has already finished."}));
            return;
          }

          // Prevent multiple connections for same player
          if (userConnections[player] && userConnections[player] !== ws) {
            removeConnectionByUsername(player);
          }

          // If player isnt X, try to join as O
          if (player !== game.playerX) {
            if (!game.playerO) {
              // Try to claim O slot
              try {
                await axios.post(`${CONFIG.GAME_RULES_SERVICE_URL}/game/join`, { roomId, playerO: player });
                game.playerO = player;

                // Refetch game to confirm actually got O slot
                const updated = await axios.get<GameState>(
                  `${CONFIG.GAME_RULES_SERVICE_URL}/game/status/${roomId}`
                );
                game = updated.data;

                console.log(`Player O is now ${game.playerO}.`);

                if (game.playerO !== player) {
                  // O slot was taken by someone else in a race condition
                  ws.send(JSON.stringify({ 
                    action: "error", 
                    message: `Failed to join as Player O. Slot taken.` 
                  }));
                  return;
                }

              } catch (err: any) {
                const m = err.response?.data?.error || "Failed to join as Player O.";
                ws.send(JSON.stringify({
                  action: "error", 
                  message: m }));
                return;
              }

            } else if (player !== game.playerO) {
              ws.send(JSON.stringify({ 
                action: "error", 
                message: `You are not a participant of this game.` }));
              return;
            }
          }

          // Register connection with username
          userConnections[player] = ws;

          // Add the WS client to the room
          if (!rooms[roomId]) rooms[roomId] = new Set();
          rooms[roomId].add(ws);

          // Broadcast joined message
          broadcast(roomId, <UserJoinedMessage>{
            action: "userJoined",
            player: player
          });

          // Send to joining client confirmation + current board
          ws.send(JSON.stringify({action: "joinedRoom",roomId}));
          ws.send(JSON.stringify(<UpdateBoardMessage>{
            action: "updateBoard",
            board: game.board,
            currentPlayer: game.currentPlayer,
            winner: game.winner ?? null
          }));
          console.log(`Player ${player} joined WS room ${roomId}`);
          return;
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
          } catch (err: any) {
            const m = err.response?.data?.error || err.message || "Game does not exist";
            ws.send(JSON.stringify({ action: "error", message: m }));
            return;
          }

          // Prevent moves in finished games
          if (game.winner !== undefined && game.winner !== null) {
            ws.send(JSON.stringify({ action: "error", message: "Game has already finished."}));
            return;
          }

          // Map X or O to usernames
          const actualPlayer = symbol === "X" ? game.playerX : game.playerO;
          if (!actualPlayer) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "Invalid player." }));
            return;
          }

          // Check that WS is connected as the actual player
          if (userConnections[actualPlayer] !== ws) {
            ws.send(JSON.stringify({ 
              action: "error", 
              message: "You are not connected as this player." }));
            return;
          }

          // Validate turn
          if (game.currentPlayer !== actualPlayer) {
            ws.send(JSON.stringify({ action: "error", message: "Not your turn." }));
            return;
          }

          // Post move
          let moveResponse;
          try {
            moveResponse = await axios.post<GameMoveResponse>(
              `${CONFIG.GAME_RULES_SERVICE_URL}/game/move`,
              { roomId, player: actualPlayer, position }
            );          
          } catch (err: any) {
            const m = err.response?.data?.error || err.message || "Move failed";
            ws.send(JSON.stringify({ action: "error", message: m }));
            return;
          }

          // Broadcast updated board
          const updateMsg: UpdateBoardMessage = {
            action: "updateBoard",
            board: moveResponse.data.board,
            currentPlayer: moveResponse.data.currentPlayer,
            winner: moveResponse.data.winner ?? null,
          };
          broadcast(roomId, updateMsg);

          // If game finished, broadcast and clean up
          if (moveResponse.data.winner !== undefined && moveResponse.data.winner !== null) { 
            let finishedGame: GameState = game;
            try {
              const finishedResponse = await axios.get<GameState>(
                `${CONFIG.GAME_RULES_SERVICE_URL}/game/status/${roomId}`
              );
              finishedGame = finishedResponse.data;
            } catch (err: any) {}

            // Broadcast gameOver and cleanup
            const winner = moveResponse.data.winner;
            broadcast(roomId, <GameOverMessage>{
              action: "gameOver",
              winner: winner ?? null
            });
            // Cleanup: remove connection, close sockets, delete room
            cleanupRoomAfterFinish(roomId, finishedGame);
          }

          return;
        }

        // Unknown action
        ws.send (JSON.stringify({ 
          action: "error", 
          message: "Unknown action" }));
      } catch (error: any) {
        const m = error.response?.data?.error || error.message || "Invalid message format";
        ws.send(JSON.stringify({ action: "error", m }));
      }
    });

    //
    // CLIENT DISCONNECT
    //
    ws.on("close", () => {
      console.log("Client disconnected.");
      handleSocketDisconnect(ws);

      // Remove client from all rooms and broadcast disconnection
      let disconnectedPlayer: string | null = null;
      for (const username of Object.keys(userConnections)) {
        if (userConnections[username] === ws) {
          disconnectedPlayer = username;
          delete userConnections[username];
          break;
        }
      }

      if (!disconnectedPlayer) {
        // If we dont know username, remove socket from rooms and return
        Object.entries(rooms).forEach(([roomId, clients]) => {
          if (clients.delete(ws)) {
            // if still clients left, we broadcast userLeft without username
            if (clients.size > 0) {
              broadcast(roomId, <UserLeftMessage>{
                action: "userLeft",
                player: disconnectedPlayer ?? "?"
              });
            } else {
              // Clean up empty room
              delete rooms[roomId];
            }
          }
        });
        return;
      }

      // Remove socket from any rooms and notify others of which player left
      Object.entries(rooms).forEach(([roomId, clients]) => {
        if (clients.has(ws)) {
          clients.delete(ws);

          // Broadcast disconnection with username
          if (clients.size > 0) {
            broadcast(roomId, <UserLeftMessage>{
              action: "userLeft",
              player: disconnectedPlayer});
          } else {
            // Clean up empty room
            delete rooms[roomId];
          }
        }
      });
    });
  });
}