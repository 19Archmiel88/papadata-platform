# Laboratorium AI

Laboratorium AI jest osobną powierzchnią kontrolowanych eksperymentów.

Każdy eksperyment ma:

- zatwierdzony `AIUseCase`;
- workspace;
- dozwolone datasety;
- dozwolone KPI;
- okres;
- cel;
- wersję modelu i promptu;
- evidence;
- provenance;
- koszt;
- retencję;
- audyt.

Laboratorium nie jest playgroundem. Runtime odrzuca use case spoza
`uc_laboratory_analysis` i używa tylko zakresu danych przekazanego w
`LaboratoryExperiment`.
