import { Router, Request, Response } from "express";
import { startGame, makeMove, getGameStatus, joinGame } from "../services/gameServices";
import { ErrorResponse } from "shared/types";

const router = Router();

router.post("/start", (req: Request, res: Response) => {
  const { roomId, playerX, playerO } = req.body;

  const result = startGame(roomId, playerX, playerO ?? null);

  if ((result as ErrorResponse).error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

router.post("/join", (req: Request, res: Response) => {
    const { roomId, playerO } = req.body;
    const result = joinGame(roomId, playerO);

    if ((result as ErrorResponse).error) {
        return res.status(400).json(result);
    }

    res.json(result);
});

router.post("/move", (req: Request, res: Response) => {
    const { roomId, player, position } = req.body;
    const result = makeMove(roomId, player, position);

    if ((result as ErrorResponse).error) {
        res.status(400).json(result);
    }
    
    res.json(result);
});

router.get("/status/:roomId", (req: Request, res: Response) => {
    const result = getGameStatus(req.params.roomId);

    if ((result as ErrorResponse).error) {
        return res.status(400).json(result);
    }
    
    res.json(result);
});

export default router;