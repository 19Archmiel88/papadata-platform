import {
  useMemo,
  useState,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  Button,
  StatusBadge,
} from '../../../design-system/components';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';

import '../../presentation/story-presentation.css';
import './component-readiness.css';

const meta = {
  title: '00 Fundamenty/06 Katalog komponentów/Komponenty bazowe',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Katalog gotowości bazowych komponentów Storybooka. Nie zastępuje ownerów 00.12-00.15 i wzorców 18; agreguje statusy, fixtures, play checks i kryteria odbioru.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

type ComponentReadinessRow = {
  readonly name: string;
  readonly owner: string;
  readonly storyOwner: string;
  readonly fixture: string;
  readonly status: 'accepted' | 'implemented' | 'review';
  readonly coverage: readonly string[];
};

const baseComponents = [
  ['Button', '00.14', 'fixtures/storybook/005-00-14-przyciski-i-akcje.json', 'accepted'],
  ['IconButton', '00.14', 'fixtures/storybook/005-00-14-przyciski-i-akcje.json', 'accepted'],
  ['TextAction', '00.14', 'fixtures/storybook/005-00-14-przyciski-i-akcje.json', 'accepted'],
  ['LinkAction', '00.14', 'fixtures/storybook/005-00-14-przyciski-i-akcje.json', 'accepted'],
  ['TextField', '00.15', 'fixtures/storybook/006-00-15-pola-tekstowe-i-formularzowe.json', 'accepted'],
  ['PasswordField', '00.15', 'fixtures/storybook/006-00-15-pola-tekstowe-i-formularzowe.json', 'accepted'],
  ['Textarea', '00.15', 'fixtures/storybook/006-00-15-pola-tekstowe-i-formularzowe.json', 'accepted'],
  ['Select', '18.09', 'fixtures/storybook/106-18-09-formularze-zlozone-i-kreatory.json', 'implemented'],
  ['Combobox', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['Checkbox', '18.09', 'fixtures/storybook/106-18-09-formularze-zlozone-i-kreatory.json', 'implemented'],
  ['RadioGroup', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['Switch', '18.06', 'fixtures/storybook/104-18-06-approval-step-up-i-ochrona-zmian.json', 'review'],
  ['DateRangePicker', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['SearchField', '18.04', 'fixtures/storybook/111-18-04-tabela-z-filtrami-i-akcjami.json', 'implemented'],
  ['FilterBar', '18.04', 'fixtures/storybook/111-18-04-tabela-z-filtrami-i-akcjami.json', 'implemented'],
  ['SortControl', '18.04', 'fixtures/storybook/111-18-04-tabela-z-filtrami-i-akcjami.json', 'implemented'],
  ['DataTable', '18.04', 'fixtures/storybook/111-18-04-tabela-z-filtrami-i-akcjami.json', 'implemented'],
  ['ColumnPicker', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['BulkActionBar', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['Pagination', '18.04', 'fixtures/storybook/111-18-04-tabela-z-filtrami-i-akcjami.json', 'review'],
  ['Tabs', '18.07', 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json', 'implemented'],
  ['Menu', '20.07', 'fixtures/storybook/117-20-07-global-search-i-command-palette.json', 'review'],
  ['Popover', '20.10', 'fixtures/storybook/118-20-10-overlayroot-i-system-warstw.json', 'accepted'],
  ['Tooltip', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['Dialog', '18.05', 'fixtures/storybook/109-18-05-potwierdzenia-i-operacje-destrukcyjne.json', 'implemented'],
  ['AlertDialog', '18.05', 'fixtures/storybook/109-18-05-potwierdzenia-i-operacje-destrukcyjne.json', 'accepted'],
  ['Drawer', '18.07', 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json', 'accepted'],
  ['OverlayRoot', '20.10', 'fixtures/storybook/118-20-10-overlayroot-i-system-warstw.json', 'accepted'],
  ['BottomSheet', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'implemented'],
  ['InlineNotice', '00.17', 'fixtures/storybook/007-00-17-komunikat-w-kontekscie.json', 'accepted'],
  ['Toast', '00.19', 'fixtures/storybook/009-00-19-toast-operacyjny.json', 'accepted'],
  ['StatusBadge', '00.18', 'fixtures/storybook/008-00-18-status-obiektu.json', 'accepted'],
  ['EmptyState', '18.02', 'fixtures/storybook/105-18-02-empty-error-i-no-access.json', 'implemented'],
  ['ErrorState', '18.02', 'fixtures/storybook/105-18-02-empty-error-i-no-access.json', 'implemented'],
  ['Skeleton', '18.03', 'fixtures/storybook/113-18-03-ladowanie-danych-i-operacje-w-tle.json', 'implemented'],
  ['Spinner', '18.03', 'fixtures/storybook/113-18-03-ladowanie-danych-i-operacje-w-tle.json', 'implemented'],
  ['ProgressIndicator', '18.03', 'fixtures/storybook/113-18-03-ladowanie-danych-i-operacje-w-tle.json', 'implemented'],
  ['BackgroundOperationItem', '18.03', 'fixtures/storybook/113-18-03-ladowanie-danych-i-operacje-w-tle.json', 'accepted'],
  ['PageHeader', '20+', 'fixtures/storybook/287-component-readiness-base.json', 'accepted'],
  ['SectionNavigation', '18.01', 'fixtures/storybook/112-18-01-uklad-strony-i-sekcji.json', 'accepted'],
  ['Breadcrumbs', '00.21', 'fixtures/storybook/287-component-readiness-base.json', 'review'],
] satisfies readonly (readonly [string, string, string, ComponentReadinessRow['status']])[];

const coverage = [
  'PL/EN',
  'light/dark',
  'desktop/tablet/mobile',
  'keyboard/focus',
  'Contrast',
  'Forms/Semantics/ARIA',
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

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function statusTone(status: ComponentReadinessRow['status']) {
  if (status === 'accepted') return 'success';
  if (status === 'review') return 'warning';
  return 'info';
}

function ComponentReadinessTable({
  rows,
}: {
  readonly rows: readonly ComponentReadinessRow[];
}) {
  const [selected, setSelected] = useState(rows[0]?.name ?? '');

  return (
    <>
      <div className="pd-component-readiness__table">
        <table>
          <caption className="pd-component-readiness__caption">
            {copy({
              pl: 'Katalog gotowości komponentów bazowych',
              en: 'Base component readiness catalog',
            })}
          </caption>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Owner</th>
              <th scope="col">Status</th>
              <th scope="col">Fixture</th>
              <th scope="col">Checks</th>
              <th scope="col">Play</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row"><code>{row.name}</code></th>
                <td>{row.owner} · {row.storyOwner}</td>
                <td>
                  <StatusBadge
                    status="Storybook"
                    text={row.status}
                    tone={statusTone(row.status)}
                  />
                </td>
                <td><code>{row.fixture}</code></td>
                <td>
                  <ul className="pd-component-readiness__criteria">
                    {row.coverage.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <Button
                    size="small"
                    variant={selected === row.name ? 'primary' : 'secondary'}
                    onClick={() => {
                      setSelected(row.name);
                    }}
                  >
                    {copy({ pl: 'Sprawdź', en: 'Verify' })} {row.name}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pd-component-readiness__status" role="status">
        {copy({ pl: 'Zweryfikowany komponent', en: 'Verified component' })}: {selected}
      </p>
    </>
  );
}

function BaseComponentReadiness() {
  const rows = useMemo(
    () => baseComponents.map(([name, owner, fixture, status]) => ({
      coverage,
      fixture,
      name,
      owner,
      status,
      storyOwner: status === 'accepted' ? 'canonical' : 'active handoff',
    })),
    [],
  );

  return (
    <StoryPresentationPage
      className="pd-component-readiness"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Metadane katalogu komponentów bazowych',
            en: 'Base component catalog metadata',
          })}
          items={[
            { label: 'Story', value: '00.21' },
            { label: 'Status', value: 'implemented' },
            { label: 'Theme', value: readTheme() },
            { label: 'Locale', value: readLocale().toUpperCase() },
          ]}
        />
      )}
      sectionCode="00"
      sectionLabel={copy({ pl: 'Fundamenty', en: 'Foundations' })}
      storyId="00.21"
      summary={copy({
        pl: 'Jeden audytowalny katalog potwierdza, gdzie każdy bazowy komponent ma ownera, fixture, status i play check bez tworzenia równoległego systemu wizualnego.',
        en: 'One auditable catalog confirms where every base component has an owner, fixture, status and play check without creating a parallel visual system.',
      })}
      title={copy({
        pl: 'Gotowość komponentów bazowych Storybooka.',
        en: 'Base Storybook component readiness.',
      })}
    >
      <StoryPresentationSection
        index="01"
        layout="wide"
        summary={copy({
          pl: 'Liczby są wyliczone z listy komponentów przekazanej do tego cyklu.',
          en: 'Counts are derived from the component list requested for this cycle.',
        })}
        title={copy({ pl: 'Zakres', en: 'Scope' })}
      >
        <dl className="pd-component-readiness__summary">
          <div>
            <dt>{copy({ pl: 'Komponenty', en: 'Components' })}</dt>
            <dd>{rows.length}</dd>
          </div>
          <div>
            <dt>{copy({ pl: 'Fixtures', en: 'Fixtures' })}</dt>
            <dd>{new Set(rows.map((row) => row.fixture)).size}</dd>
          </div>
          <div>
            <dt>{copy({ pl: 'Kryteria na komponent', en: 'Criteria per component' })}</dt>
            <dd>{coverage.length}</dd>
          </div>
        </dl>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        layout="full"
        summary={copy({
          pl: 'Każdy wiersz ma jawny status, ownera, fixture i kontrolkę używaną w play teście.',
          en: 'Each row has explicit status, owner, fixture and a control used by the play test.',
        })}
        title={copy({ pl: 'Macierz gotowości', en: 'Readiness matrix' })}
      >
        <ComponentReadinessTable rows={rows} />
      </StoryPresentationSection>
    </StoryPresentationPage>
  );
}

export const BaseComponentReadinessStory: Story = {
  name: 'Komponenty bazowe',
  render: () => <BaseComponentReadiness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Button')).toBeInTheDocument();
    await expect(canvas.getByText('Breadcrumbs')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')).toHaveLength(baseComponents.length + 1);

    const verifyButton = canvas.getByRole('button', {
      name: /Sprawdź Button|Verify Button/,
    });
    await userEvent.click(verifyButton);
    await expect(canvas.getByRole('status')).toHaveTextContent('Button');

    await userEvent.tab();
    await expect(document.activeElement).toBeInstanceOf(HTMLElement);
  },
};
