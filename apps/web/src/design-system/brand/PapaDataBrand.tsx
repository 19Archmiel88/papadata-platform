import { useId } from 'react';

type PapaDataBrandTone = 'brand' | 'monochrome';

type PapaDataSignetVariant = 'full' | 'micro';

type PapaDataSignetProps = {
  className?: string;
  tone?: PapaDataBrandTone;
  variant?: PapaDataSignetVariant;
};

type PapaDataWordmarkProps = {
  className?: string;
  tone?: PapaDataBrandTone;
};

type PapaDataBrandProps = {
  className?: string;
  signetVariant?: PapaDataSignetVariant;
  tone?: PapaDataBrandTone;
};

function sanitizeSvgId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

// Wspólna geometria litery P (współdzielona przez oba warianty).
// Bryła: x 20–92, y 8–150. Brzuszek (bowl): y 8–102. Nóżka (stem): x 20–44, y 102–150.
// Otwór brzuszka (counter): x 44–92, y 32–78.
const P_LETTER_PATH = `
  M 20 8
  H 92
  A 47 47 0 0 1 92 102
  H 44
  V 150
  H 20
  Z

  M 44 32
  H 92
  A 23 23 0 0 1 92 78
  H 44
  Z
`;

// Wnęka pod brzuszkiem, w której mieszczą się słupki: x 44–92, y 108–150 (bez kolizji z bowl/hole).
const BAR_SLOTS = [
  { x: 44, width: 12, height: 16 },
  { x: 62, width: 12, height: 28 },
  { x: 80, width: 12, height: 40 },
] as const;

// Prostokąt z zaokrąglonymi TYLKO górnymi rogami — dolna krawędź zostaje
// idealnie prosta, więc słupek siedzi płasko na linii bazowej (bez szczelin
// od zaokrąglonych dolnych rogów, które wyglądały jak "unoszący się" słupek).
function roundedTopRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height);

  return `
    M ${x} ${y + height}
    L ${x} ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    L ${x + width - r} ${y}
    Q ${x + width} ${y} ${x + width} ${y + r}
    L ${x + width} ${y + height}
    Z
  `;
}

export function PapaDataSignet({
  className = 'pds-brand__signal',
  tone = 'brand',
  variant = 'full',
}: PapaDataSignetProps) {
  const reactId = sanitizeSvgId(useId());

  const barGradientId = `pds-logo-bar-${reactId}`;
  const pGradientId = `pds-logo-p-${reactId}`;
  const gridMaskId = `pds-logo-grid-${reactId}`;
  const microGridMaskId = `pds-logo-micro-grid-${reactId}`;

  const barRadius = variant === 'micro' ? 4 : 3;

  if (variant === 'micro') {
    return (
      <svg
        aria-hidden="true"
        className={[
          className,
          `pds-brand__signal--${tone}`,
          'pds-brand__signal--micro',
        ].join(' ')}
        focusable="false"
        viewBox="0 0 160 180"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={pGradientId}
            x1="0%"
            x2="100%"
            y1="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="var(--pds-logo-p-start)"
            />

            <stop
              offset="100%"
              stopColor="var(--pds-logo-p-end)"
            />
          </linearGradient>

          <linearGradient
            id={barGradientId}
            x1="0%"
            x2="0%"
            y1="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="var(--pds-logo-column-front-start)"
            />
            <stop
              offset="100%"
              stopColor="var(--pds-logo-column-front-end)"
            />
          </linearGradient>

          {/* Siatka wyrównana do granic litery (x 20–92, y 8–150), podzielona
              na 3 równe rzędy (~47 wys. każdy) i 2 równe kolumny (36 szer. każda). */}
          <mask
            height="180"
            id={microGridMaskId}
            maskUnits="userSpaceOnUse"
            width="160"
            x="0"
            y="0"
          >
            <rect
              fill="white"
              height="180"
              width="160"
              x="0"
              y="0"
            />

            <rect
              fill="black"
              height="5"
              width="72"
              x="20"
              y="56"
            />

            <rect
              fill="black"
              height="5"
              width="72"
              x="20"
              y="103"
            />

            <rect
              fill="black"
              height="142"
              width="5"
              x="56"
              y="8"
            />
          </mask>
        </defs>

        <path
          clipRule="evenodd"
          d={P_LETTER_PATH}
          fill={`url(#${pGradientId})`}
          fillRule="evenodd"
          mask={`url(#${microGridMaskId})`}
        />

        <rect
          className="pds-brand__signal-base"
          height="7"
          width="140"
          x="5"
          y="150"
        />

        {BAR_SLOTS.map((slot, index) => (
          <path
            key={slot.x}
            className={`pds-brand__micro-bar pds-brand__micro-bar--${index + 1}`}
            d={roundedTopRectPath(slot.x, 150 - slot.height, slot.width, slot.height, barRadius)}
            fill={`url(#${barGradientId})`}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={[
        className,
        `pds-brand__signal--${tone}`,
        'pds-brand__signal--full',
      ].join(' ')}
      focusable="false"
      viewBox="0 0 160 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={pGradientId}
          x1="0%"
          x2="100%"
          y1="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor="var(--pds-logo-p-start)"
          />
          <stop
            offset="100%"
            stopColor="var(--pds-logo-p-end)"
          />
        </linearGradient>

        <linearGradient
          id={barGradientId}
          x1="0%"
          x2="0%"
          y1="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor="var(--pds-logo-column-front-start)"
          />
          <stop
            offset="100%"
            stopColor="var(--pds-logo-column-front-end)"
          />
        </linearGradient>

        {/* Siatka wyrównana do granic litery (x 20–92, y 8–150), podzielona na
            RÓWNE komórki ~24×24 (poprzednio linie poziome były przywiązane do
            krawędzi otworu i miały nierówny rozstaw 24/46/44/28 — stąd
            "krzywy" efekt). Teraz odstępy są jednolite w obu osiach. */}
        <mask
          height="180"
          id={gridMaskId}
          maskUnits="userSpaceOnUse"
          width="160"
          x="0"
          y="0"
        >
          <rect
            fill="white"
            height="180"
            width="160"
            x="0"
            y="0"
          />

          <rect
            fill="black"
            height="2"
            width="72"
            x="20"
            y="32"
          />
          <rect
            fill="black"
            height="2"
            width="72"
            x="20"
            y="56"
          />
          <rect
            fill="black"
            height="2"
            width="72"
            x="20"
            y="80"
          />
          <rect
            fill="black"
            height="2"
            width="72"
            x="20"
            y="104"
          />
          <rect
            fill="black"
            height="2"
            width="72"
            x="20"
            y="128"
          />

          <rect
            fill="black"
            height="142"
            width="2"
            x="44"
            y="8"
          />
          <rect
            fill="black"
            height="142"
            width="2"
            x="68"
            y="8"
          />
        </mask>
      </defs>

      <path
        clipRule="evenodd"
        d={P_LETTER_PATH}
        fill={`url(#${pGradientId})`}
        fillRule="evenodd"
        mask={`url(#${gridMaskId})`}
      />

      <rect
        className="pds-brand__signal-base"
        height="6"
        width="140"
        x="5"
        y="150"
      />

      {BAR_SLOTS.map((slot, index) => (
        <path
          key={slot.x}
          className={`pds-brand__bar pds-brand__bar--${index + 1}`}
          d={roundedTopRectPath(slot.x, 150 - slot.height, slot.width, slot.height, barRadius)}
          fill={`url(#${barGradientId})`}
        />
      ))}
    </svg>
  );
}

export function PapaDataWordmark({
  className = 'pds-wordmark',
  tone = 'brand',
}: PapaDataWordmarkProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        className,
        `pds-wordmark--${tone}`,
      ].join(' ')}
    >
      <span className="pds-wordmark__papa">
        Papa
      </span>

      <span className="pds-wordmark__data">
        Data
      </span>
    </span>
  );
}

export function PapaDataBrand({
  className = 'pds-brand',
  signetVariant = 'full',
  tone = 'brand',
}: PapaDataBrandProps) {
  return (
    <div
      className={[
        className,
        `pds-brand--${tone}`,
      ].join(' ')}
    >
      <span className="pds-sr-only">
        PapaData
      </span>

      <PapaDataSignet
        tone={tone}
        variant={signetVariant}
      />

      <PapaDataWordmark tone={tone} />
    </div>
  );
}

export type {
  PapaDataBrandProps,
  PapaDataBrandTone,
  PapaDataSignetProps,
  PapaDataSignetVariant,
  PapaDataWordmarkProps,
};
