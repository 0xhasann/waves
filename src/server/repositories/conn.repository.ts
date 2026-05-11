import { database } from '../../db/utils';
import type { Conversations, FriendRow, PendingFriendRequests, RequestStatus } from '../../shared/types';
import { now } from '../../shared/timeUtils';
import { getUserPair } from '../units/userPair';
import {
  createFriendQuery,
  deleteFriendQuery,
  deleteFriendRequestQuery,
  fetchPastFriendQuery,
  findAllPendingRequests,
  pastFriendRequestQuery,
  processpastFriendRequestQuery,
  processRequestQuery,
  searchFriendQuery,
  searchFriendRequestQuery,
  searchUserQuery,
  sendRequestQuery,
  updatePastFriendQuery,
} from '../../db/queries/conn.query';
import type { FriendsSchema, ProcessFriendRequestSchema, SendFriendRequestSchema } from '../schemas/conn.schema';

export const searchUser = (sender_id: number, q: string): Conversations[] | undefined => {
  const result = database.prepare(searchUserQuery).all(sender_id, sender_id, q, q, q, q, q, sender_id) as
    | Conversations[]
    | undefined;
  return result;
};

export const sendRequest = (sender_id: number, query: SendFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(sendRequestQuery).run(u1, u2);
  return result.lastInsertRowid as number;
};
export const pastFriendRequest = (sender_id: number, query: SendFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(pastFriendRequestQuery).get(u1, u2) as number;
  return result;
};

export const processPastFriendRequest = (sender_id: number, query: SendFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(processpastFriendRequestQuery).run(now(), u1, u2);
  return result.changes;
};

export const findPendingRequest = (sender_id: number, query: ProcessFriendRequestSchema) => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const existing = database.prepare(searchFriendRequestQuery).get(u1, u2) as {
    status: RequestStatus;
  } | null;
  return existing;
};

export const processRequest = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(processRequestQuery).run(query.status, now(), query.status, u1, u2);
  return result.changes;
};

export const createFriends = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(createFriendQuery).run(u1, u2);
  return result.lastInsertRowid as number;
};

export const fetchPastFriend = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(fetchPastFriendQuery).get(u1, u2) as number;
  return result;
};

export const updatePastFriend = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.prepare(updatePastFriendQuery).run(now(), u1, u2);
  return result.changes;
};

export const findFriends = (sender_id: number, query: FriendsSchema): boolean => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(searchFriendQuery).get(u1, u2) as FriendRow | null;
  return !!result;
};

export const deleteFriends = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(deleteFriendQuery).run(now(), u1, u2);
  return result.changes;
};

export const deleteFriendRequest = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(deleteFriendRequestQuery).run(now(), u1, u2);
  return result.changes;
};

export const findPendingRequests = (received_id: number): PendingFriendRequests[] | undefined => {
  const result = database.prepare(findAllPendingRequests).all(received_id) as PendingFriendRequests[] | undefined;
  return result;
};
