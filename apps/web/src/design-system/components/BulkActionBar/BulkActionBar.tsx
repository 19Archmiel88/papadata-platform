import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import type {
  BulkActionBarProps as ContractBulkActionBarProps,
} from '../../../../../../contracts/components/bulkactionbar';
import {
  Button,
} from '../Button';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import './bulk-action-bar.css';

export type BulkActionBarProps = Omit<
  ContractBulkActionBarProps,
  | 'actions'
  | 'ariaLabel'
  | 'ariaLive'
  | 'context'
  | 'description'
  | 'disabled'
  | 'disabledReason'
  | 'evidence'
  | 'id'
  | 'label'
  | 'state'
  | 'testId'
  | 'variant'
> & HTMLAttributes<HTMLElement> & {
  readonly label?: string;
  readonly onAction?:
    | ((actionId: string) => void)
    | undefined;
  readonly onClearSelection?:
    | (() => void)
    | undefined;
};

export const BulkActionBar = forwardRef<
  HTMLElement,
  BulkActionBarProps
>(function BulkActionBar(
  {
    availableActions,
    busyActionId,
    className,
    label = 'Akcje zbiorcze',
    onAction,
    onClearSelection,
    selectedCount,
    ...props
  },
  ref,
) {
  const titleId = useId();

  return (
    <section
      {...props}
      ref={ref}
      aria-labelledby={titleId}
      className={joinClassNames('pd-bulk-action-bar', className)}
      data-empty={selectedCount === 0 ? true : undefined}
    >
      <div>
        <h2 id={titleId}>{label}</h2>
        <p>{selectedCount} zaznaczonych rekordów</p>
      </div>
      <div className="pd-bulk-action-bar__actions">
        {availableActions.map((action) => (
          <Button
            key={action.id}
            disabled={selectedCount === 0}
            loading={busyActionId === action.id}
            loadingLabel="Wykonywanie"
            size="small"
            variant={action.destructive ? 'danger' : 'secondary'}
            onClick={() => {
              onAction?.(action.id);
            }}
          >
            {action.label}
          </Button>
        ))}
        {onClearSelection ? (
          <Button
            disabled={selectedCount === 0}
            size="small"
            variant="ghost"
            onClick={onClearSelection}
          >
            Wyczyść
          </Button>
        ) : null}
      </div>
    </section>
  );
});
