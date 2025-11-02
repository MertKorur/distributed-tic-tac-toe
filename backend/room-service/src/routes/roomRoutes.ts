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

export default router;