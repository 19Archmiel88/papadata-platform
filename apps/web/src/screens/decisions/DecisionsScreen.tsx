import type {
  ReactNode,
} from 'react';

import {
  DataTable,
  InlineNotice,
  PageHeader,
  ProgressIndicator,
  SectionNavigation,
  StatusBadge,
} from '../../design-system';
import type {
  StatusBadgeTone,
} from '../../design-system';
import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  actionColumns,
  createDecisionsStorybookData,
  decisionVariantColumns,
  decisionsNavigationItems,
  findDecisionsScreenDefinition,
  measurementColumns,
  observationColumns,
  recommendationColumns,
  registryColumns,
  relationColumns,
} from './decisionsData';
import type {
  DecisionsScreenDefinition,
  DecisionsWorkspaceData,
} from './decisionsData';
import './decisions-workspace.css';

export type DecisionsScreenProps = {
  readonly path?: string;
};

export function DecisionsScreen({
  path = '/app/decisions/centrum-decyzji',
}: DecisionsScreenProps) {
  const definition = findDecisionsScreenDefinition(path);

  if (!definition) {
    return (
      <InlineNotice
        message="Routing wskazuje ekran spoza zakresu sekcji 80."
        title="Nieobsługiwany ekran decyzji"
        tone="critical"
      />
    );
  }

  return (
    <DecisionsWorkspace
      data={createDecisionsStorybookData()}
      definition={definition}
    />
  );
}

export function DecisionsWorkspace({
  data,
  definition,
  mode = 'runtime',
}: {
  readonly data: DecisionsWorkspaceData;
  readonly definition: DecisionsScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
}) {
  return (
    <section
      aria-label={`Decyzje i działania: ${definition.displayTitle}`}
      className="pd-decisions-workspace"
      data-mode={mode}
      data-production-canvas="true"
      data-screen-id={definition.id}
      data-screen-variant={definition.variant}
    >
      <PageHeader
        breadcrumbs={[
          { label: 'PapaData', href: '/app' },
          { label: 'Decyzje i działania', href: null },
        ]}
        description={definition.summary}
        meta={[
          { label: 'Okno', value: '30 dni' },
          { label: 'Źródła', value: 'Kampanie, klienci, ruch' },
          { label: 'Owner', value: 'Growth' },
        ]}
        subtitle="Warstwa decyzji wymaga zatwierdzenia, dowodów i warunków pomiaru przed wykonaniem działań."
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki decyzji i działań"
        items={decisionsNavigationItems}
        orientation="horizontal"
        size="compact"
        sticky
      />

      <section className="pd-decisions-workspace__grid" aria-label="Status decyzji">
        <div className="pd-decisions-workspace__hero">
          <div>
            <p className="pd-decisions-workspace__eyebrow">Decision intelligence</p>
            <h2>Co trzeba rozstrzygnąć teraz</h2>
            <p>
              Widok łączy obserwacje, rekomendacje, rejestr decyzji i pomiar wyniku,
              żeby AI nie było oddzielone od odpowiedzialności biznesowej.
            </p>
          </div>
          <ProgressIndicator
            aria-label="Gotowość do decyzji"
            indeterminate={false}
            label="Readiness"
            max={100}
            showValue
            tone="success"
            value={82}
          />
        </div>

        <dl className="pd-decisions-workspace__kpis" aria-label="Metryki decyzji">
          {data.kpis.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
              <dd>{item.hint}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pd-decisions-workspace__section" aria-labelledby="decision-queue-title">
        <div className="pd-decisions-workspace__section-heading">
          <div>
            <p className="pd-decisions-workspace__eyebrow">Priorytety</p>
            <h2 id="decision-queue-title">Kolejka decyzji marketingowych</h2>
          </div>
          <StatusBadge
            status="Status"
            text="3 wymagają akceptacji"
            tone="warning"
          />
        </div>
        <div className="pd-decisions-workspace__decision-list">
          {data.decisionQueue.map((item) => (
            <article key={item.id} className="pd-decisions-workspace__decision-card">
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
              <div className="pd-decisions-workspace__decision-meta">
                <strong>{item.impact}</strong>
                <StatusBadge
                  status="Priorytet"
                  text={item.status}
                  tone={priorityTone(item.priority)}
                />
                <span>{item.due}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {renderDecisionsVariant(definition, data)}
    </section>
  );
}

function renderDecisionsVariant(
  definition: DecisionsScreenDefinition,
  data: DecisionsWorkspaceData,
) {
  if (definition.variant === 'center') {
    return tablePanel('Centrum decyzji', 'Najważniejsze decyzje są spięte z wpływem, ownerem i pomiarem.', recommendationColumns, data.recommendationRows, 'Centrum decyzji');
  }

  if (definition.variant === 'observations') {
    return tablePanel('Obserwacje', 'Obserwacje pokazują źródło, confidence i status dowodu.', observationColumns, data.observationRows, 'Obserwacje');
  }

  if (definition.variant === 'recommendations') {
    return tablePanel('Rekomendacje', 'Rekomendacja nie jest akcją automatyczną; wymaga risk review i approval.', recommendationColumns, data.recommendationRows, 'Rekomendacje');
  }

  if (definition.variant === 'registry') {
    return tablePanel('Rejestr decyzji', 'Rejestr przechowuje właściciela, datę, status i ślad decyzji.', registryColumns, data.registryRows, 'Rejestr decyzji');
  }

  if (definition.variant === 'action-brief') {
    return (
      <DecisionPanel title="Brief działania" summary="Brief rozdziela hipotezę, kanał, ownera, guardrail i warunek pomiaru.">
        <ol className="pd-decisions-workspace__steps">
          <li>Cel: odzyskać ROAS kampanii brandowej powyżej 3,6x.</li>
          <li>Hipoteza: przesunięcie budżetu do non-brand zwiększy przychód inkrementalny.</li>
          <li>Warunek startu: kompletne koszty Google Ads i aktywny owner Growth.</li>
        </ol>
      </DecisionPanel>
    );
  }

  if (definition.variant === 'action-detail') {
    return tablePanel('Szczegóły działania', 'Działanie pokazuje kanał, guardrail i stan wykonania.', actionColumns, data.actionRows, 'Szczegóły działania');
  }

  if (definition.variant === 'measurement') {
    return tablePanel('Pomiar wyniku', 'Pomiar porównuje baseline, wynik i confidence dla decyzji.', measurementColumns, data.measurementRows, 'Pomiar decyzji');
  }

  if (definition.variant === 'action-library') {
    return tablePanel('Biblioteka działań', 'Biblioteka gromadzi powtarzalne działania z guardrailami.', actionColumns, data.actionRows, 'Biblioteka działań');
  }

  if (definition.variant === 'relations') {
    return tablePanel('Powiązania z modułami', 'Decyzje muszą być powiązane z obiektami domenowymi i sprawami operacyjnymi.', relationColumns, data.relationRows, 'Powiązania decyzji');
  }

  return tablePanel('Warianty decyzji i działań', 'Warianty pokazują stany approval, blocked, measured i archived bez fikcyjnych sukcesów.', decisionVariantColumns, data.variantRows, 'Warianty decyzji');
}

function DecisionPanel({
  children,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly summary: string;
  readonly title: string;
}) {
  return (
    <section className="pd-decisions-workspace__panel" aria-labelledby={`${slug(title)}-title`}>
      <div className="pd-decisions-workspace__section-heading">
        <div>
          <p className="pd-decisions-workspace__eyebrow">Widok domenowy</p>
          <h2 id={`${slug(title)}-title`}>{title}</h2>
          <p>{summary}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function tablePanel(
  title: string,
  summary: string,
  columns: readonly DataColumn[],
  rows: readonly DataRow[],
  ariaLabel: string,
) {
  return (
    <DecisionPanel title={title} summary={summary}>
      <div className="pd-decisions-workspace__table">
        <DataTable
          ariaLabel={ariaLabel}
          columns={columns}
          density="compact"
          emptyMessage="Brak danych decyzji dla bieżącego zakresu."
          loading={false}
          minWidth={760}
          rowCount={rows.length}
          rowHeaderColumnId={columns[0]?.id}
          rows={rows}
          selectedRowIds={[]}
          sort={null}
          summary={summary}
        />
      </div>
    </DecisionPanel>
  );
}

function priorityTone(priority: 'critical' | 'high' | 'low' | 'medium'): StatusBadgeTone {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'neutral';
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
}
