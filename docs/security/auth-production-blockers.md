# Auth production blocking decisions

Status: required before production launch, not approved decisions.

| Item | Znaczenie | Warianty | Rekomendacja techniczna | Wpływ na bezpieczeństwo | Blokuje produkcję |
| --- | --- | --- | --- | --- | --- |
| Produkcyjny IdP | Źródło tożsamości, MFA i lifecycle kont. | Managed IdP, self-hosted IdP, enterprise SSO/OIDC. | Provider-agnostic OIDC boundary z MFA i SCIM/JIT dopiero po ADR. | Krytyczny dla haseł, MFA, recovery i account takeover. | Tak |
| Runtime i hosting backendu | Miejsce egzekucji auth boundary. | GCP Cloud Run, GKE, Functions, inny runtime. | GCP-native runtime zgodny z DEC-ARCH-CLOUD-001 po ADR. | Wpływa na izolację, sekrety, audyt i rollback. | Tak |
| Produkcyjna baza danych | Trwały store użytkowników, membershipów i audytu. | Cloud SQL, Spanner, Firestore, inna baza. | Wybrać po wymaganiach transakcyjności, audytu i backupu. | Bez trwałości nie ma wiarygodnej izolacji ani recovery. | Tak |
| Session store | Trwały/rozproszony stan sesji i rotacji. | DB, Redis/Memorystore, signed opaque store. | Opaque server-side session store z reuse detection. | Krytyczny dla revoke, refresh i session fixation. | Tak |
| Mechanizm e-mail | Dostarczenie resetów i zaproszeń. | Transactional provider, SMTP relay, internal service. | Transactional provider z audytem, retry i suppression. | Wpływa na przejęcie kont i niezaprzeczalność procesu. | Tak |
| Produkcyjna metoda MFA | Metoda drugiego składnika. | TOTP, WebAuthn, push, SMS jako wyjątek. | WebAuthn/TOTP po decyzji ryzyka; `totp_dev` tylko local/test. | Krytyczny dla kont uprzywilejowanych. | Tak |
| Szyfrowanie sekretów MFA | Ochrona sekretów drugiego składnika. | KMS envelope encryption, HSM, IdP-managed. | KMS envelope encryption albo pełne przeniesienie do IdP. | Wyciek sekretów MFA obniża całą kontrolę. | Tak |
| Token TTL | TTL resetów, zaproszeń i tokenów procesu. | Krótkie per-flow TTL, policy-based TTL. | Krótkie TTL per typ operacji i wersjonowana polityka. | Zbyt długie TTL zwiększają skutki wycieku linku. | Tak |
| Session TTL | Maksymalny czas życia sesji. | Krótki access, refresh rotation, absolute TTL. | Idle + absolute timeout z rotacją i reuse detection. | Zbyt długie sesje zwiększają skutki kradzieży cookie. | Tak |
| Idle timeout | Bezczynność użytkownika. | 15 min, 30 min, role-based. | Role/risk-based, osobno dla kont uprzywilejowanych. | Chroni przed pozostawioną aktywną sesją. | Tak |
| Absolute timeout | Twardy limit sesji. | 8 h, 12 h, 24 h, role-based. | Twardy limit niezależny od aktywności. | Ogranicza długie kompromitacje sesji. | Tak |
| Invitation TTL | Ważność zaproszeń. | 24 h, 7 dni, role-based. | Krótszy TTL dla ról uprzywilejowanych. | Link zaproszenia aktywuje membership. | Tak |
| Reset TTL | Ważność resetu hasła. | 10 min, 20 min, 60 min. | Krótki TTL i unieważnienie poprzednich resetów. | Krytyczny dla przejęcia konta. | Tak |
| Audit retention | Retencja i dostęp do audytu. | 90 dni, 1 rok, plan-tier, compliance-tier. | Append-only store z retencją zgodną z modelem commercial/compliance. | Brak retencji utrudnia wykrycie i dochodzenie incydentów. | Tak |
| Rate-limit store | Ochrona przed brute force i nadużyciami. | In-memory, Redis/Memorystore, provider WAF. | Distributed store + WAF/risk signals; in-memory tylko local/test. | Lokalny limiter nie chroni wielu instancji. | Tak |
| Polityka unieważniania sesji | Kiedy revoke po zmianach konta. | Reset hasła, change password, MFA change, role change. | Revoke po reset/change password i istotnych zmianach MFA/role. | Bez revoke stare sesje utrzymują dostęp. | Tak |
| Polityka recovery | Recovery codes i ścieżki wsparcia. | Recovery codes, admin reset, support JIT. | Jednorazowe codes + audyt + reauth; support tylko przez osobny proces. | Recovery jest często najsłabszym ogniwem MFA. | Tak |
| RTO/RPO | Odtworzenie po awarii auth/audit. | Zależne od tieru, multi-region, backup restore. | Zdefiniować razem z bazą, audytem i hostingiem. | Brak RTO/RPO blokuje wiarygodne operacje produkcyjne. | Tak |
