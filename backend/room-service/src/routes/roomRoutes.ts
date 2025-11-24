import { Router } from "express";
import { createRoom, listOpenRooms } from "../services/roomServices";

const router = Router();

router.post("/create", async (req, res, next) => {
  try {
    const result = await createRoom(req.body.username);
    res.status(201).json(result);
  } catch (err: any) {
    next(err);
  }
});

router.get("/list", (req, res, next) => {
  try {
    const rooms = listOpenRooms();
    res.json(rooms);
  } catch (err: any) {
    next(err);
  }
});

export default router;