import {save} from "@tauri-apps/plugin-dialog";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {createDiskImage} from "../../../lib/api";
import {toRelativeIfInside} from "../../../lib/paths";
import {Button} from "../Button";
import {Modal} from "../Modal";
import {defaultHddPreset, inferDriveTypeFromPath, newDriveId} from "./resolve";
import {
    FDD_PRESETS,
    HDD_PRESETS_IDE,
    HDD_PRESETS_SASI,
    useStrings,
} from "./strings";
import type {DriveImage} from "./types";

type Tab = "fdd" | "hdd";

interface Props {
    open: boolean;
    onClose: () => void;
    initialTab: Tab;
    resolvedMachine: string;
    portableDir: string | null;
    onCreate: (image: DriveImage, tab: Tab) => void;
}

function isAbsolutePath(path: string): boolean {
    if (path.startsWith("/")) return true;
    if (path.startsWith("\\")) return true;
    return /^[A-Za-z]:[\\/]/.test(path);
}

function joinPath(dir: string, name: string): string {
    const sep = dir.includes("\\") && !dir.includes("/") ? "\\" : "/";
    if (dir.endsWith("/") || dir.endsWith("\\")) return dir + name;
    return dir + sep + name;
}

export function CreateImageModal({
                                     open,
                                     onClose,
                                     initialTab,
                                     resolvedMachine,
                                     portableDir,
                                     onCreate,
                                 }: Props) {
    const {t} = useTranslation();
    const STRINGS = useStrings();
    const [tab, setTab] = useState<Tab>(initialTab);
    const [fddPreset, setFddPreset] = useState<string>("2hd");
    const [hddPreset, setHddPreset] = useState<string>(
        defaultHddPreset(resolvedMachine),
    );
    const [filename, setFilename] = useState<string>(
        STRINGS.createImage.defaultFilenameFdd,
    );
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setTab(initialTab);
        setHddPreset(defaultHddPreset(resolvedMachine));
        setFddPreset("2hd");
        setFilename(
            initialTab === "fdd"
                ? STRINGS.createImage.defaultFilenameFdd
                : STRINGS.createImage.defaultFilenameHdd,
        );
        setError(null);
        setCreating(false);
    }, [open, initialTab, resolvedMachine]);

    const onChangeTab = (next: Tab) => {
        setTab(next);
        if (next === "fdd" && !filename.toLowerCase().endsWith(".d88")) {
            setFilename(STRINGS.createImage.defaultFilenameFdd);
        } else if (next === "hdd" && !filename.toLowerCase().endsWith(".hdi")) {
            setFilename(STRINGS.createImage.defaultFilenameHdd);
        }
    };

    const onBrowse = async () => {
        const filters =
            tab === "fdd"
                ? [{name: t("upsert.createImage.filterFdd"), extensions: ["d88"]}]
                : [{name: t("upsert.createImage.filterHdd"), extensions: ["hdi"]}];
        const seed = isAbsolutePath(filename)
            ? filename
            : portableDir
                ? joinPath(portableDir, filename)
                : filename;
        const result = await save({
            title: STRINGS.createImage.saveDialogTitle,
            defaultPath: seed,
            filters,
        });
        if (typeof result === "string") {
            setFilename(result);
        }
    };

    const onConfirm = async () => {
        setError(null);
        const trimmed = filename.trim();
        if (trimmed === "") {
            setError(STRINGS.createImage.errors.filenameRequired);
            return;
        }
        const absolute = isAbsolutePath(trimmed)
            ? trimmed
            : portableDir
                ? joinPath(portableDir, trimmed)
                : trimmed;
        const preset = tab === "fdd" ? fddPreset : hddPreset;

        setCreating(true);
        try {
            await createDiskImage(tab, absolute, preset);
            const stored = portableDir
                ? toRelativeIfInside(absolute, portableDir)
                : absolute;
            const image: DriveImage = {
                id: newDriveId(),
                path: stored,
                type: inferDriveTypeFromPath(stored),
            };
            onCreate(image, tab);
            onClose();
        } catch (err) {
            setError(STRINGS.createImage.errors.createFailed(String(err)));
        } finally {
            setCreating(false);
        }
    };

    return (
        <Modal
            title={STRINGS.createImage.title}
            open={open}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={creating}>
                        {STRINGS.createImage.cancel}
                    </Button>
                    <Button variant="primary" onClick={onConfirm} disabled={creating}>
                        {STRINGS.createImage.create}
                    </Button>
                </>
            }
        >
            <div className="submodal-tabs">
                <button
                    type="button"
                    className={`submodal-tab${tab === "fdd" ? " on" : ""}`}
                    onClick={() => onChangeTab("fdd")}
                    disabled={creating}
                >
                    {STRINGS.createImage.tabs.fdd}
                </button>
                <button
                    type="button"
                    className={`submodal-tab${tab === "hdd" ? " on" : ""}`}
                    onClick={() => onChangeTab("hdd")}
                    disabled={creating}
                >
                    {STRINGS.createImage.tabs.hdd}
                </button>
            </div>

            <div className="submodal-body">
                <div className="form-cell">
                    <label className="field-name">{STRINGS.createImage.output}</label>
                    <div className="path-row">
                        <input
                            type="text"
                            className="input mono"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            disabled={creating}
                        />
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={onBrowse}
                            disabled={creating}
                        >
                            {STRINGS.createImage.browse}
                        </button>
                    </div>
                </div>

                <div className="form-cell">
                    <label className="field-name">{STRINGS.createImage.diskType}</label>
                    {tab === "fdd" ? (
                        <div className="preset-grid">
                            {FDD_PRESETS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`preset${fddPreset === p.id ? " on" : ""}`}
                                    onClick={() => setFddPreset(p.id)}
                                    disabled={creating}
                                >
                                    <span className="preset-name">{p.label}</span>
                                    <span className="preset-detail">{p.detail}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="preset-grid three">
                            <div className="preset-group-label">
                                {STRINGS.createImage.sasiGroup}
                            </div>
                            {HDD_PRESETS_SASI.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`preset${hddPreset === p.id ? " on" : ""}`}
                                    onClick={() => setHddPreset(p.id)}
                                    disabled={creating}
                                >
                                    <span className="preset-name">{p.label}</span>
                                    <span className="preset-detail">{p.detail}</span>
                                </button>
                            ))}
                            <div className="preset-group-label">
                                {STRINGS.createImage.ideGroup}
                            </div>
                            {HDD_PRESETS_IDE.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`preset${hddPreset === p.id ? " on" : ""}`}
                                    onClick={() => setHddPreset(p.id)}
                                    disabled={creating}
                                >
                                    <span className="preset-name">{p.label}</span>
                                    <span className="preset-detail">{p.detail}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className="field-help error">{error}</p>}
            </div>
        </Modal>
    );
}
