import { Router } from "express";
import { createRoom } from "../services/roomServices";

const router = Router();

router.post("/create", async (req, res) => {
  const { username } = req.body;

  try {
    const result = await createRoom(username);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("Error creating room:", err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;