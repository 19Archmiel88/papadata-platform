# AI Context Minimization

ContextManifest preferuje agregaty i MetricSnapshot zamiast raw records.

Wykluczone kategorie:

- sekrety;
- tokeny;
- raw payloady;
- credential errors;
- obcy tenant;
- obcy workspace;
- dane poza celem;
- dane po retencji;
- `INVALID` KPI;
- `BLOCKED` KPI.

Manifest zapisuje redakcje, evidence references, readiness summary i integrity
hash.
