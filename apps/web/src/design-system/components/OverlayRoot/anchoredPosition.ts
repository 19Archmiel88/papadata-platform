export type AnchoredPlacement =
  | 'bottom'
  | 'bottom-end'
  | 'bottom-start'
  | 'left'
  | 'right'
  | 'right-start'
  | 'top';

type AnchorBounds = { left: number; right: number; top: number; bottom: number };
type Size = { width: number; height: number };

/** Fixed portal coordinates, including collision handling at viewport edges. */
export function anchoredPosition(
  anchor: AnchorBounds,
  panel: Size,
  viewport: Size,
  placement: AnchoredPlacement,
  gap = 6,
) {
  const inset = 16;
  const maxWidth = Math.max(0, viewport.width - inset * 2);
  const maxHeight = Math.max(0, viewport.height - inset * 2);
  const width = Math.min(panel.width, maxWidth);
  const height = Math.min(panel.height, maxHeight);
  const below = viewport.height - anchor.bottom - gap - inset;
  const above = anchor.top - gap - inset;
  let left = placement === 'bottom-end' ? anchor.right - width : anchor.left;
  let top = anchor.bottom + gap;

  if (placement === 'left' || placement === 'right' || placement === 'right-start') {
    const roomLeft = anchor.left - gap - inset;
    const roomRight = viewport.width - anchor.right - gap - inset;
    const useLeft =
      placement === 'left'
        ? roomLeft >= width || roomLeft >= roomRight
        : roomRight < width && roomLeft > roomRight;
    left = useLeft ? anchor.left - gap - width : anchor.right + gap;
    top = anchor.top;
  } else {
    const useTop =
      placement === 'top' ? above >= height || above >= below : below < height && above > below;
    if (useTop) top = anchor.top - gap - height;
  }

  return {
    left: Math.max(inset, Math.min(left, viewport.width - inset - width)),
    top: Math.max(inset, Math.min(top, viewport.height - inset - height)),
    maxWidth,
    maxHeight,
  };
}
