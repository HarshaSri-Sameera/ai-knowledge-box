// Typed API client — all fetch calls live here, never in components.

const BASE = '';  // Vite dev proxy forwards /ingest, /items, /query to :3000

// ── Types (mirror backend) ──

export interface ItemSummary {
    id: string;
    type: 'text' | 'url';
    title: string;
    sourceUrl: string | null;
    createdAt: string;
}

export interface IngestResponse {
    id: string;
    type: 'text' | 'url';
    title: string;
    sourceUrl: string | null;
    chunksCreated: number;
    createdAt: string;
}

export interface Citation {
    chunkId: string;
    itemId: string;
    itemTitle: string;
    content: string;
    score: number;
}

export interface QueryResponse {
    answer: string;
    citations: Citation[];
}

export interface ApiError {
    message: string;
    code?: string;
}

// ── Helpers ──

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json() as { error?: ApiError };
            if (body.error?.message) message = body.error.message;
        } catch { /* ignore parse errors */ }
        throw new Error(message);
    }
    return res.json() as Promise<T>;
}

// ── API functions ──

export async function getItems(): Promise<ItemSummary[]> {
    const res = await fetch(`${BASE}/items`);
    const data = await handleResponse<{ items: ItemSummary[] }>(res);
    return data.items;
}

export async function ingestNote(payload: {
    title: string;
    content: string;
}): Promise<IngestResponse> {
    const res = await fetch(`${BASE}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', ...payload }),
    });
    return handleResponse<IngestResponse>(res);
}

export async function ingestUrl(payload: {
    title: string;
    url: string;
}): Promise<IngestResponse> {
    const res = await fetch(`${BASE}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'url', ...payload }),
    });
    return handleResponse<IngestResponse>(res);
}

export async function askQuestion(question: string): Promise<QueryResponse> {
    const res = await fetch(`${BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
    });
    return handleResponse<QueryResponse>(res);
}
