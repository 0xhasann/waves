import { signupController } from "./auth.controller"

export const authRoutes = (req: Request): Promise<Response> | null => {
    console.log(req);
    const url = new URL(req.url)

    if (url.pathname === "/api/auth/signup" && req.method === "POST") {
        return signupController(req)
    }

    return null;
}