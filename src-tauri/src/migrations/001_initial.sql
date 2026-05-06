CREATE TABLE config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_version INTEGER NOT NULL,
    config_value TEXT NOT NULL DEFAULT '{}'
) STRICT;

CREATE TABLE metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system TEXT NOT NULL CHECK (system IN ('PC-9800')),
    latin_name TEXT NOT NULL,
    japanese_name TEXT NOT NULL,
    developer_name TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    config_id INTEGER NOT NULL REFERENCES config(id) ON DELETE RESTRICT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE INDEX idx_metadata_system ON metadata(system);
CREATE UNIQUE INDEX idx_metadata_config_id ON metadata(config_id);

CREATE TABLE system_config (
    system TEXT PRIMARY KEY CHECK (system IN ('PC-9800')),
    schema_version INTEGER NOT NULL,
    config_value TEXT NOT NULL DEFAULT '{}',
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;
