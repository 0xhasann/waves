import { database } from '../../db/utils';
import type { FriendRow, PendingFriendRequests, RequestStatus, UserSearchResult } from '../../shared/types';
import { now } from '../../shared/timeUtils';
import { getUserPair } from '../units/userPair';
import {
  searchUserQuery,
  upsertFriendRequestQuery,
  getRelationshipQuery,
  searchFriendRequestQuery,
  processRequestQuery,
  upsertFriendQuery,
  searchFriendQuery,
  deleteFriendQuery,
  deleteFriendRequestQuery,
  deleteConversationQuery,
  findAllPendingRequests,
  conversationExistsQuery,
} from '../../db/queries/conn.query';
import type { FriendsSchema } from '../schemas/conn.schema';

export const searchUser = (sender_id: number, q: string): UserSearchResult[] | undefined => {
  const wildcard = `%${q}%`;
  const result = database
    .prepare(searchUserQuery)
    .all(sender_id, sender_id, sender_id, sender_id, wildcard, q, wildcard, wildcard, wildcard, sender_id) as
    | UserSearchResult[]
    | undefined;
  return result;
};

export const getRelationship = (
  sender_id: number,
  receiver_id: number,
): { status: RequestStatus; deleted: number; sender_id: number; receiver_id: number } | null => {
  return database.prepare(getRelationshipQuery).get(sender_id, receiver_id, receiver_id, sender_id) as {
    status: RequestStatus;
    deleted: number;
    sender_id: number;
    receiver_id: number;
  } | null;
};

export const upsertFriendRequest = (sender_id: number, receiver_id: number): number => {
  const result = database.prepare(upsertFriendRequestQuery).run(sender_id, receiver_id);
  return result.changes;
};

export const findPendingRequest = (
  sender_id: number,
  receiver_id: number,
): { status: RequestStatus; sender_id: number; receiver_id: number } | null => {
  return database.prepare(searchFriendRequestQuery).get(sender_id, receiver_id, receiver_id, sender_id) as {
    status: RequestStatus;
    sender_id: number;
    receiver_id: number;
  } | null;
};

export const processRequest = (actual_sender_id: number, actual_receiver_id: number, status: string): number => {
  const result = database.prepare(processRequestQuery).run(status, now(), status, actual_sender_id, actual_receiver_id);
  return result.changes;
};

export const upsertFriend = (sender_id: number, receiver_id: number): number => {
  const { u1, u2 } = getUserPair(sender_id, receiver_id);
  const result = database.prepare(upsertFriendQuery).run(u1, u2);
  return result.changes;
};

export const findFriends = (sender_id: number, query: FriendsSchema): boolean => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(searchFriendQuery).get(u1, u2) as FriendRow | null;
  return !!result;
};

export const conversationExists = (conversation_id: number): boolean => {
  const row = database.prepare(conversationExistsQuery).get(conversation_id) as { conversation_exists: number };
  const exists = row?.conversation_exists === 1;
  return exists;
};

export const deleteFriends = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(deleteFriendQuery).run(now(), u1, u2);
  return result.changes;
};

export const deleteFriendRequest = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(deleteFriendRequestQuery).run(now(), u1, u2, u2, u1);
  return result.changes;
};

export const deleteConversation = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.prepare(deleteConversationQuery).run(now(), u1, u2, u2, u1);
  return result.changes;
};

export const findPendingRequests = (received_id: number): PendingFriendRequests[] | undefined => {
  const result = database.prepare(findAllPendingRequests).all(received_id, received_id, received_id) as
    | PendingFriendRequests[]
    | undefined;
  return result;
};
