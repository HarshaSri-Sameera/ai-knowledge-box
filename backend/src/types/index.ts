// ── Domain types ──

export interface Item {
    id: string;
    type: "text" | "url";
    title: string;
    sourceUrl: string | null;
    rawContent: string;
    createdAt: string;
}

export interface Chunk {
    id: string;
    itemId: string;
    chunkIndex: number;
    content: string;
}

export interface Embedding {
    id: string;
    chunkId: string;
    vector: number[];
}

// ── Retrieval ──

export interface RetrievalResult {
    chunkId: string;
    itemId: string;
    content: string;
    score: number;
}

// ── API request / response ──

export interface IngestTextRequest {
    type: "text";
    title: string;
    content: string;
}

export interface IngestUrlRequest {
    type: "url";
    title: string;
    url: string;
}

export type IngestRequest = IngestTextRequest | IngestUrlRequest;

export interface IngestResponse {
    id: string;
    type: "text" | "url";
    title: string;
    sourceUrl: string | null;
    chunksCreated: number;
    createdAt: string;
}

export interface ItemSummary {
    id: string;
    type: "text" | "url";
    title: string;
    sourceUrl: string | null;
    createdAt: string;
}

export interface Citation {
    chunkId: string;
    itemId: string;
    itemTitle: string;
    content: string;
    score: number;
}

export interface QueryRequest {
    question: string;
}

export interface QueryResponse {
    answer: string;
    citations: Citation[];
}
