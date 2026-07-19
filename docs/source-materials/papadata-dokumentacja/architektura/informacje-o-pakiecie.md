# Informacje o pakiecie

```text
Pakiet architektury PapaData

Zakres
- 17 dokumentów merytorycznych oraz manifest dokumentów.
- Dwa dokumenty danych mają dodatkowe wersje PDF.
- Nazwy plików i folderów zostały ujednolicone i zapisane w czytelnej formie.

Model zakresów danych
- Tenant oznacza jednego klienta PapaData i jest granicą własności danych, umowy, billingu i polityk. Identyfikator: tenantId.
- Workspace jest przestrzenią operacyjną wewnątrz tenanta i należy do dokładnie jednego tenanta. Identyfikator: workspaceId.
- Zasób tenantowy zawiera tenantId.
- Zasób należący do workspace zawiera tenantId i workspaceId.
- Zasób globalny platformy nie zawiera tenantId ani workspaceId.
- GCP Organization oznacza wyłącznie korzeń infrastruktury operatora PapaData i nie zastępuje tenantId.
- Firma lub profil prawny opisuje dane biznesowe klienta i nie stanowi technicznej granicy izolacji.

Weryfikacja
- Dokumentacja opisuje wymagania i stan docelowy. Nie stanowi dowodu implementacji.
- Sumy kontrolne znajdują się w pliku „Sumy kontrolne SHA256.txt”.
```
