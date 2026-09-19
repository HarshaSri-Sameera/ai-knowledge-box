import { AppError } from "../utils/errors.js";

const OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const EMBEDDING_MODEL =
    process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

interface OllamaEmbedResponse {
    embeddings?: number[][];
}

export async function generateEmbeddings(
    texts: string[]
): Promise<number[][]> {
    if (texts.length === 0) {
        return [];
    }

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: texts,
            }),
        });

        if (!response.ok) {
            const message = await response.text();

            throw new Error(
                `Ollama embedding request failed (${response.status}): ${message}`
            );
        }

        const data = (await response.json()) as OllamaEmbedResponse;

        if (
            !data.embeddings ||
            data.embeddings.length !== texts.length
        ) {
            throw new Error(
                `Expected ${texts.length} embeddings, received ${data.embeddings?.length ?? 0}`
            );
        }

        return data.embeddings;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            502,
            "Failed to generate local embeddings. Make sure Ollama is running.",
            "EMBEDDING_FAILED"
        );
    }
}