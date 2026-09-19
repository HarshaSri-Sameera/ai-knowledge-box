import { getDb } from "../db/database.js";
import type { Chunk } from "../types/index.js";

export function insertChunk(chunk: Chunk): void {
    const db = getDb();

    const statement = db.prepare(`
    INSERT INTO chunks (
      id,
      item_id,
      chunk_index,
      content
    )
    VALUES (?, ?, ?, ?)
  `);

    try {
        statement.run([
            chunk.id,
            chunk.itemId,
            chunk.chunkIndex,
            chunk.content,
        ]);
    } finally {
        statement.free();
    }
}

export function getChunksByItemId(itemId: string): Chunk[] {
    const db = getDb();

    const statement = db.prepare(`
    SELECT
      id,
      item_id,
      chunk_index,
      content
    FROM chunks
    WHERE item_id = ?
    ORDER BY chunk_index ASC
  `);

    const chunks: Chunk[] = [];

    try {
        statement.bind([itemId]);

        while (statement.step()) {
            const row = statement.getAsObject();

            chunks.push({
                id: String(row.id),
                itemId: String(row.item_id),
                chunkIndex: Number(row.chunk_index),
                content: String(row.content),
            });
        }
    } finally {
        statement.free();
    }

    return chunks;
}