import { Router } from "express";
import { ingestController } from "../controllers/ingest.controller.js";

const router = Router();
router.post("/ingest", ingestController);

export default router;
