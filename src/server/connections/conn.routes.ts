import { Router } from "express";
import { processFriendRequest, search, sendFriendRequest, unfollowFriend } from "./conn.controller";
import { validate } from "../units/validate";
import {  friendsSchema, processFriendRequestSchema, searchSchema, sendFriendRequestSchema } from "./conn.schema";

export const router = Router();

router.get("/search", validate(searchSchema), search);
router.post("/sendRequest", validate(sendFriendRequestSchema), sendFriendRequest);
router.post("/processRequest", validate(processFriendRequestSchema), processFriendRequest);
router.post("/unfollowFriend", validate(friendsSchema), unfollowFriend);


export default router;