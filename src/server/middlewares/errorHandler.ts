import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../units/app.errors";
import { parseSqliteError } from "../units/parseSqliteError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    console.error("ERROR:", {
        path: req.path,
        method: req.method,
        body: req.body,
        error: err,
    });
    
    let status = 500;
    let message = "Internal Server Error";
    let errors: any = null;

    if (err instanceof ZodError) {
        status = 400;
        message = "Validation error";
        errors = err.issues;
    }

    else if (err instanceof AppError) {
        status = err.status;
        message = err.message;
    }

    else if (err?.code === "SQLITE_CONSTRAINT") {
        status = 400;
        message = parseSqliteError(err.message);
    }

    // fallback
    else {
        message = err.message || message;
    }

    return res.status(status).json({
        success: false,
        message,
        errors,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};