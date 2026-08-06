import type {
  SVGProps,
} from 'react';

export function ArrowNorthEastIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 14L14 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 6H14V13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlobeIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 10H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 3C12 4.9 13 7.2 13 10C13 12.8 12 15.1 10 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 3C8 4.9 7 7.2 7 10C7 12.8 8 15.1 10 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonStarIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12.4 3.4C9 4.1 6.5 7 6.5 10.4C6.5 14.5 9.8 17.8 13.9 17.8C15.1 17.8 16.2 17.5 17.2 16.9C16.2 16.6 15.2 16 14.5 15.3C12.1 12.9 11.4 9.4 12.4 6.2V3.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 4L15.3 5.3L16.6 5.8L15.3 6.3L14.8 7.6L14.3 6.3L13 5.8L14.3 5.3L14.8 4Z"
        fill="currentColor"
      />
    </svg>
  );
}
