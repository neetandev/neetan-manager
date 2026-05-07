import {WarningTriangleIcon} from "../../../../icons/Icons";
import {useStrings} from "../strings";

interface Props {
    machineId: string;
}

export function CdromBanner({machineId}: Props) {
    const STRINGS = useStrings();
    return (
        <div className="drive-banner" role="note">
      <span className="drive-banner-icon">
        <WarningTriangleIcon size={14}/>
      </span>
            <span>{STRINGS.drives.cdromBanner(machineId)}</span>
        </div>
    );
}
