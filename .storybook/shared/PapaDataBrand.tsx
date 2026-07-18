// cspell:words wordmark

type PapaDataSignetProps = {
  className?: string;
};

type PapaDataWordmarkProps = {
  className?: string;
};

type PapaDataBrandProps = {
  className?: string;
};

export function PapaDataSignet({
  className = 'pds-brand__signal',
}: PapaDataSignetProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.25"
      >
        <path
          className="pds-brand__signal-segment pds-brand__signal-segment--blue"
          d="M2.9 17.6L7.8 15.25"
        />
        <path
          className="pds-brand__signal-segment pds-brand__signal-segment--teal"
          d="M7.8 15.25L11.65 9.65"
        />
        <path
          className="pds-brand__signal-segment pds-brand__signal-segment--sky"
          d="M11.65 9.65L21.1 4.4"
        />
      </g>
      <circle
        className="pds-brand__signal-node pds-brand__signal-node--teal"
        cx="7.8"
        cy="15.25"
        r="1.15"
      />
      <circle
        className="pds-brand__signal-node pds-brand__signal-node--sky"
        cx="11.65"
        cy="9.65"
        r="1.15"
      />
    </svg>
  );
}

export function PapaDataWordmark({
  className = 'pds-wordmark',
}: PapaDataWordmarkProps) {
  return (
    <span className={className} aria-hidden="true">
      <span className="pds-wordmark__papa">Papa</span>
      <span className="pds-wordmark__data">Data</span>
    </span>
  );
}

export function PapaDataBrand({
  className = 'pds-brand',
}: PapaDataBrandProps) {
  return (
    <div className={className}>
      <span className="pds-sr-only">PapaData</span>
      <PapaDataSignet />
      <PapaDataWordmark />
    </div>
  );
}
