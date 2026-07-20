# Customer Workspace

Fala 4 dodaje `CustomerWorkspaceScreen` jako działającą powierzchnię klienta.

Powłoka zawiera:

- desktop sidebar;
- mobile navigation;
- scope header;
- Command Center;
- moduł analityczny;
- KPI detail;
- Trust Drawer;
- drill-down table;
- alerts;
- tasks;
- evidence panel;
- kontrolowany export;
- gated states dla późniejszych fal.

Nawigacja nie prowadzi do pustych stron. Funkcje bez runtime są oznaczone jako
gated lub blocked na podstawie capability, entitlement, feature flag i
readiness.

Zmiana workspace:

- czyści cache;
- zamyka szczegóły;
- odrzuca spóźnioną odpowiedź starego workspace;
- wymusza ponowną walidację capability i entitlement.
