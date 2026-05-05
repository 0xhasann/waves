import { database } from "../../db/utils";
import type { Conversation } from "../../shared/types";
import { prepareCreateConvQuery, prepareFetchConvQuery, prepareSendMessageQuery } from "./chat.query";
import type { ConversationSchema, FetchConversationSchema, SendConversationMessageSchema } from "./chat.schema";

export const getOrCreateConversation = (query: ConversationSchema): number | bigint => {
    const u1 = Math.min(query.user1_id, query.user2_id);
    const u2 = Math.max(query.user1_id, query.user2_id);
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

export const sendConversationMessages = (query: SendConversationMessageSchema): number | bigint => {
    const result = database.prepare(prepareSendMessageQuery).run(query.conversation_id, query.sender_id, query.type, query.content);
    return result.lastInsertRowid;
}
