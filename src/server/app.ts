import 'express-async-errors';
import express from 'express';
import authRoutes from './routes/auth.routes';
import connection from './routes/conn.routes';
import googleAuthRouter from './routes/auth.google.router';
import conversation from './routes/chat.routes';
import path from 'node:path';
import { notFound } from './units/notFound';
import { errorHandler } from './units/errorHandler';
import cookieParser from 'cookie-parser';
import { authenticate } from './auth/auth.google';
import { logger } from './units/logger';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

// logger
app.use((req, res, next) => {
  const start = Date.now();

  logger.debug(`[${req.method}] ${req.originalUrl} | body=${JSON.stringify(req.body)}`);
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const time = Date.now() - start;

    logger.debug(
      `[${req.method}] ${req.originalUrl} | status=${res.statusCode} | ${time}ms | response=${JSON.stringify(body)}`,
    );
    return originalJson(body);
  };

  next();
});

//Public routes
app.use('/api/auth', authRoutes);
app.use('/auth/google', googleAuthRouter);

// Protected routes
app.use('/api/friends', authenticate, connection);
app.use('/api/conversations', authenticate, conversation);

// fallback
app.use(notFound);
app.use(errorHandler);
