mod commands;
mod config;
mod database;
mod dto;
mod model;
mod repository;
mod state;

use std::sync::Mutex;

use tauri::Manager;

use crate::state::ApplicationState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let config_dir = app.path().app_config_dir()?;
            let state = ApplicationState::new(config_dir)?;
            let first_setup = state.config.first_setup();
            app.manage(Mutex::new(state));

            let label = if first_setup { "setup" } else { "main" };
            if let Some(window) = app.get_webview_window(label) {
                window.show()?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_portable_directory,
            commands::set_portable_directory,
            commands::default_portable_directory,
            commands::get_neetan_executable,
            commands::set_neetan_executable,
            commands::get_locale,
            commands::set_locale,
            commands::complete_first_setup,
            commands::quit_app,
            commands::list_games,
            commands::get_game,
            commands::upsert_game,
            commands::delete_game,
            commands::get_game_config,
            commands::set_game_config,
            commands::get_system_config,
            commands::set_system_config,
            commands::launch_game,
            commands::create_disk_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
