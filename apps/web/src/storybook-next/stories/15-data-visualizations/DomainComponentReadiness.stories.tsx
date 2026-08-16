import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  Button,
  StatusBadge,
} from '../../../design-system/components';
import {
  domainComponentCatalogItems,
  domainP0BacklogItems,
} from '../../../design-system/components/Domain';
import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';

import '../../presentation/story-presentation.css';
import '../00-foundations/component-readiness.css';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Analityczne i domenowe',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Katalog gotowości komponentów analitycznych i domenowych: status, owner, fixture, play checks oraz wymagane warianty PL/EN, light/dark i responsive.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function assertActiveElementIsHtmlElement() {
  if (!(document.activeElement instanceof HTMLElement)) {
    throw new Error('Aktywny element nie jest kontrolką HTML po przejściu fokusu.');
  }
}

type ReadinessRow = {
  readonly name: string;
  readonly owner: string;
  readonly fixture: string;
  readonly status: 'accepted' | 'implemented';
};

type P0DomainBacklogRow = {
  readonly id: string;
  readonly story: string;
  readonly document: string;
  readonly fixture: string;
  readonly status: ReadinessRow['status'];
};

const domainComponents = domainComponentCatalogItems.map((item) => [
  item.name,
  item.owner,
  item.fixture,
  item.status,
]) satisfies readonly (readonly [string, string, string, ReadinessRow['status']])[];

const p0DomainBacklogItems = domainP0BacklogItems satisfies readonly P0DomainBacklogRow[];

const checks = [
  'PL/EN',
  'light/dark',
  'desktop/tablet/mobile',
  'keyboard/focus',
  'Contrast',
  'Semantics/ARIA',
  'Alt text policy',
  'Error states',
  'fixture',
  'play test',
] as const;

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

function text(pl: string, en: string) {
  return readLocale() === 'en' ? en : pl;
}

function DomainP0BacklogTable({
  rows,
}: {
  readonly rows: readonly P0DomainBacklogRow[];
}) {
  return (
    <div className="pd-component-readiness__table pd-component-readiness__table--p0">
      <table>
        <caption className="pd-component-readiness__caption">
          {text('Zamknięcie P0 komponentów domenowych', 'Domain component P0 closure')}
        </caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">{text('Story', 'Story')}</th>
            <th scope="col">{text('Dokument', 'Document')}</th>
            <th scope="col">{text('Fixture', 'Fixture')}</th>
            <th scope="col">Status</th>
            <th scope="col">{text('Kontrole', 'Checks')}</th>
            <th scope="col">{text('Play test', 'Play test')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row"><code>{row.id}</code></th>
              <td>{row.story}</td>
              <td><code>{row.document}</code></td>
              <td><code>{row.fixture}</code></td>
              <td>
                <StatusBadge
                  status="P0"
                  text={row.status}
                  tone={row.status === 'accepted' ? 'success' : 'info'}
                />
              </td>
              <td>
                <ul className="pd-component-readiness__criteria">
                  {checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
              </td>
              <td>
                <Button size="small" variant="secondary">
                  {text('Sprawdź', 'Verify')} {row.id}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DomainReadiness() {
  const rows = domainComponents.map(([name, owner, fixture, status]) => ({
    fixture,
    name,
    owner,
    status,
  }));

  return (
    <StoryPresentationPage
      className="pd-component-readiness"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={text('Metadane katalogu domenowego', 'Domain catalog metadata')}
          items={[
            { label: 'Story', value: '15.11' },
            { label: 'Status', value: 'implemented' },
            { label: text('Motyw', 'Theme'), value: readTheme() },
            { label: text('Język', 'Locale'), value: readLocale().toUpperCase() },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel={text('Wykresy i dane', 'Charts and data')}
      storyId="15.11"
      summary={text(
        'Katalog zamyka wspólne wymagania dla komponentów analitycznych i domenowych bez przejmowania ownerów wykresów 15.01-15.10 ani wzorców 18.',
        'The catalog closes shared requirements for analytical and domain components without taking over chart owners 15.01-15.10 or patterns 18.',
      )}
      title={text('Gotowość komponentów analityczno-domenowych.', 'Analytical and domain component readiness.')}
    >
      <StoryPresentationSection
        index="01"
        layout="wide"
        summary={text(
          'Statusy wskazują bieżący owner lub aktywny handoff, fixture oraz wymagany zestaw testów.',
          'Statuses show current owner or active handoff, fixture and required checks.',
        )}
        title={text('Zakres', 'Scope')}
      >
        <dl className="pd-component-readiness__summary">
          <div>
            <dt>{text('Komponenty', 'Components')}</dt>
            <dd>{rows.length}</dd>
          </div>
          <div>
            <dt>{text('Fixture', 'Fixtures')}</dt>
            <dd>{new Set(rows.map((row) => row.fixture)).size}</dd>
          </div>
          <div>
            <dt>{text('Kryteria', 'Criteria')}</dt>
            <dd>{checks.length}</dd>
          </div>
        </dl>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        layout="full"
        summary={text(
          'Każdy komponent ma jawny status, coverage i kontrolkę używaną przez play test.',
          'Each component has explicit status, coverage and a control used by the play test.',
        )}
        title={text('Macierz gotowości', 'Readiness matrix')}
      >
        <div className="pd-component-readiness__table">
          <table>
            <thead>
              <tr>
                <th scope="col">{text('Komponent', 'Component')}</th>
                <th scope="col">{text('Właściciel', 'Owner')}</th>
                <th scope="col">Status</th>
                <th scope="col">{text('Fixture', 'Fixture')}</th>
                <th scope="col">{text('Kontrole', 'Checks')}</th>
                <th scope="col">{text('Play test', 'Play test')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row"><code>{row.name}</code></th>
                  <td>{row.owner}</td>
                  <td>
                    <StatusBadge
                      status="Storybook"
                      text={row.status}
                      tone={row.status === 'accepted' ? 'success' : 'info'}
                    />
                  </td>
                  <td><code>{row.fixture}</code></td>
                  <td>
                    <ul className="pd-component-readiness__criteria">
                      {checks.map((check) => (
                        <li key={check}>{check}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <Button size="small" variant="secondary">
                      {text('Sprawdź', 'Verify')} {row.name}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StoryPresentationSection>
    </StoryPresentationPage>
  );
}

function DomainP0BacklogReadiness() {
  return (
    <StoryPresentationPage
      className="pd-component-readiness"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={text('Metadane zamknięcia P0 domeny', 'Domain P0 closure metadata')}
          items={[
            { label: 'Story', value: '15.12' },
            { label: 'Status', value: 'implemented' },
            { label: text('Motyw', 'Theme'), value: readTheme() },
            { label: text('Język', 'Locale'), value: readLocale().toUpperCase() },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel={text('Wykresy i dane', 'Charts and data')}
      storyId="15.12"
      summary={text(
        'Koordynacyjny katalog zamyka domenowe pozycje P0 z audytu 2026-08-14 bez przejmowania ownerów 15.01-15.10 ani wzorców 18.',
        'The coordination catalog closes domain P0 items from the 2026-08-14 audit without taking over owners 15.01-15.10 or patterns 18.',
      )}
      title={text('Backlog P0 komponentów domenowych.', 'Domain component P0 backlog.')}
    >
      <StoryPresentationSection
        index="01"
        layout="wide"
        summary={text(
          'Lista obejmuje analityczne i domenowe pozycje P0 przeniesione do jawnego statusu rejestrowego.',
          'The list covers analytical and domain P0 items moved into explicit registry status.',
        )}
        title={text('Zakres zamknięcia', 'Closure scope')}
      >
        <dl className="pd-component-readiness__summary">
          <div>
            <dt>{text('Pozycje P0', 'P0 items')}</dt>
            <dd>{p0DomainBacklogItems.length}</dd>
          </div>
          <div>
            <dt>{text('Fixture', 'Fixtures')}</dt>
            <dd>{new Set(p0DomainBacklogItems.map((row) => row.fixture)).size}</dd>
          </div>
          <div>
            <dt>{text('Kryteria na pozycję', 'Criteria per item')}</dt>
            <dd>{checks.length}</dd>
          </div>
        </dl>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        layout="wide"
        summary={text(
          'Każdy wiersz ma dokument źródłowy, fixture, status, checklistę dostępności i kontrolkę używaną przez play test.',
          'Each row has a source document, fixture, status, accessibility checklist and a control used by the play test.',
        )}
        title={text('Rejestr P0', 'P0 registry')}
      >
        <DomainP0BacklogTable rows={p0DomainBacklogItems} />
      </StoryPresentationSection>
    </StoryPresentationPage>
  );
}

export const AnalityczneIDomenoweStory: Story = {
  name: 'Analityczne i domenowe',
  render: () => <DomainReadiness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ChartFrame')).toBeInTheDocument();
    await expect(canvas.getByText('PairingFlow')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')).toHaveLength(domainComponents.length + 1);

    const button = canvas.getByRole('button', {
      name: /Sprawdź ChartFrame|Verify ChartFrame/,
    });
    await userEvent.click(button);
    await userEvent.tab();
    assertActiveElementIsHtmlElement();
  },
};

export const BacklogP0KomponentowDomenowychStory: Story = {
  name: 'Backlog P0 komponentów domenowych',
  render: () => <DomainP0BacklogReadiness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('P0.SB09')).toBeInTheDocument();
    await expect(canvas.getByText('10 Komponenty domenowe/SyncTimeline')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')).toHaveLength(p0DomainBacklogItems.length + 1);

    const button = canvas.getByRole('button', {
      name: /Sprawdź P0\.SB09|Verify P0\.SB09/,
    });
    await userEvent.click(button);
    await userEvent.tab();
    assertActiveElementIsHtmlElement();
  },
};
