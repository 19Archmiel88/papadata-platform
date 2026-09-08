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
  DateRangePicker,
} from './DateRangePicker';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const presets = [
  { label: 'Ostatnie 7 dni', value: 'last7d' as const },
  { label: 'Ostatnie 30 dni', value: 'last30d' as const },
  { label: 'Od początku miesiąca', value: 'monthToDate' as const },
  { label: 'Zakres własny', value: 'custom' as const },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'Zakres analizy',
    onChange: fn(),
    presets,
    timezone: 'Europe/Warsaw',
    value: { from: '2026-08-01', preset: 'last30d' as const, timezone: 'Europe/Warsaw', to: '2026-08-29' },
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof DateRangePicker>;

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
      className="pd-date-range-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const DateRangePickerStory: Story = {
  name: 'DateRangePicker',
  render: (args) => (
    <StoryPresentationPage
      className="pd-date-range-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry DateRangePicker', en: 'DateRangePicker parameters' })}
          items={[
            { label: <Localized pl="Presety" en="Presets" />, value: String(presets.length) },
            { label: <Localized pl="Strefa czasowa" en="Timezone" />, value: args.timezone },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="date-range-picker"
      summary={
        <Localized
          pl="Preset + zakres własny w jednym kontrakcie DateRange. Wybranie daty od/do ręcznie automatycznie przełącza preset na custom — nigdy nie ma niespójności między presetem a realnymi datami."
          en="A preset plus a custom range in one DateRange contract. Manually picking a from/to date automatically switches the preset to custom — the preset and the real dates never fall out of sync."
        />
      }
      title={<Localized pl="Zakres dat, który zna swój własny preset." en="A date range that knows its own preset." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="date-range-controlled" style={{ maxWidth: '520px' }}>
          <DateRangePicker {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="date-range-states" style={{ display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '520px' }}>
          <DateRangePicker invalid label={copy({ pl: 'Wymagany zakres', en: 'Required range' })} message={copy({ pl: 'Wybierz zakres dat.', en: 'Choose a date range.' })} presets={presets} timezone="Europe/Warsaw" value={{ from: '', preset: undefined, timezone: 'Europe/Warsaw', to: '' }} onChange={fn()} />
          <DateRangePicker disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} presets={presets} timezone="Europe/Warsaw" value={{ from: '2026-08-01', preset: 'last30d', timezone: 'Europe/Warsaw', to: '2026-08-29' }} onChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('date-range-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('date-range-states').children).toHaveLength(2);
  },
};
