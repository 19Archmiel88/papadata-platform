import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  EmptyState,
  InlineNotice,
  StatusBadge,
  useMotionPresets,
} from '../../design-system';
import type {
  PapaChatMessage,
} from '../../screens/papa/papaData';
import './papa-message-thread.css';

export type PapaMessageEvidence = {
  readonly confidence?: number | null;
  readonly freshnessAt?: string | null;
  readonly id: string;
  readonly label: string;
  readonly source?: string | null;
};

export type PapaMessageThreadProps = {
  readonly className?: string;
  readonly emptyActionLabel?: string | null;
  readonly emptyMessage?: string;
  readonly emptyTitle?: string;
  readonly evidence?: readonly PapaMessageEvidence[];
  readonly messages: readonly PapaChatMessage[];
  readonly onEmptyAction?: (() => void) | undefined;
  /**
   * Mirrors the real `mainSubmitting`/`elementSubmitting` flag from
   * PapaAssistantRuntimeContext, gated directly on the in-flight
   * `bffClient.generatePapaAnswer(...)` call. It drives a "Papa się
   * zastanawia" affordance — never a simulated/typed-out preview of the
   * answer, since there is no real token stream to reflect.
   */
  readonly pending?: boolean;
};

export function PapaMessageThread({
  className,
  emptyActionLabel = null,
  emptyMessage = 'Zadaj pierwsze pytanie albo przeanalizuj bieżący ekran.',
  emptyTitle = 'Brak wiadomości w tej rozmowie',
  evidence = [],
  messages,
  onEmptyAction,
  pending = false,
}: PapaMessageThreadProps) {
  const evidenceById = new Map(evidence.map((item) => [
    item.id,
    item,
  ]));

  if (messages.length === 0 && !pending) {
    return (
      <EmptyState
        className={joinClassNames(
          'pd-papa-message-thread__empty',
          className,
        )}
        icon="assistant"
        message={emptyMessage}
        primaryActionLabel={emptyActionLabel}
        title={emptyTitle}
        variant="empty"
        onPrimaryAction={onEmptyAction}
      />
    );
  }

  return (
    <ol
      aria-label="Wiadomości Papa Asystenta"
      className={joinClassNames(
        'pd-papa-message-thread',
        className,
      )}
    >
      {messages.map((message) => (
        <PapaMessageItem
          evidenceById={evidenceById}
          key={message.id}
          message={message}
        />
      ))}
      <AnimatePresence>
        {pending ? <PapaPendingIndicator key="pd-papa-pending" /> : null}
      </AnimatePresence>
    </ol>
  );
}

function PapaPendingIndicator() {
  const { overlay } = useMotionPresets();

  return (
    <motion.li
      animate={{ opacity: 0.7, y: 0 }}
      aria-live="polite"
      className="pd-papa-message-thread__pending"
      data-author="assistant"
      data-pending="true"
      exit={{ opacity: 0, y: 4 }}
      initial={{ opacity: 0, y: 4 }}
      role="status"
      transition={overlay}
    >
      <span className="pd-papa-message-thread__pending-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      Papa przetwarza pytanie
    </motion.li>
  );
}

function PapaMessageItem({
  evidenceById,
  message,
}: {
  readonly evidenceById: ReadonlyMap<string, PapaMessageEvidence>;
  readonly message: PapaChatMessage;
}) {
  const entrance = {
    animate: { opacity: 1, y: 0 },
    initial: { opacity: 0, y: 6 },
    transition: { duration: 0.18, ease: [0.2, 0, 0, 1] as const },
  };

  if (message.author === 'assistant') {
    return (
      <motion.li data-author="assistant" {...entrance}>
        <AssistantMessage
          evidenceById={evidenceById}
          message={message}
        />
      </motion.li>
    );
  }

  if (message.author === 'system') {
    return (
      <motion.li data-author="system" {...entrance}>
        <span>System</span>
        <p>{message.body}</p>
        <time dateTime={message.createdAt}>
          {formatShortDateTime(message.createdAt)}
        </time>
      </motion.li>
    );
  }

  return (
    <motion.li data-author="user" {...entrance}>
      <span>Ty</span>
      <p>{message.body}</p>
      <time dateTime={message.createdAt}>
        {formatShortDateTime(message.createdAt)}
      </time>
    </motion.li>
  );
}

function AssistantMessage({
  evidenceById,
  message,
}: {
  readonly evidenceById: ReadonlyMap<string, PapaMessageEvidence>;
  readonly message: PapaChatMessage;
}) {
  const linkedEvidence = message.evidenceIds
    .map((id) => evidenceById.get(id) ?? {
      id,
      label: id,
    })
    .slice(0, 6);
  const confidence = message.confidence !== undefined
    ? message.confidence
    : averageConfidence(linkedEvidence);
  const requiresHumanDecision = message.approvalRequired !== undefined
    ? message.approvalRequired
    : detectsHumanDecisionRequirement(message.body);
  const isRefusal = message.isRefusal !== undefined
    ? message.isRefusal
    : isRefusalMessage(message.body);

  if (isRefusal) {
    return (
      <article className="pd-papa-message-thread__assistant">
        <InlineNotice
          message={message.body || 'Papa nie może odpowiedzieć bez wystarczających danych, uprawnień albo dowodów.'}
          title="Odpowiedź ograniczona"
          tone="warning"
        />
        <MessageFooter createdAt={message.createdAt} />
      </article>
    );
  }

  return (
    <article className="pd-papa-message-thread__assistant">
      <header>
        <div>
          <span>Papa</span>
          <strong>Teza</strong>
        </div>
        <StatusBadge
          status={confidence === null ? 'Dowody' : 'Pewność'}
          text={confidence === null
            ? `${message.evidenceIds.length} dow.`
            : formatPercent(confidence)}
          tone={confidence === null
            ? message.evidenceIds.length > 0 ? 'info' : 'warning'
            : confidence >= 0.8 ? 'success' : 'warning'}
        />
      </header>

      <div className="pd-papa-message-thread__body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.body}</ReactMarkdown>
      </div>

      <div className="pd-papa-message-thread__assistant-meta">
        <StatusBadge
          status="Decyzja człowieka"
          text={requiresHumanDecision ? 'Wymagana' : 'Nie określono'}
          tone={requiresHumanDecision ? 'warning' : 'neutral'}
        />
        <StatusBadge
          status="Zakres"
          text={message.contextItemId ? 'Element' : 'Rozmowa'}
          tone="info"
        />
      </div>

      {linkedEvidence.length > 0 ? (
        <div
          aria-label="Dowody powiązane z odpowiedzią"
          className="pd-papa-message-thread__evidence"
        >
          <span>Dowody</span>
          <ul>
            {linkedEvidence.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                {item.source ? <small>{item.source}</small> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <InlineNotice
          className="pd-papa-message-thread__notice"
          message="Ta odpowiedź nie ma jeszcze przypiętego evidence z backendu."
          title="Brak jawnych dowodów"
          tone="warning"
        />
      )}

      <MessageFooter createdAt={message.createdAt} />
    </article>
  );
}

function MessageFooter({
  createdAt,
}: {
  readonly createdAt: string;
}) {
  return (
    <footer>
      <time dateTime={createdAt}>
        {formatShortDateTime(createdAt)}
      </time>
    </footer>
  );
}

function averageConfidence(
  evidence: readonly PapaMessageEvidence[],
): number | null {
  const values = evidence
    .map((item) => item.confidence)
    .filter((value): value is number => (
      typeof value === 'number'
      && Number.isFinite(value)
    ));

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function detectsHumanDecisionRequirement(body: string): boolean {
  const normalized = body.toLowerCase();
  return normalized.includes('wymaga akceptacji')
    || normalized.includes('wymaga decyzji')
    || normalized.includes('decyzji człowieka')
    || normalized.includes('zatwierdzenia');
}

function isRefusalMessage(body: string): boolean {
  const normalized = body.trim().toLowerCase();
  return normalized.length === 0
    || normalized.includes('nie mogę odpowiedzieć')
    || normalized.includes('brak danych')
    || normalized.includes('brak wystarczających danych')
    || normalized.includes('permission denied');
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(value);
}

function formatShortDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function joinClassNames(
  ...classNames: readonly (string | undefined | null | false)[]
): string | undefined {
  const result = classNames.filter(Boolean).join(' ');
  return result || undefined;
}
