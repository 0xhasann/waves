import "express-async-errors";
import express from "express";
import authRoutes from "./auth/auth.routes";
import path from "node:path";
import { notFound } from "./units/notFound";
import { errorHandler } from "./units/errorHandler";


export const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));
app.use("/api/auth", authRoutes);

// static files like html and index.js
app.use(express.static(path.join(process.cwd(), "public")));



// fallback
app.use(notFound);
app.use(errorHandler);
