# Runbook: AI Prompt Injection

1. Oznacz refusal `INJECTION_DETECTED`.
2. Zapisz minimalny audit bez pełnego promptu.
3. Sprawdź source fragment pod retrieval poisoning.
4. Zaktualizuj test vector.
5. Wznów tylko po zielonym eval suite.
