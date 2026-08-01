---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-014
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Procedura incydentów bezpieczeństwa i naruszeń danych

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Role

Incident Commander, Security Lead, Technical Lead, Privacy/IOD, Legal, Communications, Support i Business Owner. Lista on-call i alternatów: `[ODNOŚNIK]`.

## 2. Klasyfikacja

SEV1: naruszenie izolacji, aktywna exfiltracja, krytyczna niedostępność lub niekontrolowana zmiana finansowa. SEV2: istotne ograniczenie lub podejrzenie dostępu. SEV3/4: ograniczony problem bez istotnego wpływu. Klasyfikacja jest aktualizowana wraz z dowodami.

## 3. Proces

Detect → triage → containment → preserve evidence → eradicate → recover → notify → postmortem → remediation. Każda decyzja ma czas, właściciela i uzasadnienie. Nie usuwa się logów ani nie kontaktuje osoby podejrzanej bez planu dowodowego.

## 4. Ocena naruszenia danych

Privacy określa: czy doszło do naruszenia poufności/integralności/dostępności, administrator/procesor, osoby i dane, zakres, ryzyko, środki i terminy. PapaData jako procesor informuje Klienta bez zbędnej zwłoki. Administrator ocenia zgłoszenie organowi i osobom, z pomocą PapaData.

## 5. Minimalne zawiadomienie

Identyfikator, czas wykrycia i okres, charakter, systemy, tenanty, kategorie osób/danych, szacunkowa liczba, możliwe skutki, containment, rekomendacje, kontakt i termin aktualizacji. Pierwsza wiadomość może być częściowa.

## 6. Komunikacja

Jedno źródło prawdy, zatwierdzone komunikaty, status page dla dostępności, osobny kanał dla dotkniętych Klientów. Nie spekuluje się ani nie podaje niepotwierdzonych liczb.

## 7. Recovery i postmortem

Powrót wymaga testu bezpieczeństwa i akceptacji. Postmortem bez obwiniania obejmuje timeline, root cause, contributing factors, detekcję, wpływ, co zadziałało, działania z ownerem/terminem i weryfikację zamknięcia.

## 8. Ćwiczenia

Tabletop co najmniej `[2x ROK]` dla: cross-tenant leak, kompromitacja KSeF certyfikatu, payment webhook attack, LLM data exposure i utrata GCP regionu.
