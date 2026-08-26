import type {
  SVGAttributes,
} from 'react';
import {
  forwardRef,
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
  'calendar',
  'theme',
  'moon',
  'notifications',
  'menu',
  'products',
  'customers',
  'decisions',
  'help',
] as const;

export type PapaDataIconName =
  typeof papaDataIconNames[number];

export type IconProps = Omit<
  SVGAttributes<SVGSVGElement>,
  | 'aria-hidden'
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'fill'
  | 'focusable'
  | 'height'
  | 'name'
  | 'role'
  | 'stroke'
  | 'strokeLinecap'
  | 'strokeLinejoin'
  | 'strokeWidth'
  | 'tabIndex'
  | 'viewBox'
  | 'width'
> & {
  readonly decorative?: boolean;
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
    case 'calendar':
      return (
        <>
          <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
          <path d="M8 3v5M16 3v5M4 10h16" />
        </>
      );
    case 'theme':
      return (
        <>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
        </>
      );
    case 'moon':
      return (
        <path d="M19.5 14.7A7.6 7.6 0 0 1 9.3 4.5 7.8 7.8 0 1 0 19.5 14.7Z" />
      );
    case 'notifications':
      return (
        <>
          <path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3Z" />
          <path d="M9.5 20h5" />
        </>
      );
    case 'menu':
      return (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      );
    case 'products':
      return (
        <>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </>
      );
    case 'customers':
      return (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3.5 20c.5-4 2.8-6 5.5-6s5 2 5.5 6M14 15.5c2.8-.8 5.5 1 6.5 4.5" />
        </>
      );
    case 'decisions':
      return (
        <>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4V2.5h6V4M8 10h8M8 14h5M8 18h4" />
        </>
      );
    case 'help':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.7 2.7 0 0 1 5.2 1c0 2-2.7 2.2-2.7 4M12 17.5h.01" />
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

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    decorative = false,
    label,
    name,
    size = 20,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const isInformative =
    !decorative
    && typeof label === 'string'
    && label.trim().length > 0;

  return (
    <svg
      {...props}
      ref={ref}
      aria-hidden={isInformative ? undefined : true}
      aria-labelledby={isInformative ? titleId : undefined}
      fill="none"
      focusable="false"
      height={size}
      role={isInformative ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      tabIndex={undefined}
      viewBox="0 0 24 24"
      width={size}
    >
      {isInformative ? (
        <title id={titleId}>{label}</title>
      ) : null}
      <IconPaths name={name} />
    </svg>
  );
});
