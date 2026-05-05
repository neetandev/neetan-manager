#[derive(Clone, Debug)]
pub(crate) struct MetadataRow {
    pub id: i64,
    pub system: String,
    pub latin_name: String,
    pub japanese_name: String,
    pub developer_name: String,
    pub release_year: i32,
    pub config_id: i64,
}
