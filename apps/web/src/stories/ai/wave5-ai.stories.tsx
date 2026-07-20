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

export const AsystentDisabled = story('assistant_disabled', 'Asystent disabled');
export const AsystentGated = story('assistant_gated', 'Asystent gated');
export const AsystentBrakUprawnien = story('assistant_permission_denied', 'Asystent brak uprawnień');
export const AsystentEntitlement = story('assistant_entitlement_required', 'Asystent entitlement');
export const AsystentBudujeKontekst = story('assistant_building_context', 'Asystent buduje kontekst');
export const AsystentStreaming = story('assistant_streaming', 'Asystent streaming');
export const AsystentGotowaOdpowiedz = story('assistant_ready_answer', 'Asystent gotowa odpowiedź');
export const AsystentPartial = story('assistant_partial_answer', 'Asystent partial');
export const AsystentStale = story('assistant_stale_warning', 'Asystent stale warning');
export const AsystentBrakDanych = story('assistant_no_data_refusal', 'Asystent brak danych');
export const AsystentInvalid = story('assistant_invalid_refusal', 'Asystent invalid refusal');
export const AsystentBlocked = story('assistant_blocked_refusal', 'Asystent blocked refusal');
export const AsystentOutOfScope = story('assistant_out_of_scope_refusal', 'Asystent out of scope');
export const AsystentInjection = story('assistant_injection_blocked', 'Asystent injection blocked');
export const AsystentEvidenceUnavailable = story('assistant_evidence_unavailable', 'Asystent evidence unavailable');
export const AsystentProviderTimeout = story('assistant_provider_timeout', 'Asystent provider timeout');
export const AsystentProviderError = story('assistant_provider_error', 'Asystent provider error');
export const AsystentCostLimit = story('assistant_cost_limit', 'Asystent cost limit');
export const AsystentCancelled = story('assistant_cancelled', 'Asystent cancelled');
export const AsystentWorkspaceChanged = story('assistant_workspace_changed', 'Asystent workspace changed');
export const AsystentSessionExpired = story('assistant_session_expired', 'Asystent session expired');

export const LabNowyEksperyment = story('laboratory_new_experiment', 'Laboratorium nowy eksperyment');
export const LabWyborUseCase = story('laboratory_use_case_selection', 'Laboratorium wybór use case');
export const LabWyborDatasetu = story('laboratory_dataset_selection', 'Laboratorium wybór datasetu');
export const LabRunning = story('laboratory_running', 'Laboratorium running');
export const LabAnswered = story('laboratory_answered', 'Laboratorium answered');
export const LabCompareRuns = story('laboratory_compare_runs', 'Laboratorium compare runs');
export const LabModelChanged = story('laboratory_model_changed', 'Laboratorium model changed');
export const LabDataVersionChanged = story('laboratory_data_version_changed', 'Laboratorium data version changed');
export const LabPartialContext = story('laboratory_partial_context', 'Laboratorium partial context');
export const LabRestrictedSource = story('laboratory_restricted_source', 'Laboratorium restricted source');
export const LabExport = story('laboratory_export', 'Laboratorium export');
export const LabArchived = story('laboratory_archived', 'Laboratorium archived');
export const LabRetentionExpired = story('laboratory_retention_expired', 'Laboratorium retention expired');
export const LabDeletionPending = story('laboratory_deletion_pending', 'Laboratorium deletion pending');

export const RekomendacjaProposed = story('recommendation_proposed', 'Rekomendacja proposed');
export const RekomendacjaNeedsReview = story('recommendation_needs_review', 'Rekomendacja needs review');
export const RekomendacjaAccepted = story('recommendation_accepted', 'Rekomendacja accepted');
export const RekomendacjaRejected = story('recommendation_rejected', 'Rekomendacja rejected');
export const RekomendacjaDeferred = story('recommendation_deferred', 'Rekomendacja deferred');
export const RekomendacjaNeedMoreData = story('recommendation_need_more_data', 'Rekomendacja need more data');
export const RekomendacjaModified = story('recommendation_modified', 'Rekomendacja modified');
export const RekomendacjaExpired = story('recommendation_expired', 'Rekomendacja expired');
export const RekomendacjaInvalidated = story('recommendation_invalidated', 'Rekomendacja invalidated');
export const RekomendacjaNoOwner = story('recommendation_no_owner', 'Rekomendacja no owner');
export const RekomendacjaStaleVersion = story('recommendation_stale_version', 'Rekomendacja stale version');
export const RekomendacjaSecondApproval = story('recommendation_second_approval_required', 'Rekomendacja second approval');

export const ActionProposal = story('action_proposal', 'Action proposal');
export const ActionScopePreview = story('action_scope_preview', 'Action scope preview');
export const ActionImpactPreview = story('action_impact_preview', 'Action impact preview');
export const ActionReauthentication = story('action_reauthentication', 'Action reauthentication');
export const ActionApproved = story('action_approved', 'Action approved');
export const ActionRejected = story('action_rejected', 'Action rejected');
export const ActionExecuting = story('action_executing', 'Action executing');
export const ActionSuccess = story('action_success', 'Action success');
export const ActionFailed = story('action_failed', 'Action failed');
export const ActionCancelled = story('action_cancelled', 'Action cancelled');
export const ActionCompensated = story('action_compensated', 'Action compensated');
export const ActionTargetChanged = story('action_target_changed', 'Action target changed');
export const ActionPermissionRevoked = story('action_permission_revoked', 'Action permission revoked');
export const ActionGated = story('action_gated', 'Action gated');
export const ActionProhibited = story('action_prohibited', 'Action prohibited');

export const ProvenanceComplete = story('provenance_complete_evidence', 'Provenance complete evidence');
export const ProvenancePartial = story('provenance_partial_evidence', 'Provenance partial evidence');
export const ProvenanceHistorical = story('provenance_historical_snapshot', 'Provenance historical snapshot');
export const ProvenanceRestricted = story('provenance_restricted_evidence', 'Provenance restricted evidence');
export const ProvenanceMissing = story('provenance_missing_evidence', 'Provenance missing evidence');
export const ProvenanceModelChanged = story('provenance_model_changed', 'Provenance model changed');
export const ProvenanceRetention = story('provenance_retention_warning', 'Provenance retention warning');

export const UstawieniaAI = story('settings', 'AI settings');
export const HistoriaAI = story('history', 'AI history');
export const GovernanceAI = story('governance', 'AI governance');
