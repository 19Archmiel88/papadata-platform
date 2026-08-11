import type {
  ChangeEvent,
} from 'react';
import {
  useMemo,
  useState,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  Button,
  Checkbox,
  Dialog,
  InlineNotice,
  Select,
  TextField,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const saveDraftAction = fn();
const submitConfigurationAction = fn();

type FormStep =
  | 0
  | 1
  | 2;

type FormState = {
  readonly includeHistorical: boolean;
  readonly owner: string;
  readonly sourceName: string;
  readonly syncScope: string | null;
};

type FormErrors = Partial<
  Record<
    keyof FormState,
    string
  >
>;

const syncScopeOptions = [
  {
    label: 'Tylko nowe dane',
    value: 'new',
  },
  {
    label: 'Ostatnie 30 dni',
    value: '30d',
  },
  {
    label: 'Pełny zakres dostępny w źródle',
    value: 'full',
  },
];

const initialForm: FormState = {
  includeHistorical: false,
  owner: '',
  sourceName: '',
  syncScope: null,
};

function resolveStepLabel(
  step: FormStep,
) {
  switch (step) {
    case 2:
      return 'Przegląd';
    case 1:
      return 'Warunki';
    case 0:
    default:
      return 'Dane podstawowe';
  }
}

function validateStep(
  step: FormStep,
  form: FormState,
): FormErrors {
  if (step === 0) {
    return {
      sourceName: form.sourceName.trim()
        ? undefined
        : 'Podaj nazwę konfiguracji.',
      syncScope: form.syncScope
        ? undefined
        : 'Wybierz zakres synchronizacji.',
    };
  }

  if (step === 1) {
    return {
      owner: form.owner.trim()
        ? undefined
        : 'Podaj właściciela biznesowego.',
    };
  }

  return {};
}

function hasErrors(
  errors: FormErrors,
) {
  return Object.values(errors).some(Boolean);
}

function ComplexFormPattern() {
  const [step, setStep] =
    useState<FormStep>(0);
  const [form, setForm] =
    useState<FormState>(initialForm);
  const [errors, setErrors] =
    useState<FormErrors>({});
  const [dirty, setDirty] =
    useState(false);
  const [notice, setNotice] =
    useState('Szkic nie ma jeszcze zmian.');
  const [noticeTone, setNoticeTone] =
    useState<'info' | 'success' | 'warning'>('info');
  const [showDiscardDialog, setShowDiscardDialog] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  const selectedScope = useMemo(
    () => syncScopeOptions.find((option) => option.value === form.syncScope),
    [form.syncScope],
  );

  function updateForm(
    patch: Partial<FormState>,
  ) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
    setDirty(true);
    setNoticeTone('info');
    setNotice('Masz niezapisane zmiany w konfiguracji.');
  }

  function goNext() {
    const nextErrors = validateStep(
      step,
      form,
    );

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setNoticeTone('warning');
      setNotice(
        'Uzupełnij wymagane pola przed przejściem do kolejnego kroku.',
      );
      return;
    }

    setStep((current) => Math.min(
      current + 1,
      2,
    ) as FormStep);
    setNoticeTone('info');
    setNotice(`Krok ${resolveStepLabel(step)} został sprawdzony.`);
  }

  function goBack() {
    setStep((current) => Math.max(
      current - 1,
      0,
    ) as FormStep);
    setNoticeTone('info');
    setNotice('Wrócono do poprzedniego kroku.');
  }

  function submitForm() {
    const nextErrors = validateStep(
      1,
      form,
    );

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setNoticeTone('warning');
      setNotice(
        'Przegląd wymaga kompletnego formularza przed wysłaniem.',
      );
      return;
    }

    setSubmitting(true);
    submitConfigurationAction();
    window.setTimeout(() => {
      setSubmitting(false);
      setDirty(false);
      setNoticeTone('success');
      setNotice('Konfiguracja została wysłana do przeglądu.');
    }, 120);
  }

  return (
    <div className="pd-x18-form-flow">
      <section
        aria-label="Kroki formularza"
        className="pd-x18-form-steps"
      >
        {[
          0,
          1,
          2,
        ].map((item) => (
          <span
            aria-current={step === item ? 'step' : undefined}
            className="pd-x18-form-step"
            data-active={step === item ? true : undefined}
            key={item}
          >
            <span>{`0${item + 1}`}</span>
            {resolveStepLabel(item as FormStep)}
          </span>
        ))}
      </section>

      <InlineNotice
        message={notice}
        title={dirty ? 'Zmiany robocze' : 'Status formularza'}
        tone={noticeTone}
      />

      {step === 0 ? (
        <section
          aria-label="Dane podstawowe konfiguracji"
          className="pd-x18-form-section"
        >
          <TextField
            helperText="Nazwa widoczna dla zespołu operacyjnego."
            invalid={Boolean(errors.sourceName)}
            label="Nazwa konfiguracji"
            message={errors.sourceName ?? null}
            onChange={(event) => {
              updateForm({
                sourceName: event.currentTarget.value,
              });
            }}
            required
            status={errors.sourceName ? 'error' : 'default'}
            value={form.sourceName}
          />
          <Select
            invalid={Boolean(errors.syncScope)}
            label="Zakres synchronizacji"
            message={errors.syncScope ?? null}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              updateForm({
                syncScope: event.currentTarget.value,
              });
            }}
            options={syncScopeOptions}
            placeholder="Wybierz zakres"
            required
            status={errors.syncScope ? 'error' : 'default'}
            value={form.syncScope}
          />
        </section>
      ) : null}

      {step === 1 ? (
        <section
          aria-label="Warunki uruchomienia"
          className="pd-x18-form-section"
        >
          <TextField
            helperText="Osoba odpowiedzialna za odbiór danych."
            invalid={Boolean(errors.owner)}
            label="Właściciel biznesowy"
            message={errors.owner ?? null}
            onChange={(event) => {
              updateForm({
                owner: event.currentTarget.value,
              });
            }}
            required
            status={errors.owner ? 'error' : 'default'}
            value={form.owner}
          />
          <Checkbox
            checked={form.includeHistorical}
            helperText="Opcja zmienia zakres startowej synchronizacji."
            label="Uwzględnij dane historyczne przy pierwszym uruchomieniu"
            onChange={(event) => {
              updateForm({
                includeHistorical: event.currentTarget.checked,
              });
            }}
            value="include-historical"
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section
          aria-label="Przegląd przed wysłaniem"
          className="pd-x18-form-section"
        >
          <dl className="pd-x18-drawer-ledger">
            <div>
              <dt>Nazwa</dt>
              <dd>{form.sourceName}</dd>
            </div>
            <div>
              <dt>Zakres</dt>
              <dd>{selectedScope?.label ?? 'Nie wybrano'}</dd>
            </div>
            <div>
              <dt>Właściciel</dt>
              <dd>{form.owner}</dd>
            </div>
            <div>
              <dt>Dane historyczne</dt>
              <dd>{form.includeHistorical ? 'Tak' : 'Nie'}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="pd-x18-form-actions">
        <Button
          disabled={step === 0}
          onClick={goBack}
          type="button"
          variant="ghost"
        >
          Wstecz
        </Button>
        <Button
          onClick={() => {
            if (dirty) {
              setShowDiscardDialog(true);
              return;
            }

            setNoticeTone('info');
            setNotice('Brak zmian do odrzucenia.');
          }}
          type="button"
          variant="secondary"
        >
          Anuluj konfigurację
        </Button>
        <Button
          onClick={() => {
            saveDraftAction();
            setDirty(false);
            setNoticeTone('success');
            setNotice('Szkic konfiguracji został zapisany.');
          }}
          type="button"
          variant="secondary"
        >
          Zapisz szkic
        </Button>
        {step < 2 ? (
          <Button
            onClick={goNext}
            type="button"
            variant="primary"
          >
            Dalej
          </Button>
        ) : (
          <Button
            loading={submitting}
            loadingLabel="Wysyłanie konfiguracji"
            onClick={submitForm}
            type="button"
            variant="primary"
          >
            Wyślij konfigurację
          </Button>
        )}
      </div>

      <Dialog
        closeOnEscape
        description="Masz niezapisane zmiany w konfiguracji. Możesz wrócić do edycji albo odrzucić szkic."
        destructive
        modal
        open={showDiscardDialog}
        primaryActionLabel="Odrzuć zmiany"
        secondaryActionLabel="Wróć do edycji"
        title="Odrzucić niezapisane zmiany?"
        onOpenChange={(nextOpen, reason) => {
          setShowDiscardDialog(nextOpen);

          if (nextOpen) {
            return;
          }

          if (reason === 'primary-action') {
            setForm(initialForm);
            setStep(0);
            setDirty(false);
            setErrors({});
            setNoticeTone('info');
            setNotice('Zmiany zostały odrzucone.');
            return;
          }

          setNoticeTone('info');
          setNotice('Edycja została wznowiona bez utraty danych.');
        }}
      />
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Formularze złożone i kreatory',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ComplexFormsWizardsStory: Story = {
  name: 'Formularze złożone i kreatory',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca formularza"
          items={[
            { label: 'Kontrakt', value: '18.09' },
            { label: 'Komponenty', value: 'TextField / Select / Dialog' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.09"
      summary="Złożony formularz składa istniejące pola, kontrolki i Dialog dla zmian niezapisanych bez tworzenia publicznego komponentu Wizard."
      title="Formularze złożone i kreatory"
    >
      <StoryPresentationSection
        index="01"
        summary="Sekwencja kroków, walidacja, szkic, dialog zmian niezapisanych i wysłanie są stanem story opartym na komponentach runtime."
        title="Wieloetapowy formularz roboczy"
      >
        <ComplexFormPattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await expect(
      canvas.getByRole('heading', {
        name: 'Formularze złożone i kreatory',
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Dalej',
      }),
    );
    await expect(
      canvas.getByText(/Uzupełnij wymagane pola/),
    ).toBeInTheDocument();

    await userEvent.type(
      canvas.getByRole('textbox', {
        name: /Nazwa konfiguracji/,
      }),
      'Synchronizacja katalogu produktów',
    );
    await userEvent.click(
      canvas.getByRole('combobox', {
        name: 'Zakres synchronizacji',
      }),
    );
    await userEvent.click(
      canvas.getByRole('option', {
        name: 'Tylko nowe dane',
      }),
    );
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Dalej',
      }),
    );

    await expect(
      canvas.getByText('Warunki'),
    ).toBeInTheDocument();
    await userEvent.type(
      canvas.getByRole('textbox', {
        name: /Właściciel biznesowy/,
      }),
      'Zespół operacji',
    );
    const historyCheckbox = canvas.getByRole('checkbox', {
        name: /Uwzględnij dane historyczne/,
      });
    const historyCheckboxLabel =
      historyCheckbox.closest('label');

    await userEvent.click(
      historyCheckboxLabel
        ?? historyCheckbox,
    );
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Dalej',
      }),
    );

    await expect(
      canvas.getByRole('heading', {
        name: 'Wieloetapowy formularz roboczy',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Synchronizacja katalogu produktów'),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Anuluj konfigurację',
      }),
    );
    await expect(
      body.getByRole('dialog', {
        name: 'Odrzucić niezapisane zmiany?',
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      body.getByRole('button', {
        name: 'Wróć do edycji',
      }),
    );
    await expect(
      canvas.getByText(/Edycja została wznowiona/),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Wyślij konfigurację',
      }),
    );
    await expect(
      await canvas.findByText(/Konfiguracja została wysłana/),
    ).toBeInTheDocument();
  },
};
