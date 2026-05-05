#[derive(Clone, Debug)]
pub(crate) struct ConfigRow {
    pub id: i64,
    pub schema_version: i32,
    pub config_value: String,
}
