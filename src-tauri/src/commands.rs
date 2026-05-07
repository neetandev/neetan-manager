use std::{
    fmt,
    path::{Path, PathBuf},
    process::Command,
    sync::Mutex,
};

use serde::Serialize;
use serde_json::{Map, Value};
use tauri::{AppHandle, Manager, State};

use crate::{
    config::SUPPORTED_LOCALES,
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

const VALID_SYSTEMS: &[&str] = &["PC-9800"];

const FDD_PRESETS: &[&str] = &["2hd", "2dd"];
const HDD_PRESETS: &[&str] = &[
    "sasi5", "sasi10", "sasi15", "sasi20", "sasi30", "sasi40", "ide40", "ide80", "ide120",
    "ide200", "ide500",
];

fn validate_system(system: &str) -> Result<(), AppError> {
    if VALID_SYSTEMS.contains(&system) {
        Ok(())
    } else {
        Err(AppError::InvalidSystem(system.to_string()))
    }
}

/// Bare executable name used for `PATH`-based fallback when neither a custom override nor a
/// portable-dir copy is present. `Command::new` resolves this through `PATH`; if nothing
/// matches, the spawn error path reports it.
const NEETAN_BARE_NAME: &str = if cfg!(windows) {
    "neetan.exe"
} else {
    "neetan"
};

/// Resolves which `neetan` binary to spawn.
///
/// Resolution order:
/// 1. If `custom` is set, that path is used. The file must exist - an explicit override is
///    authoritative, so a missing file is an error rather than a silent fall-through.
/// 2. Otherwise, `<portable_dir>/neetan[.exe]` is used if it exists.
/// 3. Otherwise, the bare name `neetan[.exe]` is returned, leaving `Command::new` to resolve
///    it via the system `PATH`. If `PATH` lookup also fails, `Command::spawn` will surface the
///    error.
fn resolve_neetan_executable(
    custom: Option<&Path>,
    portable_dir: &Path,
) -> Result<PathBuf, AppError> {
    if let Some(p) = custom {
        if p.try_exists()? {
            return Ok(p.to_path_buf());
        }
        return Err(AppError::Launch(format!(
            "custom neetan executable not found at {}",
            p.display()
        )));
    }

    let in_portable = portable_dir.join(NEETAN_BARE_NAME);
    if in_portable.try_exists()? {
        return Ok(in_portable);
    }

    Ok(PathBuf::from(NEETAN_BARE_NAME))
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
pub(crate) fn get_neetan_executable(
    state: State<'_, Mutex<ApplicationState>>,
) -> Result<Option<PathBuf>, AppError> {
    let s = lock(&state)?;
    Ok(s.config.neetan_executable_setting())
}

#[tauri::command]
pub(crate) fn set_neetan_executable(
    state: State<'_, Mutex<ApplicationState>>,
    path: Option<String>,
) -> Result<(), AppError> {
    let normalized: Option<PathBuf> = path
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(PathBuf::from);
    let mut s = lock(&state)?;
    s.config.set_neetan_executable(normalized);
    let config_dir = s.config_dir.clone();
    s.config.save(&config_dir)?;
    Ok(())
}

#[tauri::command]
pub(crate) fn get_locale(state: State<'_, Mutex<ApplicationState>>) -> Result<String, AppError> {
    let s = lock(&state)?;
    Ok(s.config.locale().to_string())
}

#[tauri::command]
pub(crate) fn set_locale(
    state: State<'_, Mutex<ApplicationState>>,
    locale: String,
) -> Result<(), AppError> {
    if !SUPPORTED_LOCALES.contains(&locale.as_str()) {
        return Err(AppError::InvalidArgument(format!(
            "unsupported locale: {locale}"
        )));
    }
    let mut s = lock(&state)?;
    s.config.set_locale(locale);
    let config_dir = s.config_dir.clone();
    s.config.save(&config_dir)?;
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

// Each `#[tauri::command]` below is a thin lock-and-dispatch wrapper around a private
// `_impl` helper that takes a plain `&[mut] Database`. The helpers contain the actual
// orchestration (system validation, transaction boundaries, JSON ser/de) and are unit-tested
// directly without standing up Tauri state.

fn list_games_impl(db: &Database, system: Option<&str>) -> Result<Vec<GameDto>, AppError> {
    if let Some(sys) = system {
        validate_system(sys)?;
    }
    let rows = metadata_repo::list(db.conn(), system)?;
    Ok(rows.into_iter().map(GameDto::from).collect())
}

fn get_game_impl(db: &Database, id: i64) -> Result<GameDto, AppError> {
    let row = metadata_repo::get(db.conn(), id)?.ok_or(AppError::NotFound)?;
    Ok(GameDto::from(row))
}

fn upsert_game_impl(db: &mut Database, game: &GameUpsertDto) -> Result<i64, AppError> {
    validate_system(&game.system)?;
    match game.id {
        Some(id) => {
            metadata_repo::update(db.conn(), id, game)?;
            Ok(id)
        }
        None => {
            let tx = db.conn_mut().transaction()?;
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

fn delete_game_impl(db: &mut Database, id: i64) -> Result<(), AppError> {
    let tx = db.conn_mut().transaction()?;
    let freed_config_id = metadata_repo::delete(&tx, id)?;
    config_repo::delete(&tx, freed_config_id)?;
    tx.commit()?;
    Ok(())
}

fn get_game_config_impl(db: &Database, id: i64) -> Result<GameConfigDto, AppError> {
    let row = config_repo::get_by_metadata_id(db.conn(), id)?.ok_or(AppError::NotFound)?;
    Ok(GameConfigDto {
        schema_version: row.schema_version,
        value: serde_json::from_str(&row.config_value)?,
    })
}

fn set_game_config_impl(db: &Database, id: i64, config: &GameConfigDto) -> Result<(), AppError> {
    let row = config_repo::get_by_metadata_id(db.conn(), id)?.ok_or(AppError::NotFound)?;
    let json = serde_json::to_string(&config.value)?;
    config_repo::update(db.conn(), row.id, config.schema_version, &json)?;
    Ok(())
}

fn get_system_config_impl(db: &Database, system: &str) -> Result<GameConfigDto, AppError> {
    validate_system(system)?;
    match system_config_repo::get(db.conn(), system)? {
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

fn set_system_config_impl(
    db: &Database,
    system: &str,
    config: &GameConfigDto,
) -> Result<(), AppError> {
    validate_system(system)?;
    let json = serde_json::to_string(&config.value)?;
    system_config_repo::upsert(db.conn(), system, config.schema_version, &json)?;
    Ok(())
}

#[tauri::command]
pub(crate) fn list_games(
    state: State<'_, Mutex<ApplicationState>>,
    system: Option<String>,
) -> Result<Vec<GameDto>, AppError> {
    let s = lock(&state)?;
    list_games_impl(s.db()?, system.as_deref())
}

#[tauri::command]
pub(crate) fn get_game(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<GameDto, AppError> {
    let s = lock(&state)?;
    get_game_impl(s.db()?, id)
}

#[tauri::command]
pub(crate) fn upsert_game(
    state: State<'_, Mutex<ApplicationState>>,
    game: GameUpsertDto,
) -> Result<i64, AppError> {
    let mut s = lock(&state)?;
    upsert_game_impl(s.db_mut()?, &game)
}

#[tauri::command]
pub(crate) fn delete_game(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<(), AppError> {
    let mut s = lock(&state)?;
    delete_game_impl(s.db_mut()?, id)
}

#[tauri::command]
pub(crate) fn get_game_config(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
) -> Result<GameConfigDto, AppError> {
    let s = lock(&state)?;
    get_game_config_impl(s.db()?, id)
}

#[tauri::command]
pub(crate) fn set_game_config(
    state: State<'_, Mutex<ApplicationState>>,
    id: i64,
    config: GameConfigDto,
) -> Result<(), AppError> {
    let s = lock(&state)?;
    set_game_config_impl(s.db()?, id, &config)
}

#[tauri::command]
pub(crate) fn get_system_config(
    state: State<'_, Mutex<ApplicationState>>,
    system: String,
) -> Result<GameConfigDto, AppError> {
    let s = lock(&state)?;
    get_system_config_impl(s.db()?, &system)
}

#[tauri::command]
pub(crate) fn set_system_config(
    state: State<'_, Mutex<ApplicationState>>,
    system: String,
    config: GameConfigDto,
) -> Result<(), AppError> {
    let s = lock(&state)?;
    set_system_config_impl(s.db()?, &system, &config)
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
    let custom = s.config.neetan_executable_setting();
    let exe = resolve_neetan_executable(custom.as_deref(), &portable_directory)?;

    Command::new(&exe)
        .current_dir(&portable_directory)
        .args(&args)
        .spawn()
        .map_err(|e| AppError::Launch(format!("failed to spawn {}: {e}", exe.display())))?;

    Ok(())
}

fn create_disk_image_impl(
    custom_exe: Option<&Path>,
    portable_dir: &Path,
    kind: &str,
    path: &str,
    preset: &str,
) -> Result<(), AppError> {
    let (subcommand, presets) = match kind {
        "fdd" => ("create-fdd", FDD_PRESETS),
        "hdd" => ("create-hdd", HDD_PRESETS),
        other => {
            return Err(AppError::InvalidArgument(format!(
                "unknown disk image kind: {other}"
            )));
        }
    };
    if !presets.contains(&preset) {
        return Err(AppError::InvalidArgument(format!(
            "unknown {kind} preset: {preset}"
        )));
    }

    let exe = resolve_neetan_executable(custom_exe, portable_dir)?;
    let output = Command::new(&exe)
        .current_dir(portable_dir)
        .args([subcommand, path, "--type", preset])
        .output()
        .map_err(|e| AppError::Launch(format!("failed to spawn {}: {e}", exe.display())))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let trimmed = stderr.trim();
        return Err(AppError::Launch(format!(
            "{subcommand} failed (status {}): {}",
            output.status,
            if trimmed.is_empty() {
                "<no stderr>"
            } else {
                trimmed
            },
        )));
    }
    Ok(())
}

#[tauri::command]
pub(crate) fn create_disk_image(
    state: State<'_, Mutex<ApplicationState>>,
    kind: String,
    path: String,
    preset: String,
) -> Result<(), AppError> {
    let s = lock(&state)?;
    let portable_dir = s.config.portable_directory();
    let custom = s.config.neetan_executable_setting();
    create_disk_image_impl(custom.as_deref(), &portable_dir, &kind, &path, &preset)
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

    fn upsert_dto(latin: &str) -> GameUpsertDto {
        GameUpsertDto {
            id: None,
            system: "PC-9800".to_string(),
            latin_name: latin.to_string(),
            japanese_name: format!("{latin}_jp"),
            developer_name: "Dev".to_string(),
            release_year: 1990,
        }
    }

    #[test]
    fn upsert_inserts_new_game_with_empty_config() {
        let mut db = Database::open_in_memory().unwrap();
        let id = upsert_game_impl(&mut db, &upsert_dto("Brandish")).unwrap();
        let game = get_game_impl(&db, id).unwrap();
        assert_eq!(game.latin_name, "Brandish");
        assert_eq!(game.system, "PC-9800");
        let cfg = get_game_config_impl(&db, id).unwrap();
        assert_eq!(cfg.schema_version, 1);
        assert_eq!(cfg.value, json!({}));
    }

    #[test]
    fn upsert_updates_existing_metadata_only() {
        let mut db = Database::open_in_memory().unwrap();
        let id = upsert_game_impl(&mut db, &upsert_dto("Old")).unwrap();
        // Seed a non-empty config; the update path must not touch it.
        set_game_config_impl(
            &db,
            id,
            &GameConfigDto {
                schema_version: 1,
                value: json!({ "machine": "PC9821AS" }),
            },
        )
        .unwrap();

        let mut updated = upsert_dto("New");
        updated.id = Some(id);
        updated.developer_name = "NewDev".to_string();
        updated.release_year = 1999;
        let returned = upsert_game_impl(&mut db, &updated).unwrap();
        assert_eq!(returned, id);

        let game = get_game_impl(&db, id).unwrap();
        assert_eq!(game.latin_name, "New");
        assert_eq!(game.developer_name, "NewDev");
        assert_eq!(game.release_year, 1999);

        let cfg = get_game_config_impl(&db, id).unwrap();
        assert_eq!(cfg.value, json!({ "machine": "PC9821AS" }));
    }

    #[test]
    fn upsert_rejects_invalid_system() {
        let mut db = Database::open_in_memory().unwrap();
        let mut dto = upsert_dto("X");
        dto.system = "BAD".to_string();
        let err = upsert_game_impl(&mut db, &dto).unwrap_err();
        assert!(matches!(err, AppError::InvalidSystem(_)));
    }

    #[test]
    fn set_game_config_round_trips() {
        let mut db = Database::open_in_memory().unwrap();
        let id = upsert_game_impl(&mut db, &upsert_dto("Game")).unwrap();
        let payload = GameConfigDto {
            schema_version: 1,
            value: json!({
                "machine": "PC9821AS",
                "audio-volume": 0.85,
                "crt": true,
                "fdd1": ["a.d88", "b.d88"]
            }),
        };
        set_game_config_impl(&db, id, &payload).unwrap();
        let read = get_game_config_impl(&db, id).unwrap();
        assert_eq!(read.schema_version, 1);
        assert_eq!(read.value, payload.value);
    }

    #[test]
    fn set_game_config_errors_on_missing_game() {
        let db = Database::open_in_memory().unwrap();
        let err = set_game_config_impl(
            &db,
            999,
            &GameConfigDto {
                schema_version: 1,
                value: json!({}),
            },
        )
        .unwrap_err();
        assert!(matches!(err, AppError::NotFound));
    }

    #[test]
    fn delete_removes_metadata_and_config() {
        let mut db = Database::open_in_memory().unwrap();
        let id = upsert_game_impl(&mut db, &upsert_dto("X")).unwrap();
        delete_game_impl(&mut db, id).unwrap();
        assert!(matches!(
            get_game_impl(&db, id).unwrap_err(),
            AppError::NotFound
        ));
        assert!(matches!(
            get_game_config_impl(&db, id).unwrap_err(),
            AppError::NotFound
        ));
    }

    #[test]
    fn list_games_filters_and_validates_system() {
        let mut db = Database::open_in_memory().unwrap();
        upsert_game_impl(&mut db, &upsert_dto("A")).unwrap();
        upsert_game_impl(&mut db, &upsert_dto("B")).unwrap();
        let listed = list_games_impl(&db, Some("PC-9800")).unwrap();
        assert_eq!(listed.len(), 2);

        let err = list_games_impl(&db, Some("BAD")).unwrap_err();
        assert!(matches!(err, AppError::InvalidSystem(_)));
    }

    #[test]
    fn get_system_config_returns_default_when_absent() {
        let db = Database::open_in_memory().unwrap();
        let cfg = get_system_config_impl(&db, "PC-9800").unwrap();
        assert_eq!(cfg.schema_version, 1);
        assert_eq!(cfg.value, json!({}));
    }

    #[test]
    fn set_system_config_round_trips() {
        let db = Database::open_in_memory().unwrap();
        let payload = GameConfigDto {
            schema_version: 1,
            value: json!({ "audio-volume": 0.75 }),
        };
        set_system_config_impl(&db, "PC-9800", &payload).unwrap();
        let read = get_system_config_impl(&db, "PC-9800").unwrap();
        assert_eq!(read.value, payload.value);
    }

    #[test]
    fn create_disk_image_rejects_unknown_kind() {
        let portable = std::env::temp_dir();
        let err = create_disk_image_impl(None, &portable, "foo", "out.d88", "2hd").unwrap_err();
        assert!(matches!(err, AppError::InvalidArgument(_)));
    }

    #[test]
    fn create_disk_image_rejects_wrong_preset_for_kind() {
        let portable = std::env::temp_dir();
        // ide40 belongs to hdd, not fdd
        let err = create_disk_image_impl(None, &portable, "fdd", "out.d88", "ide40").unwrap_err();
        assert!(matches!(err, AppError::InvalidArgument(_)));
        // 2hd belongs to fdd, not hdd
        let err = create_disk_image_impl(None, &portable, "hdd", "out.hdi", "2hd").unwrap_err();
        assert!(matches!(err, AppError::InvalidArgument(_)));
        // garbage preset
        let err = create_disk_image_impl(None, &portable, "fdd", "out.d88", "lolwhat").unwrap_err();
        assert!(matches!(err, AppError::InvalidArgument(_)));
    }

    #[test]
    fn create_disk_image_passes_validation_then_resolver_fails_with_missing_custom() {
        // A custom override pointing at a nonexistent file must short-circuit before any
        // spawn attempt - exercises the whitelist for every legal (kind, preset) pair without
        // depending on whether `neetan` happens to be on the developer's `PATH`.
        let portable = std::env::temp_dir();
        let bogus = PathBuf::from("/definitely/not/a/real/path/neetan");

        for preset in FDD_PRESETS {
            let err = create_disk_image_impl(Some(&bogus), &portable, "fdd", "out.d88", preset)
                .unwrap_err();
            assert!(
                matches!(err, AppError::Launch(_)),
                "fdd/{preset} should fail at resolve, got {err:?}"
            );
        }
        for preset in HDD_PRESETS {
            let err = create_disk_image_impl(Some(&bogus), &portable, "hdd", "out.hdi", preset)
                .unwrap_err();
            assert!(
                matches!(err, AppError::Launch(_)),
                "hdd/{preset} should fail at resolve, got {err:?}"
            );
        }
    }

    /// Tiny RAII tempdir for resolver tests - mirrors the helper in `config.rs`.
    struct ResolverTempDir(PathBuf);

    impl ResolverTempDir {
        fn new(label: &str) -> Self {
            use std::sync::atomic::{AtomicU64, Ordering};
            static COUNTER: AtomicU64 = AtomicU64::new(0);
            let n = COUNTER.fetch_add(1, Ordering::Relaxed);
            let path = std::env::temp_dir().join(format!(
                "neetan-test-resolver-{}-{}-{}",
                label,
                std::process::id(),
                n,
            ));
            std::fs::create_dir_all(&path).unwrap();
            Self(path)
        }

        fn path(&self) -> &Path {
            &self.0
        }
    }

    impl Drop for ResolverTempDir {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn resolve_neetan_executable_uses_existing_custom_path() {
        let dir = ResolverTempDir::new("custom-exists");
        let exe = dir.path().join("my-neetan");
        std::fs::write(&exe, b"").unwrap();

        let resolved = resolve_neetan_executable(Some(&exe), dir.path()).unwrap();
        assert_eq!(resolved, exe);
    }

    #[test]
    fn resolve_neetan_executable_errors_when_custom_path_missing() {
        let dir = ResolverTempDir::new("custom-missing");
        let bogus = dir.path().join("not-here");

        let err = resolve_neetan_executable(Some(&bogus), dir.path()).unwrap_err();
        match err {
            AppError::Launch(msg) => assert!(
                msg.contains("custom neetan executable not found"),
                "unexpected message: {msg}"
            ),
            other => panic!("expected AppError::Launch, got {other:?}"),
        }
    }

    #[test]
    fn resolve_neetan_executable_uses_portable_dir_when_present() {
        let dir = ResolverTempDir::new("portable-has-bin");
        let exe = dir.path().join(NEETAN_BARE_NAME);
        std::fs::write(&exe, b"").unwrap();

        let resolved = resolve_neetan_executable(None, dir.path()).unwrap();
        assert_eq!(resolved, exe);
    }

    #[test]
    fn resolve_neetan_executable_falls_back_to_bare_name_for_path_lookup() {
        let dir = ResolverTempDir::new("portable-empty");

        let resolved = resolve_neetan_executable(None, dir.path()).unwrap();
        assert_eq!(resolved, PathBuf::from(NEETAN_BARE_NAME));
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
