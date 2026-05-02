// utils/parseSqliteError.ts
export const parseSqliteError = (msg: string) => {
    if (msg.includes("users.username")) {
        return "Username already exists";
    }

    if (msg.includes("users.email_id")) {
        return "Email already exists";
    }

    if (msg.includes("users.mobile_no")) {
        return "Mobile number already exists";
    }

    return "Database constraint error";
};