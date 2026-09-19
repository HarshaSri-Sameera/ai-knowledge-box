import { mkdirSync, copyFileSync } from "node:fs";

mkdirSync("./dist/db", { recursive: true });
copyFileSync("./src/db/schema.sql", "./dist/db/schema.sql");

console.log("Copied schema.sql to dist/db");