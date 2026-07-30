---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-010
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Warunki korzystania z AI i akceptacji człowieka

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Rola AI

Papa Asystent i Laboratorium AI wspierają analizę danych, wykrywanie anomalii, tworzenie raportów, rekomendacje i przygotowanie działań. Nie są ogólnym źródłem prawdy ani profesjonalną poradą prawną, podatkową, finansową lub inwestycyjną.

## 2. Dane i kontekst

AI otrzymuje tylko dane dopuszczone przez uprawnienia, readiness, zakres dat i filtry. Dashboard, raport i AI korzystają z tego samego snapshotu Metric Engine. Model nie może samodzielnie tworzyć alternatywnych formuł 58 metryk. Dane i evidence są wskazywane w odpowiedzi, a brak danych prowadzi do odmowy lub ograniczenia.

## 3. Provider i trening

Provider, model, region, retencja i zasady treningu są jawne w konfiguracji i liście podprocesorów. Domyślnie dane Klienta nie mogą być używane do trenowania modelu ogólnego. Lokalne środowisko działa z deterministycznym adapterem testowym bez wysyłania danych na zewnątrz.

## 4. Ograniczenia odpowiedzi

Odpowiedź zawiera: tezę, evidence, zakres danych, freshness, poziom pewności, założenia, ograniczenia i wskazanie, czy wymaga człowieka. System może odmówić, gdy dane są niewystarczające, uprawnienie brakujące, ryzyko niedopuszczalne lub zadanie wykracza poza zakres.

## 5. Ciągłość rozmowy

Papa Asystent i Laboratorium używają wspólnego `conversationId`. Przejście między widokami nie tworzy nowej rozmowy. Wątki anomalii/ryzyk są `caseThreadId` powiązanymi z rozmową główną i zachowują decyzje oraz evidence.

## 6. AI Actions

Istotne działanie, np. zmiana budżetu, stawki, statusu kampanii, integracji lub uprawnienia, przechodzi: propozycja, diff, źródła, symulacja, rewalidacja targetu, capability check, limity, potwierdzenie człowieka, idempotentne wykonanie, readback, audyt, monitoring i rollback/kompensację.

## 7. Treść potwierdzenia

Przykład do zatwierdzenia prawnego:

> „Zapoznałem(-am) się z proponowaną zmianą, jej zakresem, źródłami, przewidywanym skutkiem i wskazanymi ryzykami. Potwierdzam, że mam uprawnienie do jej zlecenia i świadomie polecam PapaData wykonanie opisanej operacji w systemie `[PROVIDER]`.”

Potwierdzenie nie przenosi na użytkownika odpowiedzialności PapaData za bezpieczeństwo, zgodność procesu, autoryzację i poprawne wykonanie. Zapis obejmuje aktora, czas, tenant, target, before/after, model, evidence, wersję komunikatu i wynik.

## 8. Zakazane automatyzacje

Bez odrębnej oceny i podstawy zakazane są: decyzje wywołujące skutek prawny wobec osoby wyłącznie automatycznie, niekontrolowany wpływ finansowy, autonomiczne nadawanie uprawnień, obejście approval, działanie na niezweryfikowanym target oraz użycie danych innego tenanta.

## 9. Reklamacje i wyjaśnienie

Użytkownik może zgłosić błędną odpowiedź lub działanie, uzyskać evidence i historię approval, a gdy technicznie możliwe — rollback. Incydenty modelu są klasyfikowane i trafiają do evals oraz postmortem.
