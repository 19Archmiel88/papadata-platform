import type {
  FormEvent,
  HTMLAttributes,
} from '../domainShared';
import {
  Button,
  Textarea,
  forwardRef,
  joinClassNames,
  useId,
  useState,
} from '../domainShared';

export type AssistantComposerProps = HTMLAttributes<HTMLElement> & {
  readonly attachments: readonly {
    readonly id: string;
    readonly name: string;
    readonly size: number;
  }[];
  readonly contextItemIds: readonly string[];
  readonly label: string;
  readonly onSubmit?: ((value: string) => void) | undefined;
  readonly placeholder: string;
  readonly submitting: boolean;
  readonly value: string;
};

export const AssistantComposer = forwardRef<
  HTMLElement,
  AssistantComposerProps
>(function AssistantComposer(
  {
    attachments,
    className,
    contextItemIds,
    label,
    onSubmit,
    placeholder,
    submitting,
    value,
    ...props
  },
  ref,
) {
  const [draft, setDraft] = useState(value);
  const statusId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!trimmed || submitting) {
      return;
    }

    onSubmit?.(trimmed);
  }

  return (
    <section
      {...props}
      ref={ref}
      className={joinClassNames('pd-assistant-composer', className)}
    >
      <form onSubmit={handleSubmit}>
        <Textarea
          helperText={`${contextItemIds.length} elementy kontekstu · ${attachments.length} załączniki`}
          label={label}
          placeholder={placeholder}
          rows={4}
          value={draft}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
          }}
        />
        <div className="pd-assistant-composer__footer">
          <span id={statusId} role="status">
            {submitting ? 'Wysyłanie zapytania' : 'Gotowe do wysłania'}
          </span>
          <Button
            disabled={draft.trim().length === 0 || submitting}
            loading={submitting}
            loadingLabel="Wysyłanie"
            size="small"
            type="submit"
          >
            Zapytaj Papa
          </Button>
        </div>
      </form>
    </section>
  );
});
