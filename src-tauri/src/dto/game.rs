use serde::{Deserialize, Serialize};

use crate::model::MetadataRow;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub(crate) struct GameDto {
    pub id: i64,
    pub system: String,
    pub latin_name: String,
    pub japanese_name: String,
    pub developer_name: String,
    pub release_year: i32,
}

impl From<MetadataRow> for GameDto {
    fn from(row: MetadataRow) -> Self {
        Self {
            id: row.id,
            system: row.system,
            latin_name: row.latin_name,
            japanese_name: row.japanese_name,
            developer_name: row.developer_name,
            release_year: row.release_year,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub(crate) struct GameUpsertDto {
    pub id: Option<i64>,
    pub system: String,
    pub latin_name: String,
    pub japanese_name: String,
    pub developer_name: String,
    pub release_year: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub(crate) struct GameConfigDto {
    pub schema_version: i32,
    pub value: serde_json::Value,
}
