import type { Request, Response } from "express";
import * as service from "./auth.service";
import { sendResponse } from "../units/apiResponse";
import { tokenCookie } from "./auth.google";

export const signup = async (req: Request, res: Response) => {
    const user = await service.signup(req.body);
    tokenCookie(user.id as number, req, res);
    sendResponse(res, 201, user, "User Created Successfully");
};

export const signin = async (req: Request, res: Response) => {
    const user = await service.signin(req.body);
    tokenCookie(user.id, req, res);
    sendResponse(res, 200, user, "Welcome to Waves");
};