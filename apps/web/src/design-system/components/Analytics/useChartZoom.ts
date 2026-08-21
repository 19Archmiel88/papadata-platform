import type {
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';
import {
  useMemo,
  useRef,
  useState,
} from 'react';

export type ChartZoomRange = readonly [number, number];

export type ChartZoomController<T> = {
  readonly isZoomed: boolean;
  readonly visibleData: readonly T[];
  readonly onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  readonly onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  readonly onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  readonly onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  readonly resetZoom: () => void;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function resolveIndexFromClientX(
  clientX: number,
  element: HTMLDivElement,
  itemCount: number,
): number {
  if (itemCount <= 1) {
    return 0;
  }

  const bounds = element.getBoundingClientRect();
  const width = Math.max(bounds.width, 1);
  const ratio = clamp((clientX - bounds.left) / width, 0, 1);

  return Math.round(ratio * (itemCount - 1));
}

export function useChartZoom<T>(
  data: readonly T[],
  minimumVisiblePoints = 6,
): ChartZoomController<T> {
  const [range, setRange] = useState<ChartZoomRange | null>(null);
  const dragStartRef = useRef<number | null>(null);

  const safeMinimum = Math.max(2, Math.min(minimumVisiblePoints, data.length));
  const start = range ? clamp(range[0], 0, Math.max(data.length - 1, 0)) : 0;
  const end = range
    ? clamp(range[1], start, Math.max(data.length - 1, 0))
    : Math.max(data.length - 1, 0);

  const visibleData = useMemo(
    () => data.slice(start, end + 1),
    [data, end, start],
  );

  const resetZoom = () => {
    dragStartRef.current = null;
    setRange(null);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (data.length <= safeMinimum) {
      return;
    }

    dragStartRef.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (dragStart === null || data.length <= safeMinimum) {
      return;
    }

    if (Math.abs(event.clientX - dragStart) < 24) {
      return;
    }

    const visibleCount = end - start + 1;
    const localStart = resolveIndexFromClientX(
      dragStart,
      event.currentTarget,
      visibleCount,
    );
    const localEnd = resolveIndexFromClientX(
      event.clientX,
      event.currentTarget,
      visibleCount,
    );

    const selectionStart = Math.min(localStart, localEnd);
    const selectionEnd = Math.max(localStart, localEnd);

    if (selectionEnd - selectionStart + 1 < safeMinimum) {
      const center = Math.round((selectionStart + selectionEnd) / 2);
      const half = Math.floor(safeMinimum / 2);
      const nextLocalStart = clamp(
        center - half,
        0,
        Math.max(visibleCount - safeMinimum, 0),
      );
      const nextLocalEnd = Math.min(
        visibleCount - 1,
        nextLocalStart + safeMinimum - 1,
      );

      setRange([
        start + nextLocalStart,
        start + nextLocalEnd,
      ]);
      return;
    }

    setRange([
      start + selectionStart,
      start + selectionEnd,
    ]);
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (data.length <= safeMinimum) {
      return;
    }

    event.preventDefault();

    const visibleCount = end - start + 1;
    const zoomingIn = event.deltaY < 0;

    if (!zoomingIn && visibleCount >= data.length) {
      return;
    }

    const factor = zoomingIn ? 0.78 : 1.28;
    const nextCount = clamp(
      Math.round(visibleCount * factor),
      safeMinimum,
      data.length,
    );

    if (nextCount >= data.length) {
      setRange(null);
      return;
    }

    const localAnchor = resolveIndexFromClientX(
      event.clientX,
      event.currentTarget,
      visibleCount,
    );
    const globalAnchor = start + localAnchor;
    const anchorRatio = visibleCount <= 1
      ? 0.5
      : localAnchor / (visibleCount - 1);

    let nextStart = Math.round(globalAnchor - anchorRatio * (nextCount - 1));
    nextStart = clamp(nextStart, 0, Math.max(data.length - nextCount, 0));
    const nextEnd = nextStart + nextCount - 1;

    setRange([nextStart, nextEnd]);
  };

  return {
    isZoomed: range !== null,
    visibleData,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    onWheel,
    resetZoom,
  };
}
