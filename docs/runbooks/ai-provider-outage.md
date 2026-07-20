# Runbook: AI Provider Outage

1. Mapuj błąd na `PROVIDER_UNAVAILABLE`.
2. Nie używaj fallbacku bez zatwierdzonego model policy.
3. Pokaż kontrolowaną odmowę.
4. Zapisz koszt `0` dla niewykonanego provider request.
5. Wznów po recovery providera i zielonym eval smoke test.
