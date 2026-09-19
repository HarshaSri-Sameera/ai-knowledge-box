const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 100;

export interface TextChunk {
    index: number;
    content: string;
}

function normalizeText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

export function chunkText(
    text: string,
    chunkSize = DEFAULT_CHUNK_SIZE,
    overlap = DEFAULT_OVERLAP
): TextChunk[] {
    if (chunkSize <= 0) {
        throw new Error("chunkSize must be greater than 0");
    }

    if (overlap < 0 || overlap >= chunkSize) {
        throw new Error("overlap must be >= 0 and smaller than chunkSize");
    }

    const normalized = normalizeText(text);

    if (!normalized) {
        return [];
    }

    const chunks: TextChunk[] = [];
    let start = 0;

    while (start < normalized.length) {
        let end = Math.min(start + chunkSize, normalized.length);

        // Prefer a sentence boundary when there is enough room.
        if (end < normalized.length) {
            const sentenceBoundary = normalized.lastIndexOf(". ", end);

            if (sentenceBoundary > start + chunkSize * 0.5) {
                end = sentenceBoundary + 1;
            }
        }

        const content = normalized.slice(start, end).trim();

        if (content) {
            chunks.push({
                index: chunks.length,
                content,
            });
        }

        if (end >= normalized.length) {
            break;
        }

        start = Math.max(end - overlap, start + 1);
    }

    return chunks;
}