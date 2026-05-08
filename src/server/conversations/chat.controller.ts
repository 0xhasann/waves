import type { Request, Response } from "express";
import * as service from "./chat.service";
import { sendResponse } from "../units/apiResponse";
import { AppError } from "../units/app.errors";
import * as repo from "./chat.repository"

export const createConversation = async (req: Request, res: Response) => {
    const result = await service.conversation(req.body);
    sendResponse(res, 200, result, "Record has been processed successfully");
}; 

export const fetchConversations = async (req: Request, res: Response) => {
    const result = await service.fetchConvs(req.body);
    sendResponse(res, 200, result, "Conversation fetched");
}; 

export const sendConversationMessages = async (req: Request, res: Response) => {
    const result = await service.sendConvs(req.body);
    sendResponse(res, 200, result, "Message is sent Successfully");
};

export const fetchAllConversations = async (req: Request, res: Response) => {
    const sender_id = req.user?.userId;
    if(!sender_id) throw new AppError("Unauthorised Request");
    console.log("sender_id ::", sender_id);
    const result = await repo.fetchAllConversations(sender_id);
    sendResponse(res, 200, result, "Record has been processed successfully");
}; 