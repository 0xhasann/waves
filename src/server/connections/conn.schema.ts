import { z } from "zod";

export const searchSchema = z.object({
    body: z.object({
        query: z.string().min(1, "Search query is required"),
    }),
});

export const friendRequestSchema = z.object({
    body: z.object({
        sender_id: z.number().min(1, "sender id is required"),
        receiver_id: z.number().min(1, "receiver id is required"),
        status: z.string().min(1, "status is requred"),
    }),
});



export type SearchSchema = z.infer<typeof searchSchema>["body"];
export type FriendRequestSchema = z.infer<typeof friendRequestSchema>["body"];
