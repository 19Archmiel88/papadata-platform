# Polityka prywatności PapaData

**Wersja:** 1.0
**Data publikacji:** 2026-09-14
**Obowiązuje od:** 2026-09-14
**Typ dokumentu:** `privacy_notice`

## 1. Administrator danych i kontakt

1. Administratorem danych osobowych przetwarzanych w związku z założeniem konta, korzystaniem z PapaData, bezpieczeństwem, rozliczeniami oraz własną działalnością Usługodawcy jest [[LEGAL_ENTITY_NAME_REQUIRED]], z siedzibą pod adresem [[REGISTERED_ADDRESS_REQUIRED]], NIP [[NIP_REQUIRED]] (dalej: „PapaData", „my", „Administrator").
2. Kontakt w sprawach ochrony danych osobowych: [[PRIVACY_CONTACT_REQUIRED]]. Inspektor Ochrony Danych: [[DPO_CONTACT_REQUIRED]].
3. W odniesieniu do danych osobowych zawartych w Danych Klienta — w tym danych klientów końcowych, zamówień, kampanii i innych danych wprowadzanych do Workspace przez Klienta lub pozyskiwanych za pośrednictwem Integracji skonfigurowanych przez Klienta — PapaData co do zasady działa jako **podmiot przetwarzający**, a Klient jako **administrator** tych danych. Szczegółowe warunki tego przetwarzania określa odrębna umowa powierzenia przetwarzania danych (DPA), zawierana z Klientami, dla których ma zastosowanie. Niniejsza Polityka prywatności nie zastępuje takiej umowy ani nie ogranicza wynikających z niej obowiązków.

## 2. Kategorie przetwarzanych danych

- **Dane konta i kontaktowe:** imię i nazwisko, adres e-mail, opcjonalnie stanowisko/rola w organizacji.
- **Dane organizacji:** nazwa firmy, NIP, adres, kraj, status i inne dane pobrane w razie skorzystania z wyszukiwania GUS/BIR (wraz z zachowaną odpowiedzią źródłową rejestru).
- **Dane uwierzytelniania i bezpieczeństwa:** zahaszowane hasło, stan i metoda uwierzytelniania wieloskładnikowego (MFA), identyfikatory sesji, adresy IP powiązane ze zdarzeniami logowania i bezpieczeństwa, dzienniki zdarzeń bezpieczeństwa (audyt), stan weryfikacji adresu e-mail.
- **Dane rozliczeniowe:** identyfikatory Planu oraz — jeżeli funkcja płatnej subskrypcji jest aktywna dla danego Tenanta — dane niezbędne do rozliczeń przetwarzane za pośrednictwem zewnętrznego dostawcy płatności. PapaData nie przechowuje pełnego numeru karty płatniczej ani kodu CVV.
- **Dane zgód:** treść i wersja zaakceptowanych dokumentów (Regulamin, Polityka prywatności), decyzje dotyczące plików cookies, znacznik czasu i identyfikator konta powiązany z akceptacją.
- **Dane techniczne i diagnostyczne:** zdarzenia korzystania z aplikacji niezbędne do jej działania i diagnostyki.
- **Treść komunikacji z Papa Asystentem:** treść zapytań kierowanych do Papa Asystenta oraz udzielonych odpowiedzi, w tym powiązany z nimi kontekst analityczny wybrany przez Użytkownika (patrz sekcja 10).
- **Dane pozyskiwane za pośrednictwem Integracji:** w zakresie autoryzowanym przez Klienta przy konfiguracji danej Integracji (np. zamówienia, produkty, dane kampanii reklamowych, ruch na stronie) — administratorem tych danych w zakresie danych osobowych osób trzecich (np. klientów końcowych Klienta) jest Klient, zgodnie z sekcją 1 ust. 3.

## 3. Cele przetwarzania, podstawy prawne i okresy retencji

| Cel przetwarzania | Podstawa prawna (RODO) | Przykładowe kategorie danych | Retencja |
|---|---|---|---|
| Założenie konta, uwierzytelnienie i świadczenie usługi | art. 6 ust. 1 lit. b (wykonanie umowy / czynności przed jej zawarciem) | konto, organizacja, uwierzytelnianie | przez czas trwania konta, następnie zgodnie z sekcją 12 |
| Bezpieczeństwo i wykrywanie nadużyć | art. 6 ust. 1 lit. f (uzasadniony interes Administratora — ochrona usługi i użytkowników) | logi bezpieczeństwa, adresy IP, zdarzenia sesji | okres wskazany w sekcji 12 wg klasy logu |
| Rozliczenia i obowiązki podatkowe | art. 6 ust. 1 lit. c (obowiązek prawny) oraz lit. b (umowa) | dane rozliczeniowe, faktury | okres wymagany przepisami prawa podatkowego |
| Obsługa zgłoszeń wsparcia i reklamacji | art. 6 ust. 1 lit. b i f | dane kontaktowe, treść zgłoszenia | okres wskazany w sekcji 12 |
| Realizacja zgód dotyczących plików cookies | art. 6 ust. 1 lit. a (zgoda) — dla kategorii opcjonalnych; art. 6 ust. 1 lit. f — dla kategorii koniecznych | identyfikator zgody, wybrane kategorie | zgodnie z Politykę cookies / do czasu wycofania zgody |
| Działanie Papa Asystenta w ramach konta Klienta | art. 6 ust. 1 lit. b (wykonanie umowy — funkcja zamówiona przez Klienta) | treść zapytań, kontekst analityczny wybrany przez Użytkownika | okres wskazany w sekcji 12; brak obecnie zdefiniowanego automatycznego okresu usuwania historii rozmów — patrz sekcja 12 |
| Rozwój i utrzymanie produktu | art. 6 ust. 1 lit. f (uzasadniony interes — utrzymanie i poprawa jakości usługi) | dane diagnostyczne | okres wskazany w sekcji 12 |
| Komunikacja marketingowa (jeżeli prowadzona) | art. 6 ust. 1 lit. a (zgoda) lub — dla klientów — art. 6 ust. 1 lit. f w granicach dopuszczalnych prawem | dane kontaktowe, preferencje | do wycofania zgody lub wniesienia sprzeciwu |

Nie stosujemy zgody jako podstawy przetwarzania w przypadkach, w których właściwą podstawą jest wykonanie umowy lub obowiązek prawny.

## 4. Źródła danych

Dane pozyskujemy: bezpośrednio od osoby rejestrującej konto; od Właściciela lub administratora Tenanta zapraszającego Użytkownika; z publicznego rejestru GUS/BIR — na żądanie Użytkownika, w celu uzupełnienia danych organizacji; za pośrednictwem Integracji skonfigurowanych i autoryzowanych przez Klienta; z systemów bezpieczeństwa i uwierzytelniania (np. zdarzenia logowania). W zakresie danych pozyskanych pośrednio, obowiązek informacyjny wynikający z art. 14 RODO realizowany jest z uwzględnieniem roli Administratora lub podmiotu przetwarzającego opisanej w sekcji 1 ust. 3 oraz mających zastosowanie wyjątków przewidzianych w art. 14 ust. 5 RODO.

## 5. Odbiorcy danych

Odbiorcami danych mogą być podmioty świadczące na rzecz PapaData usługi niezbędne do działania platformy, w szczególności:

- dostawca infrastruktury/hostingu chmurowego, na którym uruchomiona jest platforma;
- dostawca usług poczty elektronicznej wykorzystywanej do wysyłki wiadomości transakcyjnych (np. weryfikacja adresu e-mail, odzyskiwanie dostępu);
- dostawca modelu sztucznej inteligencji wykorzystywanego przez Papa Asystenta — na dzień publikacji jest to OpenAI, wyłącznie w zakresie treści zapytania kierowanego do Papa Asystenta oraz wybranego przez Użytkownika kontekstu analitycznego (patrz sekcja 10); ten podmiot nie jest wykorzystywany, jeżeli Papa Asystent działa w trybie lokalnym/deterministycznym bez wywołania zewnętrznego dostawcy;
- dostawca usług płatniczych — wyłącznie dla Tenantów, dla których aktywna jest funkcja płatnej subskrypcji;
- dostawcy narzędzi bezpieczeństwa i monitorowania działania platformy;
- doradcy zawodowi Usługodawcy (np. prawni, księgowi), w niezbędnym zakresie i wyłącznie w celu obsługi danej sprawy.

Aktualny, szczegółowy rejestr podmiotów przetwarzających (nazwa, zakres usługi, lokalizacja przetwarzania, mechanizm transferu) jest prowadzony i aktualizowany odrębnie od niniejszej Polityki i udostępniany na żądanie pod adresem [[PRIVACY_CONTACT_REQUIRED]]. Środowiska testowe/deweloperskie PapaData mogą wykorzystywać wyłącznie lokalną, nieprodukcyjną infrastrukturę pomocniczą (np. lokalny serwer testowy poczty elektronicznej), która nigdy nie przetwarza rzeczywistych danych Klientów i nie jest odbiorcą danych w rozumieniu niniejszej sekcji.

## 6. Przekazywanie danych poza Europejski Obszar Gospodarczy

Jeżeli którykolwiek z odbiorców wskazanych w sekcji 5 przetwarza dane poza Europejskim Obszarem Gospodarczym, przekazanie odbywa się na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony, standardowych klauzul umownych zatwierdzonych przez Komisję Europejską lub innego mechanizmu przewidzianego w rozdziale V RODO, wraz z wdrożeniem — tam, gdzie to konieczne — dodatkowych środków zabezpieczających. [[INTERNATIONAL_TRANSFER_MECHANISM_REQUIRED]]

## 7. Papa Asystent, sztuczna inteligencja i zautomatyzowane decyzje

1. Papa Asystent wykorzystuje modele sztucznej inteligencji do analizy danych dostępnych w Workspace Klienta, udzielania odpowiedzi w formie konwersacyjnej oraz przygotowywania propozycji działań (Akcji AI) opisanych w Regulaminie.
2. Interfejs PapaData w widoczny sposób oznacza treści pochodzące od Papa Asystenta jako wygenerowane przez AI, zgodnie z art. 50 Rozporządzenia (UE) 2024/1689 (Akt w sprawie sztucznej inteligencji).
3. Do dostawcy modelu AI przekazywana jest wyłącznie treść: (a) bieżącego zapytania Użytkownika po zastosowaniu automatycznego mechanizmu wykrywania i maskowania danych potencjalnie wrażliwych (m.in. adresów e-mail, numerów telefonów, numerów PESEL, NIP, numerów rachunków bankowych oraz ciągów przypominających hasła lub klucze API — zastępowanych znacznikiem zastępczym przed wysłaniem), (b) ograniczonej historii bieżącej rozmowy w ramach tego samego wątku, (c) zagregowanego kontekstu analitycznego (np. wartości metryk, etykiety wykresów, wiersze tabel) pochodzącego z ekranu lub analizy, którą Użytkownik świadomie dołączył do zapytania. Papa Asystent nie wysyła do dostawcy modelu AI danych spoza zakresu uprawnień Użytkownika zadającego pytanie.
4. Zastosowany mechanizm maskowania danych działa na zasadzie rozpoznawania wzorców tekstowych i nie stanowi gwarancji wykrycia każdej możliwej postaci danych osobowych zawartej w dowolnym tekście — w szczególności może nie wykryć danych osobowych ukrytych w zagregowanym kontekście analitycznym (np. w nazwie klienta widocznej w tabeli, którą Użytkownik dołączył do zapytania). Użytkownicy nie powinni celowo wklejać do Papa Asystenta danych, których ujawnienie dostawcy modelu AI nie jest uzasadnione celem zapytania.
5. Zapytania kierowane do rzeczywistego (nielokalnego) dostawcy modelu AI są przesyłane z ustawieniem wyłączającym ich zapisywanie po stronie tego dostawcy w celach innych niż przetworzenie bieżącego zapytania (parametr `store=false` interfejsu dostawcy). Nie stanowi to jednak deklaracji dotyczącej szerszej polityki retencji, bezpieczeństwa lub wykorzystania danych do trenowania modeli przez tego dostawcę — zasady te wynikają z odrębnej umowy handlowej z dostawcą modelu AI i [[AI_PROVIDER_DPA_STATUS_REQUIRED]].
6. PapaData nie podejmuje wobec osoby fizycznej decyzji wywołującej skutki prawne lub w podobny sposób istotnie na nią wpływającej wyłącznie w sposób zautomatyzowany, bez udziału człowieka, w rozumieniu art. 22 RODO. Wszelkie Akcje AI proponowane przez Papa Asystenta wymagają jawnej akceptacji uprawnionego Użytkownika przed wykonaniem — Papa Asystent nie wykonuje ich samodzielnie.

## 8. Prawa osób, których dane dotyczą

Osobie, której dane dotyczą, przysługuje prawo do: dostępu do danych i uzyskania ich kopii, sprostowania danych, usunięcia danych, ograniczenia przetwarzania, przenoszenia danych (w zakresie, w jakim ma zastosowanie), wniesienia sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie Administratora oraz cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem. Osobie przysługuje również prawo wniesienia skargi do organu nadzorczego — w Polsce do Prezesa Urzędu Ochrony Danych Osobowych (UODO).

Żądanie realizacji powyższych praw można zgłosić poprzez funkcję dostępną w ustawieniach konta PapaData (Ustawienia → Prywatność) lub przesyłając wiadomość na adres [[PRIVACY_CONTACT_REQUIRED]]. Tożsamość osoby składającej żądanie jest weryfikowana w sposób proporcjonalny do charakteru żądania. Jeżeli żądanie dotyczy danych, wobec których PapaData działa jako podmiot przetwarzający na rzecz Klienta (sekcja 1 ust. 3), żądanie jest przekazywane właściwemu Klientowi-administratorowi i obsługiwane zgodnie z zawartą z nim umową powierzenia.

## 9. Dobrowolność podania danych

Podanie danych oznaczonych w formularzach jako wymagane jest niezbędne do założenia konta, zapewnienia bezpieczeństwa, realizacji rozliczeń (o ile dotyczy) lub skonfigurowania Integracji — bez ich podania odpowiednia funkcja nie będzie dostępna. Podanie danych oznaczonych jako opcjonalne jest dobrowolne i nie wpływa na możliwość korzystania z podstawowej funkcjonalności PapaData.

## 10. Bezpieczeństwo danych

Stosujemy środki techniczne i organizacyjne odpowiednie do charakteru i ryzyka przetwarzania, w tym: logiczną izolację danych pomiędzy Tenantami egzekwowaną na poziomie bazy danych (mechanizm Row-Level Security), szyfrowanie połączeń sieciowych, wsparcie dla uwierzytelniania wieloskładnikowego, zasadę minimalnych niezbędnych uprawnień przy udzielaniu dostępu, rejestrowanie zdarzeń bezpieczeństwa (audyt), zarządzanie sekretami aplikacyjnymi poza kodem źródłowym oraz regularne wykonywanie kopii zapasowych. Szczegółowy opis środków bezpieczeństwa, które mogą zostać ujawnione bez naruszenia bezpieczeństwa usługi, jest udostępniany Klientom B2B na żądanie w ramach procesu oceny dostawcy lub zawierania umowy.

## 11. Automatyczne decyzje i profilowanie

PapaData wykorzystuje analitykę i mechanizmy rekomendacji (w tym Papa Asystenta) do przedstawiania Użytkownikowi wniosków, rekomendacji i propozycji Akcji AI wspierających podejmowanie decyzji biznesowych przez Klienta. Mechanizmy te nie podejmują samodzielnie decyzji wywołujących skutki prawne wobec osoby fizycznej ani nie wpływają na nią w podobnie istotny sposób bez udziału człowieka — patrz sekcja 7 ust. 6.

## 12. Retencja i usuwanie danych

| Kategoria danych | Zasada retencji | Źródło zasady |
|---|---|---|
| Konto i członkostwo w Tenancie | przez czas istnienia konta; po rozwiązaniu umowy zgodnie z oknem eksportu z §13 Regulaminu | Regulamin §13 |
| Dane organizacji (w tym odpowiedź GUS/BIR) | przez czas istnienia konta, następnie jak wyżej | Regulamin §13 |
| Dane rozliczeniowe i faktury | przez okres wymagany przepisami prawa podatkowego | powszechnie obowiązujące przepisy prawa podatkowego |
| Logi bezpieczeństwa i audytowe | [[SECURITY_LOG_RETENTION_REQUIRED]] | wewnętrzna polityka bezpieczeństwa (do ustalenia) |
| Historia rozmów z Papa Asystentem | brak obecnie wdrożonego automatycznego okresu usuwania; usuwana w ramach usunięcia konta/Tenanta | **luka do uzupełnienia — patrz raport gotowości prawnej** |
| Załączniki kontekstowe dołączone do zapytań Papa Asystenta oraz tymczasowe notatki asystenta | usuwane automatycznie po upływie terminu ważności ustalonego w chwili ich utworzenia, jeżeli mechanizm porządkowania jest aktywny w danym środowisku | mechanizm techniczny retencji danych tymczasowych asystenta |
| Zgłoszenia wsparcia | [[SUPPORT_TICKET_RETENTION_REQUIRED]] | do ustalenia |

Po rozwiązaniu umowy Klientowi udostępniane jest okno eksportu danych, którego długość określa §13 Regulaminu. Po jego upływie dane są usuwane lub nieodwracalnie anonimizowane, z zastrzeżeniem: kopii zapasowych rotowanych zgodnie z cyklem technicznym, obowiązków wynikających z przepisów prawa podatkowego, uzasadnionej potrzeby zachowania danych na potrzeby ustalenia, dochodzenia lub obrony przed roszczeniami oraz udokumentowanego wstrzymania usunięcia (legal hold), jeżeli zostało zastosowane. Usunięcie jest propagowane do podmiotów przetwarzających zgodnie z ich własnym cyklem usuwania danych.

## 13. Pliki cookies

Strona i aplikacja PapaData wykorzystują pliki cookies niezbędne do jej działania (zawsze aktywne) oraz — wyłącznie za uprzednią, dobrowolną zgodą — pliki cookies opcjonalne w kategoriach: preferencje, analityczne i marketingowe. Kategorie opcjonalne są domyślnie wyłączone do czasu wyrażenia zgody, a zgoda może zostać w każdej chwili zmieniona lub wycofana w ustawieniach dostępnych z poziomu aplikacji. Na dzień publikacji niniejszej Polityki żadne opcjonalne pliki cookies analityczne ani marketingowe nie są aktywnie wykorzystywane przez PapaData niezależnie od udzielonej zgody — mechanizm zgody jest przygotowany do ich przyszłego, kontrolowanego uruchomienia. Podstawą prawną stosowania plików cookies niezbędnych oraz zasad uzyskiwania zgody na pozostałe kategorie jest art. 6 ust. 1 lit. f RODO w związku z art. 361 ustawy z dnia 12 lipca 2024 r. Prawo komunikacji elektronicznej (następcy art. 173 poprzednio obowiązującej ustawy Prawo telekomunikacyjne) oraz — dla kategorii opcjonalnych — art. 6 ust. 1 lit. a RODO (zgoda).

## 14. Zmiany Polityki prywatności

Niniejsza Polityka prywatności posiada numer wersji oraz datę obowiązywania wskazane na początku dokumentu. Istotne zmiany zakresu przetwarzania, odbiorców danych lub praw osób są komunikowane Użytkownikom zgodnie z zasadami opisanymi w §17 Regulaminu. Poprzednie wersje dokumentu są przechowywane przez Administratora i mogą zostać udostępnione na żądanie skierowane na adres [[PRIVACY_CONTACT_REQUIRED]].
