import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AISurfacesScreen } from '../../features/ai';
import {
  aiStoryFixtures,
  type AIFixtureId,
} from '../../features/ai/aiFixtures';

type AIStoryArgs = {
  fixtureId: AIFixtureId;
  theme: 'light' | 'dark' | 'high-contrast';
};

function AIStory({ fixtureId, theme }: AIStoryArgs) {
  return (
    <AISurfacesScreen
      fixture={aiStoryFixtures[fixtureId]}
      theme={theme}
    />
  );
}

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Insights, decyzje i AI',
  component: AIStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    fixtureId: {
      control: 'select',
      options: Object.keys(aiStoryFixtures),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'high-contrast'],
    },
  },
  args: {
    fixtureId: 'default',
    theme: 'dark',
  },
} satisfies Meta<typeof AIStory>;

export default meta;

type Story = StoryObj<typeof meta>;

function story(fixtureId: AIFixtureId, name: string): Story {
  return {
    name,
    args: { fixtureId },
  };
}

export const Domyslny: Story = {
  ...story('default', 'Domyślny'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.findByRole('heading', { name: /Kontekstowa analiza widoku/i }),
    ).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /Evidence/i }));
    await expect(canvas.findAllByText(/Evidence otwarte/i)).resolves.not.toHaveLength(0);
    await userEvent.click(await canvas.findByRole('button', { name: /Laboratorium AI/i }));
    await expect(canvas.findByText(/Kontrolowany eksperyment/i)).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /AI Actions/i }));
    await userEvent.click(await canvas.findByRole('button', { name: /Approve/i }));
    await expect(canvas.findByText(/Proposal approved/i)).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /AI Governance/i }));
    await expect(canvas.findByText(/NOT SATISFIED/i)).resolves.toBeInTheDocument();
  },
};

export const AsystentDisabled = story('assistant_disabled', 'Asystent wyłączony');
export const AsystentGated = story('assistant_gated', 'Asystent za bramą');
export const AsystentBrakUprawnien = story('assistant_permission_denied', 'Asystent brak uprawnień');
export const AsystentEntitlement = story('assistant_entitlement_required', 'Asystent wymaga entitlement');
export const AsystentBudujeKontekst = story('assistant_building_context', 'Asystent buduje kontekst');
export const AsystentStreaming = story('assistant_streaming', 'Asystent streaming');
export const AsystentGotowaOdpowiedz = story('assistant_ready_answer', 'Asystent gotowa odpowiedź');
export const AsystentPartial = story('assistant_partial_answer', 'Asystent częściowa odpowiedź');
export const AsystentStale = story('assistant_stale_warning', 'Asystent nieświeże dane');
export const AsystentBrakDanych = story('assistant_no_data_refusal', 'Asystent brak danych');
export const AsystentInvalid = story('assistant_invalid_refusal', 'Asystent odmowa: dane nieprawidłowe');
export const AsystentBlocked = story('assistant_blocked_refusal', 'Asystent odmowa: blokada');
export const AsystentOutOfScope = story('assistant_out_of_scope_refusal', 'Asystent poza zakresem');
export const AsystentInjection = story('assistant_injection_blocked', 'Asystent blokada prompt injection');
export const AsystentEvidenceUnavailable = story('assistant_evidence_unavailable', 'Asystent brak evidence');
export const AsystentProviderTimeout = story('assistant_provider_timeout', 'Asystent timeout providera');
export const AsystentProviderError = story('assistant_provider_error', 'Asystent błąd providera');
export const AsystentCostLimit = story('assistant_cost_limit', 'Asystent limit kosztu');
export const AsystentCancelled = story('assistant_cancelled', 'Asystent anulowany');
export const AsystentWorkspaceChanged = story('assistant_workspace_changed', 'Asystent zmiana workspace');
export const AsystentSessionExpired = story('assistant_session_expired', 'Asystent wygasła sesja');

export const LabNowyEksperyment = story('laboratory_new_experiment', 'Laboratorium nowy eksperyment');
export const LabWyborUseCase = story('laboratory_use_case_selection', 'Laboratorium wybór use case');
export const LabWyborDatasetu = story('laboratory_dataset_selection', 'Laboratorium wybór datasetu');
export const LabRunning = story('laboratory_running', 'Laboratorium w toku');
export const LabAnswered = story('laboratory_answered', 'Laboratorium z odpowiedzią');
export const LabCompareRuns = story('laboratory_compare_runs', 'Laboratorium porównanie runów');
export const LabModelChanged = story('laboratory_model_changed', 'Laboratorium zmiana modelu');
export const LabDataVersionChanged = story('laboratory_data_version_changed', 'Laboratorium zmiana wersji danych');
export const LabPartialContext = story('laboratory_partial_context', 'Laboratorium częściowy kontekst');
export const LabRestrictedSource = story('laboratory_restricted_source', 'Laboratorium ograniczone źródło');
export const LabExport = story('laboratory_export', 'Laboratorium eksport');
export const LabArchived = story('laboratory_archived', 'Laboratorium zarchiwizowane');
export const LabRetentionExpired = story('laboratory_retention_expired', 'Laboratorium retencja wygasła');
export const LabDeletionPending = story('laboratory_deletion_pending', 'Laboratorium usunięcie oczekuje');

export const RekomendacjaProposed = story('recommendation_proposed', 'Rekomendacja zaproponowana');
export const RekomendacjaNeedsReview = story('recommendation_needs_review', 'Rekomendacja wymaga przeglądu');
export const RekomendacjaAccepted = story('recommendation_accepted', 'Rekomendacja przyjęta');
export const RekomendacjaRejected = story('recommendation_rejected', 'Rekomendacja odrzucona');
export const RekomendacjaDeferred = story('recommendation_deferred', 'Rekomendacja odroczona');
export const RekomendacjaNeedMoreData = story('recommendation_need_more_data', 'Rekomendacja wymaga więcej danych');
export const RekomendacjaModified = story('recommendation_modified', 'Rekomendacja zmodyfikowana');
export const RekomendacjaExpired = story('recommendation_expired', 'Rekomendacja wygasła');
export const RekomendacjaInvalidated = story('recommendation_invalidated', 'Rekomendacja unieważniona');
export const RekomendacjaNoOwner = story('recommendation_no_owner', 'Rekomendacja bez ownera');
export const RekomendacjaStaleVersion = story('recommendation_stale_version', 'Rekomendacja nieświeża wersja');
export const RekomendacjaSecondApproval = story('recommendation_second_approval_required', 'Rekomendacja wymaga drugiego approval');

export const ActionProposal = story('action_proposal', 'Akcja propozycja');
export const ActionScopePreview = story('action_scope_preview', 'Akcja podgląd zakresu');
export const ActionImpactPreview = story('action_impact_preview', 'Akcja podgląd wpływu');
export const ActionReauthentication = story('action_reauthentication', 'Akcja ponowna autoryzacja');
export const ActionApproved = story('action_approved', 'Akcja zatwierdzona');
export const ActionRejected = story('action_rejected', 'Akcja odrzucona');
export const ActionExecuting = story('action_executing', 'Akcja wykonywana');
export const ActionSuccess = story('action_success', 'Akcja sukces');
export const ActionFailed = story('action_failed', 'Akcja nieudana');
export const ActionCancelled = story('action_cancelled', 'Akcja anulowana');
export const ActionCompensated = story('action_compensated', 'Akcja skompensowana');
export const ActionTargetChanged = story('action_target_changed', 'Akcja target zmieniony');
export const ActionPermissionRevoked = story('action_permission_revoked', 'Akcja uprawnienie cofnięte');
export const ActionGated = story('action_gated', 'Akcja za bramą');
export const ActionProhibited = story('action_prohibited', 'Akcja zabroniona');

export const ProvenanceComplete = story('provenance_complete_evidence', 'Provenance kompletne evidence');
export const ProvenancePartial = story('provenance_partial_evidence', 'Provenance częściowe evidence');
export const ProvenanceHistorical = story('provenance_historical_snapshot', 'Provenance snapshot historyczny');
export const ProvenanceRestricted = story('provenance_restricted_evidence', 'Provenance ograniczone evidence');
export const ProvenanceMissing = story('provenance_missing_evidence', 'Provenance brak evidence');
export const ProvenanceModelChanged = story('provenance_model_changed', 'Provenance zmiana modelu');
export const ProvenanceRetention = story('provenance_retention_warning', 'Provenance ostrzeżenie retencji');

export const UstawieniaAI = story('settings', 'Ustawienia AI');
export const HistoriaAI = story('history', 'Historia AI');
export const GovernanceAI = story('governance', 'Governance AI');
