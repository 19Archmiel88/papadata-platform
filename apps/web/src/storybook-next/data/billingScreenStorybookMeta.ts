import type {
  BillingScreenId,
} from '../runtime/screens/billing/billingData';

export type BillingScreenStorybookMeta = {
  readonly documentPath: string;
};

/**
 * documentPath only ever mattered to Storybook (ProductionStoryShell's
 * doc-link header) -- it used to live on BillingScreenDefinition itself,
 * which meant every production screen bundle shipped this doc metadata for
 * no runtime reason. Keyed on the same BillingScreenId rather than
 * duplicating a second screens list. Mirrors the businessScreenStorybookMeta
 * pattern used for the Command Center screens.
 */
export const billingScreenStorybookMeta: Readonly<
  Record<BillingScreenId, BillingScreenStorybookMeta>
> = {
  '70.01': { documentPath: '17-subskrypcja-i-platnosci/70-01-subskrypcja.md' },
  '70.02': { documentPath: '17-subskrypcja-i-platnosci/70-02-uzycie-i-limity.md' },
  '70.03': { documentPath: '17-subskrypcja-i-platnosci/70-03-plany.md' },
  '70.04': { documentPath: '17-subskrypcja-i-platnosci/70-04-faktury.md' },
  '70.05': { documentPath: '17-subskrypcja-i-platnosci/70-05-platnosci.md' },
  '70.06': { documentPath: '17-subskrypcja-i-platnosci/70-06-zalegla-platnosc.md' },
  '70.07': { documentPath: '17-subskrypcja-i-platnosci/70-07-korekty.md' },
  '70.08': { documentPath: '17-subskrypcja-i-platnosci/70-08-zmiana-i-anulowanie.md' },
  '70.09': { documentPath: '17-subskrypcja-i-platnosci/70-09-pilot-do-abonamentu.md' },
  '70.10': { documentPath: '17-subskrypcja-i-platnosci/70-10-warianty-billingowe.md' },
};
