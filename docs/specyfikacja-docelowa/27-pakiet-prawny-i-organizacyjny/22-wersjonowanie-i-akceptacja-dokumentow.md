---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-022
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Wersjonowanie, publikacja i akceptacja dokumentów

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Identyfikacja

Każdy dokument ma `documentKey`, semver, status, owner, approver, datę publikacji, datę obowiązywania, język, checksum i URL. Treść opublikowana jest niezmienna; poprawka tworzy nową wersję.

## 2. Klasy zmian

Patch: literówka bez wpływu. Minor: doprecyzowanie lub nowa funkcja bez istotnego pogorszenia. Major: cena, odpowiedzialność, zakres danych, AI, podprocesor, odnowienie lub prawa użytkownika. Klasa determinuje komunikację i ponowną akceptację.

## 3. Workflow

Draft → review Product/Legal/Privacy/Security/Finance → approved → scheduled → published → superseded/withdrawn. Brak zatwierdzenia któregokolwiek wymaganego ownera blokuje publikację.

## 4. Dostarczenie i zgoda

System pokazuje dokument przed czynnością, umożliwia pobranie i zapisuje dowód: actor, tenant, version, checksum, timestamp, IP/device evidence w ograniczonym zakresie, channel i related order/action. Checkbox nie jest domyślnie zaznaczony. Dokument po akceptacji jest wysyłany lub udostępniany na trwałym nośniku.

## 5. Komunikacja zmian

Istotna zmiana ma plain-language summary, redline, datę, wpływ i opcje użytkownika. Wyprzedzenie `[DNI]`. Zmiana pilna z powodu prawa/security ma uzasadnienie i komunikację bez zbędnej zwłoki.

## 6. Archiwum i audyt

Poprzednie wersje, approvale, checksumy i dowody doręczenia są przechowywane zgodnie z retencją. Support może ustalić, którą wersję zaakceptował konkretny tenant bez edycji zapisu.
