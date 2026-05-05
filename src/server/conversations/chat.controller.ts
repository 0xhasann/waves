import type { Request, Response } from "express";
import * as service from "./chat.service";
import { sendResponse } from "../units/apiResponse";

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