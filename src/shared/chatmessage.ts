import * as z from "zod";
export type Name = string;
export type ChatMessage =
    { type: "login"; data: { name: Name } } |
    { type: "call"; data: { name: Name } } |
    { type: "accept"; data: { caller: Name } }
    | { type: "logout" };

const nameSchema = z.string();
const loginSchema = z.object({ type: z.literal("login"), data: z.object({ name: nameSchema }) });
const callSchema = z.object({ type: z.literal("call"), data: z.object({ name: nameSchema }) });
const acceptSchema = z.object({ type: z.literal("accept"), data: z.object({ caller: nameSchema }) });
const logoutSchema = z.object({ type: z.literal("logout") });



export const ChatMessageSchema = z.discriminatedUnion("type", [
    loginSchema, callSchema, acceptSchema, logoutSchema
])