import { database } from "../../db/utils";
import type { FriendRow, RequestStatus } from "../../shared/types";
import { now } from "../units/timeUtils";
import { getUserPair } from "../units/userPair";
import { createFriendQuery, deleteFriendQuery, deleteFriendRequestQuery, processRequestQuery, searchFriendQuery, searchFriendRequestQuery, searchUserQuery, sendRequestQuery } from "./conn.query";
import type { FriendsSchema, ProcessFriendRequestSchema, SendFriendRequestSchema } from "./conn.schema";
type Users = {
  id: number;
  username: string;
};
export const searchUser = (q: string): Users[] | undefined => {
  const result = database
    .prepare(searchUserQuery)
    .all(q, q, q, q, q) as Users[] | undefined;
  return result;
};

export const sendRequest = (sender_id: number, query: SendFriendRequestSchema): number => {
  const result = database.
    prepare(sendRequestQuery)
    .run(sender_id, query.receiver_id);
  return result.lastInsertRowid as number;
};

export const findPendingRequest = (sender_id: number, query: ProcessFriendRequestSchema) => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const existing = database
    .prepare(searchFriendRequestQuery)
    .get(u1, u2) as { status: RequestStatus } | null;
  return existing;

}

export const processRequest = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.
    prepare(processRequestQuery)
    .run(query.status, now(),query.status,  u1, u2);
  return result.changes;
};

export const createFriends = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.receiver_id);
  const result = database.
    prepare(createFriendQuery)
    .run(u1, u2);
  return result.lastInsertRowid as number;
};

export const findFriends = (sender_id: number, query: FriendsSchema): boolean => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.
    prepare(searchFriendQuery)
    .get(u1, u2) as FriendRow | null;
  return !!result;
}

export const deleteFriends = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.
    prepare(deleteFriendQuery)
    .run(now(), u1, u2);
  return result.changes;
};

export const deleteFriendRequest = (sender_id: number, query: FriendsSchema): number => {
  const { u1, u2 } = getUserPair(sender_id, query.user2_id);
  const result = database.
    prepare(deleteFriendRequestQuery)
    .run(now(), u1, u2);
  return result.changes;
};