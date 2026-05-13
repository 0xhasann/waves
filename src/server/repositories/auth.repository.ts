import { scryptSync, randomBytes } from 'crypto';

import { database } from '../../db/utils';
import type { SignupInput } from '../schemas/auth.schema';
import type { AuthUser } from '../../shared/types';

export const findByUsername = (username: string): AuthUser | undefined => {
  return database.prepare(`SELECT id, user_pass FROM users WHERE username = ?`).get(username) as AuthUser | undefined;
};

export const createUser = (data: SignupInput) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(data.password, salt, 64).toString('hex');

  const encryptedPassword = `${salt}:${hash}`;

  const result = database
    .prepare(
      `
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
  `,
    )
    .run(
      data.email,
      encryptedPassword,
      data.username,
      data.firstName ?? null,
      data.lastName ?? null,
      data.avatarURL ?? null,
      data.mobileNo ?? null,
    );

  return result.lastInsertRowid;
};
