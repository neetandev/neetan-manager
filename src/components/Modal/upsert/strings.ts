export const STRINGS = {
  modal: {
    titleAdd: "Add game",
    titleEdit: "Edit game",
    titleDuplicate: "Duplicate",
    sublineAdd: (system: string) => `new · ${system}`,
    sublineEdit: (id: number, system: string) => `id ${id} · ${system}`,
    sublineDuplicate: (id: number, system: string) =>
      `copy of ${id} · ${system}`,
    footerHint: "Changes apply at the next launch of the title.",
    cancel: "Cancel",
    save: "Save",
  },
  sections: {
    metadata: { title: "Metadata", desc: "" },
    machine: { title: "Machine", desc: "" },
    drives: {
      title: "Drives",
      desc: "Disk images mounted in each drive. Order is the insertion order.",
    },
    boot: { title: "Boot", desc: "" },
    display: { title: "Display", desc: "" },
    audio: { title: "Audio", desc: "" },
    memory: { title: "Memory", desc: "" },
    rom: {
      title: "ROM overrides",
      desc: "Optional. By default the HLE BIOS and built-in font are used.",
    },
    other: { title: "Other", desc: "" },
  },
  defaultable: {
    paren: (label: string) => `(use system default - ${label})`,
    paren_no_value: "(use system default)",
    fontDefault: "(use system default - built-in font)",
    biosDefault: "(use system default - HLE BIOS)",
    resetTitle: "Reset to system default",
    resetLabel: "Reset",
    clearTitle: "Clear (use system default)",
  },
  tri: {
    default: "Default",
    on: "On",
    off: "Off",
  },
  fields: {
    system: { name: "System", key: "system" },
    latin_name: { name: "Latin name", key: "latin_name" },
    japanese_name: { name: "Japanese name", key: "japanese_name" },
    developer: { name: "Developer", key: "developer" },
    year: { name: "Release year", key: "year" },
    machine: { name: "Model", key: "machine" },
    "cpu-mode": {
      name: "CPU mode",
      key: "cpu-mode",
      help: "PC-9801 only - ignored on PC-9821.",
    },
    "force-gdc-clock": { name: "Force GDC clock", key: "force-gdc-clock" },
    "boot-device": {
      name: "Boot device",
      key: "boot-device",
      help: "‘os’ boots without media.",
    },
    "aspect-mode": { name: "Aspect mode", key: "aspect-mode" },
    crt: { name: "CRT effect", key: "crt" },
    "window-mode": { name: "Window mode", key: "window-mode" },
    "audio-volume": { name: "Master volume", key: "audio-volume" },
    soundboard: { name: "Sound board", key: "soundboard" },
    "adpcm-ram": { name: "ADPCM RAM", key: "adpcm-ram" },
    midi: { name: "MIDI device", key: "midi" },
    "mt32-roms": { name: "MT-32 ROMs", key: "mt32-roms" },
    "sc55-roms": { name: "SC-55 ROMs", key: "sc55-roms" },
    ems: { name: "EMS", key: "ems" },
    xms: { name: "XMS", key: "xms" },
    "bios-rom": {
      name: "BIOS ROM",
      key: "bios-rom",
      help: "Empty inherits from the system. HLE BIOS is the built-in fallback.",
    },
    "font-rom": {
      name: "Font ROM",
      key: "font-rom",
      help: "Empty inherits from the system. Built-in font is the fallback.",
    },
    printer: {
      name: "Printer output",
      key: "printer",
      help: "Empty inherits from the system. The file must already exist if set.",
    },
  },
  drives: {
    listMeta: (count: number) =>
      count === 1 ? "1 image · drag to reorder" : `${count} images · drag to reorder`,
    addExisting: "+ Add existing image…",
    createNew: "Create new image…",
    replace: "Replace…",
    clear: "Clear",
    fileNotFound: "file not found",
    empty: "No image attached. Choose an existing file or create a new one.",
    cdromBanner: (machineId: string) =>
      `Selected machine is ${machineId}. CD-ROM entries are stored but ignored until a PC-9821 model is selected.`,
    bayLabels: {
      fdd1: { display: "FDD1", key: "fdd1" },
      fdd2: { display: "FDD2", key: "fdd2" },
      hdd1: { display: "HDD1", key: "hdd1" },
      hdd2: { display: "HDD2", key: "hdd2" },
      cdrom: { display: "CD-ROM", key: "cdrom" },
    },
  },
  validation: {
    latinNameRequired: "Latin name is required.",
    yearOutOfRange: "Year must be between 1979 and 2099.",
  },
  createImage: {
    title: "Create new disk image",
    tabs: { fdd: "Floppy (FDD)", hdd: "Hard disk (HDD)" },
    output: "Output filename",
    diskType: "Disk type",
    create: "Create",
    cancel: "Cancel",
    sasiGroup: "SASI",
    ideGroup: "IDE",
  },
} as const;

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
  { id: "sasi5", label: "sasi5", detail: "5 MB" },
  { id: "sasi10", label: "sasi10", detail: "10 MB" },
  { id: "sasi15", label: "sasi15", detail: "15 MB" },
  { id: "sasi20", label: "sasi20", detail: "20 MB" },
  { id: "sasi30", label: "sasi30", detail: "30 MB" },
  { id: "sasi40", label: "sasi40", detail: "40 MB" },
] as const;

export const HDD_PRESETS_IDE = [
  { id: "ide40", label: "ide40", detail: "40 MB" },
  { id: "ide80", label: "ide80", detail: "80 MB" },
  { id: "ide120", label: "ide120", detail: "120 MB" },
  { id: "ide200", label: "ide200", detail: "200 MB" },
  { id: "ide500", label: "ide500", detail: "500 MB" },
] as const;

export const MACHINE_OPTIONS = [
  { value: "PC9801F", label: "PC9801F - 8086 · 5/8 MHz · GDC · SASI" },
  { value: "PC9801VM", label: "PC9801VM - V30 · 8/10 MHz · GRCG · SASI" },
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
