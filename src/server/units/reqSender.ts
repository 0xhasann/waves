import type { Request } from "express";
import type { JwtUser } from "../../shared/types";
import { AppError } from "./app.errors";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function getSenderId(req: Request): number {
  const sender_id = req.user?.userId;
  if (!sender_id) throw new AppError("Unauthorised Request");
  console.log("sender_id ::", sender_id);
  return sender_id;
}