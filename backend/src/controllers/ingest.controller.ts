import type { Request, Response, NextFunction } from "express";
import {
    ingestRequestSchema,
} from "../validation/ingest.validation.js";
import { ingest } from "../services/ingestion.service.js";
import { AppError } from "../utils/errors.js";

export async function ingestController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const parsed = ingestRequestSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError(
                400,
                parsed.error.issues[0]?.message ?? "Invalid request.",
                "VALIDATION_ERROR"
            );
        }

        const result = await ingest(parsed.data);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}