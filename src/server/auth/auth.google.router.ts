import { Router } from 'express';

import { callbackRoute, getTokenFromCookie, googleSignup } from './auth.google';

export const router = Router();

// signup with google
router.get('/', googleSignup);
router.get('/callback', callbackRoute);
router.get('/me', getTokenFromCookie);

export default router;
