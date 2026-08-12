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
import {
  Localized,
  copy,
} from './cross-cutting-story-helpers';

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

const syncScopeOptionCopy = [
  {
    label: {
      en: 'New data only',
      pl: 'Tylko nowe dane',
    },
    value: 'new',
  },
  {
    label: {
      en: 'Last 30 days',
      pl: 'Ostatnie 30 dni',
    },
    value: '30d',
  },
  {
    label: {
      en: 'Full range available in the source',
      pl: 'Pełny zakres dostępny w źródle',
    },
    value: 'full',
  },
];

function buildSyncScopeOptions() {
  return syncScopeOptionCopy.map((option) => ({
    label: copy(option.label),
    value: option.value,
  }));
}

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
      return copy({ en: 'Review', pl: 'Przegląd' });
    case 1:
      return copy({ en: 'Conditions', pl: 'Warunki' });
    case 0:
    default:
      return copy({ en: 'Basics', pl: 'Dane podstawowe' });
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
        : copy({ en: 'Enter a configuration name.', pl: 'Podaj nazwę konfiguracji.' }),
      syncScope: form.syncScope
        ? undefined
        : copy({ en: 'Select the synchronization range.', pl: 'Wybierz zakres synchronizacji.' }),
    };
  }

  if (step === 1) {
    return {
      owner: form.owner.trim()
        ? undefined
        : copy({ en: 'Enter the business owner.', pl: 'Podaj właściciela biznesowego.' }),
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
    useState(copy({ en: 'The draft has no changes yet.', pl: 'Szkic nie ma jeszcze zmian.' }));
  const [noticeTone, setNoticeTone] =
    useState<'info' | 'success' | 'warning'>('info');
  const [showDiscardDialog, setShowDiscardDialog] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  const syncScopeOptions = useMemo(
    () => buildSyncScopeOptions(),
    [],
  );

  const selectedScope = useMemo(
    () => syncScopeOptions.find((option) => option.value === form.syncScope),
    [form.syncScope, syncScopeOptions],
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
    setNotice(copy({
      en: 'You have unsaved changes in the configuration.',
      pl: 'Masz niezapisane zmiany w konfiguracji.',
    }));
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
        copy({
          en: 'Complete the required fields before moving to the next step.',
          pl: 'Uzupełnij wymagane pola przed przejściem do kolejnego kroku.',
        }),
      );
      return;
    }

    setStep((current) => Math.min(
      current + 1,
      2,
    ) as FormStep);
    setNoticeTone('info');
    setNotice(copy({
      en: `Step ${resolveStepLabel(step)} has been checked.`,
      pl: `Krok ${resolveStepLabel(step)} został sprawdzony.`,
    }));
  }

  function goBack() {
    setStep((current) => Math.max(
      current - 1,
      0,
    ) as FormStep);
    setNoticeTone('info');
    setNotice(copy({
      en: 'Returned to the previous step.',
      pl: 'Wrócono do poprzedniego kroku.',
    }));
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
        copy({
          en: 'Review requires a complete form before submission.',
          pl: 'Przegląd wymaga kompletnego formularza przed wysłaniem.',
        }),
      );
      return;
    }

    setSubmitting(true);
    submitConfigurationAction();
    window.setTimeout(() => {
      setSubmitting(false);
      setDirty(false);
      setNoticeTone('success');
      setNotice(copy({
        en: 'The configuration has been submitted for review.',
        pl: 'Konfiguracja została wysłana do przeglądu.',
      }));
    }, 120);
  }

  return (
    <div className="pd-x18-form-flow">
      <section
        aria-label={copy({ en: 'Form steps', pl: 'Kroki formularza' })}
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
        title={dirty
          ? copy({ en: 'Draft changes', pl: 'Zmiany robocze' })
          : copy({ en: 'Form status', pl: 'Status formularza' })}
        tone={noticeTone}
      />

      {step === 0 ? (
        <section
          aria-label={copy({ en: 'Configuration basics', pl: 'Dane podstawowe konfiguracji' })}
          className="pd-x18-form-section"
        >
          <TextField
            helperText={copy({
              en: 'Name visible to the operations team.',
              pl: 'Nazwa widoczna dla zespołu operacyjnego.',
            })}
            invalid={Boolean(errors.sourceName)}
            label={copy({ en: 'Configuration name', pl: 'Nazwa konfiguracji' })}
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
            label={copy({ en: 'Synchronization range', pl: 'Zakres synchronizacji' })}
            message={errors.syncScope ?? null}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              updateForm({
                syncScope: event.currentTarget.value,
              });
            }}
            options={syncScopeOptions}
            placeholder={copy({ en: 'Select range', pl: 'Wybierz zakres' })}
            required
            status={errors.syncScope ? 'error' : 'default'}
            value={form.syncScope}
          />
        </section>
      ) : null}

      {step === 1 ? (
        <section
          aria-label={copy({ en: 'Launch conditions', pl: 'Warunki uruchomienia' })}
          className="pd-x18-form-section"
        >
          <TextField
            helperText={copy({
              en: 'Person responsible for data acceptance.',
              pl: 'Osoba odpowiedzialna za odbiór danych.',
            })}
            invalid={Boolean(errors.owner)}
            label={copy({ en: 'Business owner', pl: 'Właściciel biznesowy' })}
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
            helperText={copy({
              en: 'This option changes the initial synchronization range.',
              pl: 'Opcja zmienia zakres startowej synchronizacji.',
            })}
            label={copy({
              en: 'Include historical data on first run',
              pl: 'Uwzględnij dane historyczne przy pierwszym uruchomieniu',
            })}
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
          aria-label={copy({ en: 'Review before submission', pl: 'Przegląd przed wysłaniem' })}
          className="pd-x18-form-section"
        >
          <dl className="pd-x18-drawer-ledger">
            <div>
              <dt><Localized en="Name" pl="Nazwa" /></dt>
              <dd>{form.sourceName}</dd>
            </div>
            <div>
              <dt><Localized en="Range" pl="Zakres" /></dt>
              <dd>{selectedScope?.label ?? copy({ en: 'Not selected', pl: 'Nie wybrano' })}</dd>
            </div>
            <div>
              <dt><Localized en="Owner" pl="Właściciel" /></dt>
              <dd>{form.owner}</dd>
            </div>
            <div>
              <dt><Localized en="Historical data" pl="Dane historyczne" /></dt>
              <dd>{form.includeHistorical
                ? copy({ en: 'Yes', pl: 'Tak' })
                : copy({ en: 'No', pl: 'Nie' })}</dd>
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
          <Localized en="Back" pl="Wstecz" />
        </Button>
        <Button
          onClick={() => {
            if (dirty) {
              setShowDiscardDialog(true);
              return;
            }

            setNoticeTone('info');
            setNotice(copy({
              en: 'There are no changes to discard.',
              pl: 'Brak zmian do odrzucenia.',
            }));
          }}
          type="button"
          variant="secondary"
        >
          <Localized en="Cancel configuration" pl="Anuluj konfigurację" />
        </Button>
        <Button
          onClick={() => {
            saveDraftAction();
            setDirty(false);
            setNoticeTone('success');
            setNotice(copy({
              en: 'Configuration draft has been saved.',
              pl: 'Szkic konfiguracji został zapisany.',
            }));
          }}
          type="button"
          variant="secondary"
        >
          <Localized en="Save draft" pl="Zapisz szkic" />
        </Button>
        {step < 2 ? (
          <Button
            onClick={goNext}
            type="button"
            variant="primary"
          >
            <Localized en="Next" pl="Dalej" />
          </Button>
        ) : (
          <Button
            loading={submitting}
            loadingLabel={copy({
              en: 'Submitting configuration',
              pl: 'Wysyłanie konfiguracji',
            })}
            onClick={submitForm}
            type="button"
            variant="primary"
          >
            <Localized en="Submit configuration" pl="Wyślij konfigurację" />
          </Button>
        )}
      </div>

      <Dialog
        closeOnEscape
        description={copy({
          en: 'You have unsaved configuration changes. You can return to editing or discard the draft.',
          pl: 'Masz niezapisane zmiany w konfiguracji. Możesz wrócić do edycji albo odrzucić szkic.',
        })}
        destructive
        modal
        open={showDiscardDialog}
        primaryActionLabel={copy({ en: 'Discard changes', pl: 'Odrzuć zmiany' })}
        secondaryActionLabel={copy({ en: 'Return to editing', pl: 'Wróć do edycji' })}
        title={copy({ en: 'Discard unsaved changes?', pl: 'Odrzucić niezapisane zmiany?' })}
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
            setNotice(copy({
              en: 'Changes have been discarded.',
              pl: 'Zmiany zostały odrzucone.',
            }));
            return;
          }

          setNoticeTone('info');
          setNotice(copy({
            en: 'Editing resumed without data loss.',
            pl: 'Edycja została wznowiona bez utraty danych.',
          }));
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
            { label: <Localized en="Contract" pl="Kontrakt" />, value: '18.09' },
            { label: <Localized en="Components" pl="Komponenty" />, value: 'TextField / Select / Dialog' },
            { label: <Localized en="Status" pl="Status" />, value: <Localized en="In review" pl="W przeglądzie" /> },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel={<Localized en="Interface patterns" pl="Wzorce interfejsu" />}
      storyId="18.09"
      summary={<Localized
        en="A complex form composes existing fields, controls and Dialog for unsaved changes without creating a public Wizard component."
        pl="Złożony formularz składa istniejące pola, kontrolki i Dialog dla zmian niezapisanych bez tworzenia publicznego komponentu Wizard."
      />}
      title={<Localized en="Complex forms and wizards" pl="Formularze złożone i kreatory" />}
    >
      <StoryPresentationSection
        index="01"
        summary={<Localized
          en="The step sequence, validation, draft, unsaved-changes dialog and submission are story state built on runtime components."
          pl="Sekwencja kroków, walidacja, szkic, dialog zmian niezapisanych i wysłanie są stanem story opartym na komponentach runtime."
        />}
        title={<Localized en="Multi-step working form" pl="Wieloetapowy formularz roboczy" />}
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
