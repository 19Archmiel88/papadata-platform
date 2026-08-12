---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-004
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Polityka cookies i podobnych technologii

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zakres

Polityka dotyczy strony publicznej, panelu webowego i — odpowiednio — podobnych identyfikatorów w aplikacji mobilnej. Operatorem jest `[SPÓŁKA]`. Ustawieniami zgody zarządza platforma CMP `[NAZWA/WŁASNA]`.

## 2. Kategorie

| Kategoria | Cel | Podstawa | Domyślnie |
|---|---|---|---|
| konieczne | sesja, CSRF, load balancing, bezpieczeństwo, zapamiętanie zgody | niezbędność usługi | włączone |
| preferencje | język, motyw, ustawienia UI | zgoda lub żądana funkcja | wg kwalifikacji |
| analityczne | pomiar użycia i jakości | zgoda | wyłączone do zgody |
| marketingowe | atrybucja i reklama | zgoda | wyłączone do zgody |

Lista produkcyjna zawiera nazwę, providera, domenę, cel, kategorię, czas, first/third party i transfer. Nie wolno wdrażać nowego trackera bez aktualizacji rejestru i CMP.

## 3. Mechanizm zgody

1. Przed zgodą uruchamiane są tylko technologie konieczne.
2. Użytkownik może zaakceptować wszystkie, odrzucić niekonieczne albo wybrać kategorie z równą łatwością.
3. Zgoda jest konkretna, dobrowolna i możliwa do wycofania przez stały link „Ustawienia prywatności”.
4. CMP zapisuje wersję bannera, wybór, czas i dowód techniczny bez nadmiernego identyfikowania.

## 4. Przykładowy rejestr do uzupełnienia

| Nazwa | Provider | Kategoria | Cel | Czas | Transfer |
|---|---|---|---|---|---|
| `[SESSION]` | PapaData | konieczna | sesja | sesja / `[X]` | EOG |
| `[CONSENT]` | PapaData/CMP | konieczna | zapis wyboru | `[X miesięcy]` | `[LOKALIZACJA]` |
| `[ANALYTICS]` | `[PROVIDER]` | analityczna | statystyki | `[X]` | `[MECHANIZM]` |

## 5. Przeglądarki i urządzenia

Usunięcie cookies w przeglądarce może zresetować wybór. Ustawienia systemowe iOS/Android mogą dodatkowo ograniczać identyfikatory. Instrukcje są dostosowane do faktycznie użytych technologii, bez sugerowania, że ustawienia przeglądarki zastępują obowiązek uzyskania zgody.

## 6. Zmiany i kontakt

Kontakt: `[EMAIL PRIVACY]`. Wersja `[X]`, data `[DATA]`. Skan cookies jest wykonywany przed każdym wydaniem oraz co najmniej `[CZĘSTOTLIWOŚĆ]`.
