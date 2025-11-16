import { Router, Request, Response } from "express";
import { registerUser, getUserByUsername, getUserById, getAllUsers } from "../services/userServices";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const user = registerUser(username);
    res.status(201).json(user);

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/username/:username", (req: Request, res: Response) => {
  const { username } = req.params;
  const user = getUserByUsername(username);

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.get("/id/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = getUserById(id);

  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.get("/", (req: Request, res: Response) => {
  const users = getAllUsers();
  res.json(users);
});

export default router;