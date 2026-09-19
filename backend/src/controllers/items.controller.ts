import type { Request, Response, NextFunction } from "express";
import { getAllItems } from "../repositories/item.repository.js";

export function getItemsController(
    _req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const items = getAllItems();

        res.status(200).json({
            items,
        });
    } catch (error) {
        next(error);
    }
}