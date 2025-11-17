import { Router } from "express";
import { createRoom } from "../services/roomServices";

const router = Router();

router.post("/create", async (req, res, next) => {
  try {
    const result = await createRoom(req.body.username);
    res.status(201).json(result);
  } catch (err: any) {
    next(err);
  }
});

export default router;