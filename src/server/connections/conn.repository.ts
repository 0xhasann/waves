import { database } from "../../db/utils";
import { now } from "../units/timeUtils";
import type { FriendRequestSchema } from "./conn.schema";
// import type { sendFriendRequest, sendFriendRequest } from "./conn.schema";


export const searchUser = (query: string): string[] | undefined => {
  console.log(query);
  const q = query.trim();
  return database
    .prepare(`SELECT id, username  FROM users WHERE email_id = ? OR mobile_no = ? OR username = ? OR first_name = ? OR last_name = ?;`)
    .all(q, q, q, q, q) as string[] | undefined;
};

export const sendFriendRequest = (query: FriendRequestSchema): number | bigint => {
  const result = database.
    prepare(`INSERT into friend_requests (status, sender_id, receiver_id) VALUES(?, ?, ?)`)
    .run("pending", query.sender_id, query.receiver_id);
  return result.lastInsertRowid;
};

export const acceptFriendRequest = (query: FriendRequestSchema): number => {
  const result  = database.
    prepare(`UPDATE friend_requests set status = ?, updated_at = ? where sender_id = ? and receiver_id = ?;`)
    .run(query.status, now(), query.sender_id, query.receiver_id);
  return result.changes;
};