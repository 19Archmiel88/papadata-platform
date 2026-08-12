import type { ReactNode } from 'react';

import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';

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
  handoff,
  status = 'accepted',
  children,
}: {
  readonly id: string;
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly variants: ReactNode;
  readonly handoff: ReactNode;
  readonly status?: 'accepted';
  readonly children: ReactNode;
}) {
  return (
    <StoryPresentationPage
      className="pd-s5-page pd-s5-next-page"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry laboratorium decyzji', en: 'Decision laboratory parameters' })}
          items={[
            {
              label: <Localized pl="Rola" en="Role" />,
              value: <Localized pl="decision record" en="decision record" />,
            },
            {
              label: <Localized pl="Docelowy owner" en="Target owner" />,
              value: handoff,
            },
            {
              label: <Localized pl="Status" en="Status" />,
              value: status,
            },
          ]}
        />
      )}
      sectionCode="05"
      sectionLabel={<Localized pl="Laboratorium decyzji" en="Decision laboratory" />}
      storyId={id}
      summary={summary}
      title={title}
    >
      <p className="pd-s5-ownership-note">
        <Localized
          pl="Laboratorium dokumentuje decyzję i jej warianty. Po akceptacji reguła jest promowana do wskazanego właściciela i nie pozostaje drugim źródłem prawdy."
          en="The laboratory documents a decision and its variants. After approval, the rule is promoted to the target owner and does not remain a second source of truth."
        />
        <span>{variants}</span>
      </p>
      {children}
    </StoryPresentationPage>
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
    <StoryPresentationSection
      className="pd-s5-next-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
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
    <span className="pd-s5-decision-badge" data-tone={tone}>
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
