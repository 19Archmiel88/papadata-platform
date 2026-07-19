# Tożsamość role i uprawnienia

PAPADATA

Identity, role i uprawnienia

Tenant, membership, capabilities, data scope i operacje wrażliwe

Tabela:
- Wiersz 1: Kod dokumentu; A09
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zapewnić spójny i audytowalny dostęp do ekranów, danych, rekomendacji i operacji. [FAKT/ZAKRES]

Zakres: Tenant/workspace, identity, membership, capabilities, entitlement, MFA, reauth i JIT support. [FAKT/ZAKRES]

Poza zakresem: Konkretny dostawca identity i polityka HR. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Podstawa źródłowa

Tabela:
- Wiersz 1: Kod; Dokument; Rola w architekturze
- Wiersz 2: D1; Dokumentacja produktu; Nadrzędna dokumentacja biznesowo-produktowa.
- Wiersz 3: D2; Rejestr decyzji i wymagań biznesowych; Jedyne źródło prawdy dla statusu i wersji decyzji.
- Wiersz 4: D3; Kontrakt danych, stanów i KPI; Źródło prawdy dla warstw danych, canonicalization, deduplikacji i readiness.
- Wiersz 5: D4; Integracje i gotowość operacyjna; Źródło prawdy dla providerów, bram, synchronizacji, retry i recovery.
- Wiersz 6: D5; Pierwszy pion produktowy i płatny pilotaż; Proces pierwszej mierzalnej wartości i kryteria pilotażu.
- Wiersz 7: D6; Model komercyjny i unit economics; Plany, limity, koszty, marża i bramy skalowania.
- Wiersz 8: D7; Bezpieczeństwo, Prywatność i AI Governance; Kontrole bezpieczeństwa, prywatności, ciągłości i AI.
- Wiersz 9: M01-M15; Specyfikacje architektury UI/UX; Ekrany, flow, stany, formularze, Storybook i priorytety.

Hierarchia: D2 ustala status decyzji; D3 semantykę danych/KPI; D4 gotowość integracji; D7 bezpieczeństwo i AI. M01-M15 opisują wymagania UI, ale nie dowodzą implementacji. [FAKT]

## Model decyzji dostępu

AccessDecision = Session + AuthStrength + TenantStatus + WorkspaceStatus + MembershipStatus + Capabilities + DataScope + Entitlements + ResourceState + PolicyVersion

## Role referencyjne

Tabela:
- Wiersz 1: Rola; Widoczność; Akcje; Zakazy; Ekrany; Audyt
- Wiersz 2: Owner; Pełna widoczność workspace; plan, członkowie, integracje, decyzje wysokiego wpływu; nie omija readiness ani audytu; M01-M15; role, billing, integracje, eksport, approvals
- Wiersz 3: Admin; Konfiguracja workspace i integracji; invite, role w zakresie, reconnect, sync; bez ownership/billing bez capability; M01, M03, M10, M11, M13; role, connection, sync
- Wiersz 4: Analyst; Dane, KPI, jakość, insight i AI; analiza, issue, insight, rekomendacja; bez billing i high-impact execution; M04-M12, M15; override, issue, recommendation
- Wiersz 5: Marketing Operator; Kampanie, ruch i decyzje marketingowe; analiza i niskoryzykowne działania; brak role management i danych poza scope; M05, M09, M12, M15; campaign/action approvals
- Wiersz 6: Viewer; Odczyt dozwolonych dashboardów; filtry i opcjonalny eksport; brak mutacji i AI actions; M04-M09, M12 read-only; eksport
- Wiersz 7: Billing Admin; Plan, usage, faktury; płatności i plan; brak danych analitycznych bez roli; M14; payment/plan
- Wiersz 8: Internal Operations; Techniczne statusy tenantów w JIT; diagnoza, reprocess po zatwierdzeniu; brak domyślnego dostępu do treści; M10, M11, M13; JIT/reprocess/support
- Wiersz 9: Auditor/Security; Audit i kontrole; przegląd dowodów; read-only poza audytem; M13/audit; audit export/policy

## Capabilities minimalne

Tabela:
- Wiersz 1: Capability; Znaczenie
- Wiersz 2: workspace.read/update; profil workspace
- Wiersz 3: membership.invite/manage; zaproszenia/role
- Wiersz 4: integration.connect/manage/sync; connection i jobs
- Wiersz 5: data.read.detail; dane szczegółowe
- Wiersz 6: data.issue.manage; problemy jakości
- Wiersz 7: metric.read/export; KPI/eksport
- Wiersz 8: insight.create/review; insight/recommendacje
- Wiersz 9: decision.make.high_impact; decyzje wysokiego wpływu
- Wiersz 10: ai.use.basic/lab; assistant/lab
- Wiersz 11: action.approve/execute; approval/execution
- Wiersz 12: billing.read/manage; plan/płatności
- Wiersz 13: audit.read/export; audit
- Wiersz 14: support.jit_access; czasowy ops
- Wiersz 15: security.manage_sessions/policy; sesje/policy
- Wiersz 16: data.lifecycle.export/delete; lifecycle

## Operacje wrażliwe

Tabela:
- Wiersz 1: Operacja; Kontrola
- Wiersz 2: Zmiana Owner/last owner; fresh MFA + self-lockout guard + audit
- Wiersz 3: Zmiana roli admin; capability + version + notification
- Wiersz 4: Connect/reconnect; reauth wg ryzyka + scope summary
- Wiersz 5: Eksport detail; purpose + capability + audit + rate limit
- Wiersz 6: Manual source authority; rationale + dual approval high impact
- Wiersz 7: Action external; target/evidence hash + idempotency + reauth
- Wiersz 8: Plan/payment; Billing Admin + provider handoff + audit
- Wiersz 9: Delete/deactivate; reauth + retention/legal hold
- Wiersz 10: JIT support; ticket, purpose, time limit, least privilege, audit

## Testy auth

Każdy endpoint ma allow/deny test.

Każdy zasób ma cross-org i cross-workspace test.

IDOR test używa realnego ID innego tenantu.

Membership change rewaliduje sesje/cache.

Ops nie otrzymuje domyślnie source content.

AI retrieval/export używają tej samej policy.

Entitlement i permission są rozróżnione.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
