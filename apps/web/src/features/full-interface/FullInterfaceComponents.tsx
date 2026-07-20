import * as AlertDialogPrimitive from '@radix-ui/react-dialog';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Clock3,
  Database,
  Download,
  FileText,
  Filter,
  Gauge,
  History,
  Info,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  PanelRightOpen,
  PauseCircle,
  Play,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from 'react';

import {
  Button as DSButton,
  EmptyState as DSEmptyState,
  ErrorState as DSErrorState,
  InlineNotice as DSInlineNotice,
  LoadingState as DSLoadingState,
  PasswordField as DSPasswordField,
  Surface,
  TextField as DSTextField,
  type StatusBadgeStatus,
} from '../../design-system';
import { VerificationCodeInput } from '../../design-system/forms/VerificationCodeInput';
import {
  type UIChartFixture,
  type UIEvidence,
  type UIMetric,
  type UIReadiness,
  type UISystemState,
  type UIStatusTone,
} from './fullInterfaceContracts';
import './full-interface.css';

type ClassValue = string | false | null | undefined;

function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

const stateLabels: Record<UISystemState, string> = {
  blocked: 'Zablokowane',
  blocked_by_policy: 'Zablokowane polityką',
  cancelled: 'Anulowane',
  delayed: 'Opóźnione',
  empty: 'Pusty stan',
  error: 'Błąd',
  expired: 'Wygasło',
  forbidden: 'Brak dostępu',
  insufficient_data: 'Za mało danych',
  invalid: 'Nieprawidłowe',
  loading: 'Ładowanie',
  needs_review: 'Wymaga przeglądu',
  no_data: 'Brak danych',
  partial: 'Częściowe dane',
  processing: 'Przetwarzanie',
  provider_error: 'Błąd providera',
  ready: 'Gotowe',
  stale: 'Nieświeże',
  success: 'Sukces',
  warning: 'Ostrzeżenie',
};

const readinessLabels: Record<UIReadiness, string> = {
  BLOCKED: 'Zablokowane',
  EMPTY: 'Brak danych',
  INVALID: 'Nieprawidłowe',
  NEEDS_REVIEW: 'Wymaga przeglądu',
  PARTIAL: 'Częściowe',
  PROCESSING: 'Przetwarzanie',
  READY: 'Gotowe',
  STALE: 'Nieświeże',
};

const stateIconMap: Record<UISystemState, LucideIcon> = {
  blocked: ShieldAlert,
  blocked_by_policy: ShieldAlert,
  cancelled: PauseCircle,
  delayed: Clock3,
  empty: Info,
  error: XCircle,
  expired: Clock3,
  forbidden: LockKeyhole,
  insufficient_data: Database,
  invalid: AlertCircle,
  loading: LoaderCircle,
  needs_review: AlertTriangle,
  no_data: CircleDashed,
  partial: AlertTriangle,
  processing: RefreshCw,
  provider_error: XCircle,
  ready: BadgeCheck,
  stale: Clock3,
  success: CheckCircle2,
  warning: AlertTriangle,
};

function statusForState(state: UISystemState): StatusBadgeStatus {
  if (state === 'ready' || state === 'success') {
    return 'ready';
  }

  if (state === 'loading' || state === 'processing') {
    return 'inProgress';
  }

  if (state === 'partial' || state === 'warning' || state === 'needs_review') {
    return 'warning';
  }

  if (state === 'empty' || state === 'no_data' || state === 'insufficient_data') {
    return 'noData';
  }

  if (state === 'stale' || state === 'delayed') {
    return 'delayed';
  }

  if (state === 'blocked' || state === 'blocked_by_policy' || state === 'forbidden') {
    return 'blocked';
  }

  if (state === 'cancelled' || state === 'expired') {
    return 'inactive';
  }

  return 'error';
}

function toneForReadiness(readiness: UIReadiness): UIStatusTone {
  if (readiness === 'READY') {
    return 'success';
  }

  if (readiness === 'BLOCKED') {
    return 'blocked';
  }

  if (readiness === 'INVALID') {
    return 'danger';
  }

  if (readiness === 'PARTIAL' || readiness === 'NEEDS_REVIEW') {
    return 'warning';
  }

  if (readiness === 'PROCESSING' || readiness === 'STALE') {
    return 'info';
  }

  return 'neutral';
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Warsaw',
  }).format(new Date(value));
}

export function SystemStateBadge({ state }: { state: UISystemState }) {
  const Icon = stateIconMap[state];

  return (
    <span className={cx('pdui-state-badge', `pdui-state-badge--${statusForState(state)}`)}>
      <Icon aria-hidden="true" size={14} />
      <span>{stateLabels[state]}</span>
    </span>
  );
}

export function IconButton({
  children,
  className,
  label,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
}) {
  return (
    <button
      {...props}
      aria-label={label}
      className={cx('pdui-icon-button', className)}
      type={type}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <a className={cx('pdui-link-button', className)} href={href}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={15} />
    </a>
  );
}

export const TextField = DSTextField;
export const PasswordField = DSPasswordField;
export const Button = DSButton;
export const InlineNotice = DSInlineNotice;
export const EmptyState = DSEmptyState;
export const ErrorState = DSErrorState;
export const LoadingState = DSLoadingState;

export function TextArea({
  helper,
  invalid = false,
  label,
  validationMessage,
  ...props
}: HTMLAttributes<HTMLTextAreaElement> & {
  helper?: string;
  invalid?: boolean;
  label: string;
  validationMessage?: string;
}) {
  const id = useId();
  const hintId = helper ? `${id}-hint` : undefined;
  const errorId = invalid && validationMessage ? `${id}-error` : undefined;

  return (
    <label className={cx('pdui-form-field', invalid && 'is-invalid')}>
      <span>{label}</span>
      <textarea
        {...props}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={invalid || undefined}
        id={id}
      />
      {helper ? <small id={hintId}>{helper}</small> : null}
      {invalid && validationMessage ? (
        <small className="pdui-form-field__error" id={errorId}>
          {validationMessage}
        </small>
      ) : null}
    </label>
  );
}

export function NumberField({
  helper,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  helper?: string;
  label: string;
}) {
  return (
    <DSTextField
      {...props}
      helper={helper}
      inputMode="decimal"
      label={label}
      type="text"
    />
  );
}

export function SearchField(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  label: string;
}) {
  return (
    <DSTextField
      {...props}
      icon={<Search aria-hidden="true" size={17} />}
      type="search"
    />
  );
}

export function CodeInput({
  value = '482915',
}: {
  value?: string;
}) {
  const [code, setCode] = useState(value);

  return (
    <VerificationCodeInput
      hint="Kod ma sześć cyfr i nie jest utrwalany w analytics."
      id="pdui-code-input"
      label="Kod jednorazowy"
      name="verification-code"
      onChange={setCode}
      value={code}
    />
  );
}

export function Checkbox({
  checked = true,
  label,
}: {
  checked?: boolean;
  label: string;
}) {
  return (
    <label className="pdui-choice">
      <CheckboxPrimitive.Root
        checked={checked}
        className="pdui-checkbox"
        type="button"
      >
        <CheckboxPrimitive.Indicator>
          <Check aria-hidden="true" size={14} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span>{label}</span>
    </label>
  );
}

export function RadioGroup() {
  return (
    <fieldset className="pdui-radio-group">
      <legend>Tryb pracy</legend>
      {['Decyzja', 'Diagnoza', 'Raport'].map((option, index) => (
        <label className="pdui-choice" key={option}>
          <input defaultChecked={index === 0} name="pdui-mode" type="radio" />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function Switch({
  checked = true,
  label,
}: {
  checked?: boolean;
  label: string;
}) {
  return (
    <label className="pdui-choice">
      <SwitchPrimitive.Root checked={checked} className="pdui-switch">
        <SwitchPrimitive.Thumb className="pdui-switch__thumb" />
      </SwitchPrimitive.Root>
      <span>{label}</span>
    </label>
  );
}

export function Select() {
  return (
    <SelectPrimitive.Root defaultValue="owner">
      <SelectPrimitive.Trigger className="pdui-select" aria-label="Rola">
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown aria-hidden="true" size={16} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="pdui-popover-panel">
          {['owner', 'admin', 'analyst'].map((value) => (
            <SelectPrimitive.Item className="pdui-menu-item" key={value} value={value}>
              <SelectPrimitive.ItemText>{value}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function Combobox() {
  return (
    <label className="pdui-form-field">
      <span>Workspace</span>
      <input
        aria-describedby="pdui-combobox-hint"
        list="pdui-workspaces"
        placeholder="Szukaj workspace"
      />
      <datalist id="pdui-workspaces">
        <option value="Sklep PL" />
        <option value="Marketplace pilot" />
        <option value="D2C Growth" />
      </datalist>
      <small id="pdui-combobox-hint">Lista jest filtrowana w obrębie tenanta.</small>
    </label>
  );
}

export function DatePicker() {
  return (
    <label className="pdui-form-field">
      <span>Dzień raportu</span>
      <span className="pdui-input-shell">
        <CalendarDays aria-hidden="true" size={16} />
        <input defaultValue="2026-07-20" type="date" />
      </span>
    </label>
  );
}

export function DateRangePicker() {
  return (
    <div className="pdui-date-range" role="group" aria-label="Zakres dat">
      <DatePicker />
      <DatePicker />
    </div>
  );
}

export function Popover() {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <DSButton iconBefore={<Filter aria-hidden="true" size={16} />}>
          Filtr
        </DSButton>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content className="pdui-popover-panel" sideOffset={8}>
          <strong>Zakres danych</strong>
          <p>Workspace, waluta i okres są częścią klucza cache.</p>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export function Tooltip({ children }: { children?: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <IconButton label="Pokaż opis statusu">
            {children ?? <Info aria-hidden="true" size={16} />}
          </IconButton>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="pdui-tooltip" sideOffset={7}>
            Status ma tekst, ikonę i opis wpływu.
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export function DropdownMenu() {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <IconButton label="Otwórz menu">
          <MoreHorizontal aria-hidden="true" size={18} />
        </IconButton>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content className="pdui-popover-panel" sideOffset={8}>
          {['Eksportuj', 'Zapisz do biblioteki', 'Pokaż audit'].map((item) => (
            <DropdownMenuPrimitive.Item className="pdui-menu-item" key={item}>
              {item}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export const ContextMenu = DropdownMenu;

export function Dialog() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <DSButton>Otwórz dialog</DSButton>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="pdui-dialog-overlay" />
        <DialogPrimitive.Content className="pdui-dialog">
          <DialogPrimitive.Title>Potwierdź operację</DialogPrimitive.Title>
          <DialogPrimitive.Description>
            Operacja zachowa operationId, audit i idempotency key.
          </DialogPrimitive.Description>
          <DialogPrimitive.Close asChild>
            <DSButton>Zamknij</DSButton>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function AlertDialog() {
  return (
    <AlertDialogPrimitive.Root>
      <AlertDialogPrimitive.Trigger asChild>
        <DSButton variant="danger">Wymagane zatwierdzenie</DSButton>
      </AlertDialogPrimitive.Trigger>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="pdui-dialog-overlay" />
        <AlertDialogPrimitive.Content className="pdui-dialog" role="alertdialog">
          <AlertDialogPrimitive.Title>Action wymaga approval</AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description>
            UI przygotowuje proposal, ale nie wykonuje działania.
          </AlertDialogPrimitive.Description>
          <AlertDialogPrimitive.Close asChild>
            <DSButton>Zrozumiałem</DSButton>
          </AlertDialogPrimitive.Close>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export function Drawer({ children }: { children?: ReactNode }) {
  return (
    <aside className="pdui-drawer" aria-label="Panel szczegółów">
      <PanelRightOpen aria-hidden="true" size={18} />
      {children ?? <span>Evidence, lineage i ograniczenia zakresu.</span>}
    </aside>
  );
}

export function Tabs({ children }: { children?: ReactNode }) {
  return (
    <TabsPrimitive.Root className="pdui-tabs" defaultValue="kpi">
      <TabsPrimitive.List aria-label="Widoki danych">
        <TabsPrimitive.Trigger value="kpi">KPI</TabsPrimitive.Trigger>
        <TabsPrimitive.Trigger value="evidence">Evidence</TabsPrimitive.Trigger>
        <TabsPrimitive.Trigger value="audit">Audit</TabsPrimitive.Trigger>
      </TabsPrimitive.List>
      <TabsPrimitive.Content value="kpi">{children ?? 'Metryki i readiness.'}</TabsPrimitive.Content>
      <TabsPrimitive.Content value="evidence">Źródła i ograniczenia.</TabsPrimitive.Content>
      <TabsPrimitive.Content value="audit">Zdarzenia bez sekretów.</TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
}

export function Accordion() {
  const [open, setOpen] = useState(true);

  return (
    <section className="pdui-accordion">
      <button
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>Ograniczenia danych</span>
        <ChevronDown aria-hidden="true" size={16} />
      </button>
      {open ? <p>Partial data nie jest ukrywane i nie wygląda jak ready.</p> : null}
    </section>
  );
}

export function Pagination() {
  return (
    <nav aria-label="Paginacja" className="pdui-pagination">
      <DSButton variant="ghost">Poprzednia</DSButton>
      <span>Strona 1 z 4</span>
      <DSButton variant="ghost">Następna</DSButton>
    </nav>
  );
}

export function Breadcrumbs() {
  return (
    <nav aria-label="Ścieżka" className="pdui-breadcrumbs">
      {['PapaData', 'Workspace', 'Command Center'].map((item) => (
        <span key={item}>{item}</span>
      ))}
    </nav>
  );
}

export function Avatar({ label = 'AW' }: { label?: string }) {
  return <span className="pdui-avatar">{label}</span>;
}

export function Badge({ children = 'ready' }: { children?: ReactNode }) {
  return <span className="pdui-badge">{children}</span>;
}

export function Tag({ children = 'WooCommerce' }: { children?: ReactNode }) {
  return <span className="pdui-tag">{children}</span>;
}

export function Separator() {
  return <SeparatorPrimitive.Root className="pdui-separator" decorative />;
}

export function Skeleton() {
  return <span className="pdui-skeleton" aria-label="Ładowanie" />;
}

export function Spinner() {
  return <LoaderCircle className="pdui-spinner" aria-label="Ładowanie" size={22} />;
}

export function Progress({ value = 68 }: { value?: number }) {
  return (
    <span className="pdui-progress" aria-label="Postęp operacji" role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={value}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}

export function Toast() {
  return (
    <div className="pdui-toast" role="status">
      <CheckCircle2 aria-hidden="true" size={16} />
      <span>Eksport zapisany w rejestrze operacji.</span>
    </div>
  );
}

export function ReadinessBadge({ readiness }: { readiness: UIReadiness }) {
  return (
    <span className={cx('pdui-readiness', `pdui-readiness--${toneForReadiness(readiness)}`)}>
      <BadgeCheck aria-hidden="true" size={14} />
      <span>{readinessLabels[readiness]}</span>
    </span>
  );
}

export function ReadinessBanner({
  nextAction,
  readiness,
}: {
  nextAction: string;
  readiness: UIReadiness;
}) {
  return (
    <section className={cx('pdui-readiness-banner', `pdui-tone--${toneForReadiness(readiness)}`)} role={readiness === 'INVALID' || readiness === 'BLOCKED' ? 'alert' : 'status'}>
      <ReadinessBadge readiness={readiness} />
      <p>{nextAction}</p>
    </section>
  );
}

export function MetricValue({ metric }: { metric: UIMetric }) {
  return <strong className="pdui-metric-value">{metric.value ?? 'nieopublikowane'}</strong>;
}

export function MetricDelta({ metric }: { metric: UIMetric }) {
  return (
    <span className="pdui-metric-delta">
      <TrendingUp aria-hidden="true" size={14} />
      {metric.delta}
    </span>
  );
}

export function MetricTrend({ chart }: { chart: UIChartFixture }) {
  return <DataVisualization chart={chart} compact />;
}

export function MetricStatus({ metric }: { metric: UIMetric }) {
  return <ReadinessBadge readiness={metric.readiness} />;
}

export function MetricCard({ metric }: { metric: UIMetric }) {
  return (
    <Surface className="pdui-metric-card">
      <span className="pdui-kicker">{metric.source}</span>
      <h3>{metric.label}</h3>
      <MetricValue metric={metric} />
      <div className="pdui-card-row">
        <MetricDelta metric={metric} />
        <MetricStatus metric={metric} />
      </div>
      {metric.limitation ? <p>{metric.limitation}</p> : null}
    </Surface>
  );
}

export function DataFreshness({ timestamp }: { timestamp: string }) {
  return (
    <span className="pdui-freshness">
      <Clock3 aria-hidden="true" size={14} />
      Ostatnia synchronizacja: {formatDateTime(timestamp)}
    </span>
  );
}

export function SourceLogo({ source }: { source: string }) {
  const initials = source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return <span className="pdui-source-logo">{initials}</span>;
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="pdui-source-badge">
      <SourceLogo source={source} />
      <span>{source}</span>
    </span>
  );
}

export function EvidenceItem({ evidence }: { evidence: UIEvidence }) {
  return (
    <li className="pdui-evidence-item">
      <FileText aria-hidden="true" size={16} />
      <span>
        <strong>{evidence.label}</strong>
        <small>{evidence.source} / {formatDateTime(evidence.timestamp)}</small>
        {evidence.limitation ? <small>{evidence.limitation}</small> : null}
      </span>
    </li>
  );
}

export function EvidencePanel({ evidence }: { evidence: readonly UIEvidence[] }) {
  return (
    <Surface className="pdui-evidence-panel">
      <div className="pdui-panel-heading">
        <FileText aria-hidden="true" size={18} />
        <h3>Evidence</h3>
      </div>
      <ul>
        {evidence.map((item) => (
          <EvidenceItem evidence={item} key={item.id} />
        ))}
      </ul>
    </Surface>
  );
}

export function LimitationList({ limitations }: { limitations: readonly string[] }) {
  return (
    <ul className="pdui-limitations">
      {limitations.map((limitation) => (
        <li key={limitation}>
          <AlertTriangle aria-hidden="true" size={14} />
          <span>{limitation}</span>
        </li>
      ))}
    </ul>
  );
}

export function ConfidenceIndicator({ confidence }: { confidence: 'low' | 'medium' | 'high' }) {
  const value = confidence === 'high' ? 92 : confidence === 'medium' ? 68 : 38;

  return (
    <div className="pdui-confidence">
      <span>Confidence: {confidence}</span>
      <Progress value={value} />
    </div>
  );
}

export function DataQualityIndicator({ readiness }: { readiness: UIReadiness }) {
  return (
    <span className="pdui-quality">
      <Database aria-hidden="true" size={16} />
      <span>Jakość danych</span>
      <ReadinessBadge readiness={readiness} />
    </span>
  );
}

export function OperationTracker({
  operationId,
  state,
}: {
  operationId: string;
  state: UISystemState;
}) {
  return (
    <Surface className="pdui-operation" aria-live="polite">
      <Activity aria-hidden="true" size={18} />
      <span>
        <strong>{stateLabels[state]}</strong>
        <small>{operationId}</small>
      </span>
      <Progress value={state === 'success' || state === 'ready' ? 100 : 64} />
    </Surface>
  );
}

export function SyncProgress({ state }: { state: UISystemState }) {
  return <OperationTracker operationId="operation:sync:demo" state={state} />;
}

export function IntegrationStatus({ state }: { state: UISystemState }) {
  return <SystemStateBadge state={state} />;
}

export function IntegrationCard({ state }: { state: UISystemState }) {
  return (
    <Surface className="pdui-domain-card">
      <SourceBadge source="WooCommerce" />
      <h3>Integracja pilotażowa</h3>
      <IntegrationStatus state={state} />
      <p>Provider jest dostępny po przejściu adaptera, scopes, readiness i runbooka.</p>
    </Surface>
  );
}

export function DataIssueCard({ state }: { state: UISystemState }) {
  return <DomainCard icon={<Database aria-hidden="true" size={18} />} state={state} title="Problem jakości danych" />;
}

export function AlertCard({ state }: { state: UISystemState }) {
  return <DomainCard icon={<Bell aria-hidden="true" size={18} />} state={state} title="Alert operacyjny" />;
}

export function RecommendationCard({ state }: { state: UISystemState }) {
  return <DomainCard icon={<Sparkles aria-hidden="true" size={18} />} state={state} title="Rekomendacja" />;
}

export function DecisionCard({ state }: { state: UISystemState }) {
  return <DomainCard icon={<ShieldCheck aria-hidden="true" size={18} />} state={state} title="Decyzja człowieka" />;
}

export function ApprovalBar({ state }: { state: UISystemState }) {
  return (
    <div className="pdui-approval-bar">
      <ShieldCheck aria-hidden="true" size={18} />
      <span>Approval wymagany przed wykonaniem działania</span>
      <SystemStateBadge state={state} />
    </div>
  );
}

export function ActionCard({ state }: { state: UISystemState }) {
  return <DomainCard icon={<Play aria-hidden="true" size={18} />} state={state} title="Action proposal" />;
}

export function AuditEvent({ event }: { event: string }) {
  return (
    <li className="pdui-audit-event">
      <History aria-hidden="true" size={15} />
      <span>{event}</span>
    </li>
  );
}

export function UsageMeter({ metric }: { metric: UIMetric }) {
  return (
    <div className="pdui-usage-meter">
      <span>{metric.label}</span>
      <Progress value={Number.parseInt(metric.value ?? '0', 10)} />
    </div>
  );
}

export function PlanLimit({ value = '78%' }: { value?: string }) {
  return (
    <span className="pdui-plan-limit">
      <Gauge aria-hidden="true" size={16} />
      Limit planu: {value}
    </span>
  );
}

export function ReportCard({ state }: { state: UISystemState }) {
  return <DomainCard icon={<Archive aria-hidden="true" size={18} />} state={state} title="Raport" />;
}

export function ExportStatus({ state }: { state: UISystemState }) {
  return (
    <span className="pdui-export-status">
      <Download aria-hidden="true" size={16} />
      <SystemStateBadge state={state} />
    </span>
  );
}

export function AssistantMessage({
  author,
  children,
  state,
}: {
  author: 'assistant' | 'tool' | 'user';
  children: ReactNode;
  state: UISystemState;
}) {
  return (
    <article className={cx('pdui-assistant-message', `pdui-assistant-message--${author}`)}>
      <Avatar label={author === 'assistant' ? 'PA' : author === 'tool' ? 'TL' : 'U'} />
      <div>
        <SystemStateBadge state={state} />
        <p>{children}</p>
      </div>
    </article>
  );
}

export function AssistantComposer() {
  return (
    <form className="pdui-assistant-composer">
      <label className="pdui-sr-only" htmlFor="pdui-assistant-composer">
        Wiadomość do Papa Asystenta
      </label>
      <textarea id="pdui-assistant-composer" placeholder="Zadaj pytanie w aktywnym workspace" />
      <DSButton iconBefore={<Send aria-hidden="true" size={16} />} type="submit">
        Wyślij
      </DSButton>
    </form>
  );
}

export function AssistantThreadItem({
  active = false,
  title,
}: {
  active?: boolean;
  title: string;
}) {
  return (
    <button aria-current={active ? 'page' : undefined} className="pdui-thread-item" type="button">
      <MessageSquareText aria-hidden="true" size={16} />
      <span>{title}</span>
    </button>
  );
}

export function AssistantToolActivity({ activity }: { activity: string }) {
  return (
    <div className="pdui-tool-activity" role="status">
      <LoaderCircle aria-hidden="true" size={16} />
      <span>{activity}</span>
    </div>
  );
}

export function AssistantEvidence({ evidence }: { evidence: readonly UIEvidence[] }) {
  return <EvidencePanel evidence={evidence} />;
}

function DomainCard({
  icon,
  state,
  title,
}: {
  icon: ReactNode;
  state: UISystemState;
  title: string;
}) {
  return (
    <Surface className="pdui-domain-card">
      <div className="pdui-panel-heading">
        {icon}
        <h3>{title}</h3>
      </div>
      <SystemStateBadge state={state} />
      <p>Komponent pokazuje status, wpływ, evidence i następną akcję.</p>
    </Surface>
  );
}

function chartMax(chart: UIChartFixture) {
  return Math.max(
    1,
    ...chart.points.map((point) => point.value ?? 0),
  );
}

function sparklinePoints(chart: UIChartFixture) {
  const max = chartMax(chart);
  const lastIndex = Math.max(1, chart.points.length - 1);

  return chart.points
    .map((point, index) => {
      const x = (index / lastIndex) * 100;
      const y = 48 - (((point.value ?? 0) / max) * 40);

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function donutStyle(chart: UIChartFixture) {
  const total = chart.points.reduce((sum, point) => sum + (point.value ?? 0), 0) || 1;
  let cursor = 0;
  const tokens = [
    'var(--pds-accent-primary)',
    'var(--pds-accent-secondary)',
    'var(--pds-accent-warm)',
    'var(--pds-danger)',
  ];
  const stops = chart.points.map((point, index) => {
    const start = cursor;
    const end = cursor + (((point.value ?? 0) / total) * 100);
    cursor = end;

    return `${tokens[index % tokens.length]} ${start}% ${end}%`;
  });

  return {
    background: `conic-gradient(${stops.join(', ')})`,
  };
}

export function DataVisualization({
  chart,
  compact = false,
}: {
  chart: UIChartFixture;
  compact?: boolean;
}) {
  const max = chartMax(chart);
  const linePoints = useMemo(() => sparklinePoints(chart), [chart]);
  const isCircular = chart.chartType === 'PieChart' || chart.chartType === 'DonutChart';
  const isLineLike = [
    'AreaChart',
    'ComposedChart',
    'LineChart',
    'Sparkline',
    'TrendChart',
    'ComparisonChart',
  ].includes(chart.chartType);

  return (
    <figure className={cx('pdui-chart', compact && 'pdui-chart--compact')}>
      {!compact ? (
        <figcaption>
          <span>
            <BarChart3 aria-hidden="true" size={18} />
            <span>
              <small className="pdui-kicker">{chart.chartType}</small>
              <strong>{chart.title}</strong>
            </span>
          </span>
          <ReadinessBadge readiness={chart.readiness} />
        </figcaption>
      ) : null}

      {isCircular ? (
        <div className={cx('pdui-donut', chart.chartType === 'PieChart' && 'pdui-donut--pie')} style={donutStyle(chart)} aria-label={`${chart.title}: ${chart.points.map((point) => `${point.label} ${point.value ?? 'brak'}`).join(', ')}`} role="img" />
      ) : null}

      {chart.chartType === 'FunnelChart' ? (
        <div className="pdui-funnel" aria-label={chart.title} role="img">
          {chart.points.map((point, index) => (
            <span key={point.label} style={{ width: `${Math.max(24, ((point.value ?? 0) / max) * 100)}%` }}>
              {index + 1}. {point.label}
            </span>
          ))}
        </div>
      ) : null}

      {!isCircular && chart.chartType !== 'FunnelChart' ? (
        <svg aria-label={chart.title} className="pdui-svg-chart" role="img" viewBox="0 0 100 54">
          {chart.chartType === 'BarChart' || chart.chartType === 'StackedBarChart' ? (
            chart.points.map((point, index) => {
              const barWidth = 72 / Math.max(1, chart.points.length);
              const x = 10 + index * (barWidth + 4);
              const height = ((point.value ?? 0) / max) * 40;

              return (
                <rect
                  className="pdui-svg-chart__bar"
                  height={height}
                  key={point.label}
                  rx="1.8"
                  width={barWidth}
                  x={x}
                  y={48 - height}
                />
              );
            })
          ) : null}
          {isLineLike ? (
            <>
              {chart.chartType === 'AreaChart' ? (
                <polygon className="pdui-svg-chart__area" points={`0,52 ${linePoints} 100,52`} />
              ) : null}
              <polyline className="pdui-svg-chart__line" points={linePoints} />
            </>
          ) : null}
        </svg>
      ) : null}

      {!compact ? (
        <>
          <p>{chart.description}</p>
          <p className="pdui-chart__interpretation">{chart.interpretation}</p>
          <div className="pdui-chart__meta">
            <span>Jednostka: {chart.unit}</span>
            <DataFreshness timestamp={chart.lastSync} />
            {chart.sources.map((source) => (
              <SourceBadge key={source} source={source} />
            ))}
          </div>
          <table className="pdui-table">
            <caption>{chart.tableAlternativeLabel}</caption>
            <thead>
              <tr>
                <th>Okres</th>
                <th>Wartość</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              {chart.points.map((point) => (
                <tr key={point.label}>
                  <td>{point.label}</td>
                  <td>{point.value === null ? 'brak danych' : point.value}</td>
                  <td>{readinessLabels[point.readiness]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </figure>
  );
}

export function MotionPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      animate={{ opacity: 1, transform: 'translateY(0)' }}
      className={className}
      initial={{ opacity: 0, transform: 'translateY(8px)' }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

export function ComponentSample({
  name,
  state,
}: {
  name: string;
  state: UISystemState;
}) {
  if (name === 'Button') {
    return <DSButton iconAfter={<ArrowRight aria-hidden="true" size={15} />}>Kontynuuj</DSButton>;
  }

  if (name === 'IconButton') {
    return <IconButton label="Odśwież"><RefreshCw aria-hidden="true" size={16} /></IconButton>;
  }

  if (name === 'TextField') {
    return <DSTextField label="Nazwa workspace" placeholder="Sklep PL" />;
  }

  if (name === 'PasswordField') {
    return <DSPasswordField label="Hasło" placeholder="••••••••" />;
  }

  if (name === 'CodeInput') {
    return <CodeInput value="482" />;
  }

  if (name === 'Checkbox') {
    return <Checkbox label="Uwzględnij evidence" />;
  }

  if (name === 'Switch') {
    return <Switch label="Powiadomienia aktywne" />;
  }

  if (name === 'Select') {
    return <Select />;
  }

  if (name === 'Tabs') {
    return <Tabs />;
  }

  if (name === 'Dialog') {
    return <Dialog />;
  }

  if (name === 'Popover') {
    return <Popover />;
  }

  if (name === 'Tooltip') {
    return <Tooltip />;
  }

  if (name === 'MetricCard') {
    return (
      <MetricCard
        metric={{
          delta: '+8,4%',
          evidenceId: 'evidence:sample',
          label: 'Przychód netto',
          limitation: 'Ostatni dzień jest częściowy.',
          readiness: 'PARTIAL',
          source: 'MetricSnapshot',
          unit: 'currency',
          value: '142 200 PLN',
        }}
      />
    );
  }

  if (name === 'EvidencePanel' || name === 'AssistantEvidence') {
    return (
      <EvidencePanel
        evidence={[
          {
            id: 'evidence:component',
            label: 'Przykładowe evidence',
            limitation: null,
            source: 'domain-contracts.v1',
            timestamp: '2026-07-20T07:40:00.000Z',
          },
        ]}
      />
    );
  }

  if (name === 'AssistantComposer') {
    return <AssistantComposer />;
  }

  if (name === 'Progress' || name === 'UsageMeter') {
    return <Progress value={68} />;
  }

  return <DomainCard icon={<Layers3 aria-hidden="true" size={18} />} state={state} title={name} />;
}
