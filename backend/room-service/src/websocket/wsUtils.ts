import { WebSocket } from "ws";
import { GameState, GameOverMessage, UserLeftMessage } from "shared/types";
import { clearUserRoom } from "../state/activeRooms";
import { CONFIG } from "../config/config";

interface RoomClients { [roomId: string]: Set<WebSocket>; }
interface UserConnections { [username: string]: WebSocket; }

export const rooms: RoomClients = {};
export const userConnections: UserConnections = {};

// Remove a WebSocket from all rooms it is part of
// Returns list of room IDs it was removed from
function removeSocketFromRooms(ws: WebSocket): string[] {
  const removedRooms: string[] = [];
  Object.entries(rooms).forEach(([roomId, clients]) => {
    if (clients.has(ws)) {
      clients.delete(ws);
      removedRooms.push(roomId);
      if (clients.size === 0) delete rooms[roomId];
    }
  });
  return removedRooms;
}

// Removes a username -> socket mapping and remove socket from room
function removeConnectionByUsername(username: string) {
  const ws = userConnections[username];
  if (!ws) return;
  try { ws.close(); } catch {}
  removeSocketFromRooms(ws);
  delete userConnections[username];
}

// Given a disconnected socket, find associated username and remove mapping
function handleSocketDisconnect(ws: WebSocket) {
  // find uername mapped to the socket
  let disconnctedUser: string | null = null;
  for (const [username, socket] of Object.entries(userConnections)) {
    if (socket === ws) {
      disconnctedUser = username;
      delete userConnections[username];
      break;
    }
  }
  
  // Remove socket from all rooms and broadcast userLeft
  Object.entries(rooms).forEach(([roomId, clients]) => {
    if (clients.has(ws)) {
      clients.delete(ws);

      // If other clients still in room, broadcast userLeft
      if (clients.size > 0) {
        broadcast(roomId, <UserLeftMessage>{
          action: "userLeft",
          player: disconnctedUser ?? "Unknown"
        });
      } else {
        // no clients left, delete room
        delete rooms[roomId];
      }
    }
  });
}

function broadcast(roomId: string, payload: any) {
  const clients = rooms[roomId];
  if (!clients) return;

  const msg = JSON.stringify(payload);
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

async function cleanupRoomAfterFinish(roomId: string, game: GameState) {
  if (game.playerX) {
    clearUserRoom(game.playerX);
    console.log(`Cleaned up user ${game.playerX} from room ${roomId}`);
  }  
  if (game.playerO) {
    clearUserRoom(game.playerO);
    console.log(`Cleaned up user ${game.playerO} from room ${roomId}`);
  }

  // Remove user connections
  if (game.playerX) delete userConnections[game.playerX];
  if (game.playerO) delete userConnections[game.playerO];

  // Close and delete all WS connections in the room
  const clients = rooms[roomId];
  if (clients) {
    clients.forEach(client => {
      try {client.close();} catch {}
    });
    delete rooms[roomId];
  }

  // Delete game from Game Rules Service
  try {
    await axios.delete(`${CONFIG.GAME_RULES_SERVICE_URL}/games/${roomId}`)
    console.log(`Deleted game ${roomId}`);
  } catch (err: any) {
    console.error(`Failed to delete game ${roomId}: ${err.message}`);
  }

  console.log(`Cleanup finished in room ${roomId}`);
}

export {
    removeConnectionByUsername,
    handleSocketDisconnect,
    broadcast,
    cleanupRoomAfterFinish
}