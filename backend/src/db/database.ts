import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: SqlJsDatabase;
const dbPath = process.env.DATABASE_PATH || "./data/knowledge.db";

/**
 * Initialize the SQLite database via sql.js (WASM).
 * - Loads an existing file from DATABASE_PATH if present.
 * - Otherwise creates a new in-memory database and persists it.
 * - Runs schema.sql to ensure all tables exist.
 */
export async function initDatabase(): Promise<void> {
    const SQL = await initSqlJs();

    mkdirSync(dirname(dbPath), { recursive: true });

    if (existsSync(dbPath)) {
        const fileBuffer = readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
        logger.info("Loaded existing database", { path: dbPath });
    } else {
        db = new SQL.Database();
        logger.info("Created new database", { path: dbPath });
    }

    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON;");

    // Run schema (CREATE TABLE IF NOT EXISTS — safe to re-run)
    const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
    db.exec(schema);

    persist();
    logger.info("Database initialized and schema applied");
}

/**
 * Export the in-memory database to disk at DATABASE_PATH.
 * Called after every successful write transaction.
 */
export function persist(): void {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
}

/**
 * Get the active database instance.
 * Throws if initDatabase() has not been called.
 */
export function getDb(): SqlJsDatabase {
    if (!db) {
        throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return db;
}

/**
 * Run a function inside a SQLite transaction.
 * - BEGIN before the callback
 * - COMMIT + persist on success
 * - ROLLBACK on any error (no partial data written to disk)
 */
export function runTransaction(fn: () => void): void {
    const database = getDb();
    database.run("BEGIN TRANSACTION");
    try {
        fn();
        database.run("COMMIT");
        persist();
    } catch (error) {
        database.run("ROLLBACK");
        throw error;
    }
}
