import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Checkbox,
} from './Checkbox';
import '../Field/form-showcase.css';

const meta = {
  title: '10 Komponenty/Pole wyboru',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CheckboxStory: Story = {
  args: {
    checked: true,
    label: 'Akceptuję regulamin i politykę prywatności',
    value: 'accepted',
  },
  name: 'Pole wyboru',
  render: () => (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Pole wyboru</p>
          <h1>Pole wyboru dla zgód i wielu wyborów.</h1>
          <p className="pd-form-story__lead">
            Komponent utrzymuje proste API, tekst pomocniczy, stan błędu,
            stan wyłączony oraz wariant pośredni bez dodatkowych zależności.
          </p>
        </header>

        <section className="pd-form-story__section">
          <h2>Warianty</h2>
          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wariant podstawowy</span>
              <h3>Podstawowy wariant</h3>
              <Checkbox
                checked
                helperText="Zgoda jest oddzielona od logiki zapisu."
                label="Akceptuję regulamin i politykę prywatności"
                name="consent"
                value="accepted"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">stan pośredni</span>
              <h3>Stan pośredni</h3>
              <Checkbox
                checked={false}
                helperText="Wariant przydatny w zaznaczaniu grupowym."
                indeterminate
                label="Wybór częściowy"
                name="partial"
                value="partial"
              />
            </article>

            <article className="pd-form-story__card" data-tone="error">
              <span className="pd-form-story__eyebrow">błąd</span>
              <h3>Stan błędu</h3>
              <Checkbox
                checked={false}
                helperText="Pole jest wymagane."
                invalid
                label="Potwierdzam zgodność danych"
                message="Zaznacz to pole przed przejściem dalej."
                name="confirm"
                required
                value="confirm"
              />
            </article>

            <article className="pd-form-story__card" data-tone="muted">
              <span className="pd-form-story__eyebrow">wyłączony</span>
              <h3>Stan wyłączony</h3>
              <Checkbox
                checked
                disabled
                helperText="Kontrolka jest zablokowana przez politykę konta."
                label="Użyj danych historycznych"
                name="history"
                value="history"
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
    const checked = canvas.getByRole('checkbox', {
      name: 'Akceptuję regulamin i politykę prywatności',
    });
    const invalid = canvas.getByRole('checkbox', {
      name: 'Potwierdzam zgodność danych',
    });

    await expect(checked).toBeChecked();
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(
      canvas.getByText('Zaznacz to pole przed przejściem dalej.'),
    ).toBeInTheDocument();
  },
};
