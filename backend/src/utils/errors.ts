import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(statusCode: number, message: string, code = "INTERNAL_ERROR", isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        logger.warn("Operational error", {
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
        });
        res.status(err.statusCode).json({
            error: { message: err.message, code: err.code },
        });
        return;
    }

    logger.error("Unexpected error", {
        message: err.message,
        stack: err.stack,
    });
    res.status(500).json({
        error: { message: "Internal server error", code: "INTERNAL_ERROR" },
    });
}
