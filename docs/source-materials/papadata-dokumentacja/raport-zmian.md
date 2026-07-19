# Raport zmian

```text
Raport zmian pakietu PapaData

Wykonany zakres
1. Ujednolicono model Tenant i Workspace we wszystkich sześciu folderach.
2. Usunięto domenowe użycie organizationId.
3. Rozdzielono pojęcia GCP Organization, Tenant, Workspace oraz firmy lub profilu prawnego.
4. Zasoby tenantowe otrzymały tenantId, a zasoby workspace tenantId i workspaceId.
5. Zachowano zasoby globalne bez identyfikatorów tenantId i workspaceId.
6. Poprawiono nazwy plików i folderów: usunięto prefiksy techniczne, numery, podkreślenia, uszkodzone kodowanie i zbędne oznaczenie PapaData.
7. Zachowano wewnętrzne kody dokumentów w treści, ponieważ służą identyfikacji decyzji i wymagań.
8. Zaktualizowano manifesty i wygenerowano aktualne sumy kontrolne.
9. Folder „Architektura UI” pozostaje pusty, ponieważ folder źródłowy nie zawierał plików.

Ważne
Dokumentacja opisuje wymagania i architekturę docelową. Nie potwierdza wdrożenia ani pozytywnego wyniku testów.
```
