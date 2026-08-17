import {
  BackgroundOperationItem,
  Drawer,
  EmptyState,
  ErrorState,
} from '../../design-system';
import type {
  ShellOperation,
} from '../app-shell/shellTypes';

export function OperationCenter({
  error = null,
  onAction,
  onOpenChange,
  open,
  operations,
}: {
  readonly error?: string | null;
  readonly onAction?: ((operation: ShellOperation) => void) | undefined;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly operations: readonly ShellOperation[];
}) {
  return (
    <Drawer
      description="Centrum operacji w tle pokazuje rzeczywisty postęp, retry, anulowanie i status."
      dismissible
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
      side="right"
      title="Operacje w tle"
      width={480}
    >
      <div className="pd-product-shell__drawer-stack">
        {error ? (
          <ErrorState
            errorCode="BACKGROUND_OPERATIONS_ERROR"
            message={error}
            title="Operacje są chwilowo niedostępne"
            variant="system"
          />
        ) : operations.length === 0 ? (
          <EmptyState
            message="Nie ma aktywnych synchronizacji, eksportów ani jobów."
            title="Brak operacji"
            variant="empty"
          />
        ) : (
          operations.map((operation) => {
            const hasRealAction = Boolean(operation.action && onAction);
            return (
              <BackgroundOperationItem
                actionLabel={hasRealAction ? operation.actionLabel : null}
                actionVariant={operation.action === 'cancel' ? 'danger' : 'secondary'}
                description={operation.description}
                errorCode={operation.errorCode}
                key={operation.id}
                onAction={hasRealAction ? () => onAction?.(operation) : undefined}
                operationId={operation.id}
                progress={operation.progress}
                startedAt={operation.startedAt}
                status={operation.status}
                statusText={operation.statusText}
                title={operation.title}
              />
            );
          })
        )}
      </div>
    </Drawer>
  );
}
