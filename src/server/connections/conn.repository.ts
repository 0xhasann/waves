import { database } from "../../db/utils";

export const searchUser = (query: string): string[] | undefined => {
  console.log(query);
  const q = query.trim();
  return database
    .prepare(`SELECT username FROM users WHERE email_id = ? OR mobile_no = ? OR username LIKE ? OR first_name LIKE ? OR last_name LIKE ?;`)
    .all(q, q, `%${q}%`, `%${q}%`, `%${q}%`) as string[] | undefined;
};

