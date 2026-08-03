export const layerTokens = {
  underlay: 'var(--pd-layer-underlay)',
  base: 'var(--pd-layer-base)',
  sticky: 'var(--pd-layer-sticky)',
  popover: 'var(--pd-layer-popover)',
  modal: 'var(--pd-layer-modal)',
  toast: 'var(--pd-layer-toast)',
} as const;

export const layerContract = {
  underlay: -1,
  base: 0,
  sticky: 10,
  popover: 20,
  modal: 30,
  toast: 40,
} as const;

export type LayerTokenName =
  keyof typeof layerTokens;
