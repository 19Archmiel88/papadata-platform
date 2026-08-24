import {
  colorTokens,
} from './colors';

export const dataSeriesTokens: readonly string[] = [
  colorTokens.semantic.dataSeries1,
  colorTokens.semantic.dataSeries2,
  colorTokens.semantic.dataSeries3,
  colorTokens.semantic.dataSeries4,
  colorTokens.semantic.dataSeries5,
  colorTokens.semantic.dataSeries6,
  colorTokens.semantic.dataSeries7,
  colorTokens.semantic.dataSeries8,
  colorTokens.semantic.dataSeries9,
  colorTokens.semantic.dataSeries10,
];

export function resolveSeriesColor(
  index: number,
  tokens: readonly string[] = dataSeriesTokens,
): string {
  const palette = tokens.length > 0 ? tokens : dataSeriesTokens;

  return palette[index % palette.length]!;
}
