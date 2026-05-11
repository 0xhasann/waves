import type { Request } from 'express';
import { AppError } from './app.errors';

export const notFound = (req: Request) => {
  throw new AppError(`Route not found: ${req.originalUrl}`, 404);
};
