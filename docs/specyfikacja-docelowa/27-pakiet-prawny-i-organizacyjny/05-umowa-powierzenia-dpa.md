---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-005
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Umowa powierzenia przetwarzania danych — DPA

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## §1. Strony i role

Administratorem jest `[KLIENT]`, a podmiotem przetwarzającym `[SPÓŁKA PAPADATA]`. DPA stanowi część umowy SaaS / Order Form. Jeżeli dla konkretnego celu strony mają inne role, opisują je w załączniku bez automatycznego rozszerzania powierzenia.

## §2. Przedmiot, czas i cel

Procesor przetwarza dane przez czas świadczenia usługi i okres usunięcia wyłącznie w celu hostingu, synchronizacji integracji, analityki, raportów, AI, supportu, bezpieczeństwa, kopii i operacji zleconych przez Administratora. Charakter operacji: zbieranie, zapisywanie, porządkowanie, łączenie, obliczanie, przeglądanie, eksport, ograniczanie i usuwanie.

## §3. Kategorie danych i osób

Kategorie osób: klienci końcowi, użytkownicy sklepów/serwisów, pracownicy i kontrahenci Administratora, odbiorcy kampanii oraz inne osoby ujęte w źródłach Administratora. Kategorie danych: identyfikacyjne, kontaktowe, transakcyjne, produktowe, marketingowe, zachowanie online, identyfikatory urządzeń, treść komunikacji i inne skonfigurowane przez Administratora. Dane szczególnych kategorii są `[ZAKAZANE / DOPUSZCZALNE WYŁĄCZNIE PO DODATKOWEJ UMOWIE]`.

## §4. Udokumentowane polecenia

Procesor działa wyłącznie na udokumentowane polecenie, którym są umowa, konfiguracja, API i uprawnione działania Użytkowników. Jeżeli polecenie narusza prawo, Procesor informuje Administratora, o ile prawo nie zabrania. Transfer poza EOG odbywa się tylko na zatwierdzonej podstawie.

## §5. Poufność i personel

Osoby upoważnione są związane poufnością, przeszkolone i otrzymują dostęp według least privilege. Dostęp wewnętrznego supportu jest JIT, uzasadniony, zatwierdzony i audytowany.

## §6. Bezpieczeństwo

Procesor wdraża środki z Security/TOM Addendum, w tym izolację tenantów, szyfrowanie, zarządzanie kluczami i sekretami, MFA, RBAC/capabilities, logi audytowe, kopie, testy, monitoring, vulnerability management, SDLC i recovery. Istotna zmiana TOM nie obniża ogólnego poziomu ochrony.

## §7. Podprocesorzy

Administrator udziela `[OGÓLNEJ / SZCZEGÓŁOWEJ]` zgody. Lista znajduje się pod `[URL]`. O nowym podprocesorze Procesor informuje co najmniej `[DNI]` wcześniej. Administrator może zgłosić uzasadniony sprzeciw dotyczący ochrony danych. Procesor nakłada równoważne obowiązki i odpowiada za ich wykonanie zgodnie z prawem i umową.

## §8. Prawa osób i obowiązki Administratora

Procesor, z uwzględnieniem charakteru przetwarzania, pomaga w realizacji praw. Wniosek otrzymany bezpośrednio przekazuje Administratorowi, chyba że jest uprawniony do odpowiedzi. Administrator odpowiada za legalność danych, informacje dla osób, podstawy i polecenia.

## §9. Incydenty

Procesor zgłasza naruszenie bez zbędnej zwłoki, docelowo w ciągu `[X GODZIN]` od potwierdzenia. Zgłoszenie zawiera charakter, zakres, możliwe skutki, środki, kontakt i kolejne aktualizacje. Brak pełnych informacji nie opóźnia pierwszego zawiadomienia. Współpraca nie oznacza automatycznego uznania odpowiedzialności.

## §10. DPIA i konsultacje

Procesor dostarcza dostępne informacje potrzebne do DPIA i uprzednich konsultacji, w zakresie właściwym dla usługi. Dodatkowe prace wykraczające poza standard mogą podlegać uzgodnionej opłacie, o ile prawo na to pozwala.

## §11. Audyty

Procesor udostępnia raporty, certyfikaty, kwestionariusze i inne dowody. Audyt na miejscu odbywa się po uzasadnionym zawiadomieniu, z poszanowaniem bezpieczeństwa innych klientów, nie częściej niż `[CZĘSTOTLIWOŚĆ]`, chyba że incydent lub organ wymaga inaczej. Koszty i zasady poufności określa Order Form.

## §12. Zwrot i usunięcie

Po zakończeniu, według wyboru Administratora, dane są zwracane i usuwane, chyba że prawo wymaga zachowania. Okno eksportu: `[DNI]`; usunięcie z systemów aktywnych: `[DNI]`; kopie rotacyjne: do `[DNI]`. Procesor może wystawić potwierdzenie usunięcia.

## Załącznik A — opis przetwarzania

Uzupełnić: usługi, zbiory, źródła, kategorie osób, dane, częstotliwość, region, retencja, instrukcje specjalne, czy AI provider otrzymuje treść i czy jest wyłączony trening.

## Załącznik B — TOM

Wskazanie dokumentu `09-security-tom-addendum.md`, wersji i wyjątków Klienta.

## Załącznik C — podprocesorzy i transfery

Wskazanie `06-lista-podprocesorow.md`, SCC/adequacy i dodatkowych środków.
