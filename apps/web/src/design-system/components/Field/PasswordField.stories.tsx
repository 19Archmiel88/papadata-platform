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
  PasswordField,
} from './PasswordField';

import './form-showcase.css';

const meta = {
  title: '10 Komponenty/Pole hasła',
  component: PasswordField,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof PasswordField>;

export default meta;

type Story = StoryObj<typeof meta>;

function PasswordFieldShowcase() {
  const [visible, setVisible] = useState(false);

  return (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Pole hasła</p>
          <h1>Pole hasła bez walidacji biznesowej.</h1>
          <p className="pd-form-story__lead">
            Pole hasła ma prosty tryb ukryty i pokazany, tekst pomocniczy,
            stan błędu oraz opcjonalną prezentację wymagań i siły hasła.
          </p>
        </header>

        <section className="pd-form-story__section">
          <h2>Warianty</h2>
          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">interakcja</span>
              <h3>Pokaż i ukryj</h3>
              <PasswordField
                autocomplete="current-password"
                helperText="Tryb widoczności zmienia tylko prezentację pola."
                label="Hasło"
                name="password"
                onVisibilityChange={setVisible}
                requirements={[
                  {
                    id: 'len',
                    label: 'Co najmniej 8 znaków',
                    met: true,
                  },
                  {
                    id: 'upper',
                    label: 'Jedna wielka litera',
                    met: true,
                  },
                  {
                    id: 'digit',
                    label: 'Jedna cyfra',
                    met: false,
                  },
                ]}
                strength={72}
                value="SekretneHasło"
                visible={visible}
              />
            </article>

            <article className="pd-form-story__card" data-tone="error">
              <span className="pd-form-story__eyebrow">błąd</span>
              <h3>Stan błędu</h3>
              <PasswordField
                helperText="To tylko komunikat komponentowy."
                invalid
                label="Nowe hasło"
                message="Hasło wymaga dopracowania przed zapisem."
                name="newPassword"
                required
                strength={28}
                value="abc"
              />
            </article>

            <article className="pd-form-story__card" data-tone="muted">
              <span className="pd-form-story__eyebrow">wyłączony</span>
              <h3>Stan wyłączony</h3>
              <PasswordField
                disabled
                helperText="Kontrolka jest zablokowana do czasu dodatkowej weryfikacji."
                label="Hasło administratora"
                name="adminPassword"
                value="Niedostępne"
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export const PasswordFieldStory: Story = {
  args: {
    label: 'Hasło',
    value: 'SekretneHasło',
  },
  name: 'Pole hasła',
  render: () => <PasswordFieldShowcase />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Hasło');
    const toggle = canvas.getAllByRole('button', {
      name: 'Pokaż hasło',
    })[0];

    await expect(field).toHaveAttribute('type', 'password');
    await userEvent.click(toggle);
    await expect(field).toHaveAttribute('type', 'text');
    await expect(
      canvas.getByText('Hasło wymaga dopracowania przed zapisem.'),
    ).toBeInTheDocument();
  },
};
