import {ClearablePath, type PickerOptions} from "./ClearablePath";
import type {DefaultLabelMode} from "./ControlRow";
import {DefaultableSelect} from "./DefaultableSelect";
import {DefaultableSlider} from "./DefaultableSlider";
import {FieldLabel} from "./FieldLabel";
import {Section} from "./Section";
import {TriState} from "./TriState";
import {CdromBanner} from "./drives/CdromBanner";
import {DriveListBay} from "./drives/DriveListBay";
import {DriveSingleBay} from "./drives/DriveSingleBay";
import {isPc9821, resolveEffective} from "./resolve";
import {MACHINE_OPTIONS, useStrings} from "./strings";
import type {
    DriveBayKey,
    GameUpsertForm,
    SystemDefaults,
} from "./types";

const ROM_FILE_PICKER: PickerOptions = {
    kind: "file",
    filters: [{name: "ROM file", extensions: ["rom", "bin"]}],
};
const DIRECTORY_PICKER: PickerOptions = {kind: "directory"};
const PRINTER_FILE_PICKER: PickerOptions = {kind: "file"};

interface Props {
    form: GameUpsertForm;
    onChange: (patch: Partial<GameUpsertForm>) => void;
    defaults: SystemDefaults;
    portableDir: string | null;
    showDrives: boolean;
    defaultLabelMode: DefaultLabelMode;
    onCreateImage?: (bay: DriveBayKey) => void;
    onAddExisting?: (bay: DriveBayKey) => Promise<void> | void;
}

export function ConfigFormBody({
                                   form,
                                   onChange: set,
                                   defaults,
                                   portableDir,
                                   showDrives,
                                   defaultLabelMode,
                                   onCreateImage,
                                   onAddExisting,
                               }: Props) {
    const STRINGS = useStrings();
    const effectiveMachine = resolveEffective(form, defaults, "machine");
    const cdromHidden = !isPc9821(effectiveMachine);

    const isEmulatorMode = defaultLabelMode === "emulator";
    const biosPlaceholder = isEmulatorMode
        ? STRINGS.defaultable.biosDefault_emulator
        : STRINGS.defaultable.biosDefault;
    const fontPlaceholder = isEmulatorMode
        ? STRINGS.defaultable.fontDefault_emulator
        : STRINGS.defaultable.fontDefault;
    const biosHelp = isEmulatorMode
        ? STRINGS.fields["bios-rom"].help_emulator
        : STRINGS.fields["bios-rom"].help;
    const fontHelp = isEmulatorMode
        ? STRINGS.fields["font-rom"].help_emulator
        : STRINGS.fields["font-rom"].help;
    const printerHelp = isEmulatorMode
        ? STRINGS.fields.printer.help_emulator
        : STRINGS.fields.printer.help;

    return (
        <>
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
                        onChange={(v) => set({machine: v})}
                        options={MACHINE_OPTIONS}
                        maxWidth={420}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({"cpu-mode": v})}
                        options={[
                            {value: "low", label: "low"},
                            {value: "high", label: "high"},
                        ]}
                        maxWidth={220}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({"force-gdc-clock": v})}
                        options={[
                            {value: "auto", label: "auto"},
                            {value: "2.5", label: "2.5 MHz"},
                            {value: "5", label: "5 MHz"},
                        ]}
                        maxWidth={220}
                        defaultLabelMode={defaultLabelMode}
                    />
                </div>
            </Section>

            {/* ── Drives ── */}
            {showDrives && (
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
                            onChange={(next) => set({fdd1: next})}
                            onAddExisting={() => onAddExisting?.("fdd1")}
                            onCreateNew={() => onCreateImage?.("fdd1")}
                        />
                        <DriveListBay
                            bayKey="fdd2"
                            display={STRINGS.drives.bayLabels.fdd2.display}
                            fieldKey={STRINGS.drives.bayLabels.fdd2.key}
                            images={form.fdd2}
                            onChange={(next) => set({fdd2: next})}
                            onAddExisting={() => onAddExisting?.("fdd2")}
                            onCreateNew={() => onCreateImage?.("fdd2")}
                        />
                        <DriveSingleBay
                            bayKey="hdd1"
                            display={STRINGS.drives.bayLabels.hdd1.display}
                            fieldKey={STRINGS.drives.bayLabels.hdd1.key}
                            image={form.hdd1}
                            onChange={(next) => set({hdd1: next})}
                            onAddExisting={() => onAddExisting?.("hdd1")}
                            onCreateNew={() => onCreateImage?.("hdd1")}
                        />
                        <DriveSingleBay
                            bayKey="hdd2"
                            display={STRINGS.drives.bayLabels.hdd2.display}
                            fieldKey={STRINGS.drives.bayLabels.hdd2.key}
                            image={form.hdd2}
                            onChange={(next) => set({hdd2: next})}
                            onAddExisting={() => onAddExisting?.("hdd2")}
                            onCreateNew={() => onCreateImage?.("hdd2")}
                        />
                        <DriveListBay
                            bayKey="cdrom"
                            display={STRINGS.drives.bayLabels.cdrom.display}
                            fieldKey={STRINGS.drives.bayLabels.cdrom.key}
                            images={form.cdrom}
                            onChange={(next) => set({cdrom: next})}
                            onAddExisting={() => onAddExisting?.("cdrom")}
                            banner={
                                cdromHidden ? <CdromBanner machineId={effectiveMachine}/> : null
                            }
                        />
                    </div>
                </Section>
            )}

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
                        onChange={(v) => set({"boot-device": v})}
                        options={[
                            {value: "auto", label: "auto"},
                            {value: "fdd1", label: "fdd1"},
                            {value: "fdd2", label: "fdd2"},
                            {value: "hdd1", label: "hdd1"},
                            {value: "hdd2", label: "hdd2"},
                            {value: "os", label: "os"},
                        ]}
                        maxWidth={220}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({"aspect-mode": v})}
                        options={[
                            {value: "4:3", label: "4:3"},
                            {value: "1:1", label: "1:1"},
                        ]}
                        maxWidth={220}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({crt: v})}
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
                        onChange={(v) => set({"window-mode": v})}
                        options={[
                            {value: "windowed", label: "windowed"},
                            {value: "fullscreen", label: "fullscreen"},
                        ]}
                        maxWidth={220}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({"audio-volume": v})}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({soundboard: v})}
                        options={[
                            {value: "none", label: "none"},
                            {value: "14", label: "PC-9801-14 (TMS3631)"},
                            {value: "26k", label: "PC-9801-26K (OPN)"},
                            {value: "86", label: "PC-9801-86 (OPNA)"},
                            {value: "86+26k", label: "PC-9801-86 + 26K"},
                            {value: "sb16", label: "Sound Blaster 16"},
                            {value: "sb16+26k", label: "Sound Blaster 16 + 26K"},
                        ]}
                        maxWidth={300}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({"adpcm-ram": v})}
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
                        onChange={(v) => set({midi: v})}
                        options={[
                            {value: "none", label: "none"},
                            {value: "mt32", label: "Roland MT-32"},
                            {value: "sc55", label: "Roland SC-55"},
                        ]}
                        maxWidth={220}
                        defaultLabelMode={defaultLabelMode}
                    />
                </div>

                <FieldLabel
                    name={STRINGS.fields["mt32-roms"].name}
                    keyName={STRINGS.fields["mt32-roms"].key}
                    htmlFor="up-mt32-roms"
                />
                <div className="form-cell">
                    <ClearablePath
                        id="up-mt32-roms"
                        value={form["mt32-roms"]}
                        fieldName={STRINGS.fields["mt32-roms"].name}
                        onChange={(v) => set({"mt32-roms": v})}
                        pickerOptions={DIRECTORY_PICKER}
                        portableDir={portableDir}
                        defaultLabelMode={defaultLabelMode}
                    />
                </div>

                <FieldLabel
                    name={STRINGS.fields["sc55-roms"].name}
                    keyName={STRINGS.fields["sc55-roms"].key}
                    htmlFor="up-sc55-roms"
                />
                <div className="form-cell">
                    <ClearablePath
                        id="up-sc55-roms"
                        value={form["sc55-roms"]}
                        fieldName={STRINGS.fields["sc55-roms"].name}
                        onChange={(v) => set({"sc55-roms": v})}
                        pickerOptions={DIRECTORY_PICKER}
                        portableDir={portableDir}
                        defaultLabelMode={defaultLabelMode}
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
                        onChange={(v) => set({ems: v})}
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
                        onChange={(v) => set({xms: v})}
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
                        placeholder={biosPlaceholder}
                        fieldName={STRINGS.fields["bios-rom"].name}
                        onChange={(v) => set({"bios-rom": v})}
                        pickerOptions={ROM_FILE_PICKER}
                        portableDir={portableDir}
                        defaultLabelMode={defaultLabelMode}
                    />
                    <div className="field-help">{biosHelp}</div>
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
                        placeholder={fontPlaceholder}
                        fieldName={STRINGS.fields["font-rom"].name}
                        onChange={(v) => set({"font-rom": v})}
                        pickerOptions={ROM_FILE_PICKER}
                        portableDir={portableDir}
                        defaultLabelMode={defaultLabelMode}
                    />
                    <div className="field-help">{fontHelp}</div>
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
                        onChange={(v) => set({printer: v})}
                        pickerOptions={PRINTER_FILE_PICKER}
                        portableDir={portableDir}
                        defaultLabelMode={defaultLabelMode}
                    />
                    <div className="field-help">{printerHelp}</div>
                </div>
            </Section>
        </>
    );
}
