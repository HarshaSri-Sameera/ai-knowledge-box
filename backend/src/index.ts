import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDatabase } from "./db/database.js";
import routes from "./routes/index.js";
import { errorHandler } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Routes
app.use(routes);

// Error handler (must be last)
app.use(errorHandler);

async function start(): Promise<void> {
    await initDatabase();
    app.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
    });
}

start().catch((err) => {
    logger.error("Failed to start server", { error: String(err) });
    process.exit(1);
});

export default app;
