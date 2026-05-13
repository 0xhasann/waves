import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { database } from '../../db/utils';
import type { JwtUser, User, UserMeta } from '../../shared/types';
import { now } from '../../shared/timeUtils';
import { sendResponse } from '../../shared/apiResponse';
import { AppError } from '../units/app.errors';
import { logger } from '../units/logger';
import { appEnv } from '../../shared/config/env';

const db = database;

const client = new OAuth2Client(appEnv.GOOGLE_CLIENT_ID);

export const googleSignup = (_req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');

  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
  });

  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: appEnv.GOOGLE_CLIENT_ID,
      redirect_uri: appEnv.APP_BASE_URL + '/auth/google/callback',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: appEnv.ACCESS_TYPE,
      prompt: 'consent',
      state,
    }).toString();

  res.redirect(url.toString());
};

export const callbackRoute = async (req: Request, res: Response) => {
  if (!req.cookies?.oauth_state || req.query.state !== req.cookies.oauth_state)
    throw new AppError('Invalid State', 403);

  res.clearCookie('oauth_state');

  try {
    const code = req.query.code as string;
    if (!code) throw new AppError('Missing code', 400);

    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code: String(code),
        client_id: appEnv.GOOGLE_CLIENT_ID,
        client_secret: appEnv.GOOGLE_CLIENT_SECRET,
        redirect_uri: '/auth/google/callback',
        grant_type: 'authorization_code',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const { id_token } = tokenRes.data as { id_token: string };

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: appEnv.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) throw new AppError('Invalid token', 400);

    const { sub, email, name, picture, email_verified } = payload;

    if (!email_verified) throw new AppError('Email not verified', 400);

    const [first_name, ...rest] = (name || '').split(' ');
    const last_name = rest.join(' ');

    const username = email?.split('@')[0] + '_' + Date.now() || `google_${sub}`;

    let user = db.prepare(`SELECT * FROM users WHERE google_id = ? OR email_id = ?;`).get(sub, email ?? null) as
      | User
      | undefined;

    if (!user) {
      db.prepare(
        `INSERT INTO users 
    (username, email_id, google_id, provider, avatar_url, first_name, last_name, user_pass)
    VALUES (?, ?, ?, 'google', ?, ?, ?, ?);`,
      ).run(username, email ?? null, sub, picture ?? null, first_name ?? null, last_name ?? null, null);

      user = db.prepare(`SELECT * FROM users WHERE google_id = ?;`).get(sub) as User | undefined;
    } else if (!user.google_id) {
      db.prepare(`UPDATE users SET google_id = ?, provider = 'google', updated_at WHERE id = ?;`).run(
        sub,
        user.id,
        now(),
      );

      user = db.prepare(`SELECT * FROM users WHERE id = ?;`).get(user.id) as User;
    }

    if (!user) throw new AppError('User creation failed');

    tokenCookie(user.id, req, res);
    res.redirect('/conversation.html');
  } catch (err) {
    const error = err as AxiosError;
    logger.error(error);

    console.log('GOOGLE RESPONSE DATA:', error?.response?.data);
    console.log('GOOGLE STATUS:', error?.response?.status);
  }
};
export const tokenCookie = (id: number, req: Request, res: Response) => {
  const token = jwt.sign({ userId: id }, appEnv.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const getTokenFromCookie = (req: Request, res: Response) => {
  const token = req.cookies.auth_token as string;
  if (!token) throw new AppError('Unauthorized', 401);
  try {
    const decoded = jwt.verify(token, appEnv.JWT_SECRET) as JwtUser;
    const user = db
      .prepare(
        `SELECT id, username, TRIM(CONCAT(first_name, ' ', COALESCE(last_name, ''))) AS full_name FROM users WHERE id = ?`,
      )
      .get(decoded.userId) as UserMeta | undefined;
    if (!user) throw new AppError('User not found', 404);

    sendResponse(res, 200, user, 'User Meta');
  } catch (err) {
    const error = err as AxiosError;
    logger.error(error);

    console.log('GOOGLE RESPONSE DATA:', error?.response?.data);
    console.log('GOOGLE STATUS:', error?.response?.status);
    throw new AppError('Invalid Token', 403);
  }
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token as string;

  if (!token) throw new AppError('Not authenticated', 403);

  try {
    const decoded = jwt.verify(token, appEnv.JWT_SECRET) as JwtUser;
    req.user = decoded;
    next();
  } catch (err) {
    const error = err as AxiosError;
    logger.error(error);

    console.log('GOOGLE RESPONSE DATA:', error?.response?.data);
    console.log('GOOGLE STATUS:', error?.response?.status);

    res.clearCookie('auth_token');
    if (err instanceof jwt.TokenExpiredError) throw new AppError('Session expired, please sign in again', 401);
    if (err instanceof jwt.JsonWebTokenError) throw new AppError('Invalid Token', 403);
    logger.error(err);
    throw new AppError('Authentication failed');
  }
};
