import {
  useId,
} from 'react';

import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations/runtime/index';
import type {
  AuthSurfaceMode,
} from './AuthSurface';

type AuthInsightChartProps = {
  readonly locale: PapaDataRuntimeLocale;
  // Kept in the prop type for callers (AuthSurface, the component-showcase
  // story) that still pass a mode — the chart itself no longer branches on
  // it. It used to switch to a "registration progress" stepper for
  // register/accept-invite, but that stepper's per-step percentages were
  // static regardless of any real state (fake progress). AuthInsightChart
  // is decorative marketing content (its parent <aside> is aria-hidden), so
  // it now always renders the one honestly-decorative variant instead of
  // one that visually implied real, quantified progress.
  readonly mode: AuthSurfaceMode;
};

export function AuthInsightChart({
  locale,
}: AuthInsightChartProps) {
  return <AuthRevenueChart locale={locale} />;
}

function AuthRevenueChart({
  locale,
}: {
  readonly locale: PapaDataRuntimeLocale;
}) {
  const gradientId = `pd-auth-revenue-area-${useId().replaceAll(':', '')}`;
  const copy = locale === 'en'
    ? {
      delta: '+18.4%',
      label: '30-day revenue',
      value: 'PLN 412,380',
    }
    : {
      delta: '+18,4%',
      label: 'Przychód z 30 dni',
      value: '412 380 zł',
    };

  return (
    <div className="pd-auth-insight-chart" data-chart-variant="revenue">
      <div className="pd-auth-insight-chart__head">
        <div>
          <p className="pd-auth-insight-chart__label">
            {copy.label}
          </p>
          <p className="pd-auth-insight-chart__value">{copy.value}</p>
        </div>
        <p className="pd-auth-insight-chart__delta">{copy.delta}</p>
      </div>

      <svg
        aria-hidden="true"
        className="pd-auth-insight-chart__svg"
        preserveAspectRatio="none"
        viewBox="0 0 520 148"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--pdauth-chart-fill-start)" />
            <stop offset="100%" stopColor="var(--pdauth-chart-fill-end)" />
          </linearGradient>
        </defs>
        <path
          className="pd-auth-insight-chart__area"
          fill={`url(#${gradientId})`}
          d="M0 122 L36 116 L72 118 L112 94 L150 101 L192 78 L232 83 L274 58 L314 64 L354 40 L396 50 L438 28 L480 34 L520 18 L520 148 L0 148 Z"
        />
        <path
          className="pd-auth-insight-chart__line"
          d="M0 122 L36 116 L72 118 L112 94 L150 101 L192 78 L232 83 L274 58 L314 64 L354 40 L396 50 L438 28 L480 34 L520 18"
        />
        <g className="pd-auth-insight-chart__markers">
          <circle cx="112" cy="94" r="4" />
          <circle cx="274" cy="58" r="4" />
          <circle cx="438" cy="28" r="4" />
          <circle cx="520" cy="18" r="4" />
        </g>
      </svg>
    </div>
  );
}
