import {
  BackgroundOperationItem,
  Drawer,
  EmptyState,
} from '../../design-system';
import type {
  ShellOperation,
} from '../app-shell/shellTypes';

export function OperationCenter({
  onOpenChange,
  open,
  operations,
}: {
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly operations: readonly ShellOperation[];
}) {
  return (
    <Drawer
      description="Centrum operacji w tle pokazuje postęp, retry, cancel i status."
      dismissible
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
      side="right"
      title="Operacje w tle"
      width={480}
    >
      <div className="pd-product-shell__drawer-stack">
        {operations.length === 0 ? (
          <EmptyState
            message="Nie ma aktywnych synchronizacji, eksportów ani jobów."
            title="Brak operacji"
            variant="empty"
          />
        ) : (
          operations.map((operation) => (
            <BackgroundOperationItem
              actionLabel={operation.actionLabel}
              description={operation.description}
              errorCode={operation.errorCode}
              key={operation.id}
              operationId={operation.id}
              progress={operation.progress}
              startedAt={operation.startedAt}
              status={operation.status}
              statusText={operation.statusText}
              title={operation.title}
            />
          ))
        )}
      </div>
    </Drawer>
  );
}
