import type { Decorator } from '@storybook/react-vite';

import '../../../design-system/foundations/papadata-brand-surface.css';
import './component-canvas.css';

type ComponentCanvasTheme = 'light' | 'dark';

function resolveTheme(value: unknown): ComponentCanvasTheme {
  return value === 'light' ? 'light' : 'dark';
}

export const ComponentCanvasDecorator: Decorator = (
  Story,
  context,
) => {
  const theme = resolveTheme(context.globals.theme);
  const mode =
    context.parameters.componentCanvas === 'centered'
      ? 'centered'
      : 'wide';

  return (
    <div
      className="pds-brand-surface pds-component-canvas"
      data-theme={theme}
      lang="pl"
    >
      <div
        className={[
          'pds-component-canvas__viewport',
          `pds-component-canvas__viewport--${mode}`,
        ].join(' ')}
      >
        <Story />
      </div>
    </div>
  );
};
