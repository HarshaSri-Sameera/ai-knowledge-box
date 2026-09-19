import type { Request, Response, NextFunction } from "express";
import { query } from "../services/query.service.js";
import { queryRequestSchema } from "../validation/query.validation.js";
import { AppError } from "../utils/errors.js";

export async function queryController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const parsed = queryRequestSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError(
                400,
                parsed.error.issues[0]?.message ??
                "Invalid request.",
                "VALIDATION_ERROR"
            );
        }

        const result = await query(parsed.data.question);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}