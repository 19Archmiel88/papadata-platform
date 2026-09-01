import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  BackgroundOperationItem,
} from './BackgroundOperationItem';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/BackgroundOperationItem',
  component: BackgroundOperationItem,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    description: 'WooCommerce · Sklep Polska',
    errorCode: null,
    operationId: 'op-4821',
    progress: 0.62,
    showProgressValue: true,
    startedAt: '2026-08-29T13:36:00Z',
    status: 'running',
    title: 'Synchronizacja zamówień',
  },
  argTypes: {
    status: { control: 'inline-radio', options: ['queued', 'running', 'completed', 'failed', 'cancelled'] },
  },
} satisfies Meta<typeof BackgroundOperationItem>;

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
      className="pd-background-operation-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-4)', maxWidth: '420px' } as const;

export const BackgroundOperationItemStory: Story = {
  name: 'BackgroundOperationItem',
  render: (args) => (
    <StoryPresentationPage
      className="pd-background-operation-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry BackgroundOperationItem', en: 'BackgroundOperationItem parameters' })}
          items={[
            { label: <Localized pl="Konsument" en="Consumer" />, value: copy({ pl: 'OperationCenter (powłoka produktu)', en: 'OperationCenter (product shell)' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="background-operation-item"
      summary={
        <Localized
          pl="Jeden wiersz w Operation Center — synchronizacja, import, backfill w toku. Odcień paska postępu podąża za statusem: running=neutralny, completed=success, failed=critical."
          en="A single row in the Operation Center — a sync, import or backfill in progress. The progress bar's tone follows status: running=neutral, completed=success, failed=critical."
        />
      }
      title={<Localized pl="Operacja w tle, którą można śledzić." en="A background operation you can track." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="operation-controlled" style={{ maxWidth: '420px' }}>
          <BackgroundOperationItem {...args} onAction={fn()} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="operation-states" style={stackStyle}>
          <BackgroundOperationItem description={copy({ pl: 'Google Ads', en: 'Google Ads' })} errorCode={null} operationId="op-queued" progress={null} startedAt={null} status="queued" title={copy({ pl: 'Oczekuje w kolejce', en: 'Queued' })} />
          <BackgroundOperationItem description={copy({ pl: 'GA4', en: 'GA4' })} errorCode={null} operationId="op-completed" progress={1} showProgressValue startedAt="2026-08-29T13:00:00Z" status="completed" title={copy({ pl: 'Import zakończony', en: 'Import complete' })} />
          <BackgroundOperationItem actionLabel={copy({ pl: 'Ponów', en: 'Retry' })} actionVariant="secondary" description={copy({ pl: 'Meta Ads', en: 'Meta Ads' })} errorCode="PROVIDER_TIMEOUT" operationId="op-failed" progress={0.4} startedAt="2026-08-29T13:10:00Z" status="failed" statusText={copy({ pl: 'Provider nie odpowiedział na czas', en: 'Provider did not respond in time' })} title={copy({ pl: 'Synchronizacja przerwana', en: 'Sync interrupted' })} onAction={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('operation-controlled')).toHaveTextContent('Synchronizacja zamówień');
    await expect(canvas.getByTestId('operation-states').children).toHaveLength(3);
  },
};
