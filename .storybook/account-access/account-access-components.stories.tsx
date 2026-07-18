import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowRight,
  Eye,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRoundCheck,
  Waypoints,
} from "lucide-react";
import { useState } from "react";

import "../foundations/papadata-brand-surface.css";
import { PapaDataBrand } from "../shared/PapaDataBrand";
import { VerificationCodeInput } from "./VerificationCodeInput";
import "./papadata-auth.css";

type AuthComponentShowcaseProps = {
  initialTheme: "light" | "dark";
};

function AuthComponentShowcase({
  initialTheme = "dark",
}: AuthComponentShowcaseProps) {
  return (
    <div
      className="pds-brand-surface pda-auth-shell"
      data-theme={initialTheme}
      lang="pl"
    >
      <header className="pds-topbar" aria-label="PapaData">
        <div className="pds-topbar__inner">
          <PapaDataBrand />
        </div>
      </header>

      <main className="pda-components-main">
        <header className="pda-components-heading">
          <span className="pda-auth-kicker">Dostęp do konta</span>
          <h1>Elementy procesu Auth</h1>
          <p>
            Referencja przycisków, pól, postępu i sygnałów używanych przez
            powierzchnie dostępu PapaData.
          </p>
        </header>

        <section className="pda-component-section">
          <header>
            <span>Akcje</span>
            <h2>Przyciski i dostawcy</h2>
          </header>

          <div className="pda-component-row">
            <button
              className="pda-auth-button pda-auth-button--primary"
              type="button"
            >
              Kontynuuj
              <ArrowRight size={18} />
            </button>

            <button
              className="pda-auth-button pda-auth-button--secondary"
              type="button"
            >
              Wyślij ponownie
            </button>

            <button className="pda-auth-link" type="button">
              Odzyskaj dostęp
            </button>
          </div>

          <div className="pda-provider-row pda-component-row--narrow">
            <button className="pda-provider-button" type="button">
              <span className="pda-provider-mark pda-provider-mark--google">
                G
              </span>
              <span>Google</span>
              <ArrowRight size={16} />
            </button>

            <button className="pda-provider-button" type="button">
              <span className="pda-provider-mark pda-provider-mark--microsoft">
                M
              </span>
              <span>Microsoft</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="pda-component-section">
          <header>
            <span>Formularze</span>
            <h2>Pola i kod jednorazowy</h2>
          </header>

          <div className="pda-field-grid pda-component-row--fields">
            <label className="pda-field" htmlFor="component-email">
              <span className="pda-field__label">E-mail służbowy</span>

              <span className="pda-input-frame">
                <Mail size={18} />
                <input
                  defaultValue="anna@northstar.example"
                  id="component-email"
                  type="email"
                />
                <span className="pda-input-frame__signal" />
              </span>
            </label>

            <div className="pda-field">
              <label className="pda-field__label" htmlFor="component-password">
                Hasło
              </label>

              <span className="pda-input-frame">
                <LockKeyhole size={18} />
                <input id="component-password" type="password" />
                <button
                  aria-label="Pokaż hasło"
                  className="pda-field-action"
                  type="button"
                >
                  <Eye size={18} />
                </button>
              </span>
            </div>

            <div className="pda-code-showcase-grid">
              <CodeInputExample
                id="component-code-empty"
                initialValue=""
                label="Kod dostępu — pusty"
              />

              <CodeInputExample
                id="component-code-partial"
                initialValue="123"
                label="Kod dostępu — częściowy"
              />

              <CodeInputExample
                id="component-code-complete"
                initialValue="123456"
                label="Kod dostępu — kompletny"
              />

              <CodeInputExample
                errorMessage="Kod jest nieprawidłowy. Sprawdź wpisane cyfry i spróbuj ponownie."
                id="component-code-invalid"
                initialValue=""
                invalid
                label="Kod dostępu — błędny"
              />

              <CodeInputExample
                disabled
                id="component-code-disabled"
                initialValue="123456"
                label="Kod dostępu — nieaktywny"
              />
            </div>
          </div>
        </section>

        <section className="pda-component-section">
          <header>
            <span>Stan</span>
            <h2>Postęp i sygnały zaufania</h2>
          </header>

          <div className="pda-component-grid">
            <ol className="pda-auth-progress">
              <li className="is-complete">
                <span className="pda-auth-progress__node">
                  <UserRoundCheck size={15} />
                </span>
                <span className="pda-auth-progress__label">Konto</span>
              </li>

              <li className="is-active">
                <span className="pda-auth-progress__node">
                  <Fingerprint size={15} />
                </span>
                <span className="pda-auth-progress__label">Weryfikacja</span>
              </li>

              <li>
                <span className="pda-auth-progress__node">
                  <Waypoints size={15} />
                </span>
                <span className="pda-auth-progress__label">Dostęp</span>
              </li>
            </ol>

            <div className="pda-component-trust">
              <ShieldCheck size={22} />
              <span>
                <strong>Bezpieczny feedback</strong>
                <span>Komunikaty nie ujawniają stanu konta ani dostawcy.</span>
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function CodeInputExample({
  disabled,
  errorMessage,
  id,
  initialValue,
  invalid,
  label,
}: {
  disabled?: boolean;
  errorMessage?: string;
  id: string;
  initialValue: string;
  invalid?: boolean;
  label: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <VerificationCodeInput
      disabled={disabled}
      errorMessage={errorMessage}
      hint={invalid ? undefined : "Wpisz dokładnie sześć cyfr."}
      id={id}
      invalid={invalid}
      label={label}
      name={id}
      onChange={setValue}
      value={value}
    />
  );
}

const meta = {
  title: "PapaData/Dostęp do konta/Komponenty",
  component: AuthComponentShowcase,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    initialTheme: {
      control: "inline-radio",
      options: ["light", "dark"],
    },
  },
} satisfies Meta<typeof AuthComponentShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZestawKomponentow: Story = {
  name: "Zestaw komponentów",
  args: {
    initialTheme: "dark",
  },
};
