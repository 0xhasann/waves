import { Router } from "express";

import { callbackRoute, googleSignup } from "./auth.google";

export const router = Router();


// signup with google
router.get("/", googleSignup);
router.get("/callback", callbackRoute);

export default router;
