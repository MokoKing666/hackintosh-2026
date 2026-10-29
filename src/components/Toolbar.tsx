interface ChipOption {
  value: string;
  label: string;
}

interface ChipGroupProps {
  label: string;
  value: string;
  options: readonly ChipOption[];
  onChange: (value: string) => void;
}

export function ChipGroup({ label, value, options, onChange }: ChipGroupProps) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="chip"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export function SearchBox({ value, onChange, placeholder, label }: SearchBoxProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor="search-input">
        {label}
      </label>
      <input
        id="search-input"
        className="search"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
