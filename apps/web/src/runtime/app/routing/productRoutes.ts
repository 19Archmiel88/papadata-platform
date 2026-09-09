import { cleanProductContextPath, productContextKeys, productScopeKeys } from '@papadata/contracts';
import { useCallback } from 'react';
import { navigate, safeReturnTo, useLocationPath } from './navigation';

export const productRoutes = {
  assistant: '/app/assistant', reports: '/app/reports', decisions: '/app/decisions',
  customers: '/app/customers', traffic: '/app/traffic', campaigns: '/app/campaigns',
  help: '/app/help', integrations: '/app/integrations', settings: '/app/settings',
  overview: '/app/command-center', orders: '/app/orders', products: '/app/products',
  billing: '/app/billing', dataQuality: '/app/data-quality',
} as const;

/** Query changes notify the same navigation store as Back/Forward. */
export function updateProductQuery(values: Readonly<Record<string, string | null>>, replace = true): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === '') url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  navigate(`${url.pathname}${url.search}${url.hash}`, { replace });
}
export function useProductQuery() {
  const location = useLocationPath();
  const params = new URLSearchParams(location.includes('?') ? location.slice(location.indexOf('?')+1).split('#')[0] : '');
  const update = useCallback((values: Readonly<Record<string, string | null>>) => updateProductQuery(values), []);
  return { params, update, location };
}

/** The Storybook harness may name its semantic product route. This never changes production routing. */
export function currentProductSourcePath(): string {
  const current = new URL(window.location.href);
  const semantic = current.pathname === '/iframe.html' ? current.searchParams.get('__pdRoute') : current.pathname.replace(/^\/preview(?=\/|$)/, '/app');
  const source = new URL(cleanProductContextPath(semantic) ?? '/app', current.origin);
  for (const key of productContextKeys) {
    const value=current.searchParams.get(key);
    if (value && value.length <= 500) source.searchParams.set(key,value);
  }
  return cleanProductContextPath(source.pathname+source.search) ?? '/app';
}
/** Only explicit analytic context is forwarded; tokens and arbitrary query keys are not. */
export function contextualProductLink(target: string, additions: Readonly<Record<string, string | null | undefined>> = {}): string {
  const current = new URL(window.location.href);
  const next = new URL(safeReturnTo(target), current.origin);
  for (const key of productScopeKeys) {
    const value = current.searchParams.get(key);
    if (value && value.length <= 500) next.searchParams.set(key,value);
  }
  next.searchParams.set('returnTo',currentProductSourcePath());
  for (const [key, value] of Object.entries(additions)) {
    if (value == null) next.searchParams.delete(key);
    else next.searchParams.set(key,value);
  }
  return next.pathname+next.search;
}
