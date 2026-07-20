# AI w PapaData

## Rola AI

AI jest warstwą:

- analityczną,
- operacyjną,
- decyzyjną.

Nie jest zwykłym chatem.

## Kontrakt odpowiedzi

Odpowiedź powinna rozdzielać:

- fakty,
- wnioski,
- rekomendacje,
- ograniczenia,
- brak wystarczających danych.

Powinna zawierać:

- źródła,
- zakres czasu,
- evidence,
- poziom pewności,
- wpływ jakości danych.

## Wymagane przypadki

- [x] Odpowiedź z pełnymi danymi.
- [x] Odpowiedź z częściowymi danymi.
- [x] Brak danych.
- [x] Brak uprawnień.
- [x] Konflikt źródeł.
- [x] Błąd providera.
- [x] Timeout.
- [x] Kontrolowana odmowa.

## AI Actions

- [x] Klasy ryzyka.
- [x] Podsumowanie wpływu.
- [x] Approval.
- [x] Reauthentication.
- [x] Rewalidacja danych.
- [x] Idempotencja.
- [x] Audit.
- [x] Cancellation.
- [x] Rollback lub compensating action.

## Implementacja Fali 5

Implementacja local/CI znajduje się w `apps/web/src/features/ai`.

Zakres:

- Insight & Decision Service;
- Papa Asystent;
- Laboratorium AI;
- AI Actions;
- AI Gateway;
- use case registry;
- provider registry;
- model registry;
- prompt, retrieval, evidence, refusal, cost i retention policies;
- tenant-safe retrieval;
- ContextManifest;
- AI evidence;
- AI provenance;
- AI settings;
- AI history;
- AI Governance;
- evaluation suite;
- retention i deletion;
- Storybook.

Status bramy:

```text
WAVE 5 IMPLEMENTATION: PASSED
GATE S3: NOT SATISFIED
PRODUCTION AI: BLOCKED
```

Production AI pozostaje zablokowane do niezależnej weryfikacji security i
privacy.
