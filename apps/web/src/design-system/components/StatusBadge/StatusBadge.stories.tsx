import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  StatusBadge,
} from './StatusBadge';

import type {
  LocalizedCopy,
} from '../../../storybook-next/presentation/storyLocalization';
import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    status: 'ready',
    text: 'Gotowe',
    tone: 'success',
  },
  argTypes: {
    text: { control: 'text' },
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'critical', 'processing'] },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-status-badge-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const toneRows: ReadonlyArray<{
  readonly status: string;
  readonly text: LocalizedCopy;
  readonly tone: 'neutral' | 'info' | 'success' | 'warning' | 'critical' | 'processing';
}> = [
  { status: 'ready', text: { pl: 'Gotowe', en: 'Ready' }, tone: 'success' },
  { status: 'partial', text: { pl: 'Częściowo gotowe', en: 'Partially ready' }, tone: 'warning' },
  { status: 'action_required', text: { pl: 'Wymaga działania', en: 'Needs action' }, tone: 'critical' },
  { status: 'syncing', text: { pl: 'Synchronizacja', en: 'Syncing' }, tone: 'processing' },
  { status: 'info', text: { pl: 'Informacja', en: 'Info' }, tone: 'info' },
  { status: 'disconnected', text: { pl: 'Odłączone', en: 'Disconnected' }, tone: 'neutral' },
];

export const StatusBadgeStory: Story = {
  name: 'StatusBadge',
  render: (args) => (
    <StoryPresentationPage
      className="pd-status-badge-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry StatusBadge', en: 'StatusBadge parameters' })}
          items={[
            { label: <Localized pl="Odcienie" en="Tones" />, value: String(toneRows.length) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="status-badge"
      summary={
        <Localized
          pl="Syntetyczny status biznesowy w tabelach i listach — status niesie ukryty (dla czytnika) prefiks, text jest widoczną etykietą. Nigdy nie polega wyłącznie na kolorze: kropka + tekst zawsze razem."
          en="A synthetic business status in tables and lists — status carries a screen-reader-only prefix, text is the visible label. Never relies on color alone: dot + text always together."
        />
      }
      title={<Localized pl="Status, który mówi to, co widać." en="A status that says what you see." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="badge-controlled">
          <StatusBadge {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Odcienie" en="Tones" />}>
        <div className="pd-f0-icon-line" data-testid="badge-tones">
          {toneRows.map((row) => (
            <span key={row.tone}>
              <StatusBadge status={row.status} text={copy(row.text)} tone={row.tone} />
            </span>
          ))}
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('badge-controlled').querySelector('.pd-status-badge');
    await expect(controlled).toHaveAttribute('data-tone', 'success');

    await expect(canvas.getByTestId('badge-tones').children).toHaveLength(toneRows.length);
  },
};
