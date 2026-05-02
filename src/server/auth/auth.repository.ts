import { scryptSync, randomBytes } from "crypto";

import { database } from "../../db/utils";
import type { DB } from "../../db/utils";
import type {  User } from "../../shared/types";
import type { SignupInput } from "./auth.schema";

export const findByUsername = (username: string): User | undefined => {
    return database
        .prepare(`SELECT * FROM users WHERE username = ?`)
        .get(username) as User | undefined;
};


export const createUser = (db: DB, data: SignupInput) => {

    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(data.password, salt, 64).toString("hex");

    const encryptedPassword = `${salt}:${hash}`;

    const result = db.prepare(`
    INSERT INTO users (
      email_id,
      user_pass,
      username,
      first_name,
      last_name,
      avatar_url,
      mobile_no
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
        data.email ?? null,
        encryptedPassword,
        data.username,
        data.firstName ?? null,
        data.lastName ?? null,
        data.avatarURL ?? null,
        data.mobileNo ?? null
    );

    return result.lastInsertRowid;

};