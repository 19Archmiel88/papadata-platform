import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  InlineNotice,
  StatusBadge,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const readinessRows = [
  {
    description: 'Wszystkie wymagane źródła są świeże i kompletne.',
    domain: 'Workspace',
    id: 'ready',
    status: 'Gotowe',
    tone: 'success' as const,
  },
  {
    description: 'Synchronizacja trwa i nie blokuje odczytu ostatniego wyniku.',
    domain: 'Integracje',
    id: 'syncing',
    status: 'Synchronizacja',
    tone: 'processing' as const,
  },
  {
    description: 'Proces danych raportuje opóźnienie importu poza powierzchnią wykresu.',
    domain: 'Proces danych',
    id: 'operational-delayed',
    status: 'Opóźnienie procesu',
    tone: 'warning' as const,
  },
  {
    description: 'Część źródeł operacyjnych jest dostępna, ale proces nadal ma lukę.',
    domain: 'Proces danych',
    id: 'operational-partial',
    status: 'Zakres częściowy',
    tone: 'warning' as const,
  },
  {
    description: 'Ostatni przebieg procesu jest starszy niż próg świeżości operacyjnej.',
    domain: 'Proces danych',
    id: 'operational-stale',
    status: 'Do odświeżenia',
    tone: 'warning' as const,
  },
  {
    description: 'Proces czeka na właściciela, politykę albo warunek dostępu.',
    domain: 'Operacje',
    id: 'blocked',
    status: 'Zablokowane',
    tone: 'critical' as const,
  },
  {
    description: 'Usługa lub pakiet jest czasowo niedostępny.',
    domain: 'Platforma',
    id: 'unavailable',
    status: 'Niedostępne',
    tone: 'neutral' as const,
  },
  {
    description: 'Użytkownik albo klient musi wykonać jawny następny krok.',
    domain: 'Klient',
    id: 'action-required',
    status: 'Wymaga działania',
    tone: 'info' as const,
  },
] as const;

function ReadinessList() {
  return (
    <div className="pd-x18-stack">
      <InlineNotice
        message="Ten wzorzec opisuje gotowość przekrojową. Stany danych wykresów analitycznych pozostają własnością 15.08 ChartDataState i nie są przenoszone do sekcji 18."
        title="Granica odpowiedzialności"
        tone="info"
      />

      <div
        aria-label="Lista stanów gotowości"
        className="pd-x18-readiness-list"
        role="list"
      >
        {readinessRows.map((row) => (
          <div
            className="pd-x18-readiness-line"
            key={row.id}
            role="listitem"
          >
            <span className="pd-x18-term">{row.domain}</span>
            <StatusBadge
              status="Gotowość"
              text={row.status}
              tone={row.tone}
            />
            <span className="pd-x18-description">{row.description}</span>
          </div>
        ))}
      </div>

      <ul className="pd-x18-separator-list pd-x18-separator-list--inline">
        <li>
          <span className="pd-x18-term">Gotowość</span>
          <span className="pd-x18-description">
            Mówi, czy obszar jest gotowy do użycia, a nie tylko czy punkt
            końcowy odpowiedział.
          </span>
        </li>
        <li>
          <span className="pd-x18-term">Status danych</span>
          <span className="pd-x18-description">
            Mówi, jak czytać wynik i gdzie użytkownik ma zobaczyć ograniczenie.
          </span>
        </li>
        <li>
          <span className="pd-x18-term">Akcja</span>
          <span className="pd-x18-description">
            „Wymaga działania” musi wskazywać konkretny następny krok.
          </span>
        </li>
      </ul>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Readiness operacyjny',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DataReadinessStatusStory: Story = {
  name: 'Readiness operacyjny',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca gotowości"
          items={[
            { label: 'Kontrakt', value: '18.08' },
            { label: 'Handoff', value: '15.08 ChartDataState' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.08"
      summary="Gotowość pokazuje stan obszaru produktu i konsumuje StatusBadge/InlineNotice z 00. Nie tworzy drugiego słownika statusów ani nie przejmuje 15.08 ChartDataState."
      title="Readiness operacyjny"
    >
      <StoryPresentationSection
        index="01"
        summary="Gotowość operacyjna jako lista użyć kontekstowych. Wygląd StatusBadge i InlineNotice pozostaje własnością 00."
        title="Przekrojowa gotowość procesu danych"
      >
        <ReadinessList />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Readiness operacyjny',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getAllByText(/15.08 ChartDataState/).length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getByRole('list', {
        name: 'Lista stanów gotowości',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Wymaga działania'),
    ).toBeInTheDocument();
  },
};
