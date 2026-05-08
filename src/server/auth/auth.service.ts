import type { Request, Response } from "express";
import { sendResponse } from "../units/apiResponse";
import { tokenCookie } from "./auth.google";
import * as repo from "./auth.repository"
import { AppError } from "../units/app.errors";
import { verifyPassword } from "../units/validate";

export const signup = async (req: Request, res: Response) => {
  const user = repo.findByUsername(req.body.username);
  if (user)
    throw new AppError("User Already Exists", 403);

  const userId = repo.createUser(req.body);
  tokenCookie(userId as number, req, res);
  sendResponse(res, 201, user, "User Created Successfully");
};

export const signin = async (req: Request, res: Response) => {
  const user = repo.findByUsername(req.body.username);
  if (!user)
    throw new AppError("Invalid Credentials", 401);

  const isValid = verifyPassword(req.body.password, user.user_pass);
  if (!isValid)
    throw new AppError("Invalid Credentials", 401);

  tokenCookie(user.id, req, res);
  sendResponse(res, 200, user, "Welcome to Waves");
};