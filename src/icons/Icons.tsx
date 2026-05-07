import type {ReactNode, SVGProps} from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function Svg({
                 size = 14,
                 strokeWidth = 1.8,
                 children,
                 ...rest
             }: IconProps & { children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...rest}
        >
            {children}
        </svg>
    );
}

export function SearchIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="11" cy="11" r="7"/>
            <path d="m20 20-3.5-3.5"/>
        </Svg>
    );
}

export function CloseIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M6 6l12 12M18 6 6 18"/>
        </Svg>
    );
}

export function SunIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>
        </Svg>
    );
}

export function MoonIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>
        </Svg>
    );
}

export function TableIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <rect x="3.5" y="5" width="17" height="14" rx="1.5"/>
            <path d="M3.5 10h17M9 5v14"/>
        </Svg>
    );
}

export function GridIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <rect x="4" y="4" width="7" height="7" rx="1"/>
            <rect x="13" y="4" width="7" height="7" rx="1"/>
            <rect x="4" y="13" width="7" height="7" rx="1"/>
            <rect x="13" y="13" width="7" height="7" rx="1"/>
        </Svg>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <Svg strokeWidth={2.2} {...props}>
            <path d="M12 5v14M5 12h14"/>
        </Svg>
    );
}

export function PencilIcon(props: IconProps) {
    return (
        <Svg strokeWidth={2} {...props}>
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </Svg>
    );
}

export function TrashIcon(props: IconProps) {
    return (
        <Svg strokeWidth={2} {...props}>
            <path d="M3 6h18"/>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </Svg>
    );
}

export function CopyIcon(props: IconProps) {
    return (
        <Svg strokeWidth={2} {...props}>
            <rect x="9" y="9" width="11" height="11" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </Svg>
    );
}

export function GripIcon({size = 14, ...rest}: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            {...rest}
        >
            <circle cx="9" cy="6" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/>
            <circle cx="15" cy="6" r="1.5"/>
            <circle cx="15" cy="12" r="1.5"/>
            <circle cx="15" cy="18" r="1.5"/>
        </svg>
    );
}

export function ResetIcon(props: IconProps) {
    return (
        <Svg strokeWidth={2} {...props}>
            <path d="M3 12a9 9 0 1 0 3-6.7"/>
            <path d="M3 4v5h5"/>
        </Svg>
    );
}

export function WarningTriangleIcon({size = 14, ...rest}: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...rest}
        >
            <path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
        </svg>
    );
}

export function InfoIcon({size = 12, ...rest}: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...rest}
        >
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 11v5"/>
            <path d="M12 7.5h.01"/>
        </svg>
    );
}

export function CogIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <circle cx="12" cy="12" r="3"/>
            <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </Svg>
    );
}

export function FileNewIcon(props: IconProps) {
    return (
        <Svg strokeWidth={1.8} {...props}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
            <path d="M14 3v5h5"/>
            <path d="M12 13v5M9.5 15.5h5"/>
        </Svg>
    );
}

export function DiskIcon(props: IconProps) {
    return (
        <Svg strokeWidth={1.8} {...props}>
            <rect x="3.5" y="4" width="17" height="16" rx="1.5"/>
            <path d="M7 4v5h10V4"/>
            <path d="M9 14h6"/>
            <path d="M9 17h6"/>
        </Svg>
    );
}
