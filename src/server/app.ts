import "express-async-errors";
import express from "express";
import authRoutes from "./auth/auth.routes";
import connection from "./connections/conn.routes";
import conversation from "./conversations/chat.routes";
import path from "node:path";
import { notFound } from "./units/notFound";
import { errorHandler } from "./units/errorHandler";


export const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use((req, res,next) => {
    console.log(req.body);
    next();

} )
app.use("/api/auth", authRoutes);
app.use("/api/friends", connection);
app.use("/api/conversations", conversation);


// static files like html and index.js
app.use(express.static(path.join(process.cwd(), "public")));



// fallback
app.use(notFound);
app.use(errorHandler);
