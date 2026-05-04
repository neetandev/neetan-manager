import { useAppState } from "../../state/AppContext";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const { theme, system } = useAppState();
  return (
    <Modal title="Settings" open={open} onClose={onClose}>
      <div className="kv-rows">
        <div className="kv-row">
          <span className="label">Theme</span>
          <span className="value">{theme}</span>
        </div>
        <div className="kv-row">
          <span className="label">Default system</span>
          <span className="value">{system}</span>
        </div>
        <div className="kv-row">
          <span className="label">ROM directory</span>
          <span className="value">~/Games/NEC</span>
        </div>
        <div className="kv-row">
          <span className="label">Save state directory</span>
          <span className="value">~/Library/Neetan/saves</span>
        </div>
        <div className="kv-row">
          <span className="label">Audio sample rate</span>
          <span className="value">48000 Hz</span>
        </div>
        <div className="kv-row">
          <span className="label">Frame skip</span>
          <span className="value">0</span>
        </div>
      </div>
    </Modal>
  );
}
