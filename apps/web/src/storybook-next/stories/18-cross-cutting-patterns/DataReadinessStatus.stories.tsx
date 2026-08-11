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
    status: 'Ready',
    tone: 'success' as const,
  },
  {
    description: 'Synchronizacja trwa i nie blokuje odczytu ostatniego wyniku.',
    domain: 'Integracje',
    id: 'syncing',
    status: 'Syncing',
    tone: 'processing' as const,
  },
  {
    description: 'Provider raportuje opóźnienie atrybucji lub importu.',
    domain: 'Dane',
    id: 'delayed',
    status: 'Delayed',
    tone: 'warning' as const,
  },
  {
    description: 'Część źródeł jest dostępna, ale decyzja musi widzieć lukę.',
    domain: 'Dane',
    id: 'partial',
    status: 'Partial',
    tone: 'warning' as const,
  },
  {
    description: 'Dane są starsze niż próg świeżości dla danej powierzchni.',
    domain: 'Dane',
    id: 'stale',
    status: 'Stale',
    tone: 'warning' as const,
  },
  {
    description: 'Proces czeka na właściciela, politykę albo warunek dostępu.',
    domain: 'Operacje',
    id: 'blocked',
    status: 'Blocked',
    tone: 'critical' as const,
  },
  {
    description: 'Usługa lub pakiet jest czasowo niedostępny.',
    domain: 'Platforma',
    id: 'unavailable',
    status: 'Unavailable',
    tone: 'neutral' as const,
  },
  {
    description: 'Użytkownik albo klient musi wykonać jawny następny krok.',
    domain: 'Klient',
    id: 'action-required',
    status: 'Action required',
    tone: 'info' as const,
  },
] as const;

function ReadinessList() {
  return (
    <div className="pd-x18-stack">
      <InlineNotice
        message="Ten wzorzec opisuje readiness przekrojowo. Stany danych wykresów analitycznych pozostają własnością 15.08 ChartDataState i nie są przenoszone do sekcji 18."
        title="Granica ownership"
        tone="info"
      />

      <div
        aria-label="Lista statusów readiness"
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
              status="Readiness"
              text={row.status}
              tone={row.tone}
            />
            <span className="pd-x18-description">{row.description}</span>
          </div>
        ))}
      </div>

      <ul className="pd-x18-separator-list pd-x18-separator-list--inline">
        <li>
          <span className="pd-x18-term">Readiness</span>
          <span className="pd-x18-description">
            Mówi, czy obszar jest gotowy do użycia, a nie tylko czy endpoint
            odpowiedział.
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
            `Action required` musi wskazywać konkretny następny krok.
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
          ariaLabel="Parametry wzorca readiness"
          items={[
            { label: 'Kontrakt', value: '18.08' },
            { label: 'Handoff', value: '15.08 ChartDataState' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.08"
      summary="Readiness pokazuje gotowość obszaru produktu i konsumuje StatusBadge/InlineNotice z 00. Nie tworzy drugiego słownika statusów ani nie przejmuje 15.08 ChartDataState."
      title="Readiness operacyjny"
    >
      <StoryPresentationSection
        index="01"
        summary="Gotowość operacyjna jako lista użyć kontekstowych. Wygląd badge'a i notice pozostaje własnością 00."
        title="Przekrojowa gotowość danych"
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
        name: 'Lista statusów readiness',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Action required'),
    ).toBeInTheDocument();
  },
};
