import type {
  SVGAttributes,
} from 'react';
import {
  useId,
} from 'react';

export const papaDataIconNames = [
  'home',
  'search',
  'trend',
  'data',
  'integration',
  'assistant',
  'security',
  'billing',
  'success',
  'warning',
] as const;

export type PapaDataIconName =
  typeof papaDataIconNames[number];

export type IconProps = Omit<
  SVGAttributes<SVGSVGElement>,
  'children' | 'name'
> & {
  readonly label?: string;
  readonly name: PapaDataIconName;
  readonly size?: 16 | 20 | 24;
};

function IconPaths({
  name,
}: {
  readonly name: PapaDataIconName;
}) {
  switch (name) {
    case 'home':
      return <path d="M3.5 10.5 12 3l8.5 7.5v9H15v-6H9v6H3.5Z" />;
    case 'search':
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </>
      );
    case 'trend':
      return (
        <>
          <path d="M4 18V6" />
          <path d="M4 18h16" />
          <path d="m7 14 4-4 3 2 5-6" />
        </>
      );
    case 'data':
      return (
        <>
          <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
          <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
          <path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
        </>
      );
    case 'integration':
      return (
        <>
          <path d="M8 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
          <path d="M13 3h8v8" />
          <path d="m10 14 11-11" />
        </>
      );
    case 'assistant':
      return (
        <>
          <path d="M12 3 14 8l5 2-5 2-2 5-2-5-5-2 5-2Z" />
          <path d="m18 16 .9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9Z" />
        </>
      );
    case 'security':
      return (
        <>
          <path d="M12 3 20 6v5c0 5.2-3.4 8.5-8 10-4.6-1.5-8-4.8-8-10V6Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>
      );
    case 'billing':
      return (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 15h4" />
        </>
      );
    case 'success':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16.5 8" />
        </>
      );
    case 'warning':
      return (
        <>
          <path d="M12 3 22 20H2Z" />
          <path d="M12 9v5" />
          <path d="M12 17.5h.01" />
        </>
      );
  }
}

export function Icon({
  label,
  name,
  size = 20,
  ...props
}: IconProps) {
  const titleId = useId();

  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-labelledby={label ? titleId : undefined}
      fill="none"
      focusable="false"
      height={size}
      role={label ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {label ? (
        <title id={titleId}>{label}</title>
      ) : null}
      <IconPaths name={name} />
    </svg>
  );
}
