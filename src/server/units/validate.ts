import { scryptSync } from "crypto";

export const validate = (schema: any) => (req: any, res: any, next: any) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    if (!result.success) {
        return next(result.error);
    }

    Object.assign(req, result.data);
    next();
};

export const verifyPassword = (inputPassword: string, stored: string) => {
    const parts = stored.split(":");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error("Invalid stored password format");
    }
    const salt = parts[0];
    const storedHash = parts[1];
    const hash = scryptSync(inputPassword, salt, 64).toString("hex");

    return hash === storedHash;
};