import { Router, Request, Response } from "express";
import { registerUser } from "../services/userServices";

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

export default router;