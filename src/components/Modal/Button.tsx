import type {ButtonHTMLAttributes} from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ghost" | "primary";
}

export function Button({variant = "ghost", className, ...rest}: Props) {
    const cls = `btn btn-${variant}${className ? " " + className : ""}`;
    return <button type="button" className={cls} {...rest} />;
}
