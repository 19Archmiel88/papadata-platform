import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import type {
  FunnelChartProps as ContractFunnelChartProps,
} from '../../../../../../contracts/components/funnelchart';
import type {
  PageHeaderProps as ContractPageHeaderProps,
} from '../../../../../../contracts/components/pageheader';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import './domain-components.css';

export type {
  HTMLAttributes,
  ReactNode,
  ContractFunnelChartProps,
  ContractPageHeaderProps,
};

export {
  forwardRef,
  joinClassNames,
  useId,
};

export type BaseComponentContractKeys =
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
  | 'variant';

export type PageHeaderContractRuntimeKeys =
  | BaseComponentContractKeys
  | 'primaryActionId'
  | 'secondaryActionIds';

export function formatInteger(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  const normalized = Math.abs(value) <= 1
    ? value
    : value / 100;

  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(normalized);
}
