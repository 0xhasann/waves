export class AppError extends Error {
    status: number;
    isOperational: boolean;

    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}