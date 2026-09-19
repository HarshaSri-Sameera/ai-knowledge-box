CREATE TABLE IF NOT EXISTS items (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL CHECK(type IN ('text', 'url')),
  title       TEXT NOT NULL,
  source_url  TEXT,
  raw_content TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chunks (
  id          TEXT PRIMARY KEY,
  item_id     TEXT NOT NULL REFERENCES items(id),
  chunk_index INTEGER NOT NULL,
  content     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS embeddings (
  id        TEXT PRIMARY KEY,
  chunk_id  TEXT NOT NULL REFERENCES chunks(id),
  vector    TEXT NOT NULL
);
