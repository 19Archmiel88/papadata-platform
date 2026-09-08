import { buildReportSnapshot } from './SavedReports.build';
import {
  defaultReportConfig,
  type ReportsStore,
  type ReportTemplateId,
  type SavedReport,
} from './SavedReports.model';

function saved(
  id: string,
  template: ReportTemplateId,
  title: string,
  question: string,
  notes: string,
  owner = 'Anna Kowalska',
): SavedReport {
  const config = { ...defaultReportConfig(template), title, question, notes };
  const now = '2026-09-01T08:30:00Z';
  return {
    id,
    revision: 1,
    owner,
    ownerId: owner.startsWith('Artur') ? 'artur' : 'anna',
    createdAt: now,
    updatedAt: now,
    favorite: false,
    archived: false,
    draft: null,
    versions: [
      {
        number: 1,
        createdAt: now,
        author: owner,
        note: 'Podsumowanie zamkniętego miesiąca',
        config,
        snapshot: buildReportSnapshot(config, now),
      },
    ],
  };
}
export function createReportsDemo(): ReportsStore {
  const result = saved(
    'RAP-001',
    'overview',
    'Sierpień 2026 · wynik biznesu',
    'Ile zostaje po koszcie produktów, realizacji i marketingu?',
    'Przed ustaleniem budżetu na wrzesień porównaj marżę po marketingu z wydatkami na pozyskanie. Raport obejmuje zakończony miesiąc.',
    'Artur Wiśniewski',
  );
  result.favorite = true;
  const prior = {
    ...result.versions[0].config,
    notes: 'Wstępny komentarz do zamknięcia sierpnia.',
  };
  result.versions = [
    { ...result.versions[0], config: prior },
    {
      ...result.versions[0],
      number: 2,
      createdAt: '2026-09-02T09:15:00Z',
      note: 'Doprecyzowanie komentarza do budżetu',
    },
  ];
  result.revision = 2;
  result.updatedAt = result.versions[1].createdAt;
  const products = saved(
    'RAP-002',
    'products',
    'Które produkty pracują na marżę?',
    'Gdzie sprzedaż nie przekłada się na znany wynik?',
    'Uzupełnić brakujący koszt Olejku z retinolem przed oceną rentowności. Przychód tej próbki katalogu nie jest pełnym wynikiem sklepu.',
  );
  products.favorite = true;
  const inventory = saved(
    'RAP-003',
    'inventory',
    'Zapasy · plan uzupełnień',
    'Które SKU mogą skończyć się przed dostawą?',
    'Przed zamówieniem sprawdzić dostawy w drodze i aktualne rezerwacje.',
  );
  const campaigns = saved(
    'RAP-004',
    'campaigns',
    'Kampanie · koszt wzrostu',
    'Ile kosztuje przypisana sprzedaż i nowy klient?',
    'Nie sumować przychodu przypisanego z przychodem sklepu. Weryfikacja kosztów poprzedza zmianę budżetu.',
    'Artur Wiśniewski',
  );
  campaigns.draft = {
    config: {
      ...campaigns.versions[0].config,
      title: 'Kampanie · przygotowanie przeglądu tygodnia',
      from: '2026-08-25',
      to: '2026-08-31',
    },
    baseVersion: 1,
    updatedAt: '2026-09-03T12:10:00Z',
    author: 'Artur Wiśniewski',
  };
  campaigns.updatedAt = campaigns.draft.updatedAt;
  const orders = saved(
    'RAP-005',
    'orders',
    'Zamówienia wymagające uwagi',
    'Które zamówienia wymagają kontaktu z magazynem?',
    'Zweryfikować status po terminie wysyłki. Raport dotyczy próbki, a nie wszystkich zamówień.',
  );
  const archive = saved(
    'RAP-006',
    'overview',
    'Lipiec 2026 · zamknięcie miesiąca',
    'Jaki był wynik zamkniętego miesiąca?',
    'Raport archiwalny.',
    'Artur Wiśniewski',
  );
  archive.archived = true;
  archive.versions[0].config = {
    ...archive.versions[0].config,
    from: '2026-07-01',
    to: '2026-07-31',
  };
  archive.versions[0].snapshot = buildReportSnapshot(
    archive.versions[0].config,
    '2026-08-01T09:00:00Z',
  );
  return {
    schema: 1,
    workspace: 'commerce',
    reports: [result, products, inventory, campaigns, orders, archive],
  };
}
