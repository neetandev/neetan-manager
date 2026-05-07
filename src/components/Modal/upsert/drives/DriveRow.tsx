import {useEffect, useState, type DragEvent} from "react";
import {useTranslation} from "react-i18next";
import {CloseIcon, GripIcon, WarningTriangleIcon} from "../../../../icons/Icons";
import {useStrings} from "../strings";
import type {DriveImage} from "../types";

interface Props {
    image: DriveImage;
    isDragging: boolean;
    isDropTarget: boolean;
    onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnd?: () => void;
    onDragLeave?: (e: DragEvent<HTMLDivElement>) => void;
    onRemove: () => void;
}

export function DriveRow({
                             image,
                             isDragging,
                             isDropTarget,
                             onDragStart,
                             onDragOver,
                             onDrop,
                             onDragEnd,
                             onDragLeave,
                             onRemove,
                         }: Props) {
    const {t} = useTranslation();
    const STRINGS = useStrings();
    const [armed, setArmed] = useState(false);

    useEffect(() => {
        if (!armed || isDragging) return;
        const onWindowMouseUp = () => setArmed(false);
        window.addEventListener("mouseup", onWindowMouseUp);
        return () => window.removeEventListener("mouseup", onWindowMouseUp);
    }, [armed, isDragging]);

    const handleDragEnd = () => {
        setArmed(false);
        onDragEnd?.();
    };

    const cls = [
        "drive-row",
        isDragging ? "dragging" : "",
        isDropTarget ? "drop-target" : "",
        image.missing ? "warn" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={cls}
            draggable={armed}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={handleDragEnd}
            onDragLeave={onDragLeave}
            title={image.path}
        >
      <span
          className="drive-grip"
          aria-hidden="true"
          onMouseDown={() => setArmed(true)}
      >
        <GripIcon size={12}/>
      </span>
            <span className="drive-num" aria-hidden="true"/>
            <div className="drive-path">
                <span className="drive-path-text">{image.path}</span>
                {image.missing ? (
                    <span className="warn-tag">
            <WarningTriangleIcon size={11}/>
                        {STRINGS.drives.fileNotFound}
          </span>
                ) : (
                    <span className="drive-tag">{image.type}</span>
                )}
            </div>
            <div className="drive-actions">
                <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    aria-label={t("upsert.drives.removeImageAriaLabel", {path: image.path})}
                    onClick={onRemove}
                >
                    <CloseIcon size={11}/>
                </button>
            </div>
        </div>
    );
}
