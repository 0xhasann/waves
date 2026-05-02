import type { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({
        message: `Route not found: ${req.originalUrl}`,
    });
};