---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: LinkAction
---
# LinkAction

## Cel i odpowiedzialność
`LinkAction` jest jedyną bazową akcją tekstową służącą do nawigacji. Runtime renderuje semantyczny `<a href>` i nie przejmuje odpowiedzialności za komendy lub submit.

## Runtime source of truth
Publiczne React API: `apps/web/src/design-system/components/Button/LinkAction.tsx` (`LinkActionProps`).

`contracts/components/linkaction.ts` jest kontraktem orkiestracyjnym/specyfikacyjnym i nie jest kopią React Props.

## Anatomia runtime
`children`; `href`; `startIcon`; `endIcon`; `size`; `tone` oraz natywne atrybuty anchor.

## Granica semantyczna

| Rodzina akcji | Odpowiedzialność |
|---|---|
| `Button` | command / submit |
| `TextAction` | lekka komenda o semantyce button |
| `LinkAction` | nawigacja |
| `IconButton` | komenda ikonowa |

## Konsumenci

## Storybook i testy
Właściciel demonstracji: `10.02 — Przyciski i akcje`.
