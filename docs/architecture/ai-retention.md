# AI Retention

Fala 5 definiuje retencję dla:

- threads;
- messages;
- model runs;
- ContextManifest;
- evidence;
- embeddings;
- cache;
- memory;
- experiments;
- insights;
- recommendations;
- decisions;
- action proposals;
- action executions;
- provider-side data.

Deletion propaguje do cache, memory, vector index, storage, providerów,
eksportów i zależnych artefaktów. Dane klientów nie służą do treningu
wspólnego modelu.
