import type { Request, Response } from "express";
import { sendResponse } from "../units/apiResponse";
import * as repo from "./conn.repository"
import * as conRepo from "../conversations/chat.repository";
import { getSenderId } from "../units/reqSender";
import { AppError } from "../units/app.errors";
import { RequestStatus } from "../../shared/types";
import { withTransaction } from "../../db/transaction.helper";

export const search = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = await repo.searchUser(sender_id, req.query.query as string);
  sendResponse(res, 200, result, "Request has been processed Successfully");
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const pastFriendRequest = await repo.pastFriendRequest(sender_id, req.body);
  let result;
  if (pastFriendRequest)
    result = await repo.processPastFriendRequest(sender_id, req.body);
  else
    result = await repo.sendRequest(sender_id, req.body);
  sendResponse(res, 200, result, "Request has been sent");
};

export const processFriendRequest = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = await withTransaction(async () => {
    const isRequestExist = await repo.findPendingRequest(sender_id, req.body);
    if (!isRequestExist) {
      throw new AppError("Record not found");
    }
    if (isRequestExist.status !== RequestStatus.pending) {
      throw new AppError("Request already processed");
    }
    const processed = await repo.processRequest(sender_id, req.body);
    if (!processed)
      throw new AppError("Request failed");

    if (req.body.status === RequestStatus.accepted) {
      const pastFriend = await repo.fetchPastFriend(sender_id, req.body);
      if(pastFriend)
        await repo.updatePastFriend(sender_id, req.body);
      else 
        await repo.createFriends(sender_id, req.body);
      await conRepo.getOrCreateConversation(sender_id, req.body.receiver_id);
    }
    return processed;

  })
  sendResponse(res, 200, result, "Request has been processed Successfully");
};

export const unfollowFriend = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = await withTransaction(async () => {
    const isFriendsExits = await repo.findFriends(sender_id, req.body);
    if (!isFriendsExits) {
      throw new AppError("Record not found");
    }
    const processed = await repo.deleteFriends(sender_id, req.body);
    await repo.deleteFriendRequest(sender_id, req.body);
    return processed;
  })

  sendResponse(res, 200, result, "Request has been processed Successfully");
};