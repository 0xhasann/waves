import * as z from "zod";
import { ChatMessageSchema, type ChatMessage } from "./chatmessage";
import { SignalMessageSchema, type SignalMessage } from "./signalingserver";

export type WebSocketMessage = ChatMessage | SignalMessage;

export const WebSocketMessageSchema = z.discriminatedUnion("type",[
    ChatMessageSchema, SignalMessageSchema
]);