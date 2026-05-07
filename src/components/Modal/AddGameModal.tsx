import {GameUpsertModal} from "./upsert/GameUpsertModal";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function AddGameModal({open, onClose}: Props) {
    if (!open) return null;
    return <GameUpsertModal mode="add" onClose={onClose}/>;
}
