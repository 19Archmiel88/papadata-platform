import {
  useState,
} from 'react';

import {
  Icon,
} from '../../design-system';
import {
  applyStoredPapaDataRuntimePreference,
} from '../../design-system/foundations/runtime';
import type {
  PapaDataRuntimeLocale,
  PapaDataRuntimeTheme,
} from '../../design-system/foundations/runtime';

type RuntimeLocale = PapaDataRuntimeLocale;
type RuntimeTheme = PapaDataRuntimeTheme;

function readRuntimeLocale(): RuntimeLocale {
  if (typeof document === 'undefined') return 'pl';
  return document.documentElement.dataset.locale === 'en' ? 'en' : 'pl';
}

function readRuntimeTheme(): RuntimeTheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function preferenceCopy(locale: RuntimeLocale) {
  return locale === 'en'
    ? {
        languageToEnglish: 'Switch language to English',
        languageToPolish: 'Switch language to Polish',
        themeToDark: 'Switch to dark theme',
        themeToLight: 'Switch to light theme',
      }
    : {
        languageToEnglish: 'Zmień język na angielski',
        languageToPolish: 'Zmień język na polski',
        themeToDark: 'Zmień motyw na ciemny',
        themeToLight: 'Zmień motyw na jasny',
      };
}

export function AuthRuntimePreferences() {
  const [locale, setLocale] = useState<RuntimeLocale>(readRuntimeLocale);
  const [theme, setTheme] = useState<RuntimeTheme>(readRuntimeTheme);
  const copy = preferenceCopy(locale);
  const nextLocale: RuntimeLocale = locale === 'pl' ? 'en' : 'pl';
  const nextTheme: RuntimeTheme = theme === 'dark' ? 'light' : 'dark';
  const themeIcon = theme === 'dark' ? 'moon' : 'theme';

  function changeLocale() {
    setLocale(nextLocale);
    applyStoredPapaDataRuntimePreference({ locale: nextLocale });
  }

  function changeTheme() {
    setTheme(nextTheme);
    applyStoredPapaDataRuntimePreference({ theme: nextTheme });
  }

  return (
    <div className="pd-auth-runtime-preferences">
      <button
        aria-label={
          nextLocale === 'en'
            ? copy.languageToEnglish
            : copy.languageToPolish
        }
        className="pd-auth-runtime-preferences__locale"
        onClick={changeLocale}
        type="button"
      >
        {locale.toUpperCase()}
      </button>

      <button
        aria-label={nextTheme === 'dark' ? copy.themeToDark : copy.themeToLight}
        className="pd-auth-runtime-preferences__theme"
        onClick={changeTheme}
        type="button"
      >
        <Icon decorative name={themeIcon} size={16} />
      </button>
    </div>
  );
}
