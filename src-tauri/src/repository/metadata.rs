use rusqlite::{Connection, Transaction, params};

use crate::{dto::GameUpsertDto, model::MetadataRow};

pub(crate) fn list(
    conn: &Connection,
    system: Option<&str>,
) -> Result<Vec<MetadataRow>, rusqlite::Error> {
    let map_row = |row: &rusqlite::Row| -> Result<MetadataRow, rusqlite::Error> {
        Ok(MetadataRow {
            id: row.get(0)?,
            system: row.get(1)?,
            latin_name: row.get(2)?,
            japanese_name: row.get(3)?,
            developer_name: row.get(4)?,
            release_year: row.get(5)?,
            config_id: row.get(6)?,
        })
    };

    match system {
        Some(s) => {
            let mut stmt = conn.prepare(
                "SELECT id, system, latin_name, japanese_name, developer_name, release_year, config_id
                 FROM metadata
                 WHERE system = ?1
                 ORDER BY latin_name COLLATE NOCASE",
            )?;
            stmt.query_map(params![s], map_row)?.collect()
        }
        None => {
            let mut stmt = conn.prepare(
                "SELECT id, system, latin_name, japanese_name, developer_name, release_year, config_id
                 FROM metadata
                 ORDER BY latin_name COLLATE NOCASE",
            )?;
            stmt.query_map([], map_row)?.collect()
        }
    }
}

pub(crate) fn get(conn: &Connection, id: i64) -> Result<Option<MetadataRow>, rusqlite::Error> {
    conn.query_row(
        "SELECT id, system, latin_name, japanese_name, developer_name, release_year, config_id
         FROM metadata
         WHERE id = ?1",
        params![id],
        |row| {
            Ok(MetadataRow {
                id: row.get(0)?,
                system: row.get(1)?,
                latin_name: row.get(2)?,
                japanese_name: row.get(3)?,
                developer_name: row.get(4)?,
                release_year: row.get(5)?,
                config_id: row.get(6)?,
            })
        },
    )
    .map(Some)
    .or_else(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => Ok(None),
        other => Err(other),
    })
}

pub(crate) fn insert(
    tx: &Transaction,
    system: &str,
    latin_name: &str,
    japanese_name: &str,
    developer_name: &str,
    release_year: i32,
    config_id: i64,
) -> Result<i64, rusqlite::Error> {
    tx.execute(
        "INSERT INTO metadata (system, latin_name, japanese_name, developer_name, release_year, config_id)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![system, latin_name, japanese_name, developer_name, release_year, config_id],
    )?;
    Ok(tx.last_insert_rowid())
}

pub(crate) fn update(
    conn: &Connection,
    id: i64,
    dto: &GameUpsertDto,
) -> Result<(), rusqlite::Error> {
    let affected = conn.execute(
        "UPDATE metadata
         SET system = ?1, latin_name = ?2, japanese_name = ?3, developer_name = ?4,
             release_year = ?5, updated_at = unixepoch()
         WHERE id = ?6",
        params![
            dto.system,
            dto.latin_name,
            dto.japanese_name,
            dto.developer_name,
            dto.release_year,
            id,
        ],
    )?;
    if affected == 0 {
        return Err(rusqlite::Error::QueryReturnedNoRows);
    }
    Ok(())
}

/// Deletes the metadata row with the given id and returns the `config_id` it pointed at, so the
/// caller can clean up the corresponding config row inside the same transaction.
pub(crate) fn delete(tx: &Transaction, id: i64) -> Result<i64, rusqlite::Error> {
    let config_id: i64 = tx.query_row(
        "SELECT config_id FROM metadata WHERE id = ?1",
        params![id],
        |row| row.get(0),
    )?;
    tx.execute("DELETE FROM metadata WHERE id = ?1", params![id])?;
    Ok(config_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{database::Database, repository::config as config_repo};

    fn seed(db: &mut Database, system: &str, latin: &str) -> i64 {
        let tx = db.conn_mut().transaction().unwrap();
        let config_id = config_repo::insert(&tx, 1, "{}").unwrap();
        let id = insert(&tx, system, latin, "JP", "Dev", 1990, config_id).unwrap();
        tx.commit().unwrap();
        id
    }

    #[test]
    fn insert_then_get() {
        let mut db = Database::open_in_memory().unwrap();
        let id = seed(&mut db, "PC-9800", "Brandish");
        let row = get(db.conn(), id).unwrap().unwrap();
        assert_eq!(row.id, id);
        assert_eq!(row.system, "PC-9800");
        assert_eq!(row.latin_name, "Brandish");
        assert_eq!(row.japanese_name, "JP");
        assert_eq!(row.developer_name, "Dev");
        assert_eq!(row.release_year, 1990);
    }

    #[test]
    fn list_filters_by_system() {
        let mut db = Database::open_in_memory().unwrap();
        seed(&mut db, "PC-9800", "A");
        seed(&mut db, "PC-9800", "B");
        seed(&mut db, "PC-9800", "C");

        let pc98 = list(db.conn(), Some("PC-9800")).unwrap();
        assert_eq!(pc98.len(), 3);
        assert!(pc98.iter().all(|r| r.system == "PC-9800"));

        let all = list(db.conn(), None).unwrap();
        assert_eq!(all.len(), 3);
    }

    #[test]
    fn update_changes_fields() {
        let mut db = Database::open_in_memory().unwrap();
        let id = seed(&mut db, "PC-9800", "Old");

        let dto = GameUpsertDto {
            id: Some(id),
            system: "PC-9800".to_string(),
            latin_name: "New".to_string(),
            japanese_name: "新".to_string(),
            developer_name: "NewDev".to_string(),
            release_year: 1999,
        };
        update(db.conn(), id, &dto).unwrap();

        let row = get(db.conn(), id).unwrap().unwrap();
        assert_eq!(row.system, "PC-9800");
        assert_eq!(row.latin_name, "New");
        assert_eq!(row.japanese_name, "新");
        assert_eq!(row.developer_name, "NewDev");
        assert_eq!(row.release_year, 1999);
    }

    #[test]
    fn update_missing_row_errors() {
        let db = Database::open_in_memory().unwrap();
        let dto = GameUpsertDto {
            id: Some(999),
            system: "PC-9800".to_string(),
            latin_name: "X".to_string(),
            japanese_name: "X".to_string(),
            developer_name: "X".to_string(),
            release_year: 1990,
        };
        let err = update(db.conn(), 999, &dto).unwrap_err();
        assert!(matches!(err, rusqlite::Error::QueryReturnedNoRows));
    }

    #[test]
    fn delete_returns_freed_config_id() {
        let mut db = Database::open_in_memory().unwrap();
        let id = seed(&mut db, "PC-9800", "X");
        let config_id_before = get(db.conn(), id).unwrap().unwrap().config_id;

        let tx = db.conn_mut().transaction().unwrap();
        let freed = delete(&tx, id).unwrap();
        tx.commit().unwrap();

        assert_eq!(freed, config_id_before);
        assert!(get(db.conn(), id).unwrap().is_none());
    }
}
