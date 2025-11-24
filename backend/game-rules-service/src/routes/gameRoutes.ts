import { Router, Request, Response, NextFunction } from "express";
import { startGame, deleteGame, makeMove, getGameStatus, joinGame } from "../services/gameServices";

const router = Router();

router.post("/start", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, playerX, playerO } = req.body;
    const result = startGame(roomId, playerX, playerO ?? null);

    if ("error" in result) throw new Error(result.error);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/join", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, playerO } = req.body;
    const result = joinGame(roomId, playerO);

    if ("error" in result) throw new Error(result.error);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/move", (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, player, position } = req.body;
    const result = makeMove(roomId, player, position);

    if ("error" in result) throw new Error(result.error);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/status/:roomId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = getGameStatus(req.params.roomId);

    if ("error" in status) throw new Error(status.error);

    res.json(status);
  } catch (err) {
    next(err);
  }
});

// Delete a finished game
router.delete("/end/:roomId", (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = deleteGame(req.params.roomId);

    if ("error" in result) throw new Error(result.error);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;