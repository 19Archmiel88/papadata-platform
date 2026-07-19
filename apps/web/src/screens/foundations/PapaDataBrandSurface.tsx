import { useState } from 'react';

import { AppHeader } from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

type PapaDataTheme = 'light' | 'dark';
type PapaDataLanguage = 'pl' | 'en';

type PapaDataBrandSurfaceProps = {
  initialLanguage: PapaDataLanguage;
  initialTheme: PapaDataTheme;
};

function PapaDataBrandSurface(
  props: PapaDataBrandSurfaceProps,
) {
  const resetKey = `${props.initialLanguage}-${props.initialTheme}`;

  return (
    <PapaDataBrandSurfaceState
      key={resetKey}
      {...props}
    />
  );
}

function PapaDataBrandSurfaceState({
  initialLanguage,
  initialTheme,
}: PapaDataBrandSurfaceProps) {
  const [language, setLanguage] =
    useState<PapaDataLanguage>(initialLanguage);
  const [theme, setTheme] =
    useState<PapaDataTheme>(initialTheme);

  return (
    <div
      className="pds-brand-surface"
      data-language={language}
      data-theme={theme}
      lang={language}
    >
      <AppHeader
        language={language}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        theme={theme}
      />
    </div>
  );
}

export { PapaDataBrandSurface };
