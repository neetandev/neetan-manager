use std::{
    fs, io,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};

const CONFIG_FILE_NAME: &str = "config.json";

pub(crate) const SUPPORTED_LOCALES: &[&str] = &["en", "ja"];
const DEFAULT_LOCALE: &str = "en";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub(crate) struct Config {
    portable_directory: Option<PathBuf>,
    #[serde(default)]
    neetan_executable: Option<PathBuf>,
    #[serde(default = "first_setup")]
    first_setup: bool,
    #[serde(default = "default_locale")]
    locale: String,
}

fn first_setup() -> bool {
    true
}

fn default_locale() -> String {
    DEFAULT_LOCALE.to_string()
}

impl Default for Config {
    fn default() -> Self {
        Self {
            portable_directory: None,
            neetan_executable: None,
            first_setup: true,
            locale: default_locale(),
        }
    }
}

impl Config {
    /// Path to the portable directory (containing the `neetan` executable, the database, the games etc.).
    ///
    /// If the PathBuf is not set (empty is folded to `None`), then the current work directory
    /// is used.
    pub(crate) fn portable_directory(&self) -> PathBuf {
        let work_directory = std::env::current_dir().unwrap_or_default();
        self.portable_directory.clone().unwrap_or(work_directory)
    }

    /// Returns the raw stored value, without the CWD fallback. Used at the IPC boundary so the
    /// frontend can distinguish "configured" from "fell back to current directory".
    pub(crate) fn portable_directory_setting(&self) -> Option<PathBuf> {
        self.portable_directory.clone()
    }

    /// Sets the portable directory path. `None` clears the setting.
    pub(crate) fn set_portable_directory(&mut self, portable_directory: Option<PathBuf>) {
        self.portable_directory = portable_directory;
    }

    /// Returns the user-configured path to the `neetan` executable, if any. The launcher uses
    /// this as an explicit override; when `None`, the launcher falls back to the portable
    /// directory and then to the system `PATH`.
    pub(crate) fn neetan_executable_setting(&self) -> Option<PathBuf> {
        self.neetan_executable.clone()
    }

    /// Sets the custom `neetan` executable path. `None` clears the setting.
    pub(crate) fn set_neetan_executable(&mut self, neetan_executable: Option<PathBuf>) {
        self.neetan_executable = neetan_executable;
    }

    /// Whether the first-time setup flow still needs to run.
    pub(crate) fn first_setup(&self) -> bool {
        self.first_setup
    }

    /// Marks the first-time setup as completed. Stays completed forever after - clearing the
    /// portable directory later does not flip this back.
    pub(crate) fn mark_setup_complete(&mut self) {
        self.first_setup = false;
    }

    /// Currently selected UI locale ("en" or "ja"). Always one of `SUPPORTED_LOCALES`; legacy
    /// configs missing the field default to `"en"` via serde.
    pub(crate) fn locale(&self) -> &str {
        &self.locale
    }

    /// Sets the UI locale. Caller is responsible for validating against `SUPPORTED_LOCALES`.
    pub(crate) fn set_locale(&mut self, locale: String) {
        self.locale = locale;
    }

    /// Loads the config from `<dir>/config.json`. Returns `Config::default()` when the file is
    /// missing or unparseable.
    pub(crate) fn load(dir: &Path) -> Self {
        fs::read_to_string(dir.join(CONFIG_FILE_NAME))
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    }

    /// Persists the config to `<dir>/config.json` atomically (write-to-tmp then rename).
    pub(crate) fn save(&self, dir: &Path) -> io::Result<()> {
        fs::create_dir_all(dir)?;
        let target = dir.join(CONFIG_FILE_NAME);
        let tmp = dir.join(format!("{CONFIG_FILE_NAME}.tmp"));
        let bytes = serde_json::to_vec_pretty(self)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
        fs::write(&tmp, &bytes)?;
        // fs::rename over an existing file fails on Windows.
        #[cfg(windows)]
        {
            let _ = fs::remove_file(&target);
        }
        fs::rename(&tmp, &target)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Tiny RAII tempdir so we don't pull in a dev-dep.
    struct TempDir(PathBuf);

    impl TempDir {
        fn new(label: &str) -> Self {
            use std::sync::atomic::{AtomicU64, Ordering};
            static COUNTER: AtomicU64 = AtomicU64::new(0);
            let n = COUNTER.fetch_add(1, Ordering::Relaxed);
            let path = std::env::temp_dir().join(format!(
                "neetan-test-{}-{}-{}-{}",
                label,
                std::process::id(),
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_nanos(),
                n,
            ));
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }

        fn path(&self) -> &Path {
            &self.0
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn load_returns_default_when_missing() {
        let dir = TempDir::new("load-default");
        let cfg = Config::load(dir.path());
        assert!(cfg.portable_directory.is_none());
    }

    #[test]
    fn save_then_load_round_trip() {
        let dir = TempDir::new("round-trip");
        let mut cfg = Config::default();
        cfg.set_portable_directory(Some(PathBuf::from("/tmp/neetan-portable")));
        cfg.save(dir.path()).unwrap();

        let loaded = Config::load(dir.path());
        assert_eq!(
            loaded.portable_directory,
            Some(PathBuf::from("/tmp/neetan-portable"))
        );
    }

    #[test]
    fn clear_then_load_round_trip() {
        let dir = TempDir::new("clear-round-trip");
        let mut cfg = Config::default();
        cfg.set_portable_directory(Some(PathBuf::from("/tmp/neetan-portable")));
        cfg.set_portable_directory(None);
        cfg.save(dir.path()).unwrap();

        let loaded = Config::load(dir.path());
        assert!(loaded.portable_directory.is_none());
        assert!(loaded.portable_directory_setting().is_none());
    }

    #[test]
    fn portable_directory_setting_returns_raw_value() {
        let mut cfg = Config::default();
        assert!(cfg.portable_directory_setting().is_none());
        cfg.set_portable_directory(Some(PathBuf::from("/x/y")));
        assert_eq!(
            cfg.portable_directory_setting(),
            Some(PathBuf::from("/x/y"))
        );
    }

    #[test]
    fn save_creates_directory() {
        let dir = TempDir::new("create-dir");
        let nested = dir.path().join("a").join("b");
        let cfg = Config::default();
        cfg.save(&nested).unwrap();
        assert!(nested.join(CONFIG_FILE_NAME).exists());
    }

    #[test]
    fn load_ignores_corrupt_json() {
        let dir = TempDir::new("corrupt");
        fs::write(dir.path().join(CONFIG_FILE_NAME), b"{not valid json").unwrap();
        let cfg = Config::load(dir.path());
        assert!(cfg.portable_directory.is_none());
    }

    #[test]
    fn default_config_first_setup_is_true() {
        let cfg = Config::default();
        assert!(cfg.first_setup());
    }

    #[test]
    fn loaded_config_without_first_setup_field_defaults_to_true() {
        let dir = TempDir::new("legacy-config");
        fs::write(
            dir.path().join(CONFIG_FILE_NAME),
            br#"{"portable_directory":"/tmp/neetan-portable"}"#,
        )
        .unwrap();
        let cfg = Config::load(dir.path());
        assert_eq!(
            cfg.portable_directory,
            Some(PathBuf::from("/tmp/neetan-portable"))
        );
        assert!(cfg.first_setup());
    }

    #[test]
    fn neetan_executable_round_trip() {
        let dir = TempDir::new("neetan-exe-round-trip");
        let mut cfg = Config::default();
        cfg.set_neetan_executable(Some(PathBuf::from("/opt/neetan/bin/neetan")));
        cfg.save(dir.path()).unwrap();

        let loaded = Config::load(dir.path());
        assert_eq!(
            loaded.neetan_executable_setting(),
            Some(PathBuf::from("/opt/neetan/bin/neetan"))
        );
    }

    #[test]
    fn neetan_executable_clear_round_trip() {
        let dir = TempDir::new("neetan-exe-clear");
        let mut cfg = Config::default();
        cfg.set_neetan_executable(Some(PathBuf::from("/opt/neetan/bin/neetan")));
        cfg.set_neetan_executable(None);
        cfg.save(dir.path()).unwrap();

        let loaded = Config::load(dir.path());
        assert!(loaded.neetan_executable_setting().is_none());
    }

    #[test]
    fn legacy_config_without_neetan_executable_loads() {
        let dir = TempDir::new("legacy-no-neetan-exe");
        fs::write(
            dir.path().join(CONFIG_FILE_NAME),
            br#"{"portable_directory":"/tmp/neetan-portable"}"#,
        )
        .unwrap();
        let cfg = Config::load(dir.path());
        assert_eq!(
            cfg.portable_directory,
            Some(PathBuf::from("/tmp/neetan-portable"))
        );
        assert!(cfg.neetan_executable_setting().is_none());
    }

    #[test]
    fn mark_setup_complete_round_trip() {
        let dir = TempDir::new("setup-complete");
        let mut cfg = Config::default();
        cfg.mark_setup_complete();
        cfg.save(dir.path()).unwrap();
        let loaded = Config::load(dir.path());
        assert!(!loaded.first_setup());
    }

    #[test]
    fn default_config_locale_is_en() {
        let cfg = Config::default();
        assert_eq!(cfg.locale(), "en");
    }

    #[test]
    fn locale_round_trip() {
        let dir = TempDir::new("locale-round-trip");
        let mut cfg = Config::default();
        cfg.set_locale("ja".to_string());
        cfg.save(dir.path()).unwrap();
        let loaded = Config::load(dir.path());
        assert_eq!(loaded.locale(), "ja");
    }

    #[test]
    fn legacy_config_without_locale_defaults_to_en() {
        let dir = TempDir::new("legacy-no-locale");
        fs::write(
            dir.path().join(CONFIG_FILE_NAME),
            br#"{"portable_directory":"/tmp/neetan-portable","first_setup":false}"#,
        )
        .unwrap();
        let cfg = Config::load(dir.path());
        assert_eq!(cfg.locale(), "en");
        assert!(!cfg.first_setup());
    }
}
