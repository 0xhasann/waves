import { z } from "zod";

export const searchSchema = z.object({
    query: z.object({
        query: z.string().trim(),
    }),
});

export const sendFriendRequestSchema = z.object({
    body: z.object({
        receiver_id: z.number().min(1, "receiver id is required"),
    }),
});

export const processFriendRequestSchema = z.object({
    body: z.object({
        receiver_id: z.number().min(1, "receiver id is required"),
        status: z.string().min(1, "status is requred"),
    }),
});


export const friendsSchema = z.object({
    body: z.object({
        user2_id: z.number().min(1, "user2_id id is required"),

    }),
});

export type SearchSchema = z.infer<typeof searchSchema>["query"];
export type ProcessFriendRequestSchema = z.infer<typeof processFriendRequestSchema>["body"];
export type SendFriendRequestSchema = z.infer<typeof sendFriendRequestSchema>["body"];

export type FriendsSchema = z.infer<typeof friendsSchema>["body"];

