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
  FilterChip,
} from './FilterChip';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'Źródło',
    onRemove: fn(),
    removable: true,
    value: 'Google Ads',
  },
  argTypes: {
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    removable: { control: 'boolean' },
    tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof FilterChip>;

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
      className="pd-filter-chip-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const FilterChipStory: Story = {
  name: 'FilterChip',
  render: (args) => (
    <StoryPresentationPage
      className="pd-filter-chip-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry FilterChip', en: 'FilterChip parameters' })}
          items={[
            { label: <Localized pl="Odcienie" en="Tones" />, value: 'neutral / accent / success / warning / danger' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="filter-chip"
      summary={
        <Localized
          pl="Pojedynczy aktywny filtr wewnątrz FilterBar. removable pokazuje przycisk usunięcia; bez value chip prezentuje tylko etykietę."
          en="A single active filter inside FilterBar. removable shows a remove button; without value the chip presents only its label."
        />
      }
      title={<Localized pl="Aktywny filtr, który można zdjąć jednym kliknięciem." en="An active filter you can remove with one click." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="chip-controlled">
          <FilterChip {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Odcienie" en="Tones" />}>
        <div data-testid="chip-tones" style={{ display: 'flex', gap: 'var(--pd-space-2)', flexWrap: 'wrap' }}>
          <FilterChip label={copy({ pl: 'Neutralny', en: 'Neutral' })} removable tone="neutral" value="—" onRemove={fn()} />
          <FilterChip label={copy({ pl: 'Akcent', en: 'Accent' })} removable tone="accent" value="Google Ads" onRemove={fn()} />
          <FilterChip label={copy({ pl: 'Sukces', en: 'Success' })} removable tone="success" value="Gotowe" onRemove={fn()} />
          <FilterChip label={copy({ pl: 'Ostrzeżenie', en: 'Warning' })} removable tone="warning" value="Częściowe" onRemove={fn()} />
          <FilterChip label={copy({ pl: 'Krytyczny', en: 'Critical' })} removable tone="danger" value="Błąd" onRemove={fn()} />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Bez usuwania / zablokowany" en="Without removal / disabled" />}>
        <div data-testid="chip-states" style={{ display: 'flex', gap: 'var(--pd-space-2)', flexWrap: 'wrap' }}>
          <FilterChip label={copy({ pl: 'Stały segment', en: 'Fixed segment' })} removable={false} tone="neutral" value={copy({ pl: 'Ostatnie 30 dni', en: 'Last 30 days' })} />
          <FilterChip disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} removable tone="accent" value="—" onRemove={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('chip-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('chip-tones').children).toHaveLength(5);
    await expect(canvas.getByTestId('chip-states').children).toHaveLength(2);
  },
};
