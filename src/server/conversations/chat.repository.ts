import { database } from "../../db/utils";
import type { Conversation, Conversations, MessageDTO } from "../../shared/types";
import { prepareCreateConvQuery, prepareFetchAllConversations, prepareFetchConvQuery, prepareP2PConversationsSchema, prepareSendMessageQuery } from "./chat.query";
import type { ConversationSchema, FetchConversationSchema, SendConversationMessageSchema } from "./chat.schema";

export const getOrCreateConversation = (user1_id: number, query: ConversationSchema): number => {
    const u1 = Math.min(user1_id, Number(query.user2_id));
    const u2 = Math.max(user1_id, Number(query.user2_id));
    const conversation = database.
        prepare(prepareCreateConvQuery)
        .get(u1, u2) as Conversation;

    return conversation.id;
}

export const fetchConversations = (query: FetchConversationSchema): any[] | undefined => {
    const rows = database
        .prepare(prepareFetchConvQuery)
        .all(query.conversation_id, query.limit ?? 5) as any[];
    if (!rows.length) return undefined;
    return rows;
};

export const sendConversationMessages = (sender_id: number, query: SendConversationMessageSchema): number => {
    const result = database.prepare(prepareSendMessageQuery).run(query.conversation_id, sender_id, query.type, query.content);
    return result.lastInsertRowid as number;
}

export const fetchAllConversations = (sender_id: number): Conversations[] | undefined => {
    return database.prepare(prepareFetchAllConversations).all(sender_id, sender_id, sender_id) as Conversations[] | undefined;
}

export const fetchP2PConversations = (user1_id: number, query: ConversationSchema): MessageDTO[] | undefined => {
    const user2_id = Number(query.user2_id);
    return database.prepare(prepareP2PConversationsSchema).all(user2_id, user1_id, user2_id, user2_id, user1_id) as MessageDTO[] | undefined;
} 
