import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { DataQualityCenterScreen } from '../../features/data-quality';
import {
  dataQualityStoryFixtures,
  type DataQualityFixtureId,
} from '../../features/data-quality/dataQualityFixtures';

type DataQualityStoryArgs = {
  fixtureId: DataQualityFixtureId;
  theme: 'light' | 'dark';
};

function DataQualityStory({ fixtureId, theme }: DataQualityStoryArgs) {
  return (
    <DataQualityCenterScreen
      fixture={dataQualityStoryFixtures[fixtureId]}
      theme={theme}
    />
  );
}

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Jakość danych i integralność',
  component: DataQualityStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    fixtureId: {
      control: 'select',
      options: Object.keys(dataQualityStoryFixtures),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
  args: {
    fixtureId: 'ready',
    theme: 'dark',
  },
} satisfies Meta<typeof DataQualityStory>;

export default meta;

type Story = StoryObj<typeof meta>;

function story(fixtureId: DataQualityFixtureId, name: string): Story {
  return {
    name,
    args: { fixtureId },
  };
}

export const GotowyDataset: Story = {
  ...story('ready', 'Gotowy dataset'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(/Dataset może wejść do Fali 4/i)).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /Reprocess/i }));
    await expect(canvas.findByText(/Reprocess: komenda przyjęta/i)).resolves.toBeInTheDocument();
  },
};

export const BrakDanych = story('no_data', 'Brak danych');
export const Pobieranie = story('ingesting', 'Pobieranie danych');
export const CzescDanych = story('partial', 'Częściowy dataset');
export const Opoznione = story('delayed', 'Dane opóźnione');
export const Nieprawidlowe = story('invalid', 'Dataset nieprawidłowy');
export const Przetwarzanie = story('processing', 'Przetwarzanie');
export const Resynchronizacja = story('resync_required', 'Wymagana resynchronizacja');
export const Zablokowane = story('blocked', 'Dataset zablokowany');
export const NiezgodnoscSchematu = story('schema_mismatch', 'Niezgodność schematu');
export const BrakWymaganegoPola = story('missing_required_field', 'Brak wymaganego pola');
export const NieznanyStatus = story('unknown_status', 'Nieznany status');
export const BrakWaluty = story('missing_currency', 'Brak waluty');
export const PrzekroczonaSwiezosc = story('freshness_exceeded', 'Przekroczona świeżość');
export const DuplikatSource = story('duplicate_source_record', 'Duplikat source record');
export const ExactMatch = story('exact_match', 'Exact matching');
export const OverlapPotwierdzony = story('confirmed_overlap', 'Overlap potwierdzony');
export const OverlapNiejednoznaczny = story('ambiguous_overlap', 'Overlap niejednoznaczny');
export const OverlapNierozstrzygniety = story('unresolved_overlap', 'Overlap nierozstrzygnięty');
export const BrakSourceAuthority = story('source_authority_missing', 'Brak source authority');
export const SourceAuthorityAktywna = story('source_authority_active', 'Source authority aktywna');
export const SourceAuthorityZmieniona = story('source_authority_changed', 'Source authority zmieniona');
export const ManualReviewWymagany = story('manual_review_required', 'Manual review wymagany');
export const ManualReviewNieaktualny = story('stale_manual_review', 'Manual review nieaktualny');
export const BrakCapability = story('no_capability', 'Brak capability');
export const DrugieZatwierdzenie = story('second_approval_required', 'Drugie zatwierdzenie');
export const IssueBezOwnera = story('issue_without_owner', 'Issue bez ownera');
export const IssuePrzypisane = story('issue_assigned', 'Issue przypisane');
export const IssueRozwiazane = story('issue_resolved', 'Issue rozwiązane');
export const ReprocessKolejka = story('reprocess_queued', 'Reprocess w kolejce');
export const ReprocessWTrakcie = story('reprocess_running', 'Reprocess w toku');
export const ReprocessBlad = story('reprocess_failed', 'Reprocess z błędem');
export const ReprocessZakonczony = story('reprocess_completed', 'Reprocess zakończony');
export const RekoncyliacjaWTolerancji = story(
  'reconciliation_within_tolerance',
  'Reconciliation w tolerancji',
);
export const RekoncyliacjaPozaTolerancja = story(
  'reconciliation_outside_tolerance',
  'Reconciliation poza tolerancją',
);
export const ImpactOldNew = story('old_new_impact', 'Impact old/new');
export const OkresyHistoryczneInvalidated = story(
  'historical_periods_invalidated',
  'Okresy historyczne unieważnione',
);
export const BrakLineage = story('missing_lineage', 'Brak lineage');
export const BrakDostepu = story('forbidden', 'Brak dostępu');
export const WygaslaSesja = story('expired_session', 'Wygasła sesja');
export const ZmianaWorkspacePodczasOperacji = story(
  'workspace_switched_during_operation',
  'Zmiana workspace podczas operacji',
);
export const MotywJasny = {
  ...story('ready', 'Motyw jasny'),
  args: {
    fixtureId: 'ready',
    theme: 'light',
  },
} satisfies Story;
