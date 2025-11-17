import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Game Rules Service] ${err.stack || err.message || err}`);

  let status = 400;

  if (err.message.includes("Invalid move")) status = 400;
  if (err.message.includes("Game not found")) status = 404;
  if (err.message.includes("Game already finished")) status = 409;

  if (res.headersSent) return next(err);

  res.status(status).json({ error: err.message || "Internal Server Error" });
}