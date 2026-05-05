use std::path::Path;

use rusqlite::Connection;

const MIGRATIONS: &[(u32, &str)] = &[(1, include_str!("migrations/001_initial.sql"))];

pub(crate) struct Database {
    conn: Connection,
}

impl Database {
    pub(crate) fn open(db_path: &Path) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(db_path)?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
        Self::run_migrations(&conn)?;
        Ok(Self { conn })
    }

    #[cfg(test)]
    pub(crate) fn open_in_memory() -> Result<Self, rusqlite::Error> {
        let conn = Connection::open_in_memory()?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
        Self::run_migrations(&conn)?;
        Ok(Self { conn })
    }

    pub(crate) fn conn(&self) -> &Connection {
        &self.conn
    }

    pub(crate) fn conn_mut(&mut self) -> &mut Connection {
        &mut self.conn
    }

    fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
        let current: u32 = conn.pragma_query_value(None, "user_version", |r| r.get(0))?;
        for (v, sql) in MIGRATIONS.iter().filter(|(v, _)| *v > current) {
            let tx = conn.unchecked_transaction()?;
            tx.execute_batch(sql)?;
            tx.pragma_update(None, "user_version", *v)?;
            tx.commit()?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use rusqlite::ErrorCode;

    use super::*;

    fn user_version(conn: &Connection) -> u32 {
        conn.pragma_query_value(None, "user_version", |r| r.get(0))
            .unwrap()
    }

    fn table_names(conn: &Connection) -> Vec<String> {
        let mut stmt = conn
            .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
            .unwrap();
        let rows = stmt
            .query_map([], |r| r.get::<_, String>(0))
            .unwrap()
            .map(Result::unwrap)
            .collect();
        rows
    }

    #[test]
    fn migrations_apply_to_fresh_db() {
        let db = Database::open_in_memory().unwrap();
        assert_eq!(user_version(db.conn()), 1);
        let tables = table_names(db.conn());
        assert!(tables.contains(&"config".to_string()));
        assert!(tables.contains(&"metadata".to_string()));
        assert!(tables.contains(&"system_config".to_string()));
    }

    #[test]
    fn migrations_are_idempotent() {
        let db = Database::open_in_memory().unwrap();
        Database::run_migrations(db.conn()).unwrap();
        assert_eq!(user_version(db.conn()), 1);
    }

    #[test]
    fn foreign_keys_enforced() {
        let db = Database::open_in_memory().unwrap();
        let err = db
            .conn()
            .execute(
                "INSERT INTO metadata (system, latin_name, japanese_name, developer_name, release_year, config_id)
                 VALUES ('PC-9800', 'X', 'X', 'X', 1990, 9999)",
                [],
            )
            .unwrap_err();
        match err {
            rusqlite::Error::SqliteFailure(e, _) => {
                assert_eq!(e.code, ErrorCode::ConstraintViolation);
            }
            other => panic!("expected SqliteFailure, got {other:?}"),
        }
    }

    #[test]
    fn system_check_constraint() {
        let db = Database::open_in_memory().unwrap();
        db.conn()
            .execute(
                "INSERT INTO config (schema_version, config_value) VALUES (1, '{}')",
                [],
            )
            .unwrap();
        let err = db
            .conn()
            .execute(
                "INSERT INTO metadata (system, latin_name, japanese_name, developer_name, release_year, config_id)
                 VALUES ('INVALID', 'X', 'X', 'X', 1990, 1)",
                [],
            )
            .unwrap_err();
        match err {
            rusqlite::Error::SqliteFailure(e, _) => {
                assert_eq!(e.code, ErrorCode::ConstraintViolation);
            }
            other => panic!("expected SqliteFailure, got {other:?}"),
        }
    }
}
