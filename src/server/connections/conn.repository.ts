import { database } from "../../db/utils";
import type { FriendRow, RequestStatus } from "../../shared/types";
import { now } from "../units/timeUtils";
import type { FriendsSchema, ProcessFriendRequestSchema, SendFriendRequestSchema } from "./conn.schema";

export const searchUser = (query: string): string[] | undefined => {
  console.log(query);
  const q = query.trim();
  return database
    .prepare(`SELECT id, username  FROM users WHERE email_id = ? OR mobile_no = ? OR username = ? OR first_name = ? OR last_name = ?;`)
    .all(q, q, q, q, q) as string[] | undefined;
};

export const sendRequest = (query: SendFriendRequestSchema): number | bigint => {
  const result = database.
    prepare(`INSERT into friend_requests (status, sender_id, receiver_id) VALUES(?, ?, ?)`)
    .run("pending", query.sender_id, query.receiver_id);
  return result.lastInsertRowid;
};

export const findPendingRequest = (query: ProcessFriendRequestSchema)  => {
  const existing = database
    .prepare(`SELECT status FROM friend_requests WHERE sender_id = ? AND receiver_id = ?`)
    .get(query.sender_id, query.receiver_id) as { status: RequestStatus } | null;
  return existing;

}

export const processRequest = (query: ProcessFriendRequestSchema): number => {
  const result  = database.
    prepare(`UPDATE friend_requests set status = ?, updated_at = ? where sender_id = ? and receiver_id = ?;`)
    .run(query.status ?? "pending", now(), query.sender_id, query.receiver_id);
  return result.changes;
};

export const createFriends = (query: ProcessFriendRequestSchema): number | bigint => {
  const result = database.
    prepare(`INSERT into friends (user1_id, user2_id) VALUES(?, ?)`)
    .run(query.sender_id, query.receiver_id);
  return result.lastInsertRowid;
};

export const findFriends = (query: FriendsSchema): number => {
  const result = database.
    prepare(`SELECT id from friends WHERE (user1_id = ? AND user2_id = ?) 
               OR (user1_id = ? AND user2_id = ?);`)
    .get(query.user1_id, query.user2_id, query.user2_id, query.user1_id) as FriendRow | null;
  return result?.id ?? 0;
}

export const deleteFriends = (query: FriendsSchema): number | bigint => {
  const result = database.
    prepare(`UPDATE friends set deleted = 1 WHERE (user1_id = ? AND user2_id = ?) 
               OR (user1_id = ? AND user2_id = ?);`)
    .run(query.user1_id, query.user2_id, query.user2_id, query.user1_id);
  return result.changes;
};