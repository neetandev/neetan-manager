import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../../state/AppContext";
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
    </>
  );
}
