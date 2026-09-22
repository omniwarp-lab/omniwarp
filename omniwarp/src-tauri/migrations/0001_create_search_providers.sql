CREATE TABLE IF NOT EXISTS search_providers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_data BLOB,
    icon_updated_at INTEGER,
    is_custom INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1
);

INSERT OR IGNORE INTO search_providers (id, name, url)
VALUES ('google', 'Google', 'https://www.google.com/search?q={query}');

INSERT OR IGNORE INTO search_providers (id, name, url)
VALUES ('duckduckgo', 'DuckDuckGo', 'https://duckduckgo.com/?q={query}');
