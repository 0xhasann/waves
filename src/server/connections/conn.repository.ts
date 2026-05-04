import { database } from "../../db/utils";

export const searchUser = (query: string): string[] | undefined => {
  console.log(query);
  const q = query.trim();
  return database
    .prepare(`SELECT id, username  FROM users WHERE email_id = ? OR mobile_no = ? OR username = ? OR first_name = ? OR last_name = ?;`)
    .all(q, q, q ,q, q) as string[] | undefined;
};

