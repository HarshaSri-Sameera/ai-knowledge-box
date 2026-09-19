import { Router } from "express";
import { queryController } from "../controllers/query.controller.js";

const router = Router();
router.post("/query", queryController);

export default router;
