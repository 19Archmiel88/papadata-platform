---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-009
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Wątki spraw AI dla anomalii, wzrostów i ryzyk

Każda anomalia, wzrost, ryzyko, problem jakości danych lub rekomendacja może utworzyć `AiCaseThread` powiązany z rozmową główną.

Wątek sprawy przechowuje typ, severity, status, metryki i snapshoty, hipotezy, evidence, ograniczenia, ownera, komentarze, rekomendacje, decyzje i rezultat. Nie jest niezależnym chatbotem: dziedziczy kontekst i może zostać otwarty z Papa Asystenta lub odpowiedniego modułu.

Statusy: `detected`, `triaging`, `needs_data`, `recommendation_ready`, `awaiting_approval`, `actioned`, `monitoring`, `resolved`, `dismissed`.
