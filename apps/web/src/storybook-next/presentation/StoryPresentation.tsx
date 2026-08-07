import type {
  ReactNode,
} from 'react';

export type StoryPresentationMetaItem = {
  readonly label: ReactNode;
  readonly value: ReactNode;
};

export function StoryPresentationMeta({
  ariaLabel,
  className,
  items,
}: {
  readonly ariaLabel: string;
  readonly className?: string;
  readonly items: readonly StoryPresentationMetaItem[];
}) {
  const rootClassName = [
    'pd-f0-page__meta',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <dl className={rootClassName} aria-label={ariaLabel}>
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StoryPresentationPage({
  children,
  className,
  headerAside,
  sectionCode,
  sectionLabel,
  storyId,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly headerAside: ReactNode;
  readonly sectionCode: ReactNode;
  readonly sectionLabel: ReactNode;
  readonly storyId?: string;
  readonly summary: ReactNode;
  readonly title: ReactNode;
}) {
  const rootClassName = [
    'pd-f0-page',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={rootClassName} data-story-id={storyId}>
      <div className="pd-f0-page__inner">
        <header className="pd-f0-page__header">
          <div className="pd-f0-page__label">
            <span>{sectionCode}</span>
            <span>{sectionLabel}</span>
          </div>
          <div className="pd-f0-page__heading">
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          {headerAside}
        </header>
        {children}
      </div>
    </main>
  );
}

export function StoryPresentationSection({
  children,
  className,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly index: ReactNode;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  const rootClassName = [
    'pd-f0-section',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClassName}>
      <header className="pd-f0-section__header">
        <span className="pd-f0-section__index" aria-hidden="true">
          {index}
        </span>
        <div>
          <h2>{title}</h2>
          {summary ? <p>{summary}</p> : null}
        </div>
      </header>
      <div className="pd-f0-section__content">
        {children}
      </div>
    </section>
  );
}
