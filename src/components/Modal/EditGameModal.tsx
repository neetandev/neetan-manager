import { GameUpsertModal } from "./upsert/GameUpsertModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EditGameModal({ open, onClose }: Props) {
  if (!open) return null;
  return <GameUpsertModal mode="edit" onClose={onClose} />;
}
