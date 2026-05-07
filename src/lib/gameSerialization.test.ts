import {assertEquals, assertThrows} from "@std/assert";
import type {GameUpsertForm} from "../components/Modal/upsert/types";
import {
    configValueToFormPatch,
    FormValidationError,
    formToConfigValue,
    formToUpsertDto,
} from "./gameSerialization";

function blankForm(): GameUpsertForm {
    return {
        id: null,
        system: "PC-9800",
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

Deno.test("formToUpsertDto renames developer and year fields", () => {
    const form: GameUpsertForm = {
        ...blankForm(),
        id: 7,
        latin_name: "Brandish",
        japanese_name: "ブランディッシュ",
        developer: "Falcom",
        year: 1991,
    };
    assertEquals(formToUpsertDto(form), {
        id: 7,
        system: "PC-9800",
        latin_name: "Brandish",
        japanese_name: "ブランディッシュ",
        developer_name: "Falcom",
        release_year: 1991,
    });
});

Deno.test("formToUpsertDto rejects null year", () => {
    assertThrows(
        () => formToUpsertDto({...blankForm(), latin_name: "X"}),
        FormValidationError,
    );
});

Deno.test("formToConfigValue omits all defaults from a blank form", () => {
    assertEquals(formToConfigValue(blankForm()), {});
});

Deno.test("formToConfigValue persists overrides and drops empty values", () => {
    const form: GameUpsertForm = {
        ...blankForm(),
        machine: "PC9821AS",
        "cpu-mode": "high",
        "audio-volume": 0.85,
        crt: true,
        ems: false,
        "bios-rom": "",
        fdd1: [
            {id: "ignored-1", path: "a.d88", type: "D88"},
            {id: "ignored-2", path: "b.d88", type: "D88"},
        ],
        hdd1: {id: "ignored-3", path: "system.hdi", type: "HDI"},
    };
    assertEquals(formToConfigValue(form), {
        machine: "PC9821AS",
        "cpu-mode": "high",
        "audio-volume": 0.85,
        crt: true,
        ems: false,
        fdd1: ["a.d88", "b.d88"],
        hdd1: "system.hdi",
    });
});

Deno.test("formToConfigValue preserves Tri false (distinct from null)", () => {
    const form: GameUpsertForm = {...blankForm(), crt: false, xms: false};
    assertEquals(formToConfigValue(form), {crt: false, xms: false});
});

Deno.test("formToConfigValue strips ephemeral drive fields", () => {
    const form: GameUpsertForm = {
        ...blankForm(),
        fdd1: [
            {id: "abc", path: "a.d88", type: "D88", missing: true},
        ],
    };
    const out = formToConfigValue(form);
    assertEquals(out.fdd1, ["a.d88"]);
});

Deno.test("configValueToFormPatch round-trips form overrides", () => {
    const form: GameUpsertForm = {
        ...blankForm(),
        machine: "PC9821AS",
        "audio-volume": 0.85,
        crt: true,
        ems: false,
        fdd1: [
            {id: "x", path: "a.d88", type: "D88"},
            {id: "y", path: "b.d88", type: "D88"},
        ],
        hdd1: {id: "z", path: "system.hdi", type: "HDI"},
    };
    const value = formToConfigValue(form);
    const patch = configValueToFormPatch(value);

    assertEquals(patch.machine, "PC9821AS");
    assertEquals(patch["audio-volume"], 0.85);
    assertEquals(patch.crt, true);
    assertEquals(patch.ems, false);

    // Drive paths and inferred types come back; ids are fresh.
    assertEquals(patch.fdd1?.length, 2);
    assertEquals(patch.fdd1?.[0].path, "a.d88");
    assertEquals(patch.fdd1?.[0].type, "D88");
    assertEquals(typeof patch.fdd1?.[0].id, "string");

    assertEquals(patch.hdd1?.path, "system.hdi");
    assertEquals(patch.hdd1?.type, "HDI");
});

Deno.test("configValueToFormPatch ignores keys with the wrong type", () => {
    const patch = configValueToFormPatch({
        machine: 42,
        crt: "yes",
        "audio-volume": "loud",
        fdd1: [123, "ok.d88"],
        hdd1: 7,
    });
    assertEquals(patch.machine, undefined);
    assertEquals(patch.crt, undefined);
    assertEquals(patch["audio-volume"], undefined);
    assertEquals(patch.fdd1?.length, 1);
    assertEquals(patch.fdd1?.[0].path, "ok.d88");
    assertEquals(patch.hdd1, undefined);
});

Deno.test("configValueToFormPatch leaves missing keys absent", () => {
    const patch = configValueToFormPatch({});
    assertEquals(Object.keys(patch).length, 0);
});
