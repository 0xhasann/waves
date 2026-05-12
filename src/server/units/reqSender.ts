import type { Request } from 'express';
import type { JwtUser } from '../../shared/types';
import { AppError } from './app.errors';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function getSenderId(req: Request): number {
  const sender_id = req.user?.userId;
  if (!sender_id) throw new AppError('Unauthorised Request');
  logger.debug(`sender_id :: ${sender_id}`);
  return sender_id;
}
