import type { Request, Response } from "express";
import { sendResponse } from "../units/apiResponse";
import * as repo from "./conn.repository"
import { getSenderId } from "../units/reqSender";
import { AppError } from "../units/app.errors";
import { RequestStatus } from "../../shared/types";

export const search = async (req: Request, res: Response) => {
  const result = await repo.searchUser(req.query.query as string);
  sendResponse(res, 200, result, "Request has been processed Successfully");
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = await repo.sendRequest(sender_id, req.body);
  sendResponse(res, 200, result, "Request has been sent");
};

export const processFriendRequest = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const isRequestExist = await repo.findPendingRequest(sender_id, req.body);
  if (!isRequestExist) {
    throw new AppError("Record not found");
  }
  if (isRequestExist.status !== RequestStatus.pending) {
    throw new AppError("Request already processed");
  }
  const result = await repo.processRequest(sender_id, req.body);
  if (!result)
    throw new AppError("Request failed");

  if (result && req.body.status === RequestStatus.accepted) {
    const createFriend = repo.createFriends(sender_id, req.body);
    console.log(`Friend is created with id ${createFriend}`);
  }
  sendResponse(res, 200, result, "Request has been processed Successfully");
};

export const unfollowFriend = async (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const isFriendsExits = await repo.findFriends(sender_id, req.body);
  if (!isFriendsExits) {
    throw new AppError("Record not found");
  }
  const result = await repo.deleteFriends(sender_id, req.body);
  sendResponse(res, 200, result, "Request has been processed Successfully");
};