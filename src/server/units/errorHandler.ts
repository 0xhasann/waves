import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../units/app.errors';
import { parseSqliteError } from '../units/parseSqliteError';
import { SQLiteError } from 'bun:sqlite';
import { logger } from './logger';

import * as z from 'zod';

// DO NOT REMOVE next
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = 'Internal Server Error';
  let error: string = '';

  if (err instanceof ZodError) {
    status = 400;
    message = 'Validation error';
    error = z.treeifyError(err).errors.join('\n');
  } else if (err instanceof AppError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof SQLiteError) {
    message = parseSqliteError(err.message);
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  if (status >= 500) {
    logger.error({
      path: req.path,
      method: req.method,
      body: req.body as unknown,
      error: err,
    });
  }

  return res.status(status).json({
    success: false,
    message,
    error,
  });
};
