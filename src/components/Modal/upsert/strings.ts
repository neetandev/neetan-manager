import {useTranslation} from "react-i18next";

/**
 * Returns the localized strings used by the upsert/system-config form. Shape mirrors the prior
 * `STRINGS` constant so call sites change minimally - they just call this hook at the top of the
 * component and use the result the same way they used the constant.
 *
 * Tech-spec presets and machine option lists below this hook stay as plain constants - their
 * labels are model numbers and storage specs, not natural-language chrome.
 */
export function useStrings() {
    const {t} = useTranslation();
    return {
        modal: {
            titleAdd: t("upsert.modal.titleAdd"),
            titleEdit: t("upsert.modal.titleEdit"),
            titleDuplicate: t("upsert.modal.titleDuplicate"),
            sublineAdd: (system: string) => t("upsert.modal.sublineAdd", {system}),
            sublineEdit: (id: number, system: string) =>
                t("upsert.modal.sublineEdit", {id, system}),
            sublineDuplicate: (id: number, system: string) =>
                t("upsert.modal.sublineDuplicate", {id, system}),
            footerHint: t("upsert.modal.footerHint"),
            cancel: t("upsert.modal.cancel"),
            save: t("upsert.modal.save"),
        },
        sections: {
            metadata: {title: t("upsert.sections.metadata"), desc: ""},
            machine: {title: t("upsert.sections.machine"), desc: ""},
            drives: {
                title: t("upsert.sections.drives"),
                desc: t("upsert.sections.drivesDesc"),
            },
            boot: {title: t("upsert.sections.boot"), desc: ""},
            display: {title: t("upsert.sections.display"), desc: ""},
            audio: {title: t("upsert.sections.audio"), desc: ""},
            memory: {title: t("upsert.sections.memory"), desc: ""},
            rom: {
                title: t("upsert.sections.rom"),
                desc: t("upsert.sections.romDesc"),
            },
            other: {title: t("upsert.sections.other"), desc: ""},
        },
        defaultable: {
            paren: (label: string) => t("upsert.defaultable.paren", {label}),
            paren_no_value: t("upsert.defaultable.parenNoValue"),
            fontDefault: t("upsert.defaultable.fontDefault"),
            biosDefault: t("upsert.defaultable.biosDefault"),
            resetTitle: t("upsert.defaultable.resetTitle"),
            resetLabel: t("upsert.defaultable.resetLabel"),
            clearTitle: t("upsert.defaultable.clearTitle"),
            paren_emulator: (label: string) =>
                t("upsert.defaultable.parenEmulator", {label}),
            paren_no_value_emulator: t("upsert.defaultable.parenNoValueEmulator"),
            fontDefault_emulator: t("upsert.defaultable.fontDefaultEmulator"),
            biosDefault_emulator: t("upsert.defaultable.biosDefaultEmulator"),
            resetTitle_emulator: t("upsert.defaultable.resetTitleEmulator"),
            clearTitle_emulator: t("upsert.defaultable.clearTitleEmulator"),
        },
        systemModal: {
            title: (system: string) => t("upsert.systemModal.title", {system}),
            subline: t("upsert.systemModal.subline"),
            footerHint: t("upsert.systemModal.footerHint"),
        },
        tri: {
            default: t("upsert.tri.default"),
            on: t("upsert.tri.on"),
            off: t("upsert.tri.off"),
        },
        fields: {
            system: {name: t("upsert.fields.system"), key: "system"},
            latin_name: {name: t("upsert.fields.latin_name"), key: "latin_name"},
            japanese_name: {name: t("upsert.fields.japanese_name"), key: "japanese_name"},
            developer: {name: t("upsert.fields.developer"), key: "developer"},
            year: {name: t("upsert.fields.year"), key: "year"},
            machine: {name: t("upsert.fields.machine"), key: "machine"},
            "cpu-mode": {
                name: t("upsert.fields.cpu-mode"),
                key: "cpu-mode",
                help: t("upsert.fields.cpu-mode-help"),
            },
            "force-gdc-clock": {
                name: t("upsert.fields.force-gdc-clock"),
                key: "force-gdc-clock",
            },
            "boot-device": {
                name: t("upsert.fields.boot-device"),
                key: "boot-device",
                help: t("upsert.fields.boot-device-help"),
            },
            "aspect-mode": {name: t("upsert.fields.aspect-mode"), key: "aspect-mode"},
            crt: {name: t("upsert.fields.crt"), key: "crt"},
            "window-mode": {name: t("upsert.fields.window-mode"), key: "window-mode"},
            "audio-volume": {name: t("upsert.fields.audio-volume"), key: "audio-volume"},
            soundboard: {name: t("upsert.fields.soundboard"), key: "soundboard"},
            "adpcm-ram": {name: t("upsert.fields.adpcm-ram"), key: "adpcm-ram"},
            midi: {name: t("upsert.fields.midi"), key: "midi"},
            "mt32-roms": {name: t("upsert.fields.mt32-roms"), key: "mt32-roms"},
            "sc55-roms": {name: t("upsert.fields.sc55-roms"), key: "sc55-roms"},
            ems: {name: t("upsert.fields.ems"), key: "ems"},
            xms: {name: t("upsert.fields.xms"), key: "xms"},
            "bios-rom": {
                name: t("upsert.fields.bios-rom"),
                key: "bios-rom",
                help: t("upsert.fields.bios-rom-help"),
                help_emulator: t("upsert.fields.bios-rom-help-emulator"),
            },
            "font-rom": {
                name: t("upsert.fields.font-rom"),
                key: "font-rom",
                help: t("upsert.fields.font-rom-help"),
                help_emulator: t("upsert.fields.font-rom-help-emulator"),
            },
            printer: {
                name: t("upsert.fields.printer"),
                key: "printer",
                help: t("upsert.fields.printer-help"),
                help_emulator: t("upsert.fields.printer-help-emulator"),
            },
        },
        drives: {
            listMeta: (count: number) => t("upsert.drives.listMeta", {count}),
            addExisting: t("upsert.drives.addExisting"),
            createNew: t("upsert.drives.createNew"),
            replace: t("upsert.drives.replace"),
            clear: t("upsert.drives.clear"),
            fileNotFound: t("upsert.drives.fileNotFound"),
            empty: t("upsert.drives.empty"),
            cdromBanner: (machineId: string) =>
                t("upsert.drives.cdromBanner", {machineId}),
            bayLabels: {
                fdd1: {display: t("upsert.drives.bays.fdd1"), key: "fdd1"},
                fdd2: {display: t("upsert.drives.bays.fdd2"), key: "fdd2"},
                hdd1: {display: t("upsert.drives.bays.hdd1"), key: "hdd1"},
                hdd2: {display: t("upsert.drives.bays.hdd2"), key: "hdd2"},
                cdrom: {display: t("upsert.drives.bays.cdrom"), key: "cdrom"},
            },
        },
        validation: {
            latinNameRequired: t("upsert.validation.latinNameRequired"),
            yearRequired: t("upsert.validation.yearRequired"),
            yearOutOfRange: t("upsert.validation.yearOutOfRange"),
        },
        errors: {
            saveFailed: (msg: string) => t("upsert.errors.saveFailed", {error: msg}),
            loadConfigFailed: (msg: string) =>
                t("upsert.errors.loadConfigFailed", {error: msg}),
        },
        createImage: {
            title: t("upsert.createImage.title"),
            tabs: {
                fdd: t("upsert.createImage.tabFdd"),
                hdd: t("upsert.createImage.tabHdd"),
            },
            output: t("upsert.createImage.output"),
            diskType: t("upsert.createImage.diskType"),
            create: t("upsert.createImage.create"),
            cancel: t("upsert.createImage.cancel"),
            browse: t("upsert.createImage.browse"),
            sasiGroup: t("upsert.createImage.sasiGroup"),
            ideGroup: t("upsert.createImage.ideGroup"),
            saveDialogTitle: t("upsert.createImage.saveDialogTitle"),
            defaultFilenameFdd: t("upsert.createImage.defaultFilenameFdd"),
            defaultFilenameHdd: t("upsert.createImage.defaultFilenameHdd"),
            errors: {
                filenameRequired: t("upsert.createImage.filenameRequired"),
                createFailed: (msg: string) =>
                    t("upsert.createImage.createFailed", {error: msg}),
            },
        },
    };
}

export const FDD_PRESETS = [
    {
        id: "2hd",
        label: "2HD",
        detail: "1 232 KB · 77 cyl × 2 hd × 8 spt × 1024 B",
    },
    {
        id: "2dd",
        label: "2DD",
        detail: "640 KB · 80 cyl × 2 hd × 16 spt × 256 B",
    },
] as const;

export const HDD_PRESETS_SASI = [
    {id: "sasi5", label: "sasi5", detail: "5 MB"},
    {id: "sasi10", label: "sasi10", detail: "10 MB"},
    {id: "sasi15", label: "sasi15", detail: "15 MB"},
    {id: "sasi20", label: "sasi20", detail: "20 MB"},
    {id: "sasi30", label: "sasi30", detail: "30 MB"},
    {id: "sasi40", label: "sasi40", detail: "40 MB"},
] as const;

export const HDD_PRESETS_IDE = [
    {id: "ide40", label: "ide40", detail: "40 MB"},
    {id: "ide80", label: "ide80", detail: "80 MB"},
    {id: "ide120", label: "ide120", detail: "120 MB"},
    {id: "ide200", label: "ide200", detail: "200 MB"},
    {id: "ide500", label: "ide500", detail: "500 MB"},
] as const;

export const MACHINE_OPTIONS = [
    {value: "PC9801F", label: "PC9801F - 8086 · 5/8 MHz · GDC · SASI"},
    {value: "PC9801VM", label: "PC9801VM - V30 · 8/10 MHz · GRCG · SASI"},
    {
        value: "PC9801VX",
        label: "PC9801VX - 80286 · 8/10 MHz · 4 MiB · ECG · SASI",
    },
    {
        value: "PC9801RA",
        label: "PC9801RA - 80386DX · 16/20 MHz · 12 MiB · ECG · SASI",
    },
    {
        value: "PC9821AS",
        label: "PC9821AS - 80486DX · 33 MHz · 14 MiB · PEGC · IDE · CD-ROM",
    },
    {
        value: "PC9821AP",
        label: "PC9821AP - 80486DX2 · 66 MHz · 14 MiB · PEGC · IDE · CD-ROM",
    },
] as const;

export const PC9821_MODELS = ["PC9821AS", "PC9821AP"] as const;
