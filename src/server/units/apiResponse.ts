import type { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    data: T | null,
    message?: string
): Response => {
    const response: ApiResponse<T> = {
        success: statusCode >= 200 && statusCode < 300,
        data: data === null ? undefined : data,
        message,
    };
    return res.status(statusCode).json(response);
};