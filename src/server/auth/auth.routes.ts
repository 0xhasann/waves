import { Router } from "express";

import { signinSchema, signupSchema } from "./auth.schema";
import { validate } from "../middlewares/validate";
import { signin, signup } from "./auth.controller";

export const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/signin", validate(signinSchema), signin);


export default router;