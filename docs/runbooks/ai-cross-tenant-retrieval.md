# Runbook: AI Cross-Tenant Retrieval

1. Włącz emergency disable dla workspace.
2. Zatrzymaj run i stream.
3. Zabezpiecz audit reference.
4. Zweryfikuj `tenantId`, `workspaceId`, ContextManifest i evidence.
5. Oznacz incydent jako security.
6. Przeprowadź purge cache, memory i vector index.
7. Wznów AI dopiero po potwierdzeniu isolation testów.
