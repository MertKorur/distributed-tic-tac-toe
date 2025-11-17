import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Room Service] ${err.stack || err.message || err}`);

  let status = 400;

  if (err.message.includes("already exists")) status = 409;
  if (err.message.includes("Failed to create room")) status = 500;
  if (err.message.includes("Room does not exist")) status = 404;

  if (res.headersSent) return next(err);

  res.status(status).json({ error: err.message || "Internal Server Error" });
}