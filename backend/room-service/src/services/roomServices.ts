import axios from "axios";
import { CONFIG } from "../config";
import { nanoid } from "nanoid";

export async function createRoom(username: string) {
    const userResponse = await axios.post(`${CONFIG.USER_SERVICE_URL}/users/register`, { username });

    try {
      const roomId = nanoid(10);
      const gameResponse = await axios.post(`${CONFIG.GAME_RULES_SERVICE_URL}/game/start`, {
        roomId,
        playerX: "X",
        playerO: "O"
      });

      return {
        message: `Room created for ${username}`,
        roomId,
        userResponse: userResponse.data,
        game: gameResponse.data
      };
    } catch (err) {
      console.error("Error creating room:", err);
      throw new Error("Failed to create room");
    }
};