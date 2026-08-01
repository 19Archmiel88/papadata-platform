---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-006
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Lista podprocesorów i mechanizm zmian

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zasada

Rejestr obejmuje każdy podmiot, który przetwarza dane osobowe Klienta w imieniu PapaData. Nie obejmuje niezależnych administratorów, których rola jest wyraźnie opisana oddzielnie. Lista publiczna i wewnętrzna muszą być synchronizowane.

## 2. Rejestr do uzupełnienia

| Podmiot | Usługa | Kategorie danych | Osoby | Region przechowywania | Dostęp spoza EOG | Mechanizm transferu | Link privacy/security | Data dodania |
|---|---|---|---|---|---|---|---|---|
| Google Cloud `[ENTITY]` | hosting / managed services | `[ZAKRES]` | użytkownicy i dane Klienta | `[REGION]` | `[TAK/NIE]` | `[ADEQUACY/SCC]` | `[URL]` | `[DATA]` |
| `[LLM PROVIDER]` | inference AI | `[ZAKRES/MINIMALIZACJA]` | `[KATEGORIE]` | `[REGION]` | `[TAK/NIE]` | `[MECHANIZM]` | `[URL]` | `[DATA]` |
| `[PAYMENT PROVIDER]` | płatności | billing i identyfikatory | płatnicy | `[REGION]` | `[TAK/NIE]` | `[MECHANIZM]` | `[URL]` | `[DATA]` |
| `[EMAIL/SMS]` | komunikacja | kontakt | użytkownicy | `[REGION]` | `[TAK/NIE]` | `[MECHANIZM]` | `[URL]` | `[DATA]` |
| `[MONITORING]` | observability | pseudonimowe logi | użytkownicy | `[REGION]` | `[TAK/NIE]` | `[MECHANIZM]` | `[URL]` | `[DATA]` |

## 3. Proces dodania

Owner składa wniosek z celem, danymi i alternatywami. Security/Privacy wykonują Vendor Assessment, DPA, transfer assessment, konfigurację retencji i zakaz treningu, jeśli dotyczy. Legal zatwierdza umowę. Dopiero potem provider trafia do konfiguracji produkcyjnej.

## 4. Informowanie i sprzeciw

O zmianie Klient jest informowany `[DNI]` przed rozpoczęciem przetwarzania przez nowy podmiot. Sprzeciw musi być uzasadniony ochroną danych. Strony próbują znaleźć alternatywę; jeśli nie jest możliwa, stosuje się rozwiązanie opisane w DPA/umowie.

## 5. Przegląd

Lista jest przeglądana co kwartał i po zmianie architektury. Usunięty provider ma datę zakończenia, status usunięcia danych i zachowany dowód zamknięcia.
