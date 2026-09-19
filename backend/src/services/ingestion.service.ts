// orchestrate: fetch → chunk → embed → transactional DB write
import { randomUUID } from "node:crypto";
import type {
    IngestRequest,
    IngestResponse,
    Item,
    Chunk,
    Embedding,
} from "../types/index.js";
import { fetchUrlContent } from "./content-fetcher.service.js";
import { chunkText } from "./chunking.service.js";
import { generateEmbeddings } from "./embedding.service.js";
import { insertItem } from "../repositories/item.repository.js";
import { insertChunk } from "../repositories/chunk.repository.js";
import { insertEmbedding } from "../repositories/embedding.repository.js";
import { runTransaction } from "../db/database.js";
import { logger } from "../utils/logger.js";

export async function ingest(
    request: IngestRequest
): Promise<IngestResponse> {
    let title: string;
    let content: string;
    let sourceUrl: string | null = null;
    let type: "text" | "url";

    if (request.type === "text") {
        type = "text";
        title = request.title.trim();
        content = request.content.trim();
    } else {
        type = "url";

        const fetched = await fetchUrlContent(request.url);

        title = request.title.trim() || fetched.title;
        content = fetched.content;
        sourceUrl = fetched.sourceUrl;
    }

    const textChunks = chunkText(content);

    if (textChunks.length === 0) {
        throw new Error("No content was available to ingest.");
    }

    logger.info("Generating embeddings for ingestion", {
        type,
        chunkCount: textChunks.length,
    });

    const embeddings = await generateEmbeddings(
        textChunks.map((chunk) => chunk.content)
    );

    const itemId = randomUUID();
    const createdAt = new Date().toISOString();

    const item: Item = {
        id: itemId,
        type,
        title,
        sourceUrl,
        rawContent: content,
        createdAt,
    };

    const chunks: Chunk[] = textChunks.map((chunk) => ({
        id: randomUUID(),
        itemId,
        chunkIndex: chunk.index,
        content: chunk.content,
    }));

    const embeddingRows: Embedding[] = chunks.map((chunk, index) => ({
        id: randomUUID(),
        chunkId: chunk.id,
        vector: embeddings[index],
    }));

    runTransaction(() => {
        insertItem(item);

        for (const chunk of chunks) {
            insertChunk(chunk);
        }

        for (const embedding of embeddingRows) {
            insertEmbedding(embedding);
        }
    });

    logger.info("Ingestion completed", {
        itemId,
        type,
        chunkCount: chunks.length,
    });

    return {
        id: itemId,
        type,
        title,
        sourceUrl,
        chunksCreated: chunks.length,
        createdAt,
    };
}