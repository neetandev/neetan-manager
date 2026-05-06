use rusqlite::{Connection, params};

pub(crate) fn get(
    conn: &Connection,
    system: &str,
) -> Result<Option<(i32, String)>, rusqlite::Error> {
    conn.query_row(
        "SELECT schema_version, config_value FROM system_config WHERE system = ?1",
        params![system],
        |row| Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?)),
    )
    .map(Some)
    .or_else(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => Ok(None),
        other => Err(other),
    })
}

pub(crate) fn upsert(
    conn: &Connection,
    system: &str,
    schema_version: i32,
    json: &str,
) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO system_config (system, schema_version, config_value)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(system) DO UPDATE SET
             schema_version = excluded.schema_version,
             config_value   = excluded.config_value,
             updated_at     = unixepoch()",
        params![system, schema_version, json],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::Database;

    #[test]
    fn get_returns_none_for_missing() {
        let db = Database::open_in_memory().unwrap();
        assert!(get(db.conn(), "PC-9800").unwrap().is_none());
    }

    #[test]
    fn upsert_inserts_then_updates() {
        let db = Database::open_in_memory().unwrap();
        upsert(db.conn(), "PC-9800", 1, r#"{"a":1}"#).unwrap();
        let (v, json) = get(db.conn(), "PC-9800").unwrap().unwrap();
        assert_eq!(v, 1);
        assert_eq!(json, r#"{"a":1}"#);

        upsert(db.conn(), "PC-9800", 2, r#"{"a":2}"#).unwrap();
        let (v, json) = get(db.conn(), "PC-9800").unwrap().unwrap();
        assert_eq!(v, 2);
        assert_eq!(json, r#"{"a":2}"#);
    }

    #[test]
    fn each_system_independent() {
        let db = Database::open_in_memory().unwrap();
        upsert(db.conn(), "PC-9800", 1, r#"{"k":"98"}"#).unwrap();
        upsert(db.conn(), "PC-9800", 1, r#"{"k":"98b"}"#).unwrap();

        let (_, j98) = get(db.conn(), "PC-9800").unwrap().unwrap();
        let (_, j98b) = get(db.conn(), "PC-9800").unwrap().unwrap();
        assert_eq!(j98, r#"{"k":"98b"}"#);
        assert_eq!(j98b, r#"{"k":"98b"}"#);
    }
}
