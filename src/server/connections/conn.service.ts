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
  sendResponse(res, 200, result, 'Request has been processed successfully');
};

export const sendFriendRequest = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const { receiver_id } = req.body as SendFriendRequestSchema;

  const existing = repo.getRelationship(sender_id, receiver_id);

  if (existing && existing.deleted === 0) {
    if (existing.status === RequestStatus.pending) throw new AppError('Friend request already pending', 409);
    if (existing.status === RequestStatus.accepted) throw new AppError('Already friends', 409);
  }

  const result = repo.upsertFriendRequest(sender_id, receiver_id);
  sendResponse(res, 200, result, 'Request has been sent');
};

export const processFriendRequest = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const body = req.body as ProcessFriendRequestSchema;

  const result = withTransaction(() => {
    const existing = repo.findPendingRequest(sender_id, body.receiver_id);

    if (!existing) throw new AppError('Record not found', 404);
    if (existing.status !== RequestStatus.pending) throw new AppError('Request already processed', 409);

    const processed = repo.processRequest(existing.sender_id, existing.receiver_id, body.status);
    if (!processed) throw new AppError('Request failed', 500);

    if (body.status === RequestStatus.accepted) {
      repo.upsertFriend(sender_id, body.receiver_id);
      conRepo.getOrCreateConversation(sender_id, body.receiver_id);
    }

    return processed;
  });

  sendResponse(res, 200, result, 'Request has been processed successfully');
};

export const unfollowFriend = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);

  const result = withTransaction(() => {
    const isFriendExists = repo.findFriends(sender_id, req.body as FriendsSchema);
    if (!isFriendExists) throw new AppError('Record not found', 404);

    const processed = repo.deleteFriends(sender_id, req.body as FriendsSchema);
    repo.deleteFriendRequest(sender_id, req.body as FriendsSchema);
    repo.deleteConversation(sender_id, req.body as FriendsSchema);

    return processed;
  });

  sendResponse(res, 200, result, 'Request has been processed successfully');
};

export const fetchPendingRequests = (req: Request, res: Response) => {
  const sender_id = getSenderId(req);
  const result = repo.findPendingRequests(sender_id);
  sendResponse(res, 200, result, 'Pending requests');
};
