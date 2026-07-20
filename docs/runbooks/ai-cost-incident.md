# Runbook: AI Cost Incident

1. Zatrzymaj run po cost policy limit.
2. Oznacz refusal `COST_LIMIT_REACHED`.
3. Zsumuj cost per use case i workspace.
4. Sprawdź retry loop.
5. Odblokuj po korekcie limitu albo promptu.
