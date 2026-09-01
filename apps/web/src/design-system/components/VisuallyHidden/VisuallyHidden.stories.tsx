import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  VisuallyHidden,
} from './VisuallyHidden';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-visually-hidden-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const VisuallyHiddenStory: Story = {
  name: 'VisuallyHidden',
  render: () => (
    <StoryPresentationPage
      className="pd-visually-hidden-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry VisuallyHidden', en: 'VisuallyHidden parameters' })}
          items={[
            { label: <Localized pl="Klasa" en="Class" />, value: '.pd-visually-hidden' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="visually-hidden"
      summary={
        <Localized
          pl="Treść zostaje w DOM i w drzewie dostępności, ale znika z widoku — np. rozwinięcie skrótu w StatusBadge albo etykieta dla czytnika ekranu obok ikony. Nie ukrywa treści przed technologią asystującą (to nie jest aria-hidden)."
          en="Content stays in the DOM and the accessibility tree but disappears visually — e.g. expanding an abbreviation in StatusBadge, or a screen-reader label next to an icon. It does not hide content from assistive technology (this is not aria-hidden)."
        />
      }
      title={<Localized pl="Widoczne dla czytnika, nie dla oka." en="Visible to a screen reader, not to the eye." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="visually-hidden-demo" style={{ display: 'flex', alignItems: 'center', gap: 'var(--pd-space-2)' }}>
          <span aria-hidden="true">★</span>
          <VisuallyHidden>
            <Localized pl="Oceniono na 5 gwiazdek" en="Rated 5 stars" />
          </VisuallyHidden>
          <span><Localized pl="(tekst widoczny obok jest niezależny)" en="(the visible text next to it is independent)" /></span>
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const hidden = canvas.getByText(copy({ pl: 'Oceniono na 5 gwiazdek', en: 'Rated 5 stars' }));
    await expect(hidden).toHaveClass('pd-visually-hidden');
  },
};
