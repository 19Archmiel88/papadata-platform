import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AppHeader,
  Button,
  PageHeader,
  StatusBadge,
  Surface,
  TextField,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

function SpacingGeometryReference() {
  return (
    <div
      className="pds-brand-surface pds-foundation-stage"
      data-theme="dark"
      lang="pl"
    >
      <AppHeader />
      <main className="pds-foundation-main">
        <PageHeader
          eyebrow="Podstawy marki"
          text="Promienie, wysokości kontrolek i odstępy używają tych samych tokenów w jasnym i ciemnym motywie."
          title="Odstępy i geometria"
        />
        <section
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
          }}
        >
          <Surface style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
            <StatusBadge status="ready" />
            <TextField label="Nazwa workspace" />
            <Button variant="primary">Kontynuuj</Button>
          </Surface>
          <Surface
            style={{ display: 'grid', gap: '1.5rem', padding: '1.5rem' }}
            variant="subtle"
          >
            <StatusBadge status="warning" />
            <TextField label="Źródło danych" />
            <Button variant="secondary">Ponów próbę</Button>
          </Surface>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/01 Podstawy marki/Odstępy i geometria',
  component: SpacingGeometryReference,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SpacingGeometryReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReferencjaGeometrii: Story = {
  name: 'Referencja geometrii',
};
