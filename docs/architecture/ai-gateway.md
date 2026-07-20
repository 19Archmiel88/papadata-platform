# AI Gateway

Centralny gateway działa w `LocalAIRuntime`.

Preflight:

- membership;
- capability;
- entitlement;
- data scope;
- approved use case;
- Gate S3;
- readiness;
- retention;
- cost policy;
- prompt injection;
- secret request;
- ContextManifest;
- evidence validation.

Produkcyjne AI jest zablokowane, ponieważ Gate S3 nie ma niezależnej oceny
bezpieczeństwa i prywatności. Lokalny provider syntetyczny działa tylko w
local/CI i Storybooku.
