import { Router } from "express";
import { createRoom } from "../services/roomServices";

const router = Router();

router.post("/create", async (req, res) => {
  const { username } = req.body;

  try {
    const result = await createRoom(username);
    res.json(result);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.post("/", async (req, res) => {
  console.log("POST /rooms body:", req.body);
  const { username } = req.body;
  const result = await createRoom(username);
  console.log("Room created:", result);
  res.json(result);
});

export default router;