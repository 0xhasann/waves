import type { Request, Response } from 'express';
import { sendResponse } from '../../shared/apiResponse';
import { tokenCookie } from './auth.google';
import * as repo from '../repositories/auth.repository';
import { AppError } from '../units/app.errors';
import { verifyPassword } from '../units/validate';
import type { SigninInput, SignupInput } from '../schemas/auth.schema';

export const signup = (req: Request, res: Response) => {
  const user = repo.findByUsername((req.body as SignupInput).username);
  if (user) throw new AppError('User Already Exists', 403);

  const userId = repo.createUser(req.body as SignupInput);
  tokenCookie(userId as number, req, res);
  sendResponse(res, 201, userId, 'User Created Successfully');
};

export const signin = (req: Request, res: Response) => {
  const user = repo.findByUsername((req.query as SigninInput).username);
  if (!user) throw new AppError('Invalid Credentials', 401);

  const isValid = verifyPassword((req.query as SigninInput).password, user.user_pass);
  if (!isValid) throw new AppError('Invalid Credentials', 401);

  tokenCookie(user.id, req, res);
  sendResponse(res, 200, user.id, 'Welcome to Waves');
};

export const fetchUserProfile = (req: Request, res: Response) => {
  const result = repo.fetchUserProfile(req.query.userId as string);
  sendResponse(res, 200, result, 'User Profile Fetched Successfully');
};
