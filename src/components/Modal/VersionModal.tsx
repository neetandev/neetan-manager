import {useTranslation} from "react-i18next";
import {useAppVersion} from "../../hooks/useAppVersion";
import {Modal} from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function VersionModal({open, onClose}: Props) {
    const {t} = useTranslation();
    const version = useAppVersion();
    return (
        <Modal title={t("version.title")} open={open} onClose={onClose}>
            <dl className="kv">
                <dt>{t("version.appLabel")}</dt>
                <dd>{t("version.appName")}</dd>
                <dt>{t("version.versionLabel")}</dt>
                <dd>{version ?? t("common.loadingLower")}</dd>
                <dt>{t("version.licenseLabel")}</dt>
                <dd>{t("version.licenseValue")}</dd>
            </dl>
        </Modal>
    );
}
