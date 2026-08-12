---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-001
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Regulamin świadczenia usług SaaS PapaData

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## §1. Usługodawca i kontakt

1. Usługodawcą jest `[PEŁNA NAZWA SPÓŁKI]`, `[FORMA PRAWNA]`, z siedzibą w `[ADRES]`, wpisana do `[REJESTR]` pod numerem `[KRS/CEIDG]`, NIP `[NIP]`, REGON `[REGON]`.
2. Kontakt operacyjny: `[EMAIL SUPPORT]`; kontakt prawny: `[EMAIL LEGAL]`; kontakt bezpieczeństwa: `[EMAIL SECURITY]`.
3. Regulamin jest udostępniany nieodpłatnie przed zawarciem umowy w formie umożliwiającej zapis i odtworzenie.

## §2. Definicje

`PapaData` oznacza platformę webową, aplikację mobilną, API, moduły AI i usługi towarzyszące. `Klient` oznacza podmiot zawierający umowę. `Użytkownik` oznacza osobę działającą w ramach tenanta Klienta. `Tenant` jest granicą organizacyjną i danych. `Workspace` jest wydzielonym obszarem pracy. `Integracja` oznacza połączenie z zewnętrznym providerem. `AI Action` oznacza proponowane przez AI działanie wymagające akceptacji człowieka. `Plan` oznacza wariant usługi opisany w cenniku lub Order Form.

## §3. Zakres usługi

1. PapaData udostępnia całą funkcjonalność MVP opisaną w `24-opis-uslugi-mvp.md`: analitykę, dashboardy, raporty, integracje, Papa Asystenta, Laboratorium AI, billing, ustawienia, bezpieczeństwo i aplikację mobilną.
2. MVP ogranicza wyłącznie katalog aktywnych integracji do siedmiu providerów wskazanych w opisie usługi. Ograniczenie nie oznacza atrap ani niekompletnych procesów.
3. Szczegółowy zakres, limity, SLA, cena i okres umowy wynikają z Planu lub Order Form. W razie konfliktu pierwszeństwo ma podpisany Order Form, następnie DPA/SLA, Regulamin i dokumentacja funkcjonalna — z zastrzeżeniem bezwzględnie obowiązującego prawa.

## §4. Wymagania techniczne

Do korzystania potrzebne są: aktualna wspierana przeglądarka, połączenie z Internetem, aktywny adres e-mail i urządzenie spełniające wymagania bezpieczeństwa. Funkcje mobilne wymagają wspieranej wersji iOS lub Androida. Integracje wymagają uprawnień i kont u providerów zewnętrznych. Klient odpowiada za legalność pozyskania i udostępnienia danych oraz za konfigurację własnych kont zewnętrznych.

## §5. Rejestracja, tenant i role

1. Konto powstaje po rejestracji, zaproszeniu lub zawarciu umowy. Dane firmy mogą zostać pobrane z GUS/BIR i poprawione przez uprawnioną osobę; źródłowa odpowiedź rejestru jest zachowywana.
2. Owner zarządza tenantem, członkami, billingiem, dostępem mobilnym i kluczowymi ustawieniami. Uprawnienia są egzekwowane po stronie backendu.
3. Klient zapewnia aktualność kont, nieudostępnianie poświadczeń, MFA tam, gdzie wymagane, oraz niezwłoczne zgłaszanie podejrzenia naruszenia.

## §6. Zawarcie i czas trwania umowy

1. Umowa zostaje zawarta po akceptacji wymaganych dokumentów i potwierdzeniu zamówienia lub podpisaniu Order Form.
2. Dostępny jest cykl miesięczny i roczny. Jeżeli wybrano automatyczne odnowienie, informacja o nim, terminie i sposobie rezygnacji jest prezentowana przed zakupem.
3. Wariant dla konsumenta lub przedsiębiorcy na prawach konsumenta wymaga dodatkowych informacji i obsługi odstąpienia zgodnie z dokumentem `12-reklamacje-zwroty-odstapienie.md`.

## §7. Zasady korzystania

Klient i Użytkownik nie mogą: naruszać prawa lub praw osób trzecich, wprowadzać złośliwego kodu, obchodzić limitów i zabezpieczeń, prowadzić nieautoryzowanych testów, pozyskiwać danych innych tenantów, używać platformy do dyskryminacyjnego lub zakazanego profilowania ani zlecać AI działań bez uprawnienia. Szczegóły zawiera AUP.

## §8. Dane Klienta i integracje

1. Klient zachowuje prawa do swoich danych. Udziela PapaData upoważnienia niezbędnego do świadczenia usługi, wykonywania synchronizacji, obliczeń, raportów, kopii bezpieczeństwa i wsparcia.
2. Zakresy dostępu integracji są minimalizowane. Odłączenie integracji nie musi usuwać danych historycznych, jeśli ich retencja wynika z umowy, prawa lub ustawień Klienta.
3. Dane zewnętrznych providerów podlegają także ich warunkom. PapaData nie gwarantuje nieprzerwanej dostępności API providera, ale realizuje retry, monitoring i recovery przewidziane w dokumentacji.

## §9. AI i działania na systemach zewnętrznych

1. Wyniki AI są wsparciem analitycznym, mogą zawierać ograniczenia i nie stanowią porady prawnej, podatkowej ani inwestycyjnej.
2. AI nie wykonuje istotnej zmiany finansowej, operacyjnej, prawnej lub dostępowej bez jawnej akceptacji uprawnionego człowieka.
3. Przed wykonaniem użytkownik widzi proponowaną zmianę, źródła, ograniczenia, symulację skutku i ostrzeżenia. System zapisuje kto, kiedy i co zaakceptował. Szczegóły zawierają Warunki AI.

## §10. Opłaty, faktury i podatki

Zasady cen, podatków, odnowień, metod płatności, dunningu, zwrotów, faktur i KSeF określa dokument `02-warunki-subskrypcji-platnosci-odnowien.md` oraz Order Form. Ceny są `[NETTO/BRUTTO]`; właściwy VAT jest obliczany na podstawie statusu i miejsca Klienta.

## §11. Dostępność, utrzymanie i zmiany

PapaData utrzymuje usługę zgodnie z SLA właściwym dla Planu. Zaplanowane prace są komunikowane. Funkcje mogą być zmieniane, jeśli nie prowadzi to do istotnego obniżenia zakupionego zakresu bez podstawy umownej. Zmiany bezpieczeństwa i zgodności mogą wejść szybciej, jeśli są konieczne do ochrony usługi.

## §12. Wsparcie i reklamacje

Zgłoszenia przyjmowane są przez `[KANAŁY]`. Reklamacja zawiera dane Klienta, opis, czas, tenant/workspace i oczekiwane rozwiązanie. Termin odpowiedzi: `[TERMIN]`, z uwzględnieniem obowiązków ustawowych. Incydenty bezpieczeństwa mają osobny kanał.

## §13. Zawieszenie i rozwiązanie

Dostęp może zostać ograniczony w razie zaległości, zagrożenia bezpieczeństwa, naruszenia AUP lub wymogu prawnego, w zakresie proporcjonalnym do ryzyka. O ile sytuacja na to pozwala, Klient otrzymuje informację i możliwość naprawy. Po rozwiązaniu następuje okno eksportu `[LICZBA DNI]`, a następnie usunięcie zgodnie z retencją i DPA.

## §14. Odpowiedzialność

Strony odpowiadają na zasadach określonych w prawie i Order Form. Ograniczenia odpowiedzialności nie dotyczą przypadków, których nie można wyłączyć, w szczególności umyślnego działania oraz obowiązków ochrony danych w zakresie wynikającym z prawa. Limity, wyłączenia szkód pośrednich i zasady dla providerów zewnętrznych należy uzupełnić: `[MODEL ODPOWIEDZIALNOŚCI]`.

## §15. Poufność i własność intelektualna

Kod, marka i dokumentacja PapaData pozostają własnością `[SPÓŁKA]` lub licencjodawców. Klient otrzymuje niewyłączną, niezbywalną licencję na korzystanie przez czas umowy. Informacje poufne są chronione i mogą być ujawniane tylko osobom upoważnionym lub gdy wymaga tego prawo.

## §16. Prywatność i bezpieczeństwo

Role administratora i procesora określają Polityka prywatności i DPA. Środki techniczne i organizacyjne opisuje Security/TOM Addendum. Lista podprocesorów i mechanizm sprzeciwu są publikowane oddzielnie.

## §17. Zmiany Regulaminu

Zmiana otrzymuje nową wersję, opis wpływu i datę wejścia. O istotnej zmianie Klient jest informowany z wyprzedzeniem `[OKRES]`. Jeśli prawo lub umowa wymagają zgody, dalsze korzystanie nie zastępuje jej — system pobiera jawną akceptację.

## §18. Prawo właściwe i spory

Prawo właściwe: `[PRAWO POLSKIE / INNE]`. Sąd właściwy: `[SĄD]`, z zachowaniem praw konsumenta, jeśli mają zastosowanie. Strony w pierwszej kolejności podejmują próbę rozwiązania sporu przez eskalację operacyjną i negocjacje.

## §19. Wersja i wejście w życie

Wersja `[X.Y]`, opublikowana `[DATA]`, obowiązuje od `[DATA]`. Historia zmian i poprzednie wersje są dostępne pod `[URL]`.
