import type {
  ReactNode,
} from 'react';

import {
  ChartFrame,
} from '../../../design-system/components';
import {
  formatPapaDataRelativeTime,
  type PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
} from '../../../storybook-next/presentation/StoryPresentation';
import '../00-foundations/foundation-geometry.css';

export type AnalyticsLocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

export type AnalyticsStoryMetaItem = {
  readonly label: ReactNode;
  readonly value: ReactNode;
};

export function readAnalyticsLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

export function readAnalyticsTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

export function readAnalyticsMotion(): 'full' | 'reduced' {
  if (typeof document === 'undefined') {
    return 'full';
  }

  return document.documentElement.dataset.motion === 'reduced'
    ? 'reduced'
    : 'full';
}

export function analyticsCopy(
  value: AnalyticsLocalizedCopy,
): string {
  return readAnalyticsLocale() === 'en'
    ? value.en
    : value.pl;
}

export function Localized({
  pl,
  en,
}: AnalyticsLocalizedCopy) {
  return <>{analyticsCopy({ pl, en })}</>;
}

function renderThemeLabel() {
  return readAnalyticsTheme() === 'dark'
    ? <Localized pl="Ciemny" en="Dark" />
    : <Localized pl="Jasny" en="Light" />;
}

function renderMotionLabel() {
  return readAnalyticsMotion() === 'reduced'
    ? <Localized pl="Ograniczone" en="Reduced" />
    : <Localized pl="Pełne" en="Full" />;
}

export function Story15Page({
  children,
  className,
  metaAriaLabel,
  metaItems,
  storyId,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly className: string;
  readonly metaAriaLabel: AnalyticsLocalizedCopy;
  readonly metaItems: readonly AnalyticsStoryMetaItem[];
  readonly storyId: string;
  readonly summary: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationPage
      className={className}
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={analyticsCopy(metaAriaLabel)}
          items={[
            ...metaItems,
            {
              label: <Localized pl="Motyw" en="Theme" />,
              value: renderThemeLabel(),
            },
            {
              label: <Localized pl="Język" en="Language" />,
              value: readAnalyticsLocale().toUpperCase(),
            },
            {
              label: <Localized pl="Animacje" en="Motion" />,
              value: renderMotionLabel(),
            },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel={<Localized pl="Wykresy i dane" en="Charts and data" />}
      storyId={storyId}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

export function AnalyticsChartSurface({
  alternativeTable,
  alternativeTableLabel,
  businessQuestion,
  children,
  className,
  description,
  freshnessMinutes = -10,
  rangeLabel,
  sourceLabel = 'Storybook fixture',
  statusLabel,
  summary,
  title,
  visualizationLabel,
}: {
  readonly alternativeTable?: ReactNode;
  readonly alternativeTableLabel?: AnalyticsLocalizedCopy;
  readonly businessQuestion: AnalyticsLocalizedCopy;
  readonly children: ReactNode;
  readonly className?: string;
  readonly description: AnalyticsLocalizedCopy;
  readonly freshnessMinutes?: number;
  readonly rangeLabel: AnalyticsLocalizedCopy;
  readonly sourceLabel?: string;
  readonly statusLabel?: AnalyticsLocalizedCopy;
  readonly summary?: ReactNode;
  readonly title: AnalyticsLocalizedCopy;
  readonly visualizationLabel: AnalyticsLocalizedCopy;
}) {
  const locale = readAnalyticsLocale();

  return (
    <div
      className="pd-a15-canvas-composition"
      data-canvas-root="section-15-chart"
    >
      <ChartFrame
        alternativeTable={alternativeTable}
        alternativeTableLabel={alternativeTableLabel
          ? analyticsCopy(alternativeTableLabel)
          : undefined}
        businessQuestion={analyticsCopy(businessQuestion)}
        className={[
          'pd-a15-product-data-surface',
          className,
        ].filter(Boolean).join(' ')}
        description={analyticsCopy(description)}
        freshnessLabel={formatPapaDataRelativeTime(
          freshnessMinutes,
          'minute',
          locale,
        )}
        rangeLabel={analyticsCopy(rangeLabel)}
        sourceLabel={sourceLabel}
        status="ready"
        statusLabel={analyticsCopy(statusLabel ?? {
          pl: 'Dane aktualne',
          en: 'Current data',
        })}
        summary={summary}
        title={analyticsCopy(title)}
        visualization={children}
        visualizationLabel={analyticsCopy(visualizationLabel)}
      />
    </div>
  );
}
