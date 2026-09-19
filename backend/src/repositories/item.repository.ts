import { getDb } from "../db/database.js";
import type { Item, ItemSummary } from "../types/index.js";

export function insertItem(item: Item): void {
    const db = getDb();

    const statement = db.prepare(`
    INSERT INTO items (
      id,
      type,
      title,
      source_url,
      raw_content,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    try {
        statement.run([
            item.id,
            item.type,
            item.title,
            item.sourceUrl,
            item.rawContent,
            item.createdAt,
        ]);
    } finally {
        statement.free();
    }
}

export function getAllItems(): ItemSummary[] {
    const db = getDb();

    const statement = db.prepare(`
    SELECT
      id,
      type,
      title,
      source_url,
      created_at
    FROM items
    ORDER BY created_at DESC
  `);

    const items: ItemSummary[] = [];

    try {
        while (statement.step()) {
            const row = statement.getAsObject();

            items.push({
                id: String(row.id),
                type: row.type as "text" | "url",
                title: String(row.title),
                sourceUrl:
                    row.source_url === null || row.source_url === undefined
                        ? null
                        : String(row.source_url),
                createdAt: String(row.created_at),
            });
        }
    } finally {
        statement.free();
    }

    return items;
}

export function getItemById(id: string): Item | null {
    const db = getDb();

    const statement = db.prepare(`
    SELECT
      id,
      type,
      title,
      source_url,
      raw_content,
      created_at
    FROM items
    WHERE id = ?
    LIMIT 1
  `);

    try {
        statement.bind([id]);

        if (!statement.step()) {
            return null;
        }

        const row = statement.getAsObject();

        return {
            id: String(row.id),
            type: row.type as "text" | "url",
            title: String(row.title),
            sourceUrl:
                row.source_url === null || row.source_url === undefined
                    ? null
                    : String(row.source_url),
            rawContent: String(row.raw_content),
            createdAt: String(row.created_at),
        };
    } finally {
        statement.free();
    }
}