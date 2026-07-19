import {
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type {
  PapaDataLanguage,
  PapaDataTheme,
} from '../../contracts/ui';
import { AppHeader } from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';
import './target-screen-shell.css';

type TargetScreenShellProps = {
  children?: ReactNode;
  className?: string;
  initialTheme?: PapaDataTheme;
  mainClassName?: string;
  style?: CSSProperties;
};

function TargetScreenAmbient() {
  return (
    <div className="pdt-ambient" aria-hidden="true">
      <svg
        className="pdt-ambient__group pdt-ambient__group--left"
        preserveAspectRatio="none"
        viewBox="0 0 460 120"
      >
        <path
          className="pdt-ambient__line pdt-ambient__line--blue"
          d="M0 66 C95 18 185 20 270 62 C340 96 398 76 460 48"
        />
        <path
          className="pdt-ambient__line pdt-ambient__line--cyan"
          d="M0 72 C110 42 185 92 286 66 C356 48 400 38 460 55"
        />
        <path
          className="pdt-ambient__line pdt-ambient__line--teal"
          d="M0 56 C118 102 212 98 310 48 C370 18 415 30 460 50"
        />
      </svg>

      <svg
        className="pdt-ambient__group pdt-ambient__group--right"
        preserveAspectRatio="none"
        viewBox="0 0 460 120"
      >
        <path
          className="pdt-ambient__line pdt-ambient__line--blue"
          d="M0 66 C95 18 185 20 270 62 C340 96 398 76 460 48"
        />
        <path
          className="pdt-ambient__line pdt-ambient__line--cyan"
          d="M0 72 C110 42 185 92 286 66 C356 48 400 38 460 55"
        />
        <path
          className="pdt-ambient__line pdt-ambient__line--teal"
          d="M0 56 C118 102 212 98 310 48 C370 18 415 30 460 50"
        />
      </svg>
    </div>
  );
}

function TargetScreenShell({
  children,
  className,
  initialTheme = 'dark',
  mainClassName,
  style,
}: TargetScreenShellProps) {
  const [language, setLanguage] =
    useState<PapaDataLanguage>('pl');
  const [theme, setTheme] =
    useState<PapaDataTheme>(initialTheme);

  return (
    <div
      className={[
        'pds-brand-surface',
        'pdt-shell',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-theme={theme}
      lang={language}
      style={style}
    >
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        theme={theme}
      />

      <TargetScreenAmbient />

      <main
        className={[
          'pdt-main',
          mainClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
    </div>
  );
}

export {
  TargetScreenAmbient,
  TargetScreenShell,
};
