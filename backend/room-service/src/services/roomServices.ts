import axios from "axios";
import { CONFIG } from "../config";
import { nanoid } from "nanoid";
import { activeRooms } from "../state/activeRooms";

export async function createRoom(username: string) {
  if (activeRooms.has(username)) {
    const existingRoomId = activeRooms.get(username);
    return {
      message: `User ${username} already has an active room`,
      roomId: existingRoomId,
      reused: true
    };
  }

  let user;

  try {
    // Try  existing user
    const resp = await axios.get(
      `${CONFIG.USER_SERVICE_URL}/users/username/${username}`);
    user = resp.data;
  } catch {
    // create new
    const resp = await axios.post(
      `${CONFIG.USER_SERVICE_URL}/users/register`, { username });
    user = resp.data;
  }

  const roomId = nanoid(10);


  try {
    const gameResponse = await axios.post(
      `${CONFIG.GAME_RULES_SERVICE_URL}/game/start`, 
      {
        roomId,
        playerX: username,
        playerO: null
      }
    );

    activeRooms.set(username, roomId);

    return {
      message: `Room created for ${username}`,
      roomId,
      reused: false,
      user,
      game: gameResponse.data
    };
  } catch (err) {
    console.error("Error creating room:", err);
    throw new Error("Failed to create room");
  }
};