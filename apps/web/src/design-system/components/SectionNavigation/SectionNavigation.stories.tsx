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
  SectionNavigation,
} from './SectionNavigation';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const items = [
  { href: '#overview', id: 'overview', label: 'Przegląd' },
  { href: '#data', id: 'data', label: 'Dane' },
  { badge: '3', href: '#sync', id: 'sync', label: 'Synchronizacja' },
  { disabled: true, href: '#config', id: 'config', label: 'Konfiguracja' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Nawigacja/SectionNavigation',
  component: SectionNavigation,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    activeId: 'overview',
    items,
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    sticky: { control: 'boolean' },
  },
} satisfies Meta<typeof SectionNavigation>;

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
      className="pd-section-navigation-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const SectionNavigationStory: Story = {
  name: 'SectionNavigation',
  render: (args) => (
    <StoryPresentationPage
      className="pd-section-navigation-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry SectionNavigation', en: 'SectionNavigation parameters' })}
          items={[
            { label: <Localized pl="Semantyka" en="Semantics" />, value: copy({ pl: 'realne linki href, nie panele', en: 'real href links, not panels' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="section-navigation"
      summary={
        <Localized
          pl="Nawigacja po realnych podstronach/kotwicach (href) z zaznaczonym aktywnym elementem — np. Integration Workspace. Różni się od Tabs tym, że elementy są linkami, nie przełącznikami paneli w miejscu."
          en="Navigation across real subpages/anchors (href) with a marked active item — e.g. Integration Workspace. Unlike Tabs, items are links, not in-place panel switches."
        />
      }
      title={<Localized pl="Nawigacja po realnych adresach." en="Navigation across real addresses." />}
    >
      <StorySection index="01" title={<Localized pl="Poziomo" en="Horizontal" />}>
        <div data-testid="section-nav-horizontal">
          <SectionNavigation {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Pionowo" en="Vertical" />}>
        <div data-testid="section-nav-vertical" style={{ maxWidth: '220px' }}>
          <SectionNavigation activeId="sync" items={items} orientation="vertical" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const active = canvas.getByTestId('section-nav-horizontal').querySelector('[aria-current="page"]');
    await expect(active).toHaveTextContent('Przegląd');

    const disabled = canvas.getByTestId('section-nav-horizontal').querySelector('[aria-disabled="true"]');
    await expect(disabled?.tagName).toBe('SPAN');

    await expect(canvas.getByTestId('section-nav-vertical')).toBeInTheDocument();
  },
};
