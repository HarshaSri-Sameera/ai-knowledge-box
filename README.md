# AI Knowledge Inbox

A minimal single-user RAG application that allows users to save notes or URLs
and ask questions over their saved knowledge.

## Features

- Save plain text notes
- Ingest web pages from URLs
- Server-side URL fetching with basic SSRF protections
- Readability-based content extraction
- Deterministic text chunking with overlap
- Local embedding generation using Ollama
- SQLite persistence using sql.js
- Cosine-similarity retrieval
- Local LLM answer generation using Ollama
- Source citations and similarity scores
- Input validation and structured logging
- Responsive React interface

## Architecture

React
↓
Express API
↓
Ingestion / Query Services
↓
SQLite + Embeddings
↓
Ollama

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
- SQLite via sql.js

### AI
- Ollama
- nomic-embed-text
- gemma3:1b

## API

### POST /ingest

Accepts either:

```json
{
  "type": "text",
  "title": "RAG Notes",
  "content": "..."
}

or:

{
  "type": "url",
  "title": "Example Article",
  "url": "https://example.com"
}
GET /items

Returns saved knowledge items.

POST /query
{
  "question": "What is RAG?"
}

Returns an answer and retrieved source citations.

Local Setup
Prerequisites
Node.js
Ollama

Install the required Ollama models:

ollama pull nomic-embed-text
ollama pull gemma3:1b

Make sure Ollama is running locally.

Backend
cd backend
npm install
npm run build
npm start
Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Open:

http://localhost:5173
Design Trade-offs
Chunking

The application uses deterministic fixed-size chunks with overlap. This keeps
the implementation predictable and simple. In a larger production system,
token-aware or semantic chunking could improve retrieval quality.

Vector Storage

Embeddings are stored as JSON arrays in SQLite and compared using cosine
similarity in application code. This is appropriate for a small single-user
dataset.

At larger scale, scanning every embedding for every query would become
expensive. A production implementation could use a vector-capable database,
metadata filtering, caching, batch processing, and asynchronous ingestion.

Local AI Models

The evaluation environment uses Ollama to avoid an external API dependency.
The embedding and LLM layers are isolated so the provider can be replaced by
another model/API without changing the rest of the application.

Error Handling

The backend uses:

Zod validation
structured JSON logging
centralized error handling
sensible HTTP status codes
URL fetch timeout and response-size limits
basic SSRF protections
Future Improvements
semantic/hybrid retrieval
better reranking
asynchronous ingestion jobs
streaming LLM responses
richer metadata filtering
proper vector database for larger datasets
automated retrieval evaluation

That README addresses the exact trade-off areas the assignment asks candidates to discuss. :contentReference[oaicite:2]{index=2}

---

# 6. Run the FINAL verification

### Backend

```powershell
cd E:\ai-knowledge-inbox\backend
npm run build

Then:

npm start
Frontend

Second terminal:

cd E:\ai-knowledge-inbox\frontend
npm run build

Both need to pass.

Then run the browser one final time.
