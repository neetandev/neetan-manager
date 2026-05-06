import { useFilteredGames } from "../../hooks/useFilteredGames";
import { useAppDispatch, useAppState } from "../../state/AppContext";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DeleteGameModal({ open, onClose }: Props) {
  const { selected } = useAppState();
  const { rows } = useFilteredGames();
  const dispatch = useAppDispatch();
  const selectedRow = rows.find((g) => g.id === selected);

  if (!selectedRow) return null;

  const onConfirm = () => {
    dispatch({ type: "SET_SELECTED", id: null });
    onClose();
  };

  return (
    <Modal
      title="Delete game"
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p>
        Remove <strong>{selectedRow.latin_name}</strong> from the library? The ROM
        file is not deleted from disk.
      </p>
    </Modal>
  );
}
