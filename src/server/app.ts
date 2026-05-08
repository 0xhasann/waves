import "express-async-errors";
import express from "express";
import authRoutes from "./auth/auth.routes";
import connection from "./connections/conn.routes";
import googleAuthRouter from "./auth/auth.google.router"
import conversation from "./conversations/chat.routes";
import path from "node:path";
import { notFound } from "./units/notFound";
import { errorHandler } from "./units/errorHandler";
import cookieParser from "cookie-parser";
import { authenticate } from "./auth/auth.google";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(authenticate);
app.use(express.static(path.join(process.cwd(), "public")));
// log incoming and outgoing body
app.use((req, res, next) => {
    console.log("request:: ", req.body);
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        console.log("response:: ", body);
        return originalJson(body);
    };
    next();
});
app.use("/api/auth", authRoutes);
app.use("/api/friends", connection);
app.use("/api/conversations", conversation);

app.use("/auth/google", googleAuthRouter);

// fallback
app.use(notFound);
app.use(errorHandler);
