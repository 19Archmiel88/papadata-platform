import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  TextField,
} from './TextField';

import './form-showcase.css';

const meta = {
  title: '10 Komponenty/Pola tekstowe',
  component: TextField,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TextFieldStory: Story = {
  args: {
    label: 'Nazwa raportu',
    value: 'Raport dzienny',
  },
  name: 'Pola tekstowe',
  render: () => (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Pola tekstowe</p>
          <h1>Pole tekstowe jako fundament formularza.</h1>
          <p className="pd-form-story__lead">
            Komponent pozostaje neutralnym polem tekstowym: ma etykietę,
            tekst pomocniczy, stan błędu, stan poprawny i wariant z prefiksem
            lub sufiksem bez logiki biznesowej.
          </p>
        </header>

        <section className="pd-form-story__section">
          <h2>Warianty</h2>
          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wariant podstawowy</span>
              <h3>Podstawowy wariant</h3>
              <TextField
                helperText="Pole akceptuje wartość roboczą bez walidacji biznesowej."
                label="Nazwa raportu"
                name="reportName"
                placeholder="Wpisz nazwę"
                value="Raport dzienny"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">tekst pomocniczy</span>
              <h3>Prefiks i sufiks</h3>
              <TextField
                helperText="Prefiks i sufiks pozostają częścią tej samej kontrolki."
                label="Budżet"
                name="budget"
                prefix="PLN"
                suffix="netto"
                value="2500"
              />
            </article>

            <article className="pd-form-story__card" data-tone="error">
              <span className="pd-form-story__eyebrow">błąd</span>
              <h3>Stan błędu</h3>
              <TextField
                helperText="Wymagany format: kontakt@firma.pl"
                inputType="email"
                invalid
                label="Adres e-mail"
                message="Podany adres nie ma poprawnego formatu."
                name="email"
                required
                value="kontakt@firma"
              />
            </article>

            <article className="pd-form-story__card" data-tone="valid">
              <span className="pd-form-story__eyebrow">poprawny</span>
              <h3>Stan poprawny</h3>
              <TextField
                helperText="Pole jest gotowe do użycia w formularzu produkcyjnym."
                label="Telefon"
                message="Numer wygląda poprawnie."
                name="phone"
                valid
                value="+48 600 700 800"
              />
            </article>

            <article className="pd-form-story__card" data-tone="muted">
              <span className="pd-form-story__eyebrow">wyłączony</span>
              <h3>Stan wyłączony</h3>
              <TextField
                disabled
                helperText="Pole jest zablokowane do czasu odblokowania konfiguracji."
                label="Slug"
                name="slug"
                value="plan-pro-2026"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wymagane</span>
              <h3>Pole wymagane</h3>
              <TextField
                helperText="Wariant zgodny z kontraktem komponentu."
                label="Nazwa źródła"
                name="sourceName"
                required
                value=""
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
    const field = canvas.getByRole('textbox', {
      name: 'Nazwa raportu',
    });
    const invalid = canvas.getByRole('textbox', {
      name: 'Adres e-mail',
    });

    await expect(field).toHaveValue('Raport dzienny');
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(
      canvas.getByText('Podany adres nie ma poprawnego formatu.'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('textbox', { name: 'Slug' }),
    ).toBeDisabled();
  },
};
