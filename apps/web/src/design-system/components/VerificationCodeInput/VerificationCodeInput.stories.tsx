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
  VerificationCodeInput,
} from './VerificationCodeInput';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/VerificationCodeInput',
  component: VerificationCodeInput,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'Kod weryfikacyjny',
    length: 6,
    onChange: fn(),
    value: '482',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    length: { control: 'number' },
    masked: { control: 'boolean' },
  },
} satisfies Meta<typeof VerificationCodeInput>;

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
      className="pd-verification-code-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '320px' } as const;

export const VerificationCodeInputStory: Story = {
  name: 'VerificationCodeInput',
  render: (args) => (
    <StoryPresentationPage
      className="pd-verification-code-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry VerificationCodeInput', en: 'VerificationCodeInput parameters' })}
          items={[
            { label: <Localized pl="Domyślna długość" en="Default length" />, value: '6' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="verification-code-input"
      summary={
        <Localized
          pl="Kod jednorazowy MFA/weryfikacji e-mail. Licznik znaków w etykiecie zawsze pokazuje postęp wpisywania (n/length). masked ukrywa cyfry jak pole hasła."
          en="A one-time MFA/email-verification code. The label's counter always shows typing progress (n/length). masked hides digits like a password field."
        />
      }
      title={<Localized pl="Kod, który liczy się sam." en="A code that counts itself." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="code-controlled" style={stackStyle}>
          <VerificationCodeInput {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="code-states" style={stackStyle}>
          <VerificationCodeInput invalid label={copy({ pl: 'Nieprawidłowy kod', en: 'Invalid code' })} length={6} message={copy({ pl: 'Kod jest nieprawidłowy lub wygasł.', en: 'The code is invalid or expired.' })} value="000000" onChange={fn()} />
          <VerificationCodeInput label={copy({ pl: 'Kod zamaskowany', en: 'Masked code' })} length={6} masked value="482913" onChange={fn()} />
          <VerificationCodeInput disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} length={6} value="" onChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const badge = canvas.getByTestId('code-controlled').querySelector('.pd-form-field__badge');
    await expect(badge).toHaveTextContent('3/6');

    await expect(canvas.getByTestId('code-states').children).toHaveLength(3);
  },
};
