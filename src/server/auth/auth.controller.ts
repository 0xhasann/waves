import type { Request, Response } from "express";
import * as service from "./auth.service";
import { sendResponse, type ApiResponse } from "../middlewares/apiResponse";

export const signup = async (req: Request, res: Response) => {
    const user = await service.signup(req.body);
    sendResponse(res, 201, user, "User Created Successfully");
};

export const signin = async (req: Request, res: Response) => {
    const user = await service.signin(req.body);
    sendResponse(res, 200, user, "Welcome to Waves");
};