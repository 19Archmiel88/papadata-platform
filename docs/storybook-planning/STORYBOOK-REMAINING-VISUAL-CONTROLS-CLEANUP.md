# Storybook remaining visual controls cleanup

Status: proposed patch after PR #41.

## Scope closed by this patch

- Global light canvas is moved away from the previous warm/milky background into a cooler neutral canvas.
- Storybook runtime globals are mirrored onto the canvas wrapper through `data-theme`, `data-locale`, `data-density` and `data-motion`.
- Story content remounts when runtime globals change, which prevents stale locale/density/motion state after toolbar switches.
- Density and reduced-motion controls affect the shared presentation shell.
- Accepted 00 component stories use `00 Fundamenty` page chrome instead of legacy `10 Komponenty bazowe` chrome.
- Select focus uses one composite shell focus ring; the internal trigger does not add a second visible frame.
- 00 and 05 demos use shared separators, cooler canvas and subtle depth instead of accidental standalone rectangles.
- Storybook-level overflow protection is scoped to Storybook canvas and presentation wrappers.

## Active Storybook inventory after PR #41

| Root | Role | Status |
| --- | --- | --- |
| `00 Fundamenty` | visual foundations and accepted base elements | active |
| `05 Laboratorium decyzji` | decision record / comparison lab | active |
| `15 Wykresy i dane` | data visualization components and states | active |
| `18 Wzorce interfejsu` | cross-cutting interface patterns | active |

Removed active roots remain removed:

- `10 Komponenty`
- `10 Komponenty bazowe`
- `20 Powłoka`

## Follow-up not included

- Full translation of every long story body in 15 and 18.
- Dependabot updates.
- Production app screen redesign.
- New runtime component APIs.

## Patch 3 — surface/messaging taxonomy and decision workspace

Status: proposed patch on top of `storybook/remaining-visual-controls-cleanup`.

### Podział zaakceptowany kierunkowo

Aktywny Storybook zachowuje cztery główne roote:

1. `00 Fundamenty`
2. `05 Laboratorium decyzji`
3. `15 Wykresy i dane`
4. `18 Wzorce interfejsu`

W `00 Fundamenty` dodano gałąź `Powierzchnie i komunikaty` jako kanoniczne miejsce dla kontraktu:

- `Hierarchia powierzchni`
- `Komunikat w kontekście`
- `Status obiektu`
- `Toast operacyjny`
- `Stany puste, błędy i blokady`

W `18 Wzorce interfejsu` dodano `DataDecisionWorkspace` jako produktowe użycie tych samych zasad: dane po lewej, rekomendacja jako warstwa pomocnicza, sidecar Papa Asystenta i toast jako komunikat operacyjny.

### Decyzja wizualna

PapaData nie buduje hierarchii przez osobne kolorowe karty. Hierarchia wynika z poziomu powierzchni, separatora, cienia, gęstości i lokalnego akcentu marki. Kolor brandu nie barwi całych paneli; pojawia się jako ikona, hairline, status dot, aktywna krawędź albo tekst akcji.

### Granica odpowiedzialności

- `00 / Powierzchnie i komunikaty` definiuje UI powierzchni, komunikatów, badge'y, toastów i stanów pustych, błędów i blokad.
- `05` pozostaje laboratorium decyzji i nie przejmuje ownership.
- `18` konsumuje zasady w realnym wzorcu aplikacyjnym.
- `15` pozostaje właścicielem analitycznych komponentów danych i nie tworzy prywatnego systemu komunikatów.
