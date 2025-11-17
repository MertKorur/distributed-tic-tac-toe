import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[User Service] ${err.stack || err.message || err}`);

  let status = 400;

  if (err.message === "User not found") status = 404;
  else if (err.message === "Internal Server Error") status = 500;

  res.status(status).json({ error: err.message || "Internal Server Error" });
}