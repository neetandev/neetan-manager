import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function VersionModal({ open, onClose }: Props) {
  return (
    <Modal title="About Neetan Manager" open={open} onClose={onClose}>
      <dl className="kv">
        <dt>App</dt>
        <dd>neetan-manager</dd>
        <dt>Version</dt>
        <dd>0.1.0</dd>
        <dt>Build</dt>
        <dd>prototype</dd>
        <dt>Engine</dt>
        <dd>Tauri 2 · React 19</dd>
        <dt>License</dt>
        <dd>MIT</dd>
      </dl>
    </Modal>
  );
}
