import type { ConversationSchema, FetchConversationSchema, SendConversationMessageSchema } from "./chat.schema";
import * as repo from "./chat.repository"
import { AppError } from "../units/app.errors";
import type { Conversation } from "../../shared/types";

export const conversation = async (body: ConversationSchema) => {
    const result = await repo.getOrCreateConversation(body);
    if (!result)
        throw new AppError("Request failed");
    return result;
}

export const fetchConvs = async (body: FetchConversationSchema) => {
    const rows = await repo.fetchConversations(body);
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
    return result;
}

export const sendConvs = async (body: SendConversationMessageSchema) => {
    const result = await repo.sendConversationMessages(body);
    if (!result)
        throw new AppError("Request failed");
    return result;
}