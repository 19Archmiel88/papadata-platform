import {
  Mail,
  Search,
} from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  EmptyState,
  ErrorState,
  InlineNotice,
  LoadingState,
  PageHeader,
  PasswordField,
  ProviderButton,
  StatusBadge,
  Surface,
  TextField,
  ValidationMessage,
  VerificationCodeInput,
} from '../../../design-system';
import {
  ComponentShowcase,
  ComponentSpecRow,
} from './ComponentCanvas';

function CodeExample({
  disabled = false,
  initialValue = '',
  invalid = false,
  label,
}: {
  disabled?: boolean;
  initialValue?: string;
  invalid?: boolean;
  label: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="pds-doc-control pds-doc-control--code">
      <VerificationCodeInput
        disabled={disabled}
        errorMessage={invalid ? 'Kod jest nieprawidłowy.' : undefined}
        hint={invalid ? undefined : 'Wpisz dokładnie sześć cyfr.'}
        id={`code-${label.toLowerCase().replaceAll(' ', '-')}`}
        invalid={invalid}
        label={label}
        name={`code-${label.toLowerCase().replaceAll(' ', '-')}`}
        onChange={setValue}
        value={value}
      />
    </div>
  );
}

export function FormFieldBasicDemo() {
  return (
    <div className="pds-story-basic">
      <div className="pds-doc-control">
        <TextField
          helper="Użyj adresu przypisanego do organizacji."
          icon={<Mail aria-hidden="true" size={18} />}
          label="Adres e-mail"
          placeholder="anna@firma.pl"
          type="email"
        />
      </div>
    </div>
  );
}

export function FormFieldTypesDemo() {
  return (
    <ComponentShowcase
      description="Typ pola wynika z rodzaju danych, a nie z wyglądu ekranu."
      title="Typy pól formularzy"
    >
      <ComponentSpecRow
        description="Adres użytkownika albo kontakt organizacji."
        label="E-mail"
      >
        <div className="pds-doc-control">
          <TextField
            icon={<Mail aria-hidden="true" size={18} />}
            label="Adres e-mail"
            placeholder="anna@firma.pl"
            type="email"
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Krótka nazwa identyfikująca obiekt."
        label="Tekst"
      >
        <div className="pds-doc-control">
          <TextField
            label="Nazwa workspace"
            placeholder="Northstar Commerce"
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Wyszukiwanie danych w bieżącym kontekście."
        label="Wyszukiwanie"
      >
        <div className="pds-doc-control">
          <TextField
            icon={<Search aria-hidden="true" size={18} />}
            label="Wyszukaj"
            placeholder="Produkt, klient albo zamówienie"
            type="search"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function FormFieldStatesDemo() {
  return (
    <ComponentShowcase
      description="Stan pola pozostaje widoczny niezależnie od wartości."
      title="Stany pola"
    >
      <ComponentSpecRow
        description="Pole gotowe do wprowadzenia danych."
        label="Puste"
      >
        <div className="pds-doc-control">
          <TextField label="Nazwa firmy" placeholder="Wpisz nazwę" />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Pole zawiera zapisaną albo wprowadzoną wartość."
        label="Uzupełnione"
      >
        <div className="pds-doc-control">
          <TextField
            defaultValue="Northstar Commerce"
            label="Nazwa firmy"
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Wartość jest widoczna, ale nie może zostać zmieniona."
        label="Tylko odczyt"
      >
        <div className="pds-doc-control">
          <TextField
            defaultValue="PL1234567890"
            label="NIP"
            readOnly
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Pole jest chwilowo niedostępne."
        label="Nieaktywne"
      >
        <div className="pds-doc-control">
          <TextField
            disabled
            label="Domena"
            placeholder="firma.pl"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function FormFieldValidationDemo() {
  return (
    <ComponentShowcase
      description="Komunikat wskazuje problem oraz sposób jego rozwiązania."
      title="Walidacja"
    >
      <ComponentSpecRow
        description="Wartość nie spełnia kontraktu pola."
        label="Błąd"
      >
        <div className="pds-doc-control">
          <TextField
            defaultValue="anna@"
            invalid
            label="Adres e-mail"
            validationMessage="Wprowadź pełny adres e-mail."
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Wskazówka wyjaśnia oczekiwany format przed błędem."
        label="Wskazówka"
      >
        <div className="pds-doc-control">
          <TextField
            helper="Użyj domeny należącej do organizacji."
            label="Domena"
            placeholder="firma.pl"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function PasswordBasicDemo() {
  return (
    <div className="pds-story-basic">
      <div className="pds-doc-control">
        <PasswordField
          autoComplete="current-password"
          label="Hasło"
        />
      </div>
    </div>
  );
}

export function PasswordVisibilityDemo() {
  return (
    <ComponentShowcase
      description="Przełącznik zmienia prezentację wartości bez zmiany danych."
      title="Widoczność hasła"
    >
      <ComponentSpecRow
        description="Domyślny stan chroniący wprowadzoną wartość."
        label="Ukryte"
      >
        <div className="pds-doc-control">
          <PasswordField
            defaultValue="BezpieczneHasło2026"
            label="Hasło"
            visible={false}
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Stan dostępny po świadomej akcji użytkownika."
        label="Widoczne"
      >
        <div className="pds-doc-control">
          <PasswordField
            defaultValue="BezpieczneHasło2026"
            label="Hasło"
            visible
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function PasswordValidationDemo() {
  return (
    <ComponentShowcase
      description="Błąd nie może być przekazywany wyłącznie kolorem obramowania."
      title="Walidacja hasła"
    >
      <ComponentSpecRow
        description="Hasło nie spełnia aktualnej polityki workspace."
        label="Błąd"
      >
        <div className="pds-doc-control">
          <PasswordField
            defaultValue="hasło"
            invalid
            label="Nowe hasło"
            validationMessage="Hasło musi zawierać co najmniej 12 znaków."
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Wymaganie pokazane przed wysłaniem formularza."
        label="Wskazówka"
      >
        <div className="pds-doc-control">
          <PasswordField
            helper="Minimum 12 znaków, cyfra i znak specjalny."
            label="Nowe hasło"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function PasswordStatesDemo() {
  return (
    <ComponentShowcase
      description="Pole hasła korzysta z tych samych stanów co pozostałe kontrolki."
      title="Stany pola hasła"
    >
      <ComponentSpecRow
        description="Pole gotowe do wprowadzenia wartości."
        label="Domyślne"
      >
        <div className="pds-doc-control">
          <PasswordField label="Hasło" />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Wartość została uzupełniona."
        label="Uzupełnione"
      >
        <div className="pds-doc-control">
          <PasswordField
            defaultValue="BezpieczneHasło2026"
            label="Hasło"
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Pole i przełącznik widoczności są zablokowane."
        label="Nieaktywne"
      >
        <div className="pds-doc-control">
          <PasswordField disabled label="Hasło" />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function CodeBasicDemo() {
  return (
    <div className="pds-story-basic">
      <CodeExample label="Kod bezpieczeństwa" />
    </div>
  );
}

export function CodeCompleteDemo() {
  return (
    <div className="pds-story-basic">
      <CodeExample
        initialValue="123456"
        label="Kod bezpieczeństwa"
      />
    </div>
  );
}

export function CodeErrorDemo() {
  return (
    <div className="pds-story-basic">
      <CodeExample
        initialValue="123456"
        invalid
        label="Kod bezpieczeństwa"
      />
    </div>
  );
}

export function CodeDisabledDemo() {
  return (
    <div className="pds-story-basic">
      <CodeExample
        disabled
        initialValue="123"
        label="Kod bezpieczeństwa"
      />
    </div>
  );
}

export function StatusVariantsDemo() {
  return (
    <ComponentShowcase
      description="Każdy status zawiera ikonę i etykietę tekstową."
      title="Warianty statusów"
    >
      <ComponentSpecRow
        description="Stany pozytywne i zakończone."
        label="Pozytywne"
        wide
      >
        <div className="pds-doc-status-wrap">
          <StatusBadge status="active" />
          <StatusBadge status="ready" />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Operacja oczekuje albo nadal trwa."
        label="Proces"
        wide
      >
        <div className="pds-doc-status-wrap">
          <StatusBadge status="pending" />
          <StatusBadge status="inProgress" />
          <StatusBadge status="delayed" />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Stan wymaga uwagi albo interwencji."
        label="Problemy"
        wide
      >
        <div className="pds-doc-status-wrap">
          <StatusBadge status="warning" />
          <StatusBadge status="error" />
          <StatusBadge status="blocked" />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Obiekt jest nieaktywny albo nie ma danych."
        label="Neutralne"
        wide
      >
        <div className="pds-doc-status-wrap">
          <StatusBadge status="inactive" />
          <StatusBadge status="noData" />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function StatusLabelsDemo() {
  return (
    <ComponentShowcase
      description="Etykietę można doprecyzować bez zmiany semantycznego statusu."
      title="Etykiety statusów"
    >
      <ComponentSpecRow
        description="Status gotowości źródła danych."
        label="Źródło"
      >
        <StatusBadge label="gotowe do analizy" status="ready" />
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Status aktywnie wykonywanej synchronizacji."
        label="Synchronizacja"
      >
        <StatusBadge label="pobieranie danych" status="inProgress" />
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Status wymagający ponownego uwierzytelnienia."
        label="Integracja"
      >
        <StatusBadge label="wymaga połączenia" status="warning" />
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function StatusContextDemo() {
  return (
    <ComponentShowcase
      description="Odznaka uzupełnia nazwę obiektu, ale jej nie zastępuje."
      title="Statusy w kontekście"
    >
      <ComponentSpecRow
        description="Stan połączenia źródła sprzedażowego."
        label="Shopify"
      >
        <StatusBadge status="active" />
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Stan przygotowania danych reklamowych."
        label="Google Ads"
      >
        <StatusBadge status="delayed" />
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Stan źródła bez dostępnych rekordów."
        label="Microsoft Ads"
      >
        <StatusBadge status="noData" />
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function HeadingPageDemo() {
  return (
    <ComponentShowcase
      description="Nagłówek pierwszego poziomu identyfikuje cały widok."
      title="Nagłówek strony"
    >
      <ComponentSpecRow
        description="Tytuł, kontekst i krótki opis bieżącego widoku."
        label="Strona"
        wide
      >
        <div className="pds-doc-heading">
          <PageHeader
            eyebrow="Integracje"
            text="Zarządzaj źródłami danych połączonymi z workspace."
            title="Źródła danych"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function HeadingSectionDemo() {
  return (
    <ComponentShowcase
      description="Nagłówek drugiego poziomu rozpoczyna część bieżącego widoku."
      title="Nagłówek sekcji"
    >
      <ComponentSpecRow
        description="Sekcja pozostaje podrzędna względem tytułu strony."
        label="Sekcja"
        wide
      >
        <div className="pds-doc-heading">
          <PageHeader
            heading="h2"
            text="Dane wykorzystywane w bieżącym zestawieniu."
            title="Aktywne źródła"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function HeadingActionsDemo() {
  return (
    <ComponentShowcase
      description="Działanie pozostaje powiązane z nagłówkiem, którego dotyczy."
      title="Nagłówek z akcją"
    >
      <ComponentSpecRow
        description="Jedna akcja główna dla bieżącego zakresu."
        label="Z działaniem"
        wide
      >
        <div className="pds-doc-heading">
          <PageHeader
            text="Połącz i skonfiguruj kolejne źródło."
            title="Integracje"
          >
            <div className="pds-doc-heading__actions">
              <Button variant="primary">Dodaj integrację</Button>
            </div>
          </PageHeader>
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function HeadingLongDemo() {
  return (
    <ComponentShowcase
      description="Długi tekst łamie się bez utraty hierarchii i czytelności."
      title="Długi nagłówek"
    >
      <ComponentSpecRow
        description="Przykład dla ograniczonej szerokości treści."
        label="Długi tekst"
        wide
      >
        <div className="pds-doc-heading pds-doc-heading--narrow">
          <PageHeader
            eyebrow="Bezpieczeństwo"
            text="Potwierdzenie jest wymagane przed wykonaniem operacji zmieniającej dostęp członków organizacji."
            title="Potwierdź zmianę uprawnień dla wybranego workspace"
          />
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function SurfaceVariantsDemo() {
  return (
    <ComponentShowcase
      description="Wariant powierzchni wynika z roli treści w układzie."
      title="Warianty powierzchni"
    >
      <ComponentSpecRow
        description="Standardowe wydzielenie samodzielnego obszaru."
        label="Domyślna"
        wide
      >
        <Surface className="pds-doc-surface">
          <strong>Podsumowanie sprzedaży</strong>
          <p>Dane dla ostatnich 30 dni.</p>
        </Surface>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Delikatne rozróżnienie treści pomocniczej."
        label="Subtelna"
        wide
      >
        <Surface className="pds-doc-surface" variant="subtle">
          <strong>Jakość danych</strong>
          <p>Jedno źródło wymaga uzupełnienia.</p>
        </Surface>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Struktura bez dodatkowego tła."
        label="Bez tła"
        wide
      >
        <Surface className="pds-doc-surface" variant="plain">
          <strong>Aktywne filtry</strong>
          <p>Zakres: Polska, ostatnie 30 dni.</p>
        </Surface>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function SurfaceCardsDemo() {
  return (
    <ComponentShowcase
      description="Karta grupuje informacje należące do jednego obiektu."
      title="Karty danych"
    >
      <ComponentSpecRow
        description="Karta źródła danych z bieżącym statusem."
        label="Integracja"
        wide
      >
        <Surface className="pds-doc-surface">
          <div className="pds-doc-surface__head">
            <strong>Shopify</strong>
            <StatusBadge status="ready" />
          </div>
          <p>Ostatnia synchronizacja: 8 minut temu.</p>
        </Surface>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Karta informująca o niepełnym zakresie."
        label="Ostrzeżenie"
        wide
      >
        <Surface className="pds-doc-surface" variant="subtle">
          <div className="pds-doc-surface__head">
            <strong>Google Ads</strong>
            <StatusBadge status="warning" />
          </div>
          <p>Brakuje danych z jednego konta reklamowego.</p>
        </Surface>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function SurfaceActionDemo() {
  return (
    <ComponentShowcase
      description="Akcje są osadzone w treści powierzchni, której dotyczą."
      title="Powierzchnia z akcją"
    >
      <ComponentSpecRow
        description="Działanie uzupełniające stan obiektu."
        label="Z akcją"
        wide
      >
        <Surface className="pds-doc-surface">
          <div className="pds-doc-surface__head">
            <strong>Allegro</strong>
            <StatusBadge status="inactive" />
          </div>
          <p>Połącz konto, aby rozpocząć import danych sprzedażowych.</p>
          <div className="pds-doc-surface__actions">
            <Button variant="secondary">Połącz konto</Button>
          </div>
        </Surface>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function SurfaceStatusDemo() {
  return (
    <ComponentShowcase
      description="Status jest częścią treści, a nie dekoracją powierzchni."
      title="Statusy powierzchni"
    >
      <ComponentSpecRow
        description="Powierzchnia dla ukończonego procesu."
        label="Gotowa"
        wide
      >
        <Surface className="pds-doc-surface">
          <StatusBadge status="ready" />
          <strong>Dashboard gotowy</strong>
          <p>Wszystkie wymagane dane zostały przygotowane.</p>
        </Surface>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Powierzchnia wymagająca interwencji."
        label="Problem"
        wide
      >
        <Surface className="pds-doc-surface">
          <StatusBadge status="error" />
          <strong>Synchronizacja przerwana</strong>
          <p>Ponów połączenie z dostawcą danych.</p>
        </Surface>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function LoadingOnlyDemo() {
  return (
    <div className="pds-story-basic">
      <LoadingState
        text="Sprawdzamy gotowość danych dla wybranego workspace."
        title="Trwa sprawdzanie"
      />
    </div>
  );
}

export function EmptyOnlyDemo() {
  return (
    <div className="pds-story-basic">
      <EmptyState
        action={<Button variant="primary">Połącz źródło</Button>}
        text="Po połączeniu źródła pokażemy pierwsze KPI."
        title="Brak danych"
      />
    </div>
  );
}

export function ErrorOnlyDemo() {
  return (
    <div className="pds-story-basic">
      <ErrorState
        action={<Button variant="secondary">Spróbuj ponownie</Button>}
        text="Synchronizacja nie zakończyła się powodzeniem."
        title="Nie udało się pobrać danych"
      />
    </div>
  );
}

export function StateOverviewDemo() {
  return (
    <ComponentShowcase
      description="Stany systemowe korzystają ze wspólnej hierarchii treści."
      title="Stany systemowe"
    >
      <ComponentSpecRow
        description="System wykonuje operację i oczekuje na wynik."
        label="Ładowanie"
        wide
      >
        <LoadingState
          text="Sprawdzamy gotowość danych."
          title="Trwa sprawdzanie"
        />
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Brak danych jest oczekiwanym stanem produktu."
        label="Brak danych"
        wide
      >
        <EmptyState
          text="Połącz pierwsze źródło, aby rozpocząć."
          title="Brak źródeł"
        />
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Operacja zakończyła się niepowodzeniem."
        label="Błąd"
        wide
      >
        <ErrorState
          action={<Button variant="secondary">Ponów próbę</Button>}
          text="Nie udało się pobrać aktualnych danych."
          title="Błąd synchronizacji"
        />
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function ProviderAvailableDemo() {
  return (
    <ComponentShowcase
      description="Dostawcy korzystają z jednego kontraktu komponentu."
      title="Dostępni dostawcy"
    >
      <ComponentSpecRow
        description="Autoryzacja przez konto Google."
        label="Google"
      >
        <ProviderButton provider="google">
          Kontynuuj z Google
        </ProviderButton>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Autoryzacja przez konto Microsoft."
        label="Microsoft"
      >
        <ProviderButton provider="microsoft">
          Kontynuuj z Microsoft
        </ProviderButton>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function ProviderUnavailableDemo() {
  return (
    <div className="pds-story-basic">
      <ProviderButton
        disabled
        provider="microsoft"
        unavailable
      >
        Microsoft chwilowo niedostępny
      </ProviderButton>
    </div>
  );
}

export function ProviderStatesDemo() {
  return (
    <ComponentShowcase
      description="Dostępność usługi i interakcja są przekazywane oddzielnie."
      title="Stany dostawcy"
    >
      <ComponentSpecRow
        description="Dostawca jest gotowy do rozpoczęcia autoryzacji."
        label="Dostępny"
      >
        <ProviderButton provider="google">
          Google
        </ProviderButton>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Widoczny focus podczas obsługi klawiaturą."
        label="Focus"
      >
        <ProviderButton
          className="pds-story-forced-focus"
          provider="microsoft"
        >
          Microsoft
        </ProviderButton>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Usługa nie może zostać aktualnie użyta."
        label="Niedostępny"
      >
        <ProviderButton
          disabled
          provider="google"
          unavailable
        >
          Google
        </ProviderButton>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function MessageVariantsDemo() {
  return (
    <ComponentShowcase
      description="Ton komunikatu wynika z znaczenia informacji i wymaganej reakcji."
      title="Warianty komunikatów"
    >
      <ComponentSpecRow
        description="Neutralna informacja o bieżącym procesie."
        label="Informacja"
        wide
      >
        <div className="pds-doc-message">
          <InlineNotice title="Dane są sprawdzane" tone="info">
            KPI pojawią się po zakończeniu oceny gotowości.
          </InlineNotice>
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Potwierdzenie zakończonej operacji."
        label="Sukces"
        wide
      >
        <div className="pds-doc-message">
          <InlineNotice title="Kod potwierdzony" tone="success">
            Proces może bezpiecznie przejść dalej.
          </InlineNotice>
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Informacja wymagająca uwagi użytkownika."
        label="Ostrzeżenie"
        wide
      >
        <div className="pds-doc-message">
          <InlineNotice title="Dane są częściowe" tone="warning">
            Brak jednego źródła wpływa na interpretację wyniku.
          </InlineNotice>
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Operacja zakończyła się niepowodzeniem."
        label="Błąd"
        wide
      >
        <div className="pds-doc-message">
          <InlineNotice
            title="Nie udało się zsynchronizować danych"
            tone="error"
          >
            Możesz bezpiecznie ponowić próbę.
          </InlineNotice>
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Komunikat bez podwyższonej semantyki."
        label="Neutralny"
        wide
      >
        <div className="pds-doc-message">
          <InlineNotice title="Zakres raportu" tone="neutral">
            Raport obejmuje ostatnie 30 dni.
          </InlineNotice>
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function MessageValidationDemo() {
  return (
    <ComponentShowcase
      description="Komunikat walidacji pozostaje bezpośrednio związany z polem."
      title="Walidacja formularza"
    >
      <ComponentSpecRow
        description="Błąd jest przekazywany przez komponent pola."
        label="Pole"
        wide
      >
        <div className="pds-doc-control">
          <TextField
            defaultValue="anna@"
            invalid
            label="Adres e-mail"
            validationMessage="Wprowadź pełny adres e-mail."
          />
        </div>
      </ComponentSpecRow>

      <ComponentSpecRow
        description="Samodzielny komunikat dla złożonej walidacji."
        label="Komunikat"
        wide
      >
        <ValidationMessage tone="error">
          Kod wygasł. Wyślij nowy kod, aby kontynuować.
        </ValidationMessage>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function MessageNoIconDemo() {
  return (
    <div className="pds-story-basic">
      <div className="pds-doc-message">
        <InlineNotice icon={false} tone="info">
          Kod został wysłany na podany adres e-mail.
        </InlineNotice>
      </div>
    </div>
  );
}

export function MessageActionDemo() {
  return (
    <ComponentShowcase
      description="Komunikat jest osadzony w procesie, którego dotyczy."
      title="Komunikat z akcją"
    >
      <ComponentSpecRow
        description="Ostrzeżenie poprzedza decyzję użytkownika."
        label="Formularz"
        wide
      >
        <div className="pds-doc-inline-form">
          <TextField
            defaultValue="Northstar Commerce"
            label="Workspace"
          />
          <InlineNotice tone="warning">
            Konfiguracja wymaga potwierdzenia administratora.
          </InlineNotice>
          <div>
            <Button variant="primary">Kontynuuj</Button>
          </div>
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}

export function MessageLongDemo() {
  return (
    <ComponentShowcase
      description="Treść może się łamać, ale pozostaje krótka i operacyjna."
      title="Długa treść"
    >
      <ComponentSpecRow
        description="Komunikat wyjaśnia wpływ problemu na dane."
        label="Ostrzeżenie"
        wide
      >
        <div className="pds-doc-message">
          <InlineNotice title="Niepełny zakres danych" tone="warning">
            Brak części danych reklamowych wpływa na interpretację
            marży, ale nie blokuje przeglądania zamówień i produktów
            z pozostałych gotowych źródeł.
          </InlineNotice>
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  );
}
