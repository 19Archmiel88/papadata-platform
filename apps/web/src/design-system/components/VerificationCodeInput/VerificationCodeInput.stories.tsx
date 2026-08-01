import {
  useState,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  VerificationCodeInput,
} from './VerificationCodeInput';
import '../Field/form-showcase.css';

const meta = {
  title: '10 Komponenty/Kod weryfikacyjny',
  component: VerificationCodeInput,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof VerificationCodeInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function VerificationCodeShowcase() {
  const [value, setValue] = useState('12');

  return (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Kod weryfikacyjny</p>
          <h1>Kod weryfikacyjny jako komponent bazowy.</h1>
          <p className="pd-form-story__lead">
            Komponent przyjmuje długość kodu jako props, nie wykonuje
            automatycznego wysłania i nie ma zależności od API ani formularza logowania.
          </p>
        </header>

        <section className="pd-form-story__section">
          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wariant podstawowy</span>
              <h3>Podstawowy wariant</h3>
              <VerificationCodeInput
                helperText="Pole przyjmuje kod bez automatycznego wysłania formularza."
                label="Kod weryfikacyjny"
                length={6}
                onChange={(event) => {
                  setValue(event.currentTarget.value);
                }}
                resendAvailableAt="00:24"
                value={value}
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">maskowany</span>
              <h3>Wariant maskowany</h3>
              <VerificationCodeInput
                helperText="Widok podglądowy pól może być maskowany."
                label="Kod SMS"
                length={4}
                masked
                value="8412"
              />
            </article>

            <article className="pd-form-story__card" data-tone="error">
              <span className="pd-form-story__eyebrow">błąd</span>
              <h3>Stan błędu</h3>
              <VerificationCodeInput
                helperText="Kod powinien mieć 6 znaków."
                invalid
                label="Kod MFA"
                length={6}
                message="Kod jest niepełny lub wygasł."
                required
                value="93"
              />
            </article>

            <article className="pd-form-story__card" data-tone="muted">
              <span className="pd-form-story__eyebrow">wyłączony</span>
              <h3>Stan wyłączony</h3>
              <VerificationCodeInput
                disabled
                helperText="Pole zablokowane do czasu ponownej wysyłki."
                label="Kod rezerwowy"
                length={8}
                value="87654321"
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export const VerificationCodeInputStory: Story = {
  args: {
    label: 'Kod weryfikacyjny',
    value: '12',
  },
  name: 'Kod weryfikacyjny',
  render: () => <VerificationCodeShowcase />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', {
      name: 'Kod weryfikacyjny',
    });

    await userEvent.clear(input);
    await userEvent.type(input, '123456');
    await expect(input).toHaveValue('123456');
    await expect(
      canvas.getByText('Kod jest niepełny lub wygasł.'),
    ).toBeInTheDocument();
  },
};
