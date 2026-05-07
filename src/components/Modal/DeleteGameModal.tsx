import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useFilteredGames} from "../../hooks/useFilteredGames";
import {loadGames} from "../../hooks/useGameLibrary";
import {deleteGame} from "../../lib/api";
import {useAppDispatch, useAppState} from "../../state/AppContext";
import {Button} from "./Button";
import {Modal} from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function DeleteGameModal({open, onClose}: Props) {
    const {t} = useTranslation();
    const {selected, modalTargetGame, system} = useAppState();
    const {rows} = useFilteredGames();
    const dispatch = useAppDispatch();
    const targetId = modalTargetGame ?? selected;
    const selectedRow = rows.find((g) => g.id === targetId);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    if (!selectedRow) return null;

    const onConfirm = async () => {
        setError(null);
        setDeleting(true);
        try {
            await deleteGame(selectedRow.id);
            await loadGames(dispatch, system);
            dispatch({type: "SET_SELECTED", id: null});
            onClose();
        } catch (err) {
            setError(t("deleteModal.failed", {error: String(err)}));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            title={t("deleteModal.title")}
            open={open}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={deleting}>
                        {t("common.cancel")}
                    </Button>
                    <Button variant="primary" onClick={onConfirm} disabled={deleting}>
                        {t("common.delete")}
                    </Button>
                </>
            }
        >
            <p>
                {t("deleteModal.bodyPrefix")}<strong>{selectedRow.latin_name}</strong>
                {t("deleteModal.bodySuffix")}
            </p>
            {error && <p className="field-help error">{error}</p>}
        </Modal>
    );
}
