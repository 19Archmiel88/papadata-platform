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
  ApprovalPanel,
} from './ApprovalPanel';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const approvers = [
  { name: 'Anna Kowalska', status: 'approved' as const, userId: 'u1' },
  { name: 'Marek Nowak', status: 'pending' as const, userId: 'u2' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/ApprovalPanel',
  component: ApprovalPanel,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    approvers,
    expiresAt: '2026-09-05T12:00:00Z',
    risk: 'medium',
    subjectId: 'budget-shift-482',
    subjectLabel: 'Przesunięcie budżetu 4 000 zł → kampania Meta',
  },
  argTypes: {
    risk: { control: 'inline-radio', options: ['low', 'medium', 'high'] },
  },
} satisfies Meta<typeof ApprovalPanel>;

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
      className="pd-approval-panel-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ApprovalPanelStory: Story = {
  name: 'ApprovalPanel',
  render: (args) => (
    <StoryPresentationPage
      className="pd-approval-panel-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ApprovalPanel', en: 'ApprovalPanel parameters' })}
          items={[
            { label: <Localized pl="risk" en="risk" />, value: 'low / medium / high' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="approval-panel"
      summary={
        <Localized
          pl="Status wieloosobowej zgody na ryzykowną zmianę (step-up) — kto zatwierdził, kto jeszcze musi, jaki jest poziom ryzyka i kiedy prośba wygasa."
          en="The status of a multi-person approval for a risky change (step-up) — who has approved, who still needs to, the risk level, and when the request expires."
        />
      }
      title={<Localized pl="Zgoda, którą widać krok po kroku." en="Approval you can see step by step." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="approval-controlled" style={{ maxWidth: '420px' }}>
          <ApprovalPanel {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Wysokie ryzyko / bez terminu" en="High risk / no deadline" />}>
        <div data-testid="approval-states" style={{ display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '420px' }}>
          <ApprovalPanel approvers={[{ name: 'Anna Kowalska', status: 'rejected', userId: 'u1' }]} expiresAt={null} risk="high" subjectId="disconnect-provider-1" subjectLabel={copy({ pl: 'Odłączenie Google Ads (produkcja)', en: 'Disconnect Google Ads (production)' })} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('approval-controlled')).toHaveTextContent('Anna Kowalska');
    await expect(canvas.getByTestId('approval-states')).toBeInTheDocument();
  },
};
