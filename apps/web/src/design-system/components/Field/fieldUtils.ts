export type FormControlStatus =
  | 'default'
  | 'error'
  | 'valid';

export type FormControlState =
  | 'default'
  | 'disabled'
  | 'error'
  | 'readonly'
  | 'valid';

export function joinClassNames(
  ...parts: Array<string | false | null | undefined>
) {
  return parts.filter(Boolean).join(' ');
}

export function resolveFormControlState({
  disabled = false,
  invalid = false,
  readOnly = false,
  status = 'default',
  valid = false,
}: {
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly readOnly?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
}): FormControlState {
  if (disabled) {
    return 'disabled';
  }

  if (readOnly) {
    return 'readonly';
  }

  if (invalid || status === 'error') {
    return 'error';
  }

  if (valid || status === 'valid') {
    return 'valid';
  }

  return 'default';
}

export function resolveDescribedBy(
  ...ids: Array<string | undefined>
) {
  const value = ids.filter(Boolean).join(' ');

  return value.length > 0
    ? value
    : undefined;
}
