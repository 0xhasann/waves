import type { Request, Response } from 'express';
import { sendResponse } from '../../shared/apiResponse';
import * as repo from '../repositories/conn.repository';
import * as conRepo from '../repositories/chat.repository';
import { getSenderId } from '../units/reqSender';
import { AppError } from '../units/app.errors';
import { RequestStatus } from '../../shared/types';
import { withTransaction } from '../../db/transaction.helper';
import type { FriendsSchema, ProcessFriendRequestSchema, SendFriendRequestSchema } from '../schemas/conn.schema';

export const search = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = repo.searchUser(sender_id, req.query.query as string);
  sendResponse(res, 200, result, 'Request has been processed Successfully');
};

export const sendFriendRequest = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const pastFriendRequest = repo.pastFriendRequest(sender_id, req.body as SendFriendRequestSchema);
  let result;
  if (pastFriendRequest) result = repo.processPastFriendRequest(sender_id, req.body as SendFriendRequestSchema);
  else result = repo.sendRequest(sender_id, req.body as SendFriendRequestSchema);
  sendResponse(res, 200, result, 'Request has been sent');
};

export const processFriendRequest = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = withTransaction(() => {
    const isRequestExist = repo.findPendingRequest(sender_id, req.body as ProcessFriendRequestSchema);
    if (!isRequestExist) {
      throw new AppError('Record not found');
    }
    if (isRequestExist.status !== RequestStatus.pending) {
      throw new AppError('Request already processed');
    }
    const processed = repo.processRequest(sender_id, req.body as ProcessFriendRequestSchema);
    if (!processed) throw new AppError('Request failed');

    if ((req.body as ProcessFriendRequestSchema).status === RequestStatus.accepted) {
      const pastFriend = repo.fetchPastFriend(sender_id, req.body as ProcessFriendRequestSchema);
      if (pastFriend) repo.updatePastFriend(sender_id, req.body as ProcessFriendRequestSchema);
      else repo.createFriends(sender_id, req.body as ProcessFriendRequestSchema);
      conRepo.getOrCreateConversation(sender_id, (req.body as ProcessFriendRequestSchema).receiver_id);
    }
    return processed;
  });
  sendResponse(res, 200, result, 'Request has been processed Successfully');
};

export const unfollowFriend = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = withTransaction(() => {
    const isFriendsExits = repo.findFriends(sender_id, req.body as FriendsSchema);
    if (!isFriendsExits) {
      throw new AppError('Record not found');
    }
    const processed = repo.deleteFriends(sender_id, req.body as FriendsSchema);
    repo.deleteFriendRequest(sender_id, req.body as FriendsSchema);
    repo.deleteConverstation(sender_id, req.body as FriendsSchema);
    return processed;
  });

  sendResponse(res, 200, result, 'Request has been processed Successfully');
};

export const fetchPendingRequests = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = repo.findPendingRequests(sender_id);

  sendResponse(res, 200, result, 'pending Requests');
};
