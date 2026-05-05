use std::{fmt, path::PathBuf, process::Command, sync::Mutex};

use serde::Serialize;
use serde_json::{Map, Value};
use tauri::{AppHandle, Manager, State};

use crate::{
    database::Database,
    dto::{GameConfigDto, GameDto, GameUpsertDto},
    repository::{
        config as config_repo, metadata as metadata_repo, system_config as system_config_repo,
    },
    state::ApplicationState,
};

#[derive(Debug)]
pub(crate) enum AppError {
    Db(rusqlite::Error),
    Json(serde_json::Error),
    Io(std::io::Error),
    NotFound,
    NotInitialized,
    Poisoned,
    InvalidSystem(String),
    InvalidConfigShape(String),
    InvalidArgument(String),
    Launch(String),
    Window(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Db(e) => write!(f, "database error: {e}"),
            Self::Json(e) => write!(f, "json error: {e}"),
            Self::Io(e) => write!(f, "io error: {e}"),
            Self::NotFound => write!(f, "not found"),
            Self::NotInitialized => write!(
                f,
                "application not initialized; first-time setup is required"
            ),
            Self::Poisoned => write!(f, "application state mutex was poisoned"),
            Self::InvalidSystem(s) => write!(f, "invalid system: {s}"),
            Self::InvalidConfigShape(s) => write!(f, "invalid config shape: {s}"),
            Self::InvalidArgument(s) => write!(f, "invalid argument: {s}"),
            Self::Launch(s) => write!(f, "launch error: {s}"),
            Self::Window(s) => write!(f, "window error: {s}"),
        }
    }
}

impl std::error::Error for AppError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Db(e) => Some(e),
            Self::Json(e) => Some(e),
            Self::Io(e) => Some(e),
            _ => None,
        }
    }
}

impl Serialize for AppError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(e: rusqlite::Error) -> Self {
        Self::Db(e)
    }
}
impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        Self::Json(e)
    }
}
impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        Self::Io(e)
    }
}

const VALID_SYSTEMS: &[&str] = &["PC-9800", "PC-8800", "PC-8000", "PC-6000"];

fn validate_system(system: &str) -> Result<(), AppError> {
    if VALID_SYSTEMS.contains(&system) {
        Ok(())
    } else {
        Err(AppError::InvalidSystem(system.to_string()))
    }
}

fn lock<'a>(
    state: &'a State<'_, Mutex<ApplicationState>>,
) -> Result<std::sync::MutexGuard<'a, ApplicationState>, AppError> {
    state.inner().lock().map_err(|_| AppError::Poisoned)
}

#[tauri::command]
pub(crate) fn get_portable_directory(
    state: State<'_, Mutex<ApplicationState>>,
) -> Result<Option<PathBuf>, AppError> {
    let s = lock(&state)?;
    Ok(s.config.portable_directory_setting())
}

#[tauri::command]
pub(crate) fn default_portable_directory() -> Result<PathBuf, AppError> {
    Ok(std::env::current_dir()?)
}

#[tauri::command]
pub(crate) fn set_portable_directory(
    state: State<'_, Mutex<ApplicationState>>,
    path: Option<String>,
) -> Result<(), AppError> {
    let normalized: Option<PathBuf> = path
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(PathBuf::from);

    let db_path = match &normalized {
        Some(p) => p.join("database.dat"),
        None => std::env::current_dir()
            .unwrap_or_default()
            .join("database.dat"),
    };

    // Open the new DB first; if it fails we leave the current state untouched so a bad path
    // can never get persisted into config.json. rusqlite::Connection::open creates a fresh
    // database file when none exists, which is the intended behavior for first-time setup.
    let new_db = Database::open(&db_path)?;

    let mut s = lock(&state)?;
    s.config.set_portable_directory(normalized);
    let config_dir = s.config_dir.clone();
    s.config.save(&config_dir)?;
    s.db = Some(new_db);
    Ok(())
}

#[tauri::command]
pub(crate) fn complete_first_setup(
    app: AppHandle,
    state: State<'_, Mutex<ApplicationState>>,
    path: String,
) -> Result<(), AppError> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err(AppError::InvalidArgument(
            "portable directory path cannot be empty".into(),
        ));
    }
    let chosen = PathBuf::from(trimmed);
    let new_db = Database::open(&chosen.join("database.dat"))?;

    {
        let mut s = lock(&state)?;
        s.config.set_portable_directory(Some(chosen));
        s.config.mark_setup_complete();
        let config_dir = s.config_dir.clone();
        s.config.save(&config_dir)?;
        s.db = Some(new_db);
    }

    let main = app
        .get_webview_window("main")
        .ok_or_else(|| AppError::Window("main window not found".into()))?;
    main.show()
        .map_err(|e| AppError::Window(format!("failed to show main window: {e}")))?;
    if let Some(setup) = app.get_webview_window("setup") {
        // Closing emits the close-requested event; the setup window's close handler is the one
        // that exits the app, so we skip emitting here by calling destroy instead.
        setup
            .destroy()
            .map_err(|e| AppError::Window(format!("failed to close setup window: {e}")))?;
    }
    Ok(())
}

#[tauri::command]
pub(crate) fn quit_app(app: AppHandle) -> Result<(), AppError> {
    app.exit(0);
    Ok(())
}

#[tauri::command]
pub(crate) fn list_games(
    state: State<'_, Mutex<ApplicationState>>,
    system: Option<String>,
) -> Result<Vec<GameDto>, AppError> {
    if let Some(sys) = &system {
        validate_system(sys)?;
    }
    let s = lock(&state)?;
    let rows = metadata_repo::list(s.db()?.conn(), system.as_deref())?;
    Ok(rows.into_iter().map(GameDto::from).collect())
}

#[tauri::command]
pub(crate) fn get_game(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<GameDto, AppError> {
    let s = lock(&state)?;
    let row = metadata_repo::get(s.db()?.conn(), id)?.ok_or(AppError::NotFound)?;
    Ok(GameDto::from(row))
}

#[tauri::command]
pub(crate) fn upsert_game(
    state: State<'_, Mutex<ApplicationState>>,
    game: GameUpsertDto,
) -> Result<i64, AppError> {
    validate_system(&game.system)?;
    let mut s = lock(&state)?;
    match game.id {
        Some(id) => {
            metadata_repo::update(s.db()?.conn(), id, &game)?;
            Ok(id)
        }
        None => {
            let tx = s.db_mut()?.conn_mut().transaction()?;
            let config_id = config_repo::insert(&tx, 1, "{}")?;
            let id = metadata_repo::insert(
                &tx,
                &game.system,
                &game.latin_name,
                &game.japanese_name,
                &game.developer_name,
                game.release_year,
                config_id,
            )?;
            tx.commit()?;
            Ok(id)
        }
    }
}

#[tauri::command]
pub(crate) fn delete_game(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<(), AppError> {
    let mut s = lock(&state)?;
    let tx = s.db_mut()?.conn_mut().transaction()?;
    let freed_config_id = metadata_repo::delete(&tx, id)?;
    config_repo::delete(&tx, freed_config_id)?;
    tx.commit()?;
    Ok(())
}

#[tauri::command]
pub(crate) fn get_game_config(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<GameConfigDto, AppError> {
    let s = lock(&state)?;
    let row = config_repo::get_by_metadata_id(s.db()?.conn(), id)?.ok_or(AppError::NotFound)?;
    Ok(GameConfigDto {
        schema_version: row.schema_version,
        value: serde_json::from_str(&row.config_value)?,
    })
}

#[tauri::command]
pub(crate) fn set_game_config(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
    config: GameConfigDto,
) -> Result<(), AppError> {
    let s = lock(&state)?;
    let row = config_repo::get_by_metadata_id(s.db()?.conn(), id)?.ok_or(AppError::NotFound)?;
    let json = serde_json::to_string(&config.value)?;
    config_repo::update(s.db()?.conn(), row.id, config.schema_version, &json)?;
    Ok(())
}

#[tauri::command]
pub(crate) fn get_system_config(
    state: State<'_, Mutex<ApplicationState>>,
    system: String,
) -> Result<GameConfigDto, AppError> {
    validate_system(&system)?;
    let s = lock(&state)?;
    match system_config_repo::get(s.db()?.conn(), &system)? {
        Some((schema_version, json)) => Ok(GameConfigDto {
            schema_version,
            value: serde_json::from_str(&json)?,
        }),
        None => Ok(GameConfigDto {
            schema_version: 1,
            value: Value::Object(Map::new()),
        }),
    }
}

#[tauri::command]
pub(crate) fn set_system_config(
    state: State<'_, Mutex<ApplicationState>>,
    system: String,
    config: GameConfigDto,
) -> Result<(), AppError> {
    validate_system(&system)?;
    let s = lock(&state)?;
    let json = serde_json::to_string(&config.value)?;
    system_config_repo::upsert(s.db()?.conn(), &system, config.schema_version, &json)?;
    Ok(())
}

#[tauri::command]
pub(crate) fn launch_game(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<(), AppError> {
    let s = lock(&state)?;

    let metadata = metadata_repo::get(s.db()?.conn(), id)?.ok_or(AppError::NotFound)?;

    let game_cfg_json = config_repo::get_by_id(s.db()?.conn(), metadata.config_id)?
        .map(|r| r.config_value)
        .unwrap_or_else(|| "{}".to_string());
    let game_cfg: Value = serde_json::from_str(&game_cfg_json)?;

    let system_cfg_json = system_config_repo::get(s.db()?.conn(), &metadata.system)?
        .map(|(_, j)| j)
        .unwrap_or_else(|| "{}".to_string());
    let mut merged: Value = serde_json::from_str(&system_cfg_json)?;
    merge_json(&mut merged, &game_cfg);

    let args = json_to_args(&merged)?;

    let portable_directory = s.config.portable_directory();

    #[cfg(windows)]
    let exe = portable_directory.join("neetan.exe");
    #[cfg(not(windows))]
    let exe = portable_directory.join("neetan");

    Command::new(&exe)
        .current_dir(&portable_directory)
        .args(&args)
        .spawn()
        .map_err(|e| AppError::Launch(format!("failed to spawn {}: {e}", exe.display())))?;

    Ok(())
}

/// Recursively merges `overlay` into `base`. For matching object keys both being objects, the
/// merge recurses; in every other case (arrays, primitives, type mismatch, missing in base)
/// the overlay value wins.
fn merge_json(base: &mut Value, overlay: &Value) {
    match (base, overlay) {
        (Value::Object(b), Value::Object(o)) => {
            for (k, v) in o {
                match b.get_mut(k) {
                    Some(existing) => merge_json(existing, v),
                    None => {
                        b.insert(k.clone(), v.clone());
                    }
                }
            }
        }
        (slot, other) => {
            *slot = other.clone();
        }
    }
}

/// Converts a merged JSON object into the emulator's CLI arguments.
///
/// Convention (initial - easy to swap):
/// - The top-level value MUST be an object.
/// - A special key `"args"` (must be an array of strings or numbers) is emitted as raw, positional
///   arguments appended at the end.
/// - Booleans: `true` emits `--<key>`, `false` is omitted.
/// - Strings/numbers: emit `--<key>` `<stringified-value>`.
/// - Arrays of primitives: emit `--<key>` `<value>` once per element.
/// - Null: omitted.
/// - Nested objects under any key other than `args`: rejected.
fn json_to_args(value: &Value) -> Result<Vec<String>, AppError> {
    let obj = value
        .as_object()
        .ok_or_else(|| AppError::InvalidConfigShape("merged config must be an object".into()))?;

    let mut flags: Vec<String> = Vec::new();
    let mut tail: Vec<String> = Vec::new();

    for (k, v) in obj {
        if k == "args" {
            tail.extend(parse_passthrough_args(v)?);
            continue;
        }
        match v {
            Value::Null => {}
            Value::Bool(true) => flags.push(format!("--{k}")),
            Value::Bool(false) => {}
            Value::String(s) => {
                flags.push(format!("--{k}"));
                flags.push(s.clone());
            }
            Value::Number(n) => {
                flags.push(format!("--{k}"));
                flags.push(n.to_string());
            }
            Value::Array(items) => {
                for item in items {
                    let stringified = primitive_to_string(item).ok_or_else(|| {
                        AppError::InvalidConfigShape(format!(
                            "array values for '{k}' must be primitive"
                        ))
                    })?;
                    flags.push(format!("--{k}"));
                    flags.push(stringified);
                }
            }
            Value::Object(_) => {
                return Err(AppError::InvalidConfigShape(format!(
                    "nested objects are not supported (key '{k}')"
                )));
            }
        }
    }

    flags.extend(tail);
    Ok(flags)
}

fn primitive_to_string(v: &Value) -> Option<String> {
    match v {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        _ => None,
    }
}

fn parse_passthrough_args(v: &Value) -> Result<Vec<String>, AppError> {
    let arr = v.as_array().ok_or_else(|| {
        AppError::InvalidConfigShape("'args' must be an array of primitives".into())
    })?;
    arr.iter()
        .map(|item| {
            primitive_to_string(item).ok_or_else(|| {
                AppError::InvalidConfigShape("'args' items must be primitives".into())
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    #[test]
    fn merge_json_overlay_overrides_base() {
        let mut base = json!({ "a": 1, "b": { "x": 1 } });
        let overlay = json!({ "b": { "y": 2 }, "c": 3 });
        merge_json(&mut base, &overlay);
        assert_eq!(base, json!({ "a": 1, "b": { "x": 1, "y": 2 }, "c": 3 }));
    }

    #[test]
    fn merge_json_overlay_replaces_non_objects() {
        let mut base = json!({ "list": [1, 2], "n": 1 });
        let overlay = json!({ "list": [9], "n": 5 });
        merge_json(&mut base, &overlay);
        assert_eq!(base, json!({ "list": [9], "n": 5 }));
    }

    #[test]
    fn merge_json_replaces_when_base_is_not_object() {
        let mut base = json!(1);
        let overlay = json!({ "k": "v" });
        merge_json(&mut base, &overlay);
        assert_eq!(base, json!({ "k": "v" }));
    }

    #[test]
    fn json_to_args_flat_keys() {
        let v = json!({ "fullscreen": true, "width": 640 });
        let args = json_to_args(&v).unwrap();
        // serde_json::Value object iteration order matches insertion via BTreeMap unless
        // preserve_order is enabled - by default it sorts alphabetically.
        assert_eq!(args, vec!["--fullscreen", "--width", "640"]);
    }

    #[test]
    fn json_to_args_false_omits_flag() {
        let v = json!({ "vsync": false });
        assert!(json_to_args(&v).unwrap().is_empty());
    }

    #[test]
    fn json_to_args_null_omits_flag() {
        let v = json!({ "name": null });
        assert!(json_to_args(&v).unwrap().is_empty());
    }

    #[test]
    fn json_to_args_string_value() {
        let v = json!({ "name": "Brandish" });
        assert_eq!(json_to_args(&v).unwrap(), vec!["--name", "Brandish"]);
    }

    #[test]
    fn json_to_args_array_repeats_flag() {
        let v = json!({ "disk": ["a.fdi", "b.fdi"] });
        assert_eq!(
            json_to_args(&v).unwrap(),
            vec!["--disk", "a.fdi", "--disk", "b.fdi"]
        );
    }

    #[test]
    fn json_to_args_passthrough_args() {
        let v = json!({ "fullscreen": true, "args": ["--raw", "value"] });
        let args = json_to_args(&v).unwrap();
        // tail goes after flags
        assert_eq!(args, vec!["--fullscreen", "--raw", "value"]);
    }

    #[test]
    fn json_to_args_rejects_nested_object() {
        let v = json!({ "audio": { "rate": 48000 } });
        let err = json_to_args(&v).unwrap_err();
        assert!(matches!(err, AppError::InvalidConfigShape(_)));
    }

    #[test]
    fn json_to_args_rejects_top_level_non_object() {
        let v = json!([1, 2, 3]);
        let err = json_to_args(&v).unwrap_err();
        assert!(matches!(err, AppError::InvalidConfigShape(_)));
    }

    #[test]
    fn json_to_args_rejects_object_in_args_array() {
        let v = json!({ "args": [{}] });
        let err = json_to_args(&v).unwrap_err();
        assert!(matches!(err, AppError::InvalidConfigShape(_)));
    }

    #[test]
    fn app_error_serializes_to_string() {
        let cases = [
            AppError::NotFound,
            AppError::NotInitialized,
            AppError::Poisoned,
            AppError::InvalidSystem("X".into()),
            AppError::InvalidConfigShape("bad".into()),
            AppError::InvalidArgument("oops".into()),
            AppError::Launch("nope".into()),
            AppError::Window("missing".into()),
        ];
        for e in cases {
            let v = serde_json::to_value(&e).unwrap();
            assert!(v.is_string(), "expected string for {e:?}, got {v:?}");
            assert!(!v.as_str().unwrap().is_empty());
        }
    }
}
