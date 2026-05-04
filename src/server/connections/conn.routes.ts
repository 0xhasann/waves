import { Router } from "express";
import { processFriendRequest, search, sendFriendRequest } from "./conn.controller";
import { validate } from "../units/validate";
import { friendRequestSchema, searchSchema } from "./conn.schema";

export const router = Router();

router.get("/search", validate(searchSchema), search);
router.post("/sendRequest", validate(friendRequestSchema), sendFriendRequest);
router.post("/processRequest", validate(friendRequestSchema), processFriendRequest);


export default router;