import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Switch,
} from './Switch';
import '../Field/form-showcase.css';

const meta = {
  title: '10 Komponenty/Przełącznik',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SwitchStory: Story = {
  args: {
    checked: true,
    label: 'Aktywuj przypomnienia e-mail',
  },
  name: 'Przełącznik',
  render: () => (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Przełącznik</p>
          <h1>Przełącznik dla prostych ustawień natychmiastowych.</h1>
          <p className="pd-form-story__lead">
            Wariant podstawowy, stan wyłączony, oczekiwanie i błąd są
            utrzymane bez dodatkowej logiki wykonawczej ani zależności zewnętrznych.
          </p>
        </header>

        <section className="pd-form-story__section">
          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wariant podstawowy</span>
              <h3>Podstawowy wariant</h3>
              <Switch
                checked
                helperText="Zmiana dotyczy tylko prezentacji komponentu."
                label="Aktywuj przypomnienia e-mail"
                name="reminders"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">oczekiwanie</span>
              <h3>Stan oczekiwania</h3>
              <Switch
                checked
                helperText="Kontrolka jest chwilowo zablokowana."
                label="Publikuj zmiany automatycznie"
                name="publish"
                pending
              />
            </article>

            <article className="pd-form-story__card" data-tone="error">
              <span className="pd-form-story__eyebrow">błąd</span>
              <h3>Stan błędu</h3>
              <Switch
                checked={false}
                helperText="Przełącznik nie może być aktywowany bez zgody."
                invalid
                label="Udostępnij dane wsparciu"
                message="Ta opcja wymaga dodatkowego potwierdzenia."
                name="supportAccess"
              />
            </article>

            <article className="pd-form-story__card" data-tone="muted">
              <span className="pd-form-story__eyebrow">wyłączony</span>
              <h3>Stan wyłączony</h3>
              <Switch
                checked={false}
                disabled
                helperText="Zablokowane przez role w organizacji."
                label="Wymagaj MFA dla wszystkich"
                name="mfa"
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('switch', {
      name: 'Aktywuj przypomnienia e-mail',
    });
    const pending = canvas.getByRole('switch', {
      name: 'Publikuj zmiany automatycznie',
    });

    await expect(active).toBeChecked();
    await expect(pending).toBeDisabled();
    await expect(pending).toHaveAttribute('aria-busy', 'true');
  },
};
