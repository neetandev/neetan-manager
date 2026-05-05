import { invoke } from "@tauri-apps/api/core";

export function getPortableDirectory(): Promise<string | null> {
  return invoke<string | null>("get_portable_directory");
}

export function setPortableDirectory(path: string | null): Promise<void> {
  return invoke<void>("set_portable_directory", { path });
}

export function defaultPortableDirectory(): Promise<string> {
  return invoke<string>("default_portable_directory");
}

export function completeFirstSetup(path: string): Promise<void> {
  return invoke<void>("complete_first_setup", { path });
}

export function cancelFirstSetup(): Promise<void> {
  return invoke<void>("cancel_first_setup");
}
