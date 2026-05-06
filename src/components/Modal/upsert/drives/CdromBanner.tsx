import { InfoIcon } from "../../../../icons/Icons";
import { STRINGS } from "../strings";

interface Props {
  machineId: string;
}

export function CdromBanner({ machineId }: Props) {
  return (
    <div className="drive-banner" role="note">
      <span className="drive-banner-icon">
        <InfoIcon size={12} />
      </span>
      <span>{STRINGS.drives.cdromBanner(machineId)}</span>
    </div>
  );
}
