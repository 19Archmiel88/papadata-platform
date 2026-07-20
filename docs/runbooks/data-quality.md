# Runbook Jakości Danych

1. Sprawdź `Dataset.readinessStatus` i `ReadinessAssessment.nextActions`.
2. Otwórz `QualityAssessment` i ustal wymiar z `FAIL` albo `WARN`.
3. Sprawdź `DataIssue.ownerId`; krytyczne issue bez ownera jest blokerem.
4. Dla schema/currency/status problemów sprawdź normalized evidence.
5. Dla overlap sprawdź exact match, source authority i lineage exclusions.
6. Po decyzji manualnej uruchom reprocess tylko dla jawnego zakresu.
7. Brama datasetu wymaga reconciliation `PASS`.

Nie zamykaj issue jako dowodu gotowości bez ponownej walidacji readiness.
