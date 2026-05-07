import {useEffect, useReducer, useState} from "react";
import {EMULATOR_DEFAULTS} from "../../data/systemDefaults";
import {SYSTEMS} from "../../data/systems";
import {InfoIcon} from "../../icons/Icons";
import {
    getPortableDirectory,
    getSystemConfig,
    setSystemConfig,
} from "../../lib/api";
import {
    configValueToFormPatch,
    formToConfigValue,
} from "../../lib/gameSerialization";
import {useAppDispatch} from "../../state/AppContext";
import type {SystemId} from "../../state/types";
import {Button} from "./Button";
import {Modal} from "./Modal";
import {ConfigFormBody} from "./upsert/ConfigFormBody";
import {useStrings} from "./upsert/strings";
import type {GameUpsertForm} from "./upsert/types";

type FormAction =
    | { type: "SET"; payload: Partial<GameUpsertForm> }
    | { type: "RESET"; payload: GameUpsertForm };

function reducer(state: GameUpsertForm, action: FormAction): GameUpsertForm {
    switch (action.type) {
        case "SET":
            return {...state, ...action.payload};
        case "RESET":
            return action.payload;
        default: {
            const _exhaustive: never = action;
            throw new Error(`Unhandled action: ${JSON.stringify(_exhaustive)}`);
        }
    }
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

interface Props {
    open: boolean;
    system: SystemId | null;
    onClose: () => void;
}

export function SystemConfigModal({open, system, onClose}: Props) {
    if (!open || !system) return null;
    return <Inner system={system} onClose={onClose}/>;
}

function Inner({system, onClose}: { system: SystemId; onClose: () => void }) {
    const STRINGS = useStrings();
    const dispatch = useAppDispatch();
    const [form, formDispatch] = useReducer(reducer, system, blankForm);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [portableDir, setPortableDir] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const dir = await getPortableDirectory();
                if (!cancelled) setPortableDir(dir);
            } catch {
                // browse buttons fall back to OS default
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoadError(null);
        formDispatch({type: "RESET", payload: blankForm(system)});
        (async () => {
            try {
                const cfg = await getSystemConfig(system);
                if (cancelled) return;
                const patch = configValueToFormPatch(cfg.value);
                formDispatch({type: "SET", payload: patch});
            } catch (err) {
                if (cancelled) return;
                setLoadError(STRINGS.errors.loadConfigFailed(String(err)));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [system]);

    const set = (payload: Partial<GameUpsertForm>) =>
        formDispatch({type: "SET", payload});

    const systemName = SYSTEMS.find((s) => s.id === system)?.name ?? system;

    const onSave = async () => {
        setSaveError(null);
        setSaving(true);
        try {
            await setSystemConfig(system, {
                schema_version: 1,
                value: formToConfigValue(form),
            });
            dispatch({type: "BUMP_SYSTEM_CONFIG"});
            onClose();
        } catch (err) {
            setSaveError(STRINGS.errors.saveFailed(String(err)));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={STRINGS.systemModal.title(systemName)}
            subline={STRINGS.systemModal.subline}
            open={true}
            onClose={onClose}
            size="lg"
            footer={
                <>
          <span className="modal-footer-info">
            <InfoIcon size={12}/>
              {saveError ? (
                  <span className="modal-footer-error">{saveError}</span>
              ) : loadError ? (
                  <span className="modal-footer-error">{loadError}</span>
              ) : (
                  STRINGS.systemModal.footerHint
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
            <ConfigFormBody
                form={form}
                onChange={set}
                defaults={EMULATOR_DEFAULTS}
                portableDir={portableDir}
                showDrives={false}
                defaultLabelMode="emulator"
            />
        </Modal>
    );
}
