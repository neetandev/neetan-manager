interface Props {
    name: string;
    keyName?: string;
    required?: boolean;
    htmlFor?: string;
    id?: string;
}

export function FieldLabel({name, keyName, required, htmlFor, id}: Props) {
    return (
        <label className="field-label" htmlFor={htmlFor} id={id}>
      <span className="field-name">
        {name}
          {required && <span className="req"> *</span>}
      </span>
            {keyName && <span className="field-key">{keyName}</span>}
        </label>
    );
}
