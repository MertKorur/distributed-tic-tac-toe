import axios from "axios";
import { CONFIG } from "../config";
import { nanoid } from "nanoid";
import { activeRooms } from "../state/activeRooms";

export async function createRoom(username: string) {
  // Check if user has active room already
  if (activeRooms.has(username)) {
    throw new Error(`User ${username} already has an active room: ${activeRooms.get(username)}`);
  }

  let user;
  try {
    // Try to create room with existing user
    const resp = await axios.get(`${CONFIG.USER_SERVICE_URL}/users/username/${username}`);
    user = resp.data;
  } catch (err: any) {
    if (err.response?.status === 404){
      // User does not exist, create new one
      try {
        const resp = await axios.post(
          `${CONFIG.USER_SERVICE_URL}/users/register`, { username }
        );
        user = resp.data;
      } catch (err: any) {
        throw new Error(`Failed to create new user: ${err.response?.data?.error || err.message}`);
      }
    } else {
      throw new Error(`Failed to fetch user: ${err.response?.data?.error || err.message}`);
    }
  }

  const roomId = nanoid(10);

  let gameResponse;
  try {
    gameResponse = await axios.post(
      `${CONFIG.GAME_RULES_SERVICE_URL}/game/start`, {
        roomId,
        playerX: username,
        playerO: null
      });
  } catch (err: any) {
    throw new Error(`Failed to create game: ${err.response?.data?.error || err.message}`);
  }
  
  activeRooms.set(username, roomId);

  return {
    message: `Room created for ${username}`,
    roomId,
    user,
    game: gameResponse.data
  };
};