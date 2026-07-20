# Third Party Notices

Status: draft techniczny.
Not legal advice. Lista obejmuje bezpośrednie zależności z package manifestów i
wymaga automatycznego SBOM przed produkcją.

## Runtime Dependencies

- `@radix-ui/react-*`
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `motion`
- `react`
- `react-dom`
- `rehype-sanitize`
- `sonner`
- `tailwind-merge`
- `zod`
- lokalne pakiety `@papadata/contracts`, `@papadata/database`

## Development And Test Dependencies

- `@chromatic-com/storybook`
- `@eslint/js`
- `@storybook/*`
- `@tailwindcss/vite`
- `@testing-library/*`
- `@types/*`
- `@vitejs/plugin-react`
- `@vitest/*`
- `axe-core`
- `cspell`
- `eslint`
- `eslint-plugin-*`
- `globals`
- `markdownlint-cli2`
- `playwright`
- `storybook`
- `tailwindcss`
- `turbo`
- `typescript`
- `typescript-eslint`
- `valibot`
- `vite`
- `vitest`

## Required Before Production

- Wygenerować SBOM z wersjami, licencjami i transitive dependencies.
- Sprawdzić licencje pod kątem użycia komercyjnego.
- Zweryfikować obowiązki notice dla każdej zależności.
- Zapisać wynik dependency scan w artefaktach CI.
