import {CloseIcon, DiskIcon, FileNewIcon} from "../../../../icons/Icons";
import {useStrings} from "../strings";
import type {DriveImage} from "../types";

interface Props {
    bayKey: "hdd1" | "hdd2";
    display: string;
    fieldKey: string;
    image: DriveImage | null;
    onChange: (next: DriveImage | null) => void;
    onAddExisting: () => void;
    onCreateNew: () => void;
}

export function DriveSingleBay({
                                   display,
                                   fieldKey,
                                   image,
                                   onChange,
                                   onAddExisting,
                                   onCreateNew,
                               }: Props) {
    const STRINGS = useStrings();
    return (
        <div className="drive-block">
            <div className="drive-block-head">
                <div className="drive-name">
                    <strong>{display}</strong>
                    <span className="field-key">{fieldKey}</span>
                </div>
            </div>
            {image ? (
                <div className="hdd-row">
                    <div className="hdd-set">
                        <DiskIcon size={14}/>
                        <span className="file-pill" title={image.path}>
              {image.path}
            </span>
                        {image.missing ? (
                            <span className="warn-tag">{STRINGS.drives.fileNotFound}</span>
                        ) : (
                            <span className="drive-tag">{image.type}</span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="btn btn-quiet btn-sm"
                        onClick={onAddExisting}
                    >
                        {STRINGS.drives.replace}
                    </button>
                    <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        aria-label={STRINGS.drives.clear}
                        title={STRINGS.drives.clear}
                        onClick={() => onChange(null)}
                    >
                        <CloseIcon size={11}/>
                    </button>
                </div>
            ) : (
                <>
                    <div className="drive-empty">{STRINGS.drives.empty}</div>
                    <div className="drive-foot">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={onAddExisting}
                        >
                            {STRINGS.drives.addExisting}
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={onCreateNew}
                        >
                            <FileNewIcon size={13}/>
                            {STRINGS.drives.createNew}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
