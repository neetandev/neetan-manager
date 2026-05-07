import {useTranslation} from "react-i18next";
import {Modal} from "./Modal";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function VersionModal({open, onClose}: Props) {
    const {t} = useTranslation();
    return (
        <Modal title={t("version.title")} open={open} onClose={onClose}>
            <dl className="kv">
                <dt>{t("version.appLabel")}</dt>
                <dd>{t("version.appName")}</dd>
                <dt>{t("version.versionLabel")}</dt>
                <dd>{t("version.versionValue")}</dd>
                <dt>{t("version.buildLabel")}</dt>
                <dd>{t("version.buildValue")}</dd>
                <dt>{t("version.engineLabel")}</dt>
                <dd>{t("version.engineValue")}</dd>
                <dt>{t("version.licenseLabel")}</dt>
                <dd>{t("version.licenseValue")}</dd>
            </dl>
        </Modal>
    );
}
