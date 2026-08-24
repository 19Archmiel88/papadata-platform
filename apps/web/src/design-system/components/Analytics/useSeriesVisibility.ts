import {
  useState,
} from 'react';

export type SeriesVisibilityController = {
  readonly isVisible: (id: string) => boolean;
  readonly toggle: (id: string) => void;
};

export function useSeriesVisibility(): SeriesVisibilityController {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const isVisible = (id: string) => !hidden.has(id);

  const toggle = (id: string) => {
    setHidden((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return {
    isVisible,
    toggle,
  };
}
