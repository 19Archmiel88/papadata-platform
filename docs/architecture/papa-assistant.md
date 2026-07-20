# Papa Asystent

Papa Asystent jest kontekstową powierzchnią analizy, nie ogólnym chatem.

Kontrakt kontekstu zawiera:

- `tenantId`;
- `workspaceId`;
- `surface`;
- `resourceType`;
- `resourceId`;
- `snapshotId`;
- `period`;
- `currency`;
- `timezone`;
- `readiness`;
- `dataScope`;
- `useCaseId`.

Asystent korzysta z `LocalAIRuntime.runAssistant`. Runtime pobiera dane przez
Metrics & Query Service Fali 4 i buduje `ContextManifest`. Odpowiedź rozdziela
`FACT`, `INTERPRETATION`, `HYPOTHESIS` i `RECOMMENDATION`.

Markdown przechodzi lokalną redakcję i politykę `rehype-sanitize`.
