import { Router } from "express";
import { search } from "./conn.controller";
import { validate } from "../units/validate";
import { searchSchema } from "./conn.schema";

export const router = Router();

router.get("/search", validate(searchSchema), search);

export default router;