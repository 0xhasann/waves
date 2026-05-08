import { database } from "../../db/utils";
import type { FriendRow, RequestStatus } from "../../shared/types";
import { now } from "../units/timeUtils";
import type { FriendsSchema, ProcessFriendRequestSchema, SendFriendRequestSchema } from "./conn.schema";
type Users = {
  id: number;
  username: string;
};
export const searchUser = (query: string): Users[] | undefined => {
  const q = query;

  const result = database
    .prepare(
      `SELECT id, username  FROM users WHERE email_id = ? OR mobile_no = ? OR username = ? OR first_name = ? OR last_name = ?;`,
    )
    .all(q, q, q, q, q) as Users[] | undefined;
  return result;
};

export const sendRequest = (sender_id: number, query: SendFriendRequestSchema): number => {
  const result = database.
    prepare(`INSERT into friend_requests (status, sender_id, receiver_id) VALUES(?, ?, ?)`)
    .run("pending", sender_id, query.receiver_id);
  return result.lastInsertRowid as number;
};

export const findPendingRequest = (sender_id: number, query: ProcessFriendRequestSchema) => {
  const existing = database
    .prepare(`SELECT status FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`)
    .get(sender_id, query.receiver_id) as { status: RequestStatus } | null;
  return existing;

}

export const processRequest = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const result = database.
    prepare(`UPDATE friend_requests set status = ?, updated_at = ? where sender_id = ? and receiver_id = ?;`)
    .run(query.status ?? "pending", now(), sender_id, query.receiver_id);
  return result.changes;
};

export const createFriends = (sender_id: number, query: ProcessFriendRequestSchema): number => {
  const user1_id = Math.min(sender_id, query.receiver_id);
  const user2_id = Math.max(sender_id, query.receiver_id);
  const result = database.
    prepare(`INSERT into friends (user1_id, user2_id) VALUES(?, ?)`)
    .run(user1_id, user2_id);
  return result.lastInsertRowid as number;
};

export const findFriends = (sender_id: number, query: FriendsSchema): boolean => {
  const user1_id = Math.min(sender_id, query.user2_id);
  const user2_id = Math.max(sender_id, query.user2_id);
  const result = database.
    prepare(`SELECT 1 FROM friends WHERE user1_id = ? AND user2_id = ? AND deleted = 0;`)
    .get(user1_id, user2_id) as FriendRow | null;
  return !!result;
}

export const deleteFriends = (sender_id: number, query: FriendsSchema): number => {
  const user1_id = Math.min(sender_id, query.user2_id);
  const user2_id = Math.max(sender_id, query.user2_id);
  const result = database.
    prepare(`UPDATE friends set deleted = 1, updated_at=? WHERE user1_id = ? AND user2_id =?;`)
    .run(now(), user1_id, user2_id);
  return result.changes;
};