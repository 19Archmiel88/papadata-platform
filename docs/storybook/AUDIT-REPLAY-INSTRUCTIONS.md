# Instrukcja odtwarzania audytu

## Kolejność

```bash
git status
python scripts/validate_all.py .
pnpm check:foundation-system
pnpm check-component-system
pnpm check:storybook-catalog
pnpm check:analytics-system
pnpm check:cross-cutting-patterns
pnpm check:storybook-presentation
pnpm check:documentation-hardening
pnpm --filter @papadata/web typecheck
pnpm typecheck
pnpm --filter @papadata/web build-storybook
pnpm --filter @papadata/web build
pnpm test
git diff --check
```

## Browser audit 30/31

Po zbudowaniu Storybooka uruchom lokalny serwer Storybooka i wykonaj:

```bash
STORYBOOK_URL="http://127.0.0.1:6010" pnpm --filter @papadata/web audit-storybook-business-screens
```

Wynik zapisz w `artifacts/storybook-business-screens-YYYYMMDD/browser-audit.json`.
