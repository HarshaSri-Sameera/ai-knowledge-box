# AI Knowledge Inbox

A minimal single-user RAG-powered knowledge base for saving notes and web pages, then asking questions over the saved content.

The application demonstrates an end-to-end Retrieval-Augmented Generation (RAG) pipeline:

**Ingest → Chunk → Embed → Store → Retrieve → Generate → Cite**

---

## Features

- Save plain-text notes
- Save URLs and fetch page content server-side
- Readability-based web content extraction
- Deterministic text chunking with overlap
- Local embedding generation using Ollama
- SQLite persistence using `sql.js`
- Cosine-similarity semantic retrieval
- Lightweight relevance filtering
- Local LLM answer generation using Ollama
- Source citations with similarity scores
- Input validation with Zod
- Structured JSON logging
- Centralized error handling
- Basic SSRF protections for server-side URL fetching
- Responsive React UI
- Single-user architecture with no authentication

---

## Architecture

```text
                         ┌─────────────────────┐
                         │     React UI        │
                         │  Vite + TypeScript  │
                         └──────────┬──────────┘
                                    │
                          REST API requests
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Express Backend    │
                         │    Controllers      │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
             Ingestion Service                Query Service
                    │                               │
          ┌─────────┴─────────┐            ┌────────┴─────────┐
          │                   │            │                  │
        Note                 URL        Embed question    Retrieve chunks
          │                   │            │                  │
          │             Fetch + Parse     │          Cosine similarity
          │                   │            │                  │
          └─────────┬─────────┘            └────────┬─────────┘
                    │                               │
                    ▼                               ▼
                 Chunking                        Top-K context
                    │                               │
                    ▼                               ▼
             Ollama Embeddings                 Ollama LLM
                    │                               │
                    └──────────────┬────────────────┘
                                   ▼
                              SQLite / sql.js
                                   │
                                   ▼
                         Answer + Source Citations
```

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Zod
- `sql.js`

### AI

- Ollama
- `nomic-embed-text` for embeddings
- `gemma3:1b` for answer generation

### Content Processing

- `jsdom`
- `@mozilla/readability`

---

## Project Structure

```text
ai-knowledge-inbox/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── ingest.controller.ts
│   │   │   ├── items.controller.ts
│   │   │   └── query.controller.ts
│   │   │
│   │   ├── db/
│   │   │   ├── database.ts
│   │   │   ├── schema.sql
│   │   │   └── test-persistence.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── item.repository.ts
│   │   │   ├── chunk.repository.ts
│   │   │   └── embedding.repository.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── ingest.routes.ts
│   │   │   ├── items.routes.ts
│   │   │   └── query.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── content-fetcher.service.ts
│   │   │   ├── chunking.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── ingestion.service.ts
│   │   │   ├── llm.service.ts
│   │   │   └── query.service.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   └── similarity.ts
│   │   │
│   │   ├── validation/
│   │   │   ├── ingest.validation.ts
│   │   │   └── query.validation.ts
│   │   │
│   │   └── index.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Answer.tsx
│   │   │   ├── IngestPanel.tsx
│   │   │   ├── ItemsList.tsx
│   │   │   ├── NoteForm.tsx
│   │   │   ├── QueryPanel.tsx
│   │   │   ├── QuestionInput.tsx
│   │   │   ├── Sources.tsx
│   │   │   └── UrlForm.tsx
│   │   │
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## How the RAG Pipeline Works

### 1. Ingestion

Users can submit either a plain-text note or a URL.

For notes:

```text
Note
 ↓
Validation
 ↓
Chunking
 ↓
Embedding
 ↓
SQLite
```

For URLs:

```text
URL
 ↓
Validation
 ↓
Server-side fetch
 ↓
Readability extraction
 ↓
Chunking
 ↓
Embedding
 ↓
SQLite
```

The application stores item metadata, original content, chunks, and embeddings.

### 2. Chunking

The current implementation uses deterministic character-based chunking with overlap.

Current configuration:

```text
Chunk size: 500 characters
Overlap:    100 characters
```

Sentence boundaries are preferred where practical.

### 3. Embeddings

Embeddings are generated locally using:

```text
nomic-embed-text
```

through Ollama.

The resulting vectors are stored in SQLite as JSON.

### 4. Retrieval

When a user asks a question:

```text
Question
   ↓
Question embedding
   ↓
Cosine similarity against stored embeddings
   ↓
Candidate chunks
   ↓
Relevance filtering
   ↓
Top relevant context
```

### 5. Answer Generation

The retrieved context is passed to:

```text
gemma3:1b
```

through Ollama.

The model is instructed to use only the supplied saved context and avoid unsupported claims.

The application displays the retrieved source snippets as citations.

---

## API

### `POST /ingest`

Creates a text item.

#### Request

```json
{
  "type": "text",
  "title": "RAG Notes",
  "content": "Retrieval-Augmented Generation combines..."
}
```

#### Response

```json
{
  "id": "uuid",
  "type": "text",
  "title": "RAG Notes",
  "sourceUrl": null,
  "chunksCreated": 1,
  "createdAt": "2026-09-19T00:00:00.000Z"
}
```

### `POST /ingest`

Creates a URL item.

#### Request

```json
{
  "type": "url",
  "title": "Example Article",
  "url": "https://example.com/article"
}
```

#### Response

```json
{
  "id": "uuid",
  "type": "url",
  "title": "Example Article",
  "sourceUrl": "https://example.com/article",
  "chunksCreated": 5,
  "createdAt": "2026-09-19T00:00:00.000Z"
}
```

### `GET /items`

Returns all saved items.

#### Response

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "text",
      "title": "RAG Notes",
      "sourceUrl": null,
      "createdAt": "2026-09-19T00:00:00.000Z"
    }
  ]
}
```

### `POST /query`

Queries the saved knowledge base.

#### Request

```json
{
  "question": "What is RAG?"
}
```

#### Response

```json
{
  "answer": "RAG combines document retrieval with language model generation.",
  "citations": [
    {
      "chunkId": "uuid",
      "itemId": "uuid",
      "itemTitle": "RAG Definition",
      "content": "RAG (Retrieval-Augmented Generation)...",
      "score": 0.70
    }
  ]
}
```

---

## Validation

Requests are validated using Zod.

| Field | Validation |
|---|---|
| `title` | 1–200 characters |
| `content` | 1–50,000 characters |
| `url` | Valid HTTP/HTTPS URL |
| `question` | 1–2,000 characters |
| `type` | `text` or `url` |

Invalid requests return a structured error response:

```json
{
  "error": {
    "message": "Question is required.",
    "code": "VALIDATION_ERROR"
  }
}
```

---

## URL Fetching Safety

Because URLs are fetched server-side, the content-fetching layer includes basic protections:

- HTTP/HTTPS protocols only
- localhost blocking
- loopback address blocking
- private/internal address blocking
- redirect limits
- request timeout
- response size limit
- HTML content-type validation

The goal is to prevent the ingestion endpoint from becoming an unrestricted server-side HTTP proxy.

---

## Database

SQLite is implemented using:

```text
sql.js
```

The database contains three tables:

```text
items
chunks
embeddings
```

### `items`

Stores the original knowledge item and metadata.

### `chunks`

Stores the chunked text associated with each item.

### `embeddings`

Stores serialized embedding vectors associated with chunks.

The local database is persisted to:

```text
backend/data/knowledge.db
```

---

## Transactions

Ingestion writes are performed transactionally.

The flow is:

```text
BEGIN
  ↓
Insert item
  ↓
Insert chunks
  ↓
Insert embeddings
  ↓
COMMIT
```

If an error occurs:

```text
ROLLBACK
```

This prevents partially written ingestion records.

---

## Local Development

### Prerequisites

- Node.js
- Ollama

Install the required Ollama models:

```bash
ollama pull nomic-embed-text
ollama pull gemma3:1b
```

Make sure Ollama is running locally.

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

The backend runs on:

```text
http://localhost:3000
```

For development:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Environment Variables

Create:

```text
backend/.env
```

Example:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=gemma3:1b
PORT=3000
DATABASE_PATH=./data/knowledge.db
```

Do not commit the real `.env` file.

A sanitized `.env.example` is included for configuration reference.

---

## Verification

### Backend build

```bash
cd backend
npm run build
```

### Backend

```bash
npm start
```

Expected:

```text
Server listening on port 3000
```

### Frontend build

```bash
cd frontend
npm run build
```

### Manual smoke test

1. Add a text note.
2. Add a URL.
3. Verify both appear in Saved Knowledge.
4. Ask a question relevant to a saved item.
5. Verify the answer and source citation.
6. Ask an unrelated question.
7. Verify the system reports that insufficient information is available and does not show misleading citations.
8. Restart the backend.
9. Verify saved items persist.

---

## Design Trade-offs

### Chunking

The application uses deterministic fixed-size chunks with overlap. This keeps the implementation predictable and simple. In a larger production system, token-aware or semantic chunking could improve retrieval quality.

### Vector Storage

Embeddings are stored as JSON arrays in SQLite and compared using cosine similarity in application code. This is appropriate for a small single-user dataset.

At larger scale, scanning every embedding for every query would become expensive. A production implementation could use a vector-capable database, approximate nearest-neighbor search, metadata filtering, caching, batch processing, and asynchronous ingestion.

### Local AI Models

The evaluation environment uses Ollama to keep inference local and avoid an external hosted inference dependency. The embedding and LLM layers are isolated behind service modules so the provider can be replaced without changing the rest of the application architecture.

---

## Code Quality

The backend separates responsibilities into:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Database
```

AI concerns are isolated into dedicated services for:

- embeddings
- answer generation
- retrieval

The application also uses:

- centralized error handling
- structured logging
- request validation
- explicit data types
- transaction boundaries

---

## Security Considerations

This project is intentionally a small single-user interview application.

It does not implement authentication or authorization.

The main security consideration is server-side URL fetching, where basic protections are applied to restrict internal or local network access.

For a production system, additional controls would be required, including stronger DNS/IP validation, authentication, authorization, rate limiting, audit logging, and more comprehensive SSRF protections.

---

## Future Improvements

Possible production enhancements include:

- authentication and authorization
- stronger hybrid retrieval
- retrieval reranking
- token-aware/semantic chunking
- vector database support
- background ingestion jobs
- streaming LLM responses
- richer metadata filtering
- automated retrieval evaluation
- observability and metrics
- deployment to a managed environment

---

## Assignment Scope

This implementation intentionally avoids unnecessary infrastructure and focuses on the core requirements:

- ingestion
- chunking
- embeddings
- semantic retrieval
- RAG generation
- citations
- API design
- validation
- error handling
- debuggability
- separation of concerns
