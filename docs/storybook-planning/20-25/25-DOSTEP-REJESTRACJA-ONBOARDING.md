# 25 - Dostęp, rejestracja i onboarding - M01

## Rola sekcji

Sekcja `25` jest pierwszym pełnym modułem ekranowym. Jest właścicielem rzeczywistych powierzchni Auth/Access i onboardingu, ale nie jest właścicielem bazowych komponentów formularzowych, publicznego topbara ani samego canvasu Auth.

Kluczowa reguła: **05.01 pokazuje decyzję o powierzchni Auth; 25 pokazuje prawdziwy proces Auth.**

Storybook `25` powinien opierać się na istniejącym FSM `auth-01...auth-29` i jego operation IDs. Nie należy budować nowego uproszczonego flow tylko dla Storybooka.

## 25.01 - Wejście do Auth

### Główny mapping FSM

- `auth-01` - Wejście do Auth / `access.resolve`;
- jako wynik: normalne logowanie, rejestracja albo zaproszenie;
- error boundary może reprezentować `auth-27` bez kopiowania pełnego ekranu awarii.

### Pokazuje

- neutralne publiczne wejście;
- rozpoznanie invite/session/normal entry;
- stan resolving;
- normal entry;
- invite context;
- expired/invalid public context;
- service unavailable jako stan wejścia.

### Nie pokazuje

Pełnego formularza logowania. Ten należy do `25.02`.

---

## 25.02 - Logowanie

### Mapping FSM

- `auth-02` - Logowanie / `auth.login`;
- sukces do `auth-16` albo `auth-29`;
- błędy/policy block do `auth-28`.

### Pokazuje

- ready;
- validation error;
- submitting;
- invalid credentials jako neutralny błąd;
- rate limited;
- blocked/policy state;
- przejście do recovery;
- przejście do registration;
- successful transition target bez udawania docelowego ekranu.

### Konsumuje

`TextField`, `PasswordField`, `Checkbox`, `Button/TextAction/LinkAction`, `InlineNotice`, Auth surface i `20.02 Public Topbar`.

---

## 25.03 - Rejestracja

### Mapping FSM

Rekomendowany agregat story obejmuje:

- `auth-03` - wybór metody;
- `auth-04` - rejestracja e-mail;
- `auth-05` - OAuth start;
- `auth-12` - zgody;
- `auth-13` - finalizacja rejestracji;
- `auth-14` - registration completed / bootstrap.

### Pokazuje

- wybór email/OAuth;
- formularz e-mail;
- validation;
- zgody wymagane/optional zgodnie z kontraktem;
- processing/finalizing;
- registration completed;
- invite context preserved, jeśli rejestracja została rozpoczęta z zaproszenia.

### Nie pokazuje

Identyfikacji firmy - to `25.06`.

---

## 25.04 - Zaproszenie

### Mapping FSM

- `auth-15` - review/accept invitation / `invitation.validate`.

### Pokazuje

- valid invite;
- existing account;
- new account;
- already member / no-action case;
- expired/invalid invite;
- recipient mismatch / blocked;
- przejście do login, registration albo access resolution.

### Granica ownership

Public topbar pozostaje z `20.02`. Story jest właścicielem treści i decyzji procesu zaproszenia.

---

## 25.05 - Weryfikacja e-mail

### Mapping FSM

- `auth-06` - email verification / `auth.email.verify`.

### Pokazuje

- verifying;
- success;
- invalid token;
- expired token;
- already verified;
- resend tylko wtedy, gdy istnieje rzeczywisty operation contract dla resend;
- dalszy krok zgodny z FSM.

Nie dodawać fikcyjnej akcji resend tylko dlatego, że UI wygląda pełniej.

---

## 25.06 - Identyfikacja firmy

### Mapping FSM

- `auth-07` - company lookup;
- `auth-08` - wybór kandydata;
- `auth-09` - potwierdzenie danych;
- `auth-10` - ręczne dane firmy;
- `auth-11` - istniejąca firma / membership resolution.

### Wymagane przypadki

- NIP;
- wyszukiwanie;
- status źródła danych/provenance;
- candidate found;
- potwierdzenie;
- edycja;
- ręczne wprowadzenie;
- firma już istnieje;
- rejestr niedostępny;
- provider timeout/partial response bez utraty wcześniej wprowadzonych danych.

### Nie dubluje

`NipField`, `SearchField`, `Select`, `InlineNotice`. Są konsumowane jako istniejące komponenty.

---

## 25.07 - MFA

### Mapping FSM

- `auth-16` - weryfikacja MFA;
- `auth-17` - enrollment MFA.

### Pokazuje

- challenge ready;
- code entry;
- verifying;
- invalid code;
- remaining attempts / rate limited;
- enrollment required;
- recovery code handling tylko jeśli wspiera to kontrakt;
- success target.

### Ważne

Nie kopiować lokalnej demonstracji MFA z `05.01`. `05.01` jest tylko przykładem surface/state; `25.07` jest pełnym ownerem procesu MFA w UI.

---

## 25.08 - Odzyskiwanie dostępu

### Mapping FSM

- `auth-18` - request recovery;
- `auth-19` - token/link state;
- `auth-20` - new password.

### Pokazuje

- request form;
- neutral success message bez account enumeration;
- reset link validation;
- invalid/expired token;
- new password;
- processing;
- password reset success;
- return to login.

### Zakres

Story powinno rozdzielić trzy powierzchnie procesu, zamiast kompresować recovery do jednej przypadkowej karty.

---

## 25.09 - Rozwiązanie kontekstu dostępu

### Mapping FSM

- `auth-21` - resolve access context;
- `auth-22` - tenant selection;
- `auth-23` - workspace selection;
- `auth-24` - reauthentication/step-up;
- `auth-28` - access blocked;
- `auth-29` - enter application.

### Pokazuje

- single tenant/single workspace -> direct entry;
- tenant selection;
- workspace selection;
- brak członkostwa;
- brak dostępu;
- tenant disabled;
- workspace unavailable;
- reauthentication;
- step-up;
- wejście do `20.01 AppShell` po poprawnym resolution.

### Granica względem 20.06

`25.09` rozwiązuje **czy i gdzie użytkownik może wejść** podczas wejścia do aplikacji.

`20.06` przełącza workspace **po wejściu do działającego AppShella**.

---

## 25.10 - Onboarding

### Pokazuje

- centrum postępu;
- profil działalności;
- kartę pilotażu;
- completed step;
- active step;
- blocked step;
- requires customer action;
- link do integracji;
- link do pierwszego KPI;
- zaproszenie zespołu;
- resumed onboarding;
- partial completion;
- zakończenie i przejście do pierwszej wartości.

### Granica ownership

Onboarding może konsumować patterns z `18` i AppShell z `20`, ale nie powinien tworzyć własnego alternatywnego progress system, stepper, notices, buttons ani cards, jeśli odpowiednie komponenty już istnieją.

### Ważna decyzja architektoniczna

`25.10` jest pierwszą historią w tej sekcji, która po poprawnym bootstrapie może działać **wewnątrz AppShell**. Pozostałe powierzchnie Auth mogą pozostawać w publicznym Auth shellu.

---

# Pokrycie Auth FSM przez sekcję 25

| Story | Główne powierzchnie FSM |
| --- | --- |
| 25.01 | auth-01, stan graniczny auth-27 |
| 25.02 | auth-02, auth-28 jako wynik błędu/policy |
| 25.03 | auth-03, auth-04, auth-05, auth-12, auth-13, auth-14 |
| 25.04 | auth-15 |
| 25.05 | auth-06 |
| 25.06 | auth-07, auth-08, auth-09, auth-10, auth-11 |
| 25.07 | auth-16, auth-17 |
| 25.08 | auth-18, auth-19, auth-20 |
| 25.09 | auth-21, auth-22, auth-23, auth-24, auth-28, auth-29 |
| 25.10 | onboarding po bootstrapie; poza Auth FSM auth-01...auth-29 |

## Powierzchnie FSM wymagające osobnego pokrycia poza główną tabelą stories

- `auth-25` logout initiation;
- `auth-26` signed-out / return to login;
- `auth-27` auth service unavailable;
- `auth-28` access blocked.

Rekomendacja: nie tworzyć dodatkowych top-level stories tylko po to, aby domknąć numerację. Te powierzchnie powinny wystąpić jako jawne warianty w odpowiednich stories (`25.01`, `25.02`, `25.09`) oraz w testowej macierzy FSM. `auth-25/26` mogą być pokryte w flow shell/profile/logout, ponieważ nie są osobnym modułem biznesowym.

# Krytyczne ryzyka sekcji 25

1. Kopiowanie `05.01` zamiast implementacji pełnego FSM.
2. Lokalne wersje bazowych pól/akcji/notice.
3. Fikcyjne CTA bez operationId lub z wymyślonym backend behavior.
4. Mieszanie access-resolution (`25.09`) z workspace switcherem (`20.06`).
5. Przenoszenie polityki tenant/workspace do komponentów UI zamiast konsumowania domenowego kontraktu.
6. Jeden gigantyczny Auth story zamiast 10 czytelnych kontraktów powierzchni.
7. Resetowanie wpisanych danych przy zmianie theme/language/viewport albo przy przejściu pomiędzy pomocniczymi krokami.
