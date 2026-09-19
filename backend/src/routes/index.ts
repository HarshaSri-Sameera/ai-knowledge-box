import { Router } from "express";
import ingestRoutes from "./ingest.routes.js";
import itemsRoutes from "./items.routes.js";
import queryRoutes from "./query.routes.js";

const router = Router();

router.use(ingestRoutes);
router.use(itemsRoutes);
router.use(queryRoutes);

export default router;
