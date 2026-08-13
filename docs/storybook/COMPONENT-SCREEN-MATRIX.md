# Matrix komponent -> ekran produkcyjny

| Komponent | Właściciel | Ekrany |
| --- | --- | --- |
| ProductShellFrame | Shell `20` | `/app`, `/app/command-center`, `/app/campaigns` |
| Topbar | Shell `20.02/20.03` | Auth publiczny, shell aplikacji |
| Sidebar | Shell `20.04/20.05` | `/app/command-center`, `/app/campaigns` |
| WorkspaceSwitcher | Shell `20.06` | chroniona aplikacja |
| CommandPalette | Shell `20.07` | chroniona aplikacja |
| NotificationCenter | Shell `20.08` | chroniona aplikacja |
| OperationCenter | Shell `20.09` | chroniona aplikacja |
| AuthSurface | Auth `25` | `/login`, `/register`, reset i MFA |
| BusinessScreen | domena `30/31` | centrum dowodzenia i kampanie |
| DataStatusBanner | domenowe dane | `30.01-30.13`, `31.01-31.06` |
| EvidencePanel | evidence i rekomendacje | `30.05`, `30.11`, `31.04`, `31.06` |
| DecisionQueue | kolejka decyzji | `30.02` |
| BudgetPacing | budżet | `31.05` |
| AttributionComparison | atrybucja | `31.04` |
| FunnelChart / FunnelStep | lejek | `30.10` |
| WaterfallChart | waterfall | `30.13` |

Reguła: ekran nie powinien wprowadzać komponentu domenowego bez wpisu w tej macierzy albo bez świadomej decyzji, że element jest jednorazowym helperem Storybooka.
