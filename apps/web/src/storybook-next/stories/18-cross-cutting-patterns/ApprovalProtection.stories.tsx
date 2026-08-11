import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useMemo,
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import type {
  ApprovalPanelApprover,
} from '../../../design-system/components';
import {
  ApprovalPanel,
  Button,
  InlineNotice,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const protectedChangeAction = fn();

type ApprovalScenario =
  | 'pending'
  | 'approved'
  | 'rejected';

function resolveApprovers(
  scenario: ApprovalScenario,
): readonly ApprovalPanelApprover[] {
  if (scenario === 'approved') {
    return [
      {
        name: 'Alicja Nowak',
        status: 'approved',
        userId: 'user-alicja',
      },
      {
        name: 'Marek Zieliński',
        status: 'approved',
        userId: 'user-marek',
      },
    ];
  }

  if (scenario === 'rejected') {
    return [
      {
        name: 'Alicja Nowak',
        status: 'approved',
        userId: 'user-alicja',
      },
      {
        name: 'Marek Zieliński',
        status: 'rejected',
        userId: 'user-marek',
      },
    ];
  }

  return [
    {
      name: 'Alicja Nowak',
      status: 'approved',
      userId: 'user-alicja',
    },
    {
      name: 'Marek Zieliński',
      status: 'pending',
      userId: 'user-marek',
    },
  ];
}

function resolveNotice(
  scenario: ApprovalScenario,
  actionExecuted: boolean,
) {
  if (actionExecuted) {
    return {
      message:
        'Chroniona zmiana została dopuszczona po spełnieniu warunku approval.',
      tone: 'success' as const,
      title: 'Warunek spełniony',
    };
  }

  if (scenario === 'approved') {
    return {
      message:
        'Wszyscy approverzy zatwierdzili zmianę. Akcja jest dostępna.',
      tone: 'success' as const,
      title: 'Approval zatwierdzony',
    };
  }

  if (scenario === 'rejected') {
    return {
      message:
        'Approval został odrzucony. Chroniona akcja pozostaje zablokowana.',
      tone: 'critical' as const,
      title: 'Approval odrzucony',
    };
  }

  return {
    message:
      'Brakuje drugiej akceptacji. Akcja jest widoczna, ale zablokowana do spełnienia warunku.',
    tone: 'warning' as const,
    title: 'Approval oczekuje',
  };
}

function ApprovalProtectionPattern() {
  const [scenario, setScenario] =
    useState<ApprovalScenario>('pending');
  const [actionExecuted, setActionExecuted] =
    useState(false);
  const approvers = useMemo(
    () => resolveApprovers(scenario),
    [scenario],
  );
  const notice = resolveNotice(
    scenario,
    actionExecuted,
  );
  const actionBlocked = scenario !== 'approved';

  return (
    <div className="pd-x18-split pd-x18-approval-layout">
      <section
        aria-label="Wybór statusu approval"
        className="pd-x18-region"
      >
        <div className="pd-x18-region__header">
          <p className="pd-x18-region__eyebrow">
            Zmiana chroniona
          </p>
          <h3 className="pd-x18-region__title">
            Podniesienie limitu dziennego eksportów
          </h3>
          <p className="pd-x18-region__text">
            ApprovalPanel pokazuje status dodatkowej autoryzacji. To inny
            problem niż potwierdzenie destrukcyjnej operacji.
          </p>
        </div>

        <div
          aria-label="Scenariusz approval"
          className="pd-x18-action-row"
        >
          <Button
            aria-pressed={scenario === 'pending'}
            onClick={() => {
              setScenario('pending');
              setActionExecuted(false);
            }}
            size="small"
            type="button"
            variant={scenario === 'pending' ? 'primary' : 'secondary'}
          >
            Status: oczekuje
          </Button>
          <Button
            aria-pressed={scenario === 'approved'}
            onClick={() => {
              setScenario('approved');
              setActionExecuted(false);
            }}
            size="small"
            type="button"
            variant={scenario === 'approved' ? 'primary' : 'secondary'}
          >
            Status: zatwierdzone
          </Button>
          <Button
            aria-pressed={scenario === 'rejected'}
            onClick={() => {
              setScenario('rejected');
              setActionExecuted(false);
            }}
            size="small"
            type="button"
            variant={scenario === 'rejected' ? 'primary' : 'secondary'}
          >
            Status: odrzucone
          </Button>
        </div>

        <InlineNotice
          message={notice.message}
          title={notice.title}
          tone={notice.tone}
        />
      </section>

      <section
        aria-label="Approval dla zmiany chronionej"
        className="pd-x18-region"
      >
        <ApprovalPanel
          approvers={approvers}
          expiresAt="2026-08-12T11:30:00+02:00"
          risk="high"
          subjectId="export-limit-2026-08"
          subjectLabel="Limit dziennych eksportów: 5 000 → 25 000"
        />

        <div className="pd-x18-action-row">
          <Button
            disabled={actionBlocked}
            onClick={() => {
              protectedChangeAction();
              setActionExecuted(true);
            }}
            type="button"
            variant="primary"
          >
            Wykonaj chronioną zmianę
          </Button>
          {actionBlocked ? (
            <span className="pd-x18-description">
              Akcja wymaga zatwierdzonego approval.
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Approval, step-up i ochrona zmian',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ApprovalProtectionStory: Story = {
  name: 'Approval, step-up i ochrona zmian',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca approval"
          items={[
            { label: 'Kontrakt', value: '18.06' },
            { label: 'Komponenty', value: 'ApprovalPanel / Button' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.06"
      summary="Approval i ochrona zmiany pokazują dodatkowy warunek autoryzacji przed dopuszczeniem akcji."
      title="Approval, step-up i ochrona zmian"
    >
      <StoryPresentationSection
        index="01"
        summary="ApprovalPanel pokazuje ryzyko, approverów, wygaśnięcie i blokadę akcji do spełnienia warunku."
        title="Dodatkowy warunek przed zmianą"
      >
        <ApprovalProtectionPattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Approval, step-up i ochrona zmian',
      }),
    ).toBeInTheDocument();

    const protectedAction = canvas.getByRole('button', {
      name: 'Wykonaj chronioną zmianę',
    });

    await expect(protectedAction).toBeDisabled();
    await expect(
      canvas.getByText(/Brakuje drugiej akceptacji/),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Marek Zieliński'),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Status: zatwierdzone',
      }),
    );
    await expect(protectedAction).toBeEnabled();

    await userEvent.click(protectedAction);
    await expect(
      canvas.getByText(/Chroniona zmiana została dopuszczona/),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Status: odrzucone',
      }),
    );
    await expect(protectedAction).toBeDisabled();
    await expect(
      canvas.getByText(/Approval został odrzucony/),
    ).toBeInTheDocument();
  },
};
