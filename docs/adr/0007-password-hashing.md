# ADR 0007: Skróty haseł

## Status

Zaakceptowano dla backendu.

## Kontekst

Auth lokalny i produkcyjny musi chronić hasła, kody odzyskiwania i tokeny.
Dokumentacja zabrania logowania sekretow, wymaga rate limit, lockout,
rotacji sesji, jednorazowych tokenów oraz audytu bez danych wrażliwych.

## Decyzja

Hasła użytkowników są skracane algorytmem Argon2id z unikalną solą dla każdego
hasła. Parametry kosztu są wersjonowane i zapisywane razem ze skrótem, aby
umożliwić bezpieczne podnoszenie kosztu w czasie.

Kody odzyskiwania i tokeny jednorazowe są przechowywane w postaci skrótu, nie w
postaci jawnej. Porównania sekretów muszą być odporne na timing leaks.

## Konsekwencje

- Produkcyjna biblioteka do Argon2id zostanie dodana dopiero w zadaniu auth po
  zgodzie na zależność.
- Testy auth muszą obejmować brak logowania haseł, tokenów, kodów MFA i recovery
  codes.
- Zmiana parametrów skrótów wymaga wersjonowania i planu rehash.
