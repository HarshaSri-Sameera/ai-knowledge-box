/**
 * Smoke test: verify database initializes, writes persist across restarts.
 *
 * Run with: npx tsx src/db/test-persistence.ts
 */
import "dotenv/config";
import { initDatabase, getDb, persist, runTransaction } from "./database.js";
import { existsSync, unlinkSync } from "node:fs";

const TEST_DB = process.env.DATABASE_PATH || "./data/knowledge.db";

async function main() {
    // Clean slate
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);

    // ── Run 1: create DB, insert a row ──
    console.log("=== Run 1: Init + Insert ===");
    await initDatabase();
    const db = getDb();

    runTransaction(() => {
        db.run(
            "INSERT INTO items (id, type, title, raw_content) VALUES (?, ?, ?, ?)",
            ["test-1", "text", "Test Note", "Hello world"]
        );
    });

    const result = db.exec("SELECT id, title FROM items");
    console.log("After insert:", JSON.stringify(result));

    // ── Run 2: simulate restart — re-init from disk ──
    console.log("\n=== Run 2: Restart — reload from disk ===");
    await initDatabase(); // re-reads file from disk
    const db2 = getDb();

    const result2 = db2.exec("SELECT id, title FROM items");
    console.log("After restart:", JSON.stringify(result2));

    const rowCount = result2[0]?.values?.length ?? 0;
    if (rowCount === 1 && result2[0].values[0][1] === "Test Note") {
        console.log("\n✅ PASS — data persisted across restart");
    } else {
        console.error("\n❌ FAIL — data did NOT persist");
        process.exit(1);
    }

    // ── Run 3: test rollback ──
    console.log("\n=== Run 3: Transaction rollback ===");
    try {
        runTransaction(() => {
            db2.run(
                "INSERT INTO items (id, type, title, raw_content) VALUES (?, ?, ?, ?)",
                ["test-2", "text", "Should Not Exist", "rollback test"]
            );
            throw new Error("Intentional failure");
        });
    } catch {
        // expected
    }

    const result3 = db2.exec("SELECT COUNT(*) as cnt FROM items");
    const count = result3[0].values[0][0] as number;
    if (count === 1) {
        console.log("✅ PASS — rollback prevented partial write");
    } else {
        console.error(`❌ FAIL — expected 1 row, got ${count}`);
        process.exit(1);
    }

    // Cleanup
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
    console.log("\n🎉 All database tests passed.");
}

main().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
