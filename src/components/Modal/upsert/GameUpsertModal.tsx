import {open as openDialog} from "@tauri-apps/plugin-dialog";
import {
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
    type ChangeEvent,
} from "react";
import {useTranslation} from "react-i18next";
import {useFilteredGames} from "../../../hooks/useFilteredGames";
import {loadGames} from "../../../hooks/useGameLibrary";
import {useSystemDefaults} from "../../../data/systemDefaults";
import {SYSTEMS} from "../../../data/systems";
import {InfoIcon} from "../../../icons/Icons";
import {
    getGameConfig,
    getPortableDirectory,
    setGameConfig,
    upsertGame,
} from "../../../lib/api";
import {
    configValueToFormPatch,
    formToConfigValue,
    formToUpsertDto,
} from "../../../lib/gameSerialization";
import {toRelativeIfInside} from "../../../lib/paths";
import {useAppDispatch, useAppState} from "../../../state/AppContext";
import type {Game, SystemId} from "../../../state/types";
import {Button} from "../Button";
import {Modal} from "../Modal";
import {ConfigFormBody} from "./ConfigFormBody";
import {CreateImageModal} from "./CreateImageModal";
import {FieldLabel} from "./FieldLabel";
import {Section} from "./Section";
import {inferDriveTypeFromPath, newDriveId, resolveEffective} from "./resolve";
import {useStrings} from "./strings";
import type {
    DriveBayKey,
    DriveImage,
    GameUpsertForm,
    UpsertMode,
} from "./types";
import "./upsert.css";

type DriveFilter = { name: string; extensions: string[] };

function buildDriveFilters(t: (key: string) => string): Record<DriveBayKey, DriveFilter[]> {
    const fdd = t("upsert.createImage.filterFdd");
    const hdd = t("upsert.createImage.filterHdd");
    const cue = t("upsert.createImage.filterCue");
    return {
        fdd1: [{name: fdd, extensions: ["d88", "d98", "88d", "98d", "hdm", "nfd"]}],
        fdd2: [{name: fdd, extensions: ["d88", "d98", "88d", "98d", "hdm", "nfd"]}],
        hdd1: [{name: hdd, extensions: ["hdi"]}],
        hdd2: [{name: hdd, extensions: ["hdi"]}],
        cdrom: [{name: cue, extensions: ["cue"]}],
    };
}

type FormAction = { type: "SET"; payload: Partial<GameUpsertForm> };

function reducer(state: GameUpsertForm, action: FormAction): GameUpsertForm {
    return {...state, ...action.payload};
}

function blankForm(system: SystemId): GameUpsertForm {
    return {
        id: null,
        system,
        latin_name: "",
        japanese_name: "",
        developer: "",
        year: null,
        machine: null,
        "cpu-mode": null,
        "force-gdc-clock": null,
        "boot-device": null,
        "aspect-mode": null,
        crt: null,
        "window-mode": null,
        "audio-volume": null,
        soundboard: null,
        "adpcm-ram": null,
        midi: null,
        "mt32-roms": null,
        "sc55-roms": null,
        ems: null,
        xms: null,
        "bios-rom": null,
        "font-rom": null,
        printer: null,
        fdd1: [],
        fdd2: [],
        hdd1: null,
        hdd2: null,
        cdrom: [],
    };
}

function fromGame(game: Game, mode: UpsertMode, duplicateName: string): GameUpsertForm {
    const base = blankForm(game.system);
    return {
        ...base,
        id: mode === "duplicate" ? null : game.id,
        latin_name: mode === "duplicate" ? duplicateName : game.latin_name,
        japanese_name: game.japanese_name,
        developer: game.developer_name,
        year: game.release_year,
    };
}

interface Props {
    mode: UpsertMode;
    onClose: () => void;
}

export function GameUpsertModal({mode, onClose}: Props) {
    const {t} = useTranslation();
    const STRINGS = useStrings();
    const {selected, modalTargetGame, system: currentSystem} = useAppState();
    const {rows} = useFilteredGames();
    const dispatch = useAppDispatch();
    const targetId = modalTargetGame ?? selected;
    const game = useMemo(
        () => (targetId !== null ? rows.find((g) => g.id === targetId) : undefined),
        [targetId, rows],
    );

    const initial = useMemo<GameUpsertForm>(() => {
        if (mode === "add" || !game) return blankForm(currentSystem);
        return fromGame(
            game,
            mode,
            t("upsert.modal.duplicateLatinName", {name: game.latin_name}),
        );
        // duplicateName interpolation depends on game.latin_name; t is a stable hook
        // result, so the deps list ignores it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, game, currentSystem]);

    const [form, formDispatch] = useReducer(reducer, initial);
    const defaults = useSystemDefaults(form.system);

    const [latinError, setLatinError] = useState<string | null>(null);
    const [yearError, setYearError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [configLoadError, setConfigLoadError] = useState<string | null>(null);
    const latinRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    const [subModal, setSubModal] = useState<{
        open: boolean;
        bay: DriveBayKey;
    }>({open: false, bay: "fdd1"});

    const [portableDir, setPortableDir] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const dir = await getPortableDirectory();
                if (!cancelled) setPortableDir(dir);
            } catch {
                // Browse buttons fall back to the OS default starting directory and store
                // the absolute selected path verbatim.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const set = (payload: Partial<GameUpsertForm>) =>
        formDispatch({type: "SET", payload});

    // For edit/duplicate, fetch the persisted per-game config and merge it into the
    // form. Add-mode skips this entirely. The fetch keys on the source game id (not
    // form.id, which is null for duplicate).
    const sourceGameId = mode !== "add" && game ? game.id : null;
    useEffect(() => {
        if (sourceGameId === null) return;
        let cancelled = false;
        setConfigLoadError(null);
        (async () => {
            try {
                const cfg = await getGameConfig(sourceGameId);
                if (cancelled) return;
                const patch = configValueToFormPatch(cfg.value);
                formDispatch({type: "SET", payload: patch});
            } catch (err) {
                if (cancelled) return;
                setConfigLoadError(STRINGS.errors.loadConfigFailed(String(err)));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [sourceGameId]);

    const effectiveMachine = resolveEffective(form, defaults, "machine");

    const systemName =
        SYSTEMS.find((s) => s.id === form.system)?.name ?? form.system;

    const title =
        mode === "add"
            ? STRINGS.modal.titleAdd
            : mode === "edit"
                ? STRINGS.modal.titleEdit
                : STRINGS.modal.titleDuplicate;

    const subline =
        mode === "add"
            ? STRINGS.modal.sublineAdd(systemName)
            : mode === "edit" && game
                ? STRINGS.modal.sublineEdit(game.id, systemName)
                : mode === "duplicate" && game
                    ? STRINGS.modal.sublineDuplicate(game.id, systemName)
                    : "";

    const onSave = async () => {
        let firstError: HTMLElement | null = null;
        if (form.latin_name.trim() === "") {
            setLatinError(STRINGS.validation.latinNameRequired);
            firstError ??= latinRef.current;
        } else {
            setLatinError(null);
        }
        if (form.year === null) {
            setYearError(STRINGS.validation.yearRequired);
            firstError ??= yearRef.current;
        } else if (form.year < 1979 || form.year > 2099) {
            setYearError(STRINGS.validation.yearOutOfRange);
            firstError ??= yearRef.current;
        } else {
            setYearError(null);
        }
        if (firstError) {
            firstError.scrollIntoView({block: "center", behavior: "smooth"});
            firstError.focus();
            return;
        }

        setSaveError(null);
        setSaving(true);
        try {
            const dto = formToUpsertDto(form);
            const id = await upsertGame(dto);
            await setGameConfig(id, {
                schema_version: 1,
                value: formToConfigValue(form),
            });
            await loadGames(dispatch, form.system);
            dispatch({type: "SET_SELECTED", id});
            onClose();
        } catch (err) {
            setSaveError(STRINGS.errors.saveFailed(String(err)));
        } finally {
            setSaving(false);
        }
    };

    const openSubModal = (bay: DriveBayKey) => {
        setSubModal({open: true, bay});
    };

    const closeSubModal = () => {
        setSubModal((s) => ({...s, open: false}));
    };

    const subModalInitialTab: "fdd" | "hdd" =
        subModal.bay === "fdd1" || subModal.bay === "fdd2" ? "fdd" : "hdd";

    const onCreateImage = (image: DriveImage) => {
        const bay = subModal.bay;
        if (bay === "hdd1" || bay === "hdd2") {
            set({[bay]: image} as Partial<GameUpsertForm>);
        } else {
            const list = (form[bay] as DriveImage[]) ?? [];
            set({[bay]: [...list, image]} as Partial<GameUpsertForm>);
        }
    };

    const onAddExisting = async (bay: DriveBayKey) => {
        const result = await openDialog({
            directory: false,
            multiple: false,
            defaultPath: portableDir ?? undefined,
            title: t("upsert.modal.selectImageTitle", {bay}),
            filters: buildDriveFilters(t)[bay],
        });
        if (typeof result !== "string") return;
        const stored = portableDir ? toRelativeIfInside(result, portableDir) : result;
        const image: DriveImage = {
            id: newDriveId(),
            path: stored,
            type: inferDriveTypeFromPath(stored),
        };
        if (bay === "hdd1" || bay === "hdd2") {
            set({[bay]: image} as Partial<GameUpsertForm>);
        } else {
            const list = (form[bay] as DriveImage[]) ?? [];
            set({[bay]: [...list, image]} as Partial<GameUpsertForm>);
        }
    };

    return (
        <>
            <Modal
                title={title}
                subline={subline}
                open={true}
                onClose={onClose}
                size="lg"
                footer={
                    <>
            <span className="modal-footer-info">
              <InfoIcon size={12}/>
                {saveError ? (
                    <span className="modal-footer-error">{saveError}</span>
                ) : configLoadError ? (
                    <span className="modal-footer-error">{configLoadError}</span>
                ) : (
                    STRINGS.modal.footerHint
                )}
            </span>
                        <Button variant="ghost" onClick={onClose} disabled={saving}>
                            {STRINGS.modal.cancel}
                        </Button>
                        <Button variant="primary" onClick={onSave} disabled={saving}>
                            {STRINGS.modal.save}
                        </Button>
                    </>
                }
            >
                {/* ── Metadata ── */}
                <Section title={STRINGS.sections.metadata.title}>
                    <FieldLabel
                        name={STRINGS.fields.system.name}
                        htmlFor="up-system"
                    />
                    <div className="form-cell">
                        <select
                            id="up-system"
                            className="select"
                            value={form.system}
                            onChange={(e) =>
                                set({system: e.target.value as SystemId})
                            }
                            style={{maxWidth: 260}}
                        >
                            {SYSTEMS.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                            <option disabled>{t("comingSoon", {name: "PC-8800"})}</option>
                            <option disabled>{t("comingSoon", {name: "PC-8000"})}</option>
                            <option disabled>{t("comingSoon", {name: "PC-6000"})}</option>
                        </select>
                    </div>

                    <FieldLabel
                        name={STRINGS.fields.latin_name.name}
                        required
                        htmlFor="up-latin"
                    />
                    <div className="form-cell">
                        <input
                            ref={latinRef}
                            id="up-latin"
                            type="text"
                            className={`input${latinError ? " error" : ""}`}
                            value={form.latin_name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                set({latin_name: e.target.value})
                            }
                            aria-describedby={latinError ? "up-latin-err" : undefined}
                        />
                        {latinError && (
                            <div id="up-latin-err" className="field-help error">
                                {latinError}
                            </div>
                        )}
                    </div>

                    <FieldLabel
                        name={STRINGS.fields.japanese_name.name}
                        htmlFor="up-jp"
                    />
                    <div className="form-cell">
                        <input
                            id="up-jp"
                            type="text"
                            className="input jp"
                            value={form.japanese_name}
                            onChange={(e) => set({japanese_name: e.target.value})}
                        />
                    </div>

                    <FieldLabel
                        name={STRINGS.fields.developer.name}
                        htmlFor="up-dev"
                    />
                    <div className="form-cell">
                        <input
                            id="up-dev"
                            type="text"
                            className="input"
                            value={form.developer}
                            onChange={(e) => set({developer: e.target.value})}
                        />
                    </div>

                    <FieldLabel
                        name={STRINGS.fields.year.name}
                        htmlFor="up-year"
                    />
                    <div className="form-cell">
                        <input
                            ref={yearRef}
                            id="up-year"
                            type="number"
                            className={`input input-num${yearError ? " error" : ""}`}
                            min={1979}
                            max={2099}
                            value={form.year ?? ""}
                            onChange={(e) =>
                                set({
                                    year: e.target.value === "" ? null : Number(e.target.value),
                                })
                            }
                            aria-describedby={yearError ? "up-year-err" : undefined}
                        />
                        {yearError && (
                            <div id="up-year-err" className="field-help error">
                                {yearError}
                            </div>
                        )}
                    </div>
                </Section>

                <ConfigFormBody
                    form={form}
                    onChange={set}
                    defaults={defaults}
                    portableDir={portableDir}
                    showDrives={true}
                    defaultLabelMode="system"
                    onCreateImage={openSubModal}
                    onAddExisting={onAddExisting}
                />
            </Modal>

            <CreateImageModal
                open={subModal.open}
                onClose={closeSubModal}
                initialTab={subModalInitialTab}
                resolvedMachine={effectiveMachine}
                portableDir={portableDir}
                onCreate={onCreateImage}
            />
        </>
    );
}
