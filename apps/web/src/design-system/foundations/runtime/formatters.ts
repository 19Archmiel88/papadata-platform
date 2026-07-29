type PapaDataRuntimeLocale = 'pl' | 'en';

const localeMap = {
  pl: 'pl-PL',
  en: 'en-US',
} as const satisfies Record<
  PapaDataRuntimeLocale,
  string
>;

export function getPapaDataIntlLocale(
  locale: PapaDataRuntimeLocale,
) {
  return localeMap[locale];
}

export function formatPapaDataNumber(
  value: number,
  locale: PapaDataRuntimeLocale,
) {
  return new Intl.NumberFormat(
    getPapaDataIntlLocale(locale),
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}

export function formatPapaDataCurrency(
  value: number,
  locale: PapaDataRuntimeLocale,
  currency = 'PLN',
) {
  return new Intl.NumberFormat(
    getPapaDataIntlLocale(locale),
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

export function formatPapaDataPercent(
  value: number,
  locale: PapaDataRuntimeLocale,
) {
  return new Intl.NumberFormat(
    getPapaDataIntlLocale(locale),
    {
      style: 'percent',
      maximumFractionDigits: 1,
    },
  ).format(value);
}

export function formatPapaDataDate(
  value: Date,
  locale: PapaDataRuntimeLocale,
) {
  return new Intl.DateTimeFormat(
    getPapaDataIntlLocale(locale),
    {
      dateStyle: 'medium',
    },
  ).format(value);
}

export function formatPapaDataDateRange(
  start: Date,
  end: Date,
  locale: PapaDataRuntimeLocale,
) {
  const formatter = new Intl.DateTimeFormat(
    getPapaDataIntlLocale(locale),
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );

  const formatRange = (
    formatter as Intl.DateTimeFormat & {
      formatRange?: (
        startDate: Date,
        endDate: Date,
      ) => string;
    }
  ).formatRange;

  if (typeof formatRange === 'function') {
    return formatRange.call(
      formatter,
      start,
      end,
    );
  }

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function formatPapaDataRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: PapaDataRuntimeLocale,
) {
  return new Intl.RelativeTimeFormat(
    getPapaDataIntlLocale(locale),
    {
      numeric: 'auto',
    },
  ).format(value, unit);
}
