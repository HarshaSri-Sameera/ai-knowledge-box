import { Router } from "express";
import { getItemsController } from "../controllers/items.controller.js";

const router = Router();
router.get("/items", getItemsController);

export default router;
