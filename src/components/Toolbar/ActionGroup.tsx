import {useTranslation} from "react-i18next";
import {CopyIcon, PencilIcon, PlusIcon, TrashIcon} from "../../icons/Icons";
import {useAppDispatch, useAppState} from "../../state/AppContext";

export function ActionGroup() {
    const {t} = useTranslation();
    const {selected} = useAppState();
    const dispatch = useAppDispatch();
    const hasSelection = selected !== null;
    const open = (kind: "add" | "edit" | "duplicate" | "delete") =>
        dispatch({type: "OPEN_MODAL", kind});

    return (
        <div className="action-group" role="group" aria-label={t("toolbar.actionsAriaLabel")}>
            <button
                type="button"
                className="action-btn"
                onClick={() => open("add")}
                title={t("toolbar.addTitle")}
            >
                <PlusIcon size={13}/>
                <span>{t("toolbar.addLabel")}</span>
            </button>
            <button
                type="button"
                className="action-btn"
                onClick={() => open("edit")}
                disabled={!hasSelection}
                title={hasSelection ? t("toolbar.editTitleEnabled") : t("toolbar.editTitleDisabled")}
            >
                <PencilIcon size={13}/>
                <span>{t("toolbar.editLabel")}</span>
            </button>
            <button
                type="button"
                className="action-btn"
                onClick={() => open("duplicate")}
                disabled={!hasSelection}
                title={
                    hasSelection
                        ? t("toolbar.duplicateTitleEnabled")
                        : t("toolbar.duplicateTitleDisabled")
                }
            >
                <CopyIcon size={13}/>
                <span>{t("toolbar.duplicateLabel")}</span>
            </button>
            <span className="action-sep" aria-hidden="true"/>
            <button
                type="button"
                className="action-btn action-btn-danger"
                onClick={() => open("delete")}
                disabled={!hasSelection}
                title={
                    hasSelection
                        ? t("toolbar.deleteTitleEnabled")
                        : t("toolbar.deleteTitleDisabled")
                }
            >
                <TrashIcon size={13}/>
                <span>{t("toolbar.deleteLabel")}</span>
            </button>
        </div>
    );
}
