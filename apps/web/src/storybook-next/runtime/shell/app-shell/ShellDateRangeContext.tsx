import {
  createContext,
  useContext,
} from 'react';
import type {
  Dispatch,
  SetStateAction,
} from 'react';

import type {
  DateRange,
} from '../../../../../../../contracts/ui-contract-types';
import {
  createInitialShellDateRange,
  getShellDateRangeKey,
} from './shellDateRange';

type ShellDateRangeContextValue = {
  readonly dateRange: DateRange;
  readonly dateRangeKey: string;
  readonly setDateRange: Dispatch<SetStateAction<DateRange>>;
};

const fallbackDateRange = createInitialShellDateRange();

export const ShellDateRangeContext =
  createContext<ShellDateRangeContextValue>({
    dateRange: fallbackDateRange,
    dateRangeKey: getShellDateRangeKey(fallbackDateRange),
    setDateRange: () => undefined,
  });

export function useShellDateRange(): ShellDateRangeContextValue {
  return useContext(ShellDateRangeContext);
}
