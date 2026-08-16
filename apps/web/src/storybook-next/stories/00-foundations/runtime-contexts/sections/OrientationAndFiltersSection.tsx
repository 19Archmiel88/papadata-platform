import { useState } from 'react';

import { StoryPresentationSection } from '../../../../presentation/StoryPresentation';
import {
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  Combobox,
  DateRangePicker,
  FileInput,
  FilterBar,
  FilterChip,
  IconButton,
  LinkAction,
  PageHeader,
  PasswordField,
  RadioGroup,
  SearchField,
  SectionNavigation,
  SegmentedControl,
  Select,
  SortControl,
  Switch,
  Tabs,
  TextField,
  Textarea,
  Toolbar,
  VerificationCodeInput,
} from '../../../../../design-system/components';
import { Icon, PapaDataBrand } from '../../../../../design-system/icons';
import { RuntimeSequence } from '../RuntimeSequence';
import type { PushEvidence } from '../runtime-context-types';

export function OrientationAndFiltersSection({
  pushEvidence,
}: {
  readonly pushEvidence: PushEvidence;
}) {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectValue, setSelectValue] = useState<string | null>('shopify');
  const [comboboxValue, setComboboxValue] = useState<string | null>('meta');
  const [radioValue, setRadioValue] = useState<string | null>('revenue');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [query, setQuery] = useState('kampania');
  const [sortId, setSortId] = useState('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <StoryPresentationSection
            index="01"
            layout="wide"
            summary="Akcje, pola i filtry są pokazane jako narzędzia pracy operatora w jednym przepływie."
            title="Operacje kampanii i filtracja danych"
          >
            <div className="pd-c83-flow">
              <RuntimeSequence
                evidenceLabel="PageHeader, PapaDataBrand, Icon, Breadcrumbs i SectionNavigation tworzą orientację ekranu."
                title="Nagłówek i lokalna nawigacja"
              >
                <PageHeader
                  actions={(
                    <ButtonGroup label="Akcje raportu">
                      <Button
                        size="small"
                        variant="primary"
                        onClick={() => pushEvidence('Button uruchomił eksport raportu.')}
                      >
                        Eksportuj
                      </Button>
                      <IconButton
                        icon="notifications"
                        label="Pokaż powiadomienia"
                        size="small"
                        variant="secondary"
                        onClick={() => pushEvidence('IconButton otworzył powiadomienia raportu.')}
                      />
                    </ButtonGroup>
                  )}
                  breadcrumbs={[
                    { href: '#centrum', label: 'Centrum dowodzenia' },
                    { href: '#kampanie', label: 'Kampanie' },
                    { href: null, label: 'Raport kanałów' },
                  ]}
                  description="Raport pokazuje przychód, jakość danych i decyzje do wykonania."
                  meta={[
                    { label: 'Zakres', value: 'ostatnie 30 dni' },
                    { label: 'Źródła', value: 'Shopify, Meta, GA4' },
                  ]}
                  subtitle="Źródła, metryki i decyzje w jednym przepływie."
                  title="Raport kampanii"
                />
                <div className="pd-c83-inline-proof">
                  <PapaDataBrand size="small" />
                  <Icon decorative name="trend" size={20} />
                  <LinkAction href="#tabela" size="small" tone="default">Przejdź do danych</LinkAction>
                  <Breadcrumbs
                    items={[
                      { current: false, href: '#centrum', id: 'centrum', label: 'Centrum' },
                      { current: false, href: '#kampanie', id: 'kampanie', label: 'Kampanie' },
                      { current: false, href: '#raporty', id: 'raporty', label: 'Raporty' },
                      { current: true, href: null, id: 'kanaly', label: 'Kanały sprzedaży' },
                    ]}
                    maxVisible={4}
                  />
                </div>
                <Tabs
                  activation="manual"
                  activeId={activeTab}
                  ariaLabel="Widoki raportu"
                  items={[
                    { id: 'summary', label: 'Podsumowanie', panel: 'Najważniejsze KPI i sygnały.' },
                    { id: 'data', label: 'Dane', panel: 'Tabela źródeł i synchronizacji.' },
                    { id: 'decisions', label: 'Decyzje', panel: 'Rekomendacje i akcje zespołu.' },
                  ]}
                  orientation="horizontal"
                  onActiveIdChange={(nextId, reason) => {
                    setActiveTab(nextId);
                    pushEvidence(`Tabs zmienił widok na ${nextId}; powód: ${reason}.`);
                  }}
                />
                <SectionNavigation
                  activeId="data"
                  ariaLabel="Sekcje raportu"
                  orientation="horizontal"
                  items={[
                    { href: '#filtry', id: 'filters', label: 'Filtry' },
                    { href: '#tabela', id: 'data', label: 'Dane' },
                    { href: '#decyzje', id: 'decisions', label: 'Decyzje' },
                  ]}
                />
              </RuntimeSequence>

              <RuntimeSequence
                evidenceLabel="Formularz pokazuje TextField, PasswordField, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, DateRangePicker, SearchField, VerificationCodeInput, FileInput i FilterChip."
                title="Filtry i parametry raportu"
              >
                <Toolbar
                  description="Sterowanie zestawem danych bez odrywania operatora od zadania."
                  end={(
                    <SortControl
                      direction={sortDirection}
                      label="Sortowanie"
                      options={[
                        { id: 'revenue', label: 'Przychód' },
                        { id: 'orders', label: 'Zamówienia' },
                      ]}
                      selectedId={sortId}
                      onDirectionChange={(nextDirection) => {
                        setSortDirection(nextDirection ?? 'desc');
                        pushEvidence('SortControl zmienił kierunek sortowania.');
                      }}
                      onSelectedIdChange={(nextId) => {
                        setSortId(nextId);
                        pushEvidence(`SortControl wybrał sortowanie: ${nextId}.`);
                      }}
                    />
                  )}
                  start={(
                    <SegmentedControl
                      ariaLabel="Widok danych"
                      items={[
                        { count: 18, icon: 'data', label: 'Wszystkie', value: 'all' },
                        { count: 5, icon: 'warning', label: 'Ryzyka', value: 'risk' },
                        { count: 3, icon: 'success', label: 'Szanse', value: 'chance' },
                      ]}
                      value={selectedSegment}
                      onValueChange={(value) => {
                        setSelectedSegment(value);
                        pushEvidence(`SegmentedControl zmienił widok: ${value}.`);
                      }}
                    />
                  )}
                  title="Parametry analizy"
                />
                <FilterBar
                  activeCount={3}
                  actions={(
                    <Button size="small" variant="secondary" onClick={() => pushEvidence('Button zastosował filtry raportu.')}>
                      Zastosuj
                    </Button>
                  )}
                  clearFiltersLabel="Wyczyść filtry"
                  collapsible
                  filters={[
                    { id: 'channel', label: 'Kanał', removable: true, tone: 'accent', type: 'select', value: 'Meta Ads' },
                    { id: 'range', label: 'Zakres', removable: false, tone: 'neutral', type: 'date', value: '30 dni' },
                    { id: 'owner', label: 'Owner', removable: true, tone: 'success', type: 'select', value: 'Growth' },
                  ]}
                  resultCount={128}
                  search={(
                    <SearchField
                      debounceMs={0}
                      label="Szukaj kampanii"
                      loading={false}
                      placeholder="Nazwa kampanii lub kanału"
                      query={query}
                      resultCount={8}
                      onClear={() => {
                        setQuery('');
                        pushEvidence('SearchField wyczyścił zapytanie.');
                      }}
                      onQueryChange={(nextQuery) => {
                        setQuery(nextQuery);
                        pushEvidence(`SearchField zmienił zapytanie: ${nextQuery || 'puste'}.`);
                      }}
                    />
                  )}
                  segments={null}
                  sort={null}
                  onClearFilters={() => pushEvidence('FilterBar wyczyścił aktywne filtry.')}
                  onRemoveFilter={(filterId) => pushEvidence(`FilterBar usunął filtr: ${filterId}.`)}
                />
                <div className="pd-c83-form-line">
                  <TextField
                    helperText="Nazwa zostanie zapisana jako widok zespołu."
                    label="Nazwa widoku"
                    value="Kampanie rentowne"
                    onChange={() => pushEvidence('TextField przyjął zmianę nazwy widoku.')}
                  />
                  <PasswordField
                    helperText="Pole użyte w kontekście dostępu do eksportu."
                    label="Hasło eksportu"
                    requirements={[
                      { id: 'length', label: 'Minimum 12 znaków', met: true },
                      { id: 'symbol', label: 'Znak specjalny', met: true },
                    ]}
                    strength={0.82}
                    value="••••••••••••"
                    visible={false}
                    onChange={() => pushEvidence('PasswordField przyjął zmianę wartości.')}
                  />
                  <VerificationCodeInput
                    length={6}
                    label="Kod MFA"
                    value="482901"
                    onChange={(event) => pushEvidence(`VerificationCodeInput zmienił kod: ${event.currentTarget.value}.`)}
                  />
                </div>
                <div className="pd-c83-form-line">
                  <Select
                    label="Źródło danych"
                    options={[
                      { label: 'Shopify', value: 'shopify' },
                      { label: 'Meta Ads', value: 'meta' },
                      { label: 'GA4', value: 'ga4' },
                    ]}
                    placeholder="Wybierz źródło"
                    value={selectValue}
                    onChange={(event) => {
                      setSelectValue(event.currentTarget.value);
                      pushEvidence(`Select wybrał źródło: ${event.currentTarget.value}.`);
                    }}
                  />
                  <Combobox
                    label="Kanał"
                    options={[
                      { label: 'Meta Ads', value: 'meta' },
                      { label: 'Google Ads', value: 'google' },
                      { label: 'Organic', value: 'organic' },
                    ]}
                    placeholder="Wybierz kanał"
                    value={comboboxValue}
                    onChange={(value) => {
                      setComboboxValue(value);
                      pushEvidence(`Combobox wybrał kanał: ${value ?? 'brak'}.`);
                    }}
                  />
                  <DateRangePicker
                    label="Zakres dat"
                    presets={[
                      { label: 'Dzisiaj', value: 'today' },
                      { label: '7 dni', value: 'last7d' },
                      { label: '30 dni', value: 'last30d' },
                    ]}
                    timezone="Europe/Warsaw"
                    value={{ from: '2026-08-01', preset: 'last30d', timezone: 'Europe/Warsaw', to: '2026-08-16' }}
                    onChange={() => pushEvidence('DateRangePicker zaktualizował zakres dat.')}
                  />
                </div>
                <div className="pd-c83-form-line pd-c83-form-line--soft">
                  <Checkbox
                    checked={checkboxChecked}
                    label="Pokaż tylko kampanie z wydatkiem"
                    value="spend-only"
                    onChange={(event) => {
                      setCheckboxChecked(event.currentTarget.checked);
                      pushEvidence(`Checkbox zmienił stan: ${event.currentTarget.checked ? 'włączony' : 'wyłączony'}.`);
                    }}
                  />
                  <Switch
                    checked={switchChecked}
                    label="Automatycznie odświeżaj dane"
                    onChange={(event) => {
                      setSwitchChecked(event.currentTarget.checked);
                      pushEvidence(`Switch zmienił stan: ${event.currentTarget.checked ? 'włączony' : 'wyłączony'}.`);
                    }}
                  />
                  <RadioGroup
                    label="Metryka główna"
                    options={[
                      { helperText: 'Przychód netto', label: 'Revenue', value: 'revenue' },
                      { helperText: 'Liczba zamówień', label: 'Orders', value: 'orders' },
                    ]}
                    value={radioValue}
                    onValueChange={(value) => {
                      setRadioValue(value);
                      pushEvidence(`RadioGroup wybrał metrykę: ${value}.`);
                    }}
                  />
                </div>
                <div className="pd-c83-inline-proof">
                  <FilterChip active label="Kanał" removable value="Meta Ads" onRemove={() => pushEvidence('FilterChip usunął kanał Meta Ads.')} />
                  <FilterChip label="Region" value="PL" />
                  <Textarea
                    helperText="Notatka trafia do opisu widoku."
                    label="Notatka analityczna"
                    value="Porównujemy kampanie rentowne bez zatrzymywania analizy."
                    onChange={() => pushEvidence('Textarea przyjęła notatkę analityczną.')}
                  />
                  <FileInput
                    helperText="CSV może zasilić dodatkowy segment testowy."
                    label="Import segmentu"
                    onChange={() => pushEvidence('FileInput przyjął plik segmentu.')}
                  />
                </div>
              </RuntimeSequence>
            </div>
          </StoryPresentationSection>
  );
}
