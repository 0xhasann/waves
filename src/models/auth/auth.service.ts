import { randomUUID } from "crypto";
import { scryptSync, randomBytes } from "crypto";
import type { DB } from "../../db/utils";

export const signupService = async (
    database: DB,
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    avatarURL: string,
    mobileNo: string
) => {
    const userId = randomUUID();

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = scryptSync(password, salt, 64).toString("hex");

    // check for the valid password like
    // const match = await bcrypt.compare(password, storedHash);

    const query = `
    INSERT INTO users (
      user_id,
      user_name,
      email_id,
      password,
      first_name,
      last_name,
      mobile_no,
      avatar_url,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

    await database.run(query, [
        userId,
        username,
        email,
        hashedPassword,
        firstName,
        lastName,
        mobileNo,
        avatarURL
    ]);

    return { userId };
};