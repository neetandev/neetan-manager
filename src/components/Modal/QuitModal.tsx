import { Button } from "./Button";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function QuitModal({ open, onClose }: Props) {
  // No-op until Tauri wiring lands; v1 is frontend-only.
  function onQuit() {
    onClose();
  }
  return (
    <Modal
      title="Quit Neetan Manager?"
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onQuit}>Quit</Button>
        </>
      }
    >
      <p>Any unsaved emulator state will be lost. Are you sure you want to quit?</p>
    </Modal>
  );
}
