import { Router } from "express";
import { validate } from "../units/validate";
import { conversationSchema, fetchConversationSchema, sendConversationMessageSchema } from "./chat.schema";
import { createConversation, fetchAllConversations, fetchConversations, fetchP2PConversations, sendConversationMessages } from "./chat.service";

export const router = Router();

router.post("/createOrGetConversation", validate(conversationSchema), createConversation);

router.get("/fetchAllConversations", fetchAllConversations);
router.get("/fetchP2PConversations", validate(conversationSchema), fetchP2PConversations);

router.get("/messages", validate(fetchConversationSchema), fetchConversations);
router.post("/messages", validate(sendConversationMessageSchema), sendConversationMessages);

export default router;