# Analytics Alerts

Fala 4 dodaje produktowe alerty analityczne, niezależne od toastów `sonner`.

Alert zawiera:

- read/unread;
- severity;
- business impact;
- ownera;
- source object;
- deep link;
- acknowledgement;
- resolution state;
- audit reference.

Źródła alertów:

- stale data;
- invalid KPI;
- reconciliation mismatch;
- connection degraded;
- missing scope;
- source conflict;
- duplicate issue;
- reprocessing required;
- definition changed.

Task powstaje z alertu albo readiness reason i zachowuje tenant/workspace.
Pełne kanały e-mail, Slack i Teams pozostają poza Falą 4.
