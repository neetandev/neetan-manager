use std::path::PathBuf;

use crate::{commands::AppError, config::Config, database::Database};

pub(crate) struct ApplicationState {
    pub(crate) config_dir: PathBuf,
    pub(crate) config: Config,
    pub(crate) db: Option<Database>,
}

impl ApplicationState {
    pub(crate) fn new(config_dir: PathBuf) -> Result<Self, AppError> {
        std::fs::create_dir_all(&config_dir)?;
        let config = Config::load(&config_dir);
        // Defer DB open until the first-setup flow has chosen a portable directory.
        // Opening at the CWD fallback during first launch would create a stray database.dat
        // in whatever the process happens to start from.
        let db = if config.first_setup() {
            None
        } else {
            let db_path = config.portable_directory().join("database.dat");
            Some(Database::open(&db_path)?)
        };
        Ok(Self {
            config_dir,
            config,
            db,
        })
    }

    pub(crate) fn db(&self) -> Result<&Database, AppError> {
        self.db.as_ref().ok_or(AppError::NotInitialized)
    }

    pub(crate) fn db_mut(&mut self) -> Result<&mut Database, AppError> {
        self.db.as_mut().ok_or(AppError::NotInitialized)
    }
}
