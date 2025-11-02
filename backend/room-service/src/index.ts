import express, { Request, Response } from 'express';
import axios from 'axios';
import { nanoid } from "nanoid";
import { errorHandler } from "./middleware/errorHandler";
import { CONFIG } from "./config";


const app = express();
app.use(express.json());
app.use(errorHandler);


app.post("/rooms/create", async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const userResponse = await axios.post(`${CONFIG.USER_SERVICE_URL}/users/register`, { username });

    const roomId = nanoid(10);
    const gameResponse = await axios.post(`${CONFIG.GAME_RULES_SERVICE_URL}/game/start`, {
      roomId,
      playerX: "X",
      playerO: "O"
    });

    res.json({
      message: `Room created for ${username}`,
      roomId,
      userResponse: userResponse.data,
      game: gameResponse.data
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});


app.get("/", (req: Request, res: Response) => {
  res.send(`${CONFIG.SERVICE_NAME} is up and running!`);
});

app.listen(CONFIG.PORT, () => {
  console.log(`${CONFIG.SERVICE_NAME} running on port ${CONFIG.PORT}`);
});