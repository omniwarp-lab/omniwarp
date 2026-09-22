CREATE TABLE IF NOT EXISTS search_providers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_data BLOB,
    icon_updated_at INTEGER,
    is_custom INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO search_providers (id, name, url, position)
VALUES ('google', 'Google', 'https://www.google.com/search?q={query}', 0);

INSERT OR IGNORE INTO search_providers (id, name, url, position)
VALUES ('duckduckgo', 'DuckDuckGo', 'https://duckduckgo.com/?q={query}', 1);
