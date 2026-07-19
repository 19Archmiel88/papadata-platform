import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AppHeader,
  InlineNotice,
  PageHeader,
  StatusBadge,
  Surface,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';
import '../../screens/workspace-setup/workspace-setup.css';

function DeveloperDiagnostics() {
  return (
    <div
      className="pds-brand-surface pdw-shell"
      data-theme="dark"
      lang="pl"
    >
      <AppHeader />
      <main className="pdw-main">
        <PageHeader
          eyebrow="Diagnostyka deweloperska"
          text="Widok techniczny dla zespołu produktu i implementacji. Nie jest podstawową ścieżką klienta."
          title="Szczegóły operacyjne konfiguracji workspace"
        />

        <Surface className="pdw-panel">
          <div className="pdw-panel-header">
            <h2>Ocena bramki</h2>
            <StatusBadge label="PROPOSED" status="pending" />
          </div>

          <div className="pdw-form-grid">
            <div className="pdw-field">
              <span>Capability</span>
              <strong>Sprawdzana po stronie runtime</strong>
            </div>
            <div className="pdw-field">
              <span>Źródło prawdy</span>
              <strong>Stan serwerowy, nie URL</strong>
            </div>
            <div className="pdw-field">
              <span>Recovery</span>
              <strong>Retry, prośba admina albo support</strong>
            </div>
            <div className="pdw-field">
              <span>Sekrety</span>
              <strong>Pola sekretów pozostają write-only</strong>
            </div>
          </div>

          <InlineNotice tone="warning">
            Ta historia istnieje wyłącznie jako diagnostyka deweloperska i nie
            powinna być mieszana z podstawową ścieżką klienta.
          </InlineNotice>
        </Surface>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/05 Diagnostyka deweloperska/Konfiguracja przestrzeni roboczej',
  component: DeveloperDiagnostics,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DeveloperDiagnostics>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KonfiguracjaWorkspace: Story = {
  name: 'Konfiguracja workspace',
};
