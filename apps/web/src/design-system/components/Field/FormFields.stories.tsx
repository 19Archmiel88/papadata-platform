import type {
  ReactNode,
} from 'react';
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
} from '../VerificationCodeInput';
import {
  FileInput,
} from './FileInput';
import {
  PasswordField,
} from './PasswordField';
import {
  Textarea,
} from './Textarea';
import {
  TextField,
} from './TextField';

import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';
import './field-family-showcase.css';

const meta = {
  title: '10 Komponenty bazowe/Pola tekstowe i formularzowe',
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

function StorySection({
  children,
  description,
  index,
  title,
}: {
  readonly children: ReactNode;
  readonly description: string;
  readonly index: string;
  readonly title: string;
}) {
  return (
    <StoryPresentationSection
      className="pd-field-family-section"
      index={index}
      summary={description}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function StoryVariant({
  children,
  description,
  title,
  token,
}: {
  readonly children: ReactNode;
  readonly description: string;
  readonly title: string;
  readonly token: string;
}) {
  return (
    <article className="pd-f0-variant" data-reference="demo-only">
      <header className="pd-f0-variant__header">
        <h3>{title}</h3>
        <p>{description}</p>
        <code>{token}</code>
      </header>
      <div className="pd-f0-variant__body">{children}</div>
    </article>
  );
}

function FormFieldsShowcase() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('12');

  return (
    <StoryPresentationPage
      className="pd-field-family-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry kontraktu pól formularzowych"
          items={[
            { label: 'Kontrakt', value: '10.03' },
            { label: 'Źródło wyglądu', value: '00 Fundamenty' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="10"
      sectionLabel="Komponenty bazowe"
      storyId="10.03"
      summary="Każde pole korzysta z tej samej etykiety, powierzchni, geometrii, informacji pomocniczej i walidacji. Story nie definiuje własnego canvasu ani lokalnej typografii."
      title="Pola jako jeden system danych wejściowych."
    >

        <StorySection
          description="Pole podstawowe, wymagane i tylko do odczytu zachowują tę samą geometrię i strukturę opisu."
          index="01"
          title="TextField i kontrakt treści"
        >
          <StoryVariant
            description="Etykieta, wartość i helper text należą do jednego komponentu."
            title="Pole podstawowe"
            token="TextField"
          >
            <TextField
              helperText="Nazwa jest widoczna w raportach i historii zmian."
              label="Nazwa raportu"
              name="reportName"
              onChange={() => undefined}
              value="Raport dzienny"
            />
          </StoryVariant>

          <StoryVariant
            description="Wymagalność jest komunikowana semantycznie i wizualnie."
            title="Pole wymagane"
            token="required"
          >
            <TextField
              helperText="Wartość jest wymagana przed zapisaniem konfiguracji."
              label="Nazwa źródła"
              name="sourceName"
              onChange={() => undefined}
              required
              value=""
            />
          </StoryVariant>

          <StoryVariant
            description="Read-only pozostaje czytelne, ale nie udaje stanu disabled."
            title="Tylko do odczytu"
            token="read-only"
          >
            <TextField
              helperText="Identyfikator został nadany przez system."
              label="Identyfikator połączenia"
              name="connectionId"
              readOnly
              value="conn_8N4M2"
            />
          </StoryVariant>
        </StorySection>

        <StorySection
          description="Pole hasła zachowuje kontrakt formularza i dodaje wyłącznie kontrolowaną widoczność oraz wymagania."
          index="02"
          title="PasswordField"
        >
          <StoryVariant
            description="Zmiana widoczności nie zmienia wartości ani geometrii kontrolki."
            title="Widoczność i wymagania"
            token="PasswordField"
          >
            <PasswordField
              autocomplete="new-password"
              helperText="Hasło pozostaje lokalnym stanem demonstracyjnym."
              label="Nowe hasło"
              name="password"
              onChange={() => undefined}
              onVisibilityChange={setPasswordVisible}
              requirements={[
                { id: 'length', label: 'Co najmniej 12 znaków', met: true },
                { id: 'digit', label: 'Co najmniej jedna cyfra', met: true },
                { id: 'symbol', label: 'Co najmniej jeden znak specjalny', met: false },
              ]}
              required
              strength={72}
              value="PapaData2026"
              visible={passwordVisible}
            />
          </StoryVariant>
        </StorySection>

        <StorySection
          description="Dłuższa treść i plik korzystają z tego samego kontraktu etykiety, powierzchni, helper textu i błędu."
          index="03"
          title="Textarea i FileInput"
        >
          <StoryVariant
            description="Textarea rozszerza pole tekstowe bez tworzenia nowego języka wizualnego."
            title="Treść wielowierszowa"
            token="Textarea"
          >
            <Textarea
              helperText="Opis powinien wyjaśniać cel raportu bez danych wrażliwych."
              label="Opis raportu"
              name="description"
              onChange={() => undefined}
              value="Raport porównuje koszty kampanii i jakość źródeł danych."
            />
          </StoryVariant>

          <StoryVariant
            description="Plik ma natywną semantykę input type=file i ten sam system walidacji."
            title="Plik źródłowy"
            token="FileInput"
          >
            <FileInput
              accept=".csv,.xlsx"
              helperText="Dozwolone formaty: CSV i XLSX, maksymalnie 20 MB."
              label="Plik danych"
              name="sourceFile"
              required
            />
          </StoryVariant>
        </StorySection>

        <StorySection
          description="Walidacja, disabled i kod weryfikacyjny nie zmieniają hierarchii strony ani wyglądu komponentów bazowych."
          index="04"
          title="Stany i kod weryfikacyjny"
        >
          <StoryVariant
            description="Błąd ma komunikat tekstowy i aria-invalid."
            title="Walidacja błędu"
            token="validation"
          >
            <TextField
              helperText="Wymagany format: kontakt@firma.pl"
              inputType="email"
              invalid
              label="Adres e-mail"
              message="Podany adres nie ma poprawnego formatu."
              name="email"
              onChange={() => undefined}
              required
              value="kontakt@firma"
            />
          </StoryVariant>

          <StoryVariant
            description="Stan wyłączony pozostaje rozpoznawalny i nie przyjmuje interakcji."
            title="Pole wyłączone"
            token="disabled"
          >
            <TextField
              disabled
              helperText="Pole jest zablokowane do czasu zakończenia synchronizacji."
              label="Klucz źródła"
              name="sourceKey"
              value="source_2026"
            />
          </StoryVariant>

          <StoryVariant
            description="Kod zachowuje etykietę, helper text, limit długości i kontrolowany stan."
            title="Kod weryfikacyjny"
            token="VerificationCodeInput"
          >
            <VerificationCodeInput
              helperText="Kod nie jest wysyłany automatycznie."
              label="Kod MFA"
              length={6}
              onChange={(event) => setVerificationCode(event.currentTarget.value)}
              required
              value={verificationCode}
            />
          </StoryVariant>
        </StorySection>
    </StoryPresentationPage>
  );
}

export const PolaFormularzy: Story = {
  args: {
    label: 'Nazwa raportu',
    value: 'Raport dzienny',
  },
  name: 'Pola formularzy',
  render: () => <FormFieldsShowcase />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reportName = canvas.getByRole('textbox', {
      name: 'Nazwa raportu',
    });
    const requiredField = canvas.getByRole('textbox', {
      name: 'Nazwa źródła',
    });
    const readOnlyField = canvas.getByRole('textbox', {
      name: 'Identyfikator połączenia',
    });
    const disabledField = canvas.getByRole('textbox', {
      name: 'Klucz źródła',
    });
    const invalidField = canvas.getByRole('textbox', {
      name: 'Adres e-mail',
    });
    const textarea = canvas.getByRole('textbox', {
      name: 'Opis raportu',
    });
    const fileInput = canvas.getByLabelText('Plik danych');
    const password = canvas.getByLabelText('Nowe hasło');
    const toggle = canvas.getByRole('button', {
      name: 'Pokaż hasło',
    });
    const code = canvas.getByRole('textbox', {
      name: 'Kod MFA',
    });

    await expect(reportName).toHaveValue('Raport dzienny');
    await expect(requiredField).toBeRequired();
    await expect(readOnlyField).toHaveAttribute('readonly');
    await expect(disabledField).toBeDisabled();
    await expect(invalidField).toHaveAttribute('aria-invalid', 'true');
    await expect(textarea.tagName).toBe('TEXTAREA');
    await expect(fileInput).toHaveAttribute('type', 'file');
    await expect(password).toHaveAttribute('type', 'password');

    await userEvent.click(toggle);
    await expect(password).toHaveAttribute('type', 'text');

    await userEvent.clear(code);
    await userEvent.type(code, '123456');
    await expect(code).toHaveValue('123456');

    const assertCompositeFocus = async (
      control: HTMLElement,
    ) => {
      control.blur();

      const composite = control.closest('.pd-form-control');

      if (!(composite instanceof HTMLElement)) {
        throw new Error('Focused field is missing the shared form-control wrapper.');
      }

      const geometryBeforeFocus = composite.getBoundingClientRect();

      control.focus();
      await expect(control).toHaveFocus();

      const controlStyle = getComputedStyle(control);
      const compositeStyle = getComputedStyle(composite);
      const geometryAfterFocus = composite.getBoundingClientRect();

      expect(controlStyle.borderBottomWidth).toBe('0px');
      expect(controlStyle.backgroundImage).toBe('none');
      expect(controlStyle.boxShadow).toBe('none');
      expect(controlStyle.outlineStyle).toBe('none');
      expect(compositeStyle.outlineStyle).not.toBe('none');
      expect(compositeStyle.boxShadow).not.toBe('none');
      expect(geometryAfterFocus.width).toBeCloseTo(geometryBeforeFocus.width, 2);
      expect(geometryAfterFocus.height).toBeCloseTo(geometryBeforeFocus.height, 2);
    };

    await assertCompositeFocus(reportName);
    await assertCompositeFocus(password);
    await assertCompositeFocus(textarea);
  },
};
