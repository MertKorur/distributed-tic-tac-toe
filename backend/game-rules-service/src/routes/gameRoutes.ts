import { Router, Request, Response } from "express";
import { startGame, makeMove } from "../services/gameServices";
import { ErrorResponse } from "shared/types";

const router = Router();

router.post("/start", (req: Request, res: Response) => {
  const { roomId, playerX, playerO } = req.body;
  const result = startGame(roomId, playerX, playerO);
  res.json(result);
});

router.post("/move", (req: Request, res: Response) => {
    const { roomId, playerX, position } = req.body;
    const result = makeMove(roomId, playerX, position);

    if ((result as ErrorResponse).error) {
        res.status(400).json(result);
    } else {
        res.json(result);
    }
});

export default router;