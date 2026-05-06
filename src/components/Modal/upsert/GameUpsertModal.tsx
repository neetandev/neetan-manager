import {
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useFilteredGames } from "../../../hooks/useFilteredGames";
import { InfoIcon } from "../../../icons/Icons";
import { useSystemDefaults } from "../../../data/systemDefaults";
import { DEMO_UPSERT_CONFIGS } from "../../../data/demoUpsertConfigs";
import { SYSTEMS } from "../../../data/systems";
import { useAppDispatch, useAppState } from "../../../state/AppContext";
import type { Game, SystemId } from "../../../state/types";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { ClearablePath } from "./ClearablePath";
import { CreateImageModal } from "./CreateImageModal";
import { DefaultableSelect } from "./DefaultableSelect";
import { DefaultableSlider } from "./DefaultableSlider";
import { FieldLabel } from "./FieldLabel";
import { Section } from "./Section";
import { TriState } from "./TriState";
import { CdromBanner } from "./drives/CdromBanner";
import { DriveListBay } from "./drives/DriveListBay";
import { DriveSingleBay } from "./drives/DriveSingleBay";
import { inferDriveTypeFromPath, isPc9821, newDriveId, resolveEffective } from "./resolve";
import { MACHINE_OPTIONS, STRINGS } from "./strings";
import type {
  DriveBayKey,
  DriveImage,
  GameUpsertForm,
  UpsertMode,
} from "./types";
import "./upsert.css";

type FormAction = { type: "SET"; payload: Partial<GameUpsertForm> };

function reducer(state: GameUpsertForm, action: FormAction): GameUpsertForm {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
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

function fromGame(
  game: Game,
  mode: UpsertMode,
  demo?: Partial<GameUpsertForm>,
): GameUpsertForm {
  const base = blankForm(game.system);
  const merged: GameUpsertForm = {
    ...base,
    id: mode === "duplicate" ? null : game.id,
    latin_name:
      mode === "duplicate" ? `Copy of ${game.latin_name}` : game.latin_name,
    japanese_name: game.japanese_name,
    developer: game.developer_name,
    year: game.release_year,
    ...(demo ?? {}),
  };
  return merged;
}

interface Props {
  mode: UpsertMode;
  onClose: () => void;
}

export function GameUpsertModal({ mode, onClose }: Props) {
  const { selected, system: currentSystem } = useAppState();
  const { rows } = useFilteredGames();
  const dispatch = useAppDispatch();
  const game = useMemo(
    () => (selected !== null ? rows.find((g) => g.id === selected) : undefined),
    [selected, rows],
  );

  const initial = useMemo<GameUpsertForm>(() => {
    if (mode === "add" || !game) return blankForm(currentSystem);
    return fromGame(game, mode, DEMO_UPSERT_CONFIGS[game.id]);
  }, [mode, game, currentSystem]);

  const [form, formDispatch] = useReducer(reducer, initial);
  const defaults = useSystemDefaults(form.system);

  const [latinError, setLatinError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const latinRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const [subModal, setSubModal] = useState<{
    open: boolean;
    bay: DriveBayKey;
  }>({ open: false, bay: "fdd1" });

  const set = (payload: Partial<GameUpsertForm>) =>
    formDispatch({ type: "SET", payload });

  const effectiveMachine = resolveEffective(form, defaults, "machine");
  const effectiveMidi = resolveEffective(form, defaults, "midi");
  const cdromHidden = !isPc9821(effectiveMachine);

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

  const onSave = () => {
    let firstError: HTMLElement | null = null;
    if (form.latin_name.trim() === "") {
      setLatinError(STRINGS.validation.latinNameRequired);
      firstError ??= latinRef.current;
    } else {
      setLatinError(null);
    }
    if (form.year !== null && (form.year < 1979 || form.year > 2099)) {
      setYearError(STRINGS.validation.yearOutOfRange);
      firstError ??= yearRef.current;
    } else {
      setYearError(null);
    }
    if (firstError) {
      firstError.scrollIntoView({ block: "center", behavior: "smooth" });
      firstError.focus();
      return;
    }
    // TODO: persist via Tauri command - see backend spec.
    dispatch({ type: "SET_SELECTED", id: null });
    onClose();
  };

  const openSubModal = (bay: DriveBayKey) => {
    setSubModal({ open: true, bay });
  };

  const closeSubModal = () => {
    setSubModal((s) => ({ ...s, open: false }));
  };

  const subModalInitialTab: "fdd" | "hdd" =
    subModal.bay === "fdd1" || subModal.bay === "fdd2" ? "fdd" : "hdd";

  const onCreateImage = (image: DriveImage) => {
    const bay = subModal.bay;
    if (bay === "hdd1" || bay === "hdd2") {
      set({ [bay]: image } as Partial<GameUpsertForm>);
    } else {
      const list = (form[bay] as DriveImage[]) ?? [];
      set({ [bay]: [...list, image] } as Partial<GameUpsertForm>);
    }
  };

  const addExistingPlaceholder = (bay: DriveBayKey) => {
    // TODO: replace with Tauri open-dialog. For the visual mock, append a fake row.
    const ext =
      bay === "cdrom" ? ".cue" : bay === "hdd1" || bay === "hdd2" ? ".hdi" : ".d88";
    const fakePath = `~/games/picked-image${ext}`;
    const image: DriveImage = {
      id: newDriveId(),
      path: fakePath,
      type: inferDriveTypeFromPath(fakePath),
    };
    if (bay === "hdd1" || bay === "hdd2") {
      set({ [bay]: image } as Partial<GameUpsertForm>);
    } else {
      const list = (form[bay] as DriveImage[]) ?? [];
      set({ [bay]: [...list, image] } as Partial<GameUpsertForm>);
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
              <InfoIcon size={12} />
              {STRINGS.modal.footerHint}
            </span>
            <Button variant="ghost" onClick={onClose}>
              {STRINGS.modal.cancel}
            </Button>
            <Button variant="primary" onClick={onSave}>
              {STRINGS.modal.save}
            </Button>
          </>
        }
      >
        {/* ── Metadata ── */}
        <Section title={STRINGS.sections.metadata.title}>
          <FieldLabel
            name={STRINGS.fields.system.name}
            keyName={STRINGS.fields.system.key}
            htmlFor="up-system"
          />
          <div className="form-cell">
            <select
              id="up-system"
              className="select"
              value={form.system}
              onChange={(e) =>
                set({ system: e.target.value as SystemId })
              }
              style={{ maxWidth: 260 }}
            >
              {SYSTEMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option disabled>PC-8800 (coming soon)</option>
              <option disabled>PC-8000 (coming soon)</option>
              <option disabled>PC-6000 (coming soon)</option>
            </select>
          </div>

          <FieldLabel
            name={STRINGS.fields.latin_name.name}
            keyName={STRINGS.fields.latin_name.key}
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
                set({ latin_name: e.target.value })
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
            keyName={STRINGS.fields.japanese_name.key}
            htmlFor="up-jp"
          />
          <div className="form-cell">
            <input
              id="up-jp"
              type="text"
              className="input jp"
              value={form.japanese_name}
              onChange={(e) => set({ japanese_name: e.target.value })}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields.developer.name}
            keyName={STRINGS.fields.developer.key}
            htmlFor="up-dev"
          />
          <div className="form-cell">
            <input
              id="up-dev"
              type="text"
              className="input"
              value={form.developer}
              onChange={(e) => set({ developer: e.target.value })}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields.year.name}
            keyName={STRINGS.fields.year.key}
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

        {/* ── Machine ── */}
        <Section title={STRINGS.sections.machine.title}>
          <FieldLabel
            name={STRINGS.fields.machine.name}
            keyName={STRINGS.fields.machine.key}
            htmlFor="up-machine"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-machine"
              value={form.machine}
              defaultLabel={defaults.machine}
              fieldName={STRINGS.fields.machine.name}
              onChange={(v) => set({ machine: v })}
              options={MACHINE_OPTIONS}
              maxWidth={420}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields["cpu-mode"].name}
            keyName={STRINGS.fields["cpu-mode"].key}
            htmlFor="up-cpu-mode"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-cpu-mode"
              value={form["cpu-mode"]}
              defaultLabel={defaults["cpu-mode"]}
              fieldName={STRINGS.fields["cpu-mode"].name}
              onChange={(v) => set({ "cpu-mode": v })}
              options={[
                { value: "low", label: "low" },
                { value: "high", label: "high" },
              ]}
              maxWidth={220}
            />
            <div className="field-help">
              {STRINGS.fields["cpu-mode"].help}
            </div>
          </div>

          <FieldLabel
            name={STRINGS.fields["force-gdc-clock"].name}
            keyName={STRINGS.fields["force-gdc-clock"].key}
            htmlFor="up-force-gdc-clock"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-force-gdc-clock"
              value={form["force-gdc-clock"]}
              defaultLabel={defaults["force-gdc-clock"]}
              fieldName={STRINGS.fields["force-gdc-clock"].name}
              onChange={(v) => set({ "force-gdc-clock": v })}
              options={[
                { value: "auto", label: "auto" },
                { value: "2.5", label: "2.5 MHz" },
                { value: "5", label: "5 MHz" },
              ]}
              maxWidth={220}
            />
          </div>
        </Section>

        {/* ── Drives ── */}
        <Section
          title={STRINGS.sections.drives.title}
          desc={STRINGS.sections.drives.desc}
          noGrid
        >
          <div className="drives-wrap">
            <DriveListBay
              bayKey="fdd1"
              display={STRINGS.drives.bayLabels.fdd1.display}
              fieldKey={STRINGS.drives.bayLabels.fdd1.key}
              images={form.fdd1}
              onChange={(next) => set({ fdd1: next })}
              onAddExisting={() => addExistingPlaceholder("fdd1")}
              onCreateNew={() => openSubModal("fdd1")}
            />
            <DriveListBay
              bayKey="fdd2"
              display={STRINGS.drives.bayLabels.fdd2.display}
              fieldKey={STRINGS.drives.bayLabels.fdd2.key}
              images={form.fdd2}
              onChange={(next) => set({ fdd2: next })}
              onAddExisting={() => addExistingPlaceholder("fdd2")}
              onCreateNew={() => openSubModal("fdd2")}
            />
            <DriveSingleBay
              bayKey="hdd1"
              display={STRINGS.drives.bayLabels.hdd1.display}
              fieldKey={STRINGS.drives.bayLabels.hdd1.key}
              image={form.hdd1}
              onChange={(next) => set({ hdd1: next })}
              onAddExisting={() => addExistingPlaceholder("hdd1")}
              onCreateNew={() => openSubModal("hdd1")}
            />
            <DriveSingleBay
              bayKey="hdd2"
              display={STRINGS.drives.bayLabels.hdd2.display}
              fieldKey={STRINGS.drives.bayLabels.hdd2.key}
              image={form.hdd2}
              onChange={(next) => set({ hdd2: next })}
              onAddExisting={() => addExistingPlaceholder("hdd2")}
              onCreateNew={() => openSubModal("hdd2")}
            />
            <DriveListBay
              bayKey="cdrom"
              display={STRINGS.drives.bayLabels.cdrom.display}
              fieldKey={STRINGS.drives.bayLabels.cdrom.key}
              images={form.cdrom}
              onChange={(next) => set({ cdrom: next })}
              onAddExisting={() => addExistingPlaceholder("cdrom")}
              banner={
                cdromHidden ? <CdromBanner machineId={effectiveMachine} /> : null
              }
              hasBanner={cdromHidden}
            />
          </div>
        </Section>

        {/* ── Boot ── */}
        <Section title={STRINGS.sections.boot.title}>
          <FieldLabel
            name={STRINGS.fields["boot-device"].name}
            keyName={STRINGS.fields["boot-device"].key}
            htmlFor="up-boot-device"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-boot-device"
              value={form["boot-device"]}
              defaultLabel={defaults["boot-device"]}
              fieldName={STRINGS.fields["boot-device"].name}
              onChange={(v) => set({ "boot-device": v })}
              options={[
                { value: "auto", label: "auto" },
                { value: "fdd1", label: "fdd1" },
                { value: "fdd2", label: "fdd2" },
                { value: "hdd1", label: "hdd1" },
                { value: "hdd2", label: "hdd2" },
                { value: "os", label: "os" },
              ]}
              maxWidth={220}
            />
            <div className="field-help">
              {STRINGS.fields["boot-device"].help}
            </div>
          </div>
        </Section>

        {/* ── Display ── */}
        <Section title={STRINGS.sections.display.title}>
          <FieldLabel
            name={STRINGS.fields["aspect-mode"].name}
            keyName={STRINGS.fields["aspect-mode"].key}
            htmlFor="up-aspect-mode"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-aspect-mode"
              value={form["aspect-mode"]}
              defaultLabel={defaults["aspect-mode"]}
              fieldName={STRINGS.fields["aspect-mode"].name}
              onChange={(v) => set({ "aspect-mode": v })}
              options={[
                { value: "4:3", label: "4:3" },
                { value: "1:1", label: "1:1" },
              ]}
              maxWidth={220}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields.crt.name}
            keyName={STRINGS.fields.crt.key}
            id="up-crt-label"
          />
          <div className="form-cell">
            <TriState
              value={form.crt}
              ariaLabel={STRINGS.fields.crt.name}
              labelledBy="up-crt-label"
              onChange={(v) => set({ crt: v })}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields["window-mode"].name}
            keyName={STRINGS.fields["window-mode"].key}
            htmlFor="up-window-mode"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-window-mode"
              value={form["window-mode"]}
              defaultLabel={defaults["window-mode"]}
              fieldName={STRINGS.fields["window-mode"].name}
              onChange={(v) => set({ "window-mode": v })}
              options={[
                { value: "windowed", label: "windowed" },
                { value: "fullscreen", label: "fullscreen" },
              ]}
              maxWidth={220}
            />
          </div>
        </Section>

        {/* ── Audio ── */}
        <Section title={STRINGS.sections.audio.title}>
          <FieldLabel
            name={STRINGS.fields["audio-volume"].name}
            keyName={STRINGS.fields["audio-volume"].key}
            htmlFor="up-audio-volume"
          />
          <div className="form-cell">
            <DefaultableSlider
              id="up-audio-volume"
              value={form["audio-volume"]}
              defaultValue={defaults["audio-volume"]}
              min={0}
              max={1}
              step={0.05}
              fieldName={STRINGS.fields["audio-volume"].name}
              onChange={(v) => set({ "audio-volume": v })}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields.soundboard.name}
            keyName={STRINGS.fields.soundboard.key}
            htmlFor="up-soundboard"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-soundboard"
              value={form.soundboard}
              defaultLabel={defaults.soundboard}
              fieldName={STRINGS.fields.soundboard.name}
              onChange={(v) => set({ soundboard: v })}
              options={[
                { value: "none", label: "none" },
                { value: "14", label: "PC-9801-14 (TMS3631)" },
                { value: "26k", label: "PC-9801-26K (OPN)" },
                { value: "86", label: "PC-9801-86 (OPNA)" },
                { value: "86+26k", label: "PC-9801-86 + 26K" },
                { value: "sb16", label: "Sound Blaster 16" },
                { value: "sb16+26k", label: "Sound Blaster 16 + 26K" },
              ]}
              maxWidth={300}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields["adpcm-ram"].name}
            keyName={STRINGS.fields["adpcm-ram"].key}
            id="up-adpcm-ram-label"
          />
          <div className="form-cell">
            <TriState
              value={form["adpcm-ram"]}
              ariaLabel={STRINGS.fields["adpcm-ram"].name}
              labelledBy="up-adpcm-ram-label"
              onChange={(v) => set({ "adpcm-ram": v })}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields.midi.name}
            keyName={STRINGS.fields.midi.key}
            htmlFor="up-midi"
          />
          <div className="form-cell">
            <DefaultableSelect
              id="up-midi"
              value={form.midi}
              defaultLabel={defaults.midi}
              fieldName={STRINGS.fields.midi.name}
              onChange={(v) => set({ midi: v })}
              options={[
                { value: "none", label: "none" },
                { value: "mt32", label: "Roland MT-32" },
                { value: "sc55", label: "Roland SC-55" },
              ]}
              maxWidth={220}
            />
          </div>

          <div className={effectiveMidi === "mt32" ? "" : "muted"}>
            <FieldLabel
              name={STRINGS.fields["mt32-roms"].name}
              keyName={STRINGS.fields["mt32-roms"].key}
              htmlFor="up-mt32-roms"
            />
          </div>
          <div className={`form-cell${effectiveMidi === "mt32" ? "" : " muted"}`}>
            <ClearablePath
              id="up-mt32-roms"
              value={form["mt32-roms"]}
              fieldName={STRINGS.fields["mt32-roms"].name}
              onChange={(v) => set({ "mt32-roms": v })}
              disabled={effectiveMidi !== "mt32"}
            />
          </div>

          <div className={effectiveMidi === "sc55" ? "" : "muted"}>
            <FieldLabel
              name={STRINGS.fields["sc55-roms"].name}
              keyName={STRINGS.fields["sc55-roms"].key}
              htmlFor="up-sc55-roms"
            />
          </div>
          <div className={`form-cell${effectiveMidi === "sc55" ? "" : " muted"}`}>
            <ClearablePath
              id="up-sc55-roms"
              value={form["sc55-roms"]}
              fieldName={STRINGS.fields["sc55-roms"].name}
              onChange={(v) => set({ "sc55-roms": v })}
              disabled={effectiveMidi !== "sc55"}
            />
          </div>
        </Section>

        {/* ── Memory ── */}
        <Section title={STRINGS.sections.memory.title}>
          <FieldLabel
            name={STRINGS.fields.ems.name}
            keyName={STRINGS.fields.ems.key}
            id="up-ems-label"
          />
          <div className="form-cell">
            <TriState
              value={form.ems}
              ariaLabel={STRINGS.fields.ems.name}
              labelledBy="up-ems-label"
              onChange={(v) => set({ ems: v })}
            />
          </div>

          <FieldLabel
            name={STRINGS.fields.xms.name}
            keyName={STRINGS.fields.xms.key}
            id="up-xms-label"
          />
          <div className="form-cell">
            <TriState
              value={form.xms}
              ariaLabel={STRINGS.fields.xms.name}
              labelledBy="up-xms-label"
              onChange={(v) => set({ xms: v })}
            />
          </div>
        </Section>

        {/* ── ROM overrides ── */}
        <Section
          title={STRINGS.sections.rom.title}
          desc={STRINGS.sections.rom.desc}
        >
          <FieldLabel
            name={STRINGS.fields["bios-rom"].name}
            keyName={STRINGS.fields["bios-rom"].key}
            htmlFor="up-bios-rom"
          />
          <div className="form-cell">
            <ClearablePath
              id="up-bios-rom"
              value={form["bios-rom"]}
              placeholder={STRINGS.defaultable.biosDefault}
              fieldName={STRINGS.fields["bios-rom"].name}
              onChange={(v) => set({ "bios-rom": v })}
            />
            <div className="field-help">
              {STRINGS.fields["bios-rom"].help}
            </div>
          </div>

          <FieldLabel
            name={STRINGS.fields["font-rom"].name}
            keyName={STRINGS.fields["font-rom"].key}
            htmlFor="up-font-rom"
          />
          <div className="form-cell">
            <ClearablePath
              id="up-font-rom"
              value={form["font-rom"]}
              placeholder={STRINGS.defaultable.fontDefault}
              fieldName={STRINGS.fields["font-rom"].name}
              onChange={(v) => set({ "font-rom": v })}
            />
            <div className="field-help">
              {STRINGS.fields["font-rom"].help}
            </div>
          </div>
        </Section>

        {/* ── Other ── */}
        <Section title={STRINGS.sections.other.title}>
          <FieldLabel
            name={STRINGS.fields.printer.name}
            keyName={STRINGS.fields.printer.key}
            htmlFor="up-printer"
          />
          <div className="form-cell">
            <ClearablePath
              id="up-printer"
              value={form.printer}
              fieldName={STRINGS.fields.printer.name}
              onChange={(v) => set({ printer: v })}
            />
            <div className="field-help">{STRINGS.fields.printer.help}</div>
          </div>
        </Section>
      </Modal>

      <CreateImageModal
        open={subModal.open}
        onClose={closeSubModal}
        initialTab={subModalInitialTab}
        resolvedMachine={effectiveMachine}
        onCreate={onCreateImage}
      />
    </>
  );
}
