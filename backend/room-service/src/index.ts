import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post("/rooms/create", async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const userResponse = await axios.post("http://localhost:3001/users/register", { username });

    res.json({
      message: `Room created for ${username}`,
      userResponse: userResponse.data
    });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});


app.get("/", (req: Request, res: Response) => {
  res.send("Room Service is up and running!");
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Room Service running on port ${PORT}`);
});
