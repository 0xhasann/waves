import { Router } from 'express';

import { signinSchema, signupSchema, userProfile } from '../schemas/auth.schema';
import { fetchUserProfile, signin, signup } from '../auth/auth.service';
import { validate } from '../units/validate';

export const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.get('/signin', validate(signinSchema), signin);
router.get('/userProfile', validate(userProfile), fetchUserProfile);

export default router;
