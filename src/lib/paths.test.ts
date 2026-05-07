import {assertEquals} from "@std/assert";
import {toRelativeIfInsideEx} from "./paths";

Deno.test("posix path inside portable dir becomes relative", () => {
    assertEquals(
        toRelativeIfInsideEx("/Users/n/portable/games/foo.d88", "/Users/n/portable", false),
        "games/foo.d88",
    );
});

Deno.test("posix path outside portable dir is left absolute", () => {
    assertEquals(
        toRelativeIfInsideEx("/etc/hosts", "/Users/n/portable", false),
        "/etc/hosts",
    );
});

Deno.test("windows path with backslashes becomes forward-slash relative", () => {
    assertEquals(
        toRelativeIfInsideEx(
            "C:\\Users\\n\\portable\\games\\foo.d88",
            "C:\\Users\\n\\portable",
            true,
        ),
        "games/foo.d88",
    );
});

Deno.test("trailing-separator portable dir is handled", () => {
    assertEquals(
        toRelativeIfInsideEx(
            "/Users/n/portable/x/y.d88",
            "/Users/n/portable/",
            false,
        ),
        "x/y.d88",
    );
});

Deno.test("case-insensitive prefix match strips on win/mac", () => {
    assertEquals(
        toRelativeIfInsideEx("/Users/N/Portable/Games/X.d88", "/users/n/portable", true),
        "Games/X.d88",
    );
});

Deno.test("case-sensitive prefix mismatch keeps absolute on linux", () => {
    assertEquals(
        toRelativeIfInsideEx("/Users/N/Portable/games/x.d88", "/users/n/portable", false),
        "/Users/N/Portable/games/x.d88",
    );
});

Deno.test("exact match returns '.'", () => {
    assertEquals(
        toRelativeIfInsideEx("/Users/n/portable", "/Users/n/portable", false),
        ".",
    );
});

Deno.test("empty portable dir returns input unchanged", () => {
    assertEquals(
        toRelativeIfInsideEx("/some/path", "", false),
        "/some/path",
    );
});

Deno.test("sibling-prefix with same start is not stripped", () => {
    // /portable-other should NOT be stripped against /portable
    assertEquals(
        toRelativeIfInsideEx("/portable-other/foo.d88", "/portable", false),
        "/portable-other/foo.d88",
    );
});
