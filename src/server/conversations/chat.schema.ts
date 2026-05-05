import * as z from "zod";

export const conversationSchema = z.object({
    body: z.object({
        user1_id: z.number().min(1),
        user2_id: z.number().min(1),
    }),
});

export const fetchConversationSchema = z.object({
    body: z.object({
        conversation_id: z.number(),
        limit: z.number().optional(),
    }),
});


export const sendConversationMessageSchema = z.object({
    body: z.object({
        conversation_id: z.number(),
        sender_id: z.number(),
        type: z.enum(["text"]),
        content: z.string(),
    }),
});

export type ConversationSchema = z.infer<typeof conversationSchema>["body"];
export type FetchConversationSchema = z.infer<typeof fetchConversationSchema>["body"];
export type SendConversationMessageSchema = z.infer<typeof sendConversationMessageSchema>["body"];
