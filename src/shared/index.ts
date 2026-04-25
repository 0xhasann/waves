import * as z from "zod";
import { ChatMessageSchema, type ChatMessage } from "./chatmessage";
import { SignalMessageSchema, type SignalMessage } from "./signalingserver";

// combine user session message and webrtc negatiation
// zod validates every incoming message on both sides
export type WebSocketMessage = ChatMessage | SignalMessage;

export const WebSocketMessageSchema = z.discriminatedUnion("type",[
    ChatMessageSchema, SignalMessageSchema
]);