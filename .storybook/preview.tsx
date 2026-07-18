/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'PapaData',
          [
            'Podstawy marki',
            [
              'Tło i górny pasek',
              'Logo i wordmark',
              'Motywy i preferencje',
            ],
            'Dostęp do konta',
            [
              'Proces dostępu',
              'Komponenty',
            ],
            'Konfiguracja workspace',
            [
              'Wybór workspace',
              'Utworzenie workspace',
              'Dane firmy',
              'Profil działalności',
              'Połączenie źródła danych',
              'Stan konfiguracji workspace',
              'Przygotowanie dashboardu',
              'Dostęp zablokowany',
              'Komponenty',
            ],
            'Dashboard',
            [
              'Shell',
              'Centrum Dowodzenia',
              'Zamówienia',
              'Produkty',
              'Klienci',
              'Ruch',
              'Kampanie płatne',
              'Integracje',
              'Ustawienia',
              'Subskrypcja',
              'Pomoc',
              'Papa Asystent',
              'Komponenty',
            ],
            'Elementy analityczne',
            [
              'KPI',
              'Wykresy i tabele',
              'Stany danych',
            ],
          ],
        ],
      },
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
