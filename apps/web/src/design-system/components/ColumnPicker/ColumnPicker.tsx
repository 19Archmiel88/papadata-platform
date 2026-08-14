import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import type {
  ColumnPickerProps as ContractColumnPickerProps,
} from '../../../../../../contracts/components/columnpicker';
import {
  Checkbox,
} from '../Checkbox';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import './column-picker.css';

export type ColumnPickerProps = Omit<
  ContractColumnPickerProps,
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
> & HTMLAttributes<HTMLFieldSetElement> & {
  readonly description?: string | null;
  readonly label: string;
  readonly onColumnVisibilityChange?:
    | ((columnId: string, visible: boolean) => void)
    | undefined;
};

export const ColumnPicker = forwardRef<
  HTMLFieldSetElement,
  ColumnPickerProps
>(function ColumnPicker(
  {
    className,
    columns,
    description = null,
    label,
    maxVisible,
    onColumnVisibilityChange,
    ...props
  },
  ref,
) {
  const descriptionId = useId();
  const visibleCount = columns.filter((column) => column.visible).length;
  const limitReached = maxVisible !== null && visibleCount >= maxVisible;

  return (
    <fieldset
      {...props}
      ref={ref}
      aria-describedby={description ? descriptionId : undefined}
      className={joinClassNames('pd-column-picker', className)}
    >
      <legend>{label}</legend>
      {description ? (
        <p id={descriptionId}>{description}</p>
      ) : null}
      <div className="pd-column-picker__list">
        {columns.map((column) => {
          const disabled = column.required
            || (!column.visible && limitReached);

          return (
            <Checkbox
              key={column.id}
              checked={column.visible}
              disabled={disabled}
              helperText={
                column.required
                  ? 'Kolumna wymagana'
                  : undefined
              }
              label={column.label}
              value={column.id}
              onChange={(event) => {
                onColumnVisibilityChange?.(
                  column.id,
                  event.currentTarget.checked,
                );
              }}
            />
          );
        })}
      </div>
      {maxVisible !== null ? (
        <span className="pd-column-picker__limit" role="status">
          Widoczne kolumny: {visibleCount}/{maxVisible}
        </span>
      ) : null}
    </fieldset>
  );
});
