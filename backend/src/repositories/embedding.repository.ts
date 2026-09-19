import { getDb } from "../db/database.js";
import type { Embedding } from "../types/index.js";

export interface EmbeddingWithChunk {
    embeddingId: string;
    chunkId: string;
    itemId: string;
    itemTitle: string;
    content: string;
    vector: number[];
}

export function insertEmbedding(embedding: Embedding): void {
    const db = getDb();

    const statement = db.prepare(`
    INSERT INTO embeddings (
      id,
      chunk_id,
      vector
    )
    VALUES (?, ?, ?)
  `);

    try {
        statement.run([
            embedding.id,
            embedding.chunkId,
            JSON.stringify(embedding.vector),
        ]);
    } finally {
        statement.free();
    }
}

export function getAllEmbeddingsWithChunks(): EmbeddingWithChunk[] {
    const db = getDb();

    const statement = db.prepare(`
    SELECT
      e.id AS embedding_id,
      e.chunk_id,
      c.item_id,
      i.title AS item_title,
      c.content,
      e.vector
    FROM embeddings e
    INNER JOIN chunks c
      ON e.chunk_id = c.id
    INNER JOIN items i
      ON c.item_id = i.id
  `);

    const results: EmbeddingWithChunk[] = [];

    try {
        while (statement.step()) {
            const row = statement.getAsObject();

            results.push({
                embeddingId: String(row.embedding_id),
                chunkId: String(row.chunk_id),
                itemId: String(row.item_id),
                itemTitle: String(row.item_title),
                content: String(row.content),
                vector: JSON.parse(String(row.vector)) as number[],
            });
        }
    } finally {
        statement.free();
    }

    return results;
}