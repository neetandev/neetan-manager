import {GameUpsertModal} from "./upsert/GameUpsertModal";

interface Props {
    open: boolean;
    onClose: () => void;
}

// No toolbar entry point in v1; the modal kind is wired so adding a Duplicate
// button later is a one-line change.
export function DuplicateGameModal({open, onClose}: Props) {
    if (!open) return null;
    return <GameUpsertModal mode="duplicate" onClose={onClose}/>;
}
