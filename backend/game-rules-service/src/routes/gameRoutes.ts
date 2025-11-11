import { Router, Request, Response } from "express";
import { startGame, makeMove, getGameStatus } from "../services/gameServices";
import { ErrorResponse } from "shared/types";

const router = Router();

router.post("/start", (req: Request, res: Response) => {
  const { roomId, playerX, playerO } = req.body;
  const result = startGame(roomId, playerX, playerO);
  res.json(result);
});

router.post("/move", (req: Request, res: Response) => {
    const { roomId, player, position } = req.body;
    const result = makeMove(roomId, player, position);

    if ((result as ErrorResponse).error) {
        res.status(400).json(result);
    } else {
        res.json(result);
    }
});

router.get("/status/:roomId", (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const status = getGameStatus(roomId);
        res.json(status);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;