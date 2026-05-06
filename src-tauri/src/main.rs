// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Workaround for: https://github.com/tauri-apps/tauri/issues/10702
    #[cfg(target_os = "linux")]
    unsafe {
        std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
    }

    neetan_manager_lib::run()
}
