/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'PapaData',
          [
            '00-foundations',
            [
              'Pełny interfejs',
            ],
            '05-primitives',
            [
              'Komponenty',
            ],
            '10-account-access',
            [
              'Ekrany dostępu',
            ],
            '20-onboarding',
            [
              'Onboarding',
            ],
            '30-command-center',
            [
              'Customer Workspace',
            ],
            '40-analytics',
            [
              'Wykresy i filtry dat',
            ],
            '50-integrations',
            [
              'Integracje',
            ],
            '60-data-quality',
            [
              'Jakość danych',
            ],
            '70-decisions',
            [
              'Decyzje i działania',
            ],
            '80-assistant',
            [
              'Papa Asystent',
            ],
            '90-reports',
            [
              'Raporty i eksporty',
            ],
            '100-settings',
            [
              'Ustawienia',
            ],
            '110-billing',
            [
              'Subskrypcja i użycie',
            ],
            '120-internal-control-plane',
            [
              'Ekrany operacyjne',
            ],
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
              [
                'Dokumentacja',
                'Podstawowy',
                'Warianty',
                'Rozmiary',
                'Stany',
                'Ikony',
              ],
              'Pola formularzy',
              [
                'Dokumentacja',
                'Podstawowe',
                'Typy',
                'Stany',
                'Walidacja',
              ],
              'Pole hasła',
              [
                'Dokumentacja',
                'Podstawowe',
                'Widoczność',
                'Walidacja',
                'Stany',
              ],
              'Kod jednorazowy',
              [
                'Dokumentacja',
                'Podstawowy',
                'Uzupełniony',
                'Błąd',
                'Nieaktywny',
              ],
              'Statusy i odznaki',
              [
                'Dokumentacja',
                'Warianty',
                'Etykiety',
                'W kontekście',
              ],
              'Nawigacja',
              [
                'Dokumentacja',
                'Podstawowa',
                'Ścieżka',
                'Zakładki',
                'Paginacja',
                'Stany',
              ],
              'Nagłówki',
              [
                'Dokumentacja',
                'Strony',
                'Sekcje',
                'Z akcjami',
                'Długi tekst',
              ],
              'Karty i powierzchnie',
              [
                'Dokumentacja',
                'Powierzchnie',
                'Karty',
                'Z akcją',
                'Statusy',
              ],
              'Stany ładowania',
              [
                'Dokumentacja',
                'Ładowanie',
                'Brak danych',
                'Błąd',
                'Przegląd',
              ],
              'Wybór dostawcy',
              [
                'Dokumentacja',
                'Dostępni',
                'Niedostępny',
                'Stany',
              ],
              'Komunikaty',
              [
                'Dokumentacja',
                'Warianty',
                'Walidacja',
                'Bez ikony',
                'Z akcją',
                'Długa treść',
              ],
            ],
            '03 Wzorce',
            [
              'Zestawy ekranowe',
              [
                'Dostęp do konta',
                'Dashboard',
                'Konfiguracja przestrzeni roboczej',
              ],
              'Formularz logowania',
              'Formularz kodu jednorazowego',
              'Wybór kontekstu',
              'Wybór dostawcy',
              'Potwierdzenie operacji',
              'Pusty stan',
              'Stan błędu',
              'Stan braku dostępu',
              'Scenariusze operacyjne',
              [
                'Przejścia dostępu',
                'Wybór kontekstu',
                'Błędy dostępu',
                'Bezpieczeństwo i uprawnienia',
              ],
            ],
            '04 Ekrany docelowe',
            [
              'Dostęp do konta',
              [
                'Logowanie',
                'Rejestracja',
                'Weryfikacja adresu e-mail',
                'MFA',
                'Odzyskiwanie hasła',
                'Reset hasła',
                'Zaproszenie',
                'Zarządzanie sesjami',
                'Stany dostępu',
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
                [
                  'Przegląd',
                ],
                'Wykresy i tabele',
                [
                  'Przegląd',
                  'Wykresy',
                  'Tabele',
                ],
                'Stany danych',
                [
                  'Brak danych',
                  'Ładowanie',
                  'Błąd',
                ],
                'Jakość i świeżość danych',
                [
                  'Nieaktualne dane',
                ],
              ],
              'Jakość danych i integralność',
              [
                'Gotowy dataset',
                'Brak danych',
                'Częściowy dataset',
                'Dataset nieprawidłowy',
                'Dataset zablokowany',
                'Reprocess',
                'Reconciliation',
              ],
              'Analytics Platform i Customer Workspace',
              [
                'Domyślny',
                'Loading',
                'Empty confirmed',
                'Missing data',
                'Partial',
                'Invalid',
                'Zamówienia',
                'D2C',
                'Data Trust',
                'Alerty',
                'Zadania',
              ],
              'Insights, decyzje i AI',
              [
                'Domyślny',
                'Asystent gotowa odpowiedź',
                'Asystent partial',
                'Asystent injection blocked',
                'Laboratorium answered',
                'Rekomendacja accepted',
                'Action success',
                'Provenance complete evidence',
                'AI settings',
                'AI history',
                'AI governance',
              ],
            ],

            '05 Diagnostyka deweloperska',
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
      test: 'todo',
    },
  },
};

export default preview;
