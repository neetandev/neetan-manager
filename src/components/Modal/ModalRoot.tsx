import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../../state/AppContext";
import { AddGameModal } from "./AddGameModal";
import { DeleteGameModal } from "./DeleteGameModal";
import { DuplicateGameModal } from "./DuplicateGameModal";
import { EditGameModal } from "./EditGameModal";
import { LicenseModal } from "./LicenseModal";
import { SettingsModal } from "./SettingsModal";
import { VersionModal } from "./VersionModal";

export function ModalRoot() {
  const { modal } = useAppState();
  const dispatch = useAppDispatch();
  const close = useCallback(() => dispatch({ type: "CLOSE_MODAL" }), [dispatch]);

  return (
    <>
      <SettingsModal open={modal === "settings"} onClose={close} />
      <LicenseModal open={modal === "license"} onClose={close} />
      <VersionModal open={modal === "version"} onClose={close} />
      <AddGameModal open={modal === "add"} onClose={close} />
      <EditGameModal open={modal === "edit"} onClose={close} />
      <DuplicateGameModal open={modal === "duplicate"} onClose={close} />
      <DeleteGameModal open={modal === "delete"} onClose={close} />
    </>
  );
}
