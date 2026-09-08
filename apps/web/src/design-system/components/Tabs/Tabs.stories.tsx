import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  Tabs,
} from './Tabs';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const items = [
  { id: 'overview', label: 'Przegląd', panel: 'Zawartość zakładki Przegląd.' },
  { id: 'data', label: 'Dane', panel: 'Zawartość zakładki Dane.' },
  { id: 'sync', badge: '3', label: 'Synchronizacja', panel: 'Zawartość zakładki Synchronizacja.' },
  { id: 'config', disabled: true, label: 'Konfiguracja', panel: 'Zawartość zakładki Konfiguracja.' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Nawigacja/Tabs',
  component: Tabs,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    activation: 'automatic',
    activeId: 'overview',
    items,
    onActiveIdChange: fn(),
    orientation: 'horizontal',
  },
  argTypes: {
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof Tabs>;

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
      className="pd-tabs-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const TabsStory: Story = {
  name: 'Tabs',
  render: (args) => (
    <StoryPresentationPage
      className="pd-tabs-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Tabs', en: 'Tabs parameters' })}
          items={[
            { label: <Localized pl="Aktywacja" en="Activation" />, value: 'automatic / manual' },
            { label: <Localized pl="Orientacja" en="Orientation" />, value: 'horizontal / vertical' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="tabs"
      summary={
        <Localized
          pl="Przełączanie widocznych paneli treści w obrębie jednego ekranu (np. Przegląd/Dane/Synchronizacja/Konfiguracja). Do przełączania trybu/wartości bez odrębnych paneli użyj SegmentedControl."
          en="Switching between visible content panels within one screen (e.g. Overview/Data/Sync/Configuration). For switching a mode/value without separate panels, use SegmentedControl."
        />
      }
      title={<Localized pl="Jeden ekran, kilka paneli." en="One screen, several panels." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="tabs-controlled">
          <Tabs {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Pionowe" en="Vertical" />}>
        <div data-testid="tabs-vertical" style={{ maxWidth: '260px' }}>
          <Tabs activation="automatic" activeId="data" items={items} orientation="vertical" onActiveIdChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tabs = canvas.getByTestId('tabs-controlled').querySelectorAll('[role="tab"]');
    await expect(tabs).toHaveLength(items.length);
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await expect(tabs[3]).toBeDisabled();

    await expect(canvas.getByTestId('tabs-vertical')).toBeInTheDocument();
  },
};
