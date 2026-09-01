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
  EmptyState,
} from './EmptyState';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'EmptyState opisuje brak danych — nigdy jako "0", zawsze jako zdanie wyjaśniające dlaczego i co zrobić dalej. Nie używaj EmptyState dla błędów — do tego służy ErrorState.',
      },
    },
  },
  args: {
    message: 'Podłącz pierwsze źródło danych, aby zobaczyć zamówienia.',
    onPrimaryAction: fn(),
    onSecondaryAction: fn(),
    primaryActionLabel: 'Połącz źródło',
    secondaryActionLabel: null,
    title: 'Brak danych do wyświetlenia',
    variant: 'empty',
  },
  argTypes: {
    message: { control: 'text' },
    primaryActionLabel: { control: 'text' },
    secondaryActionLabel: { control: 'text' },
    title: { control: 'text' },
    variant: { control: 'inline-radio', options: ['empty', 'search', 'forbidden', 'configuration'] },
  },
} satisfies Meta<typeof EmptyState>;

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
      className="pd-empty-state-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const EmptyStateStory: Story = {
  name: 'EmptyState',
  render: (args) => (
    <StoryPresentationPage
      className="pd-empty-state-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry EmptyState', en: 'EmptyState parameters' })}
          items={[
            { label: <Localized pl="Warianty" en="Variants" />, value: 'empty / search / forbidden / configuration' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="empty-state"
      summary={
        <Localized
          pl="Cztery warianty odpowiadają czterem różnym przyczynom braku danych — każdy z inną ikoną i innym następnym krokiem."
          en="Four variants map to four different reasons for missing data — each with its own icon and next step."
        />
      }
      title={<Localized pl="Brak danych to stan, nie błąd." en="No data is a state, not an error." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
      >
        <div data-testid="empty-state-controlled">
          <EmptyState {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Warianty" en="Variants" />}
      >
        <div className="pd-f0-icon-groups" data-testid="empty-state-variants">
          <article>
            <h3><Localized pl="empty — brak podłączonego źródła" en="empty — no source connected" /></h3>
            <div>
              <EmptyState message={copy({ pl: 'Podłącz pierwsze źródło, aby zobaczyć dane.', en: 'Connect your first source to see data.' })} onPrimaryAction={fn()} primaryActionLabel={copy({ pl: 'Połącz źródło', en: 'Connect source' })} title={copy({ pl: 'Brak danych', en: 'No data' })} variant="empty" />
            </div>
          </article>
          <article>
            <h3><Localized pl="search — brak wyników" en="search — no results" /></h3>
            <div>
              <EmptyState message={copy({ pl: 'Zmień filtry albo zapytanie wyszukiwania.', en: 'Adjust the filters or search query.' })} onPrimaryAction={fn()} primaryActionLabel={copy({ pl: 'Wyczyść filtry', en: 'Clear filters' })} title={copy({ pl: 'Nic nie znaleziono', en: 'Nothing found' })} variant="search" />
            </div>
          </article>
          <article>
            <h3><Localized pl="forbidden — brak dostępu" en="forbidden — no access" /></h3>
            <div>
              <EmptyState message={copy({ pl: 'Poproś administratora workspace o dostęp.', en: 'Ask your workspace admin for access.' })} title={copy({ pl: 'Brak uprawnień', en: 'No permission' })} variant="forbidden" />
            </div>
          </article>
          <article>
            <h3><Localized pl="configuration — wymaga konfiguracji" en="configuration — needs setup" /></h3>
            <div>
              <EmptyState message={copy({ pl: 'Dokończ konfigurację integracji, aby zobaczyć dane.', en: 'Finish configuring the integration to see data.' })} onPrimaryAction={fn()} primaryActionLabel={copy({ pl: 'Otwórz konfigurację', en: 'Open configuration' })} title={copy({ pl: 'Konfiguracja niekompletna', en: 'Configuration incomplete' })} variant="configuration" />
            </div>
          </article>
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('empty-state-controlled').querySelector('section');
    await expect(controlled).toHaveAttribute('data-variant', 'empty');
    await expect(controlled).toHaveAttribute('data-has-actions', 'true');
    await expect(canvas.getByRole('heading', { name: 'Brak danych do wyświetlenia' })).toBeInTheDocument();

    await expect(canvas.getByTestId('empty-state-variants').children).toHaveLength(4);
  },
};
