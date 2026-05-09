import type { Request, Response } from "express";
import { sendResponse } from "../units/apiResponse";
import { AppError } from "../units/app.errors";
import * as repo from "./chat.repository"
import type { Conversation } from "../../shared/types";
import { getSenderId } from "../units/reqSender";
import type { ConversationSchema } from "./chat.schema";

export const createConversation = async (req: Request, res: Response) => {
    const sender_id = getSenderId(req);
    const receiver_id = Number(req.body.user2_id)
    const result = await repo.getOrCreateConversation(sender_id, receiver_id);
    sendResponse(res, 200, result, "Record has been processed successfully");
};

export const fetchConversations = async (req: Request, res: Response) => {
    const rows = await repo.fetchConversations(req.body);
    if (!rows)
        throw new AppError("Request failed");

    const result: Conversation = {
        id: rows[0].conversation_id,
        messages: [],
        updated_at: rows[0].updated_at,
    };
    for (const row of rows) {
        if (row.message_id) {
            result.messages.push({
                id: row.message_id,
                sender_id: row.sender_id,
                type: row.type,
                content: row.content,
                created_at: row.created_at,
            });
        }
    }
    result.messages.reverse();
    sendResponse(res, 200, result, "Conversation fetched");
};

export const sendConversationMessages = async (req: Request, res: Response) => {
    const sender_id = getSenderId(req);
    const result = await repo.sendConversationMessages(sender_id, req.body);
    sendResponse(res, 200, result, "Message is sent Successfully");
};

export const fetchAllConversations = async (req: Request, res: Response) => {
    const sender_id = getSenderId(req);
    const result = await repo.fetchAllConversations(sender_id);
    sendResponse(res, 200, result, "Records has been fetched successfully");
};

export const fetchP2PConversations = async (req: Request, res: Response) => {
    const user1_id = getSenderId(req);
    const result = await repo.fetchP2PConversations(user1_id, req.query as ConversationSchema);
    sendResponse(res, 200, result, "Records has been fetched successfully");
}


