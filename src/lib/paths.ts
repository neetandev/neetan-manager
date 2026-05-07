// Path helpers.

type UADataNavigator = Navigator & {
    userAgentData?: {platform?: string};
};

export function isCaseInsensitiveFs(): boolean {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as UADataNavigator;
    const platform = nav.userAgentData?.platform ?? nav.platform ?? "";
    const ua = nav.userAgent ?? "";
    return /Win|Mac/i.test(platform) || /Windows|Macintosh|Mac OS/i.test(ua);
}

function normalizeSeparators(path: string): string {
    return path.replace(/\\/g, "/");
}

function stripTrailingSlash(path: string): string {
    if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
    return path;
}

/**
 * Returns `absolute` rewritten as a path relative to `portableDir` when it lives inside the
 * portable directory; otherwise returns `absolute` unchanged. Output uses forward slashes
 * regardless of OS.
 *
 * Comparison is case-insensitive when `caseInsensitive === true` (Windows/macOS); the returned
 * string preserves the original casing of the suffix.
 */
export function toRelativeIfInsideEx(
    absolute: string,
    portableDir: string,
    caseInsensitive: boolean,
): string {
    if (!portableDir) return absolute;

    const absNorm = normalizeSeparators(absolute);
    const baseNorm = stripTrailingSlash(normalizeSeparators(portableDir));

    const eq = caseInsensitive
        ? absNorm.toLowerCase() === baseNorm.toLowerCase()
        : absNorm === baseNorm;
    if (eq) return ".";

    const prefix = baseNorm + "/";
    const startsWith = caseInsensitive
        ? absNorm.toLowerCase().startsWith(prefix.toLowerCase())
        : absNorm.startsWith(prefix);
    if (!startsWith) return absolute;

    return absNorm.slice(prefix.length);
}

export function toRelativeIfInside(
    absolute: string,
    portableDir: string,
): string {
    return toRelativeIfInsideEx(absolute, portableDir, isCaseInsensitiveFs());
}
