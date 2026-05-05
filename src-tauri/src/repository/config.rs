use rusqlite::{Connection, Transaction, params};

use crate::model::ConfigRow;

pub(crate) fn insert(
    tx: &Transaction,
    schema_version: i32,
    json: &str,
) -> Result<i64, rusqlite::Error> {
    tx.execute(
        "INSERT INTO config (schema_version, config_value) VALUES (?1, ?2)",
        params![schema_version, json],
    )?;
    Ok(tx.last_insert_rowid())
}

pub(crate) fn get_by_id(conn: &Connection, id: i64) -> Result<Option<ConfigRow>, rusqlite::Error> {
    conn.query_row(
        "SELECT id, schema_version, config_value FROM config WHERE id = ?1",
        params![id],
        |row| {
            Ok(ConfigRow {
                id: row.get(0)?,
                schema_version: row.get(1)?,
                config_value: row.get(2)?,
            })
        },
    )
    .map(Some)
    .or_else(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => Ok(None),
        other => Err(other),
    })
}

pub(crate) fn get_by_metadata_id(
    conn: &Connection,
    metadata_id: i64,
) -> Result<Option<ConfigRow>, rusqlite::Error> {
    conn.query_row(
        "SELECT c.id, c.schema_version, c.config_value
         FROM config c
         JOIN metadata m ON m.config_id = c.id
         WHERE m.id = ?1",
        params![metadata_id],
        |row| {
            Ok(ConfigRow {
                id: row.get(0)?,
                schema_version: row.get(1)?,
                config_value: row.get(2)?,
            })
        },
    )
    .map(Some)
    .or_else(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => Ok(None),
        other => Err(other),
    })
}

pub(crate) fn update(
    conn: &Connection,
    id: i64,
    schema_version: i32,
    json: &str,
) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE config SET schema_version = ?1, config_value = ?2 WHERE id = ?3",
        params![schema_version, json, id],
    )?;
    Ok(())
}

pub(crate) fn delete(tx: &Transaction, id: i64) -> Result<(), rusqlite::Error> {
    tx.execute("DELETE FROM config WHERE id = ?1", params![id])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::Database;

    fn seed_game_with_config(db: &mut Database, json: &str) -> (i64, i64) {
        let tx = db.conn_mut().transaction().unwrap();
        let config_id = insert(&tx, 1, json).unwrap();
        tx.execute(
            "INSERT INTO metadata (system, latin_name, japanese_name, developer_name, release_year, config_id)
             VALUES ('PC-9800', 'X', 'X', 'X', 1990, ?1)",
            params![config_id],
        )
        .unwrap();
        let metadata_id = tx.last_insert_rowid();
        tx.commit().unwrap();
        (config_id, metadata_id)
    }

    #[test]
    fn insert_then_get_by_id() {
        let mut db = Database::open_in_memory().unwrap();
        let tx = db.conn_mut().transaction().unwrap();
        let id = insert(&tx, 1, r#"{"a":1}"#).unwrap();
        tx.commit().unwrap();

        let row = get_by_id(db.conn(), id).unwrap().unwrap();
        assert_eq!(row.id, id);
        assert_eq!(row.schema_version, 1);
        assert_eq!(row.config_value, r#"{"a":1}"#);
    }

    #[test]
    fn get_by_metadata_id_joins() {
        let mut db = Database::open_in_memory().unwrap();
        let (config_id, metadata_id) = seed_game_with_config(&mut db, r#"{"vsync":true}"#);

        let row = get_by_metadata_id(db.conn(), metadata_id).unwrap().unwrap();
        assert_eq!(row.id, config_id);
        assert_eq!(row.config_value, r#"{"vsync":true}"#);
    }

    #[test]
    fn update_writes_through() {
        let mut db = Database::open_in_memory().unwrap();
        let tx = db.conn_mut().transaction().unwrap();
        let id = insert(&tx, 1, "{}").unwrap();
        tx.commit().unwrap();

        update(db.conn(), id, 2, r#"{"k":"v"}"#).unwrap();
        let row = get_by_id(db.conn(), id).unwrap().unwrap();
        assert_eq!(row.schema_version, 2);
        assert_eq!(row.config_value, r#"{"k":"v"}"#);
    }

    #[test]
    fn delete_removes_row() {
        let mut db = Database::open_in_memory().unwrap();
        let tx = db.conn_mut().transaction().unwrap();
        let id = insert(&tx, 1, "{}").unwrap();
        delete(&tx, id).unwrap();
        tx.commit().unwrap();

        assert!(get_by_id(db.conn(), id).unwrap().is_none());
    }
}
