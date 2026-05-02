// app.ts
import "express-async-errors";
import express from "express";
import authRoutes from "./auth/auth.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import path from "node:path";


export const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/api/auth", authRoutes);

// static files like html and index.js
app.use(express.static(path.join(process.cwd(), "public")));



// fallback
app.use(notFound);
app.use(errorHandler);
