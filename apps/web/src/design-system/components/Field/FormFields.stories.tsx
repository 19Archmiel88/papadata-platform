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
import type {
  PapaDataRuntimeLocale,
} from '../../foundations';
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
  title: '00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe',
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

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function startsWithAccessibleName(value: string) {
  return new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
}

function Localized({
  pl,
  en,
}: LocalizedCopy) {
  return <>{copy({ pl, en })}</>;
}

function StorySection({
  children,
  description,
  index,
  title,
}: {
  readonly children: ReactNode;
  readonly description: ReactNode;
  readonly index: string;
  readonly title: ReactNode;
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
  readonly description: ReactNode;
  readonly title: ReactNode;
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
  const reportNameLabel = copy({ pl: 'Nazwa raportu', en: 'Report name' });
  const reportNameValue = copy({ pl: 'Raport dzienny', en: 'Daily report' });
  const sourceNameLabel = copy({ pl: 'Nazwa źródła', en: 'Source name' });
  const connectionIdLabel = copy({ pl: 'Identyfikator połączenia', en: 'Connection identifier' });
  const sourceKeyLabel = copy({ pl: 'Klucz źródła', en: 'Source key' });
  const workspaceSlugLabel = copy({ pl: 'Identyfikator obszaru roboczego', en: 'Workspace identifier' });
  const emailLabel = copy({ pl: 'Adres e-mail', en: 'Email address' });
  const descriptionLabel = copy({ pl: 'Opis raportu', en: 'Report description' });
  const fileLabel = copy({ pl: 'Plik danych', en: 'Data file' });
  const passwordLabel = copy({ pl: 'Nowe hasło', en: 'New password' });
  const mfaLabel = copy({ pl: 'Kod MFA', en: 'MFA code' });

  return (
    <StoryPresentationPage
      className="pd-field-family-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Parametry kontraktu pól formularzowych',
            en: 'Form field contract parameters',
          })}
          items={[
            { label: <Localized pl="Kontrakt" en="Contract" />, value: '00.15' },
            { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Język" en="Language" />, value: readLocale().toUpperCase() },
            { label: 'Status', value: 'accepted' },
          ]}
        />
      )}
      sectionCode="00"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="00.15"
      summary={
        <Localized
          pl="Każde wejście danych korzysta z tej samej etykiety, powierzchni, geometrii, informacji pomocniczej i walidacji. Przyszłe formularze złożone, selektory dat i biblioteki kalendarzy mają dziedziczyć ten kontrakt."
          en="Every data input uses the same label, surface, geometry, helper information and validation. Future complex forms, date selectors and calendar libraries should inherit this contract."
        />
      }
      title={<Localized pl="Wejścia danych jako jeden kontrakt." en="Data inputs as one contract." />}
    >

        <StorySection
          description={<Localized pl="Pole podstawowe, wymagane i tylko do odczytu zachowują tę samą etykietę, geometrię, helper text i miejsce na komunikat." en="Base, required and read-only fields keep the same label, geometry, helper text and message slot." />}
          index="01"
          title={<Localized pl="Anatomia pola" en="Field anatomy" />}
        >
          <StoryVariant
            description={<Localized pl="Etykieta, wartość i helper text należą do jednego komponentu." en="Label, value and helper text belong to one component." />}
            title={<Localized pl="Pole podstawowe" en="Base field" />}
            token="TextField"
          >
            <TextField
              helperText={copy({ pl: 'Nazwa jest widoczna w raportach i historii zmian.', en: 'The name is visible in reports and change history.' })}
              label={reportNameLabel}
              name="reportName"
              onChange={() => undefined}
              value={reportNameValue}
            />
          </StoryVariant>

          <StoryVariant
            description={<Localized pl="Wymagalność jest komunikowana semantycznie i wizualnie." en="Required state is communicated semantically and visually." />}
            title={<Localized pl="Pole wymagane" en="Required field" />}
            token="required"
          >
            <TextField
              helperText={copy({ pl: 'Wartość jest wymagana przed zapisaniem konfiguracji.', en: 'A value is required before saving configuration.' })}
              label={sourceNameLabel}
              name="sourceName"
              onChange={() => undefined}
              required
              value=""
            />
          </StoryVariant>

          <StoryVariant
            description={<Localized pl="Read-only pozostaje czytelne, ale nie udaje stanu disabled." en="Read-only remains readable without pretending to be disabled." />}
            title={<Localized pl="Tylko do odczytu" en="Read-only" />}
            token="read-only"
          >
            <TextField
              helperText={copy({ pl: 'Identyfikator został nadany przez system.', en: 'The identifier was assigned by the system.' })}
              label={connectionIdLabel}
              name="connectionId"
              readOnly
              value="conn_8N4M2"
            />
          </StoryVariant>
        </StorySection>

        <StorySection
          description={<Localized pl="Pole hasła zachowuje kontrakt formularza i dodaje wyłącznie kontrolowaną widoczność oraz wymagania." en="The password field keeps the form contract and adds only controlled visibility and requirements." />}
          index="02"
          title={<Localized pl="Poufne dane i wymagania" en="Sensitive data and requirements" />}
        >
          <StoryVariant
            description={<Localized pl="Zmiana widoczności nie zmienia wartości ani geometrii kontrolki." en="Changing visibility does not change the value or control geometry." />}
            title={<Localized pl="Widoczność i wymagania" en="Visibility and requirements" />}
            token="PasswordField"
          >
            <PasswordField
              autocomplete="new-password"
              helperText={copy({ pl: 'Hasło pozostaje lokalnym stanem demonstracyjnym.', en: 'The password remains local demo state.' })}
              label={passwordLabel}
              name="password"
              onChange={() => undefined}
              onVisibilityChange={setPasswordVisible}
              requirements={[
                { id: 'length', label: copy({ pl: 'Co najmniej 12 znaków', en: 'At least 12 characters' }), met: true },
                { id: 'digit', label: copy({ pl: 'Co najmniej jedna cyfra', en: 'At least one digit' }), met: true },
                { id: 'symbol', label: copy({ pl: 'Co najmniej jeden znak specjalny', en: 'At least one special character' }), met: false },
              ]}
              required
              strength={72}
              value="PapaData2026"
              visible={passwordVisible}
              visibilityLabelHidden={copy({ pl: 'Pokaż hasło', en: 'Show password' })}
              visibilityLabelVisible={copy({ pl: 'Ukryj hasło', en: 'Hide password' })}
            />
          </StoryVariant>
        </StorySection>

        <StorySection
          description={<Localized pl="Dłuższa treść, plik i przyszłe pola z bibliotek zewnętrznych korzystają z tego samego kontraktu etykiety, powierzchni, helper textu i błędu." en="Longer copy, file input and future fields from external libraries use the same label, surface, helper text and error contract." />}
          index="03"
          title={<Localized pl="Treść długa i plik" en="Long content and file" />}
        >
          <StoryVariant
            description={<Localized pl="Textarea rozszerza pole tekstowe bez tworzenia nowego języka wizualnego." en="Textarea extends text input without creating a new visual language." />}
            title={<Localized pl="Treść wielowierszowa" en="Multi-line content" />}
            token="Textarea"
          >
            <Textarea
              helperText={copy({ pl: 'Opis powinien wyjaśniać cel raportu bez danych wrażliwych.', en: 'The description should explain report purpose without sensitive data.' })}
              label={descriptionLabel}
              name="description"
              onChange={() => undefined}
              value={copy({ pl: 'Raport porównuje koszty kampanii i jakość źródeł danych.', en: 'The report compares campaign costs and data source quality.' })}
            />
          </StoryVariant>

          <StoryVariant
            description={<Localized pl="Plik ma natywną semantykę input type=file i ten sam system walidacji." en="File input keeps native input type=file semantics and the same validation system." />}
            title={<Localized pl="Plik źródłowy" en="Source file" />}
            token="FileInput"
          >
            <FileInput
              accept=".csv,.xlsx"
              helperText={copy({ pl: 'Dozwolone formaty: CSV i XLSX, maksymalnie 20 MB.', en: 'Allowed formats: CSV and XLSX, up to 20 MB.' })}
              label={fileLabel}
              name="sourceFile"
              required
            />
          </StoryVariant>
        </StorySection>

        <StorySection
          description={<Localized pl="Walidacja, disabled i kod weryfikacyjny nie zmieniają hierarchii strony ani wyglądu komponentów bazowych." en="Validation, disabled state and verification code do not change page hierarchy or base component appearance." />}
          index="04"
          title={<Localized pl="Stany wejścia" en="Input states" />}
        >
          <StoryVariant
            description={<Localized pl="Błąd ma komunikat tekstowy i aria-invalid." en="An error has a text message and aria-invalid." />}
            title={<Localized pl="Walidacja błędu" en="Error validation" />}
            token="validation"
          >
            <TextField
              helperText={copy({ pl: 'Wymagany format: kontakt@firma.pl', en: 'Required format: contact@company.com' })}
              inputType="email"
              invalid
              label={emailLabel}
              message={copy({ pl: 'Podany adres nie ma poprawnego formatu.', en: 'The provided address is not in a valid format.' })}
              name="email"
              onChange={() => undefined}
              required
              value={copy({ pl: 'kontakt@firma', en: 'contact@company' })}
            />
          </StoryVariant>

          <StoryVariant
            description={<Localized pl="Walidacja asynchroniczna nie przeskakuje layoutu i nie udaje błędu przed wynikiem." en="Asynchronous validation does not shift layout and does not pretend to be an error before the result." />}
            title={<Localized pl="Walidacja w toku" en="Validation in progress" />}
            token="validating"
          >
            <TextField
              helperText={copy({ pl: 'Sprawdzamy dostępność identyfikatora. Pole pozostaje czytelne podczas kontroli.', en: 'Checking identifier availability. The field remains readable during validation.' })}
              label={workspaceSlugLabel}
              message={copy({ pl: 'Walidacja trwa...', en: 'Validation is running...' })}
              name="workspaceSlug"
              readOnly
              value="papa-data-pl"
            />
          </StoryVariant>

          <StoryVariant
            description={<Localized pl="Stan wyłączony pozostaje rozpoznawalny i nie przyjmuje interakcji." en="The disabled state remains recognizable and does not accept interaction." />}
            title={<Localized pl="Pole wyłączone" en="Disabled field" />}
            token="disabled"
          >
            <TextField
              disabled
              helperText={copy({ pl: 'Pole jest zablokowane do czasu zakończenia synchronizacji.', en: 'The field is locked until synchronization completes.' })}
              label={sourceKeyLabel}
              name="sourceKey"
              value="source_2026"
            />
          </StoryVariant>

          <StoryVariant
            description={<Localized pl="Kod zachowuje etykietę, helper text, limit długości i kontrolowany stan." en="The code keeps label, helper text, length limit and controlled state." />}
            title={<Localized pl="Kod weryfikacyjny" en="Verification code" />}
            token="VerificationCodeInput"
          >
            <VerificationCodeInput
              helperText={copy({ pl: 'Kod nie jest wysyłany automatycznie.', en: 'The code is not submitted automatically.' })}
              label={mfaLabel}
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
  name: 'Pola tekstowe i formularzowe',
  render: () => <FormFieldsShowcase />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reportName = canvas.getByRole('textbox', {
      name: copy({ pl: 'Nazwa raportu', en: 'Report name' }),
    });
    const requiredField = canvas.getByRole('textbox', {
      name: copy({ pl: 'Nazwa źródła', en: 'Source name' }),
    });
    const readOnlyField = canvas.getByRole('textbox', {
      name: copy({ pl: 'Identyfikator połączenia', en: 'Connection identifier' }),
    });
    const disabledField = canvas.getByRole('textbox', {
      name: copy({ pl: 'Klucz źródła', en: 'Source key' }),
    });
    const validatingField = canvas.getByRole('textbox', {
      name: copy({ pl: 'Identyfikator obszaru roboczego', en: 'Workspace identifier' }),
    });
    const invalidField = canvas.getByRole('textbox', {
      name: copy({ pl: 'Adres e-mail', en: 'Email address' }),
    });
    const textarea = canvas.getByRole('textbox', {
      name: copy({ pl: 'Opis raportu', en: 'Report description' }),
    });
    const fileInput = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    const password = canvasElement.querySelector<HTMLInputElement>('input[name="password"]');
    const toggle = canvas.getByRole('button', {
      name: copy({ pl: 'Pokaż hasło', en: 'Show password' }),
    });
    const code = canvas.getByRole('textbox', {
      name: startsWithAccessibleName(copy({ pl: 'Kod MFA', en: 'MFA code' })),
    });

    await expect(reportName).toHaveValue(copy({ pl: 'Raport dzienny', en: 'Daily report' }));
    await expect(requiredField).toBeRequired();
    await expect(readOnlyField).toHaveAttribute('readonly');
    await expect(validatingField).toHaveAttribute('readonly');
    await expect(disabledField).toBeDisabled();
    await expect(invalidField).toHaveAttribute('aria-invalid', 'true');
    await expect(textarea.tagName).toBe('TEXTAREA');
    if (!fileInput) {
      throw new Error('File input is not rendered.');
    }

    await expect(fileInput).toHaveAttribute('type', 'file');
    if (!password) {
      throw new Error('Password input is not rendered.');
    }

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
