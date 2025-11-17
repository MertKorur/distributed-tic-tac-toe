import { Router, Request, Response, NextFunction } from "express";
import { registerUser, getUserByUsername, getUserById, getAllUsers } from "../services/userServices";

const router = Router();

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = registerUser(req.body.username);
    res.status(201).json(user);
  } catch (err: any) {
    next(err);
  }
});

router.get("/username/:username", (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = getUserByUsername(req.params.username);
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (err: any) {
    next(err);
  }
});

router.get("/id/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const user = getUserById(id);

    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (err: any) {
    next(err);
  }
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (err: any) {
    next(err);
  }
});

export default router;