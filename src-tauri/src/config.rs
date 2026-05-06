use std::{
    fs, io,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};

const CONFIG_FILE_NAME: &str = "config.json";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub(crate) struct Config {
    portable_directory: Option<PathBuf>,
    #[serde(default = "first_setup")]
    first_setup: bool,
}

fn first_setup() -> bool {
    true
}

impl Default for Config {
    fn default() -> Self {
        Self {
            portable_directory: None,
            first_setup: true,
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

    /// Whether the first-time setup flow still needs to run.
    pub(crate) fn first_setup(&self) -> bool {
        self.first_setup
    }

    /// Marks the first-time setup as completed. Stays completed forever after - clearing the
    /// portable directory later does not flip this back.
    pub(crate) fn mark_setup_complete(&mut self) {
        self.first_setup = false;
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
    fn mark_setup_complete_round_trip() {
        let dir = TempDir::new("setup-complete");
        let mut cfg = Config::default();
        cfg.mark_setup_complete();
        cfg.save(dir.path()).unwrap();
        let loaded = Config::load(dir.path());
        assert!(!loaded.first_setup());
    }
}
