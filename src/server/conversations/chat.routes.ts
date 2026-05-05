import { Router } from "express";
import { validate } from "../units/validate";
import { conversationSchema, fetchConversationSchema, sendConversationMessageSchema } from "./chat.schema";
import { createConversation, fetchConversations, sendConversationMessages } from "./chat.controller";

export const router = Router();

router.post("/createOrGetConversation", validate(conversationSchema), createConversation);

router.get("/messages", validate(fetchConversationSchema), fetchConversations);
router.post("/messages", validate(sendConversationMessageSchema), sendConversationMessages);

export default router;