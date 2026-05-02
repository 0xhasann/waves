import { Router } from "express";

import { signinSchema, signupSchema } from "./auth.schema";
import { signin, signup } from "./auth.controller";
import { validate } from "../units/validate";

export const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/signin", validate(signinSchema), signin);


export default router;