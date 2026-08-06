import type { ReactNode } from 'react';

export type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

export function readLocale() {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en' ? 'en' : 'pl';
}

export function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

export function Localized({ pl, en }: LocalizedCopy) {
  return <>{readLocale() === 'en' ? en : pl}</>;
}

export function StoryPage({
  id,
  title,
  summary,
  variants,
  children,
}: {
  readonly id: string;
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly variants: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-f0-page pd-s5-page pd-s5-next-page" data-story-id={id}>
      <div className="pd-f0-page__inner">
        <header className="pd-f0-page__header">
          <div className="pd-f0-page__label">
            <span>05</span>
            <span><Localized pl="Laboratorium decyzji" en="Decision laboratory" /></span>
          </div>
          <div className="pd-f0-page__heading">
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          <dl className="pd-f0-page__meta" aria-label={copy({ pl: 'Parametry kontraktu', en: 'Contract parameters' })}>
            <div>
              <dt><Localized pl="Kontrakt" en="Contract" /></dt>
              <dd>{id}</dd>
            </div>
            <div>
              <dt><Localized pl="Zakres review" en="Review scope" /></dt>
              <dd>{variants}</dd>
            </div>
            <div>
              <dt><Localized pl="Status" en="Status" /></dt>
              <dd>review</dd>
            </div>
          </dl>
        </header>
        {children}
      </div>
    </main>
  );
}

export function StorySection({
  index,
  title,
  summary,
  children,
}: {
  readonly index: string;
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="pd-f0-section pd-s5-next-section">
      <header className="pd-f0-section__header">
        <span className="pd-f0-section__index" aria-hidden="true">{index}</span>
        <div>
          <h2>{title}</h2>
          {summary ? <p>{summary}</p> : null}
        </div>
      </header>
      <div className="pd-f0-section__content">{children}</div>
    </section>
  );
}

export function ReviewBadge({
  tone,
  children,
}: {
  readonly tone: 'neutral' | 'info' | 'success' | 'warning' | 'critical';
  readonly children: ReactNode;
}) {
  return (
    <span className="pd-s5-review-badge" data-tone={tone}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

export function DecisionRows({
  accepted,
  rejected,
}: {
  readonly accepted: ReactNode;
  readonly rejected: ReactNode;
}) {
  return (
    <div className="pd-s5-next-decisions">
      <div>
        <ReviewBadge tone="success"><Localized pl="Stosujemy" en="Use" /></ReviewBadge>
        <p>{accepted}</p>
      </div>
      <div>
        <ReviewBadge tone="critical"><Localized pl="Odrzucamy" en="Reject" /></ReviewBadge>
        <p>{rejected}</p>
      </div>
    </div>
  );
}
