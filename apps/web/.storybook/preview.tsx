/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'PapaData',
          [
            '01 Podstawy marki',
            [
              'Kolory',
              'Typografia',
              'Odstępy i geometria',
              'Logo i znak',
              'Motywy',
            ],
            '02 Komponenty',
            [
              'Przyciski',
              'Pola formularzy',
              'Pole hasła',
              'Kod jednorazowy',
              'Statusy i odznaki',
              'Komunikaty',
              [
                'Informacyjne',
                'Sukces',
                'Ostrzeżenia',
                'Błędy',
                'Komunikaty walidacyjne',
              ],
              'Nawigacja',
              'Nagłówki',
              'Karty i powierzchnie',
              'Wskaźniki postępu',
              'Stany ładowania',
            ],
            '03 Wzorce',
            [
              'Formularz logowania',
              'Formularz kodu jednorazowego',
              'Wybór kontekstu',
              'Wybór dostawcy',
              'Potwierdzenie operacji',
              'Pusty stan',
              'Stan błędu',
              'Stan braku dostępu',
            ],
            '04 Ekrany docelowe',
            [
              'Dostęp do konta',
              [
                'Logowanie',
                'Weryfikacja adresu e-mail',
                'MFA',
                'Odzyskiwanie hasła',
                'Reset hasła',
                'Zaproszenie',
                'Zarządzanie sesjami',
                'Ponowne uwierzytelnienie',
              ],
              'Konfiguracja przestrzeni roboczej',
              [
                'Wybór przestrzeni',
                'Utworzenie przestrzeni',
                'Dane firmy',
                'Połączenie źródła danych',
                'Konfiguracja',
                'Gotowość dashboardu',
              ],
              'Dashboard',
              [
                'Główny widok',
                'Centrum dowodzenia',
                'Klienci',
                'Produkty',
                'Ruch',
              ],
              'Analityka',
              [
                'KPI',
                'Wykresy',
                'Tabele',
                'Brak danych',
                'Ładowanie',
                'Błąd',
                'Nieaktualne dane',
              ],
              'Diagnostyka deweloperska',
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
