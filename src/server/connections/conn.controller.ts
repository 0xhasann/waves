import type { Request, Response } from "express";
import * as service from "./conn.service";
import { sendResponse } from "../units/apiResponse";
import type { SearchSchema } from "./conn.schema";

export const search = async (req: Request, res: Response) => {
	// const query = { query: req.query.query as string };
	console.log("search query :: ", req.query);
	const result = await service.search(req.query.query as string);
	sendResponse(res, 200, result, `${result.length} users found`);
};

export const sendFriendRequest = async (req: Request, res: Response) => {
    const result = await service.sendFriendRequest(req.body);
    sendResponse(res, 200, result, "Request has been sent");
};

export const processFriendRequest = async (req: Request, res: Response) => {
    const result = await service.processFriendRequest(req.body);
    sendResponse(res, 200, result, "Request has been processed Successfully");
};

export const unfollowFriend = async (req: Request, res: Response) => {
    const result = await service.unfollowFriend(req.body);
    sendResponse(res, 200, result, "Request has been processed Successfully");
};