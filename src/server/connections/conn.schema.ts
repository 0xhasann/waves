import { z } from "zod";

export const searchSchema = z.object({
    body: z.object({
        query: z.string().min(1, "Search query is required"),
    }),
});

export type SearchSchema = z.infer<typeof searchSchema>["body"];