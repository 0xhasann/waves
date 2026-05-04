import type { Request, Response } from "express";
import * as service from "./conn.service";
import { sendResponse } from "../units/apiResponse";

export const search = async (req: Request, res: Response) => {
    const result = await service.search(req.body);
    sendResponse(res, 200, result, `${result.length} users found`);
};

export const sendFriendRequest = async (req: Request, res: Response) => {
    const result = await service.sendFriendRequest(req.body);
    sendResponse(res, 200, result, "Request has been sent");
};

export const processFriendRequest = async (req: Request, res: Response) => {
    const result = await service.processFriendRequest(req.body);
    sendResponse(res, 200, result, "Request has been processed");
};