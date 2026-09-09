import type { CustomersPortfolio, RealCustomersRecord } from '@papadata/contracts';
import type { DateRange } from '../../../../../contracts/ui-contract-types';
import type { BffClient } from '../../runtime/shared/api/bffClient';

export function customerQuery(params: URLSearchParams): Record<string, string> {
  const query: Record<string, string> = { limit: '50' };
  const mapping = { customerSegment: 'segment', customerRisk: 'riskStatus', customerSearch: 'search', customerCursor: 'cursor', customerSort: 'sortBy', customerDirection: 'sortDirection' };
  for (const [key, target] of Object.entries(mapping)) {
    const value = params.get(key); if (value) query[target] = value;
  }
  return query;
}
export async function loadCustomerPortfolio(client: Pick<BffClient, 'readDomainScreen'>, dateRange: DateRange, params: URLSearchParams, signal: AbortSignal): Promise<CustomersPortfolio> {
  const result = await client.readDomainScreen<CustomersPortfolio>('/api/v1/customers/przeglad', { dateRange, query: customerQuery(params), signal });
  if (!result?.scope?.asOf || !result.portfolioTotals || !Array.isArray(result.records) || !Array.isArray(result.cohorts)
    || result.cohorts.some(cohort => !Array.isArray(cohort.retention))) {
    throw new Error('Niezgodna wersja API Klientów. Wymagany kontrakt portfela ze scope i retencją M1–M12. Dane demo nie zastępują błędu.');
  }
  return result;
}
export async function loadCustomerDetail(client: Pick<BffClient, 'readDomainScreen'>, dateRange: DateRange, customerPseudonym: string, signal: AbortSignal): Promise<RealCustomersRecord> {
  const result = await client.readDomainScreen<{ record: RealCustomersRecord }>('/api/v1/customers/szczegoly-pseudonimizowane', { dateRange, query: { customerPseudonym }, signal });
  if (!result?.record || result.record.customerPseudonym !== customerPseudonym) throw new Error('Nieprawidłowy rekord szczegółów klienta.');
  return result.record;
}
